// Printful Service - Handles order fulfillment via Printful API
const config = require('../config');

/**
 * Make an authenticated request to Printful API
 */
async function printfulRequest(endpoint, options = {}) {
  const url = `${config.printful.baseUrl}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${config.printful.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Printful API error (${response.status}): ${error}`);
  }

  return response.json();
}

/**
 * Create a draft order in Printful
 * Maps Stripe checkout line items to Printful order items
 * @param {Object} orderData
 * @returns {Promise<Object>} Printful order response
 */
async function createOrder(orderData) {
  const {
    externalId,       // Stripe session ID for reconciliation
    recipient,
    items,            // Array of {variant_id, quantity, retail_price, name}
    notify,
  } = orderData;

  const payload = {
    external_id: externalId,
    recipient: {
      name: recipient.name,
      address1: recipient.address1,
      address2: recipient.address2 || '',
      city: recipient.city,
      state_code: recipient.stateCode,
      country_code: recipient.countryCode,
      zip: recipient.zip,
      email: recipient.email,
      phone: recipient.phone || '',
    },
    items: items.map(item => ({
      variant_id: item.variant_id,
      quantity: item.quantity,
      retail_price: item.retail_price,
      name: item.name || '',
    })),
    notify: notify !== false,  // default true
  };

  const result = await printfulRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return result;
}

/**
 * Get order status from Printful
 * @param {number} orderId
 * @returns {Promise<Object>}
 */
async function getOrder(orderId) {
  return printfulRequest(`/orders/${orderId}`);
}

/**
 * Get product information including variants
 * @param {number} productId
 * @returns {Promise<Object>}
 */
async function getProduct(productId) {
  return printfulRequest(`/products/${productId}`);
}

/**
 * Get all store sync products
 * @returns {Promise<Object>}
 */
async function getSyncProducts() {
  return printfulRequest('/sync/products?limit=100');
}

/**
 * Estimate shipping cost for product to destination
 * @param {number} variantId
 * @param {string} countryCode
 * @param {string} stateCode
 * @returns {Promise<Object>}
 */
async function estimateShipping(variantId, countryCode, stateCode) {
  return printfulRequest('/shipping/rates', {
    method: 'POST',
    body: JSON.stringify({
      recipient: {
        country_code: countryCode,
        state_code: stateCode,
      },
      items: [{ variant_id: variantId, quantity: 1 }],
    }),
  });
}

module.exports = {
  createOrder,
  getOrder,
  getProduct,
  getSyncProducts,
  estimateShipping,
  printfulRequest,
};
