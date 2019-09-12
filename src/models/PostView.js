/**
 * Copyright (C) 2017 Topcoder Inc., All Rights Reserved.
 */


/**
 * the PostView Schema
 * @author      TSCODER
 * @version     1.0
 */

const Schema = require('mongoose').Schema;
const helper = require('../common/helper');
const _ = require('lodash');
const timestamps = require('mongoose-timestamp');

const PostViewSchema = new Schema({
  post: { type: Schema.Types.ObjectId, ref: 'Post' },
  user: { type: Schema.Types.ObjectId, ref: 'TechnologyUser' },
});

PostViewSchema.plugin(timestamps, { createdAt: 'createdOn', updatedAt: 'updatedOn' });
helper.pluginSchmeToObject(PostViewSchema, (doc, ret) => _.omit(ret, '__v', 'updatedOn'));


module.exports = {
  PostViewSchema,
};
