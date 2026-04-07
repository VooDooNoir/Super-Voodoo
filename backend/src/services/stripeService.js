// Stripe Service - Handles checkout session creation and webhook processing
const Stripe = require('stripe');
const config = require('../config');

const stripe = new Stripe(config.stripe.secretKey);

/**
 * Create a Stripe Checkout Session
 * @param {Object} params
 * @param {Array} params.lineItems - Array of {priceData, quantity}
 * @param {string} params.successUrl - Redirect URL on success
 * @param {string} params.cancelUrl - Redirect URL on cancel
 * @param {string} params.customerEmail - Optional customer email
 * @param {Object} params.metadata - Optional metadata for webhook reconciliation
 * @returns {Promise<string>} checkout session URL
 */
async function createCheckoutSession({ lineItems, successUrl, cancelUrl, customerEmail, metadata = {} }) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: lineItems.map(item => ({
      price_data: {
        currency: config.stripe.currency,
        product_data: {
          name: item.productName,
          description: item.description || '',
          images: item.images || [],
          metadata: {
            printfulVariantId: item.printfulVariantId || '',
            printfulProductId: item.printfulProductId || '',
          },
        },
        unit_amount: Math.round(item.unitAmount * 100), // Stripe expects cents
      },
      quantity: item.quantity,
    })),
    customer_email: customerEmail,
    success_url: successUrl || `${config.frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl || `${config.frontendUrl}/cancel`,
    metadata: {
      ...metadata,
      source: 'print-store',
    },
  });
  return { url: session.url, sessionId: session.id };
}

/**
 * Retrieve a checkout session by ID
 * @param {string} sessionId 
 * @returns {Promise<Object>}
 */
async function getCheckoutSession(sessionId) {
  return stripe.checkout.sessions.retrieve(sessionId);
}

/**
 * Construct Stripe webhook event from raw body
 * @param {string} payload - Raw webhook body
 * @param {string} signature - Stripe-Signature header
 * @returns {Object} webhook event
 */
function constructWebhookEvent(payload, signature) {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    config.stripe.webhookSecret
  );
}

module.exports = {
  createCheckoutSession,
  getCheckoutSession,
  constructWebhookEvent,
  stripe,
};
