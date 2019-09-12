/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the FavouriteCategory Service
 *
 * @author      TCSCODER
 * @version     1.0
 */

const joi = require('joi');
const errors = require('common-errors');
const models = require('../models');
const helper = require('../common/helper');
const CategoryService = require('./CategoryService');
const TechnologyUserService = require('./TechnologyUserService');
const _ = require('lodash');

const entitySchema = joi.object().keys({
  _id: joi.objectId(),
  category: joi.objectId(),
  user: joi.objectId(),
  createdOn: joi.date(),
}).required();


/**
 * create FavouriteCategory
 * @param userId the current user id
 * @param entity the FavouriteCategory entity
 */
function* create(userId, entity) {
  helper.ensureNotNull('category', entity.category);
  helper.ensureNotNull('user', entity.user);
  yield CategoryService.getDBEntity(entity.category, true); // check category exists
  const tUser = yield TechnologyUserService.get(entity.user);
  helper.ensureUserIdEqual(userId, tUser.userId.toString(), 'technologyUser must be yourself!');
  const existEntity = yield models.FavouriteCategory
    .findOne({ category: entity.category, user: entity.user });
  if (existEntity) {
    return existEntity.toObject();
  }
  const fc = yield models.FavouriteCategory.create(entity);
  return yield get(fc.id);
}

create.schema = {
  userId: joi.objectId(),
  entity: entitySchema,
};


/**
 * update FavouriteCategory by id
 * @param userId the current user id
 * @param id the FavouriteCategory id
 * @param entity the FavouriteCategory entity
 */
function* update(userId, id, entity) {
  let fc = yield getDBEntity(id);
  helper.ensureUserIdEqual(userId, fc.user.userId.toString(),
    'cannot update favouriteCategory that not belongs to you!');
  // ignore user
  fc = _.extend(fc, _.omit(entity, 'user'));
  yield fc.save();
  return yield get(id);
}

update.schema = {
  userId: joi.objectId(),
  id: joi.objectId(),
  entity: entitySchema,
};

/**
 * get db FavouriteCategory , if not exist , it will raise a not found exception
 * @param id the FavouriteCategory id
 * @return {*}
 */
function* getDBEntity(id) {
  const entity = yield models.FavouriteCategory.findOne({
    _id: id,
  }).populate('category').populate('user');
  if (!entity) {
    throw new errors.NotFoundError(`cannot found FavouriteCategory where id = ${id}`);
  }
  return entity;
}

/**
 * get FavouriteCategory by id
 * @param id the FavouriteCategory id
 */
function* get(id) {
  const entity = yield getDBEntity(id);
  return entity.toObject();
}

/**
 * remove FavouriteCategory by id
 * @param userId the current user id
 * @param id the FavouriteCategory id
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
  let query = helper.buildEqualQuery({}, 'user', filter.userId);
  query = helper.buildEqualQuery(query, 'category', filter.categoryId);
  query = helper.buildDateRangeQuery(query, 'createdOn', filter.createdOnStart, filter.createdOnEnd);
  return query;
}

/**
 * search FavouriteCategories by user's filter
 * @param filter the user's filter
 * @return {*}
 */
function* search(filter) {
  const query = yield buildDBFilter(filter);
  const docs = yield models.FavouriteCategory.find(query)
    .populate('category')
    .populate('user')
    .skip(filter.offset)
    .limit(filter.limit);
  return helper.sanitizeArray(docs);
}

search.schema = {
  filter: joi.object().keys({
    categoryId: joi.objectId(),
    userId: joi.objectId(),
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
  return yield models.FavouriteCategory.find(yield buildDBFilter(filter))
    .skip(filter.offset).limit(filter.limit).count();
}

getCountByFilter.schema = search.schema;


function* removeAll(userId) {
  yield models.FavouriteCategory.remove({ user: userId });
}

module.exports = { create, update, get, remove, search, getCountByFilter, getDBEntity, removeAll };
