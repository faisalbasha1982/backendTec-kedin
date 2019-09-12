/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the Lookup Service
 *
 * @author      TCSCODER
 * @version     1.0
 */


const _ = require('lodash');
const joi = require('joi');
const helper = require('../common/helper');
const models = require('../models');

const joiLookupSchema = {
  filter: joi.object().keys({
    offset: joi.offset(),
    limit: joi.limit(),
  }).required(),
};

/**
 * get all countries
 * @param filter the user's filter
 */
function* getAllCountries(filter) {
  return helper.sanitizeArray(yield models.Country.find().skip(filter.offset).limit(filter.limit));
}

getAllCountries.schema = joiLookupSchema;

/**
 * get all FAQItems
 * @param filter the user's filter
 */
function* getAllFAQItems(filter) {
  const query = {};
  if (filter.types) {
    query.type = { $in: filter.types };
  }
  if (filter.keyword) {
    query.$or = [helper.buildFuzzingMatchQuery({}, 'question', filter.keyword),
      helper.buildFuzzingMatchQuery({}, 'answer', filter.keyword)];
  }
  return helper.sanitizeArray(yield models.FAQItem
    .find(query)
    .skip(filter.offset).limit(filter.limit));
}

getAllFAQItems.schema = {
  filter: joi.object().keys({
    offset: joi.offset(),
    limit: joi.limit(),
    types: joi.array().items(joi.string().valid(_.values(models.Const.UserType))),
    keyword: joi.string(),
  }).required(),
};

/**
 * get all categories
 * @param filter the user's filter
 */
function* getAllCategories(filter) {
  return helper.sanitizeArray(yield models.Category.find()
    .sort({ name: 1 }).skip(filter.offset).limit(filter.limit));
}

getAllCategories.schema = joiLookupSchema;


/**
 * get all categories
 * @param filter the user's filter
 */
function* getAllStates(filter) {
  const usa = yield models.Country.findOne({ value: 'United States' });
  const states = yield models.State.find().sort({ value: 1 })
    .skip(filter.offset).limit(filter.limit);
  if (!usa) {
    return helper.sanitizeArray(states);
  }
  const usaArr = [];
  const otherArr = [];
  _.each(states, (sa) => {
    if (sa.country.toString() === usa._id.toString()) {
      usaArr.push(sa);
    } else {
      otherArr.push(sa);
    }
  });
  usaArr.sort((sa, sb) => (sa.value > sb.value ? 1 : -1));
  otherArr.sort((sa, sb) => (sa.value > sb.value ? 1 : -1));
  return helper.sanitizeArray(usaArr.concat(otherArr));
}
getAllStates.schema = joiLookupSchema;

/**
 * get app statistics
 */
function* getAppStatistics() {
  return {
    totalProvider: yield models.TechnologyProvider.count({}),
    totalPost: yield models.Post.count({ status: models.Const.PostStatus.published }),
    totalUser: yield models.TechnologyUser.count({}),
  };
}

module.exports = { getAllCategories,
  getAllCountries,
  getAllFAQItems,
  getAllStates,
  getAppStatistics };
