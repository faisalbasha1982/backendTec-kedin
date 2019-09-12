/**
 * Copyright (C) 2017 Topcoder Inc., All Rights Reserved.
 */


/**
 * the User Request information
 * @author      TSCODER
 * @version     1.0
 */

const Schema = require('mongoose').Schema;
const helper = require('../common/helper');
const _ = require('lodash');
const timestamps = require('mongoose-timestamp');

const UserRequestSchema = new Schema({
  post: { type: Schema.Types.ObjectId, ref: 'Post' },
  user: { type: Schema.Types.ObjectId, ref: 'TechnologyUser' },
  provider: { type: Schema.Types.ObjectId, ref: 'TechnologyProvider' },
  content: { type: String },
  phone: { type: String },
  other: { type: String },
});
UserRequestSchema.plugin(timestamps, { createdAt: 'createdOn', updatedAt: 'updatedOn' });
helper.pluginSchmeToObject(UserRequestSchema, (doc, ret) => _.omit(ret, '__v'));
module.exports = {
  UserRequestSchema,
};
