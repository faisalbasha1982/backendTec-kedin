/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the TechnologyProvider Controller
 *
 * @author      TCSCODER
 * @version     1.0
 */

const TechnologyProviderService = require('../services/TechnologyProviderService');

/**
 * create TechnologyProvider
 * @param req the http request
 * @param res the http response
 */
function* create(req, res) {
  res.json(yield TechnologyProviderService.create(req.auth.sub, req.body));
}

/**
 * update TechnologyProvider by id and entity
 * @param req the http request
 * @param res the http response
 */
function* update(req, res) {
  res.json(yield TechnologyProviderService.update(req.auth.sub, req.params.id, req.body));
}

/**
 * get TechnologyProvider by id
 * @param req the http request
 * @param res the http response
 */
function* get(req, res) {
  res.json(yield TechnologyProviderService.get(req.params.id));
}

/**
 * remove TechnologyProviders by id
 * @param req the http request
 * @param res the http response
 */
function* remove(req, res) {
  res.json(yield TechnologyProviderService.remove(req.auth.sub, req.params.id));
}

/**
 * search TechnologyProviders by user's filter
 * @param req the http request
 * @param res the http response
 */
function* search(req, res) {
  res.json(yield TechnologyProviderService.search(req.query));
}

/**
 * count TechnologyProviders by user's filter
 * @param req the http request
 * @param res the http response
 */
function* getCountByFilter(req, res) {
  res.json(yield TechnologyProviderService.getCountByFilter(req.query));
}

/**
 * get TechnologyProvider statistics
 * @param req the http request
 * @param res the http response
 */
function* statistics(req, res) {
  res.setHeader('Cache-Control', 'no-cache, no-store'); // Added no-store
  res.json(yield TechnologyProviderService.statistics(req.params.id));
}

/**
 * upload TechnologyProviders photo
 * @param req the http request
 * @param res the http response
 */
function* upload(req, res) {
  res.json(yield TechnologyProviderService.upload(req.auth.sub, req.params.id, req.files));
}

/**
 * on TechnologyProvider website click
 * @param req the http request
 * @param res the http response
 */
function* onWebsiteClick(req, res) {
  res.json(yield TechnologyProviderService.onWebsiteClick(req.params.id));
}

module.exports = { create,
  update,
  get,
  remove,
  search,
  getCountByFilter,
  upload,
  statistics,
  onWebsiteClick,
};
