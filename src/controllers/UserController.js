/**
 * Copyright (c) 2017 Zero Inc, All rights reserved.
 */


/**
 * User Controller
 *
 * @author      TCSCODER
 * @version     1.0
 */

const UserService = require('../services/UserService');


/**
 * verify Email with token
 * @param req the http request
 * @param res the http response
 */
function* verifyEmail(req, res) {
  let msg = '';
  try {
    const ret = yield UserService.verifyEmail(req.query);
    msg = ret.message;
  } catch (e) {
    msg = e.message;
  }
  res.redirect(`https://www.teckedin.com/verify-email.html?msg=${msg}`);
}


/**
 * search user
 * @param req the http request
 * @param res the http response
 */
function* search(req, res) {
  res.json(yield UserService.search(req.query));
}


/**
 * create user (sign up)
 * @param req the http request
 * @param res the http response
 */
function* create(req, res) {
  res.json(yield UserService.create(req.body));
}

/**
 * update user info
 * @param req the http request
 * @param res the http response
 */
function* update(req, res) {
  res.json(yield UserService.update(req.auth.sub, req.params.id, req.body));
}

/**
 * get user by id
 * @param req the http request
 * @param res the http response
 */
function* get(req, res) {
  res.json(yield UserService.get(req.params.id));
}

/**
 * get current user
 * @param req the http request
 * @param res the http response
 */
function* getCurrent(req, res) {
  res.json(yield UserService.getCurrent(req.auth.sub));
}

/**
 * update user local password
 * @param req the http request
 * @param res the http response
 */
function* updatePassword(req, res) {
  res.json(yield UserService.updatePassword(
    req.auth.sub, req.body.newPassword, req.body.oldPassword));
}

/**
 * user login with  email and password
 * @param req the http request
 * @param res the http response
 */
function* login(req, res) {
  res.json(yield UserService.login(req.body));
}

/**
 * user logout
 * @param req
 * @param res
 */
function* logout(req, res) {
  res.json(yield UserService.logout(req.auth.sub));
}

/**
 * change user password by email and forgot password token
 * @param req the http request
 * @param res the http response
 */
function* changeForgotPassword(req, res) {
  res.json(yield UserService.changeForgotPassword(req.body));
}

/**
 * send an email with forgotPassword token to user
 * @param req the http request
 * @param res the http response
 */
function* initiateForgotPassword(req, res) {
  res.json(yield UserService.initiateForgotPassword(req.query));
}

/**
 * count users by filter
 * @param req the http request
 * @param res the http response
 */
function* getCountByFilter(req, res) {
  res.json(yield UserService.getCountByFilter(req.query));
}

function* sendVerificationEmail(req, res) {
  res.json(yield UserService.sendVerificationEmail(req.query.email));
}

function* sendEmail(req, res) {
  res.json(yield UserService.sendEmail(req.body));
}

/**
 * Manually verify user (without the need for token)
 * @param req the http request
 * @param res the http response
 */
function* verifyUserManually(req, res) {
  res.json(yield UserService.verifyUserManually(req.auth.sub, req.params.id));
}

module.exports = {
  verifyEmail,
  search,
  create,
  update,
  get,
  getCurrent,
  updatePassword,
  login,
  logout,
  sendEmail,
  initiateForgotPassword,
  changeForgotPassword,
  getCountByFilter,
  sendVerificationEmail,
  verifyUserManually,
};
