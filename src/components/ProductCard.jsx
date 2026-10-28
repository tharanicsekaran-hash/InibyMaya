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

  const [activeColorImg, setActiveColorImg] = React.useState(null);
  const cardColors = Array.isArray(variants?.colors) ? variants.colors : [];

  const defaultFallback = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800';
  const primaryImgSrc = activeColorImg || ((images && images[0] && images[0].trim() !== '') ? images[0] : defaultFallback);
  const secondaryImgSrc = (images && images[1] && images[1].trim() !== '') ? images[1] : null;

  const sizeQuantities = variants?.sizeQuantities || product.sizeQuantities || {};
  const cardSizes = Array.isArray(variants?.sizes)
    ? variants.sizes
    : (typeof variants?.sizes === 'string' ? variants.sizes.split(',').map(s => s.trim()).filter(Boolean) : []);

  const isSizeOutOfStock = (s) => sizeQuantities[s] !== undefined && Number(sizeQuantities[s]) <= 0;
  const isSizeLimited = (s) => sizeQuantities[s] !== undefined && Number(sizeQuantities[s]) > 0 && Number(sizeQuantities[s]) < 4;
  const isAllSizesOutOfStock = cardSizes.length > 0 && cardSizes.every(isSizeOutOfStock);
  const isProductSoldOut = Boolean(product.isOutOfStock || isAllSizesOutOfStock);

  const handleQuickShop = (e, size = null) => {
    e.stopPropagation();
    if (onQuickViewClick) {
      onQuickViewClick(product, size);
    } else {
      onProductClick(product, size);
    }
  };

  return (
    <div className={`product-card ${isProductSoldOut ? 'is-sold-out' : ''}`} onClick={() => onProductClick(product, null)}>
      <div className="product-card-image-wrapper" style={{ borderRadius: '12px' }}>
        {/* Badges */}
        <div className="product-badges">
          {isProductSoldOut && (
            <span className="badge badge-sold-out" style={{ backgroundColor: '#111827', color: '#ffffff', fontWeight: '700' }}>
              Out of Stock
            </span>
          )}
          {customizable && !isProductSoldOut && (
            <span className="badge badge-customizable">Custom Tailorable</span>
          )}
        </div>

        {/* Action Stack (Heart + Eye) - Always Visible */}
        <div className="product-action-stack">
          {onToggleFavorite && (
            <button 
              type="button"
              className={`favorite-btn-overlay ${isFavorite ? 'is-favorite' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(product.id);
              }}
              aria-label={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            >
              <Heart 
                size={13} 
                fill={isFavorite ? "#ef4444" : "none"} 
                stroke={isFavorite ? "#ef4444" : "var(--color-text-primary, #111827)"} 
              />
            </button>
          )}
          <button 
            type="button"
            className="quick-shop-icon-btn"
            onClick={(e) => handleQuickShop(e, null)}
            aria-label="Quick Shop"
            title="Quick Shop"
          >
            <Eye size={13} stroke="var(--color-text-primary, #111827)" />
          </button>
        </div>

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

        {/* Secondary Image (Hover Effect on Desktop Pointer only) */}
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

        {/* Color Variation Dots */}
        {cardColors.length > 1 && (
          <div className="product-card-colors" onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: '5px', marginBottom: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {cardColors.slice(0, 6).map((color, cIdx) => {
              const cImg = color.image || product.variants?.colorImages?.[color.name] || product.colorImages?.[color.name];
              const isSelected = activeColorImg === cImg;
              return (
                <span 
                  key={`${color.name}-${cIdx}`}
                  title={`${color.name}${cImg ? ' (Click to preview)' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (cImg) {
                      setActiveColorImg(isSelected ? null : cImg);
                    }
                  }}
                  style={{
                    width: isSelected ? '13px' : '10px',
                    height: isSelected ? '13px' : '10px',
                    borderRadius: '50%',
                    backgroundColor: color.hex,
                    border: isSelected ? '1.5px solid var(--color-text-primary, #111)' : '1px solid rgba(0,0,0,0.2)',
                    cursor: cImg ? 'pointer' : 'default',
                    display: 'inline-block',
                    transition: 'all 0.15s ease'
                  }}
                />
              );
            })}
            {cardColors.length > 6 && (
              <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>+{cardColors.length - 6}</span>
            )}
          </div>
        )}

        {/* Clickable Size Swatches directly under price */}
        {(() => {
          if (cardSizes.length === 0) return null;

          return (
            <div className="product-card-sizes" onClick={(e) => e.stopPropagation()}>
              {cardSizes.map(size => {
                const isOos = isSizeOutOfStock(size);
                const isLtd = isSizeLimited(size);
                const qty = sizeQuantities[size];

                return (
                  <span 
                    key={size} 
                    className={`product-card-size-box ${isOos ? 'out-of-stock' : ''} ${isLtd ? 'limited-stock' : ''}`}
                    style={isOos ? {
                      textDecoration: 'line-through',
                      opacity: 0.45,
                      backgroundColor: '#f3f4f6',
                      color: '#9ca3af',
                      borderColor: '#e5e7eb',
                      cursor: 'not-allowed'
                    } : isLtd ? {
                      borderColor: '#f97316',
                      color: '#c2410c'
                    } : {}}
                    title={isOos ? `${size} (Out of Stock)` : isLtd ? `${size} (Hurry up! Only ${qty} left)` : size}
                    onClick={(e) => {
                      if (isOos) {
                        e.stopPropagation();
                        return;
                      }
                      handleQuickShop(e, size);
                    }}
                  >
                    {size}
                  </span>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
