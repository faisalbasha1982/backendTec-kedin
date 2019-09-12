/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the InformationRequest Routes
 *
 * @author      TCSCODER
 * @version     1.0
 */

const Auth = require('../common/Auth');

module.exports = {
  '/informationRequests': {
    get: {
      controller: 'InformationRequestController',
      method: 'search',
      middleware: [Auth()],
    },
    post: {
      controller: 'InformationRequestController',
      method: 'create',
      middleware: [Auth()],
    },
  },
  '/informationRequests/:id': {
    put: {
      controller: 'InformationRequestController',
      method: 'update',
      middleware: [Auth()],
    },
    get: {
      controller: 'InformationRequestController',
      method: 'get',
      middleware: [Auth()],
    },
    delete: {
      controller: 'InformationRequestController',
      method: 'remove',
      middleware: [Auth()],
    },
  },
  '/count/informationRequests': {
    get: {
      controller: 'InformationRequestController',
      method: 'getCountByFilter',
      middleware: [Auth()],
    },
  },
};
