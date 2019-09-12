/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * update Post save expires time
 *
 * @author      TCSCODER
 * @version     1.0
 */

const models = require('../src/models');
const co = require('co');
const logger = require('../src/common/logger');

co(function* () {
  const postSaves = yield models.PostSave.find({});
  for (let i = 0; i < postSaves.length; i += 1) {
    const ps = postSaves[i];
    if (ps.expirationOption !== models.Const.PostExpirationOption.never) {
      ps.expiredAt = new Date(ps.createdOn).getTime()
        + models.Const.PostExpirationOptionTime[ps.expirationOption];
      yield ps.save();
    }
  }
  process.exit(0);
}).catch((err) => {
  logger.logFullError(err);
  process.exit(1);
});
