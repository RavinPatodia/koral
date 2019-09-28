'use strict';
let _ = require('lodash')

let util = require('../../libs/util')
let tokenService = require('../../services/wxtoken')

let client_token = async function(){
    let condition={};
    condition.type='client_credential';
    try {
       let token = await tokenService.findOne(condition); 
       if(util.checkValidate(token)){
         console.log('checkValidate ok:'+token);
         return token.access_token;
       }else{
        let result = await tokenService.requestToken();
        console.log('request token ok'+result);
        let expires_in = new Date();
        expires_in.setSeconds(expires_in.getSeconds() + result.expires_in);
        let obj ={};
        obj.access_token=result.access_token;
        obj.type='client_credential';
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

exports.token = async function(req, res) {
 let token = await client_token();
 res.json(token);
};

exports.createMenu = async function(req, res) {
    try {
     let token = await client_token();
     console.log(token);
     let result = await tokenService.createMenu(token);
     res.json(result);
    } catch (error) {
     console.log(error);
    }
    
   };