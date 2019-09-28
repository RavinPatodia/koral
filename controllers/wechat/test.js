'use strict';
let _ = require('lodash')
let tokenService = require('../../services/wxtoken')

exports.find_access_token = async function(req, res) {
    let condition={};
    condition.type='client_credential';
    try {
       let token = await tokenService.findOne(condition); 
       res.json(token);
       
    } catch (error) {
      console.error(error);
    } 

};
exports.find_oauth_token = async function(req, res) {
    let condition={};
    condition.type='authorization_code';
    try {
       let token = await tokenService.findOne(condition); 
       res.json(token);
       
    } catch (error) {
      console.error(error);
    } 

};

exports.create_access_token = async function(req, res) {
    let obj={};
    obj.access_token='';
    obj.type='client_credential';
    obj.expires_in=new Date();
    try {
       let token = await tokenService.create(obj); 
       res.json(token);
       
    } catch (error) {
      console.error(error);
    } 

};
exports.create_oauth_token = async function(req, res) {
    let obj={};
    obj.access_token='';
    obj.type='authorization_code';
    obj.expires_in=new Date();
    try {
       let token = await tokenService.create(obj); 
       res.json(token);
       
    } catch (error) {
      console.error(error);
    } 

};