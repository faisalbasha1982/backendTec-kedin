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
  '/subscribes': {
    get: {
      controller: 'SubscribeController',
      method: 'search',
      middleware: [Auth()],
    },
    post: {
      controller: 'SubscribeController',
      method: 'create',
      middleware: [Auth()],
    },
  },

  '/subscribes/download': {
    get: {
      controller: 'SubscribeController',
      method: 'download',
      middleware: [Auth()],
    },
  },
};
