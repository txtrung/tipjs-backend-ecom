'use strict'

const { NotFoundError } = require("../core/error.response");
const { cart } = require("../models/cart.model");
const { findProduct } = require("../models/repositories/product.repo");

class CartService {
    static async createCart({userId, product}) {
        const {productId} = product;
        const foundProduct = await findProduct({
            product_id: productId
        });
        if (!foundProduct) throw new NotFoundError('Product does not found!');
        const {product_name,product_price} = foundProduct;
        product = { ...product, name: product_name, price: product_price};

        const query = { 
            cart_userId: userId,
            cart_state: 'active'
        }, updateOrInsert = {
            $addToSet: {
                cart_products: product
            }
        }, options = {
            upsert: true,
            new: true
        }

        return await cart.findOneAndUpdate(query,updateOrInsert,options);
    };

    static async updateCartQuantity({userId,product}) {
        const {productId, quantity} = product;
        const query = {
            cart_userId : userId,
            'cart_products.productId': productId,
            cart_state: 'active'
        }, updateSet = {
            $inc: {
                'cart_products.$.quantity': quantity
            }
        }, options = {
            upsert: true,
            new: true
        };

        return await cart.findOneAndUpdate(query,updateSet,options);
    };

    static async addToCart({userId, product={}}) {
        const userCart = await cart.findOne({cart_userId: userId});
        
        if (!userCart) {
            return await this.createCart({userId,product});
        }

        if (!userCart.cart_products.length) {
            userCart.cart_products = [product];
            return await userCart.save();
        }

        return await this.updateCartQuantity({userId,product});
    };

    static async addToCartV2({userId, shop_order_ids}) {
        const { productId, quantity, old_quantity} = shop_order_ids[0]?.item_products[0];

        const foundProduct = await findProduct({product_id:productId});
        if (!foundProduct) throw new NotFoundError('Cart product not found!');

        console.log(foundProduct.product_shop?.toString());
        console.log(shop_order_ids[0]?.shopId);
        if (foundProduct.product_shop?.toString() !== shop_order_ids[0]?.shopId) {
            throw new NotFoundError('Product does not belong to shop');
        }

        if (quantity === 0) {
            // delete
        }

        return await this.updateCartQuantity({
            userId,
            product: {
                productId,
                quantity: quantity - old_quantity
            }
        })
    };

    static async deleteCartItem({userId,productId}) {
        const query = {
            cart_userId: userId,
            cart_state: 'active'
        }, updateSet = {
            $pull: {
                cart_products: {
                    productId
                }
            }
        }
        const deleteCart = await cart.updateOne(query,updateSet);
        return deleteCart;
    };

    static async getListUserCart({userId}) {
        return await cart.findOne({
            cart_userId: +userId
        }).lean();
    };
}

module.exports = CartService;