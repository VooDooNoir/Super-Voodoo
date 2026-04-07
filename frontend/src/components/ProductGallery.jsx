import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { useCart } from '../context/CartContext';

function ProductGallery() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data.result || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Unable to load products. Check that the backend is running and Printful is connected.');
        setProducts([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="spinner" />;
  }

  return (
    <div className="page">
      <h1>Store Gallery</h1>
      {error && (
        <div className="error-banner" role="alert">{error}</div>
      )}
      {products.length === 0 ? (
        <div className="empty-state">
          <p>No products available.</p>
          <p style={{ fontSize: '0.9rem', color: '#888', marginTop: '0.5rem' }}>
            Add sync products in your Printful dashboard or try the ArtStudio to generate AI art.
          </p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={{
                id: `${product.id}-${product.sync_variant}`,
                productName: product.sync_product.name,
                unitAmount: parseInt(product.sync_variant.retail_price, 10),
                description: product.sync_product.name,
                printfulProductId: product.sync_product.id,
                printfulVariantId: product.sync_variant.variant_id,
                images: product.sync_product.thumbnail_url ? [product.sync_product.thumbnail_url] : [],
              }}
              onAddToCart={addToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductGallery;