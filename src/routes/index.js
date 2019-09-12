/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * Defines the API routes
 *
 * @author      TCSCODER
 * @version     1.0
 */

const _ = require('lodash');
const UserRoutes = require('./UserRoutes');
const TechnologyUserRoutes = require('./TechnologyUserRoutes');
const TechnologyProviderRoutes = require('./TechnologyProviderRoutes');
const PostRoutes = require('./PostRoutes');
const PostViewRoutes = require('./PostViewRoutes');
const PostSaveRoutes = require('./PostSaveRoutes');
const ReviewRoutes = require('./ReviewRoutes');
const TechnologyUserFileRoutes = require('./TechnologyUserFileRoutes');
const NotificationRoutes = require('./NotificationRoutes');
const FavouriteCategoryRoutes = require('./FavouriteCategoryRoutes');
const InformationRequestRoutes = require('./InformationRequestRoutes');
const FavouriteTechnologyProviderRoutes = require('./FavouriteTechnologyProviderRoutes');
const LookupRoutes = require('./LookupRoutes');
const SubscribeRoutes = require('./SubscribeRoutes');
const UserRequestRoutes = require('./UserRequestRoutes');
const LinkResouceRoutes = require('./LinkResourceRoutes');

module.exports = _.extend({}, UserRoutes, TechnologyUserRoutes,
  TechnologyProviderRoutes, PostRoutes, PostViewRoutes,
  PostSaveRoutes, ReviewRoutes, TechnologyUserFileRoutes,
  NotificationRoutes, FavouriteCategoryRoutes, InformationRequestRoutes,
  FavouriteTechnologyProviderRoutes, LookupRoutes, SubscribeRoutes, UserRequestRoutes,
  LinkResouceRoutes,
);
