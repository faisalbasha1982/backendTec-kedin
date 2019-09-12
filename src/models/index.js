/**
 * Copyright (C) 2017 Topcoder Inc., All Rights Reserved.
 */

/**
 * Init models
 *
 * @author      TSCODER
 * @version     1.0
 */
const config = require('config');
const db = require('../datasource').getDb(config.db.url, config.db.poolSize);
const UserSchema = require('./User').UserSchema;
const { CountrySchema } = require('./Country');
const { TechnologyUserSchema } = require('./TechnologyUser');
const { TechnologyProviderSchema } = require('./TechnologyProvider');
const { CategorySchema } = require('./Category');
const { PostSchema } = require('./Post');
const { PostViewSchema } = require('./PostView');
const { PostSaveSchema } = require('./PostSave');
const { ReviewSchema } = require('./Review');
const { TechnologyUserFileSchema } = require('./TechnologyUserFile');
const { NotificationSchema } = require('./Notification');
const { FavouriteCategorySchema } = require('./FavouriteCategory');
const { InformationRequestSchema } = require('./InformationRequest');
const { FavouriteTechnologyProviderSchema } = require('./FavouriteTechnologyProvider');
const { FAQItemSchema } = require('./FAQItem');
const { SubscribeSchema } = require('./Subscribe');
const { StateSchema } = require('./State');
const { UserRequestSchema } = require('./UserRequest');
const { LinkResourceSchema } = require('./LinkResource');
const Const = require('../Const');

module.exports = {
  User: db.model('User', UserSchema),
  Country: db.model('Country', CountrySchema),
  TechnologyUser: db.model('TechnologyUser', TechnologyUserSchema),
  TechnologyProvider: db.model('TechnologyProvider', TechnologyProviderSchema),
  Category: db.model('Category', CategorySchema),
  Post: db.model('Post', PostSchema),
  PostView: db.model('PostView', PostViewSchema),
  PostSave: db.model('PostSave', PostSaveSchema),
  Review: db.model('Review', ReviewSchema),
  TechnologyUserFile: db.model('TechnologyUserFile', TechnologyUserFileSchema),
  Notification: db.model('Notification', NotificationSchema),
  FavouriteCategory: db.model('FavouriteCategory', FavouriteCategorySchema),
  FavouriteTechnologyProvider: db.model('FavouriteTechnologyProvider', FavouriteTechnologyProviderSchema),
  InformationRequest: db.model('InformationRequest', InformationRequestSchema),
  FAQItem: db.model('FAQItem', FAQItemSchema),
  Subscribe: db.model('Subscribe', SubscribeSchema),
  UserRequest: db.model('UserRequest', UserRequestSchema),
  State: db.model('State', StateSchema),
  LinkResource: db.model('LinkResource', LinkResourceSchema),
  Const,
  db,
};
