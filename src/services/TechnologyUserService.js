/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the TechnologyUser Service
 *
 * @author      TCSCODER
 * @version     1.0
 */

const joi = require('joi');
const errors = require('common-errors');
const models = require('../models');
const helper = require('../common/helper');
const UserService = require('./UserService');
const FileService = require('./FileService');
const NotificationService = require('./NotificationService');
const UtilService = require('./UtilityService');
const _ = require('lodash');
const path = require('path');
const config = require('config');

const entitySchema = joi.object().keys({
  firstName: joi.string(),
  lastName: joi.string(),
  phone: joi.string(),
  userPhotoPath: joi.string(),
  country: joi.objectId(),
  state: joi.objectId(),
  city: joi.string(),
  createdOn: joi.date(),
  updatedOn: joi.date(),
  notifyMeByPostCreated: joi.bool(),
  notifyMeByPostUpdated: joi.bool(),
  notifyMeUpcomingEvent: joi.bool(),
}).required();

/**
 * create TechnologyUser,
 * if user is of type technologyUser, then can only have *one* record in technologyUser
 * @param userId the current user id
 * @param entity the TechnologyUser entity
 */
function* create(userId, entity) {
  const count = yield getCountByFilter({ userId }); // check TechnologyUser already exists
  if (count > 0) {
    throw new errors.ArgumentError('you can only create a TechnologyUser!');
  }

  const user = yield UserService.get(userId);
  if (user.type === models.Const.UserType.technologyProvider) { // check user type
    throw new errors.ArgumentError(`only userType = ${models.Const.UserType.technologyUser} can create TechnologyUser!`);
  }

  const tUser = yield models.TechnologyUser.create(_.extend(entity, { userId }));
  user.type = models.Const.UserType.technologyUser;
  yield models.User.update({ _id: userId }, user); // update user Type
  return yield get(tUser.id);
}

create.schema = {
  userId: joi.objectId(),
  entity: entitySchema,
};

/**
 * update TechnologyUser by id
 * @param userId the current user id
 * @param id the TechnologyUser id
 * @param entity the TechnologyUser entity
 */
function* update(userId, id, entity) {
  let tUser = yield getDBEntity(id);
  helper.ensureUserIdEqual(userId, tUser.userId.toString(), 'you cannot update other user entity');

  tUser = _.extend(tUser, _.omit(entity, 'userId'));
  yield tUser.save();
  return yield get(id);
}

update.schema = {
  userId: joi.objectId(),
  id: joi.objectId(),
  entity: entitySchema,
};

/**
 * get db TechnologyUser , if not exist , it will raise a not found exception
 * @param id
 * @return {*}
 */
function* getDBEntity(id) {
  const entity = yield models.TechnologyUser.findOne({ _id: id }).populate('country').populate('state');
  if (!entity) {
    throw new errors.NotFoundError(`cannot found TechnologyUser where id = ${id}`);
  }
  return entity;
}

/**
 * get TechnologyUser
 * @param id the TechnologyUser id
 */
function* get(id) {
  let entity = yield getDBEntity(id);
  entity = entity.toObject();
  entity.user = yield models.User.findOne({ _id: entity.userId });
  if (entity.user) {
    entity.user = entity.user.toObject();
  }
  return entity;
}

/**
 * remove TechnologyUser by id
 * @param userId the current user id
 * @param id the TechnologyUser id
 */
function* remove(userId, id) {
  const user = yield models.User.findOne({ _id: userId });
  const entity = yield getDBEntity(id);
  if (!user || user.type !== models.Const.UserType.admin) { // admin can delete directly
    helper.ensureUserIdEqual(userId, entity.userId.toString(), 'you cannot delete entity that not belongs to you!');
  }
  yield models.PostSave.remove({ user: id });
  yield models.PostView.remove({ user: id });
  yield models.Subscribe.remove({ user: id });
  yield models.UserRequest.remove({ user: id });
  yield models.FavouriteCategory.remove({ user: id });
  yield models.FavouriteTechnologyProvider.remove({ user: id });
  yield models.TechnologyUser.remove({ _id: id });
  yield models.User.remove({ _id: entity.userId });
}

/**
 * build the full search query by filter
 * @param filter the user's filter
 * @return {Object}
 */
