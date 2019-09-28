'use strict';

let express =require('express');
let appPath = process.cwd();
let path = require('path');
let config = require('./config');
let core = require('./libs/core');
let mongoose = require('mongoose');
let compression = require('compression');
let moment = require('moment');
let _ = require('lodash');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let app = express();

app.use(compression());
moment.locale('zh-cn');
mongoose.Promise = global.Promise;
mongoose.connect(config.mongodb.uri, {
    useMongoClient: true
}).then(function(db) {
    console.log(config.mongodb.uri)
    console.log('mongodb connection successful')
}, function(err) {
    console.log('mongodb connection fail', err)
});

core.walk(appPath + '/models', null, function(path) {
    require(path);
});

/**
 * hbs
 */
var handlebars  = require('express-handlebars');
var hbs = handlebars.create({
    layoutsDir: __dirname+'/views/layouts/',
    partialsDir: __dirname+'/views/partials/',
    defaultLayout: 'layout',
    extname:'hbs',
    helpers : {
        section: function (name, options) {
            if (!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        },
        compare: function (left, operator, right, options) {
            if (arguments.length < 3) {
                throw new Error('Handlerbars Helper "compare" needs 2 parameters');
            }
            var operators = {
                '==': function (l, r) {
                    return l == r;
                },
                '===': function (l, r) {
                    return l === r;
                },
                '!=': function (l, r) {
                    return l != r;
                },
                '!==': function (l, r) {
                    return l !== r;
                },
                '<': function (l, r) {
                    return l < r;
                },
                '>': function (l, r) {
                    return l > r;
                },
                '<=': function (l, r) {
                    return l <= r;
                },
                '>=': function (l, r) {
                    return l >= r;
                },
                'typeof': function (l, r) {
                    return typeof l == r;
                },
                'contains': function (l, r) {
                    return l.indexOf(r) > -1
                }
            };
            if (!operators[operator]) {
                throw new Error('Handlerbars Helper "compare" doesn\'t know the operator ' + operator);
            }
            var result = operators[operator](left, right);
            if (result) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        },
        where: function (collection, key, value, limit, options) {
            options = options || limit;
            if (typeof limit !== 'number') limit = Infinity;
            var matches = 0;
            var result = '';
            for (var i = 0; i < collection.length; i++) {
                if (collection[i][key] === value) {
                    result += options.fn(collection[i]);
                    matches++;
                    if (matches === limit) return result;
                }
            }
            return result;
        },
        avatar: function (userEmail, options) {
            return gravatar.url(userEmail || '', {s: '40', r: 'x', d: 'retro'}, true)
        },//定义模版头像
        hasMoudle: function (user, roles, actions, action_moudle, options)//moudle是左侧菜单模块,其中user是当前模块req返回到模板的User,roles是当前模块req返回到模板的Roles,actions是当前模块req返回到模板的Actions,action_moudle是当前helper作用域所在的模块名称
        {
            if (user && actions.indexOf(action_moudle) > -1 || roles.indexOf('admin') > -1) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }

        },
        pagination: function (pageInfo, options) {

            var totalPage = pageInfo.totalPage;
            var range = 3;
            var currentPage = Math.min(pageInfo.currentPage, pageInfo.totalPage);
            var prevPage = (currentPage - 1) || 1;
            var nextPage = currentPage >= pageInfo.totalPage ? pageInfo.totalPage : (currentPage + 1);
            var query = pageInfo.query || {};


            var html_prev = function () {
                query.page = prevPage
                var prev_status = '';
                if (currentPage === 1) {
                    prev_status = 'disabled'
                }
                return "<li class='" + prev_status + "'><a href='?" + core.stringify(query) + "'>&laquo;</a></li>";
            }
            var html_prev_omit = function () {
                if (currentPage - range >= 2) {
                    query.page = 1
                    var prev_omit_status = '';
                    if (currentPage === 1) {
                        prev_omit_status = 'active'
                    }
                    return "<li class='" + prev_omit_status + "'><a href='?" + core.stringify(query) + "'>1</a></li><li><a>...</a></li>"
                } else {
                    return "";
                }
            }
            var html_main = function () {
                var html_str = '';
                var status = '';
                for (var i = 1; i <= totalPage; i++) {
                    query.page = i;
                    if (i >= Math.min(Math.max(currentPage - range, 1), totalPage - 2 * range) && i <= Math.max(Math.min(range + currentPage, totalPage), 2 * range)) {
                        status = currentPage === i ? 'active' : '';
                        html_str += "<li class='" + status + "'><a href='?" + core.stringify(query) + "'>" + i + "</a></li>"
                    }
                }
                return html_str;
            }
            var html_next_omit = function () {
                if (currentPage + range <= totalPage - 1) {
                    query.page = totalPage
                    var next_omit_status = '';
                    if (currentPage === totalPage) {
                        next_omit_status = 'active'
                    }
                    return "<li><a>...</a></li><li class='" + next_omit_status + "'><a href='?" + core.stringify(query) + "'>" + totalPage + "</a></li>"
                } else {
                    return '';
                }
            }
            var html_next = function () {
                query.page = nextPage
                var next_status = '';
                if (currentPage === totalPage) {
                    next_status = 'disabled'
                }
                return "<li class='" + next_status + "'><a href='?" + core.stringify(query) + "'>&raquo;</a></li>";
            }


            return html_prev() + html_prev_omit() + html_main() + html_next_omit() + html_next()
        },
        css: function (str, option) {
            var cssList = this.cssList || [];
            str = str.split(/[,，;；]/);
            console.log('css: ', str);
            str.forEach(function (item) {
                if (cssList.indexOf(item) < 0) {
                    cssList.push(item);
                }
            });
            this.cssList = cssList.concat();
        },
        js: function (str, option) {
            var jsList = this.jsList || [];
            str = str.split(/[,，;；]/);
            console.log('js: ', str);
            str.forEach(function (item) {
                if (jsList.indexOf(item) < 0) {
                    jsList.push(item);
                }
            });
            this.jsList = jsList.concat();
        },
        dateFormat: function (date, format, option) {
            var o = {
                "M+": date.getMonth() + 1, //month
                "d+": date.getDate(),    //day
                "h+": date.getHours(),   //hour
                "m+": date.getMinutes(), //minute
                "s+": date.getSeconds(), //second
                "q+": Math.floor((date.getMonth() + 3) / 3),  //quarter
                "S": date.getMilliseconds() //millisecond
            }
            if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
                (date.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o) if (new RegExp("(" + k + ")").test(format))
                format = format.replace(RegExp.$1,
                    RegExp.$1.length == 1 ? o[k] :
                        ("00" + o[k]).substr(("" + o[k]).length));
            return format;

        },
        dateFromNow: function (date) {
            return moment(date).fromNow()
        },
        strip100: function (content) {
            return strip(marked(content)).substr(0,120)
        },
        filterContent: function (content) {
            return xss(marked(content))
        }


    }
});
app.engine('html', hbs.engine);
app.engine('hbs', hbs.engine);
app.set('views', path.join(__dirname, 'views'));

if (config.env === 'production') {
    app.enable('view cache');
}


app.locals = {
    title: config.title || 'koral',
    keywords:'node.js,koral',
    description:'koral web service system',
    core: core,
    moment: moment,
    _: _,
    config: config,
    adminDir: config.admin.dir ? ('/' + config.admin.dir) : '',
    env: config.env
};

app.set('config', config);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

/** 
app.use(function(req, res, next) {
    let err = new Error('页面不存在');
    err.status = 404;
    next(err);
});
*/
app.use(express.static(path.join(__dirname, 'public')));

core.walk(appPath + '/routes/server', 'middlewares', function(path) {
    require(path)(app);
});

app.set('port', process.env.PORT || config.port || 8080);
let server = app.listen(app.get('port'), function() {
    console.log('服务已经启动，端口号： ' + server.address().port);
});