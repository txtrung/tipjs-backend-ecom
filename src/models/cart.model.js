'use strict';

const mongoose = require('mongoose');

const DOCUMENT_NAME = 'Cart';
const COLLECTION_NAME = 'Carts';

const cartSchema = new mongoose.Schema({
    cart_state: {
        type: String,
        required: true,
        enum: ['active','completed','pending','failed'],
        default: 'active'
    },
    cart_products: {
        type: Array,
        required: true,
        default: []
    },
    cart_count_product: {
        type: Number,
        default: 0
    },
    cart_userId: {
        type: Number,
        required: true
    }
},{
    collection: COLLECTION_NAME,
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'modifiedOn'
    }
});

module.exports = {
    cart: mongoose.model(DOCUMENT_NAME,cartSchema)
}
