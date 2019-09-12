/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the TechnologyUser Routes
 *
 * @author      TCSCODER
 * @version     1.0
 */

const Auth = require('../common/Auth');

module.exports = {
  '/technologyUsers': {
    get: {
      controller: 'TechnologyUserController',
      method: 'search',
      middleware: [Auth()],
    },
    post: {
      controller: 'TechnologyUserController',
      method: 'create',
      middleware: [Auth()],
    },
  },
  '/technologyUsers/download': {
    get: {
      controller: 'TechnologyUserController',
      method: 'downloadTechUsers',
      middleware: [Auth()],
    },
  },
  '/technologyUsers/:id': {
    put: {
      controller: 'TechnologyUserController',
      method: 'update',
      middleware: [Auth()],
    },
    get: {
      controller: 'TechnologyUserController',
      method: 'get',
      middleware: [Auth()],
    },
    delete: {
      controller: 'TechnologyUserController',
      method: 'remove',
      middleware: [Auth()],
    },
  },
  '/technologyUsers/:id/statistics': {
    get: {
      controller: 'TechnologyUserController',
      method: 'statistics',
      middleware: [Auth()],
    },
  },
  '/technologyUsers/:id/upload': {
    post: {
      controller: 'TechnologyUserController',
      method: 'upload',
      middleware: [Auth()],
    },
  },
  '/technologyUsers/messages': {
    post: {
      controller: 'TechnologyUserController',
      method: 'sendMessage',
      middleware: [Auth()],
    },
  },
  '/count/technologyUsers': {
    get: {
      controller: 'TechnologyUserController',
      method: 'getCountByFilter',
      middleware: [Auth()],
    },
  },
};
