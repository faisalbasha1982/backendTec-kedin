/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the PostView Controller
 *
 * @author      TCSCODER
 * @version     1.0
 */

const PostViewService = require('../services/PostViewService');

/**
 * create postView
 * @param req the http request
 * @param res the http response
 */
function* create(req, res) {
  res.json(yield PostViewService.create(req.auth.sub, req.body));
}

/**
 * get postView by id
 * @param req the http request
 * @param res the http response
 */
function* get(req, res) {
  res.json(yield PostViewService.get(req.params.id));
}

/**
 * search postViews by user's filter
 * @param req the http request
 * @param res the http response
 */
function* search(req, res) {
  res.json(yield PostViewService.search(req.query));
}

/**
 * count postViews by user's filter
 * @param req the http request
 * @param res the http response
 */
function* getCountByFilter(req, res) {
  res.json(yield PostViewService.getCountByFilter(req.query));
}


module.exports = { create, get, search, getCountByFilter };
