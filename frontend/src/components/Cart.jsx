import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function Cart() {
  const { state, removeFromCart, updateQuantity, total, itemCount } = useCart();
  const navigate = useNavigate();

  if (state.items.length === 0) {
    return (
      <div className="page">
        <div className="empty-state">
          <h2>Your cart is empty</h2>
          <p>Add some products to get started!</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page cart-page">
      <h1>Shopping Cart ({itemCount} items)</h1>
      {state.items.map(item => (
        <div key={item.id} className="cart-item">
          {item.images && item.images.length > 0 ? (
            <img className="cart-item-image" src={item.images[0]} alt={item.productName} />
          ) : (
            <div className="cart-item-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>🖼️</div>
          )}
          <div className="cart-item-details">
            <strong>{item.productName}</strong>
            <div>${(item.unitAmount / 100).toFixed(2)} each</div>
            <div className="cart-item-controls">
              <button className="btn btn-sm btn-outline" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
              <span>{item.quantity}</span>
              <button className="btn btn-sm btn-outline" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
              <button className="btn btn-sm" style={{ color: '#ef4444', marginLeft: 'auto' }} onClick={() => removeFromCart(item.id)}>Remove</button>
            </div>
          </div>
          <div style={{ fontWeight: 700 }}>${((item.unitAmount / 100) * item.quantity).toFixed(2)}</div>
        </div>
      ))}
      <div className="cart-summary">
        <div className="cart-total">Total: ${(total / 100).toFixed(2)}</div>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/checkout')}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}

export default Cart;