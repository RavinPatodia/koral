'use strict';

let crypto = require('crypto')
let _ = require('lodash')
let mongoose = require('mongoose')
let Schema = mongoose.Schema

let UserSchema = new Schema({
    username:{
        type:String,
        required:'',
        unique:true
    },

    email:{
        type:String,
        required:'',
        unique:true
    },

    mobile:{
        type:String
    },

    name:{
        type:String,
        require:''
    },

    avatar:{
        type:String
    },

    gender:{
        type:String,
        enum:['','','']
    },

    birthday:{
        type:Date,
        default:Date.now
    },

    description:{
        type:String
    },

    address:{
        type: String
    },

    roles:[{
        type:Schema.ObjectId,
        ref:'Roles'
    }],

    last_login_date: Date,

    last_login_ip: String,

    position: {
        type: Array,
        index: '2dsphere'
    },

    reg_ip: String,

    created: {
        type: Date,
        default: Date.now
    },

    author: {
        type: Schema.ObjectId,
        ref: 'User'
    },

    status: {
        type: Number,
        default: 0
    },

    rank: {
        type: Number,
        default: 0
    },

    forget: {
        hash: String,
        till: Date
    },

    questions: [{
        q: String,
        a: String
    }],

    salt: String,

    hashed_password: String,
    activeKey: String,
    isActive: {
        type: Boolean,
        default: false
    },
    token: String,
    token_version: {
        type: Number,
        default: 0
    }
});

UserSchema.virtual('password').set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.hashPassword(password);
}).get(function() {
    return this._password;
});

UserSchema.path('name').validate(function(name) {
    return (typeof name === 'string' && name.length >= 1 && name.length <= 50);
}, '名字在1-50个字符之间');

UserSchema.path('email').validate(function(email) {
    return (typeof email === 'string' && email.length > 0);
}, 'Email不能为空');
UserSchema.path('email').validate(function(email) {
    return /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/.test(email);
}, 'Email格式不正确');

UserSchema.path('username').validate(function(username) {
    return (typeof username === 'string' && username.length >= 4 && username.length <= 20);
}, '用户名为4-20个字符');
UserSchema.path('username').validate(function(username) {
    return /^\w+$/.test(username);
}, '用户名只能为a-zA-Z0-9_');

UserSchema.methods = {

    /**
     * HasRole - check if the user has required role
     *
     * @param {String} plainText
     * @return {Boolean}
     * @api public
     */
    //通过角色名判断权限
    hasRole: function(role) {
        let roles = [];
        this.roles.forEach(function(item) {
            roles = _.union(roles, item.name);
        });
        return (roles.indexOf(role) !== -1);
    },
    //通过动作判断权限
    hasAction: function(action) {
        let actions = [];
        this.roles.forEach(function(item) {
            actions = _.union(actions, item.actions);
        });
        return (actions.indexOf(action) !== -1);
    },
    roleToObj: function() {
        let roles = [];
        let actions = [];
        this.roles.forEach(function(item) {
            roles = _.union(roles, item.name);
            actions = _.union(actions, item.actions);
        });
        return {
            _roles: roles,
            _actions: actions
        };
    },

    authenticate: function(plainText) {
        return this.hashPassword(plainText) === this.hashed_password;
    },
    makeSalt: function() {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    },
    hashPassword: function(password) {
        if (!password) return '';
        let encrypred;
        try {
            encrypred = crypto.createHmac('sha1', this.salt).update(password).digest('hex');
            return encrypred;
        } catch (err) {
            return '';
        }
    }
};

mongoose.model('User',UserSchema);
