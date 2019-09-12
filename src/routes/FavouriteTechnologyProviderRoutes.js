/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the FavouriteTechnologyProvider Routes
 *
 * @author      TCSCODER
 * @version     1.0
 */

const Auth = require('../common/Auth');

module.exports = {
  '/favouriteTechnologyProviders': {
    get: {
      controller: 'FavouriteTechnologyProviderController',
      method: 'search',
      middleware: [Auth()],
    },
    post: {
      controller: 'FavouriteTechnologyProviderController',
      method: 'create',
      middleware: [Auth()],
    },
  },
  '/favouriteTechnologyProviders/:id': {
    put: {
      controller: 'FavouriteTechnologyProviderController',
      method: 'update',
      middleware: [Auth()],
    },
    get: {
      controller: 'FavouriteTechnologyProviderController',
      method: 'get',
      middleware: [Auth()],
    },
    delete: {
      controller: 'FavouriteTechnologyProviderController',
      method: 'remove',
      middleware: [Auth()],
    },
  },
  '/count/favouriteTechnologyProviders': {
    get: {
      controller: 'FavouriteTechnologyProviderController',
      method: 'getCountByFilter',
      middleware: [Auth()],
    },
  },
};
