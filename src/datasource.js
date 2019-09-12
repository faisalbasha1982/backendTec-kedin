/**
 * Copyright (C) 2017 Topcoder Inc., All Rights Reserved.
 */


/**
 * Init mongo datasource
 *
 * @author      TSCODER
 * @version     1.0
 */

// The mongoose instance.
const mongoose = require('mongoose');

// use bluebird promise library instead of mongoose default promise library
mongoose.Promise = global.Promise;

// The database mapping.
const dbs = { };

/**
 * Gets a db connection for a URL.
 * @param     {String}    url         the url
 * @param     {Number} poolSize the db pool size
 * @return    {object}                connection for the given URL
 */
function getDb(url, poolSize) {
  if (!dbs[url]) {
    const db = mongoose.createConnection(url, {
      server: {
        poolSize: poolSize || 10,
      },
    });
    dbs[url] = db;
  }
  return dbs[url];
}

/**
 * Gets the mongoose.
 * @return    {Object}                the mongoose instance
 */
function getMongoose() {
  return mongoose;
}

// exports the functions
module.exports = {
  getDb,
  getMongoose,
};
