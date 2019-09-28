'use strict';

let mongoose = require('mongoose')
let Schema = mongoose.Schema

let WXTokenSchema = new Schema({
    access_token:{
        type:String
    },
    type:{
        type:String
    },
    expires_in:{
        type:Date,
        default: 0
    }
});
WXTokenSchema.methods = {

};

mongoose.model('WXToken', WXTokenSchema);