/**
 * Copyright (C) 2017 Topcoder Inc., All Rights Reserved.
 */


/**
 * the TechnologyUser Schema
 * @author      TSCODER
 * @version     1.0
 */

const Schema = require('mongoose').Schema;
const helper = require('../common/helper');
const _ = require('lodash');
const timestamps = require('mongoose-timestamp');
const config = require('config');

const TechnologyUserSchema = new Schema({
  firstName: { type: String },
  lastName: { type: String },
  phone: { type: String },
  userPhotoPath: { type: String },
  country: { type: Schema.Types.ObjectId, ref: 'Country' },
  state: { type: Schema.Types.ObjectId, ref: 'State' },
  city: { type: String },
  userId: { type: Schema.Types.ObjectId, required: true },
  notifyMeByPostCreated: { type: Boolean, default: true },
  notifyMeByPostUpdated: { type: Boolean, default: true },
  notifyMeUpcomingEvent: { type: Boolean, default: true },
});

TechnologyUserSchema.plugin(timestamps, { createdAt: 'createdOn', updatedAt: 'updatedOn' });
helper.pluginSchmeToObject(TechnologyUserSchema, (doc, ret) => {
  const entity = _.omit(ret, '__v');
  if (entity.userPhotoPath) {
    entity.userPhotoPath = `${config.HOST}/static/${entity.userPhotoPath}`;
  }
  return entity;
});


module.exports = {
  TechnologyUserSchema,
};
