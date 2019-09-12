/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the FavouriteTechnologyProvider Service
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
  user: joi.objectId(),
  createdOn: joi.date(),
}).required();


/**
 * create FavouriteTechnologyProvider
 * @param userId the current user id
 * @param entity the FavouriteTechnologyProvider entity
 */
function* create(userId, entity) {
  helper.ensureNotNull('provider', entity.provider);
  helper.ensureNotNull('user', entity.user);
  yield TechnologyProviderService.getDBEntity(entity.provider); // check provider exists
  const tUser = yield TechnologyUserService.get(entity.user);
  helper.ensureUserIdEqual(userId, tUser.userId.toString(), 'technologyUser must be yourself!');

  yield helper.ensureEntityNotExist(models.FavouriteTechnologyProvider,
    { provider: entity.provider, user: entity.user });

  const ft = yield models.FavouriteTechnologyProvider.create(entity);
  return yield get(ft.id);
}

create.schema = {
  userId: joi.objectId(),
  entity: entitySchema,
};


/**
 * update FavouriteTechnologyProvider by id
 * @param userId the current user id
 * @param id the FavouriteTechnologyProvider id
 * @param entity the FavouriteTechnologyProvider entity
 */
function* update(userId, id, entity) {
  let fc = yield getDBEntity(id);
  helper.ensureUserIdEqual(userId, fc.user.userId.toString(),
    'cannot update FavouriteTechnologyProvider that not belongs to you!');
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
 * get db FavouriteTechnologyProvider , if not exist , it will raise a not found exception
 * @param id the FavouriteTechnologyProvider id
 * @return {*}
 */
function* getDBEntity(id) {
  const entity = yield models.FavouriteTechnologyProvider.findOne({
    _id: id,
  }).populate('provider').populate('user');
  if (!entity) {
    throw new errors.NotFoundError(`cannot found FavouriteTechnologyProvider where id = ${id}`);
  }
  return entity;
}

/**
 * get FavouriteTechnologyProvider by id
 * @param id the FavouriteTechnologyProvider id
 */
function* get(id) {
  const entity = yield getDBEntity(id);
  const object = entity.toObject();
  object.categories = yield getProviderCategory(object.provider);
  return object;
}

/**
 * remove FavouriteTechnologyProvider by id
 * @param userId the current user id
 * @param id the FavouriteTechnologyProvider id
 */
function* remove(userId, id) {
  const entity = yield getDBEntity(id);
  helper.ensureUserIdEqual(userId, entity.user.userId.toString(), 'you cannot delete entity that not belongs to you!');
  yield entity.remove();
}


function* getProviderCategory(provider) {
  const posts = yield models.Post.find({
    createdBy: provider._id,
    status: { $ne: models.Const.PostStatus.deleted },
  }).populate('category');

  const categories = _.uniqBy(_.map(posts, p => p.category.toObject()), 'name');
  return categories;
}

/**
 * build the full search query by filter
 * @param filter the user's filter
 * @return {Object}
 */
function* buildDBFilter(filter) {
  let query = helper.buildEqualQuery({}, 'provider', filter.technologyProviderId);


  if (filter.provider) {
    const docs = yield models.TechnologyProvider.find({
      $or: [
        helper.buildFuzzingMatchQuery({}, 'name', filter.provider),
        helper.buildFuzzingMatchQuery({}, 'description', filter.provider)],
    });
    const tProviderIds = _.map(docs, t => t._id);
    query.provider = { $in: tProviderIds };
  }
  query = helper.buildEqualQuery(query, 'user', filter.technologyUserId);
  query = helper.buildDateRangeQuery(query, 'createdOn', filter.createdOnStart, filter.createdOnEnd);
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
    sort[filter.sortBy] = -1;
  }
  return sort;
}

/**
 * search FavouriteTechnologyProviders by user's filter
 * @param filter the user's filter
 * @return {*}
 */
function* search(filter) {
  const query = yield buildDBFilter(filter);
  const docs = yield models.FavouriteTechnologyProvider.find(query).sort(yield buildSort(filter))
    .populate('provider')
    .populate('user');

  let result = helper.sanitizeArray(docs);
  if (filter.sortBy === 'provider') {
    result.sort((a, b) => a.provider.name > b.provider.name);
  }
  const end = filter.limit === 0 ? result.length : (filter.offset + filter.limit);
  result = result.slice(filter.offset, end);
  for (let i = 0; i < result.length; i += 1) {
    result[i].categories = yield getProviderCategory(result[i].provider);
  }
  return result;
}

search.schema = {
  filter: joi.object().keys({
    technologyProviderId: joi.objectId(),
    technologyUserId: joi.objectId(),
    provider: joi.string(), // search by provider name or provider description
    createdOnStart: joi.date(),
    sortBy: joi.string(),
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
  return yield models.FavouriteTechnologyProvider.find(yield buildDBFilter(filter))
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
  getDBEntity,
  getProviderCategory,
};
