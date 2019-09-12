/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the PostSave Service
 *
 * @author      TCSCODER
 * @version     1.0
 */

const joi = require('joi');
const errors = require('common-errors');
const httpStatus = require('http-status');
const models = require('../models');
const helper = require('../common/helper');
const PostService = require('./PostService');
const TechnologyUserService = require('./TechnologyUserService');
const TechnologyProviderService = require('./TechnologyProviderService');
const _ = require('lodash');

const joiPostSaveStatus = joi.string().valid(_.values(models.Const.PostSaveStatus));
const entitySchema = joi.object().keys({
  _id: joi.objectId(),
  post: joi.objectId(),
  user: joi.objectId(),
  keywords: joi.array().items(joi.string()).default([]),
  status: joiPostSaveStatus,
  expirationOption: joi.string().valid(_.values(models.Const.PostExpirationOption)),
  email: joi.string().email().allow(['', null]),
  createdOn: joi.date(),
  updatedOn: joi.date(),
}).required();

/**
 * create PostSave
 * @param userId the current user id
 * @param entity the PostSave entity
 */
function* create(userId, entity) {
  helper.ensureNotNull('post', entity.post);
  helper.ensureNotNull('user', entity.user);
  yield PostService.getDBEntity(entity.post); // check the post exist

  const tUser = yield TechnologyUserService.get(entity.user);
  helper.ensureUserIdEqual(userId, tUser.userId.toString(), 'TechnologyUser must be yourself!');

  yield helper.ensureEntityNotExist(models.PostSave,
    { post: entity.post, user: entity.user });

  if (entity.email && entity.email.length > 3) { // shared by
    const user = yield models.User.findOne({ email: { $regex: new RegExp(`^${entity.email.toLowerCase()}`, 'i') } });
    if (!user) {
      throw new errors.HttpStatusError(httpStatus.NOT_FOUND, `cannot found user where email = ${entity.email}`);
    }
    const sharedTechUser = yield models.TechnologyUser.findOne({ userId: user._id.toString() });
    if (!sharedTechUser) {
      throw new errors.HttpStatusError(httpStatus.NOT_FOUND,
        `cannot found technology user where email = ${entity.email}`);
    }
    if (sharedTechUser._id.toString() === entity.user) {
      throw new errors.HttpStatusError(httpStatus.BAD_REQUEST, 'cannot share content to yourself');
    }

    yield helper.ensureEntityNotExist(models.PostSave,
      { post: entity.post, user: sharedTechUser._id.toString() }, 'He/She already save this content.');

    const shareUser = yield models.User.findOne({ _id: userId });
    const newEntity = _.omit(_.extend({}, entity), 'email');
    newEntity.user = sharedTechUser._id.toString();
    newEntity.sharedBy = `${sharedTechUser.firstName ? sharedTechUser.firstName : 'N/A'}`
      + ` ${sharedTechUser.lastName ? sharedTechUser.lastName : 'N/A'}`
      + ` (${shareUser.email})`;
    const p = yield models.PostSave.create(newEntity);
    p.expiredAt = Date.now() + models.Const.PostExpirationOptionTime[p.expirationOption];
    yield p.save();
  }
  const postSave = yield models.PostSave.create(entity);
  postSave.expiredAt = Date.now() +
    models.Const.PostExpirationOptionTime[postSave.expirationOption];
  yield postSave.save();
  return yield get(postSave.id);
}

create.schema = {
  userId: joi.objectId(),
  entity: entitySchema,
};

/**
 * update PostSave by id
 * @param userId the current user id
 * @param id the PostSave id
 * @param entity the PostSave entity
 */
function* update(userId, id, entity) {
  let postSave = yield getDBEntity(id);
  helper.ensureUserIdEqual(userId, postSave.user.userId.toString(), 'cannot update post that not belongs to you!');

  // if keywords array is empty , skip it. skip user
  postSave = _.extend(postSave, _.omit(entity, entity.keywords.length === 0 ? 'keywords' : '', 'user'));

  yield postSave.save();
  return yield get(id);
}

update.schema = {
  userId: joi.objectId(),
  id: joi.objectId(),
  entity: entitySchema,
};

/**
 * get db PostSave , if not exist , it will raise a not found exception
 * @param id the PostSave id
 * @return {*}
 */
function* getDBEntity(id) {
  const entity = yield models.PostSave.findOne({
    _id: id,
  }).populate({ path: 'post', populate: [{ path: 'createdBy' }, { path: 'category' }] })
    .populate({ path: 'user', populate: [{ path: 'country' }] });
  if (!entity) {
    throw new errors.NotFoundError(`cannot found PostSave where id = ${id}`);
  }
  return entity;
}

