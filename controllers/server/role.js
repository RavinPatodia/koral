'use strict';

let mongoose = require('mongoose')
let Role = mongoose.model('Role')
let userController = require('./user')
let _ = require('lodash')
let core = require('../../libs/core')
const ACTIONS = require('../../public/actions')
let backPath = 'role'
//列表
exports.list = function(req, res) {
    let condition = {};
    if(req.Roles && req.Roles.indexOf('admin') < 0) {
        condition.author = req.session.user._id;
    }
    Role.count(condition, function(err, total) {
        let query = Role.find(condition).populate('author');
        //分页
        let pageInfo = core.createPage(req.query.page, total);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        query.exec(function(err, results) {
            //console.log(results)
            res.render('server/role/list.hbs', {
                roles: results,
                pageInfo: pageInfo,
                Menu: 'role'
            });
        });
    })
};
//单条
exports.one = function(req, res) {
    let id = req.params.id;
    Role.findById(id).populate('author').exec(function(err, result) {
        console.log(result);
        if(!result) {
            return res.render('server/info.hbs', { layout:'layout-blank',
                message: '该内容不存在' ,backPath:backPath
            });
        }

        res.render('server/role/item.hbs', {
            Menu:'role',
            title: result.name,
            role: result
        });
    });
};
//添加
exports.add = function(req, res) {
    if (req.method === 'GET') {
        let actions = [];
        if (req.Roles.indexOf('admin') > -1) {
            actions = ACTIONS;
        } else {
            actions = ACTIONS.filter(function(item) {
                let items = item.actions.filter(function(act) {
                    return req.Actions.indexOf(act.value) > -1;
                });
                if (items.length > 0) {
                    return item;
                }
            })
        }
        res.render('server/role/add.hbs', {
            Menu:'role',
            ACTIONS: actions
        });
    } else if (req.method === 'POST') {
        let obj = _.pick(req.body, 'name', 'actions', 'description');
        //转为数组格式
        let actions = obj.actions;
        obj.actions = _.uniq(actions);
        //如果不是管理员，检查是否超出权限
        if(req.Roles.indexOf('admin') === -1) {
            let overAuth = _.difference(obj.actions, req.Actions);//返回第一个参数不同于第二个参数的条目
            if(overAuth.length > 0) {
                return res.render('server/info.hbs', { layout:'layout-blank',
                    message: '你不能操作如下权限:' + overAuth.join(',') ,backPath:backPath
                });
            }
        }
        if (req.session.user) {
            obj.author = req.session.user._id;
        }
        let role = new Role(obj);
        role.save(function(err, role) {
            if (req.xhr) {
                return res.json({
                    status: !err
                })
            }
            if (err) {
                return res.render('server/info.hbs', { layout:'layout-blank',
                    message: '创建失败' ,backPath:backPath
                });
            }
            res.render('server/info.hbs', { layout:'layout-blank',
                message: '创建成功' ,backPath:backPath
            });
        });
    }
};
exports.edit = function(req, res) {
    if(req.method === 'GET') {
        let id = req.params.id;
        Role.findById(id).populate('author').exec(function(err, result) {
            let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
            let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

            if(!isAdmin && !isAuthor) {
                return res.render('server/info.hbs', { layout:'layout-blank',
                    message: '没有权限' ,backPath:backPath
                });
            }
            if(result.status === 201) {
                return res.render('server/info.hbs', { layout:'layout-blank',
                    message: '系统默认管理员角色不可修改' ,backPath:backPath
                });   
            }
            //console.log(result)
            let actions = [];
            if (req.Roles.indexOf('admin') > -1) {
                actions = ACTIONS;
            } else {
                actions = ACTIONS.filter(function(item) {
                    let items = item.actions.filter(function(act) {
                        return req.Actions.indexOf(act.value) > -1;
                    });
                    if (items.length > 0) {
                        return item;
                    }
                })
            }
            res.render('server/role/edit.hbs', {
                Menu:'role',
                data: result,
                ACTIONS: actions
            });
        });
    } else if(req.method === 'POST') {
        let id = req.params.id;
        let obj = _.pick(req.body, 'name', 'actions', 'description');
        //转为数组格式
        let actions = obj.actions;
        obj.actions = _.uniq(actions);
        Role.findById(id).populate('author').exec(function(err, result) {
            let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
            let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

            if(!isAdmin && !isAuthor) {
                return res.render('server/info.hbs', { layout:'layout-blank',
                    message: '没有权限' ,backPath:backPath
                });
            }
            if(result.status === 201) {
                return res.render('server/info.hbs', { layout:'layout-blank',
                    message: '系统默认管理员角色不可修改' ,backPath:backPath
                });   
            }
            //如果不是管理员，检查是否超出权限
            if(req.Roles.indexOf('admin') === -1) {
                let overAuth = _.difference(obj.actions, req.Actions);//返回第一个参数不同于第二个参数的条目
                if(overAuth.length > 0) {
                    return res.render('server/info.hbs', { layout:'layout-blank',
                        message: '你不能操作如下权限:' + overAuth.join(',') ,backPath:backPath
                    });
                }
            }
            _.assign(result, obj);
            result.save(function(err, role) {
                if (req.xhr) {
                    return res.json({
                        status: !err
                    })
                }
                if(err || !role) {
                    return res.render('server/info.hbs', { layout:'layout-blank',
                        message: '更新失败' ,backPath:backPath
                    });
                }
                //重置session信息
                userController.reload(req.session.user._id, function(err, user) {
                    req.session.user = user;
                    res.locals.User = user;
                    if(!err) {
                        res.render('server/info.hbs', { layout:'layout-blank',
                            message: '更新成功' ,backPath:backPath
                        });
                    }
                });
            });
        });
    }
};
//删除
exports.del = function(req, res) {
    let id = req.params.id;
    Role.findById(id).populate('author').exec(function(err, result) {
        if(!result) {
            return res.render('server/info.hbs', { layout:'layout-blank',
                message: '角色不存在' ,backPath:backPath
            });
        }
        let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
        let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

        if(!isAdmin && !isAuthor) {
            return res.render('server/info.hbs', { layout:'layout-blank',
                message: '没有权限' ,backPath:backPath
            });
        }
        if(result.status === 201 || result.status === 202) {
            return res.render('server/info.hbs', { layout:'layout-blank',
                message: '系统默认角色不可删除' ,backPath:backPath
            });   
        }
        result.remove(function(err) {
            if (req.xhr) {
                return res.json({
                    status: !err
                })
            }
            if(err) {
                return res.render('server/info.hbs', { layout:'layout-blank',
                    message: '删除失败' ,backPath:backPath
                });
            }
            /*res.render('server/info.hbs', { layout:'layout-blank',
                message: '删除成功'
            })*/
            //重置session信息
            userController.reload(req.session.user._id, function(err, user) {
                req.session.user = user;
                res.locals.User = user;
                if(!err) {
                    res.render('server/info.hbs', { layout:'layout-blank',
                        message: '删除成功' ,backPath:backPath
                    });
                }
            });
        });
    });
};