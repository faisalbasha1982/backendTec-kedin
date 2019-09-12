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
const NotificationService = require('./NotificationService');
const FavouriteTechnologyProviderService = require('./FavouriteTechnologyProviderService');
const TechnologyProviderService = require('./TechnologyProviderService');
const UtilityService = require('./UtilityService');
const FileService = require('./FileService');
const config = require('config');
const path = require('path');
const util = require('util');
const mtz = require('moment-timezone');
const _ = require('lodash');

const entitySchema = joi.object().keys({
  _id: joi.objectId(),
  title: joi.string(),
  createdBy: joi.objectId(),
  category: joi.objectId(),
  imagePath: joi.string(),
  content: joi.string(),
  keywords: joi.array().items(joi.string()).default([]),
  status: joi.string().valid(_.values(models.Const.PostStatus)),
  scheduleTime: joi.date(),
  scheduleOption: joi.string().valid(_.values(models.Const.PostScheduleOption)),
  readingTime: joi.number(),
  publishedOn: joi.date(),
  caseStudy: joi.boolean(),
  lessonsLearned: joi.boolean(),
  videoUrl: joi.string().allow(''),
}).required();


function* checkCreateBy(userId, createdBy, errorMessage) {
  if (!createdBy) {
    throw new errors.ArgumentError('createdBy cannot be null');
  }

  const tProvider = yield models.TechnologyProvider.findOne({ _id: createdBy });
  if (tProvider.userId.toString() !== userId) {
    throw new errors.NotPermittedError(errorMessage);
  }
}

/**
 * check schedule status
 * @param entity the content entity
 */
function* checkScheduleStatus(entity) {
  const newStatus = {};
  if (entity.scheduleOption !== models.Const.PostScheduleOption.immediately
    && entity.scheduleTime && entity.scheduleTime > Date.now()) {
    newStatus.status = models.Const.PostStatus.scheduled;
  }
  return _.extend(entity, newStatus);
}

/**
 * update schedule contents
 */
function* updateScheduleContents() {
  yield models.Post.update({ status: models.Const.PostStatus.scheduled,
    scheduleTime: { $lte: Date.now() } },
  { $set: { status: models.Const.PostStatus.published } }, { multi: true });
}

/**
 * checks `lessonsLearned` and `caseStudy` values.
 * If both are true, throws error.
 * Only one of them can be true.
 * @param entity {Object} The Post object to be created
 */
function* checkCheckBoxes(entity) {
  if (entity.lessonsLearned && entity.caseStudy) {
    throw new errors.NotPermittedError('Only one of "caseStudy" and "lessonsLearned" parameters can be checked.');
  }
}

/**
 * create Post
 * @param userId the current user id
 * @param entity the Post entity
 */
function* create(userId, entity) {
  yield checkCreateBy(userId, entity.createdBy, 'createdAt must be yourself TechnologyProvider!');
  yield checkScheduleStatus(entity);
  yield checkCheckBoxes(entity);
  const post = yield models.Post.create(_.extend(entity, { publishedOn: new Date() }));
  post.articleLength = post.content.length;
  const returnedPost = yield get(post.id);
  if (returnedPost.status === models.Const.PostStatus.published) {
    yield NotificationService.generateNotifications(returnedPost);
  }
  return returnedPost;
}

create.schema = {
  userId: joi.objectId(),
  entity: entitySchema,
};


/**
 * update Post by id
 * @param userId the current user id
 * @param id the Post id
 * @param entity the Post entity
 */
function* update(userId, id, entity) {
  if (entity.createdBy) {
    yield checkCreateBy(userId, entity.createdBy, 'cannot update post that not belongs to you!');
  }
  let post = yield getDBEntity(id);
  const originPostStatus = post.status;
  helper.ensureUserIdEqual(userId, post.createdBy.userId.toString(), 'cannot update post that not belongs to you!');

  // if keywords array is empley , skip it
  yield checkScheduleStatus(entity);
  post = _.extend(post, _.omit(entity, entity.keywords.length === 0 ? 'keywords' : ''));
  post.articleLength = post.content.length;
  yield post.save();
  const returnedPost = yield get(id);
  if (post.status === models.Const.PostStatus.published) {
    if (originPostStatus === models.Const.PostStatus.draft) { // convert draft to published
      yield NotificationService.generateNotifications(returnedPost);
    } else {
      yield NotificationService.generateNotificationsByPostUpdate(returnedPost);
    }
  }
  return yield returnedPost;
}

update.schema = {
  userId: joi.objectId(),
  id: joi.objectId(),
  entity: entitySchema,
};

/**
 * get db Post , if not exist , it will raise a not found exception
 * @param id
 * @return {*}
 */
function* getDBEntity(id) {
  const entity = yield models.Post.findOne({
    _id: id,
    status: { $ne: models.Const.PostStatus.deleted }, // skip deleted posts
  }).populate('createdBy').populate('category');
  if (!entity) {
    throw new errors.NotFoundError(`cannot found Post where id = ${id}`);
  }
  return entity;
}

/**
 * get Post
 * @param id the Post id
 */