/**
 * get PostSave by id
 * @param id the PostSave id
 */
function* get(id) {
  const entity = yield getDBEntity(id);
  return entity.toObject();
}

/**
 * remove PostSave by id
 * @param userId the current user id
 * @param id the PostSave id
 */
function* remove(userId, id) {
  const entity = yield getDBEntity(id);
  helper.ensureUserIdEqual(userId, entity.user.userId.toString(), 'you cannot delete entity that not belongs to you!');
  yield entity.remove();
}

/**
 * build the full search query by filter
 * @param filter the user's filter
 * @return {Object}
 */
function* buildDBFilter(filter) {
  let query = helper.buildEqualQuery({}, 'user', filter.technologyUserId);

  if (filter.statuses.length > 0) {
    query.status = { $in: filter.statuses };
  }

  let postIds = filter.postIds;
  if (filter.keywords) {
    const keywords = [];
    // 1. split keywords
    _.each(filter.keywords.split('+'), (keyword) => {
      const newSearchKeyword = keyword.trim();
      if (newSearchKeyword.length > 0) {
        keywords.push(new RegExp(newSearchKeyword, 'i'));
      }
    });
    // 2. search provider
    const providers = yield TechnologyProviderService.searchByKeywords(keywords);
    const posts = yield models.Post.find({ // filter by title and content
      $or: [
        { createdBy: { $in: _.map(providers, provider => provider._id.toString()) } },
        { title: { $in: keywords } },
        { content: { $in: keywords } },
      ],
    });
    query.$or = [
      { keywords: { $in: keywords } }, // filter by keywords
      { sharedBy: { $in: keywords } }, // filter by shared by
    ];
    if (posts.length > 0) {
      postIds = _.extend(postIds, _.map(posts, p => p._id.toString()));
    }
  }
  if (postIds.length > 0) {
    if (query.$or) {
      query.$or.push({ post: { $in: postIds } });
    } else {
      query.post = { $in: postIds };
    }
  }
  query = helper.buildDateRangeQuery(query, 'createdOn', filter.createdOnStart, filter.createdOnEnd);
  return query;
}

/**
 * build sort conditions
 * @param filter the filter
 * @return {{}}
 */
function* buildSort(filter) {
  const sort = {};
  if (filter.sortBy) {
    sort[filter.sortBy] = -1;
  }
  return sort;
}

/**
 * search PostSave by user's filter
 * @param filter the user's filter
 * @return {*}
 */
function* search(filter) {
  yield removeAllExpiredPostSave();
  const query = yield buildDBFilter(filter);
  let docs = yield models.PostSave.find(query).sort(yield buildSort(filter))
    .populate({ path: 'post', populate: [{ path: 'createdBy' }, { path: 'category' }] })
    .populate({ path: 'user', populate: [{ path: 'country' }] });
  docs = helper.sanitizeArray(docs.slice(filter.offset,
    filter.limit === 0 ? docs.length : (filter.offset + filter.limit)));
  // because of mongo cannot sort by string , so use backend to sort entities
  if (filter.sortBy === 'createdBy') {
    docs = docs.sort((a, b) => {
      const pa = a.post.createdBy;
      const pb = b.post.createdBy;
      return pa.name.toLowerCase() > pb.name.toLowerCase() ? 1 : -1;
    });
  }
  if (filter.sortBy === 'title') {
    docs = docs.sort((a, b) => (a.post.title.toLowerCase() > b.post.title.toLowerCase() ? 1 : -1));
  }
  return docs;
}

search.schema = {
  filter: joi.object().keys({
    technologyUserId: joi.objectId(),
    postIds: joi.array().items(joi.objectId()).default([]),
    statuses: joi.array().items(joiPostSaveStatus).default([]),
    keywords: joi.string(),
    sortBy: joi.string(),
    createdOnStart: joi.date(),
    createdOnEnd: joi.date(),
    offset: joi.offset(),
    limit: joi.limit(),
  }).required(),
};

/**
 * return the total count that matched.
 * @param filter the user's filter
 * @return {*}
 */
function* getCountByFilter(filter) {
  return yield models.PostSave.find(yield buildDBFilter(filter))
    .skip(filter.offset).limit(filter.limit).count();
}

getCountByFilter.schema = search.schema;

/**
 * remove all expired post save
 */
function* removeAllExpiredPostSave() {
  yield models.PostSave.remove(
    {
      expirationOption:
        { $ne: models.Const.PostExpirationOption.never },
      expiredAt: { $lte: Date.now() },
    });
}

module.exports = {
  create,
  update,
  get,
  remove,
  search,
  getCountByFilter,
  getDBEntity,
  removeAllExpiredPostSave,
};
