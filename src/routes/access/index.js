'use strict';

const express = require('express');
const accessController = require('../../controllers/access.controller');
const { asyncHandle } = require('../../helpers/asyncHandler');
const { authentication } = require('../../auth/authUtils');
const router = express.Router();

// sign-up
router.post('/shop/signup', asyncHandle(accessController.signUp));
// login
router.post('/shop/login', asyncHandle(accessController.login));

router.use(authentication);
//logout
router.post('/shop/logout', asyncHandle(accessController.logout));

router.post('/shop/handleRefreshToken', asyncHandle(accessController.handleRefreshToken));

module.exports = router;