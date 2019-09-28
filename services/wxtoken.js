'use strict';

let mongoose = require('mongoose');
let _ = require('lodash');
const qs = require('querystring');
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
    
    requestToken: function(){
        let params = {
            'grant_type':'client_credential',
            'appid':config.wechat.appID,
            'secret':config.wechat.appsecret
        };
        let requestUrl =config.wechat.accessTokenApi+qs.stringify(params);
        let options ={
            method:'GET',
            url:requestUrl
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
    }
    
};

module.exports = _.assign({}, baseServices, services);