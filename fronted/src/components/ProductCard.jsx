import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/product.css';

const ProductCard = ({ product }) => (
  <article className="product-card">
    <img
      src={product.imageUrl || product.image}
      alt={product.name}
      className="product-image"
      onError={(event) => {
        event.currentTarget.src = 'https://placehold.co/600x600/27272a/ffffff?text=ShopNest';
      }}
    />
    <div className="product-info">
      <span className="product-category">{product.category || 'ShopNest'}</span>
      <h3 className="product-name">{product.name}</h3>
      <p className="product-description">{product.description || 'Quality product from ShopNest.'}</p>
      <p className="product-price">Rs. {Number(product.price || 0).toLocaleString('en-IN')}</p>
      <Link to={`/products/${product._id}`} className="view-details-button">View details</Link>
    </div>
  </article>
);

export default ProductCard;
