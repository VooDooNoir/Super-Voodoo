import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [orderStatus, setOrderStatus] = useState(null);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    clearCart();
    if (sessionId) {
      fetch(`/api/orders/${sessionId}`)
        .then(res => res.json())
        .then(data => setOrderStatus(data))
        .catch(() => setOrderStatus(null));
    }
  }, [sessionId]);

  return (
    <div className="page">
      <div className="success-icon">✅</div>
      <h1>Payment Successful!</h1>
      <p style={{ marginTop: '0.5rem', color: '#666' }}>
        Your order is being processed. You'll receive a confirmation email shortly.
      </p>
      {sessionId && (
        <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#888' }}>
          Session ID: {sessionId.slice(-8)}
        </p>
      )}
      {orderStatus && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: 'white', borderRadius: '8px' }}>
          <p><strong>Order Status:</strong> {orderStatus.status}</p>
          {orderStatus.printfulOrderId && <p><strong>Printful Order:</strong> {orderStatus.printfulOrderId}</p>}
        </div>
      )}
      <a href="/" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
        Continue Shopping
      </a>
    </div>
  );
}

export default OrderSuccess;