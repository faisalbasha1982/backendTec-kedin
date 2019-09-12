/**
 * Copyright (C) 2017 Topcoder Inc., All Rights Reserved.
 */


/**
 * the User schema
 * @author      TSCODER
 * @version     1.0
 */

const Schema = require('mongoose').Schema;
const helper = require('../common/helper');
const _ = require('lodash');
const { UserType } = require('../Const');


const SocialAuthSchema = {
  token: { type: String },
  id: { type: String },
  email: { type: String },
  name: { type: String },
  firstName: { type: String },
  lastName: { type: String },
};
const UserSchema = new Schema({
  email: { type: String, unique: true },
  username: { type: String, unique: true },
  type: { type: String, enum: _.values(UserType) },
  accessToken: { type: String },
  password: { type: String },
  verificationToken: { type: String },
  forgotPasswordToken: { type: String },
  lastLoginAt: { type: Date },
  verified: { type: Boolean, default: false },
  googleAuth: SocialAuthSchema,
  facebookAuth: SocialAuthSchema,
  linkedInAuth: { SocialAuthSchema },
});

helper.pluginSchmeToObject(UserSchema, (doc, ret) => {
  const newRet = _.omit(ret, '__v', 'password', 'accessToken',
    'verificationToken', 'forgotPasswordToken');
  if (ret.facebookAuth) {
    newRet.facebookAuth = _.omit(ret.facebookAuth, 'token');
  }
  if (ret.googleAuth) {
    newRet.googleAuth = _.omit(ret.googleAuth, 'token');
  }
  return newRet;
});


module.exports = {
  UserSchema,
};
