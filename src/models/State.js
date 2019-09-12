/**
 * Copyright (C) 2017 Topcoder Inc., All Rights Reserved.
 */


/**
 * the State Schema
 * @author      TSCODER
 * @version     1.0
 */

const Schema = require('mongoose').Schema;
const helper = require('../common/helper');
const _ = require('lodash');

const StateSchema = new Schema({
  country: { type: Schema.Types.ObjectId },
  value: { type: String },
});


helper.pluginSchmeToObject(StateSchema, (doc, ret) => _.omit(ret, '__v'));


module.exports = {
  StateSchema,
};
