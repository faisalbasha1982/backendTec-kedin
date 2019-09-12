/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the InformationRequest Routes
 *
 * @author      TCSCODER
 * @version     1.0
 */

const Auth = require('../common/Auth');

module.exports = {
  '/linkResources': {
    get: {
      controller: 'LinkResourceController',
      method: 'search',
    },
    post: {
      controller: 'LinkResourceController',
      method: 'create',
      middleware: [Auth()],
    },
  },
  '/linkResources/:id': {
    put: {
      controller: 'LinkResourceController',
      method: 'update',
      middleware: [Auth()],
    },
    delete: {
      controller: 'LinkResourceController',
      method: 'remove',
      middleware: [Auth()],
    },
  },
};
