/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the User Routes
 *
 * @author      TCSCODER
 * @version     1.0
 */

const Auth = require('../common/Auth');

module.exports = {
  '/login': {
    post: {
      controller: 'UserController',
      method: 'login',
    },
  },
  '/sendVerificationEmail': {
    post: {
      controller: 'UserController',
      method: 'sendVerificationEmail',
    },
  },
  '/sendEmail': {
    post: {
      controller: 'UserController',
      method: 'sendEmail',
      middleware: [Auth()],
    },
  },
  '/logout': {
    post: {
      controller: 'UserController',
      method: 'logout',
      middleware: [Auth()],
    },
  },

  '/initiateForgotPassword': {
    post: {
      controller: 'UserController',
      method: 'initiateForgotPassword',
    },
  },
  '/changeForgotPassword': {
    post: {
      controller: 'UserController',
      method: 'changeForgotPassword',
    },
  },
  '/verifyEmail': {
    get: {
      controller: 'UserController',
      method: 'verifyEmail',
    },
  },
  '/signup': {
    post: {
      controller: 'UserController',
      method: 'create',
    },
  },
  '/users': {
    get: {
      controller: 'UserController',
      method: 'search',
      middleware: [Auth()],
    },
  },
  '/users/:id': {
    get: {
      controller: 'UserController',
      method: 'get',
      middleware: [Auth()],
    },
    put: {
      controller: 'UserController',
      method: 'update',
      middleware: [Auth()],
    },
  },
  '/count/users': {
    get: {
      controller: 'UserController',
      method: 'getCountByFilter',
      middleware: [Auth()],
    },
  },
  '/currentUser': {
    get: {
      controller: 'UserController',
      method: 'getCurrent',
      middleware: [Auth()],
    },
  },
  '/updatePassword': {
    put: {
      controller: 'UserController',
      method: 'updatePassword',
      middleware: [Auth()],
    },
  },
  '/users/:id/verify': {
    patch: {
      controller: 'UserController',
      method: 'verifyUserManually',
      middleware: [Auth()],
    },
  },
};
