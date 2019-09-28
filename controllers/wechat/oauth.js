'use strict';

let util = require('../../libs/util')
let tokenService = require('../../services/wxtoken')
const qs = require('querystring');
let config = require('../../config')

exports.oauth = function(req,res){
    let router = 'userinfo';
    let return_uri='http://www.ravinpatodia.com/'+router;
    let queryParams = {
     'appid':config.wechat.appID,
     'redirect_uri':return_uri,
     'response_type':'code',
     'scope':config.wechat.scope,
     'state':'STATE'
    };
 
    let wxOauthBaseUrl = config.wechat.oauth2Api+qs.stringify(queryParams)+'#wechat_redirect';
    res.redirect(wxOauthBaseUrl);
 };

 let oauth_token = async function(code){
    let condition={};
    condition.type='authorization_code';
    try {
       let token = await tokenService.findOne(condition); 
       if(util.checkValidate(token)){
         console.log('checkValidate ok:'+token);
         return token.access_token;
       }else{
        let result = await tokenService.requestOauthToken(code);
        console.log('request token ok'+result);
        let expires_in = new Date();
        expires_in.setSeconds(expires_in.getSeconds() + result.expires_in);
        let obj ={};
        obj.access_token=result.access_token;
        obj.type='authorization_code';
        obj.expires_in=expires_in;
        let tokenDoc = await tokenService.findOneAndUpdate(condition,obj,{
          upsert: true,
          new: true});
        console.log(tokenDoc);
        return tokenDoc.access_token;
       } 
       
    } catch (error) {
      console.error(error);
    } 
};

exports.userinfo = async function(req,res){
    let wxcode = req.query.code;
    try {
        let token = await oauth_token(wxcode);
        let userinfo = await tokenService.getUserInfo(token);
        res.send("\
                         <h1>" + userinfo.nickname +" 的个人信息</h1>\
                         <p><img src='"+userinfo.headimgurl+"' /></p>\
                         <p>"+userinfo.city+"，"+userinfo.province+"，"+userinfo.country+"</p>\
                     ");
    } catch (error) {
        console.log(error);
    }
};