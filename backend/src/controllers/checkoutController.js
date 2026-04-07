// Stripe Checkout Controller
const stripeService = require('../services/stripeService');
const printfulService = require('../services/printfulService');
const logger = require('./logger');

/**
 * POST /api/checkout/create
 * Creates a Stripe checkout session
 */
async function createCheckoutSession(req, res) {
  try {
    const { cartItems, customerEmail } = req.body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Validate each cart item
    for (const item of cartItems) {
      if (!item.printfulVariantId || !item.unitAmount || !item.quantity) {
        return res.status(400).json({
          error: `Invalid cart item: ${JSON.stringify(item)}`,
        });
      }
    }

    const result = await stripeService.createCheckoutSession({
      lineItems: cartItems,
      customerEmail,
      metadata: {
        cartSize: cartItems.length,
        cartTotal: cartItems.reduce((sum, i) => sum + i.unitAmount * i.quantity, 0).toString(),
      },
    });

    logger.info('Checkout session created', { sessionId: result.sessionId });
    res.json(result);
  } catch (error) {
    logger.error('Checkout session creation failed', { error: error.message });
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
}

module.exports = { createCheckoutSession };
