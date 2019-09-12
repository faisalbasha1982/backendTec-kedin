/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the User service
 *
 * @author      TCSCODER
 * @version     1.0
 */
const models = require('../models');
const crypto = require('crypto');
const joi = require('joi');
const util = require('util');
const errors = require('common-errors');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const config = require('config');
const helper = require('../common/helper');
const httpStatus = require('http-status');
const UtilityService = require('../services/UtilityService');

/**
 * get user from db by id , if user not exist , it will raise an exception
 * @param id
 */
function* getDBUserById(id) {
  const user = yield models.User.findOne({ _id: id });
  if (!user) {
    throw new errors.NotFoundError(`cannot found user where id = ${id}`);
  }
  return user;
}

/**
 * get user by id
 * @param id
 */
function* get(id) {
  const user = yield getDBUserById(id);
  return user.toObject();
}

get.schema = { id: joi.objectId() };

/**
 * get user by email
 * @param email the email address
 * @param throwNotExistException if not exist and throwNotExistException is true,
 *  then will raise an not exist exception
 * @return {*}
 */
function* getUserByEmail(email, throwNotExistException) {
  const user = yield models.User.findOne({ email });
  if (!user && throwNotExistException) {
    throw new errors.NotFoundError(`cannot found user where email = ${email}`);
  }
  return user;
}

/**
 * create user
 * @param entity the user entity
 * @return {*}
 */
function* create(entity) {
  let user = yield getUserByEmail(entity.email);
  if (user) {
    throw new errors.HttpStatusError(httpStatus.CONFLICT, `email ${entity.email} already exist!`);
  }
  const verificationToken = helper.randomStr(6);
  const newEntity = _.extend(entity,
    { username: entity.email, password: yield generateHash(entity.password), verificationToken });

  user = yield models.User.create(newEntity);

  try {
    yield sendVerifyEmail(entity.email, verificationToken, helper.getHostWithApiVersion());
    yield sendVerifyEmail(config.ADMIN_EMAIL,
      verificationToken, helper.getHostWithApiVersion()); // send email to admin
  } catch (e) {
    yield user.remove();
    throw e;
  }

  const accessToken = yield generateToken(user);
  yield user.save(_.extend(user, { accessToken }));
  const userObj = user.toObject();
  return _.extend(userObj, { accessToken });
}

function* sendVerificationEmail(email) {
  const user = yield getUserByEmail(email, true);
  const verificationToken = helper.randomStr(6);
  user.verificationToken = verificationToken;

  try {
    yield sendVerifyEmail(email, verificationToken, helper.getHostWithApiVersion());
    yield sendVerifyEmail(config.ADMIN_EMAIL,
      verificationToken, helper.getHostWithApiVersion()); // send email to admin
    yield user.save();
  } catch (e) {
    throw e;
  }
  return { message: 'OK' };
}

create.schema = {
  entity: joi.object().keys({
    email: joi.email().required(),
    username: joi.string(),
    type: joi.string().valid(_.values(models.Const.UserType)),
    password: joi.string().required(),
  }),
};


/**
 * update user
 * @param userId the current user id
 * @param id the user id that need update
 * @param entity the user entity
 */
function* update(userId, id, entity) {
  let user = yield getDBUserById(id);

  if (userId !== id) {
    throw new errors.NotPermittedError('cannot update other user info.');
  }
  // skip type, user cannot
  user = _.extend(user, _.omit(entity, 'type'));
  yield user.save();
  return user.toObject();
}

update.schema = {
  userId: joi.objectId(),
  id: joi.objectId(),
  entity: joi.object().keys({
    email: joi.email(),
    username: joi.string(),
    type: joi.string().valid(_.values(models.Const.UserType)),
  }),
};

/**
 * build search db query
 * @param filter the user's filter
 * @return {{}}
 */
function* buildDBFilter(filter) {
  let query = {};
  query = helper.buildFuzzingMatchQuery(query, 'email', filter.email);
  query = helper.buildFuzzingMatchQuery(query, 'username', filter.username);
  return query;
}

/**
 * search user by username and email
 * @param filter the user query filter
 * @return {{items: Array, metadata: {pageIndex: *, pageSize: *, totalCount}}}
 */
