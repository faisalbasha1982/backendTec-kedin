/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the Subscribe Routes
 *
 * @author      TCSCODER
 * @version     1.0
 */

const Auth = require('../common/Auth');

module.exports = {
  '/userRequests': {
    get: {
      controller: 'UserRequestController',
      method: 'search',
      middleware: [Auth()],
    },
    post: {
      controller: 'UserRequestController',
      method: 'create',
      middleware: [Auth()],
    },
  },

  '/userRequests/download': {
    get: {
      controller: 'UserRequestController',
      method: 'download',
      middleware: [Auth()],
    },
  },
};
