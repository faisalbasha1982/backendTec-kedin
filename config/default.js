/**
 * Copyright (c) 2017 Topcoder Inc, All rights reserved.
 */


/**
 * The production configuration file.
 *
 * @author      TSCODER
 * @version     1.0
 */
const path = require('path');

module.exports = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  WEB_SERVER_PORT: process.env.PORT || 3000,
  HOST: process.env.HOST || 'http://localhost:3000',
  IMAGES_PATH: process.env.IMAGES_PATH || path.join(__dirname, '..', 'upload'),
  CLIENT_ID: process.env.CLIENT_ID || 'CLIENT_ID',
  CLIENT_SECRET: process.env.CLIENT_SECRET || 'CLIENT_SECRET',
  APP_HOST: process.env.APP_HOST || 'http://localhost:3002',
  TOKEN_EXPIRES: 24 * 60 * 60, // 24 hours
  API_VERSION: 'api/v1',
  ADMIN_EMAIL: 'info@teckedin.com',

  verifyEmailContent: 'Dear %s<br/> <br/>' +
  'Thank you for signing up to teckedin.com. Please click on this <a href="%s">link</a> which will validate the email address that you used to register. Once you click on this link you are ready to log in. We look forward to talking with you soon.' +
  '<br/> <br/>if any questions or problems, please call 505-250-0986 Or email to support@teckedin.com',

  forgotPasswordEmailContent: 'Dear %s, Your forgot password verify code is %s, Please keep it properly.',
  postEmailContent: 'Dear %s , teckedin.com member %s has sent you this post created by %s.' +
  '<br /><br /><br /> %s ' +
  '<br /><br /><br /> click this <a href="%s">link</a> see details' +
  '<br /><br /> %s <br/>P.S. Teckedin.com is free for users. You can sign up at https://www.teckedin.com',
  subscribeEmailSubject: 'User %s has subscribed to your content %s',
  subscribeEmailContent: 'User %s with email address %s has subscribed to your content %s',
  requestEmailSubject: 'User %s has request to your content %s',
  requestEmailContent: 'User %s with email address %s has request to your content %s <br/><br/> %s <br/><br/><br/>%s <br/>%s <br/>',
  email: {
    pool: true,
    host: process.env.EMAIL_SERVER || 'smtpout.secureserver.net',
    port: process.env.EMAIL_PORT || 465,
    secure: true, // use TLS
    auth: {
      user: process.env.EMAIL_USER || 'faisalbasha.andd@gmail.com',
      pass: process.env.EMAIL_PASS || 'fbcrs28$$',
    },
    debug: true, // include SMTP traffic in the logs
  },
  db: {
    url: process.env.MONGOLAB_URI || 'mongodb://localhost:27017/TECKEDIN_DEV',
    poolSize: 5,
  },
  facebook: {
    clientId: process.env.FACEBOOK_APP_ID || '135794683759765',
    clientSecret: process.env.FACEBOOK_APP_SECRET || '7802759f88fbfa9c7ada1cdada38be5e',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '84265250854-11spnfv2ipbeji6v2et9fs9mgki4r22s.apps.googleusercontent.com',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '1zB1W3h2TlaY41WDEKNDuZ72',
  },
};
