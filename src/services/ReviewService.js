/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the Review Service
 *
 * @author      TCSCODER
 * @version     1.0
 */

const joi = require('joi');
const errors = require('common-errors');
const models = require('../models');
const helper = require('../common/helper');
const TechnologyProviderService = require('./TechnologyProviderService');
const TechnologyUserService = require('./TechnologyUserService');

const _ = require('lodash');

const entitySchema = joi.object().keys({
  _id: joi.objectId(),
  provider: joi.objectId(),
  fromUser: joi.objectId(),
  score: joi.number().integer().min(0).max(100),
  reviewText: joi.string(),
  createdOn: joi.date(),
  updatedOn: joi.date(),
}).required();


/**
 * create Review
 * @param userId the current user id
 * @param entity the Review entity
 */
function* create(userId, entity) {
  helper.ensureNotNull('provider', entity.provider);
  helper.ensureNotNull('fromUser', entity.fromUser);
  yield TechnologyProviderService.get(entity.provider);
  const tUser = yield TechnologyUserService.get(entity.fromUser);
  helper.ensureUserIdEqual(userId, tUser.userId.toString(), 'fromUser must be yourself!');


  yield helper.ensureEntityNotExist(models.Review,
    { provider: entity.provider, fromUser: entity.fromUser });

  const Review = yield models.Review.create(entity);
  return yield get(Review.id);
}

create.schema = {
  userId: joi.objectId(),
  entity: entitySchema,
};


/**
 * update Review by id
 * @param userId the current user id
 * @param id the Review id
 * @param entity the Review entity
 */
function* update(userId, id, entity) {
  if (entity.provider) {
    yield TechnologyProviderService.get(entity.provider);
  }
  if (entity.fromUser) {
    const tUser = yield TechnologyUserService.get(entity.fromUser);
    helper.ensureUserIdEqual(userId, tUser.userId.toString(), 'fromUser must be your self.');
  }

  let review = yield getDBEntity(id);
  helper.ensureUserIdEqual(userId, review.fromUser.userId.toString(), 'cannot update post that not belongs to you!');
  review = _.extend(review, entity);
  yield review.save();
  return yield get(id);
}

update.schema = {
  userId: joi.objectId(),
  id: joi.objectId(),
  entity: entitySchema,
};

/**
 * get db Review , if not exist , it will raise a not found exception
 * @param id the Review id
 * @return {*}
 */
function* getDBEntity(id) {
  const entity = yield models.Review.findOne({
    _id: id,
  }).populate({ path: 'fromUser', populate: [{ path: 'country' }] })
    .populate('provider');
  if (!entity) {
    throw new errors.NotFoundError(`cannot found Review where id = ${id}`);
  }
  return entity;
}

/**
 * get Review
 * @param id the Review id
 */
function* get(id) {
  const entity = yield getDBEntity(id);
  return entity.toObject();
}

/**
 * remove Review by id
 * @param userId the current user id
 * @param id the Review id
 */
function* remove(userId, id) {
  const entity = yield getDBEntity(id);
  helper.ensureUserIdEqual(userId, entity.fromUser.userId.toString(), 'you cannot delete entity that not belongs to you!');
  yield entity.remove();
}

/**
 * build the full search query by filter
 * @param filter the user's filter
 * @return {Object}
 */
function* buildDBFilter(filter) {
  let query = helper.buildEqualQuery({}, 'provider', filter.technologyProviderId);
  query = helper.buildEqualQuery(query, 'fromUser', filter.fromUserId);
  query = helper.buildDateRangeQuery(query, 'createdOn', filter.createdOnStart, filter.createdOnEnd);
  return query;
}

/**
 * search reviews by user's filter
 * @param filter the user's filter
 * @return {*}
 */
function* search(filter) {
  const query = yield buildDBFilter(filter);
  const docs = yield models.Review.find(query)
    .populate({ path: 'fromUser', populate: [{ path: 'country' }] })
    .populate('provider')
    .skip(filter.offset)
    .limit(filter.limit);
  return helper.sanitizeArray(docs);
}

search.schema = {
  filter: joi.object().keys({
    technologyProviderId: joi.objectId(),
    fromUserId: joi.objectId(),
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
  return yield models.Review.find(yield buildDBFilter(filter))
    .skip(filter.offset).limit(filter.limit).count();
}

getCountByFilter.schema = search.schema;

module.exports = { create, update, get, remove, search, getCountByFilter, getDBEntity };
