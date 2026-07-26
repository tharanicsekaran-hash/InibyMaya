import React, { useState } from 'react';
import { X, Star, Ruler, Sparkles, Check, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import OutfitCustomizer from './OutfitCustomizer';

export default function ProductDetailModal({ product, onClose, onAddToCart, preselectedSize }) {
  const { title, price, images, category, rating, reviewsCount, description, details, variants, customizable, highlights } = product;

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(variants.colors[0]);
  const [selectedSize, setSelectedSize] = useState(
    preselectedSize && variants.sizes.includes(preselectedSize) ? preselectedSize : ''
  );
  const [quantity, setQuantity] = useState(1);
  const [wantsCustomStitching, setWantsCustomStitching] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);

  // Style customization state (from OutfitCustomizer)
  const [styleCustomization, setStyleCustomization] = useState({
    lining: 'Without Lining',
    zip: 'No',
    sleeve: null,
    neck: null,
    notes: ''
  });

  // Key Highlights State and Defaults
  const [showAllHighlights, setShowAllHighlights] = useState(false);
  const productHighlights = {
    fit: highlights?.fit || (category === 'Anarkali Suits' ? 'Flared Royal Anarkali fit' : 'Straight Regular Fit'),
    fabric: highlights?.fabric || (category === 'Anarkali Suits' ? 'Premium Georgette' : '100% Breathable Cotton'),
    neck: highlights?.neck || (category === 'Anarkali Suits' ? 'Round Neck' : 'Mandarin Neck'),
    sleeve: highlights?.sleeve || '3/4 Sleeves',
    length: highlights?.length || (category === 'Anarkali Suits' ? '52 Inches' : '44 Inches'),
    technique: highlights?.technique || (category === 'Anarkali Suits' ? 'Silk Zardozi Embroidery' : 'Handcrafted Chikankari')
  };

  // Downbars Accordion State
  const [activeAccordions, setActiveAccordions] = useState({
    description: true,
    washcare: false,
    shipping: false,
    customercare: false
  });

  const toggleAccordion = (tab) => {
    setActiveAccordions(prev => ({
      ...prev,
      [tab]: !prev[tab]
    }));
  };

  const [errorMsg, setErrorMsg] = useState('');

  const stitchingFee = 399;
  const unitPrice = wantsCustomStitching ? price + stitchingFee : price;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    if (!selectedSize) {
      setErrorMsg(wantsCustomStitching ? 'Please select a base size for your custom stitching.' : 'Please select a size.');
      return;
    }

    const cartItem = {
      product,
      color: selectedColor.name,
      size: wantsCustomStitching ? `Custom Tailored (${selectedSize})` : selectedSize,
      quantity,
      price: unitPrice,
      wantsCustomStitching,
      styleCustomization: customizable ? styleCustomization : null
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

            {(() => {
              const rawOrig = product.originalPrice || product.highlights?.originalPrice;
              const origP = (rawOrig && Number(rawOrig) > Number(price)) ? Number(rawOrig) : null;
              const hasDiscount = origP && Number(origP) > Number(price);
              const discountPercent = hasDiscount ? Math.round(((Number(origP) - Number(price)) / Number(origP)) * 100) : 0;

              return (
                <div className="detail-price-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', margin: '14px 0 18px' }}>
                  {hasDiscount && (
                    <span style={{ textDecoration: 'line-through', color: '#999999', fontSize: '18px', fontWeight: '400' }}>
                      ₹{(Number(origP) + (wantsCustomStitching ? stitchingFee : 0)).toLocaleString('en-IN')}
                    </span>
                  )}
                  <span className="detail-price" style={{ fontSize: '26px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                    ₹{unitPrice.toLocaleString('en-IN')}
                  </span>
                  {hasDiscount && (
                    <span style={{ background: '#fef2f2', color: '#d90429', border: '1px solid #fecaca', padding: '4px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: '700' }}>
                      {discountPercent}% OFF
                    </span>
                  )}
                  {wantsCustomStitching && <span className="stitching-badge">Includes Custom Stitching</span>}
                </div>
              );
            })()}

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

                {/* Style Studio — shown when toggle is enabled */}
                {wantsCustomStitching && (
                  <div className="animate-slideDown" style={{ marginTop: '16px' }}>
                    <OutfitCustomizer
                      selectedColor={selectedColor}
                      onCustomizationChange={setStyleCustomization}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Sizes (always visible so custom tailoring has a base size) */}
            <div className="option-section">
              <div className="size-label-row">
                <span className="option-label">{wantsCustomStitching ? 'Base Size' : 'Size'}: <strong>{selectedSize || 'Select'}</strong></span>
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

            {/* Key Highlights Grid */}
            <div className="key-highlights-container">
              <h4 className="highlights-section-title">Key Highlights</h4>
              <div className="highlights-grid">
                <div className="highlight-item">
                  <span className="highlight-label">Fit</span>
                  <span className="highlight-value">{productHighlights.fit}</span>
                </div>
                <div className="highlight-item">
                  <span className="highlight-label">Top Fabric</span>
                  <span className="highlight-value">{productHighlights.fabric}</span>
                </div>
                <div className="highlight-item">
                  <span className="highlight-label">Neck</span>
                  <span className="highlight-value">{productHighlights.neck}</span>
                </div>
                <div className="highlight-item">
                  <span className="highlight-label">Sleeve Styling</span>
                  <span className="highlight-value">{productHighlights.sleeve}</span>
                </div>

                {showAllHighlights && (
                  <>
                    <div className="highlight-item animate-fadeIn">
                      <span className="highlight-label">Sleeve Length</span>
                      <span className="highlight-value">{productHighlights.length}</span>
                    </div>
                    <div className="highlight-item animate-fadeIn">
                      <span className="highlight-label">Top Technique</span>
                      <span className="highlight-value">{productHighlights.technique}</span>
                    </div>
                  </>
                )}
              </div>
              <button 
                type="button" 
                className="highlights-show-more-btn" 
                onClick={() => setShowAllHighlights(!showAllHighlights)}
              >
                {showAllHighlights ? 'Show Less' : 'Show More'}
              </button>
            </div>

            {/* Accordions / Downbars */}
            <div className="details-accordions-group">
              {/* Accordion 1: DESCRIPTION */}
              <div className="accordion-downbar">
                <button 
                  type="button" 
                  className="accordion-header-btn" 
                  onClick={() => toggleAccordion('description')}
                >
                  <span>Description</span>
                  {activeAccordions.description ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {activeAccordions.description && (
                  <div className="accordion-body-content animate-slideDown">
                    <p className="accordion-desc-text">{description}</p>
                    <ul className="accordion-details-list">
                      {details.map((detail, idx) => (
                        <li key={idx}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Accordion 2: WASH CARE INSTRUCTIONS */}
              <div className="accordion-downbar">
                <button 
                  type="button" 
                  className="accordion-header-btn" 
                  onClick={() => toggleAccordion('washcare')}
                >
                  <span>Wash Care Instructions</span>
                  {activeAccordions.washcare ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {activeAccordions.washcare && (
                  <div className="accordion-body-content animate-slideDown">
                    <p className="accordion-desc-text">
                      {productHighlights.fabric.toLowerCase().includes('velvet') || 
                       productHighlights.fabric.toLowerCase().includes('silk') || 
                       productHighlights.fabric.toLowerCase().includes('georgette') ||
                       productHighlights.fabric.toLowerCase().includes('muslin') ? (
                        "Dry clean only. Do not machine wash. Do not bleach. Cool iron on reverse with a protective cloth cover. Store folded in a muslin sleeve."
                      ) : (
                        "Gentle hand wash separately in cold water with mild detergent. Line dry inside-out in shade. Do not twist, wring, or soak. Cool or warm iron if needed."
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Accordion 3: SHIPPING & EXCHANGES */}
              <div className="accordion-downbar">
                <button 
                  type="button" 
                  className="accordion-header-btn" 
                  onClick={() => toggleAccordion('shipping')}
                >
                  <span>Shipping & Exchanges</span>
                  {activeAccordions.shipping ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {activeAccordions.shipping && (
                  <div className="accordion-body-content animate-slideDown">
                    <p className="accordion-desc-text">
                      <strong>Dispatch Timeline:</strong> Standard creations ship within 3–5 boutique business days. Orders with custom stitching configurations require an additional 2 working days for tailor drafting and pattern layout checks.
                    </p>
                    <p className="accordion-desc-text">
                      <strong>Returns & Exchanges:</strong> We accept free exchanges or store credit returns within 7 days of package delivery. Outfits must be returned unworn, unwashed, and in their original packaging with tags attached.
                    </p>
                  </div>
                )}
              </div>

              {/* Accordion 4: CUSTOMER CARE */}
              <div className="accordion-downbar">
                <button 
                  type="button" 
                  className="accordion-header-btn" 
                  onClick={() => toggleAccordion('customercare')}
                >
                  <span>Customer Care</span>
                  {activeAccordions.customercare ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {activeAccordions.customercare && (
                  <div className="accordion-body-content animate-slideDown">
                    <p className="accordion-desc-text">
                      Need custom fit modifications, special design details, or priority shipping?
                    </p>
                    <p className="accordion-desc-text">
                      Email our couture concierge at <strong>care@inibymaya.com</strong> or call us at <strong>+91 98765 43210</strong> (Monday – Saturday, 10 AM to 7 PM IST). We are happy to coordinate your measurements with our master tailors!
                    </p>
                  </div>
                )}
              </div>
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
                    <th>Hips</th>
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
