// API service for frontend-backend communication
const API_BASE = '/api';

export const checkoutAPI = {
  async createSession(cartItems, customerEmail) {
    const res = await fetch(`${API_BASE}/checkout/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartItems, customerEmail }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Checkout failed');
    }
    return res.json();
  },
};

export const ordersAPI = {
  async getStatus(stripeSessionId) {
    const res = await fetch(`${API_BASE}/orders/${stripeSessionId}`);
    if (!res.ok) throw new Error('Failed to fetch order');
    return res.json();
  },
};

export const productsAPI = {
  async list() {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },
};

export const routingAPI = {
  async getModels() {
    const res = await fetch(`${API_BASE}/routing/models`);
    if (!res.ok) throw new Error('Failed to fetch models');
    return res.json();
  },
  async chat(message, tier) {
    const res = await fetch(`${API_BASE}/routing/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, tier }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Chat request failed');
    }
    return res.json();
  },
};