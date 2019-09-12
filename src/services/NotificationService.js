/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the Notification Service
 *
 * @author      TCSCODER
 * @version     1.0
 */

const joi = require('joi');
const errors = require('common-errors');
const models = require('../models');
const helper = require('../common/helper');
const _ = require('lodash');

const joiNotificationTypeSchema = joi.string().valid(_.values(models.Const.NotificationType));
const joiNotificationStatusSchema = joi.string().valid(_.values(models.Const.NotificationStatus));
const entitySchema = joi.object().keys({
  recipientUserId: joi.objectId(),
  sourceUserId: joi.objectId(),
  type: joiNotificationTypeSchema,
  status: joiNotificationStatusSchema,
  entityId: joi.objectId(),
}).required();


/**
 * create Notification
 * @param entity the Notification entity
 */
function* create(entity) {
  return yield createBatch([entity]);
}

create.schema = { entity: entitySchema };

/**
 * create notification in batch mode
 * @param entities the Notification entities
 */
function* createBatch(entities) {
  if (entities.length <= 0) {
    return;
  }

  yield models.Notification.create(entities);
}

createBatch.schema = {
  entities: joi.array().items(entitySchema).default([]),
};

/**
 * generate Notifications by post update
 * @param post the post entity
 */
function* generateNotificationsByPostUpdate(post) {
  const providerId = post.createdBy._id;
  const entityId = post._id;
  const notifications = [];
  // create updatePostByFavouriteProvider notifications
  const favProviders = yield models.FavouriteTechnologyProvider.find({ provider: providerId }).populate('user');
  _.each(favProviders, (fp) => {
    if (fp.user.notifyMeByPostUpdated === true) {
      notifications.push({
        recipientUserId: fp.user.userId,
        sourceUserId: post.createdBy.userId,
        type: models.Const.NotificationType.updatePostByFavouriteProvider,
        entityId,
      });
    }
  });

  yield createBatch(notifications);
}

/**
 * generate Notifications By Admin
 * @param adminUserId the admin user id
 * @param users the dest user id
 * @param content the content
 */
function* generateNotificationsByAdmin(adminUserId, users, content) {
  const notifications = [];
  const userIds = users.split(';');
  _.each(userIds, (id) => {
    if (!id || id.length <= 0) return;
    notifications.push({
      recipientUserId: id,
      sourceUserId: adminUserId,
      type: models.Const.NotificationType.system,
      content,
    });
  });
  yield createBatch(notifications);
}

function* generateNotificationsByFreezeProvider(providerId) {
  const posts = yield models.Post.find({ createdBy: providerId });
  const postSaves = yield models.PostSave
    .find({ post: { $in: _.map(posts, p => p._id.toString()) } }).populate('user');
  const userIds = _.uniq(_.map(postSaves, ps => ps.user.userId));
  const notifications = [];
  _.each(userIds, (id) => {
    notifications.push({
      recipientUserId: id,
      sourceUserId: providerId,
      type: models.Const.NotificationType.providerFreezed,
      entityId: providerId,
    });
  });
  yield createBatch(notifications);
}

/**
 * generate Notifications by post created
 * @param post the post entity
 */
function* generateNotifications(post) {
  const categoryId = post.category._id;
  const providerId = post.createdBy._id;
  const entityId = post._id;
  // create newPostInFavouriteCategory notifications
  const favCategories = yield models.FavouriteCategory.find({ category: categoryId }).populate('user');
  const notifications = [];
  _.each(favCategories, (fc) => {
    notifications.push({
      recipientUserId: fc.user.userId,
      sourceUserId: post.createdBy.userId,
      type: models.Const.NotificationType.newPostInFavouriteCategory,
      entityId,
    });
  });

  // create newPostByFavouriteProvider notifications
  const favProviders = yield models.FavouriteTechnologyProvider.find({ provider: providerId }).populate('user');
  _.each(favProviders, (fp) => {
    if (fp.user.notifyMeByPostCreated === true) {
      notifications.push({
        recipientUserId: fp.user.userId,
        sourceUserId: post.createdBy.userId,
        type: models.Const.NotificationType.newPostByFavouriteProvider,
        entityId,
      });
    }
  });

  yield createBatch(notifications);
}

/**
 * remove unread notifications
 * @param sourceUserId the sourceUserId
 * @param entityId the entity id
 * @param types the types array
 */
function* removeUnreadNotifications(sourceUserId, entityId, types) {
  yield models.Notification.remove({
    sourceUserId,
    entityId,
    type: { $in: types },
    status: models.Const.NotificationStatus.new,
  });
}

/**
 * update Notification by id
 * @param userId the current user id
 * @param id the Notification id
 * @param entity the Notification entity
 */
