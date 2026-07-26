import React from 'react';
import { Star, Eye, Heart } from 'lucide-react';

export default function ProductCard({ 
  product, 
  onProductClick, 
  onQuickViewClick, 
  isFavorite = false, 
  onToggleFavorite 
}) {
  if (!product) return null;
  const { title, price, images = [], category, rating, reviewsCount, bestSeller, customizable, variants = { sizes: [], colors: [] } } = product;

  const defaultFallback = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800';
  const primaryImgSrc = (images && images[0] && images[0].trim() !== '') ? images[0] : defaultFallback;
  const secondaryImgSrc = (images && images[1] && images[1].trim() !== '') ? images[1] : null;

  const handleQuickShop = (e, size = null) => {
    e.stopPropagation();
    if (onQuickViewClick) {
      onQuickViewClick(product, size);
    } else {
      onProductClick(product, size);
    }
  };

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
          <button className="quick-view-btn" onClick={(e) => handleQuickShop(e, null)}>
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

        {/* Price & Discount */}
        {(() => {
          const rawOrig = product.originalPrice || product.highlights?.originalPrice;
          const origP = (rawOrig && Number(rawOrig) > Number(price)) ? Number(rawOrig) : null;
          const hasDiscount = origP && Number(origP) > Number(price);
          const discountPercent = hasDiscount ? Math.round(((Number(origP) - Number(price)) / Number(origP)) * 100) : 0;
          
          return (
            <div className="product-card-price-row" style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {hasDiscount && (
                <span className="strikethrough-mrp" style={{ textDecoration: 'line-through', color: '#999999', fontSize: '13px', fontWeight: '400' }}>
                  ₹{Number(origP).toLocaleString('en-IN')}
                </span>
              )}
              <span className="product-card-price" style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                <span className="currency">₹</span>{price.toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <span className="discount-off-badge" style={{ color: '#d90429', fontWeight: '700', fontSize: '11.5px', letterSpacing: '0.02em' }}>
                  ({discountPercent}% OFF)
                </span>
              )}
            </div>
          );
        })()}

        {/* Clickable Size Swatches directly under price */}
        {variants?.sizes && variants.sizes.length > 0 && (
          <div className="product-card-sizes" onClick={(e) => e.stopPropagation()}>
            {variants.sizes.map(size => (
              <span 
                key={size} 
                className="product-card-size-box"
                onClick={(e) => handleQuickShop(e, size)}
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
