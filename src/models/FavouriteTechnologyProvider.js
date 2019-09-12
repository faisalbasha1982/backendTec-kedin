/**
 * Copyright (C) 2017 Topcoder Inc., All Rights Reserved.
 */


/**
 * the FavouriteTechnologyProvider Schema
 * @author      TSCODER
 * @version     1.0
 */

const Schema = require('mongoose').Schema;
const helper = require('../common/helper');
const _ = require('lodash');
const timestamps = require('mongoose-timestamp');

const FavouriteTechnologyProviderSchema = new Schema({
  provider: { type: Schema.Types.ObjectId, ref: 'TechnologyProvider' },
  user: { type: Schema.Types.ObjectId, ref: 'TechnologyUser' },
});

FavouriteTechnologyProviderSchema.index({ provider: 1, user: 1 }, { unique: true });
FavouriteTechnologyProviderSchema.plugin(timestamps, { createdAt: 'createdOn', updatedAt: 'updatedOn' });
helper.pluginSchmeToObject(FavouriteTechnologyProviderSchema, (doc, ret) => _.omit(ret, '__v', 'updatedOn'));


module.exports = {
  FavouriteTechnologyProviderSchema,
};
