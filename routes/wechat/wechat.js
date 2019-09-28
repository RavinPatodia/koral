'use strict';

let express = require('express')
let router = express.Router()
let index = require('../../controllers/wechat/wechat')

router.route('/').all(index.auth);
router.route('/token').get(index.token);
module.exports = function(app) {
    app.use('/', router);
};
