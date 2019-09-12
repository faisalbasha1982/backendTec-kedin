/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the TechnologyProvider Service
 *
 * @author      TCSCODER
 * @version     1.0
 */

const joi = require('joi');
const errors = require('common-errors');
const models = require('../models');
const helper = require('../common/helper');
const _ = require('lodash');
const UserService = require('../services/UserService');
const FileService = require('../services/FileService');
const NotificationService = require('../services/NotificationService');
const mongoose = require('mongoose');
const path = require('path');
const config = require('config');

const entitySchema = joi.object().keys({
  _id: joi.objectId(),
  name: joi.string(),
  address: {
    _id: joi.objectId(),
    street: joi.string(),
    locality: joi.string(),
    postalCode: joi.string(),
    town: joi.string(),
    stateObj: joi.objectId(),
    countryObj: joi.objectId(),
  },
  contactInformation: {
    _id: joi.objectId(),
    phone: joi.string(),
    email: joi.string().email(),
    website: joi.string(),
  },
  description: joi.any(),
  certifications: joi.any(),
  additionalOffice: joi.any(),
  servicesOffered: joi.any(),
  productsOffered: joi.any(),
  customerServiceCommittment: joi.any(),
  yearInBusiness: joi.any(),
  logoPath: joi.string(),
  freezed: joi.bool(),
  createdOn: joi.date(),
  updatedOn: joi.date(),
}).required();

/**
 * create TechnologyProvider
 * if user is of type technologyProvider, then can only have one record in technologyProvider
 * @param userId the current user id
 * @param entity the TechnologyProvider entity
 */
function* create(userId, entity) {
  const count = yield getCountByFilter({ userId }); // check TechnologyProvider already exists
  if (count > 0) {
    throw new errors.ArgumentError('you can only create a TechnologyProvider!');
  }

  const user = yield UserService.get(userId);
  if (user.type === models.Const.UserType.technologyUser) { // check user type
    throw new errors.ArgumentError(`only userType = ${models.Const.UserType.technologyProvider} can create TechnologyProvider!`);
  }


  const tProvider = yield models.TechnologyProvider.create(_.extend(entity, { userId }));
  user.type = models.Const.UserType.technologyProvider;
  yield models.User.update({ _id: userId }, user); // update user type
  return yield get(tProvider.id);
}

create.schema = {
  userId: joi.objectId(),
  entity: entitySchema,
};


/**
 * update TechnologyProvider by id
 * @param userId the current user id
 * @param id the TechnologyProvider id
 * @param entity the TechnologyProvider entity
 */
function* update(userId, id, entity) {
  let tProvider = yield getDBEntity(id);
  const user = yield models.User.findOne({ _id: userId });
  let newEntity = _.clone(entity);
  if (user.type !== models.Const.UserType.admin) {
    helper.ensureUserIdEqual(userId, tProvider.userId.toString(), 'you cannot update other user entity');
    newEntity = _.omit(newEntity, 'freezed');
  } else if (newEntity.freezed) { // admin freeze provider
    newEntity.freezedAt = new Date();
    yield NotificationService.generateNotificationsByFreezeProvider(id);
  } else {
    newEntity.freezedAt = null;
  }
  // ignore userId
  tProvider = _.extend(tProvider, _.omit(newEntity, 'userId'));
  yield tProvider.save();
  return yield get(id);
}

update.schema = {
  userId: joi.objectId(),
  id: joi.objectId(),
  entity: entitySchema,
};

/**
 * get db TechnologyProvider , if not exist , it will raise a not found exception
 * @param id
 * @return {*}
 */
function* getDBEntity(id) {
  const entity = yield models.TechnologyProvider.findOne({ _id: id });
  if (!entity) {
    throw new errors.NotFoundError(`cannot found TechnologyProvider where id = ${id}`);
  }
  return entity;
}

