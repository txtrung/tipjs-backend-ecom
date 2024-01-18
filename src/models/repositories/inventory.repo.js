'use strict';

const inventoryModel = require("../inventory.model");

const insertInventory = async ({productId, shopId, stock, location = 'unKnow'}) => {
    return await inventoryModel.create({
        inven_productId: productId,
        inven_shopId: shopId,
        inven_stock: stock,
        inven_location: location
    });
};

module.exports = {
    insertInventory,
}