'use strict';

const discountModel = require('../models/discount.model');
const { BadRequestError } = require("../core/error.response");
const { convertToObjectIdMongoDb } = require('../utils');
const { findAllProducts } = require('../models/repositories/product.repo');
const { findAllDiscountCodeUnselect, checkDiscountExist, updateDiscount } = require('../models/repositories/discount.repo');

/*
    Discount service
    1 - Generate discount code [ shop | admin]
    2 - Get discount amount [ user ]
    3 - Get all discount code [ user | shop]
    4 - Verify discount code [ user ]
    5 - Delete discount code [ admin | shop]
    6 - Cancel discount code [ user ]
*/

class DiscountService {
    static async createDiscountCode(payload) {
        const {
            discount_code, discount_start_date, discount_end_date, discount_is_active, shopId, discount_min_order_value,
            discount_product_ids, discount_apply_to, discount_name, discount_description, discount_type, discount_value,
            discount_max_uses, discount_used_count, discount_max_use_per_user, discount_users_uses
        } = payload;
        
        if (new Date(discount_end_date) < new Date()) {
            throw new BadRequestError('Discount code has expired!');
        }

        if ( new Date(discount_start_date) > new Date(discount_end_date) ) {
            throw new BadRequestError('Start date must smaller than end date!');
        }

        const foundDiscount = await discountModel.find({
            discount_code: discount_code,
            discount_shopID: convertToObjectIdMongoDb(shopId)
        }).lean();
        if (foundDiscount && foundDiscount.discount_is_active) {
            throw new BadRequestError('Discount code existed!!');
        }

        const newDiscount = await discountModel.create({
            discount_name: discount_name,
            discount_description: discount_description,
            discount_type: discount_type, 
            discount_value: discount_value, 
            discount_code: discount_code,
            discount_start_date: new Date(discount_start_date),
            discount_end_date: new Date(discount_end_date),
            discount_max_uses: discount_max_uses,
            discount_used_count: discount_used_count,
            discount_user_used: discount_users_uses,
            discount_max_use_per_user: discount_max_use_per_user,
            discount_min_order_value: discount_min_order_value || 0,
            discount_shopID: shopId,
            discount_is_active: discount_is_active,
            discount_apply_to: discount_apply_to,
            discount_product_ids: discount_apply_to === 'all' ? [] : discount_product_ids
        });

        return newDiscount;
    };

    static async updateDiscountCode() {

    };

    static async getAllDiscountCodesWithProduct({
        code, shopId, userId, limit, page
    }) {
        const foundDiscount = await discountModel.findOne({
            discount_code: code,
            discount_shopID: convertToObjectIdMongoDb(shopId)
        }).lean();

        if(!foundDiscount || !foundDiscount.discount_is_active) {
            throw new BadRequestError('Discount not found!');
        }

        const {discount_apply_to, discount_product_ids} = foundDiscount;
        let products = [];
        if (discount_apply_to === 'all') {
            products = await findAllProducts({
                filter: {
                    product_shop: convertToObjectIdMongoDb(shopId),
                    isPublished: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            });
        }
        if (discount_apply_to === 'specific') {
            products = await findAllProducts({
                filter: {
                    _id: {$in: discount_product_ids},
                    isPublished: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            });
        }

        return products
    };

    static async getAllDiscountCodesByShop({
        limit, page, shopId
    }) {
        const discounts = await findAllDiscountCodeUnselect({
            limit: limit,
            page: page,
            filter: {
                discount_shopID: convertToObjectIdMongoDb(shopId),
                discount_is_active: true
            },
            unSelect: ['__v', 'discount_shopID'],
            model: discountModel
        })

        return discounts;
    };

    static async getDiscountAmount({code, userId, shopId, products}) {
        const foundCode = await checkDiscountExist({
                discount_code: code,
                discount_shopID: convertToObjectIdMongoDb(shopId)
            }
        )
        if (!foundCode) throw new BadRequestError('Discount code does not exists!');
        if (!foundCode.discount_is_active) throw new BadRequestError('Discount inactive!');
        if (foundCode.discount_used_count >= foundCode.discount_max_uses) throw new BadRequestError('Discount reach limit!');
        if (new Date(foundCode.discount_end_date) < new Date()) throw new BadRequestError('Discount expired!'); 

        let subTotal = products.reduce((temp,product)=>{
            return temp + ( product.quantity * product.price);
        },0);
        if (subTotal < foundCode.discount_min_order_value) throw new BadRequestError(`Order must have min subtotal of ${foundCode.discount_min_order_value}`);

        if (foundCode.discount_max_use_per_user > 0) {
            const userUsedCount = foundCode.discount_user_used.filter(user => user === userId).length;
            if (userUsedCount >= foundCode.discount_max_use_per_user) throw new BadRequestError('User reaches limit of using discount code!'); 
        }

        const discountAmount = foundCode.discount_type === 'fixed_amount' ? foundCode.discount_value : subTotal * ( foundCode.discount_value / 100 );

        await updateDiscount(foundCode._id,{
            $push: {
                discount_user_used: userId
            },
            $inc: {
                discount_used_count: 1,
            }
        });

        return {
            subTotal,
            discount: discountAmount,
            price: subTotal - discountAmount
        }
    }

    static async deleteDiscountCode({shopId, codeId}) {
        const deleted = await discountModel.deleteOne({
            discount_code: codeId,
            discount_shopID: convertToObjectIdMongoDb(shopId)
        })

        return deleted;
    }

    static async cancelDiscountCode({shopId, codeId, userId}) {
        const foundCode = await checkDiscountExist({
            filter: {
                discount_code: codeId,
                discount_shopID: convertToObjectIdMongoDb(shopId)
            }
        })
        /*
            CHECK DISCOUNT CODE
        */
        const result = await updateDiscount(foundCode?._id,{
            $pull: {
                discount_user_used: userId
            },
            $inc: {
                discount_used_count: -1,
                discount_max_uses: 1
            }
        })

        return result;
    }
}

module.exports = DiscountService;