function buildSearchQuery(filter) {
  let query = helper.buildEqualQuery({}, 'userId', filter.userId);
  query = helper.buildEqualQuery(query, 'country', filter.countryId);
  query = helper.buildEqualQuery(query, 'notifyMeUpcomingEvent', filter.notifyMeUpcomingEvent);
  if (filter.name) {
    query.$or = [
      helper.buildFuzzingMatchQuery({}, 'firstName', filter.name),
      helper.buildFuzzingMatchQuery({}, 'lastName', filter.name),
    ];
  }
  return query;
}

/**
 * search TechnologyUsers by user's filter
 * @param filter the user's filter
 * @return {*}
 */
function* search(filter) {
  let docs = yield models.TechnologyUser.find(buildSearchQuery(filter)).populate('country')
    .populate('state');
  docs = helper.sanitizeArray(docs);
  // because of mongo cannot sort by string , so use backend to sort entities
  if (filter.sortBy === 'firstName' || filter.sortBy === 'lastName') {
    docs = docs.sort((a, b) => {
      if (!a[filter.sortBy] || !b[filter.sortBy]) return -1;
      return a[filter.sortBy].toLowerCase() >= b[filter.sortBy].toLowerCase()
        ? 1 : -1;
    });
  }
  docs = docs.slice(filter.offset,
    filter.limit === 0 ? docs.length : (filter.offset + filter.limit));
  const results = [];
  for (let i = 0; i < docs.length; i += 1) {
    const user = yield models.User.findOne({ _id: docs[i].userId });
    if (user && (!filter.verified || (filter.verified && user.verified))) {
      docs[i].user = user.toObject();
      results.push(docs[i]);
    }
  }
  return results;
}

search.schema = {
  filter: joi.object().keys({
    countryId: joi.objectId(),
    userId: joi.objectId(),
    sortBy: joi.string(),
    name: joi.string(),
    notifyMeUpcomingEvent: joi.bool(),
    verified: joi.bool(),
    offset: joi.offset(),
    limit: joi.limit(),
  }).options({ stripUnknown: true }).required(),
};


/**
 * return the total count that matched.
 * @param filter the user's filter
 * @return {*}
 */
function* getCountByFilter(filter) {
  return yield models.TechnologyUser.find(buildSearchQuery(filter))
    .skip(filter.offset).limit(filter.limit).count();
}

getCountByFilter.schema = search.schema;

/**
 * return TechnologyUser statistics data
 * @param id the TechnologyUser id
 * @return {{id: *}}
 */
function* statistics(id) {
  yield require('./PostSaveService').removeAllExpiredPostSave(); // eslint-disable-line
  return {
    numberOfReadPosts: yield models.PostView.count({ user: id }),
    numberOfSavedPosts: yield models.PostSave.count({ user: id }),
    numberOfFavouriteProviders: yield models.FavouriteTechnologyProvider.count({ user: id }),
    numberOfFavouriteCategories: yield models.FavouriteCategory.count({ user: id }),
  };
}

/**
 * upload photo
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

  helper.ensureDirExist(path.join(config.IMAGES_PATH, 'technologyUserImages'));
  helper.ensureDirExist(path.join(config.IMAGES_PATH, 'technologyUserImages', id));
  const subDir = path.join('technologyUserImages', id);
  const filePath = yield FileService.upload(config.IMAGES_PATH, subDir, file);
  entity.userPhotoPath = path.join(subDir, filePath);

  yield entity.save();
  return yield get(id);
}

/**
 * send notification or email to user
 * @param userId the admin user id
 * @param entity the entity
 */
function* sendMessage(userId, entity) {
  yield helper.checkAdmin(models.User, userId);
  if (entity.type === 'email') {
    yield UtilService.sendEmail(
      { to: entity.recipients, subject: entity.subject, html: entity.content });
  } else if (entity.type === 'notification') {
    yield NotificationService
      .generateNotificationsByAdmin(userId, entity.recipients, entity.content);
  }
  return {};
}

sendMessage.schema = {
  userId: joi.objectId(),
  entity: joi.object().keys({
    recipients: joi.string().required(),
    type: joi.string().valid(['email', 'notification']).required(),
    subject: joi.string(),
    content: joi.string().required(),
  }),
};

module.exports = {
  create,
  update,
  get,
  remove,
  search,
  getCountByFilter,
  statistics,
  upload,
  sendMessage,
};
