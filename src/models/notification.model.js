'use strict';

const mongoose = require('mongoose');

const DOCUMENT_NAME = 'Notification';
const COLLECTION_NAME = 'Notifications';

var notificationSchema = new mongoose.Schema({
    noti_type: {
        type: String,
        enum: ['ORDER-STATUS-001', 'ORDER_STATUS-002', 'PROMOTION-001', 'SHOP-001'],
        required: true
    },
    noti_senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },
    noti_receiverId: {
        type: Number,
        required: true
    },
    noti_content: {
        type: String,
        required: true
    },
    noti_options: {
        type: Object,
        default: {}
    }
},{
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, notificationSchema);