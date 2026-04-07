// Order Status Controller
const printfulService = require('../services/printfulService');
const db = require('../services/storage');
const logger = require('./logger');

/**
 * GET /api/orders/:stripeSessionId
 * Get order status by Stripe session ID
 */
async function getOrderStatus(req, res) {
  try {
    const { stripeSessionId } = req.params;
    const order = await db.getOrderByStripeSessionId(stripeSessionId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Fetch latest status from Printful if we have a Printful order ID
    let printfulData = null;
    if (order.printfulOrderId) {
      try {
        printfulData = await printfulService.getOrder(order.printfulOrderId);
      } catch (err) {
        logger.warn('Failed to fetch Printful order', { error: err.message });
      }
    }

    res.json({
      stripeSessionId: order.stripeSessionId,
      printfulOrderId: order.printfulOrderId,
      status: printfulData?.result?.status || order.status,
      createdAt: order.createdAt,
      details: printfulData?.result || null,
    });
  } catch (error) {
    logger.error('Order status lookup failed', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch order status' });
  }
}

module.exports = { getOrderStatus };
