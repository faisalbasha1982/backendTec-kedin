/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */
/**
 * the Post Controller
 *
 * @author      TCSCODER
 * @version     1.0
 */

const PostService = require('../services/PostService');
const Auth = require('../common/Auth');
const co = require('co');

/**
 * create post
 * @param req the http request
 * @param res the http response
 */
function* create(req, res) {
  res.json(yield PostService.create(req.auth.sub, req.body));
}

/**
 * update post by id and entity
 * @param req the http request
 * @param res the http response
 */
function* update(req, res) {
  res.json(yield PostService.update(req.auth.sub, req.params.id, req.body));
}

/**
 * get post by id
 * @param req the http request
 * @param res the http response
 */
function* get(req, res) {
  res.json(yield PostService.get(req.params.id, req.query));
}

/**
 * remove post by id
 * @param req the http request
 * @param res the http response
 */
function* remove(req, res) {
  res.json(yield PostService.remove(req.auth.sub, req.params.id));
}

/**
 * get posts count by user's filter
 * @param req the http request
 * @param res the http response
 */
function* search(req, res, next) {
  Auth()(req, res, () => {
    co.wrap(function* generate() {
      const userId = req.auth ? req.auth.sub : null;
      res.json(yield PostService.search(req.query, userId));
    })().catch((err) => {
      next(err);
    });
  });
}

/**
 * get posts count by user's filter
 * @param req the http request
 * @param res the http response
 */
function* getCountByFilter(req, res) {
  res.json(yield PostService.getCountByFilter(req.query));
}

/**
 * get posts count by user's filter
 * @param req the http request
 * @param res the http response
 */
function* email(req, res) {
  res.json(yield PostService.email(req.auth.sub, req.params.id, req.query));
}

/**
 * upload post image
 * @param req the http request
 * @param res the http response
 */
function* upload(req, res) {
  res.json(yield PostService.upload(req.auth.sub, req.params.id, req.query, req.files));
}

/**
 * get recommended posts
 * @param req the http request
 * @param res the http response
 */
function* recommended(req, res) {
  res.json(yield PostService.recommended(req.params.techUserId, req.query, req.auth.sub));
}

module.exports = {
  create,
  update,
  get,
  remove,
  search,
  getCountByFilter,
  email,
  upload,
  recommended,
};
