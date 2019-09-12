/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */
/**
 * the user request controller
 *
 * @author      TCSCODER
 * @version     1.0
 */

const UserRequestService = require('../services/UserRequestService');
const excel4node = require('excel4node');
const _ = require('lodash');

/**
 * user request post
 * @param req the http request
 * @param res the http response
 */
function* create(req, res) {
  res.json(yield UserRequestService.create(req.auth.sub, req.body));
}

/**
 * search request
 * @param req the http request
 * @param res the http response
 */
function* search(req, res) {
  res.json(yield UserRequestService.search(req.query));
}

/**
 * download request
 * @param req the http request
 * @param res the http response
 */
function* download(req, res) {
  const wb = new excel4node.Workbook();
  const ws = wb.addWorksheet('Subscribe', {});
  const headers = ['Name', 'Phone', 'Content', 'Other contact', 'City', 'State'];
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
  const requests = yield UserRequestService.download(req.query);
  let index = 0;
  _.each(requests, (request) => {
    const user = request.user;
    ws.cell(2 + index, 1).string(`${user.firstName} ${user.lastName}`).style(style);
    ws.cell(2 + index, 2).string(request.phone || user.phone).style(style);
    ws.cell(2 + index, 3).string(request.content || 'N/A').style(style);
    ws.cell(2 + index, 4).string(request.other || 'N/A').style(style);
    ws.cell(2 + index, 5).string(user.city || 'N/A').style(style);
    ws.cell(2 + index, 6).string(user.state ? (user.state.value || 'N/A') : 'N/A').style(style);
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
