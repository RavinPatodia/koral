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
router.route('/:id').get(tag.one);
router.route('/:id/edit').all(tag.edit);
router.route('/:id/del').all(tag.del);

module.exports = function(app) {
    let path = core.translateAdminDir('/demo');
    app.use(path, router);
};
