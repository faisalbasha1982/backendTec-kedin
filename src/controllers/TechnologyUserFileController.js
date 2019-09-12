/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the TechnologyUserFile Controller
 *
 * @author      TCSCODER
 * @version     1.0
 */

const TechnologyUserFileService = require('../services/TechnologyUserFileService');


/**
 * create TechnologyUserFile
 * @param req the http request
 * @param res the http response
 */
function* create(req, res) {
  res.json(yield TechnologyUserFileService.create(req.auth.sub, req.body));
}

/**
 * get TechnologyUserFile by id
 * @param req the http request
 * @param res the http response
 */
function* get(req, res) {
  res.json(yield TechnologyUserFileService.get(req.params.id));
}

/**
 * remove TechnologyUserFile by id
 * @param req the http request
 * @param res the http response
 */
function* remove(req, res) {
  res.json(yield TechnologyUserFileService.remove(req.auth.sub, req.params.id));
}

/**
 * search TechnologyUserFiles by user's filter
 * @param req the http request
 * @param res the http response
 */
function* search(req, res) {
  res.json(yield TechnologyUserFileService.search(req.query));
}

/**
 * count TechnologyUserFiles by user's filter
 * @param req the http request
 * @param res the http response
 */
function* getCountByFilter(req, res) {
  res.json(yield TechnologyUserFileService.getCountByFilter(req.query));
}

/**
 * upload TechnologyUser File
 * @param req the http request
 * @param res the http response
 */
function* upload(req, res) {
  res.json(yield TechnologyUserFileService.upload(req.auth.sub, req.params.id, req.files));
}

module.exports = { create, get, remove, search, getCountByFilter, upload };
