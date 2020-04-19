'use strict';

let express = require('express')
let router = express.Router()
let core = require('../../libs/core')
let script = require('../../controllers/server/script')

router.use(function(req, res, next) {
    console.log('标签页: ' + Date.now());
    res.locals.Path = 'script';
    next();
});
router.route('/run').post(script.run);

module.exports = function(app) {
    let path = core.translateAdminDir('/script');
    app.use(path, router);
};
