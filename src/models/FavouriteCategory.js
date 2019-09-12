/**
 * Copyright (C) 2017 Topcoder Inc., All Rights Reserved.
 */


/**
 * the FavouriteCategory Schema
 * @author      TSCODER
 * @version     1.0
 */

const Schema = require('mongoose').Schema;
const helper = require('../common/helper');
const _ = require('lodash');
const timestamps = require('mongoose-timestamp');

const FavouriteCategorySchema = new Schema({
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  user: { type: Schema.Types.ObjectId, ref: 'TechnologyUser' },
});

FavouriteCategorySchema.index({ category: 1, user: 1 }, { unique: true });

FavouriteCategorySchema.plugin(timestamps, { createdAt: 'createdOn', updatedAt: 'updatedOn' });
helper.pluginSchmeToObject(FavouriteCategorySchema, (doc, ret) => _.omit(ret, '__v', 'updatedOn'));


module.exports = {
  FavouriteCategorySchema,
};
