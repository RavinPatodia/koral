'use strict';

let mongoose = require('mongoose')
const crypto = require('crypto');
let WXToken = mongoose.model('WXToken')
let _ = require('lodash')
let core = require('../../libs/core')
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