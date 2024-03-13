const redisPubSubService = require('../services/redisPubSub.service');

class InventoryServiceTest {
    constructor() {
        redisPubSubService.subscribe('purchase_event', (channel, message) => {
            InventoryServiceTest.updateInventory(message);
        })
    }

    static updateInventory(productId, quantity) {
        console.log(`Update inventory ${productId} with quantity ${quantity}`);
    }
};

module.exports = new InventoryServiceTest();