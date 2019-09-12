/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the Notification Routes
 *
 * @author      TCSCODER
 * @version     1.0
 */

const Auth = require('../common/Auth');

module.exports = {
  '/notifications': {
    get: {
      controller: 'NotificationController',
      method: 'search',
      middleware: [Auth()],
    },
  },
  '/notifications/:id': {
    put: {
      controller: 'NotificationController',
      method: 'update',
      middleware: [Auth()],
    },
    get: {
      controller: 'NotificationController',
      method: 'get',
      middleware: [Auth()],
    },
    delete: {
      controller: 'NotificationController',
      method: 'remove',
      middleware: [Auth()],
    },
  },
  '/count/notifications': {
    get: {
      controller: 'NotificationController',
      method: 'getCountByFilter',
      middleware: [Auth()],
    },
  },
};
