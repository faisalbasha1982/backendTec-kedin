/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the Review Routes
 *
 * @author      TCSCODER
 * @version     1.0
 */

const Auth = require('../common/Auth');

module.exports = {
  '/reviews': {
    get: {
      controller: 'ReviewController',
      method: 'search',
      middleware: [Auth()],
    },
    post: {
      controller: 'ReviewController',
      method: 'create',
      middleware: [Auth()],
    },
  },
  '/reviews/:id': {
    put: {
      controller: 'ReviewController',
      method: 'update',
      middleware: [Auth()],
    },
    get: {
      controller: 'ReviewController',
      method: 'get',
      middleware: [Auth()],
    },
    delete: {
      controller: 'ReviewController',
      method: 'remove',
      middleware: [Auth()],
    },
  },
  '/count/reviews': {
    get: {
      controller: 'ReviewController',
      method: 'getCountByFilter',
      middleware: [Auth()],
    },
  },
};
