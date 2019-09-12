/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the TechnologyUserFile Service
 *
 * @author      TCSCODER
 * @version     1.0
 */

const joi = require('joi');
const errors = require('common-errors');
const models = require('../models');
const helper = require('../common/helper');
const TechnologyUserService = require('./TechnologyUserService');
const FileService = require('./FileService');
const _ = require('lodash');
const path = require('path');
const config = require('config');

const entitySchema = joi.object().keys({
  _id: joi.objectId(),
  user: joi.objectId(),
  keywords: joi.array().items(joi.string()).default([]),
  fileName: joi.string(),
  filePath: joi.string(),
  createdOn: joi.date(),
  answeredOn: joi.date(),
}).required();


/**
 * create TechnologyUserFile
 * @param userId the current user id
 * @param entity the TechnologyUserFile entity
 */
function* create(userId, entity) {
  helper.ensureNotNull('entity.user', entity.user);

  // check TechnologyUser exists and check TechnologyUser.userId
  const tUser = yield TechnologyUserService.get(entity.user);
  helper.ensureUserIdEqual(userId, tUser.userId.toString(), 'TechnologyUser must be belongs to you.');


  const file = yield models.TechnologyUserFile.create(_.omit(entity, 'fileName', 'filePath'));
  return yield get(file.id);
}

create.schema = {
  userId: joi.objectId(),
  entity: entitySchema,
};

/**
 * get db TechnologyUserFile , if not exist , it will raise a not found exception
 * @param id the TechnologyUserFile id
 * @return {*}
 */
function* getDBEntity(id) {
  const entity = yield models.TechnologyUserFile.findOne({ _id: id }).populate({
    path: 'user', populate: [{ path: 'country' }],
  });
  if (!entity) {
    throw new errors.NotFoundError(`cannot found TechnologyUserFile where id = ${id}`);
  }
  return entity;
}

/**
 * get TechnologyUserFile
 * @param id the Post id
 */
function* get(id) {
  const entity = yield getDBEntity(id);
  return entity.toObject();
}

/**
 * remove TechnologyUserFile by id
 * @param userId the current user id
 * @param id the TechnologyUserFile id
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
  query = helper.buildEqualQuery(query, 'post', filter.postId);
  if (filter.keywords.length > 0) {
    query.keywords = { $in: filter.keywords };
  }
  query = helper.buildDateRangeQuery(query, 'createdOn', filter.createdOnStart, filter.createdOnEnd);
  return query;
}

/**
 * search TechnologyUserFile by user's filter
 * @param filter the user's filter
 * @return {*}
 */
function* search(filter) {
  const query = yield buildDBFilter(filter);
  const docs = yield models.TechnologyUserFile.find(query)
    .populate({ path: 'post', populate: [{ path: 'createdBy' }, { path: 'category' }] })
    .populate('user')
    .skip(filter.offset)
    .limit(filter.limit);
  return helper.sanitizeArray(docs);
}

search.schema = {
  filter: joi.object().keys({
    technologyUserId: joi.objectId(),
    keywords: joi.array().items(joi.string()).default([]),
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
  return yield models.TechnologyUserFile.find(yield buildDBFilter(filter))
    .skip(filter.offset).limit(filter.limit).count();
}

getCountByFilter.schema = search.schema;

/**
 * upload file
 * @param userId the current user id
 * @param id the TechnologyUserFile id
 * @param files the files
 */
function* upload(userId, id, files) {
  helper.ensureNotNull('file', files);
  helper.ensureNotNull('file', files.file);

  const file = files.file;
  const entity = yield getDBEntity(id);
  helper.ensureUserIdEqual(userId, entity.user.userId.toString(), 'you cannot upload file to other!');


  helper.ensureDirExist(path.join(config.IMAGES_PATH, 'technologyUserFile'));
  helper.ensureDirExist(path.join(config.IMAGES_PATH, 'technologyUserFile', id));
  const subDir = path.join('technologyUserFile', id);
  const filePath = yield FileService.upload(config.IMAGES_PATH, subDir, file);
  entity.fileName = file.name;
  entity.filePath = path.join(subDir, filePath);

  yield entity.save();
  return yield get(id);
}

module.exports = { create, get, remove, search, getCountByFilter, getDBEntity, upload };