function* extendCountryAndState(entity) {
  const addressExtend = { stateObj: {}, countryObj: {} };
  if (entity.address.countryObj) {
    const country = yield models.Country.findOne({ _id: entity.address.countryObj });
    if (country) addressExtend.countryObj = country.toObject();
  }
  if (entity.address.stateObj) {
    const state = yield models.State.findOne({ _id: entity.address.stateObj });
    if (state) addressExtend.stateObj = state.toObject();
  }
  _.extend(entity.address, addressExtend);
  return entity;
}

/**
 * get TechnologyProvider
 * @param id the TechnologyProvider id
 */
function* get(id) {
  const entity = yield getDBEntity(id);
  return yield extendCountryAndState(entity.toObject());
}

/**
 * remove TechnologyProvider by id
 * @param userId the current user id
 * @param id the TechnologyProvider id
 */
function* remove(userId, id) {
  const entity = yield getDBEntity(id);
  const user = yield models.User.findOne({ _id: userId });
  if (user.type !== models.Const.UserType.admin) {
    helper.ensureUserIdEqual(userId, entity.userId.toString(), 'you cannot delete entity that not belongs to you!');
  }
  const posts = yield models.Post.find({ createdBy: id });
  const postIds = _.map(posts, p => p._id.toString());
  // remove all post save
  yield models.PostSave.remove({ post: { $in: postIds } });
  // remove all post view
  yield models.PostView.remove({ post: { $in: postIds } });
  // remove all subscribe
  yield models.Subscribe.remove({ post: { $in: postIds } });
  // remove all request
  yield models.UserRequest.remove({ post: { $in: postIds } });
  // remove all post
  yield models.Post.remove({ _id: { $in: postIds } });
  // remove all fav provider
  yield models.FavouriteTechnologyProvider.remove({ provider: id });
  // remove user
  yield models.User.remove({ _id: entity.userId });
  // remove self
  yield models.TechnologyProvider.remove({ _id: id });
}

/**
 * build the full search query by filter
 * @param filter the user's filter
 * @return {Object}
 */
function buildSearchQuery(filter) {
  let query = helper.buildEqualQuery({}, 'userId', filter.userId);
  query = helper.buildFuzzingMatchQuery(query, 'name', filter.name);
  if (filter.content) {
    const regx = new RegExp(filter.content, 'i');
    query.$or = [{ name: regx }, { 'contactInformation.email': regx }];
  }
  return query;
}

/**
 * search TechnologyProviders by user's filter
 * @param filter the user's filter
 * @return {*}
 */
function* search(filter) {
  let docs = yield models.TechnologyProvider.find(buildSearchQuery(filter)).populate('country');
  docs = helper.sanitizeArray(docs);
  // because of mongo cannot sort by string , so use backend to sort entities
  if (filter.sortBy === 'name') {
    docs = docs.sort((a, b) => (a.name.toLowerCase() >= b.name.toLowerCase()
      ? 1 : -1));
  }
  if (filter.sortBy === 'email') {
    docs = docs.sort((a, b) => {
      if (!a.contactInformation || !b.contactInformation) return 1;
      return a.contactInformation.email >= b.contactInformation.email ? 1 : -1;
    });
  }
  docs = docs.slice(filter.offset,
    filter.limit === 0 ? docs.length : (filter.offset + filter.limit));
  const results = [];
  for (let i = 0; i < docs.length; i += 1) {
    const user = yield models.User.findOne({ _id: docs[i].userId });
    if (user) {
      docs[i].user = user.toObject();
      results.push(docs[i]);
    }
  }
  return results;
}

search.schema = {
  filter: joi.object().keys({
    userId: joi.objectId(),
    name: joi.string(),
    content: joi.string(), // search content
    offset: joi.offset(),
    sortBy: joi.string(),
    limit: joi.limit(),
  }).options({ stripUnknown: true }).required(),
};

/**
 * return the total count that matched.
 * @param filter the user's filter
 * @return {*}
 */
