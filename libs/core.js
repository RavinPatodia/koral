'use strict';

let fs = require('fs')
let path = require('path')
let qs = require('qs')

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