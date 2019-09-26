'use strict';

let express = require('express')
let router = express.Router()
let core = require('../../libs/core')
let demo = require('../../controllers/server/demo')

router.use(function(req, res, next) {
    console.log('标签页: ' + Date.now());
    res.locals.Path = 'demo';
    next();
});
router.route('/').get(demo.list);
router.route('/add').all(demo.add);
router.route('/:id').get(demo.one);
router.route('/:id/edit').all(demo.edit);
router.route('/:id/del').all(demo.del);

module.exports = function(app) {
    let path = core.translateAdminDir('/demo');
    app.use(path, router);
};
