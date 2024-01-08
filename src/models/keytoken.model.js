'use strict';

const mongoose = require('mongoose');

const DOCUMENT_NAME = 'Key';
const COLLECTION_NAME = 'Keys';

var keyTokenSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Shop'
    },
    publicKey:{
        type: String,
        required: true
    },
    refreshToken:{
        type: Array,
        default: []
    },
}, {
    collection: COLLECTION_NAME,
    timestamps: true
});

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, keyTokenSchema);