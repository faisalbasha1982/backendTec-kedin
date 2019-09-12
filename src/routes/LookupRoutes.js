/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the Lookup Routes
 *
 * @author      TCSCODER
 * @version     1.0
 */


module.exports = {
  '/faqItems': {
    get: {
      controller: 'LookupController',
      method: 'getAllFAQItems',
    },
  },
  '/countries': {
    get: {
      controller: 'LookupController',
      method: 'getAllCountries',
    },
  },
  '/states': {
    get: {
      controller: 'LookupController',
      method: 'getAllStates',
    },
  },
  '/categories': {
    get: {
      controller: 'LookupController',
      method: 'getAllCategories',
    },
  },
  '/statistics': {
    get: {
      controller: 'LookupController',
      method: 'getAppStatistics',
    },
  },
};
