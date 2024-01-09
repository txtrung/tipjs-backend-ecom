'use strict';

const express = require('express');
const accessController = require('../../controllers/access.controller');
const { asyncHandle } = require('../../auth/checkAuth');
const router = express.Router();

// sign-up
router.post('/shop/signup', asyncHandle(accessController.signUp));
// login
router.post('/shop/login', asyncHandle(accessController.login));

module.exports = router;