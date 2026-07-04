import React from 'react';
import { Star, Eye } from 'lucide-react';

export default function ProductCard({ product, onProductClick }) {
  const { title, price, images, category, rating, reviewsCount, bestSeller, customizable } = product;

  return (
    <div className="product-card" onClick={() => onProductClick(product)}>
      <div className="product-card-image-wrapper">
        {/* Badges */}
        <div className="product-badges">
          {bestSeller && <span className="badge badge-bestseller">Best Seller</span>}
          {customizable && <span className="badge badge-customizable">Custom Tailorable</span>}
        </div>

        {/* Primary Image */}
        <img 
          src={images[0]} 
          alt={title} 
          className="product-card-image primary-image" 
          loading="lazy" 
        />

        {/* Secondary Image (Hover Effect) */}
        {images[1] && (
          <img 
            src={images[1]} 
            alt={`${title} alternate view`} 
            className="product-card-image secondary-image" 
            loading="lazy" 
          />
        )}

        {/* Quick View Button Overlay */}
        <div className="quick-view-overlay">
          <button className="quick-view-btn" onClick={(e) => {
            e.stopPropagation();
            onProductClick(product);
          }}>
            <Eye size={16} />
            <span>Quick Shop</span>
          </button>
        </div>
      </div>

      <div className="product-card-info">
        <span className="product-card-category">{category}</span>
        <h3 className="product-card-title">{title}</h3>
        
        {/* Rating */}
        <div className="product-card-rating">
          <span className="stars-row">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={14} 
                fill={i < Math.floor(rating) ? "var(--color-accent)" : "none"} 
                stroke={i < Math.floor(rating) ? "var(--color-accent)" : "#ccc"} 
              />
            ))}
          </span>
          <span className="reviews-count">({reviewsCount})</span>
        </div>

        {/* Price */}
        <div className="product-card-price">
          <span className="currency">₹</span>{price.toLocaleString('en-IN')}
        </div>
      </div>
    </div>
  );
}
