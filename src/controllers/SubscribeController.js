/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the subscribe controller
 *
 * @author      TCSCODER
 * @version     1.0
 */

const SubscribeService = require('../services/SubscribeService');
const excel4node = require('excel4node');
const _ = require('lodash');

/**
 * user subscribe post
 * @param req the http request
 * @param res the http response
 */
function* create(req, res) {
  res.json(yield SubscribeService.create(req.auth.sub, req.body));
}

/**
 * search subscribes
 * @param req the http request
 * @param res the http response
 */
function* search(req, res) {
  res.json(yield SubscribeService.search(req.query));
}

/**
 * download subscribes
 * @param req the http request
 * @param res the http response
 */
function* download(req, res) {
  const wb = new excel4node.Workbook();
  const ws = wb.addWorksheet('Subscribe', {});
  const headers = ['Subscriber Name', 'Subscriber Email', 'City', 'State'];
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

  const users = yield SubscribeService.download(req.auth.sub, req.query);
  let index = 0;
  _.each(users, (user) => {
    ws.cell(2 + index, 1).string(`${user.firstName} ${user.lastName}`).style(style);
    ws.cell(2 + index, 2).string(user.baseUser.email).style(style);
    ws.cell(2 + index, 3).string(user.city || 'N/A').style(style);
    ws.cell(2 + index, 4).string(user.state ? (user.state.value || 'N/A') : 'N/A').style(style);
    index += 1;
  });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats');
  wb.write('null', res);
}

module.exports = {
  create,
  search,
  download,
};
