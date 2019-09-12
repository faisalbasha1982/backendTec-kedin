/**
 * Copyright (C) 2017 Topcoder Inc., All Rights Reserved.
 */


/**
 * the TechnologyProvider Schema
 * @author      TSCODER
 * @version     1.0
 */

const Schema = require('mongoose').Schema;
const helper = require('../common/helper');
const _ = require('lodash');
const timestamps = require('mongoose-timestamp');
const config = require('config');

const AdderessSchema = new Schema({
  street: { type: String },
  locality: { type: String },
  postalCode: { type: String },
  town: { type: String },
  countryObj: { type: Schema.Types.ObjectId, ref: 'Country' },
  stateObj: { type: Schema.Types.ObjectId, ref: 'State' },
});

const ContactInformationSchema = new Schema({
  phone: { type: String },
  email: { type: String },
  website: { type: String },
});

const TechnologyProviderSchema = new Schema({
  name: { type: String },
  address: { type: AdderessSchema },
  contactInformation: { type: ContactInformationSchema },
  logoPath: { type: String },
  description: { type: String },
  certifications: { type: String },
  additionalOffice: { type: String },
  servicesOffered: { type: String },
  productsOffered: { type: String },
  customerServiceCommittment: { type: String },
  numberOfWebClick: { type: Number, default: 0 },
  yearInBusiness: { type: Number },
  userId: { type: Schema.Types.ObjectId },
  freezed: { type: Boolean, default: false },
  freezedAt: { type: Date },
});

TechnologyProviderSchema.plugin(timestamps, { createdAt: 'createdOn', updatedAt: 'updatedOn' });
helper.pluginSchmeToObject(TechnologyProviderSchema, (doc, ret) => {
  const entity = _.omit(ret, '__v');
  if (entity.logoPath) {
    entity.logoPath = `${config.HOST}/static/${entity.logoPath}`;
  }
  return entity;
});


module.exports = {
  TechnologyProviderSchema,
};
