/**
 * Copyright (C) 2017 Topcoder Inc., All Rights Reserved.
 */


/**
 * Init app and joi object
 *
 * @author      TSCODER
 * @version     1.0
 */

global.Promise = require('bluebird');
const fs = require('fs');
const path = require('path');
const logger = require('./common/logger');
const helper = require('./common/helper');
const joi = require('joi');
const config = require('config');

helper.ensureDirExist(config.IMAGES_PATH);

joi.objectId = () => joi.string().regex(/^[0-9a-fA-F]{24}$/, 'objectId is invalid.');
joi.email = () => joi.string().email();
joi.offset = () => joi.number().integer().min(0).default(0);
joi.limit = () => joi.number().integer().min(0).default(0);

function buildServices(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const curPath = path.join(dir, file);
    fs.stat(curPath, (err, stats) => {
      if (err) return;
      if (stats.isDirectory()) {
        buildServices(curPath);
      } else if (path.extname(file) === '.js') {
        logger.buildService(require(curPath)); // eslint-disable-line
      }
    });
  });
}

buildServices(path.join(__dirname, 'services'));
