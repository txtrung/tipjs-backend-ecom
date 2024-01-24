'use strict';

const { SuccessResponse } = require("../core/success.response");
const DiscountService = require("../services/discount.service");

class DiscountController {
    createDiscountCode = async (req,res,next) => {
        new SuccessResponse({
            message: 'Create discount code success!!',
            metadata: await DiscountService.createDiscountCode({
                ...req.body,
                shopId: req.user.userId
            })
        }).send(res);
    };

    getAllDiscountCodesWithProduct = async (req,res,next) => {
        new SuccessResponse({
            message: 'Create discount code success!!',
            metadata: await DiscountService.getAllDiscountCodesWithProduct({
                ...req.query
            })
        }).send(res);
    };

    getAllDiscountCodesByShop = async (req,res,next) => {
        new SuccessResponse({
            message: 'Get list success!!',
            metadata: await DiscountService.getAllDiscountCodesByShop({
                ...req.query,
                shopId: req.user.userId
            })
        }).send(res);
    };

    getDiscountAmount = async (req,res,next) => {
        new SuccessResponse({
            message: 'Get discount amount success!!',
            metadata: await DiscountService.getDiscountAmount({
                ...req.body
            })
        }).send(res);
    };

    deleteDiscountCode = async (req,res,next) => {

    };

    cancelDiscountCode = async (req,res,next) => {

    };
}

module.exports = new DiscountController();