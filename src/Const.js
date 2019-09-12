/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the enum types
 *
 * @author      TCSCODER
 * @version     1.0
 */

const UserType = { technologyUser: 'technologyUser', technologyProvider: 'technologyProvider', admin: 'admin' };
const PostStatus = {
  draft: 'draft',
  published: 'published',
  scheduled: 'scheduled',
  deleted: 'deleted',
};
const PostSaveStatus = { active: 'active', expired: 'expired' };
const oneDayTime = 1000 * 60 * 60 * 24;
const PostExpirationOption = {
  oneDay: 'oneDay',
  oneWeek: 'oneWeek',
  oneMonth: 'oneMonth',
  sixMonths: 'sixMonths',
  oneYear: 'oneYear',
  fiveYears: 'fiveYears',
  never: 'never',
};

const PostExpirationOptionTime = {
  oneDay: oneDayTime,
  oneWeek: oneDayTime * 7,
  oneMonth: oneDayTime * 30,
  sixMonths: oneDayTime * 30 * 6,
  oneYear: oneDayTime * 365,
  fiveYears: oneDayTime * 365 * 5,
};

const PostScheduleOption = {
  immediately: 'immediately',
  threeDays: 'threeDays',
  oneWeek: 'oneWeek',
  twoWeeks: 'twoWeeks',
  threeWeeks: 'threeWeeks',
  oneMonth: 'oneMonth',
};

const PostScheduleOptionTime = {
  immediately: 0,
  threeDays: oneDayTime * 3,
  oneWeek: oneDayTime * 7,
  twoWeeks: oneDayTime * 7 * 2,
  threeWeeks: oneDayTime * 7 * 3,
  oneMonth: oneDayTime * 30,
};

const NotificationType = {
  newPostInFavouriteCategory: 'newPostInFavouriteCategory',
  updatePostByFavouriteProvider: 'updatePostByFavouriteProvider',
  newPostByFavouriteProvider: 'newPostByFavouriteProvider',
  providerFreezed: 'providerFreezed',
  system: 'system',
};

const NotificationStatus = { new: 'new', read: 'read' };
const InformationStatus = { new: 'new', answered: 'answered' };
const SocialAuthType = { facebook: 'facebook', google: 'google', linkedIn: 'linkedIn' };
const LinkResourceType = { user: 'user', provider: 'provider', both: 'both' };
module.exports = {
  UserType,
  PostStatus,
  PostSaveStatus,
  PostExpirationOption,
  PostScheduleOption,
  NotificationType,
  NotificationStatus,
  InformationStatus,
  SocialAuthType,
  PostExpirationOptionTime,
  PostScheduleOptionTime,
  LinkResourceType,
};
