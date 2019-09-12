/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the Post Controller
 *
 * @author      TCSCODER
 * @version     1.0
 */

const NotificationService = require('../services/NotificationService');


/**
 * update notification
 * @param req the http request
 * @param res the http response
 */
function* update(req, res) {
  res.json(yield NotificationService.update(req.auth.sub, req.params.id, req.body));
}

/**
 * get notification by id
 * @param req the http request
 * @param res the http response
 */
function* get(req, res) {
  res.json(yield NotificationService.get(req.auth.sub, req.params.id));
}

/**
 * remove notification by id
 * @param req the http request
 * @param res the http response
 */
function* remove(req, res) {
  res.json(yield NotificationService.remove(req.auth.sub, req.params.id));
}

/**
 * search notifications by user's filter
 * @param req the http request
 * @param res the http response
 */
function* search(req, res) {
  res.json(yield NotificationService.search(req.auth.sub, req.query));
}

/**
 * get notifications count by user's filter
 * @param req the http request
 * @param res the http response
 */
function* getCountByFilter(req, res) {
  res.json(yield NotificationService.getCountByFilter(req.auth.sub, req.query));
}


module.exports = { update, get, remove, search, getCountByFilter };
