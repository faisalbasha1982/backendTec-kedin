/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the FavouriteCategory Routes
 *
 * @author      TCSCODER
 * @version     1.0
 */

const Auth = require('../common/Auth');

module.exports = {
  '/favouriteCategories': {
    get: {
      controller: 'FavouriteCategoryController',
      method: 'search',
      middleware: [Auth()],
    },
    post: {
      controller: 'FavouriteCategoryController',
      method: 'create',
      middleware: [Auth()],
    },
    delete: {
      controller: 'FavouriteCategoryController',
      method: 'removeAll',
      middleware: [Auth()],
    },
  },
  '/favouriteCategories/:id': {
    put: {
      controller: 'FavouriteCategoryController',
      method: 'update',
      middleware: [Auth()],
    },
    get: {
      controller: 'FavouriteCategoryController',
      method: 'get',
      middleware: [Auth()],
    },
    delete: {
      controller: 'FavouriteCategoryController',
      method: 'remove',
      middleware: [Auth()],
    },
  },
  '/count/favouriteCategories': {
    get: {
      controller: 'FavouriteCategoryController',
      method: 'getCountByFilter',
      middleware: [Auth()],
    },
  },
};
