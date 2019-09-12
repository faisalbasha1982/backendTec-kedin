/**
 * Copyright (C) 2017 Topcoder Inc., All Rights Reserved.
 */


/**
 * the Review Schema
 * @author      TSCODER
 * @version     1.0
 */

const Schema = require('mongoose').Schema;
const helper = require('../common/helper');
const _ = require('lodash');
const timestamps = require('mongoose-timestamp');


const ReviewSchema = new Schema({
  provider: { type: Schema.Types.ObjectId, ref: 'TechnologyProvider' },
  fromUser: { type: Schema.Types.ObjectId, ref: 'TechnologyUser' },
  score: { type: Number, default: 80 },
  reviewText: { type: String },
});

ReviewSchema.index({ provider: 1, fromUser: 1 }, { unique: true });

ReviewSchema.plugin(timestamps, { createdAt: 'createdOn', updatedAt: 'updatedOn' });
helper.pluginSchmeToObject(ReviewSchema, (doc, ret) => _.omit(ret, '__v'));


module.exports = {
  ReviewSchema,
};
