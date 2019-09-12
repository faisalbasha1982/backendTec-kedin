/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */


/**
 * Application authentication middleware
 *
 * @author      TCSCODER
 * @version     1.0
 */

const jwt = require('express-jwt');
const config = require('config');
const errors = require('common-errors');
const models = require('../models');
/**
 * get token from header or query
 * @param req
 * @return {*}
 */
const getToken = (req) => {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
  }
  return req.query.token;
};


/**
 * the jwt check middleware
 * @type {middleware}
 */
const jwtCheck = jwt({
  secret: new Buffer(config.CLIENT_SECRET, 'base64'),
  audience: config.CLIENT_ID,
  requestProperty: 'auth',
  getToken,
});


/**
 * the auth middleware
 * first check token and then check the token in db
 * @param req
 * @param res
 * @param next
 */
function auth(req, res, next) {
  jwtCheck(req, res, (err) => {
    if (err) {
      next(err);
      return;
    }

    const accessToken = getToken(req);
    models.User.findOne({ _id: req.auth.sub, accessToken }, (dbErr, user) => {
      if (dbErr) {
        next(dbErr);
      } else if (user === null) {
        next(new errors.AuthenticationRequiredError('user not login or token error'));
      } else {
        next();
      }
    });
  });
}

/**
 * Export a function
 * @return {Function}       return the middleware function
 */
module.exports = () => auth;
