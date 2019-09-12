/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * update provider email to user email
 *
 * @author      TCSCODER
 * @version     1.0
 */

const models = require('../src/models');
const co = require('co');
const logger = require('../src/common/logger');

co(function* () {
  const providers = yield models.TechnologyProvider.find({});
  for (let i = 0; i < providers.length; i += 1) {
    const p = providers[i];
    const user = yield models.User.findOne({ _id: p.userId });
    if (user) {
      p.contactInformation.email = user.email;
      yield p.save();
    }
  }
  logger.info('update provider email successful');
  process.exit(0);
}).catch((err) => {
  logger.logFullError(err);
  process.exit(1);
});
