/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the FavouriteCategory Controller
 *
 * @author      TCSCODER
 * @version     1.0
 */

const FavouriteCategoryService = require('../services/FavouriteCategoryService');

/**
 * create  FavouriteCategory
 * @param req the http request
 * @param res the http response
 */
function* create(req, res) {
  res.json(yield FavouriteCategoryService.create(req.auth.sub, req.body));
}

/**
 * update  FavouriteCategory
 * @param req the http request
 * @param res the http response
 */
function* update(req, res) {
  res.json(yield FavouriteCategoryService.update(req.auth.sub, req.params.id, req.body));
}

/**
 * get  FavouriteCategory by id
 * @param req the http request
 * @param res the http response
 */
function* get(req, res) {
  res.json(yield FavouriteCategoryService.get(req.params.id));
}

/**
 * remove  FavouriteCategory by id
 * @param req the http request
 * @param res the http response
 */
function* remove(req, res) {
  res.json(yield FavouriteCategoryService.remove(req.auth.sub, req.params.id));
}

/**
 * search  FavouriteCategories by user's filter
 * @param req the http request
 * @param res the http response
 */
function* search(req, res) {
  res.json(yield FavouriteCategoryService.search(req.query));
}

/**
 * get  FavouriteCategories count by user's filter
 * @param req the http request
 * @param res the http response
 */
function* getCountByFilter(req, res) {
  res.json(yield FavouriteCategoryService.getCountByFilter(req.query));
}

/**
 * remove all  FavouriteCategories by user
 * @param req the http request
 * @param res the http response
 */
function* removeAll(req, res) {
  res.json(yield FavouriteCategoryService.removeAll(req.query.userId) || {});
}


module.exports = { create, update, get, remove, search, getCountByFilter, removeAll };
