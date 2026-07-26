import React, { useState } from 'react';
import { X, Heart, Maximize2 } from 'lucide-react';

export default function QuickViewModal({ 
  product, 
  onClose, 
  onAddToCart, 
  onBuyNow, 
  onOpenFullDetail, 
  cartItems = [], 
  onToggleFavorite, 
  isFavorite = false 
}) {
  if (!product) return null;

  const { title, price, images = [], variants = { sizes: [], colors: [] } } = product;

  const defaultFallback = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800';
  const primaryImgSrc = (images && images[0] && images[0].trim() !== '') ? images[0] : defaultFallback;

  // Available sizes
  const sizesList = (variants?.sizes && variants.sizes.length > 0) 
    ? variants.sizes 
    : ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

  const [selectedSize, setSelectedSize] = useState(sizesList[0] || 'M');
  const [quantity, setQuantity] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');

  // Calculate items of this product already in cart
  const inCartCount = cartItems
    .filter(item => item.product?.id === product.id)
    .reduce((sum, item) => sum + (item.quantity || 1), 0);

  const selectedColor = (variants?.colors && variants.colors[0]) ? variants.colors[0].name : 'Default';

  const buildCartItem = () => {
    return {
      product,
      color: selectedColor,
      size: selectedSize,
      quantity,
      price: product.price,
      wantsCustomStitching: false
    };
  };

  const handleAddCartClick = () => {
    if (!selectedSize) {
      setErrorMsg('Please select a size');
      return;
    }
    onAddToCart(buildCartItem());
    onClose();
  };

  const handleBuyNowClick = () => {
    if (!selectedSize) {
      setErrorMsg('Please select a size');
      return;
    }
    const item = buildCartItem();
    onBuyNow(item);
    onClose();
  };

  return (
    <div className="overlay modal-overlay quickview-modal-overlay animate-fadeIn" onClick={onClose}>
      <div className="quickview-modal-card animate-slideUp" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button type="button" className="quickview-close-btn" onClick={onClose} aria-label="Close Quick View">
          <X size={20} />
        </button>

        {/* Top Product Summary Row */}
        <div className="quickview-product-header" onClick={() => { onOpenFullDetail(product); onClose(); }} title="Click to view full product page">
          <img src={primaryImgSrc} alt={title} className="quickview-thumb-img" />
          <div className="quickview-meta-info">
            <h3 className="quickview-title">{title}</h3>
            {(() => {
              const rawOrig = product.originalPrice || product.highlights?.originalPrice;
              const origP = (rawOrig && Number(rawOrig) > Number(price)) ? Number(rawOrig) : null;
              const hasDiscount = origP && Number(origP) > Number(price);
              const discountPercent = hasDiscount ? Math.round(((Number(origP) - Number(price)) / Number(origP)) * 100) : 0;
              
              return (
                <div className="quickview-price-tag" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {hasDiscount && (
                    <span style={{ textDecoration: 'line-through', color: '#888888', fontSize: '14px', fontWeight: '400' }}>
                      Rs. {Number(origP).toLocaleString('en-IN')}.00
                    </span>
                  )}
                  <span style={{ fontSize: '17px', fontWeight: '700', color: '#111111' }}>
                    Rs. {price.toLocaleString('en-IN')}.00
                  </span>
                  {hasDiscount && (
                    <span style={{ background: '#fef2f2', color: '#d90429', padding: '2px 8px', borderRadius: '4px', fontSize: '11.5px', fontWeight: '700' }}>
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Error notification if size missing */}
        {errorMsg && <p className="quickview-error-banner">{errorMsg}</p>}

        {/* Size Selection Row */}
        <div className="quickview-section">
          <div className="quickview-section-label">
            Size: <strong>{selectedSize}</strong>
          </div>
          <div className="quickview-size-buttons-grid">
            {sizesList.map(sz => (
              <button
                key={sz}
                type="button"
                className={`quickview-size-pill ${selectedSize === sz ? 'active' : ''}`}
                onClick={() => {
                  setSelectedSize(sz);
                  setErrorMsg('');
                }}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity Row */}
        <div className="quickview-section">
          <div className="quickview-section-label">
            Quantity {inCartCount > 0 ? `(${inCartCount} in cart)` : ''}
          </div>
          <div className="quickview-qty-stepper">
            <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
            <span className="qty-value">{quantity}</span>
            <button type="button" onClick={() => setQuantity(q => q + 1)}>+</button>
          </div>
        </div>

        {/* Actions Row: Add to cart + Favorite + Full Detail */}
        <div className="quickview-main-actions-row">
          <button type="button" className="quickview-add-cart-btn" onClick={handleAddCartClick}>
            Add to cart - Rs. {(price * quantity).toLocaleString('en-IN')}.00
          </button>
          
          {onToggleFavorite && (
            <button 
              type="button" 
              className={`quickview-icon-btn ${isFavorite ? 'active' : ''}`} 
              onClick={() => onToggleFavorite(product.id)}
              title="Add to Favorites"
            >
              <Heart size={18} fill={isFavorite ? "#8b0000" : "none"} stroke={isFavorite ? "#8b0000" : "#111"} />
            </button>
          )}

          <button 
            type="button" 
            className="quickview-icon-btn" 
            onClick={() => { onOpenFullDetail(product); onClose(); }} 
            title="View Full Product Page"
          >
            <Maximize2 size={18} />
          </button>
        </div>

        {/* Red BUY IT NOW Button */}
        <button type="button" className="quickview-buy-now-btn" onClick={handleBuyNowClick}>
          BUY IT NOW
        </button>
      </div>
    </div>
  );
}
