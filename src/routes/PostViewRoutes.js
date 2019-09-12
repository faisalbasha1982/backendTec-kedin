/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the PostView Routes
 *
 * @author      TCSCODER
 * @version     1.0
 */

const Auth = require('../common/Auth');

module.exports = {
  '/postViews': {
    get: {
      controller: 'PostViewController',
      method: 'search',
      middleware: [Auth()],
    },
    post: {
      controller: 'PostViewController',
      method: 'create',
      middleware: [Auth()],
    },
  },
  '/postViews/:id': {
    get: {
      controller: 'PostViewController',
      method: 'get',
      middleware: [Auth()],
    },
  },
  '/count/postViews': {
    get: {
      controller: 'PostViewController',
      method: 'getCountByFilter',
      middleware: [Auth()],
    },
  },
};
