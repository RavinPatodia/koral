'use strict';

let mongoose = require('mongoose')
const crypto = require('crypto');
let _ = require('lodash')
let core = require('../../libs/core')
let util = require('../../libs/util')
let tokenService = require('../../services/wxtoken')
let config = require('../../config')

exports.auth = function(req, res) {
    let signature = req.query.signature;
    let timestamp = req.query.timestamp;
    let nonce =req.query.nonce;
    let echostr = req.query.echostr;
  
    let array = [config.wechat.token,timestamp,nonce];
    array.sort();
    
    let sortStr = array.join('');
    const hashCode = crypto.createHash('sha1');
    let sha1Str = hashCode.update(sortStr,'ytf8').digest('hex');
   
    if(sha1Str === signature){
      res.send(echostr);
    }else{
      res.send('error');
    }
};

exports.client_token = async function(){
    let condition={};
    condition.grant_type='client_credential';
    try {
      let token = await tokenService.findOne(condition); 
       if(util.checkValidate(token)){
         return token.access_token;
       }else{
         let result = await tokenService.requestToken();
         let expires_in = new Date();
         expires_in.setSeconds(now.getSeconds() + result.expires_in);
         let obj ={};
         obj.access_token=result.access_token;
         obj.expires_in=expires_in;
         /**
          let tokenDoc = await tokenService.findOneAndUpdate(condition,obj,{
          upsert: true,
          new: true});
          */
         let tokenDoc = await tokenService.create(obj);
         console.log(tokenDoc);
          return tokenDoc.access_token;
       }
    } catch (error) {
      console.error(error);
    } 
};

exports.token = async function(req, res) {
 let token = await this.client_token();
 res.json(token);
};