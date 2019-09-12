/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the InformationRequest Controller
 *
 * @author      TCSCODER
 * @version     1.0
 */

const InformationRequestService = require('../services/InformationRequestService');


/**
 * create InformationRequest
 * @param req the http request
 * @param res the http response
 */
function* create(req, res) {
  res.json(yield InformationRequestService.create(req.auth.sub, req.body));
}

/**
 * update InformationRequest by entity
 * @param req the http request
 * @param res the http response
 */
function* update(req, res) {
  res.json(yield InformationRequestService.update(req.auth.sub, req.params.id, req.body));
}

/**
 * get InformationRequest by id
 * @param req the http request
 * @param res the http response
 */
function* get(req, res) {
  res.json(yield InformationRequestService.get(req.params.id));
}

/**
 * remove InformationRequest by id
 * @param req the http request
 * @param res the http response
 */
function* remove(req, res) {
  res.json(yield InformationRequestService.remove(req.auth.sub, req.params.id));
}

/**
 * search InformationRequest by user's filter
 * @param req the http request
 * @param res the http response
 */
function* search(req, res) {
  res.json(yield InformationRequestService.search(req.query));
}

/**
 * get InformationRequests count by user's filter
 * @param req the http request
 * @param res the http response
 */
function* getCountByFilter(req, res) {
  res.json(yield InformationRequestService.getCountByFilter(req.query));
}


module.exports = { create, update, get, remove, search, getCountByFilter };
