/**
 * Copyright (C) 2017 Topcoder Inc., All Rights Reserved.
 */


/**
 * the Country Schema
 * @author      TSCODER
 * @version     1.0
 */

const Schema = require('mongoose').Schema;
const helper = require('../common/helper');
const _ = require('lodash');

const CountrySchema = new Schema({
  value: { type: String },
});


helper.pluginSchmeToObject(CountrySchema, (doc, ret) => _.omit(ret, '__v'));


module.exports = {
  CountrySchema,
};
