'use strict';

const { BadRequestError } = require("../core/error.response");
const { findCartById } = require("../models/repositories/cart.repo");
const { checkProductByServer } = require("../models/repositories/product.repo");
const { getDiscountAmount } = require("./discount.service");
const { acquireLock, releaseLock } = require("./redis.service");
const { order } = require("../models/order.model");

class CheckoutService {
    static async checkoutReview({
        cartId,
        userId,
        shop_order_ids
    }) {
        const foundCart = await findCartById({cartId});
        if (!foundCart) throw new BadRequestError('Cart not found!!');

        const checkoutOrder = {
            totalPrice: 0,
            feeShip: 0,
            totalDiscount: 0,
            totalCheckout: 0
        }, shop_order_ids_new = [];

        // tinh tong tien bill
        for (let i = 0 ; i < shop_order_ids.length ; i++) {
            const { shopId, shop_discounts = [], item_products = [] } = shop_order_ids[i];

            const checkProductServer = await checkProductByServer(item_products);
            if (!checkProductServer[0]) throw new BadRequestError('Order has something wrong!!');

            const checkoutPrice = checkProductServer.reduce((sum,product)=>{
                return sum + (product.quantity * product.price);
            },0);

            checkoutOrder.totalPrice += checkoutPrice;

            const itemCheckout = {
                shopId,
                shop_discounts,
                priceRaw: checkoutPrice,
                priceApplyDiscount: checkoutPrice,
                item_products: checkProductServer
            }

            if (shop_discounts.length > 0) {
                const { subTotal, discount, price } = await getDiscountAmount({
                    code: shop_discounts[0].codeId,
                    userId: userId,
                    shopId: shopId,
                    products: checkProductServer
                });
                checkoutOrder.totalDiscount += discount;
                if (discount > 0) {
                    itemCheckout.priceApplyDiscount = itemCheckout.priceApplyDiscount - discount;
                }
            }
            checkoutOrder.totalCheckout += itemCheckout.priceApplyDiscount;
            shop_order_ids_new.push(itemCheckout);
        }

        return {
            shop_order_ids,
            shop_order_ids_new,
            checkoutOrder
        }
    };

    static async orderByUser({
        shop_order_ids,
        cartId,
        userId,
        user_address = {},
        user_payment = {}
    }) {
        const { shop_order_ids_new, checkout_order } = await this.checkoutReview({
            cartId,
            userId,
            shop_order_ids: shop_order_ids
        });

        const products = shop_order_ids_new.flatMap( order => order.item_products);
        console.log('[1]:: ', products);
        const acquireProduct = [];
        for (let i = 0 ; i < products.length ; i++) {
            const {productId, quantity} = products[i];
            const keyLock = await acquireLock(productId,quantity,cartId);
            acquireProduct.push(keyLock ? true : false);
            if (keyLock) {
                await releaseLock(keyLock);
            }
        }

        if (acquireProduct.includes(false)) {
            throw new BadRequestError('Mot so san pham da duoc cap nhat, vui long tro lai don hang');
        }
        
        const newOrder = await order.create({
            order_userId: userId,
            order_products: shop_order_ids_new,
            order_checkout: checkout_order,
            order_shipping: user_address,
            order_payment: user_payment
        });

        if (newOrder) {

        }

        return newOrder;
    }

    static async getOrdersByUser() {

    }

    static async getOneOrderByUser() {

    }

    static async cancelOrderByUser() {

    }

    static async updateOrderStatusByShop() {

    }
};

module.exports = CheckoutService;