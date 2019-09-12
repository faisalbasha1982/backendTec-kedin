/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the passport auth file
 *
 * @author      TCSCODER
 * @version     1.0
 */

const config = require('config');
const passport = require('passport');
const _ = require('lodash');
const co = require('co');
const models = require('./models');
const FacebookStrategy = require('passport-facebook');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const UserService = require('./services/UserService');
const errors = require('common-errors');

/**
 * the passport default serializeUser method
 */
passport.serializeUser((user, cb) => {
  cb(null, user);
});

/**
 * the passport default deserializeUser method
 */
passport.deserializeUser((obj, cb) => {
  cb(null, obj);
});

/**
 * create the auth function
 * @param authType , the auth type(google,facebook,linkedIn)
 * @param scope the auth scope
 * @return {function(*=, *=, *=)}
 */
const createAuthFunc = (authType, scope) => {
  const strategies = {
    google: GoogleStrategy,
    facebook: FacebookStrategy,
  };
  const Strategy = strategies[authType];
  const strategyEntity = {
    clientID: config[authType].clientId,
    clientSecret: config[authType].clientSecret,
    scope,
  };
  if (authType === 'facebook') {
    strategyEntity.profileFields = ['emails', 'displayName', 'picture.type(large)', 'name', 'profileUrl'];
  }
  return (req, res, next) => {
    passport.use(new Strategy(
      _.extend(strategyEntity, { callbackURL: `${config.HOST}/api/v1/auth/${authType}/callback` }),
      ((accessToken, refreshToken, profile, cb) => cb(null, _.extend(profile, { accessToken }))),
    ));

    return passport.authenticate(authType, { scope })(req, res, next);
  };
};

/**
 * get auth entity and auth query (to found match user)
 * @param authType the auth type
 * @param user the use
 * @returns {*}
 */
const getEntity = (authType, user) => {
  const entity = {};
  entity.id = user.id;
  entity.token = user.accessToken;
  entity.name = user.displayName;
  entity.firstName = user.name.familyName;
  entity.lastName = (user.name.middleName ? (`${user.name.middleName} `) : '') + user.name.givenName;
  try {
    entity.email = user.emails[0].value; // if email exist , use email as query key
    entity.profileImage = user.photos[0].value;
    return entity;
  } catch (e) {
    return entity;
  }
};

/**
 * the common auth callback
 * @param authType the auth type
 * @param req the request
 * @param res the response
 * @param next the next
 */
const authCallback = (authType, req, res) => {
  const entity = getEntity(authType, req.user);
  co(function* () {
    const searchQuery = {};
    searchQuery[`${authType}Auth.id`] = entity.id;
    let user = yield models.User.findOne(searchQuery);
    if (!user) {
      const emailUser = yield models.User.findOne({ email: entity.email });
      if (emailUser) {
        throw new errors.Error('exists');
      }
      user = {};
      user.email = entity.email;
      user.verified = true;
      user.username = `${entity.email}-${Date.now()}`;
      user.type = models.Const.UserType.technologyUser;
      user[`${authType}Auth`] = entity;
      user = yield models.User.create(user);
    }
    user = yield UserService.injectToken(user);
    res.redirect(`${config.APP_HOST}/social-login.html?accessToken=${user.accessToken}&email=${entity.email}`);
  }).catch((err) => {
    res.redirect(`${config.APP_HOST}/social-login.html?error=${err.message}&email=${entity.email}`);
  });
};

/**
 * the facebook callback
 */
const facebookCallback = (req, res, next) => {
  authCallback('facebook', req, res, next);
};

/**
 * the google callack
 */
const googleCallback = (req, res, next) => {
  authCallback('google', req, res, next);
};

module.exports = {
  init: (app) => { // register passport auth uri
    app.get(`/${config.API_VERSION}/auth/facebook`, createAuthFunc('facebook', ['email', 'user_photos', 'public_profile']));
    app.get(`/${config.API_VERSION}/auth/facebook/callback`, passport.authenticate('facebook'), facebookCallback);
    app.get(`/${config.API_VERSION}/auth/google`, createAuthFunc('google', ['profile', 'email']));
    app.get(`/${config.API_VERSION}/auth/google/callback`, passport.authenticate('google'), googleCallback);
  },
};
