import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import ProductGallery from './components/ProductGallery';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import OrderSuccess from './components/OrderSuccess';
import RoutingPanel from './components/RoutingPanel';
import ArtStudio from './components/ArtStudio';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <CartProvider>
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<ProductGallery />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/success" element={<OrderSuccess />} />
          <Route path="/routing" element={<RoutingPanel />} />
          <Route path="/cancel" element={<div className="page"><h2>Order Cancelled</h2><a href="/">Return to store</a></div>} />
          <Route path="/artstudio" element={<ArtStudio />} />
        </Routes>
      </main>
    </CartProvider>
  );
}

export default App;
