/**
 * Copyright (C) 2017 Topcoder Inc., All Rights Reserved.
 */


/**
 * the Post Schema
 * @author      TSCODER
 * @version     1.0
 */

const Schema = require('mongoose').Schema;
const helper = require('../common/helper');
const _ = require('lodash');
const timestamps = require('mongoose-timestamp');
const { PostStatus, PostScheduleOption } = require('../Const');
const config = require('config');

const PostSchema = new Schema({
  title: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'TechnologyProvider' },
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  imagePath: { type: String },
  attachmentPath: { type: String },
  videoUrl: { type: String },
  content: { type: String },
  keywords: [{ type: String }],
  caseStudy: { type: String, default: false },
  lessonsLearned: { type: String, default: false },
  status: { type: String, enum: _.values(PostStatus), default: PostStatus.draft },
  scheduleTime: { type: Date, default: Date.now },
  scheduleOption: { type: String, enum: _.values(PostScheduleOption) },
  readingTime: { type: Number, default: 0 },
  viewTimes: { type: Number, default: 0 },
  articleLength: { type: Number, default: 0 },
  publishedOn: { type: Date },
});

PostSchema.plugin(timestamps, { createdAt: 'createdOn', updatedAt: 'updatedOn' });
helper.pluginSchmeToObject(PostSchema, (doc, ret) => {
  const entity = _.omit(ret, '__v');
  if (entity.imagePath) {
    entity.imagePath = `${config.HOST}/static/${entity.imagePath}`;
  }
  if (entity.attachmentPath) {
    entity.attachmentPath = `${config.HOST}/static/${entity.attachmentPath}`;
  }
  return entity;
});


module.exports = {
  PostSchema,
};