function* search(filter) {
  const query = yield buildDBFilter(filter);
  const docs = yield models.User.find(query).skip(filter.offset).limit(filter.limit);
  return helper.sanitizeArray(docs);
}


search.schema = {
  filter: joi.object().keys({
    offset: joi.offset(),
    limit: joi.limit(),
    username: joi.string(),
    email: joi.string(),
  }),
};

/**
 * count users by filter
 * @param filter the user's filter
 */
function* getCountByFilter(filter) {
  const query = yield buildDBFilter(filter);
  return yield models.User.find(query).skip(filter.offset).limit(filter.limit).count();
}

getCountByFilter.schema = search.schema;

/**
 * update user password
 * @param id user id
 * @param newPassword
 * @param oldPassword
 */
function* updatePassword(id, newPassword, oldPassword) {
  const user = yield getDBUserById(id);
  const passwordMatched = yield verifyPassword(oldPassword, user.password);
  if (!passwordMatched) {
    throw new errors.HttpStatusError(httpStatus.BAD_REQUEST, 'old password is incorrect.');
  }
  user.password = yield generateHash(newPassword);
  yield user.save();
}

updatePassword.schema = {
  id: joi.objectId(),
  newPassword: joi.string().required(),
  oldPassword: joi.string().required(),
};


/**
 * use md5 hash password
 * @param password
 * @return {Buffer | string}
 */
function* generateHash(password) {
  const md5sum = crypto.createHash('md5');
  md5sum.update(password);
  return md5sum.digest('hex');
}

/**
 * check password
 * @param password
 * @param hash
 * @return {boolean}
 */
function* verifyPassword(password, hash) {
  const passwordHash = yield generateHash(password);
  return passwordHash === hash;
}

/**
 * verify Email with token
 * @param entity the token entity
 */
function* verifyEmail(entity) {
  const user = yield getUserByEmail(entity.email, true);

  if (user.verified) {
    throw new errors.HttpStatusError(httpStatus.BAD_REQUEST, 'user already verified');
  }
  if (user.verificationToken === entity.verificationToken) {
    user.verified = true;
    user.verificationToken = null;
    yield user.save();
  } else {
    throw new errors.HttpStatusError(httpStatus.BAD_REQUEST, 'verification token error');
  }
  return { message: `${entity.email} verify succeed` };
}

verifyEmail.schema = {
  entity: joi.object().keys({
    email: joi.email().required(),
    verificationToken: joi.string().required(),
  }).required(),
};

/**
 * user login use local login method, and save token to db
 * @param entity
 */
function* login(entity) {
  const password = yield generateHash(entity.password);
  const user = yield models.User.findOne({
    email: { $regex: new RegExp(`^${entity.email.toLowerCase()}`, 'i') },
    password });

  if (!user) {
    throw new errors.HttpStatusError(httpStatus.BAD_REQUEST, 'the email does not match the password.');
  }

  if (!user.verified) {
    throw new errors.NotPermittedError('this email is not verified.');
  }
  return yield injectToken(user);
}

login.schema = {
  entity: joi.object().keys({
    email: joi.string().email().required(),
    password: joi.string().required(),
  }).required(),
};

/**
 * inject token to user
 * @param user the user entity
 * @return {Object}
 */
function* injectToken(user) {
  const accessToken = yield generateToken(user);
  yield user.save(_.extend(user, { accessToken, lastLoginAt: new Date() }));
  const userObj = user.toObject();

  let entityId = null;
  if (user.type === models.Const.UserType.technologyUser) {
    const tUser = yield models.TechnologyUser.findOne({ userId: user._id });
    if (tUser) {
      entityId = tUser._id;
    }
  } else {
    const tProvider = yield models.TechnologyProvider.findOne({ userId: user._id });
    if (tProvider) {
      entityId = tProvider._id;
    }
  }
  return _.extend(userObj, { accessToken, entityId });
}
/**
 * Generate a jwt token for specified user
 * @param  {Object}     userObj     the user for which to generate the token
 */
function* generateToken(userObj) {
  const jwtBody = {
    sub: userObj._id,
  };
  return jwt.sign(jwtBody, new Buffer(config.CLIENT_SECRET, 'base64'), {
    expiresIn: config.TOKEN_EXPIRES,
    audience: config.CLIENT_ID,
  });
}


/**
 * user logout
 * @param userId the user id
 */
