import React from 'react';

function ProductCard({ product, onAddToCart }) {
  const price = product.unitAmount ? (product.unitAmount / 100).toFixed(2) : '0.00';

  return (
    <div className="product-card">
      {product.images && product.images.length > 0 ? (
        <img className="product-card-image" src={product.images[0]} alt={product.productName} />
      ) : (
        <div className="product-card-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', fontSize: '2rem' }}>
          🖼️
        </div>
      )}
      <div className="product-card-body">
        <div className="product-card-name">{product.productName}</div>
        {product.description && <div className="product-card-variant">{product.description}</div>}
        <div className="product-card-price">${price}</div>
        <button
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '0.75rem' }}
          onClick={() => onAddToCart(product)}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default ProductCard;