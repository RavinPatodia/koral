'use strict';

let express = require('express')
let router = express.Router()
let index = require('../../controllers/wechat/index')
let accessToken = require('../../controllers/wechat/accesstoken')
let testToken = require('../../controllers/wechat/test')
let oauthToken = require('../../controllers/wechat/oauth')
router.route('/').all(index.auth);
router.route('/token').get(accessToken.token);
router.route('/create_menu').all(accessToken.createMenu);
router.route('/oauth').get(oauthToken.oauth);
router.route('/userinfo').get(oauthToken.userinfo);
router.route('/find_access_token').get(testToken.find_access_token);
router.route('/find_oauth_token').get(testToken.find_oauth_token);
router.route('/create_access_token').get(testToken.create_access_token);
router.route('/create_oauth_token').get(testToken.create_oauth_token);
module.exports = function(app) {
    app.use('/', router);
};
