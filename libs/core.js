'use strict';

let fs = require('fs')
let path = require('path')
let qs = require('qs')
let config = require('../config')

let walk = function(modulesPath, excludeDir, callback) {
    fs.readdirSync(modulesPath).forEach(function(file) {
        let newPath = path.join(modulesPath, file);
        let stat = fs.statSync(newPath);
        if (stat.isFile() && /(.*)\.(js|coffee)$/.test(file)) {
            callback(newPath);
        } else if (stat.isDirectory() && file !== excludeDir) {
            walk(newPath, excludeDir, callback);
        }
    });
};
exports.walk = walk;

exports.stringify = function(obj) {
    return qs.stringify(obj);
};

exports.translateAdminDir = function(p) {
    let newPath = (config.admin.dir ? '/' + config.admin.dir : '') + (p || '');
    return newPath;
};

exports.createPage = function(page = 0, total = 0, pageSize = 10) {
    let totalPage = Math.max(Math.ceil(total / pageSize), 1);
    let currentPage = page < 1 ? 1 : page > totalPage ? totalPage : page;
    let start = pageSize * (currentPage - 1);
    return {
        start: start,
        pageSize: pageSize,
        totalPage: totalPage,
        currentPage: currentPage
    };
};

exports.getRoles = function(user){
    let result = [];
    if(user && user.roles){
        user.roles.forEach(function(role){
            result.push(role.name);
        });
    }
    return result;
};

exports.getRoleStatus = function(user) {
    let result = [];
    if (user && user.roles) {
        user.roles.forEach(function(role) {
            result.push(role.status);
        });
    }
    return result;
};

exports.prettySlash = function(str) {
    return str.substr(-1) === '/' ? str : str + '/';
};

exports.fileToIcon = function(type) {
    let suffix = '';
    switch (type) {
        case 'text/html':
        case 'text/javascript':
            suffix = '-code-o';
            break;
        case 'application/pdf':
            suffix = '-pdf-o';
            break;
        case 'application/zip':
            suffix = '-zip-o';
            break;
        case 'application/msword':
            suffix = '-word-o';
            break;
        case 'image/png':
        case 'iamge/jpeg':
            suffix = '-photo-o';
            break;
        case 'audio/amr':
            suffix = '-audio-o';
            break;
        case 'video/mp4':
            suffix = '-video-o';
            break;
    }
    return 'fa-file' + suffix;
};
exports.getIp = function(req) {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress || req.ip;
};