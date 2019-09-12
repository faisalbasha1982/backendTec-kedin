/**
 * Copyright (C) 2017 Topcoder Inc., All Rights Reserved.
 */


/**
 * the PostSave Schema
 * @author      TSCODER
 * @version     1.0
 */

const Schema = require('mongoose').Schema;
const helper = require('../common/helper');
const _ = require('lodash');
const timestamps = require('mongoose-timestamp');
const { PostExpirationOption, PostSaveStatus } = require('../Const');

const PostSaveSchema = new Schema({
  post: { type: Schema.Types.ObjectId, ref: 'Post' },
  user: { type: Schema.Types.ObjectId, ref: 'TechnologyUser' },
  keywords: [{ type: String }],
  status: { type: String, enum: _.values(PostSaveStatus), default: PostSaveStatus.active },
  expirationOption: {
    type: String,
    enum: _.values(PostExpirationOption),
    default: PostExpirationOption.oneDay,
  },
  sharedBy: { type: String },
  expiredAt: { type: Date },
});

PostSaveSchema.index({ post: 1, user: 1 }, { unique: true });

PostSaveSchema.plugin(timestamps, { createdAt: 'createdOn', updatedAt: 'updatedOn' });
helper.pluginSchmeToObject(PostSaveSchema, (doc, ret) => _.omit(ret, '__v'));


module.exports = {
  PostSaveSchema,
};
