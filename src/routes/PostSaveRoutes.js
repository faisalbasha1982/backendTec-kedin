/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the PostSave Routes
 *
 * @author      TCSCODER
 * @version     1.0
 */

const Auth = require('../common/Auth');

module.exports = {
  '/postSaves': {
    get: {
      controller: 'PostSaveController',
      method: 'search',
      middleware: [Auth()],
    },
    post: {
      controller: 'PostSaveController',
      method: 'create',
      middleware: [Auth()],
    },
  },
  '/postSaves/:id': {
    put: {
      controller: 'PostSaveController',
      method: 'update',
      middleware: [Auth()],
    },
    get: {
      controller: 'PostSaveController',
      method: 'get',
      middleware: [Auth()],
    },
    delete: {
      controller: 'PostSaveController',
      method: 'remove',
      middleware: [Auth()],
    },
  },
  '/count/postSaves': {
    get: {
      controller: 'PostSaveController',
      method: 'getCountByFilter',
      middleware: [Auth()],
    },
  },
};
