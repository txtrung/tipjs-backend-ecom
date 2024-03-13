'use strict';

const express = require('express');
const NotificationController = require('../../controllers/notification.controller');
const { asyncHandle } = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils');
const router = express.Router();

router.use(authenticationV2);
router.get('', asyncHandle(NotificationController.listNotiByUser));

module.exports = router;