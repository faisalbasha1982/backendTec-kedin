/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the TechnologyProvider Routes
 *
 * @author      TCSCODER
 * @version     1.0
 */

const Auth = require('../common/Auth');

module.exports = {
  '/technologyProviders': {
    get: {
      controller: 'TechnologyProviderController',
      method: 'search',
      middleware: [Auth()],
    },
    post: {
      controller: 'TechnologyProviderController',
      method: 'create',
      middleware: [Auth()],
    },
  },
  '/technologyProviders/:id': {
    put: {
      controller: 'TechnologyProviderController',
      method: 'update',
      middleware: [Auth()],
    },
    get: {
      controller: 'TechnologyProviderController',
      method: 'get',
      middleware: [Auth()],
    },
    delete: {
      controller: 'TechnologyProviderController',
      method: 'remove',
      middleware: [Auth()],
    },
  },
  '/technologyProviders/:id/statistics': {
    get: {
      controller: 'TechnologyProviderController',
      method: 'statistics',
      middleware: [Auth()],
    },
  },
  '/technologyProviders/:id/onWebsiteClick': {
    post: {
      controller: 'TechnologyProviderController',
      method: 'onWebsiteClick',
      middleware: [Auth()],
    },
  },

  '/technologyProviders/:id/upload': {
    post: {
      controller: 'TechnologyProviderController',
      method: 'upload',
      middleware: [Auth()],
    },
  },
  '/count/technologyProviders': {
    get: {
      controller: 'TechnologyProviderController',
      method: 'getCountByFilter',
      middleware: [Auth()],
    },
  },
};
