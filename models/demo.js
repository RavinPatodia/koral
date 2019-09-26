'use strict';

let mongoose = require('mongoose')
let Schema = mongoose.Schema

let DemoSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    created: {
        type: Date,
        default: Date.now
    },
    status: {
        type: Number,
        default: 0
    }
});
DemoSchema.methods = {

};

mongoose.model('Demo', DemoSchema);