// backend/routes/login.routes.js
const express = require('express');
const router = express.Router();
const { login } = require('../controllers/login.controller');

router.post('/', login);

module.exports = router;