function* get(id, query) {
  const entity = yield getDBEntity(id);
  if (query && query.action === 'view') {
    entity.viewTimes += 1;
    yield entity.save();
  }
  const result = entity.toObject();
  result.createdBy.categories = yield FavouriteTechnologyProviderService
    .getProviderCategory(entity.createdBy);

  return result;
}

/**
 * remove Post by id
 * @param userId the current user id
 * @param id the Post id
 */
function* remove(userId, id) {
  const user = yield models.User.findOne({ _id: userId });
  const entity = yield getDBEntity(id);
  if (!user || user.type !== models.Const.UserType.admin) {
    helper.ensureUserIdEqual(userId, entity.createdBy.userId.toString(), 'you cannot delete entity that not belongs to you!');
  }
  if (entity.status === models.Const.PostStatus.deleted) {
    throw new errors.ArgumentError('entity already deleted!');
  }
  entity.status = models.Const.PostStatus.deleted;

  yield NotificationService.removeUnreadNotifications(entity.createdBy._id, id, [
    models.Const.NotificationType.newPostByFavouriteProvider,
    models.Const.NotificationType.newPostInFavouriteCategory,
  ]);
  yield entity.save();
}

/**
 * build the full search query by filter
 * @param filter the user's filter
 * @return {Object}
 */
function* buildSearchQuery(filter) {
  const query = helper.buildEqualQuery({}, 'createdBy', filter.technologyProviderId);
  if (filter.categoryIds.length > 0) {
    query.category = { $in: filter.categoryIds };
  }

  if (filter.caseStudy) {
    query.caseStudy = true;
  }

  if (filter.lessonsLearned) {
    query.lessonsLearned = true;
  }

  if (filter.postIds.length > 0) {
    query._id = { $in: filter.postIds };
  }

  if (filter.state || filter.product || filter.service || filter.additionalOffice) {
    let providerQuery;
    providerQuery = helper.buildFuzzingMatchQuery({}, 'productsOffered', filter.product);
    providerQuery = helper.buildFuzzingMatchQuery(providerQuery, 'servicesOffered', filter.service);
    providerQuery = helper.buildFuzzingMatchQuery(providerQuery, 'additionalOffice', filter.additionalOffice);
    if (filter.state) {
      const states = yield models.State.find({ _id: filter.state });
      const statesId = _.map(states, s => s._id.toString());
      providerQuery['address.stateObj'] = { $in: statesId };
    }

    const providers = yield models.TechnologyProvider.find(providerQuery);
    query.createdBy = { $in: _.map(providers, provider => provider._id.toString()) };
  }
  // exclude freezed provider
  const freezedProviders = yield models.TechnologyProvider.find({ freezed: true });
  const excludeProviderIds = _.map(freezedProviders, p => p._id.toString());
  if (query.createdBy) {
    query.createdBy.$nin = excludeProviderIds;
  } else {
    query.createdBy = { $nin: excludeProviderIds };
  }
  if (filter.excludedPostIds.length > 0) {
    if (query._id) {
      query._id.$nin = filter.excludedPostIds;
    } else {
      query._id = { $nin: filter.excludedPostIds };
    }
  }
  if (filter.content && filter.content.length > 0) {
    const value = filter.content;
    const keywords = [];

    // 1. split content
    _.each(value.split('+'), (keyword) => {
      const newSearchKeyword = keyword.trim();
      if (newSearchKeyword.length > 0) {
        keywords.push(new RegExp(newSearchKeyword, 'i'));
      }
    });
    // 2. search provider
    const providers = yield TechnologyProviderService.searchByKeywords(keywords);
    query.$or = [
      { createdBy: { $in: _.map(providers, provider => provider._id.toString()) } },
      { content: { $in: keywords } },
      { title: { $in: keywords } },
      { keywords: { $in: keywords } },
    ];
  }
  if (filter.statuses.length > 0) {
    _.remove(filter.statuses, s => s === models.Const.PostStatus.deleted); // skip delete status
    query.status = { $in: filter.statuses };
  }

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
    sort[filter.sortBy] = filter.sortOrder === 'asc' ? 1 : -1;
  }
  return sort;
}

/**
 * search Post by user's filter
 * @param filter the user's filter
 * @param userId the logged user id
 * @return {*}
 */
function* search(filter, userId) {
  const searchQuery = yield buildSearchQuery(filter);
  yield updateScheduleContents();
  let docs = yield models.Post.find(searchQuery)
    .sort(yield buildSort(filter))
    .populate('createdBy').populate('category');

  docs = helper.sanitizeArray(docs);
  // because of mongo cannot sort by string , so use backend to sort entities
  if (filter.sortBy === 'createdBy') {
    docs = docs.sort((a, b) => (a.createdBy.name.toLowerCase() >= b.createdBy.name.toLowerCase()
      ? 1 : -1));
  }
  if (filter.sortBy === 'title') {
    docs = docs.sort((a, b) => (a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1));
  }
  const result = {
    totalCount: docs.length,
    items: filter.limit === 0 ?
      docs.slice(filter.offset) : docs.slice(filter.offset, filter.offset + filter.limit),
  };
  if (userId && filter.fetchSave) {
    const tUser = yield models.TechnologyUser.findOne({ userId });
    if (tUser) {
      const postIds = _.map(result.items, item => item._id);
      const postSaves = yield models.PostSave.find({ user: tUser._id, post: { $in: postIds } });
      _.each(postSaves, (save) => {
        const post = _.find(result.items, item => item._id.toString() === save.post.toString());
        if (post) {
          post.saved = true;
        }
      });
    }
  }
  return result;
}

