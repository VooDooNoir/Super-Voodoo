import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function Header() {
  const { itemCount } = useCart();

  return (
    <header className="header">
      <Link to="/" className="header-logo">Print Store</Link>
      <nav className="header-nav">
        <Link to="/">Products</Link>
        <Link to="/routing">Agent Routing</Link>
        <Link to="/cart" className="cart-link">
          Cart
          {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
        </Link>
      </nav>
    </header>
  );
}

export default Header;