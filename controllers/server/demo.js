'use strict';

let mongoose = require('mongoose')
let Demo = mongoose.model('Demo')
let _ = require('lodash')
let core = require('../../libs/core')
let demoService = require('../../services/demo')
let backPath = 'demo'

exports.list = async function(req, res) {
    let condition = {};
    try {
        let total = await demoService.count(condition);
        let pageInfo = core.createPage(req.query.page, total);
        let results = await demoService.find(condition,null,{
            skip: pageInfo.start,
            limit: pageInfo.pageSize,
            sort: {
                created: -1
            }
        });
        res.render('server/demo/list.hbs', {
            title: 'demo',
            tags: results,
            pageInfo: pageInfo,
            Menu: 'demo'
        });
    } catch (error) {
        console.error(error);
    }
};

exports.one = async function(req, res) {
    let id = req.params.id;
    try {
        let result = await demoService.findById(id).exec();
        res.render('server/demo/item.hbs', {
            Menu:"demo",
            title: result.name,
            demo: result
        });
    } catch (error) {
        return res.render('server/info.hbs', { layout:'layout-blank',
                message: '该demo不存在' ,backPath:backPath
            });
    }
};

exports.add = async function(req, res) {

    if (req.method === 'GET') {
        res.render('server/demo/add.hbs', {
            Menu: 'tag'
        });
    } else if (req.method === 'POST') {

        let obj = _.pick(req.body, 'name', 'description');
        console.log("ss")
        console.log(req.body)
        console.log(obj)
        let demo = new Demo(obj);
        demo.save(function(err, result) {
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

exports.edit = async function(req, res) {
    if(req.method === 'GET') {
        let id = req.params.id;
        let result = await demoService.findById(id).exec();
        res.render('server/demo/edit.hbs', {
            Menu:'demo',
            demo: result
        });
    } else if(req.method === 'POST') {
        let id = req.params.id;
        let obj = _.pick(req.body, 'name', 'description');
        let result = await demoService.findById(id).exec();
        _.assign(result, obj);
        result.save(function(err, demo) {
            if(!err) {
                res.render('server/info.hbs', { layout:'layout-blank',
                    message: '更新成功' ,backPath:backPath
                });
            }
        });
    }
};
exports.del = async function(req, res) {
    let id = req.params.id;
    try{
        let result = await demoService.findById(id).exec();
        result.remove(function(err) {
            if(err) {
                return res.render('server/info.hbs', { layout:'layout-blank',
                    message: '删除失败' ,backPath:backPath
                });
            }
            res.render('server/info.hbs', { layout:'layout-blank',
                message: '删除成功' ,backPath:backPath
            })
        });
    }catch(err){
        return res.render('server/info.hbs', { layout:'layout-blank',
                message: 'demo不存在' ,backPath:backPath
            });
    }
};