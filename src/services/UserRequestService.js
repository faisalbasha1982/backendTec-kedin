/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */
/**
 * the user Request service
 *
 * @author      TCSCODER
 * @version     1.0
 */

const joi = require('joi');
const PostService = require('./PostService');
const UtilityService = require('./UtilityService');
const UserService = require('./UserService');
const config = require('config');
const models = require('../models');
const errors = require('common-errors');
const httpStatus = require('http-status');
const util = require('util');
const helper = require('../common/helper');
const _ = require('lodash');

/**
 * user Request post
 * @param userId the user id
 * @param entity the Request entity
 */
function* create(userId, entity) {
  const user = yield UserService.getDBUserById(userId);
  const tUser = yield models.TechnologyUser.findOne({ userId });
  const post = yield PostService.get(entity.post);
  const name = `${tUser.firstName} ${tUser.lastName}`;
  const content = util.format(config.requestEmailContent, name, user.email,
    post.title, entity.content, entity.phone, entity.other);
  const subject = util.format(config.requestEmailSubject, name, post.title);
  const subscribe = yield models.UserRequest.create(_.extend({}, {
    provider: post.createdBy._id,
    user: tUser._id,
    content: entity.content,
    post: post._id,
  }, entity, { phone: entity.phone === '' ? user.phone : entity.phone }));
  if (post.createdBy.contactInformation.email) {
    try {
      yield UtilityService.sendEmail({
        subject,
        to: post.createdBy.contactInformation.email,
        html: content,
      });
    } catch (e) {
      yield subscribe.remove();
      throw new errors.HttpStatusError(httpStatus.INTERNAL_SERVER_ERROR, e.message);
    }
  }
  return subscribe;
}

create.schema = {
  userId: joi.objectId().required(),
  entity: joi.object().keys({
    post: joi.objectId().required(),
    content: joi.string().required(),
    phone: joi.string().allow(''),
    other: joi.string().allow(''),
  }).required(),
};

/**
 * build request search query
 * @param filter the filter
 * @return {Object} the object
 */
function* buildSearchQuery(filter) {
  let query = helper.buildEqualQuery({}, 'post', filter.post);
  query = helper.buildEqualQuery(query, 'user', filter.user);
  query = helper.buildEqualQuery(query, 'provider', filter.provider);
  return query;
}

/**
 * search subscribe
 * @param filter the search filter
 * @return {*}
 */
function* search(filter) {
  const searchQuery = yield buildSearchQuery(filter);
  let docs = yield models.UserRequest.find(searchQuery).populate('user')
    .skip(filter.offset)
    .limit(filter.limit);
  docs = helper.sanitizeArray(docs);
  return yield getUserState(docs);
}

/**
 * get user state
 * @param docs the requests
 */
function* getUserState(docs) {
  for (let i = 0; i < docs.length; i += 1) {
    const u = docs[i].user;
    if (u && u.state) {
      u.state = yield models.State.findOne({ _id: u.state });
    }
  }
  return docs;
}

search.schema = {
  filter: joi.object().keys({
    post: joi.objectId(),
    user: joi.objectId(),
    provider: joi.objectId(),
    offset: joi.offset(),
    limit: joi.limit(),
  }).required(),
};

/**
 * download user Request as excel file
 * @param entity the query entity
 */
function* download(entity) {
  let docs = yield models.UserRequest.find({ provider: entity.provider }).populate('user');
  docs = helper.sanitizeArray(docs);
  return yield getUserState(docs);
}

module.exports = {
  create,
  search,
  download,
};
