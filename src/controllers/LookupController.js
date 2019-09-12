/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the Lookup Controller
 *
 * @author      TCSCODER
 * @version     1.0
 */

const LookupService = require('../services/LookupService');

/**
 * get all countries
 * @param req the http request
 * @param res the http response
 */
function* getAllCountries(req, res) {
  res.json(yield LookupService.getAllCountries(req.query));
}

/**
 * get all faq items
 * @param req the http request
 * @param res the http response
 */
function* getAllFAQItems(req, res) {
  res.json(yield LookupService.getAllFAQItems(req.query));
}

/**
 * get all categories
 * @param req the http request
 * @param res the http response
 */
function* getAllCategories(req, res) {
  res.json(yield LookupService.getAllCategories(req.query));
}


/**
 * get all states
 * @param req the http request
 * @param res the http response
 */
function* getAllStates(req, res) {
  res.json(yield LookupService.getAllStates(req.query));
}

/**
 *
 */
function* getAppStatistics(req, res) {
  res.json(yield LookupService.getAppStatistics());
}

module.exports = { getAllCategories,
  getAllCountries,
  getAllFAQItems,
  getAllStates,
  getAppStatistics };
