'use strict';

const express = require('express');
const checkoutController = require('../../controllers/checkout.controller');
const { asyncHandle } = require('../../helpers/asyncHandler');
const { authentication, authenticationV2 } = require('../../auth/authUtils');
const router = express.Router();

router.post('/review', asyncHandle(checkoutController.checkoutReview));

module.exports = router;