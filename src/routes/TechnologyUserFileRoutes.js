/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the TechnologyUserFile Routes
 *
 * @author      TCSCODER
 * @version     1.0
 */

const Auth = require('../common/Auth');

module.exports = {
  '/technologyUserFiles': {
    get: {
      controller: 'TechnologyUserFileController',
      method: 'search',
      middleware: [Auth()],
    },
    post: {
      controller: 'TechnologyUserFileController',
      method: 'create',
      middleware: [Auth()],
    },
  },
  '/technologyUserFiles/:id': {
    get: {
      controller: 'TechnologyUserFileController',
      method: 'get',
      middleware: [Auth()],
    },
    delete: {
      controller: 'TechnologyUserFileController',
      method: 'remove',
      middleware: [Auth()],
    },
  },
  '/technologyUserFiles/:id/upload': {
    post: {
      controller: 'TechnologyUserFileController',
      method: 'upload',
      middleware: [Auth()],
    },
  },
  '/count/technologyUserFiles': {
    get: {
      controller: 'TechnologyUserFileController',
      method: 'getCountByFilter',
      middleware: [Auth()],
    },
  },
};
