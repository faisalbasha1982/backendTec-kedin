/**
 * Copyright (c) 2017 Topcoder Inc, All rights reserved.
 */


/**
 * The production configuration file.
 *
 * @author      JiangLiwu
 * @version     1.0
 */

module.exports = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  db: {
    url: process.env.MONGOLAB_URI || 'mongodb://localhost:27017/TECKEDIN_PROD',
    poolSize: 10,
  },
};
