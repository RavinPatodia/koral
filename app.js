'use strict';

let express =require('express');
let appPath = process.cwd();
let config = require('./config');
let core = require('./libs/core');
let app = express();

core.walk(appPath + '/routes', 'middlewares', function(path) {
    require(path)(app);
});

app.set('port', process.env.PORT || config.port || 8080);
let server = app.listen(app.get('port'), function() {
    console.log('服务已经启动，端口号： ' + server.address().port);
});