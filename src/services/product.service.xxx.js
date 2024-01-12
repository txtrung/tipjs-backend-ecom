'use strict';

const { BadRequestError } = require('../core/error.response');
const { product, clothing, electronic, furniture } = require('../models/product.model');

class ProductFactory {
    static productRegistry = {};
    static registerProductType(type, classRef) {
        ProductFactory.productRegistry[type] = classRef;
    };
    static async createProduct(type, payload) {
        const productClass = ProductFactory.productRegistry[type];
        if (!productClass) {
            throw new BadRequestError(`Invalid product type ${type}`);
        }
        return new productClass(payload).createProduct();
    }
}

class Product {
    constructor({
        product_name,
        product_description,
        product_attributes,
        product_price,
        product_quantity,
        product_thumb,
        product_type,
        product_shop
    }) {
        this.product_name = product_name;
        this.product_description = product_description;
        this.product_attributes = product_attributes;
        this.product_price = product_price;
        this.product_quantity = product_quantity;
        this.product_thumb = product_thumb;
        this.product_type = product_type;
        this.product_shop = product_shop;
    }

    async createProduct(productId) {
        return await product.create({
            ...this,
            _id: productId
        });
    }
}

class Clothing extends Product {
    async createProduct() {
        const newClothing = await clothing.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        });
        if (!newClothing) throw new BadRequestError('Create new clothing error!');

        const newProduct = await super.createProduct(newClothing._id);
        if (!newProduct) throw new BadRequestError('Create new product error!');

        return newProduct;
    }
}

class Electronics extends Product {
    async createProduct() {
        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        });
        if (!newElectronic) throw new BadRequestError('Create new electronic error!');

        const newProduct = await super.createProduct(newElectronic._id);
        if (!newProduct) throw new BadRequestError('Create new product error!');

        return newProduct;
    }
}

class Furniture extends Product {
    async createProduct() {
        const newFurniture = await furniture.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        });
        if (!newFurniture) throw new BadRequestError('Create new furniture error!');

        const newProduct = await super.createProduct(newFurniture._id);
        if (!newProduct) throw new BadRequestError('Create new product error!');

        return newProduct;
    }
}

ProductFactory.registerProductType('Clothing', Clothing);
ProductFactory.registerProductType('Electronics', Electronics);
ProductFactory.registerProductType('Furniture', Furniture);

module.exports = ProductFactory;