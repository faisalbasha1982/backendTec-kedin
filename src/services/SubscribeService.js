/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the subscribe service
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
 * user subscribe post
 * @param userId the user id
 * @param entity the subscribe entity
 */
function* create(userId, entity) {
  const user = yield UserService.getDBUserById(userId);
  const tUser = yield models.TechnologyUser.findOne({ userId });
  const post = yield PostService.get(entity.post);
  const name = `${tUser.firstName} ${tUser.lastName}`;
  const content = util.format(config.subscribeEmailContent, name, user.email, post.title);
  const subject = util.format(config.subscribeEmailSubject, name, post.title);

  const checkExist = yield search({ user: tUser._id, post: post._id });
  if (checkExist.length > 0) {
    throw new errors.HttpStatusError(httpStatus.CONFLICT, 'already subscribed');
  }
  const subscribe = yield models.Subscribe.create({ user: tUser._id, post: post._id });
  if (post.createdBy.contactInformation.email) {
    try {
      yield UtilityService.sendEmail({
        subject,
        to: post.createdBy.contactInformation.email,
        text: content,
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
  }).required(),
};

/**
 * build subscribe search query
 * @param filter the filter
 * @return {Object} the object
 */
function* buildSearchQuery(filter) {
  let query = helper.buildEqualQuery({}, 'post', filter.post);
  query = helper.buildEqualQuery(query, 'user', filter.user);
  return query;
}

/**
 * search subscribe
 * @param filter the search filter
 * @return {*}
 */
function* search(filter) {
  if (filter.provider) {
    const users = yield getSubscribeByProvider(yield models.TechnologyProvider
      .findOne({ _id: filter.provider }));
    return _.map(users, user => ({
      name: `${user.firstName} ${user.lastName}`,
      email: user.baseUser.email,
      city: user.city || 'N/A',
      state: user.state ? (user.state.value || 'N/A') : 'N/A',
    }));
  }
  const searchQuery = yield buildSearchQuery(filter);
  const docs = yield models.Subscribe.find(searchQuery)
    .skip(filter.offset)
    .limit(filter.limit);
  return helper.sanitizeArray(docs);
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


function* getSubscribeByProvider(provider) {
  const posts = yield models.Post.find({ createdBy: provider._id.toString() });
  const subscribes = yield models.Subscribe
    .find({ post: { $in: _.map(posts, p => p._id.toString()) } })
    .populate('user');
  const subscribeUsers = {};
  _.each(subscribes, (subscribe) => {
    if (!subscribe.user) return;
    subscribeUsers[subscribe.user._id.toString()] = subscribe.user;
  });

  const results = [];
  for (const i in subscribeUsers) { // eslint-disable-line
    const destObj = subscribeUsers[i].toObject();
    if (destObj.state) {
      destObj.state = yield models.State
        .findOne({ _id: subscribeUsers[i].state.toString() });
    }

    if (destObj.userId) {
      destObj.baseUser = yield models.User
        .findOne({ _id: subscribeUsers[i].userId.toString() });
    }
    if (destObj.baseUser) {
      results.push(destObj);
    }
  }
  return results;
}

/**
 * download subscribers as excel file
 * @param entity the query entity
 */
function* download(userId, entity) {
  const provider = yield models.TechnologyProvider.findOne({ _id: entity.provider });
  if (!provider) {
    throw new errors.NotFoundError(`cannot found provider where id = ${entity.provider}`);
  }

  if (userId.toString() !== provider.userId.toString()) {
    throw new errors.NotPermittedError('cannot donwload others subscribes data.');
  }
  return yield getSubscribeByProvider(provider);
}
module.exports = {
  create,
  search,
  download,
};
