// Phase 2: Stripe Checkout + Printful Order Bridge Backend
// Environment configuration

const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  port: process.env.PORT || 3001,

  // Stripe Configuration
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    currency: process.env.STRIPE_CURRENCY || 'usd',
  },

  // Printful Configuration
  printful: {
    apiKey: process.env.PRINTFUL_API_KEY || '',
    baseUrl: process.env.PRINTFUL_API_URL || 'https://api.printful.com',
    storeId: process.env.PRINTFUL_STORE_ID || '',
  },

  // Frontend URL for redirects
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Environment
  env: process.env.NODE_ENV || 'development',

  // OpenRouter (shared config for routing service)
  openrouter: {
    baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    siteUrl: process.env.OPENROUTER_SITE_URL || '',
    siteName: process.env.OPENROUTER_SITE_NAME || 'Print Store Agent',
  }
};
