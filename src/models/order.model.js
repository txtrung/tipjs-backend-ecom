'use strict';

const mongoose = require('mongoose');

const DOCUMENT_NAME = 'Order';
const COLLECTION_NAME = 'Orders';

const orderSchema = new mongoose.Schema({
    order_userId: { type: Number, required: true},
    order_checkout: { type: Object, default: {}},
    order_shipping: { type: Object, default: {}},
    order_payment: { type: Object, default: {}},
    order_products: { type: Array, required: true},
    order_trackingNumber: { type: String, default: '#000000'},
    order_status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'cancelled', 'deliveried'], default: 'pending'}
},{
    collection: COLLECTION_NAME,
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'modifiedOn'
    }
});

module.exports = {
    order: mongoose.model(DOCUMENT_NAME,orderSchema)
}
