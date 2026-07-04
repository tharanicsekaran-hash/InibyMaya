import React, { useState } from 'react';
import { X, Star, Ruler, Sparkles, Check, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductDetailModal({ product, onClose, onAddToCart }) {
  const { title, price, images, category, rating, reviewsCount, description, details, variants, customizable } = product;

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(variants.colors[0]);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [wantsCustomStitching, setWantsCustomStitching] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);

  // Custom measurement fields
  const [customBust, setCustomBust] = useState('');
  const [customWaist, setCustomWaist] = useState('');
  const [customHips, setCustomHips] = useState('');
  const [customHeight, setCustomHeight] = useState('');
  const [customLength, setCustomLength] = useState('');
  const [customNotes, setCustomNotes] = useState('');

  const [errorMsg, setErrorMsg] = useState('');

  const stitchingFee = 399;
  const unitPrice = wantsCustomStitching ? price + stitchingFee : price;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    if (!selectedSize && !wantsCustomStitching) {
      setErrorMsg('Please select a size or choose custom stitching.');
      return;
    }

    if (wantsCustomStitching) {
      if (!customBust || !customWaist || !customHips || !customHeight) {
        setErrorMsg('Please fill in all custom measurement fields marked with *');
        return;
      }
    }

    const cartItem = {
      product,
      color: selectedColor.name,
      size: wantsCustomStitching ? 'Custom Tailored' : selectedSize,
      quantity,
      price: unitPrice,
      wantsCustomStitching,
      measurements: wantsCustomStitching ? {
        bust: customBust,
        waist: customWaist,
        hips: customHips,
        height: customHeight,
        length: customLength || 'Standard',
        notes: customNotes
      } : null
    };

    onAddToCart(cartItem);
    onClose();
  };

  return (
    <div className="product-detail-page container">
      {/* Back to Collections Link */}
      <button className="back-to-shop-link" onClick={onClose}>
        <ChevronLeft size={16} />
        <span>Back to Collections</span>
      </button>

      <div className="modal-content-grid">
          {/* Column 1: Image Gallery */}
          <div className="gallery-column">
            <div className="primary-preview-wrapper">
              <img 
                src={images[activeImageIdx]} 
                alt={title} 
                className="primary-preview" 
              />
              {images.length > 1 && (
                <>
                  <button 
                    className="gallery-nav-btn prev-btn" 
                    onClick={() => setActiveImageIdx(prev => prev === 0 ? images.length - 1 : prev - 1)}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    className="gallery-nav-btn next-btn" 
                    onClick={() => setActiveImageIdx(prev => prev === images.length - 1 ? 0 : prev + 1)}
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            <div className="thumbnails-row">
              {images.map((img, idx) => (
                <button 
                  key={idx} 
                  className={`thumbnail-btn ${idx === activeImageIdx ? 'active' : ''}`}
                  onClick={() => setActiveImageIdx(idx)}
                >
                  <img src={img} alt={`${title} thumbnail ${idx + 1}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Column 2: Details and Selector Form */}
          <div className="details-column">
            <span className="detail-category">{category}</span>
            <h2 className="detail-title">{title}</h2>

            <div className="detail-rating-row">
              <div className="stars-row">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    fill={i < Math.floor(rating) ? "var(--color-accent)" : "none"} 
                    stroke={i < Math.floor(rating) ? "var(--color-accent)" : "#ccc"} 
                  />
                ))}
              </div>
              <span className="reviews-count">{reviewsCount} reviews</span>
            </div>

            <div className="detail-price">
              ₹{unitPrice.toLocaleString('en-IN')}
              {wantsCustomStitching && <span className="stitching-badge">Includes Custom Stitching</span>}
            </div>

            <p className="detail-description">{description}</p>

            <hr className="detail-divider" />

            {/* Colors */}
            <div className="option-section">
              <span className="option-label">Color: <strong>{selectedColor.name}</strong></span>
              <div className="color-chips">
                {variants.colors.map((color, idx) => (
                  <button
                    key={idx}
                    className={`color-chip-btn ${selectedColor.name === color.name ? 'active' : ''}`}
                    onClick={() => setSelectedColor(color)}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {selectedColor.name === color.name && <Check size={14} stroke={color.hex === '#fefefa' ? '#000' : '#fff'} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Tailoring Option Toggle */}
            {customizable && (
              <div className="custom-stitching-toggle-card">
                <div className="toggle-header" onClick={() => {
                  setWantsCustomStitching(!wantsCustomStitching);
                  setSelectedSize('');
                  setErrorMsg('');
                }}>
                  <div className="toggle-info">
                    <Sparkles size={18} className="toggle-icon animate-pulse" />
                    <div>
                      <span className="toggle-title">Custom Measurements Stitching</span>
                      <span className="toggle-desc">Get tailored fittings for +₹{stitchingFee}</span>
                    </div>
                  </div>
                  <div className={`toggle-checkbox-mock ${wantsCustomStitching ? 'checked' : ''}`}>
                    {wantsCustomStitching && <Check size={14} />}
                  </div>
                </div>

                {/* Measurements Form */}
                {wantsCustomStitching && (
                  <div className="measurements-form animate-slideDown">
                    <p className="form-helper-text">Enter your body measurements in inches below. Our master tailors will craft the outfit to fit you perfectly.</p>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Bust Size *</label>
                        <input 
                          type="number" 
                          placeholder="e.g. 36" 
                          value={customBust} 
                          onChange={(e) => setCustomBust(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Waist Size *</label>
                        <input 
                          type="number" 
                          placeholder="e.g. 30" 
                          value={customWaist} 
                          onChange={(e) => setCustomWaist(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Hips Size *</label>
                        <input 
                          type="number" 
                          placeholder="e.g. 40" 
                          value={customHips} 
                          onChange={(e) => setCustomHips(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Your Height *</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 5ft 4in" 
                          value={customHeight} 
                          onChange={(e) => setCustomHeight(e.target.value)}
                        />
                      </div>
                      <div className="form-group full-width">
                        <label>Preferred Length (optional)</label>
                        <input 
                          type="number" 
                          placeholder="Standard is 44 inches" 
                          value={customLength} 
                          onChange={(e) => setCustomLength(e.target.value)}
                        />
                      </div>
                      <div className="form-group full-width">
                        <label>Additional Notes for Tailoring</label>
                        <textarea 
                          rows="2" 
                          placeholder="e.g., loose-fitting sleeves, side pocket"
                          value={customNotes} 
                          onChange={(e) => setCustomNotes(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sizes (only show if not doing custom stitching) */}
            {!wantsCustomStitching && (
              <div className="option-section">
                <div className="size-label-row">
                  <span className="option-label">Size: <strong>{selectedSize || 'Select'}</strong></span>
                  <button className="size-chart-link-btn" onClick={() => setShowSizeChart(true)}>
                    <Ruler size={14} />
                    <span>Size Guide</span>
                  </button>
                </div>
                <div className="size-chips">
                  {variants.sizes.map((size) => (
                    <button
                      key={size}
                      className={`size-chip-btn ${selectedSize === size ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedSize(size);
                        setErrorMsg('');
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="qty-section">
              <span className="option-label">Quantity</span>
              <div className="quantity-selector">
                <button onClick={() => setQuantity(prev => Math.max(1, prev - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(prev => prev + 1)}>+</button>
              </div>
            </div>

            {errorMsg && <p className="error-message">{errorMsg}</p>}

            {/* Actions */}
            <button className="add-to-cart-large-btn" onClick={handleAddToCart}>
              Add to Cart — ₹{totalPrice.toLocaleString('en-IN')}
            </button>

            {/* Highlights List */}
            <div className="product-highlights-box">
              <h4>Details & Specifications</h4>
              <ul>
                {details.map((detail, idx) => (
                  <li key={idx}>{detail}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      {/* Embedded Size Chart Guide Modal */}
      {showSizeChart && (
        <div className="size-chart-modal-overlay" onClick={() => setShowSizeChart(false)}>
          <div className="size-chart-modal" onClick={e => e.stopPropagation()}>
            <div className="size-chart-header">
              <h3>Standard Size Guide (Inches)</h3>
              <button className="close-btn" onClick={() => setShowSizeChart(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="size-chart-body">
              <table>
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Bust</th>
                    <th>Waist</th>
                    <th>Hip</th>
                    <th>Length</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>XS</td>
                    <td>32"</td>
                    <td>26"</td>
                    <td>36"</td>
                    <td>42"</td>
                  </tr>
                  <tr>
                    <td>S</td>
                    <td>34"</td>
                    <td>28"</td>
                    <td>38"</td>
                    <td>42"</td>
                  </tr>
                  <tr>
                    <td>M</td>
                    <td>36"</td>
                    <td>30"</td>
                    <td>40"</td>
                    <td>43"</td>
                  </tr>
                  <tr>
                    <td>L</td>
                    <td>38"</td>
                    <td>32"</td>
                    <td>42"</td>
                    <td>43"</td>
                  </tr>
                  <tr>
                    <td>XL</td>
                    <td>40"</td>
                    <td>34"</td>
                    <td>44"</td>
                    <td>44"</td>
                  </tr>
                  <tr>
                    <td>XXL</td>
                    <td>42"</td>
                    <td>36"</td>
                    <td>46"</td>
                    <td>44"</td>
                  </tr>
                </tbody>
              </table>
              <p className="size-chart-footer-note">Note: If your measurements fall between sizes, we recommend selecting the larger size or using our custom tailoring option.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
