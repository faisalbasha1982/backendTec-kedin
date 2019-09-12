/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * import static test data
 *
 * @author      TCSCODER
 * @version     1.0
 */

const models = require('../src/models');
const co = require('co');
const logger = require('../src/common/logger');

co(function* () {
  const users = yield models.User.find({});
  for (let i = 0; i < users.length; i += 1) {
    users[i].lastLoginAt = new Date('2017-10-01T13:54:42.044Z');
    yield users[i].save();
  }
  process.exit(0);
}).catch((err) => {
  logger.logFullError(err);
  process.exit(1);
});
