'use strict';

const express = require('express');
const ProductController = require('../../controllers/product.controller');
const { asyncHandle } = require('../../helpers/asyncHandler');
const { authentication, authenticationV2 } = require('../../auth/authUtils');
const router = express.Router();

router.get('/search/:keySearch', asyncHandle(ProductController.getSearchingProduct));
router.get('', asyncHandle(ProductController.findAllProducts));
router.get('/:product_id', asyncHandle(ProductController.findProduct));

// authentication
router.use(authenticationV2);

// create product
router.post('/create', asyncHandle(ProductController.createProduct));

//query
router.get('/drafts', asyncHandle(ProductController.getAllDraftsForShop));
router.put('/publish', asyncHandle(ProductController.publishProductByShop));
router.put('/un-publish', asyncHandle(ProductController.unPublishProductByShop));
router.get('/published', asyncHandle(ProductController.getAllPublishedForShop));

module.exports = router;