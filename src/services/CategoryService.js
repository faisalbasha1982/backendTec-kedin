/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the Category Service
 *
 * @author      TCSCODER
 * @version     1.0
 */

const models = require('../models');
const errors = require('common-errors');

/**
 * get db entity
 * @param id the category id
 * @param needThrowNotExistException if needThrowNotExistException ,
 * it will raise an exception if not exist
 * @return {*}
 */
function* getDBEntity(id, needThrowNotExistException) {
  const entity = yield models.Category.findOne({ _id: id });
  if (!entity && needThrowNotExistException) {
    throw new errors.NotFoundError(`cannot found category where id = ${id}`);
  }
  return entity;
}

module.exports = {
  getDBEntity,
};
