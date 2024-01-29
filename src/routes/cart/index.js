'use strict';

const express = require('express');
const cartController = require('../../controllers/cart.controller');
const { asyncHandle } = require('../../helpers/asyncHandler');
const { authentication, authenticationV2 } = require('../../auth/authUtils');
const router = express.Router();

router.post('', asyncHandle(cartController.addToCart));
router.post('/update', asyncHandle(cartController.update));
router.delete('', asyncHandle(cartController.delete));
router.get('', asyncHandle(cartController.list));

module.exports = router;