function* logout(userId) {
  yield models.User.update({ _id: userId }, { accessToken: null });
}


/**
 * get current login user
 */
function* getCurrent(userId) {
  const user = yield getDBUserById(userId);
  const newUser = user.toObject();
  newUser.accessToken = user.accessToken;
  let entityId = null;
  if (user.type === models.Const.UserType.technologyUser) {
    const tUser = yield models.TechnologyUser.findOne({ userId: user._id });
    if (tUser) {
      entityId = tUser._id;
    }
  } else {
    const tProvider = yield models.TechnologyProvider.findOne({ userId: user._id });
    if (tProvider) {
      entityId = tProvider._id;
    }
  }
  newUser.entityId = entityId;
  return newUser;
}


/**
 * send email to user
 * @param emailAddress the email address
 * @param verificationToken the verificationToken
 * @param host the host with api version
 */
function* sendVerifyEmail(emailAddress, verificationToken, host) {
  const content = util.format(config.verifyEmailContent,
    emailAddress, `${host}/verifyEmail?verificationToken=${verificationToken}&email=${emailAddress}`);
  yield UtilityService.sendEmail({ subject: 'Verify Your Email', to: emailAddress, html: content });
}

/**
 * change password by forgot password token
 * @param entity
 */
function* changeForgotPassword(entity) {
  const user = yield getUserByEmail(entity.email, true);
  if (user.forgotPasswordToken === entity.forgotPasswordToken) {
    user.password = yield generateHash(entity.newPassword);
    user.forgotPasswordToken = null;
    yield user.save();
  } else {
    throw new errors.ArgumentError('forgotPasswordToken error!');
  }
}

changeForgotPassword.schema = {
  entity: joi.object().keys({
    email: joi.email().required(),
    forgotPasswordToken: joi.string().required(),
    newPassword: joi.string().required(),
  }).required(),
};

/**
 * send forgot password token to user email.
 * @param entity
 */
function* initiateForgotPassword(entity) {
  const user = yield getUserByEmail(entity.email, true);
  if (!user.verified) {
    throw new errors.ArgumentError('user cannot do this, because of user email not verified.');
  }
  const forgotPasswordToken = helper.randomStr(6);
  const content = util.format(config.forgotPasswordEmailContent, entity.email, forgotPasswordToken);
  yield UtilityService.sendEmail({ subject: 'Forgot password', to: entity.email, text: content });
  user.forgotPasswordToken = forgotPasswordToken;
  yield user.save();
}

initiateForgotPassword.schema = {
  entity: joi.object().keys({
    email: joi.email().required(),
  }),
};

function* sendEmail(body) {
  yield UtilityService.sendEmail({ subject: body.subject,
    to: body.to || config.ADMIN_EMAIL,
    html: body.content });
}

/**
 * Manually verify user (without the need for token)
 * @param {String} authUserId The user id of the user making this request
 * @param {String} toVerifyUserId The user id of the user to verify
 */
function* verifyUserManually(authUserId, toVerifyUserId) {
  // Verify that the user making the request is admin before proceeding
  const adminUser = yield getDBUserById(authUserId);

  if (adminUser.type !== models.Const.UserType.admin) {
    throw new errors.HttpStatusError(httpStatus.FORBIDDEN, 'You cannot carry out this action');
  }

  const user = yield getDBUserById(toVerifyUserId);

  if (user.verified) {
    throw new errors.HttpStatusError(httpStatus.BAD_REQUEST, 'The user is already verified');
  }

  if (user.type === models.Const.UserType.TechnologyProvider) {
    throw new errors.HttpStatusError(httpStatus.BAD_REQUEST, 'Users of type provider cannot be manually verified');
  }

  user.verified = true;
  user.verificationToken = null;
  yield user.save();
  return { message: 'User verified successfuly' };
}

verifyUserManually.schema = {
  authUserId: joi.objectId(),
  toVerifyUserId: joi.objectId(),
};

module.exports = {
  create,
  update,
  get,
  search,
  updatePassword,
  verifyEmail,
  generateToken,
  verifyPassword,
  sendVerificationEmail,
  login,
  logout,
  getDBUserById,
  getCurrent,
  generateHash,
  sendEmail,
  injectToken,
  changeForgotPassword,
  initiateForgotPassword,
  getCountByFilter,
  verifyUserManually,
};
