/**
 * Copyright (C) 2017 Topcoder Inc., All Rights Reserved.
 */


/**
 * the InformationRequest Schema
 * @author      TSCODER
 * @version     1.0
 */

const Schema = require('mongoose').Schema;
const helper = require('../common/helper');
const _ = require('lodash');
const timestamps = require('mongoose-timestamp');
const Const = require('../Const');

const InformationRequestSchema = new Schema({
  fromUser: { type: Schema.Types.ObjectId, ref: 'TechnologyUser' },
  subject: { type: String },
  requestText: { type: String },
  answer: { type: String },
  status: { type: String,
    enum: _.values(Const.InformationStatus),
    default: Const.InformationStatus.new },
  answeredOn: { type: Date },
});

InformationRequestSchema.plugin(timestamps, { createdAt: 'createdOn', updatedAt: 'updatedOn' });
helper.pluginSchmeToObject(InformationRequestSchema, (doc, ret) => _.omit(ret, '__v', 'updatedOn'));


module.exports = {
  InformationRequestSchema,
};
