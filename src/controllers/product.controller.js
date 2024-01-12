'use strict';

const { SuccessResponse } = require("../core/success.response");
const ProductService = require('../services/product.service');

class ProductController {
    createProduct = async (req,res,next) => {
        const {product_type, product_data} = req.body;
        return SuccessResponse({
            message: 'Create new product success!',
            metadata: await ProductService.createProduct(product_type, product_data)
        }).send(res);
    }
}

module.exports = new ProductController();