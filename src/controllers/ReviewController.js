/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the Review Controller
 *
 * @author      TCSCODER
 * @version     1.0
 */

const ReviewService = require('../services/ReviewService');

/**
 * create review
 * @param req the http request
 * @param res the http response
 */
function* create(req, res) {
  res.json(yield ReviewService.create(req.auth.sub, req.body));
}

/**
 * update review by id
 * @param req the http request
 * @param res the http response
 */
function* update(req, res) {
  res.json(yield ReviewService.update(req.auth.sub, req.params.id, req.body));
}

/**
 * count Reviews by user's filter
 * @param req the http request
 * @param res the http response
 */
function* get(req, res) {
  res.json(yield ReviewService.get(req.params.id));
}

/**
 * remove review by id
 * @param req the http request
 * @param res the http response
 */
function* remove(req, res) {
  res.json(yield ReviewService.remove(req.auth.sub, req.params.id));
}

/**
 * search Reviews by user's filter
 * @param req the http request
 * @param res the http response
 */
function* search(req, res) {
  res.json(yield ReviewService.search(req.query));
}

/**
 * count Reviews by user's filter
 * @param req the http request
 * @param res the http response
 */
function* getCountByFilter(req, res) {
  res.json(yield ReviewService.getCountByFilter(req.query));
}


module.exports = { create, update, get, remove, search, getCountByFilter };
