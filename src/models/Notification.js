/**
 * Copyright (C) 2017 Topcoder Inc., All Rights Reserved.
 */


/**
 * the Notification Schema
 * @author      TSCODER
 * @version     1.0
 */

const Schema = require('mongoose').Schema;
const helper = require('../common/helper');
const _ = require('lodash');
const timestamps = require('mongoose-timestamp');
const Const = require('../Const');

const NotificationSchema = new Schema({
  recipientUserId: { type: Schema.Types.ObjectId },
  sourceUserId: { type: Schema.Types.ObjectId },
  type: { type: String, enum: _.values(Const.NotificationType) },
  entityId: { type: Schema.Types.ObjectId },
  status: {
    type: String,
    enum: _.values(Const.NotificationStatus),
    default: Const.NotificationStatus.new,
  },
  content: { type: String },
  readOn: { type: Date },
});

NotificationSchema.plugin(timestamps, { createdAt: 'createdOn', updatedAt: 'updatedOn' });
helper.pluginSchmeToObject(NotificationSchema, (doc, ret) => _.omit(ret, '__v', 'updatedOn'));


module.exports = {
  NotificationSchema,
};
