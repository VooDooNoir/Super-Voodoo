// Stripe Webhook Controller - handles events and bridges to Printful
const stripeService = require('../services/stripeService');
const printfulService = require('../services/printfulService');
const logger = require('./logger');
const db = require('../services/storage');

/**
 * POST /api/webhooks/stripe
 * Receives Stripe webhook events, creates Printful orders on checkout.session.completed
 */
async function handleWebhook(req, res) {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripeService.constructWebhookEvent(req.rawBody, sig);
  } catch (err) {
    logger.error('Webhook signature verification failed', { error: err.message });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  logger.info('Webhook received', { eventType: event.type, eventId: event.id });

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutCompleted(event.data.object);
        break;
      }
      case 'payment_intent.succeeded': {
        logger.info('Payment succeeded', { paymentIntentId: event.data.object.id });
        break;
      }
      case 'payment_intent.payment_failed': {
        logger.warn('Payment failed', { paymentIntentId: event.data.object.id });
        break;
      }
      default:
        logger.info('Unhandled webhook event', { eventType: event.type });
    }

    res.json({ received: true });
  } catch (err) {
    logger.error('Webhook processing error', { error: err.message });
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

/**
 * Handle checkout.session.completed event
 * Creates a Printful order from the Stripe session data
 */
async function handleCheckoutCompleted(session) {
  const { id: sessionId, customer_details, metadata, line_items } = session;

  logger.info('Processing completed checkout', { sessionId });

  // Check for duplicate processing
  const existing = await db.getOrderByStripeSessionId(sessionId);
  if (existing) {
    logger.info('Order already processed', { sessionId, printfulOrderId: existing.printfulOrderId });
    return existing;
  }

  // Fetch full line items if not expanded
  let items = line_items;
  if (!items || !items.data) {
    const { data } = await stripeService.stripe.checkout.sessions.listLineItems(sessionId);
    items = { data };
  }

  // Map Stripe line items to Printful order items
  const printfulItems = items.data.map(item => ({
    variant_id: parseInt(item.price.product.metadata.printfulVariantId, 10),
    quantity: item.quantity,
    retail_price: (item.amount_total / 100 / item.quantity).toFixed(2),
    name: item.description || item.price.product.name,
  }));

  // Build Printful order
  const printfulOrder = {
    externalId: sessionId,
    recipient: {
      name: customer_details?.name || 'Customer',
      address1: customer_details?.address?.line1 || '',
      address2: customer_details?.address?.line2 || '',
      city: customer_details?.address?.city || '',
      stateCode: customer_details?.address?.state || '',
      countryCode: customer_details?.address?.country || '',
      zip: customer_details?.address?.postal_code || '',
      email: customer_details?.email || '',
    },
    items: printfulItems,
  };

  // Create order in Printful
  const result = await printfulService.createOrder(printfulOrder);

  // Store the mapping for future reconciliation
  await db.saveOrder({
    stripeSessionId: sessionId,
    printfulOrderId: result.result?.id,
    status: 'pending',
    createdAt: new Date().toISOString(),
    metadata,
  });

  logger.info('Printful order created', {
    stripeSessionId: sessionId,
    printfulOrderId: result.result?.id,
  });

  return result;
}

module.exports = { handleWebhook };
