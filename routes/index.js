'use strict';

let express = require('express')
let router = express.Router()
let index = require('../controllers/index')

router.route('/').all(index.index);

module.exports = function(app){
    app.use('/',router);
}