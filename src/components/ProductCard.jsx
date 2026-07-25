import React from 'react';
import { Star, Eye, Heart } from 'lucide-react';

export default function ProductCard({ product, onProductClick, isFavorite = false, onToggleFavorite }) {
  if (!product) return null;
  const { title, price, images = [], category, rating, reviewsCount, bestSeller, customizable, variants = { sizes: [], colors: [] } } = product;

  const defaultFallback = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800';
  const primaryImgSrc = (images && images[0] && images[0].trim() !== '') ? images[0] : defaultFallback;
  const secondaryImgSrc = (images && images[1] && images[1].trim() !== '') ? images[1] : null;

  return (
    <div className="product-card" onClick={() => onProductClick(product, null)}>
      <div className="product-card-image-wrapper" style={{ borderRadius: '12px' }}>
        {/* Badges */}
        <div className="product-badges">
          {bestSeller && <span className="badge badge-bestseller">Best Seller</span>}
          {customizable && <span className="badge badge-customizable">Custom Tailorable</span>}
        </div>

        {/* Heart / Favorite Button */}
        {onToggleFavorite && (
          <button 
            className={`favorite-btn-overlay ${isFavorite ? 'is-favorite' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(product.id);
            }}
            aria-label={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          >
            <Heart 
              size={12} 
              fill={isFavorite ? "#ef4444" : "none"} 
              stroke={isFavorite ? "#ef4444" : "var(--color-text-primary, #111827)"} 
            />
          </button>
        )}

        {/* Primary Image */}
        <img 
          src={primaryImgSrc} 
          alt={title} 
          className="product-card-image primary-image" 
          loading="lazy" 
          onError={(e) => {
            e.currentTarget.src = defaultFallback;
          }}
        />

        {/* Secondary Image (Hover Effect) */}
        {secondaryImgSrc && (
          <img 
            src={secondaryImgSrc} 
            alt={`${title} alternate view`} 
            className="product-card-image secondary-image" 
            loading="lazy" 
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}

        {/* Quick View Button Overlay */}
        <div className="quick-view-overlay">
          <button className="quick-view-btn" onClick={(e) => {
            e.stopPropagation();
            onProductClick(product, null);
          }}>
            <Eye size={13} />
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
        <div className="product-card-price" style={{ marginBottom: '8px' }}>
          <span className="currency">₹</span>{price.toLocaleString('en-IN')}
        </div>

        {/* Clickable Size Swatches directly under price */}
        {variants?.sizes && variants.sizes.length > 0 && (
          <div className="product-card-sizes" onClick={(e) => e.stopPropagation()}>
            {variants.sizes.map(size => (
              <span 
                key={size} 
                className="product-card-size-box"
                onClick={(e) => {
                  e.stopPropagation();
                  onProductClick(product, size);
                }}
              >
                {size}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
