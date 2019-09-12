/**
 * Copyright (C) 2017 Topcoder Inc., All Rights Reserved.
 */


/**
 * the FAQItem Schema
 * @author      TSCODER
 * @version     1.0
 */

const Schema = require('mongoose').Schema;
const helper = require('../common/helper');
const _ = require('lodash');
const Const = require('../Const');

const FAQItemSchema = new Schema({
  question: { type: String },
  answer: { type: String },
  type: { type: String, enum: _.values(Const.UserType) },
});

helper.pluginSchmeToObject(FAQItemSchema, (doc, ret) => _.omit(ret, '__v'));


module.exports = {
  FAQItemSchema,
};
