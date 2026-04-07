const express = require('express');
const { getOrderStatus } = require('../controllers/orderController');
const router = express.Router();

router.get('/:stripeSessionId', getOrderStatus);

module.exports = router;
