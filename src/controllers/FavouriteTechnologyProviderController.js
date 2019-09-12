/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the FavouriteTechnologyProvider Controller
 *
 * @author      TCSCODER
 * @version     1.0
 */

const FavouriteTechnologyProviderService = require('../services/FavouriteTechnologyProviderService');

/**
 * create  FavouriteTechnologyProvider
 * @param req the http request
 * @param res the http response
 */
function* create(req, res) {
  res.json(yield FavouriteTechnologyProviderService.create(req.auth.sub, req.body));
}

/**
 * update  FavouriteTechnologyProvider
 * @param req the http request
 * @param res the http response
 */
function* update(req, res) {
  res.json(yield FavouriteTechnologyProviderService.update(req.auth.sub, req.params.id, req.body));
}

/**
 * get  FavouriteTechnologyProvider by id
 * @param req the http request
 * @param res the http response
 */
function* get(req, res) {
  res.json(yield FavouriteTechnologyProviderService.get(req.params.id));
}

/**
 * remove  FavouriteTechnologyProvider by id
 * @param req the http request
 * @param res the http response
 */
function* remove(req, res) {
  res.json(yield FavouriteTechnologyProviderService.remove(req.auth.sub, req.params.id));
}

/**
 * search  FavouriteTechnologyProviders by user's filter
 * @param req the http request
 * @param res the http response
 */
function* search(req, res) {
  res.json(yield FavouriteTechnologyProviderService.search(req.query));
}

/**
 * get  FavouriteTechnologyProviders count by user's filter
 * @param req the http request
 * @param res the http response
 */
function* getCountByFilter(req, res) {
  res.json(yield FavouriteTechnologyProviderService.getCountByFilter(req.query));
}


module.exports = { create, update, get, remove, search, getCountByFilter };
