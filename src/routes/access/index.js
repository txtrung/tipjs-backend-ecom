'use strict';

const express = require('express');
const accessController = require('../../controllers/access.controller');
const { asyncHandle } = require('../../helpers/asyncHandler');
const { authentication, authenticationV2 } = require('../../auth/authUtils');
const router = express.Router();

// sign-up
router.post('/shop/signup', asyncHandle(accessController.signUp));
// login
router.post('/shop/login', asyncHandle(accessController.login));

router.use(authenticationV2);
//logout
router.post('/shop/logout', asyncHandle(accessController.logout));

router.post('/shop/handleRefreshToken', asyncHandle(accessController.handleRefreshTokenV2));

module.exports = router;