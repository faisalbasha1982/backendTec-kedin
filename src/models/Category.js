/**
 * Copyright (C) 2017 Topcoder Inc., All Rights Reserved.
 */


/**
 * the Category Schema
 * @author      TSCODER
 * @version     1.0
 */

const Schema = require('mongoose').Schema;
const helper = require('../common/helper');
const _ = require('lodash');

const CategorySchema = new Schema({
  name: { type: String },
  iconPath: { type: String },
});


helper.pluginSchmeToObject(CategorySchema, (doc, ret) => _.omit(ret, '__v'));


module.exports = {
  CategorySchema,
};