function* update(userId, id, entity) {
  let notification = yield getDBEntity(id);

  if (notification.recipientUserId.toString() !== userId &&
    notification.sourceUserId.toString() !== userId) {
    throw new errors.NotPermittedError('cannot update notification that not belongs to you!');
  }
  // the notification 'recipientUserId', 'sourceUserId', 'entityId' should not be changed
  notification = _.extend(notification, _.omit(entity, 'recipientUserId', 'sourceUserId', 'entityId'));
  yield notification.save();
  return yield get(userId, id);
}

update.schema = {
  userId: joi.objectId(),
  id: joi.objectId(),
  entity: entitySchema,
};

/**
 * get db Notification , if not exist , it will raise a not found exception
 * @param id the Notification id
 * @return {*}
 */
function* getDBEntity(id) {
  const entity = yield models.Notification.findOne({ _id: id })
    .populate({ path: 'post', populate: [{ path: 'createdBy' }, { path: 'category' }] })
    .populate('user');

  if (!entity) {
    throw new errors.NotFoundError(`cannot found Notification where id = ${id}`);
  }
  return entity;
}

function checkUserIsRecipientUserOrSourceUser(userId, recipientUserId, sourceUserId) {
  if (userId !== recipientUserId && sourceUserId !== userId) {
    throw new errors.NotPermittedError('you can only fetch yourself notification.');
  }
}

function* expandEntity(notification) {
  if (notification.type === models.Const.NotificationType.newPostInFavouriteCategory ||
    notification.type === models.Const.NotificationType.newPostByFavouriteProvider ||
    notification.type === models.Const.NotificationType.updatePostByFavouriteProvider
  ) {
    return yield models.Post.findOne({ _id: notification.entityId }).populate('createdBy').populate('category');
  } else if (notification.type === models.Const.NotificationType.providerFreezed) {
    return yield models.TechnologyProvider.findOne({ _id: notification.entityId });
  }
  return {};
}

/**
 * get Notification
 * @param userId the current user id
 * @param id the Post id
 */
function* get(userId, id) {
  const entity = yield getDBEntity(id);
  checkUserIsRecipientUserOrSourceUser(userId,
    entity.recipientUserId.toString(), entity.sourceUserId.toString());

  const result = entity.toObject();
  result.entity = yield expandEntity(result);
  return result;
}

/**
 * remove Notification by id
 * @param userId the current user id
 * @param id the Notification id
 */
function* remove(userId, id) {
  const notification = yield getDBEntity(id);
  if (notification.recipientUserId.toString() !== userId &&
    notification.sourceUserId.toString() !== userId) {
    throw new errors.NotPermittedError('cannot delete notification that not belongs to you!');
  }
  yield notification.remove();
}

/**
 * build the full search query by filter
 * @param filter the user's filter
 * @return {Object}
 */
function* buildDBFilter(filter) {
  let query = helper.buildEqualQuery({}, 'recipientUserId', filter.recipientUserId);
  if (filter.types.length > 0) {
    query.type = { $in: filter.types };
  }
  if (filter.statuses.length > 0) {
    query.status = { $in: filter.statuses };
  }
  query = helper.buildDateRangeQuery(query, 'createdOn', filter.createdOnStart, filter.createdOnEnd);
  return query;
}

/**
 * search Notifications by user's filter
 * user can only search if you are recipientUser or sourceUser
 * @param userId the current user id
 * @param filter the user's filter
 * @return {*}
 */
function* search(userId, filter) {
  checkUserIsRecipientUserOrSourceUser(userId, filter.recipientUserId, null);
  const query = yield buildDBFilter(filter);
  const docs = yield models.Notification.find(query).sort({ createdOn: -1 })
    .skip(filter.offset)
    .limit(filter.limit);
  const result = helper.sanitizeArray(docs);

  for (let i = 0; i < result.length; i += 1) {
    result[i].entity = yield expandEntity(result[i]);
  }
  return result;
}

search.schema = {
  userId: joi.objectId(),
  filter: joi.object().keys({
    recipientUserId: joi.objectId(),
    types: joi.array().items(joiNotificationTypeSchema).default([]),
    statuses: joi.array().items(joiNotificationStatusSchema).default([]),
    createdOnStart: joi.date(),
    createdOnEnd: joi.date(),
    offset: joi.offset(),
    limit: joi.limit(),
  }).required(),
};

/**
 * return the total count that matched.
 * @param userId the current user Id
 * @param filter the user's filter
 * @return {*}
 */
function* getCountByFilter(userId, filter) {
  checkUserIsRecipientUserOrSourceUser(userId, filter.recipientUserId, null);
  return yield models.Notification.find(yield buildDBFilter(filter))
    .skip(filter.offset).limit(filter.limit).count();
}

getCountByFilter.schema = search.schema;

module.exports = {
  create,
  update,
  get,
  remove,
  search,
  getCountByFilter,
  removeUnreadNotifications,
  getDBEntity,
  createBatch,
  generateNotificationsByPostUpdate,
  generateNotificationsByAdmin,
  generateNotificationsByFreezeProvider,
  generateNotifications,
};
