'use strict';

let appPath = process.cwd();
let config = {
    port: 8080,
    env:process.env.NODE_ENV || 'development',
    mongodb: {
        uri: 'mongodb://localhost:27017/blog',
        options: {}
    },
    wechat:{
        token:'test',
        appID:'wxabc82c1261260125',
        appsecret:'facef4ec57a5965b24fb3a6a732e4a2e',
        scope:'snsapi_userinfo',
        apiDomain:"https://api.weixin.qq.com",
        oauth2Api:'https://open.weixin.qq.com/connect/oauth2/authorize?',
        oauth2TokenApi:'https://api.weixin.qq.com/sns/oauth2/access_token?',
        userinfoApi:'https://api.weixin.qq.com/sns/userinfo?',
        accessTokenApi:'https://api.weixin.qq.com/cgi-bin/token?',
        createMenuApi:'https://api.weixin.qq.com/cgi-bin/menu/create?access_token='
    },
    title:'',
    admin: {
        dir: 'admin',
        role: {
            admin: 'admin',
            user: 'user'
        }
    },
}