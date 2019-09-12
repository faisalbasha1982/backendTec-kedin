/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the LinkResource Controller
 *
 * @author      TCSCODER
 * @version     1.0
 */

const LinkResourceService = require('../services/LinkResourceService');

/**
 * create LinkResource
 * @param req the http request
 * @param res the http response
 */
function* create(req, res) {
  res.json(yield LinkResourceService.create(req.body));
}

/**
 * update LinkResource by entity
 * @param req the http request
 * @param res the http response
 */
function* update(req, res) {
  res.json(yield LinkResourceService.update(req.params.id, req.body));
}

/**
 * remove LinkResource by id
 * @param req the http request
 * @param res the http response
 */
function* remove(req, res) {
  res.json(yield LinkResourceService.remove(req.params.id));
}

/**
 * search LinkResource by user's filter
 * @param req the http request
 * @param res the http response
 */
function* search(req, res) {
  res.json(yield LinkResourceService.search(req.query));
}

module.exports = { create, update, remove, search };
