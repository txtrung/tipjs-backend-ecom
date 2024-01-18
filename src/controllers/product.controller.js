'use strict';

const { SuccessResponse } = require("../core/success.response");
const ProductService = require('../services/product.service');
const ProductServiceV2 = require('../services/product.service.xxx');

class ProductController {
    // createProduct = async (req,res,next) => {
    //     new SuccessResponse({
    //         message: 'Create new product success!',
    //         metadata: await ProductService.createProduct(req.body.product_type, {
    //             ...req.body,
    //             product_shop: req.user.userId
    //         })
    //     }).send(res);
    // }

    createProduct = async (req,res,next) => {
        new SuccessResponse({
            message: 'Create new product success!',
            metadata: await ProductServiceV2.createProduct(req.body.product_type, {
                ...req.body,
                product_shop: req.user.userId
            })
        }).send(res);
    };

    updateProduct = async (req,res,next) => {
        new SuccessResponse({
            message: 'Update product success!',
            metadata: await ProductServiceV2.updateProduct(req.body.product_type, req.params.product_id, {
                ...req.body,
                product_shop: req.user.userId
            })
        }).send(res);
    };

    publishProductByShop = async (req,res,next) => {
        new SuccessResponse({
            message: 'Publish products success!',
            metadata: await ProductServiceV2.publishProductByShop({
                product_shop: req.user.userId,
                product_id: req.body.product_id
            })
        }).send(res);
    };

    unPublishProductByShop = async (req,res,next) => {
        new SuccessResponse({
            message: 'Un-Publish products success!',
            metadata: await ProductServiceV2.unPublishProductByShop({
                product_shop: req.user.userId,
                product_id: req.body.product_id
            })
        }).send(res);
    }; 

    getAllDraftsForShop = async (req,res,next) => {
        new SuccessResponse({
            message: 'Get draft products success!',
            metadata: await ProductServiceV2.findAllDraftsForShop({
                product_shop: req.user.userId
            })
        }).send(res);
    };

    getAllPublishedForShop = async (req,res,next) => {
        new SuccessResponse({
            message: 'Get published products success!',
            metadata: await ProductServiceV2.findAllPublishedForShop({
                product_shop: req.user.userId
            })
        }).send(res);
    };

    getSearchingProduct = async (req,res,next) => {
        new SuccessResponse({
            message: 'Get searching products success!',
            metadata: await ProductServiceV2.searchProduct(req.params)
        }).send(res);
    };

    findAllProducts = async (req,res,next) => {
        new SuccessResponse({
            message: 'Get list findAllProducts success!',
            metadata: await ProductServiceV2.findAllProducts(req.query)
        }).send(res);
    };

    findProduct = async (req,res,next) => {
        new SuccessResponse({
            message: 'Get Product by id success!',
            metadata: await ProductServiceV2.findProduct({
                product_id: req.params.product_id
            })
        }).send(res);
    };
}

module.exports = new ProductController();