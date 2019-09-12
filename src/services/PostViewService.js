/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the Post Service
 *
 * @author      TCSCODER
 * @version     1.0
 */

const joi = require('joi');
const errors = require('common-errors');
const models = require('../models');
const helper = require('../common/helper');
const TechnologyUserService = require('./TechnologyUserService');


const entitySchema = joi.object().keys({
  _id: joi.objectId(),
  post: joi.objectId(),
  user: joi.objectId(),
  createdOn: joi.date(),
}).required();


/**
 * create PostView
 * the relate
 * @param userId the current user id
 * @param entity the PostView entity
 */
function* create(userId, entity) {
  helper.ensureNotNull('post', entity.post);
  helper.ensureNotNull('user', entity.user);


  const tUser = yield TechnologyUserService.get(entity.user);
  helper.ensureUserIdEqual(userId, tUser.userId.toString(), 'TechnologyUser must be yourself!');
  let postView = yield models.PostView.findOne({ post: entity.post, user: entity.user });
  if (!postView) {
    postView = yield models.PostView.create(entity);
  }

  return yield get(postView.id);
}

create.schema = {
  userId: joi.objectId(),
  entity: entitySchema,
};


/**
 * get db PostView , if not exist , it will raise a not found exception
 * @param id
 * @return {*}
 */
function* getDBEntity(id) {
  const entity = yield models.PostView.findOne({
    _id: id,
  }).populate({ path: 'post', populate: [{ path: 'createdBy' }, { path: 'category' }] })
    .populate('user');
  if (!entity) {
    throw new errors.NotFoundError(`cannot found PostView where id = ${id}`);
  }
  return entity;
}

/**
 * get PostView
 * @param id the PostView id
 */
function* get(id) {
  const entity = yield getDBEntity(id);
  return entity.toObject();
}


/**
 * build the full search query by filter
 * @param filter the user's filter
 * @return {Object}
 */
function* buildSearchQuery(filter) {
  let query = helper.buildEqualQuery({}, 'user', filter.technologyUserId);
  query = helper.buildEqualQuery(query, 'post', filter.postId);
  query = helper.buildDateRangeQuery(query, 'createdOn', filter.createdOnStart, filter.createdOnEnd);
  return query;
}

/**
 * search PostView by user's filter
 * @param filter the user's filter
 * @return {*}
 */
function* search(filter) {
  const query = yield buildSearchQuery(filter);
  const docs = yield models.PostView.find(query).sort({ createdOn: -1 })
    .populate({ path: 'user', populate: { path: 'country' } })
    .populate({ path: 'post', populate: [{ path: 'createdBy' }, { path: 'category' }] })
    .skip(filter.offset)
    .limit(filter.limit);
  return helper.sanitizeArray(docs);
}

search.schema = {
  filter: joi.object().keys({
    technologyUserId: joi.objectId(),
    postId: joi.objectId(),
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
  return yield models.PostView.find(yield buildSearchQuery(filter))
    .skip(filter.offset).limit(filter.limit).count();
}

getCountByFilter.schema = search.schema;


module.exports = { create, get, search, getCountByFilter };
