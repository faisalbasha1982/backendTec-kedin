/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */


/**
 * Common error handling middleware
 *
 * @author      TCSCODER
 * @version     1.0
 */

const errors = require('common-errors');
const httpStatus = require('http-status');


const DEFAULT_MESSAGE = 'Internal server error';

/**
 * The error middleware function
 *
 * @param  {Object}     err       the error that is thrown in the application
 * @param  {Object}     req       the express request instance
 * @param  {Object}     res       the express response instance
 * @param  {Function}   next      the next middleware in the chain
 */
function middleware(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err.isJoi) {
    res.status(httpStatus.BAD_REQUEST).json({
      message: err.details,
    });
  } else if (err.errors) {
    res.status(httpStatus.BAD_REQUEST).json({ message: err.errors });
  } else {
    const httpError = new errors.HttpStatusError(err);
    if (err.statusCode >= httpStatus.INTERNAL_SERVER_ERROR) {
      httpError.message = err.message || DEFAULT_MESSAGE;
    }
    res.status(httpError.statusCode).json({ message: httpError.message || DEFAULT_MESSAGE });
  }
}

module.exports = () => middleware;
