'use strict';

const mongoose = require('mongoose');

const DOCUMENT_NAME = 'Discount';
const COLLECTION_NAME = 'Discounts';

const discountSchema = new mongoose.Schema({
    discount_name: { type: String, required: true},
    discount_description: { type: String, required: true},
    discount_type: { type: String, default: 'fixed_amount'}, // percentage
    discount_value: { type: Number, required: true}, // 10, 999
    discount_code: { type: String, required: true},
    discount_start_date: { type: Date, required: true}, // ngay bat dau
    discount_end_date: { type: Date, required: true}, // ngay ket thuc
    discount_max_uses: { type: Number, required: true}, // so luong discount duoc ap dung
    discount_used_count: { type: Number, required: true}, // so luong discount da su dung
    discount_user_used: { type: Array, default: []}, // ai da su dung
    discount_max_use_per_user: { type: Number, required: true}, // so luong su dung toi da moi user
    discount_min_order_value: { type: Number, required: true},
    discount_shopID: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop'},
    discount_is_active: { type: Boolean, required: true},
    discount_apply_to: { type: String, required: true, enum: ['all','specific']},
    discount_product_ids: { type: Array, default: []} // so san pham duoc ap dung
}, {
    collection: COLLECTION_NAME,
    timestamps: true
});

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, discountSchema);