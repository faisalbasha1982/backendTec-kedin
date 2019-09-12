/**
 * Copyright (C) 2017 Topcoder Inc., All Rights Reserved.
 */


/**
 * the Subscribe Schema
 * @author      TSCODER
 * @version     1.0
 */

const Schema = require('mongoose').Schema;
const helper = require('../common/helper');
const _ = require('lodash');
const timestamps = require('mongoose-timestamp');

const SubscribeSchema = new Schema({
  post: { type: Schema.Types.ObjectId, ref: 'Post' },
  user: { type: Schema.Types.ObjectId, ref: 'TechnologyUser' },
});

SubscribeSchema.index({ post: 1, user: 1 }, { unique: true });

SubscribeSchema.plugin(timestamps, { createdAt: 'createdOn', updatedAt: 'updatedOn' });
helper.pluginSchmeToObject(SubscribeSchema, (doc, ret) => _.omit(ret, '__v'));


module.exports = {
  SubscribeSchema,
};
