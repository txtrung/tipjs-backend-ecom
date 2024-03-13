'use strict';

const { BadRequestError } = require('../core/error.response');
const { product, clothing, electronic, furniture } = require('../models/product.model');
const { insertInventory } = require('../models/repositories/inventory.repo');
const { findAllDraftsForShop, publishProductByShop, findAllPublishedForShop,unPublishProductByShop, searchProductByUser, findAllProducts, findProduct, updateProductById } = require('../models/repositories/product.repo');
const { removeUndefinedObject, updateNestedObjectParse } = require('../utils');
const { pushNotiToSystem } = require('./notification.service');

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

    static async updateProduct(type, productId, payload) {
        const productClass = ProductFactory.productRegistry[type];
        if (!productClass) {
            throw new BadRequestError(`Invalid product type ${type}`);
        }
        return new productClass(payload).updateProduct(productId);
    }

    static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0}) {
        const query = { product_shop, isDraft: true};
        return await findAllDraftsForShop({query, limit, skip});
    }

    static async findAllPublishedForShop({ product_shop, limit = 50, skip = 0}) {
        const query = { product_shop, isPublished: true};
        return await findAllPublishedForShop({query, limit, skip});
    }

    static async publishProductByShop({product_shop,product_id}) {
        return await publishProductByShop({product_shop,product_id});
    }

    static async unPublishProductByShop({product_shop,product_id}) {
        return await unPublishProductByShop({product_shop,product_id});
    }

    static async searchProduct({ keySearch }) {
        return await searchProductByUser({ keySearch });
    }

    static async findAllProducts({limit = 60, sort = 'ctime', page = 1, filter = {isPublished: true}}) {
        return await findAllProducts({limit, sort, page, filter, select: [
            'product_name', 'product_price', 'product_thumb'
        ]});
    }

    static async findProduct({product_id}) {
        return await findProduct({product_id, unSelect: ['__v']});
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
        const newProduct = await product.create({
            ...this,
            _id: productId
        });

        if (newProduct) {
            await insertInventory({
                productId: newProduct._id,
                shopId: this.product_shop,
                stock: this.product_quantity
            });

            pushNotiToSystem({
                type: 'SHOP-001',
                senderId: this.product_shop,
                receiverId: 1,
                options: {
                    product_name: this.product_name,
                    shop_name: this.product_shop
                }
            })
            .then(rs => console.log(rs))
            .catch(console.error);
        }
        
        return newProduct;
    }

    async updateProduct(productId, bodyUpdate) {
        return await updateProductById({productId, bodyUpdate, model: product, isNew: true})
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

    async updateProduct(productId) {
        const objectParams = removeUndefinedObject(this);
        if (objectParams.product_attributes) {
            await updateProductById({
                productId, 
                bodyUpdate: updateNestedObjectParse(objectParams.product_attributes), 
                model: clothing, 
                isNew: true
            });
        }
        const updateProduct = await super.updateProduct(productId, updateNestedObjectParse(objectParams));
        return updateProduct;
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

    async updateProduct(productId) {
        const objectParams = removeUndefinedObject(this);
        if (objectParams.product_attributes) {
            await updateProductById({
                productId, 
                bodyUpdate: updateNestedObjectParse(objectParams), 
                model: electronic, 
                isNew: true
            });
        }
        const updateProduct = await super.updateProduct(productId, updateNestedObjectParse(objectParams));
        return updateProduct;
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

    async updateProduct(productId) {
        const objectParams = removeUndefinedObject(this);
        if (objectParams.product_attributes) {
            await updateProductById({
                productId, 
                bodyUpdate: updateNestedObjectParse(objectParams), 
                model: furniture, 
                isNew: true
            });
        }
        const updateProduct = await super.updateProduct(productId, updateNestedObjectParse(objectParams));
        return updateProduct;
    }
}

ProductFactory.registerProductType('Clothing', Clothing);
ProductFactory.registerProductType('Electronics', Electronics);
ProductFactory.registerProductType('Furniture', Furniture);

module.exports = ProductFactory;