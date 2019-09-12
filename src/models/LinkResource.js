/**
 * Copyright (C) 2017 Topcoder Inc., All Rights Reserved.
 */

/**
 * the Link Resouce Schema
 * @author      TSCODER
 * @version     1.0
 */

const Schema = require('mongoose').Schema;
const helper = require('../common/helper');
const _ = require('lodash');
const timestamps = require('mongoose-timestamp');
const Const = require('../Const');

const LinkResourceSchema = new Schema({
  link: { type: String },
  title: { type: String },
  description: { type: String },
  logoPath: { type: String },
  belongsTo: { type: String },
  type: { type: String,
    enum: _.values(Const.LinkResourceType),
    default: Const.LinkResourceType.both },
});

LinkResourceSchema.plugin(timestamps, { createdAt: 'createdOn', updatedAt: 'updatedOn' });
helper.pluginSchmeToObject(LinkResourceSchema, (doc, ret) => _.omit(ret, '__v', 'updatedOn'));

module.exports = {
  LinkResourceSchema,
};
