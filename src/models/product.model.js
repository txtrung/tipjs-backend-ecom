'use strict';

const mongoose = require('mongoose');
const slugify = require('slugify');

const DOCUMENT_NAME = 'Product';
const COLLECTION_NAME = 'Products';

const productSchema = new mongoose.Schema({
    product_name: {
        type: String,
        required: true
    },
    product_slug: String,
    product_thumb: {
        type: String,
        required: true
    },
    product_description: String,
    product_price: {
        type: Number,
        required: true
    },
    product_quantity: {
        type: Number,
        required: true
    },
    product_type: {
        type: String,
        required: true,
        enum: ['Electronics', 'Clothing', 'Furniture']
    },
    product_shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop'
    },
    product_attributes: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    product_ratingAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'rating must be above 1.0'],
        max: [5, 'rating must be below 5.0'],
        set: (val) => Math.round(val * 10) / 10
    },
    product_variation: {
        type: Array,
        default: []
    },
    isDraft: {
        type: Boolean,
        default: true,
        index: true,
        select: false
    },
    isPublished: {
        type: Boolean,
        default: false,
        index: true,
        select: false
    }
}, {
    collection: COLLECTION_NAME,
    timestamps: true
});

productSchema.index({product_name: 'text', product_description: 'text'});
productSchema.pre('save', function (next){
    this.product_slug = slugify(this.product_name, {lower: true});
    next();
})

const clothingSchema = new mongoose.Schema({
    brand: {
        type: String,
        required: true
    },
    size: String,
    material: String
}, {
    collection: 'Clothes',
    timestamps: true
});

const electronicSchema = new mongoose.Schema({
    manufacturer: {
        type: String,
        required: true
    },
    model: String,
    color: String
}, {
    collection: 'Electronics',
    timestamps: true
});

const furnitureSchema = new mongoose.Schema({
    brand: {
        type: String,
        required: true
    },
    type: String,
    color: String
}, {
    collection: 'Furniture',
    timestamps: true
});

module.exports = {
    product: mongoose.model( DOCUMENT_NAME, productSchema),
    electronic: mongoose.model('Electronics', electronicSchema),
    clothing: mongoose.model('Clothing', clothingSchema),
    furniture: mongoose.model('Furniture', furnitureSchema),
};