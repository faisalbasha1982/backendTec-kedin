/**
 * Copyright (C) 2017 Topcoder Inc., All Rights Reserved.
 */


/**
 * Contains generic helper methods
 *
 * @author      TSCODER
 * @version     1.0
 */

const _ = require('lodash');
const co = require('co');
const config = require('config');
const errors = require('common-errors');
const fs = require('fs');

/**
 * get a random string with length
 * @param len
 * @param chars the chars
 * @returns {string}
 */
function randomStr(len, chars) {
  const newLen = len || 32;
  const $chars = chars || 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  const maxPos = $chars.length;
  let pwd = '';
  for (let i = 0; i < newLen; i += 1) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
}

/**
 * Wrap generator function to standard express function
 * @param {Function} fn the generator function
 * @returns {Function} the wrapped function
 */
function wrapExpress(fn) {
  return function (req, res, next) {
    co(fn(req, res, next)).catch(next);
  };
}

/**
 * Wrap all generators from object
 * @param obj the object (controller exports)
 * @returns {Object|Array} the wrapped object
 */
function autoWrapExpress(obj) {
  if (_.isArray(obj)) {
    return obj.map(autoWrapExpress);
  }
  if (_.isFunction(obj)) {
    if (obj.constructor.name === 'GeneratorFunction') {
      return wrapExpress(obj);
    }
    return obj;
  }
  _.each(obj, (value, key) => {
    obj[ key ] = autoWrapExpress(value);  //eslint-disable-line
  });
  return obj;
}

/**
 * Helper method to sanitize the Array
 * Sanitization means convert the mongoose model into plain javascript object
 *
 * @param arry the array to sanitize
 * @param method the sanitize method
 */
function sanitizeArray(arry, method) {
  const newMethod = method || 'toObject';
  if (_.isArray(arry)) {
    const response = [];
    _.forEach(arry, (single) => {
      response.push(single[newMethod]());
    });
    return response;
  }
  return arry.toObject();
}


/**
 * add toObject transform to mongoose schema
 * @param schema Mogoose Schema
 * @param transformFunc the toObject tranfrom function
 */

/* eslint-disable no-param-reassign */
function pluginSchmeToObject(schema, transformFunc) {
  if (!schema.options.toObject) {
    schema.options.toObject = {};
  }
  if (!transformFunc) {
    transformFunc = function (doc, ret) {
      const sanitized = _.omit(ret, '__v', '_id');
      sanitized.id = doc._id;
      return sanitized;
    };
  }
  schema.options.toObject.transform = transformFunc;
}

/* eslint-enable no-param-reassign */


/**
 * get host with api version , example like http://localhost:3000/api/v1
 * @return {string}
 */
function getHostWithApiVersion() {
  return `${config.HOST}/${config.API_VERSION}`;
}

/**
 * build fuzzing match query
 * @param query the origin query
 * @param key the match key
 * @param value the value
 * @return {Object}
 */
function buildFuzzingMatchQuery(query, key, value) {
  const aditionQuery = {};
  if (value) {
    aditionQuery[key] = { $regex: value, $options: 'i' };
  }
  return _.extend(query, aditionQuery);
}

/**
 * build equal query
 * @param query the origin query
 * @param key the match key
 * @param value the match value
 * @return {Object}
 */
function buildEqualQuery(query, key, value) {
  const aditionQuery = {};
  if (value) {
    aditionQuery[key] = value;
  }
  return _.extend(query, aditionQuery);
}


/**
 * build date range query
 * @param query the origin query
 * @param key the date key
 * @param startDate the start date
 * @param endDate the end date
 * @return {Object}
 */
function buildDateRangeQuery(query, key, startDate, endDate) {
  const aditionQuery = {};
  const dateRange = {};
  if (startDate) {
    dateRange.$gte = startDate;
  }
  if (endDate) {
    dateRange.$lte = endDate;
  }
  if (!_.isEmpty(dateRange)) {
    aditionQuery[key] = dateRange;
  }
  return _.extend(query, aditionQuery);
}

/**
 * ensure the current user id equal entity.user id
 * if not requal , it will raise a no permission error.
 * @param userId
 * @param entityUserId
 * @param message the error message
 */
function ensureUserIdEqual(userId, entityUserId, message) {
  if (userId !== entityUserId) {
    throw new errors.NotPermittedError(message || 'userId must equal yourself user id!');
  }
}

/**
 * ensure value NotNull
 * @param key the value's name
 * @param value the value
 */
function ensureNotNull(key, value) {
  if (!value) {
    throw new errors.ArgumentError(`${key} is required!`);
  }
}

/**
 * ensure the entity not exist in db , used for
 * postView, postSave, favCategory, favProvider, review
 * @param model the db schema
 * @param query the query
 * @param message the error message
 */
function* ensureEntityNotExist(model, query, message) {
  const entity = yield model.findOne(query);
  if (entity) {
    throw new errors.HttpStatusError(409, message || 'entity already exist, cannot create it twice!');
  }
}

/**
 * ensure dir exist , it not exist , it will create it
 * @param dir the dir path
 */
function ensureDirExist(dir) {
  // create  dir
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}

/**
 * check the user is admin or not
 * @param model the user model
 * @param userId the user id
 * @return {*}
 */
function* checkAdmin(model, userId) {
  const user = yield model.findOne({ _id: userId });
  if (!user || user.type !== 'admin') {
    throw new errors.HttpStatus(403, 'only admin can request this endpoint');
  }
  return user;
}
module.exports = {
  wrapExpress,
  autoWrapExpress,
  sanitizeArray,
  randomStr,
  pluginSchmeToObject,
  buildFuzzingMatchQuery,
  buildEqualQuery,
  buildDateRangeQuery,
  ensureUserIdEqual,
  getHostWithApiVersion,
  ensureEntityNotExist,
  checkAdmin,
  ensureNotNull,
  ensureDirExist,
};
