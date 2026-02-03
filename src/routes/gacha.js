const express = require('express');
const router = express.Router();
const gachaController = require('../controllers/gachaController');
const { authMiddleware } = require('../services/authService');

router.post('/buy', authMiddleware, gachaController.buy);

module.exports = router;
