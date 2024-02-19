'use strict';

const { BadRequestError } = require("../core/error.response");
const inventoryModel = require("../models/inventory.model");
const { findProduct } = require("./product.service.xxx");

class InventoryService {
    static async addStockToInventory ({
        stock,
        productId,
        shopId,
        location = 'quan 7, HCM city'
    }) {
        const product = await findProduct({product_id: productId});
        if (!product) throw BadRequestError('Product not found!');

        const query = { inven_shopId: shopId, inven_productId: productId},
        updateSet = {
            $inc: {
                inven_stock: stock
            },
            $set: {
                inven_location: location
            }
        },
        option = { upsert: true, new: true};

        return await inventoryModel.findOneAndUpdate(query, updateSet, options);
    }
}

module.exports = InventoryService;