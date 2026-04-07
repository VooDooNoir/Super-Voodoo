const express = require('express');
const { handleWebhook } = require('../controllers/webhookController');
const router = express.Router();

// Stripe requires raw body for webhook signature verification
router.post('/stripe', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;
