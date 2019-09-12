/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the Utility Service
 *
 * @author      TCSCODER
 * @version     1.0
 */


const config = require('config');
const joi = require('joi');
const _ = require('lodash');
const nodemailer = require('nodemailer');
const logger = require('../common/logger');

const transporter = nodemailer.createTransport(_.extend(config.email, { logger }), {
  from: `${config.email.auth.user}`,
});


/**
 * send email to user
 * @param emailEntity the email entity ,  {to:,subject:,text:,html:}
 * @returns {Promise}
 */
function* sendEmail(emailEntity) {
  return new Promise((resolve, reject) => {
    transporter.sendMail(emailEntity, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

sendEmail.schema = {
  emailEntity: joi.object().keys({
    to: joi.any(),
    subject: joi.string().required(),
    text: joi.string(),
    html: joi.string(),
  }).required(),
};

module.exports = { sendEmail };
