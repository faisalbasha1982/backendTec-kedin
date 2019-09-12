## TeckedIn backend

## Install software

- node 8.2.0
- npm 5.x
- mongodb 3.4.7  https://www.mongodb.com/download-center?ct=false#community



## Local deployment

first, you need startup mongodb , modify *db.*url in *config/default.js* for your db url(you don't need to modify it if you startup mongodb with default config in local).

1. open terminal to project root dir ,Install node dependencies using `npm install`
2. check code with `npm run lint`
3. enable it https://myaccount.google.com/lesssecureapps , and open *config/default.js* , enter your gmail **user and pass** at *email.auth*.
4. create static test data run `npm run testdata`, **it will drop all tables and create tables.**
5. run server `npm run start`.


## AWS ec2 deployment

- connect to ec2 instance , and make sure you installed node and mongodb
- install pm2 `npm install pm2 -g`
- startup mongodb
- `git clone <teched-in backend git repo url>` clone the master branch backend code , and goto the teckin-backend folder


- update *env.config* , like *env.config.example*
- `source env.config`  inject env values
- `npm i` install node dependencies 
- `npm run pm2` use pm2 startup and manager the node backend program

## Heroku deployment

- git init
- git add .
- git commit -m "init"
- heroku create
- heroku config:set EMAIL_USER=your@gmail.com EMAIL_PASS=yourpassword MONGOLAB_URI=your mongodb url HOST=heroku instance url

## Test & verification

### api endpoints

1. open postman 

2. import *docs/TECKEDIN_BACKEND.postman_collection.json* , *TECKEDIN_ENV.postman_environment.json*.

3. test data create 4 users , all users password is *123456*.

   1. TechnologyUser *user0@email.com*
   2. TechnologyProvider *provider0@email*.com  - *provider2@email.com*

4. test api endpoints.

   #### notes

   - *GET {{URL}}/posts/{id}/email*, *POST {{URL}}/signup*, POST *{{URL}}/initiateForgotPassword* need use yourself email address, please modify it.
   - POST/PUT/DELETE *{{URL}}/technologyProviders*, POST/DELETE/PUT *{{URL}}/posts* need login as technologyProvider (you can use user api -> {{URL}}/login - TechnologyProvider to login), otherwise it always return 403.
   - postsave, favCategory, favProvider post endpoints may return 409 status (because i  already create entity for it) , you may need delete exist enti and try it again.
   - **please use delete endpoints carefully, because other post/put endpoints need these data, i recommend  you test the delete endpoints in the end.**


# Configuration

| key                        | system Environment name | description                              |
| -------------------------- | ----------------------- | ---------------------------------------- |
| WEB_SERVER_PORT            | WEB_SERVER_PORT         | the server port                          |
| CLIENT_ID                  | CLIENT_ID               | the jwt client id                        |
| CLIENT_SECRET              | CLIENT_SECRET           | the jwt client secret                    |
| email                      |                         | the email config used for nodermail , default use gmail , you need update user and pass. |
| db.url                     | MONGOLAB_URI            | the mongodb connect uri , for example "mongodb://localhost:27017/TECKEDIN_DEV |
| IMAGES_PATH                | IMAGES_PATH             | the upload dir full path , current used for upload user photos and files. |
| verifyEmailContent         |                         | the verify email content that send to user email address to verify email |
| forgotPasswordEmailContent |                         | when user request  initiateForgotPassword endpoint, backend will according this email content send an email to user |
| postEmailContent           |                         | this email content that will contain the post object send to user |





## Modification 

- add *POST /technologyUsers/:id/upload*,*POST /technologyUserFiles/:id/upload* endpoints to upload photo and files.
- add types,keyword in GET / faqItems


## Notes 

- postsave, favCategory, favProvider, review need return 409 if entity already exist, i think deeply . **the postview can create same entity(create time different) many times**, because every time reading post, it should create postview object), but the time tight, i didn't confirm it in froum, but i am sure , it should be this logic.
- unread notification need deleted if post deleted. https://apps.topcoder.com/forums/?module=Thread&threadID=904737&start=0
- notification can only search/get by himself.
- most of put/post/delete endpoint need to check permission(like user cannot delete/update other's entity).
- user cannot login if he didn't verified his email address.



#Video
<https://youtu.be/5ys01eruCJs>
