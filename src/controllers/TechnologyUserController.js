/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the TechnologyUser Controller
 *
 * @author      TCSCODER
 * @version     1.0
 */

const TechnologyUserService = require('../services/TechnologyUserService');
const excel4node = require('excel4node');
const _ = require('lodash');

/**
 * create TechnologyUser
 * @param req the http request
 * @param res the http response
 */
function* create(req, res) {
  res.json(yield TechnologyUserService.create(req.auth.sub, req.body));
}

/**
 * update TechnologyUser by id
 * @param req the http request
 * @param res the http response
 */
function* update(req, res) {
  res.json(yield TechnologyUserService.update(req.auth.sub, req.params.id, req.body));
}

/**
 * get TechnologyUser by id
 * @param req the http request
 * @param res the http response
 */
function* get(req, res) {
  res.json(yield TechnologyUserService.get(req.params.id));
}

/**
 * remove TechnologyUser by id
 * @param req the http request
 * @param res the http response
 */
function* remove(req, res) {
  res.json(yield TechnologyUserService.remove(req.auth.sub, req.params.id));
}

/**
 * search TechnologyUsers by user's filter
 * @param req the http request
 * @param res the http response
 */
function* search(req, res) {
  res.json(yield TechnologyUserService.search(req.query));
}

/**
 * count TechnologyUsers by user's filter
 * @param req the http request
 * @param res the http response
 */
function* getCountByFilter(req, res) {
  res.json(yield TechnologyUserService.getCountByFilter(req.query));
}

/**
 * get TechnologyUser statistics
 * @param req the http request
 * @param res the http response
 */
function* statistics(req, res) {
  res.setHeader('Cache-Control', 'no-cache, no-store'); // Added no-store
  res.json(yield TechnologyUserService.statistics(req.params.id));
}

/**
 * upload TechnologyUser photo
 * @param req the http request
 * @param res the http response
 */
function* upload(req, res) {
  res.json(yield TechnologyUserService.upload(req.auth.sub, req.params.id, req.files));
}

/**
 * send notification or message to tech. User
 */
function* sendMessage(req, res) {
  res.json(yield TechnologyUserService.sendMessage(req.auth.sub, req.body));
}


/**
 * download Tech. users
 * @param req the http request
 * @param res the http response
 */
function* downloadTechUsers(req, res) {
  const wb = new excel4node.Workbook();
  const ws = wb.addWorksheet('Tech. User', {});
  const headers = ['Email', 'First Name', 'Last Name', 'City', 'State'];
  // Create a reusable style
  const style = wb.createStyle({
    font: {
      color: '#000000',
      size: 12,
    },
  });
  _.each(headers, (header, index) => {
    ws.cell(1, 1 + index).string(header).style(style);
  });
  const tUsers = yield TechnologyUserService.search(req.query);
  let index = 0;
  _.each(tUsers, (user) => {
    ws.cell(2 + index, 1).string(user.user.email).style(style);
    ws.cell(2 + index, 2).string(user.firstName).style(style);
    ws.cell(2 + index, 3).string(user.lastName).style(style);
    ws.cell(2 + index, 4).string(user.city).style(style);
    ws.cell(2 + index, 5).string(user.state ? (user.state.value || 'N/A') : 'N/A').style(style);
    index += 1;
  });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats');
  wb.write('null', res);
}


module.exports = {
  create,
  update,
  get,
  remove,
  search,
  downloadTechUsers,
  getCountByFilter,
  statistics,
  upload,
  sendMessage,
};
