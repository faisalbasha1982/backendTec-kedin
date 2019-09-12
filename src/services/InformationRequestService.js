/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the InformationRequest Service
 *
 * @author      TCSCODER
 * @version     1.0
 */

const joi = require('joi');
const errors = require('common-errors');
const models = require('../models');
const helper = require('../common/helper');
const TechnologyUserService = require('./TechnologyUserService');
const _ = require('lodash');

const joiRequestSchema = joi.string().valid(_.values(models.Const.InformationStatus));
const entitySchema = joi.object().keys({
  _id: joi.objectId(),
  fromUser: joi.objectId(),
  subject: joi.string(),
  requestText: joi.string(),
  answer: joi.string(),
  status: joiRequestSchema,
  createdOn: joi.date(),
  answeredOn: joi.date(),
}).required();


/**
 * create InformationRequest
 * @param userId the current user id
 * @param entity the InformationRequest entity
 */
function* create(userId, entity) {
  helper.ensureNotNull('fromUser', entity.fromUser);
  const tUser = yield TechnologyUserService.get(entity.fromUser);
  helper.ensureUserIdEqual(userId, tUser.userId.toString(), 'technologyUser must be yourself!');

  const ir = yield models.InformationRequest.create(entity);
  return yield get(ir.id);
}

create.schema = {
  userId: joi.objectId(),
  entity: entitySchema,
};


/**
 * update InformationRequest by id
 * @param userId the current user id
 * @param id the InformationRequest id
 * @param entity the InformationRequest entity
 */
function* update(userId, id, entity) {
  let informationRequest = yield getDBEntity(id);
  helper.ensureUserIdEqual(userId, informationRequest.fromUser.userId.toString(),
    'cannot update InformationRequest that not belongs to you!');

  // ignore fromUser
  informationRequest = _.extend(informationRequest, _.omit(entity, 'fromUser'));
  yield informationRequest.save();
  return yield get(id);
}

update.schema = {
  userId: joi.objectId(),
  id: joi.objectId(),
  entity: entitySchema,
};

/**
 * get db InformationRequest , if not exist , it will raise a not found exception
 * @param id the InformationRequest id
 * @return {*}
 */
function* getDBEntity(id) {
  const entity = yield models.InformationRequest.findOne({
    _id: id,
  }).populate('fromUser');
  if (!entity) {
    throw new errors.NotFoundError(`cannot found InformationRequest where id = ${id}`);
  }
  return entity;
}

/**
 * get InformationRequest by id
 * @param id the InformationRequest id
 */
function* get(id) {
  const entity = yield getDBEntity(id);
  return entity.toObject();
}

/**
 * remove InformationRequest by id
 * @param userId the current user id
 * @param id the InformationRequest id
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
  let query = helper.buildEqualQuery({}, 'fromUser', filter.fromUserId);
  query = helper.buildDateRangeQuery(query, 'createdOn', filter.createdOnStart, filter.createdOnEnd);
  if (filter.statuses.length > 0) {
    query.status = { $in: filter.statuses };
  }

  return query;
}

/**
 * search InformationRequests by user's filter
 * @param filter the user's filter
 * @return {*}
 */
function* search(filter) {
  const query = yield buildDBFilter(filter);

  const docs = yield models.InformationRequest.find(query)
    .populate('fromUser')
    .skip(filter.offset)
    .limit(filter.limit);
  return helper.sanitizeArray(docs);
}

search.schema = {
  filter: joi.object().keys({
    fromUserId: joi.objectId(),
    statuses: joi.array().items(joiRequestSchema).default([]),
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
  return yield models.InformationRequest.find(yield buildDBFilter(filter))
    .skip(filter.offset).limit(filter.limit).count();
}

getCountByFilter.schema = search.schema;

module.exports = { create, update, get, remove, search, getCountByFilter, getDBEntity };
