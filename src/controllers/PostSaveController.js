/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the Post save Controller
 *
 * @author      TCSCODER
 * @version     1.0
 */

const PostSaveService = require('../services/PostSaveService');

/**
 * create postSave
 * @param req the http request
 * @param res the http response
 */
function* create(req, res) {
  res.json(yield PostSaveService.create(req.auth.sub, req.body));
}

/**
 * update postSave by id
 * @param req the http request
 * @param res the http response
 */
function* update(req, res) {
  res.json(yield PostSaveService.update(req.auth.sub, req.params.id, req.body));
}

/**
 * get postSave by id
 * @param req the http request
 * @param res the http response
 */
function* get(req, res) {
  res.json(yield PostSaveService.get(req.params.id));
}

/**
 * remove postSave by id
 * @param req the http request
 * @param res the http response
 */
function* remove(req, res) {
  res.json(yield PostSaveService.remove(req.auth.sub, req.params.id));
}

/**
 * search postSaves by user's filter
 * @param req the http request
 * @param res the http response
 */
function* search(req, res) {
  res.json(yield PostSaveService.search(req.query));
}

/**
 * count postSaves by user's filter
 * @param req the http request
 * @param res the http response
 */
function* getCountByFilter(req, res) {
  res.json(yield PostSaveService.getCountByFilter(req.query));
}


module.exports = { create, update, get, remove, search, getCountByFilter };
