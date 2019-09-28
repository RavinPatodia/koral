'use strict';

let express = require('express')
let router = express.Router()
let index = require('../../controllers/wechat/wechat')

router.route('/').all(index.auth);

module.exports = function(app) {
    app.use('/', router);
};
