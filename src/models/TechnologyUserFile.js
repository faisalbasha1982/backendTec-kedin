/**
 * Copyright (C) 2017 Topcoder Inc., All Rights Reserved.
 */


/**
 * the TechnologyUserFile Schema
 * @author      TSCODER
 * @version     1.0
 */
const config = require('config');

const Schema = require('mongoose').Schema;
const helper = require('../common/helper');
const _ = require('lodash');
const timestamps = require('mongoose-timestamp');

const TechnologyUserFileSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'TechnologyUser' },
  fileName: { type: String },
  filePath: { type: String },
  keywords: [{ type: String }],
  answeredOn: { type: Date },
});

TechnologyUserFileSchema.plugin(timestamps, { createdAt: 'createdOn', updatedAt: 'updatedOn' });
helper.pluginSchmeToObject(TechnologyUserFileSchema, (doc, ret) => {
  const entity = _.omit(ret, '__v', 'updatedOn');
  if (entity.filePath) { entity.filePath = `${config.HOST}/static/${entity.filePath}`; }
  return entity;
});


module.exports = {
  TechnologyUserFileSchema,
};
