/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * import static test data
 *
 * @author      TCSCODER
 * @version     1.0
 */

const models = require('../src/models');
const co = require('co');
const logger = require('../src/common/logger');

const categories = require('./data/Categories.json');
const countries = require('./data/Countries.json');
const fAQItems = require('./data/FAQItems.json');
const users = require('./data/Users.json');
const technologyUsers = require('./data/TechnologyUsers.json');
const technologyProviders = require('./data/TechnologyProviders.json');
const technologyUserFiles = require('./data/TechnologyUserFiles.json');
const posts = require('./data/Posts.json');
const postSaves = require('./data/PostSaves.json');
const postViews = require('./data/PostViews.json');
const favouriteCategories = require('./data/FavouriteCategories.json');
const favouriteTechnologyProviders = require('./data/FavouriteTechnologyProviders.json');
const informationRequests = require('./data/InformationRequests.json');
const reviews = require('./data/Reviews.json');
const notifications = require('./data/Notifications.json');
const states = require('./data/States.json');

co(function* () {
  yield models.User.remove({});
  yield models.TechnologyUser.remove({});
  yield models.TechnologyProvider.remove({});
  yield models.Country.remove({});
  yield models.Category.remove({});
  yield models.InformationRequest.remove({});
  yield models.FavouriteTechnologyProvider.remove({});
  yield models.FavouriteCategory.remove({});
  yield models.FAQItem.remove({});
  yield models.Notification.remove({});
  yield models.Post.remove({});
  yield models.PostSave.remove({});
  yield models.PostView.remove({});
  yield models.Review.remove({});
  yield models.TechnologyUserFile.remove({});
  yield models.State.remove({});

  yield models.User.create(users);
  yield models.TechnologyUser.create(technologyUsers);
  yield models.TechnologyProvider.create(technologyProviders);
  yield models.Country.create(countries);
  yield models.Category.create(categories);
  yield models.InformationRequest.create(informationRequests);
  yield models.FavouriteTechnologyProvider.create(favouriteTechnologyProviders);
  yield models.FavouriteCategory.create(favouriteCategories);
  yield models.FAQItem.create(fAQItems);
  yield models.Notification.create(notifications);
  yield models.Post.create(posts);
  yield models.PostSave.create(postSaves);
  yield models.PostView.create(postViews);
  yield models.Review.create(reviews);
  yield models.TechnologyUserFile.create(technologyUserFiles);
  yield models.State.create(states);
  logger.info('import succeed!');
  process.exit(0);
}).catch((err) => {
  logger.logFullError(err);
  process.exit(1);
});
