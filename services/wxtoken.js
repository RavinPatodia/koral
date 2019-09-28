'use strict';

let mongoose = require('mongoose');
let _ = require('lodash');
const qs = require('querystring');
const request = require('request');
let WXToken = mongoose.model('WXToken');
let config = require('../config')
let baseServices = require('./base')(WXToken);

let services = {
    findBySome: function(id, populates) {
        return new Promise(function(resolve, reject) {
            let query = WXToken.findById(id)
            if (populates && populates.length > 0) {
                populates.forEach(function(item) {
                    query = query.populate(item);
                })
            }
            query.exec(function(err, result) {
                if (err) {
                    reject(err)
                } else {
                    resolve(result)
                }
            });
        })
    },
    getUserInfo: function(token){
        let reqUrl = config.wechat.userinfoApi;
    
        let reqParams = {
            access_token:token,
            openid:config.wechat.appID,
            lang:'zh_CN'
        };
    
        let options ={
            method:'get',
            url:reqUrl+qs.stringify(reqParams)
        };
        return new Promise(function(resolve,reject){
            request(options,function(err,res,body){
                if(res){
                    let userinfo = JSON.parse(body);
                    console.log('get userinfo successful');
                    resolve(userinfo);
                } else {
                    reject(err);
                }
            });
        })
    },
    requestToken: function(){
        let params = {
            'grant_type':'client_credential',
            'appid':config.wechat.appID,
            'secret':config.wechat.appsecret
        };
        let reqUrl =config.wechat.accessTokenApi+qs.stringify(params);
        let options ={
            method:'GET',
            url:reqUrl
        };
        return new Promise(function (resolve,reject){
            request(options,function(err,res,body){
                if(err){
                    reject(err);
                }else{
                    resolve(JSON.parse(body));
                }
            });
        });
    },
    createMenu: function(token){
        let menus = {
            "button": [
                {
                    "name":"课程",
                    "sub_button":[
                        {
                            "type":"view",
                            "name":"查询",
                            "url":"https://www.baidu.com/"
                        }]
                },
                {    
                     "type":"view",
                     "name":"成绩",
                     "url":"https://www.baidu.com/"
                 },
                 {    
                     "type":"view",
                     "name":"授权",
                     "url": "http://www.ravinpatodia.com/oauth"
                   }]
           };
    
        let options = {
            url: config.wechat.createMenuApi+token,
            form: JSON.stringify(menus),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          };
        return new Promise(function(resolve,reject){
            request.post(options,function(err,res,body){
                if(err){
                    reject(err);
                }else{
                    resolve(JSON.parse(body));
                }
            })
        })
    },
    requestOauthToken: function(code){
        let reqParams = {
            'appid':config.wechat.appID,
            'secret':config.wechat.appsecret,
            'code':code,
            'grant_type':'authorization_code'
        };
    
        let reqUrl = config.wechat.oauth2TokenApi+qs.stringify(reqParams);
        let options ={
            method:'GET',
            url:reqUrl
        };
        return new Promise(function (resolve,reject){
             request(options,function(err,res,body){
                 if(res){
                    resolve(JSON.parse(body));
                 }else{
                     reject(err);
                 }
             });
         });
    }
    
};

module.exports = _.assign({}, baseServices, services);