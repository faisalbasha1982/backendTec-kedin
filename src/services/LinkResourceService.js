/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the LinkResource Service
 *
 * @author      TCSCODER
 * @version     1.0
 */

const joi = require('joi');
const errors = require('common-errors');
const models = require('../models');
const helper = require('../common/helper');
const _ = require('lodash');

const entitySchema = joi.object().keys({
  _id: joi.objectId(),
  link: joi.string(),
  title: joi.string(),
  description: joi.string(),
  logoPath: joi.string(),
  type: joi.string(),
  belongsTo: joi.string(),
  createdOn: joi.date(),
  updatedOn: joi.date(),
}).required();

/**
 * create LinkResource
 * @param entity the LinkResource entity
 */
function* create(entity) {
  const fc = yield models.LinkResource.create(entity);
  return yield getDBEntity(fc.id);
}

create.schema = {
  entity: entitySchema,
};

/**
 * update LinkResource by id
 * @param id the LinkResource id
 * @param entity the LinkResource entity
 */
function* update(id, entity) {
  let fc = yield getDBEntity(id);
  fc = _.extend(fc, entity);
  yield fc.save();
  return fc;
}

update.schema = {
  id: joi.objectId(),
  entity: entitySchema,
};

/**
 * get db LinkResource , if not exist , it will raise a not found exception
 * @param id the LinkResource id
 * @return {*}
 */
function* getDBEntity(id) {
  const entity = yield models.LinkResource.findOne({
    _id: id,
  });
  if (!entity) {
    throw new errors.NotFoundError(`cannot found LinkResource where id = ${id}`);
  }
  return entity;
}

/**
 * remove LinkResource by id
 * @param id the FavouriteCategory id
 */
function* remove(id) {
  const entity = yield getDBEntity(id);
  yield entity.remove();
}

/**
 * build the full search query by filter
 * @param filter the user's filter
 * @return {Object}
 */
function* buildDBFilter(filter) {
  const query = {};
  if (filter.content) {
    query.$or = [
      { title: { $regex: filter.content, $options: 'i' } },
      { description: { $regex: filter.content, $options: 'i' } },
      { link: { $regex: filter.content, $options: 'i' } },
    ];
  }
  if (filter.type) {
    query.type = { $in: [filter.type, 'both'] };
  }
  if (filter.belongsTo) {
    query.belongsTo = filter.belongsTo;
  }
  return query;
}

/**
 * search LinkResource by user's filter
 * @param filter the user's filter
 * @return {*}
 */
function* search(filter) {
  const query = yield buildDBFilter(filter);
  let docs = yield models.LinkResource.find(query);
  docs = helper.sanitizeArray(docs);
  if (filter.sortBy === 'title') {
    docs = docs.sort((a, b) => (a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1));
  } else if (filter.sortBy === 'date') {
    docs = docs.sort((a, b) => (a.createdOn > b.createdOn ? -1 : 1));
  }
  return filter.limit === 0 ?
    docs.slice(filter.offset) : docs.slice(filter.offset, filter.offset + filter.limit);
}

search.schema = {
  filter: joi.object().keys({
    content: joi.string(),
    sortBy: joi.string(),
    offset: joi.offset(),
    belongsTo: joi.string(),
    type: joi.string(),
    limit: joi.limit(),
  }).options({ stripUnknown: true }).required(),
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

module.exports = { create, update, remove, search, getDBEntity };