const seatchFilterSchema = joi.object().keys({
  technologyProviderId: joi.objectId(),
  categoryIds: joi.array().items(joi.objectId()).default([]),
  postIds: joi.array().items(joi.objectId()).default([]),
  excludedPostIds: joi.array().items(joi.objectId()).default([]),
  content: joi.string(),
  title: joi.string(),
  statuses: joi.array().items(joi.string().valid(_.values(models.Const.PostStatus))).default([]),
  state: joi.string(),
  product: joi.string(),
  additionalOffice: joi.string(),
  service: joi.string(),
  caseStudy: joi.boolean(),
  lessonsLearned: joi.boolean(),
  sortOrder: joi.string().valid(['asc', 'desc']),
  sortBy: joi.string().valid(['articleLength', 'createdAt', 'publishedOn', 'viewTimes', 'readingTime', 'title', 'createdBy']),
  offset: joi.offset(),
  fetchSave: joi.bool(),
  limit: joi.limit(),
}).required();
search.schema = {
  filter: seatchFilterSchema,
  userId: joi.any(),
};


/**
 * get recommended posts by id
 * @param techUserId the current tech user id
 * @param filter the search filter
 * @param userId the user id
 */
function* recommended(techUserId, filter, userId) {
  const postViews = yield models.PostView.find({ user: techUserId });
  const favCategories = yield models.FavouriteCategory.find({ user: techUserId });
  const categoryIds = _.uniq(_.map(favCategories, fc => fc.category.toString()));
  const excludedPostIds = _.uniq(_.map(postViews, pv => pv.post.toString()));
  return yield search(_.extend(filter, { excludedPostIds, categoryIds }), userId);
}

recommended.schema = {
  techUserId: joi.objectId().required(),
  filter: seatchFilterSchema,
  userId: joi.objectId().required(),
};

/**
 * return the total getCountByFilter that matched.
 * @param filter the user's filter
 * @return {*}
 */
function* getCountByFilter(filter) {
  return yield models.Post.find(buildSearchQuery(filter))
    .skip(filter.offset).limit(filter.limit).count();
}

getCountByFilter.schema = search.schema;

/**
 * send post to email address
 * @param id the Post id
 * @param entity the entity that contains email address
 * @return {{id: *}}
 */
function* email(userId, id, entity) {
  const post = yield getDBEntity(id);
  if (post.status !== models.Const.PostStatus.published) {
    throw new errors.ArgumentError(`cannot send post while status = ${post.status}`);
  }
  const tUser = yield models.TechnologyUser.findOne({ userId });
  if (!tUser) {
    throw new errors.ArgumentError('user not exist');
  }
  const userName = `${tUser.firstName} ${tUser.lastName}`;
  const now = mtz.tz('US/Mountain');
  const content = util.format(config.postEmailContent, entity.email, userName,
    post.createdBy.name, post.content, `${entity.host}/content-details_non-logged-in.html?id=${id}`,
    `${now.format('MMMM Do YYYY')} at ${now.format('hh:mm a')} mountain time`);
  yield UtilityService.sendEmail({ subject: post.title, to: entity.email, html: content });
}


email.schema = {
  userId: joi.objectId(),
  id: joi.objectId(),
  entity: joi.object().keys({
    host: joi.string().required(),
    email: joi.array().items(joi.email().required()).required(),
  }).required(),
};


/**
 * upload image and attachment
 * @param userId the current user id
 * @param id the tUser id
 * @param query the request query params
 * @param files the files
 */
function* upload(userId, id, query, files) {
  helper.ensureNotNull('file', files);
  helper.ensureNotNull('file', files.file);
  const file = files.file;

  const entity = yield getDBEntity(id);
  helper.ensureUserIdEqual(userId, entity.createdBy.userId.toString(), 'you cannot upload image to other!');


  helper.ensureDirExist(path.join(config.IMAGES_PATH, 'postFiles'));
  helper.ensureDirExist(path.join(config.IMAGES_PATH, 'postFiles', id));
  const subDir = path.join('postFiles', id);
  const filePath = yield FileService.upload(config.IMAGES_PATH, subDir, file);


  entity[query.type === 'image' ? 'imagePath' : 'attachmentPath'] = path.join(subDir, filePath);

  yield entity.save();
  return yield get(id);
}

upload.schema = {
  userId: joi.objectId(),
  id: joi.objectId(),
  query: joi.object().keys({
    type: joi.string().valid(['image', 'attachment']),
  }),
  files: joi.any(),
};

module.exports = {
  create,
  update,
  get,
  remove,
  search,
  getCountByFilter,
  email,
  getDBEntity,
  upload,
  recommended,
};
