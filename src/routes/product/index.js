'use strict';

const express = require('express');
const ProductController = require('../../controllers/product.controller');
const { asyncHandle } = require('../../helpers/asyncHandler');
const { authentication } = require('../../auth/authUtils');
const router = express.Router();

// create product
router.post('/create', asyncHandle(ProductController.createProduct));

module.exports = router;