function* getCountByFilter(filter) {
  return yield models.TechnologyProvider.find(buildSearchQuery(filter))
    .skip(filter.offset).limit(filter.limit).count();
}

getCountByFilter.schema = search.schema;

/**
 * return TechnologyProvider statistics data
 * @param id the TechnologyProvider id
 * @return {{id: *}}
 */
function* statistics(id) {
  yield require('./PostSaveService').removeAllExpiredPostSave(); // eslint-disable-line
  const provider = yield getDBEntity(id);

  // create aggregate to get the totalReadingTime
  const totalReadingTimeAggregate = yield models.Post.aggregate(
    [{ $match: { createdBy: mongoose.Types.ObjectId(id) } },
      { $group: { _id: null, totalReadingTime: { $sum: '$readingTime' } } },
    ]);

  // get all TechnologyProvider posts
  const posts = yield models.Post
    .find({ createdBy: id, status: { $ne: models.Const.PostStatus.deleted } });

  // get all active post saves that in posts above
  const postSaves = yield models.PostSave.find({
    post: { $in: _.map(posts, p => p._id.toString()) },
    status: models.Const.PostSaveStatus.active,
  });

  // get all post fav
  const postSubscribes = yield models.Subscribe.find({
    post: { $in: _.map(posts, p => p._id.toString()) },
  });
  const numberOfState = yield models.TechnologyUser.count({ state: provider.address.stateObj });
  return {
    numberOfSubscribers: _.uniq(_.map(postSubscribes, ps => ps.user.toString())).length,
    numberOfFavorites: (yield models.FavouriteTechnologyProvider.count({ provider: id })),
    numberOfPosts: posts.length,
    numberOfState,
    numberOfWebClick: provider.numberOfWebClick,
    totalReadingTime: totalReadingTimeAggregate.length <= 0 ?
      0 : totalReadingTimeAggregate[0].totalReadingTime,
    usersOnPosts: _.uniq(_.map(postSaves, ps => ps.user.toString())).length,
  };
}

/**
 * upload provider image
 * @param userId the current user id
 * @param id the tUser id
 * @param files the files
 */
function* upload(userId, id, files) {
  helper.ensureNotNull('file', files);
  helper.ensureNotNull('file', files.file);
  const file = files.file;

  const entity = yield getDBEntity(id);
  helper.ensureUserIdEqual(userId, entity.userId.toString(), 'you cannot upload image to other!');


  helper.ensureDirExist(path.join(config.IMAGES_PATH, 'providerImages'));
  helper.ensureDirExist(path.join(config.IMAGES_PATH, 'providerImages', id));
  const subDir = path.join('providerImages', id);
  const filePath = yield FileService.upload(config.IMAGES_PATH, subDir, file);
  entity.logoPath = path.join(subDir, filePath);

  yield entity.save();
  return yield get(id);
}


statistics.schema = {
  id: joi.objectId(),
};

/**
 * search providers by keywords
 * @param keywords the search keywords with RegExp
 */
function* searchByKeywords(keywords) {
  const providers = yield models.TechnologyProvider
    .find({ $or: [
      { name: { $in: keywords } },
      { description: { $in: keywords } },
      { certifications: { $in: keywords } },
      { servicesOffered: { $in: keywords } },
      { productsOffered: { $in: keywords } },
      { customerServiceCommittment: { $in: keywords } },
      { 'address.street': { $in: keywords } },
      { 'address.state': { $in: keywords } },
      { 'address.postalCode': { $in: keywords } },
      { 'address.locality': { $in: keywords } }] });
  return providers;
}

function* onWebsiteClick(id) {
  const entity = yield getDBEntity(id);
  entity.numberOfWebClick += 1;
  yield entity.save();
}
module.exports = {
  create,
  update,
  get,
  remove,
  search,
  getCountByFilter,
  statistics,
  upload,
  searchByKeywords,
  getDBEntity,
  onWebsiteClick,
};
