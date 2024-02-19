'use strict';

const express = require('express');
const InventoryController = require('../../controllers/inventory.controller');
const { asyncHandle } = require('../../helpers/asyncHandler');
const { authentication, authenticationV2 } = require('../../auth/authUtils');
const router = express.Router();

router.use(authenticationV2);
router.post('/review', asyncHandle(InventoryController.addStockToInventory));

module.exports = router;