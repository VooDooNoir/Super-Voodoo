import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function Checkout() {
  const { state, total, clearCart } = useCart();
  const [customerEmail, setCustomerEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (state.items.length === 0) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: state.items,
          customerEmail: customerEmail || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Checkout failed');
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page cart-page">
      <h1>Checkout</h1>
      <div className="cart-summary">
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email">Email (optional)</label>
          <input id="email" type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="your@email.com" style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', borderRadius: '4px', border: '1px solid #e5e5e5' }} />
        </div>
        <div className="cart-total">Total: ${(total / 100).toFixed(2)}</div>
        {error && <p style={{ color: '#ef4444', marginBottom: '0.5rem' }}>{error}</p>}
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleCheckout} disabled={loading}>
          {loading ? 'Processing...' : 'Pay with Stripe'}
        </button>
      </div>
    </div>
  );
}

export default Checkout;