import React, { useState, useMemo } from 'react';
import { 
  X, 
  Star, 
  Ruler, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  Share2, 
  Sparkles,
  Heart,
  Check
} from 'lucide-react';
import { renderRichTextHtml } from '../utils/textParser';
import OutfitCustomizer from './OutfitCustomizer';
import ProductCard from './ProductCard';

export default function ProductDetailModal({ 
  product, 
  onClose, 
  onAddToCart, 
  preselectedSize,
  allProducts = [],
  onProductClick,
  onQuickViewClick,
  favorites = [],
  onToggleFavorite,
  boutiqueSettings = {}
}) {
  const { title, price, images, category, rating, reviewsCount, description, details, variants, customizable, highlights } = product;

  // Deduplicate and fallback colors safely so duplicates and empty variants never cause issues
  const availableColors = useMemo(() => {
    const list = Array.isArray(variants?.colors) && variants.colors.length > 0
      ? variants.colors
      : [{ name: 'Default', hex: '#111111' }];
    
    const seenNames = new Set();
    const seenHexes = new Set();
    const result = [];
    for (const c of list) {
      if (!c) continue;
      const n = (typeof c === 'string' ? c : c.name || '').trim();
      const h = (typeof c === 'object' && c.hex ? c.hex : '#111111').trim().toLowerCase();
      const normN = n.toLowerCase();
      if (!seenNames.has(normN) && !seenHexes.has(h)) {
        seenNames.add(normN);
        seenHexes.add(h);
        result.push({ name: n || 'Default', hex: typeof c === 'object' && c.hex ? c.hex : '#111111' });
      }
    }
    return result.length > 0 ? result : [{ name: 'Default', hex: '#111111' }];
  }, [variants?.colors]);

  // Safely parse and normalize available sizes
  const availableSizes = useMemo(() => {
    if (Array.isArray(variants?.sizes)) {
      return variants.sizes.map(s => String(s).trim()).filter(Boolean);
    }
    if (typeof variants?.sizes === 'string') {
      try {
        const parsed = JSON.parse(variants.sizes);
        if (Array.isArray(parsed)) return parsed.map(s => String(s).trim()).filter(Boolean);
      } catch (e) {}
      return variants.sizes.split(',').map(s => s.trim()).filter(Boolean);
    }
    return ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  }, [variants?.sizes]);

  const sizeQuantities = variants?.sizeQuantities || product.sizeQuantities || {};
  const isSizeOutOfStock = (s) => sizeQuantities[s] !== undefined && Number(sizeQuantities[s]) <= 0;
  const getSizeQuantity = (s) => sizeQuantities[s] !== undefined ? Number(sizeQuantities[s]) : 10;
  const isAllSizesOutOfStock = availableSizes.length > 0 && availableSizes.every(isSizeOutOfStock);
  const isProductSoldOut = Boolean(product.isOutOfStock || isAllSizesOutOfStock);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(availableColors[0]);
  const [selectedSize, setSelectedSize] = useState(() => {
    if (preselectedSize && availableSizes.includes(preselectedSize) && !isSizeOutOfStock(preselectedSize)) {
      return preselectedSize;
    }
    const inStock = availableSizes.find(s => !isSizeOutOfStock(s));
    return inStock || availableSizes[0] || '';
  });
  const [quantity, setQuantity] = useState(1);
  const [wantsCustomStitching, setWantsCustomStitching] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const isKidsProduct = Boolean(
    (category && /kid|child|baby|infant|toddler/i.test(category)) ||
    (availableSizes.some(s => /^\d+[-–]\d+[MY]|^\d+[MY]|\b(month|year|newborn|infant|toddler)\b/i.test(String(s))))
  );
  const [sizeChartTab, setSizeChartTab] = useState(isKidsProduct ? 'kids' : 'adult');

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

  // Related products logic (same category first, excluding current product)
  const sameCategoryProducts = (allProducts || []).filter(
    p => p && p.id !== product.id && p.category === category
  );
  const otherCategoryProducts = (allProducts || []).filter(
    p => p && p.id !== product.id && p.category !== category
  );
  const relatedProducts = [...sameCategoryProducts, ...otherCategoryProducts].slice(0, 8);

  const toggleAccordion = (tab) => {
    setActiveAccordions(prev => ({
      ...prev,
      [tab]: !prev[tab]
    }));
  };

  const [errorMsg, setErrorMsg] = useState('');

  const tailoringFee = wantsCustomStitching ? (styleCustomization?.tailoringCost || 0) : 0;
  const unitPrice = price + tailoringFee;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    if (isProductSoldOut || (selectedSize && isSizeOutOfStock(selectedSize))) {
      setErrorMsg(`Size ${selectedSize || 'selected'} is currently Out of Stock.`);
      return;
    }
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

            {/* Desktop Left Column: Related Products strictly inside left space under thumbnails */}
            {relatedProducts.length > 0 && (
              <div className="desktop-left-related-section">
                <div className="related-section-header">
                  <div>
                    <h4 className="related-section-title">YOU MAY ALSO LIKE</h4>
                    <p className="related-section-sub">More handcrafted creations in {category}</p>
                  </div>
                </div>
                <div className="related-products-scroll-row">
                  {relatedProducts.map(relProd => (
                    <div key={relProd.id} className="related-card-wrapper">
                      <ProductCard 
                        product={relProd}
                        isFavorite={favorites.includes(relProd.id)}
                        onToggleFavorite={onToggleFavorite}
                        onProductClick={(prod, size) => {
                          if (onProductClick) onProductClick(prod, size);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        onQuickViewClick={onQuickViewClick}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                      ₹{(Number(origP) + (wantsCustomStitching ? tailoringFee : 0)).toLocaleString('en-IN')}
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

            {/* Colors */}
            <div className="option-section">
              <span className="option-label">Color: <strong>{selectedColor?.name || 'Default'}</strong></span>
              <div className="color-chips">
                {availableColors.map((color, idx) => (
                  <button
                    key={`${color.name}-${color.hex}-${idx}`}
                    className={`color-chip-btn ${(selectedColor?.name || '') === color.name ? 'active' : ''}`}
                    onClick={() => setSelectedColor(color)}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {(selectedColor?.name || '') === color.name && (
                      <Check size={14} stroke={color.hex === '#fefefa' || color.hex === '#ffffff' ? '#000' : '#fff'} />
                    )}
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
                      <span className="toggle-title">Custom Measurements & Style Stitching</span>
                      <span className="toggle-desc">Tailoring charges depend on your selected custom style</span>
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
                      boutiqueSettings={boutiqueSettings}
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
                <button 
                  className="size-chart-link-btn" 
                  onClick={() => {
                    setSizeChartTab(isKidsProduct ? 'kids' : 'adult');
                    setShowSizeChart(true);
                  }}
                >
                  <Ruler size={14} />
                  <span>Size Guide</span>
                </button>
              </div>
              <div className="size-chips">
                {availableSizes.map((size) => {
                  const isOos = isSizeOutOfStock(size);
                  const qty = getSizeQuantity(size);
                  const isLtd = !isOos && qty < 4;

                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={isOos}
                      className={`size-chip-btn ${selectedSize === size ? 'active' : ''} ${isOos ? 'out-of-stock' : ''} ${isLtd ? 'limited-stock' : ''}`}
                      onClick={() => {
                        if (isOos) return;
                        setSelectedSize(size);
                        setErrorMsg('');
                      }}
                      title={isOos ? `${size} - Out of Stock` : isLtd ? `${size} - Limited Stock (${qty} left)` : size}
                    >
                      <span className="size-name">{size}</span>
                      {isOos && <span className="size-subtag oos">Out of Stock</span>}
                      {isLtd && <span className="size-subtag limited">Only {qty} left</span>}
                    </button>
                  );
                })}
              </div>

              {/* Urgency & Out-of-stock banner */}
              {selectedSize && !isSizeOutOfStock(selectedSize) && getSizeQuantity(selectedSize) < 4 && (
                <div className="size-limited-hurry-banner animate-fadeIn" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#fff7ed',
                  border: '1px solid #fdba74',
                  color: '#c2410c',
                  padding: '7px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginTop: '10px'
                }}>
                  <span>🔥 Hurry up! Limited stock — only {getSizeQuantity(selectedSize)} left in size {selectedSize}!</span>
                </div>
              )}
              {selectedSize && isSizeOutOfStock(selectedSize) && (
                <div className="size-oos-banner animate-fadeIn" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  padding: '7px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginTop: '10px'
                }}>
                  <span>⚠️ Size {selectedSize} is currently Out of Stock.</span>
                </div>
              )}
            </div>

            {/* Quantity */}
            <div className="qty-section">
              <span className="option-label">Quantity</span>
              <div className="quantity-selector">
                <button 
                  type="button"
                  disabled={isProductSoldOut || isSizeOutOfStock(selectedSize)}
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                >-</button>
                <span>{quantity}</span>
                <button 
                  type="button"
                  disabled={isProductSoldOut || isSizeOutOfStock(selectedSize)}
                  onClick={() => {
                    const maxStock = getSizeQuantity(selectedSize);
                    if (quantity >= maxStock) {
                      setErrorMsg(`Only ${maxStock} items available in stock for size ${selectedSize}.`);
                      return;
                    }
                    setErrorMsg('');
                    setQuantity(prev => prev + 1);
                  }}
                >+</button>
              </div>
            </div>

            {errorMsg && <p className="error-message">{errorMsg}</p>}

            {/* Actions */}
            <button 
              className={`add-to-cart-large-btn ${(isProductSoldOut || isSizeOutOfStock(selectedSize)) ? 'disabled-sold-out' : ''}`} 
              onClick={handleAddToCart}
              disabled={isProductSoldOut || isSizeOutOfStock(selectedSize)}
              style={(isProductSoldOut || isSizeOutOfStock(selectedSize)) ? {
                backgroundColor: '#9ca3af',
                cursor: 'not-allowed',
                opacity: 0.75
              } : {}}
            >
              {(isProductSoldOut || isSizeOutOfStock(selectedSize)) 
                ? 'Out of Stock' 
                : `Add to Cart — ₹${totalPrice.toLocaleString('en-IN')}`}
            </button>

            {/* Key Highlights Grid */}
            {(() => {
              const highlightsEnabled = product.showKeyHighlights !== false && highlights?.enabled !== false;
              if (!highlightsEnabled) return null;

              const headings = highlights?.headings || {};
              const configuredHighlights = [
                { key: 'fit', label: headings.fit || 'Garment Fit', val: highlights?.fit },
                { key: 'fabric', label: headings.fabric || 'Fabric', val: highlights?.fabric },
                { key: 'neck', label: headings.neck || 'Neckline Style', val: highlights?.neck },
                { key: 'frontNeck', label: headings.frontNeck || 'Front Neck', val: highlights?.frontNeck || highlights?.front_neck },
                { key: 'backNeck', label: headings.backNeck || 'Back Neck', val: highlights?.backNeck || highlights?.back_neck },
                { key: 'sleeve', label: headings.sleeve || 'Sleeve Styling', val: highlights?.sleeve },
                { key: 'length', label: headings.length || 'Sleeve Length', val: highlights?.length },
                { key: 'topHeight', label: headings.topHeight || 'Top Height', val: highlights?.topHeight || highlights?.top_height },
                { key: 'bottomHeight', label: headings.bottomHeight || 'Bottom Height', val: highlights?.bottomHeight || highlights?.bottom_height },
                { key: 'technique', label: headings.technique || 'Craft Technique', val: highlights?.technique }
              ].filter(item => Boolean(item.val && String(item.val).trim()));

              if (configuredHighlights.length === 0) return null;

              const visibleHighlights = showAllHighlights ? configuredHighlights : configuredHighlights.slice(0, 4);

              return (
                <div className="key-highlights-container">
                  <h4 className="highlights-section-title">Key Highlights</h4>
                  <div className="highlights-grid">
                    {visibleHighlights.map((item) => (
                      <div key={item.key} className="highlight-item animate-fadeIn">
                        <span className="highlight-label">{item.label}</span>
                        <span className="highlight-value">{item.val}</span>
                      </div>
                    ))}
                  </div>
                  {configuredHighlights.length > 4 && (
                    <button 
                      type="button" 
                      className="highlights-show-more-btn" 
                      onClick={() => setShowAllHighlights(!showAllHighlights)}
                    >
                      {showAllHighlights ? 'Show Less' : 'Show More'}
                    </button>
                  )}
                </div>
              );
            })()}

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
                    {description && (
                      <div 
                        className="accordion-desc-text rich-product-description"
                        dangerouslySetInnerHTML={{ __html: renderRichTextHtml(description) }}
                        style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--color-text-secondary)', marginBottom: '14px' }}
                      />
                    )}
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
                      <strong>Dispatch Timeline:</strong> Standard creations ship within 5–10 boutique business days. Orders with custom stitching configurations require an additional 2 working days for tailor drafting and pattern layout checks.
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

            {/* Mobile-only: Related Products under Customer Care Accordion */}
            {relatedProducts.length > 0 && (
              <div className="mobile-under-care-related-section">
                <div className="related-section-header">
                  <div>
                    <h4 className="related-section-title">YOU MAY ALSO LIKE</h4>
                    <p className="related-section-sub">More handcrafted creations in {category}</p>
                  </div>
                </div>
                <div className="related-products-scroll-row">
                  {relatedProducts.map(relProd => (
                    <div key={relProd.id} className="related-card-wrapper">
                      <ProductCard 
                        product={relProd}
                        isFavorite={favorites.includes(relProd.id)}
                        onToggleFavorite={onToggleFavorite}
                        onProductClick={(prod, size) => {
                          if (onProductClick) onProductClick(prod, size);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        onQuickViewClick={onQuickViewClick}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      {/* Embedded Size Chart Guide Modal */}
      {showSizeChart && (
        <div className="size-chart-modal-overlay" onClick={() => setShowSizeChart(false)}>
          <div className="size-chart-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div className="size-chart-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>Standard Sizing Guide</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                  Accurate body measurements in inches and cm
                </p>
              </div>
              <button className="close-btn" onClick={() => setShowSizeChart(false)} aria-label="Close size guide">
                <X size={20} />
              </button>
            </div>

            {/* Sizing Category Tabs */}
            <div style={{ display: 'flex', gap: '4px', padding: '10px 16px 0', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
              <button 
                type="button"
                onClick={() => setSizeChartTab('adult')}
                style={{
                  padding: '8px 16px',
                  fontSize: '12px',
                  fontWeight: sizeChartTab === 'adult' ? 600 : 500,
                  border: 'none',
                  background: 'none',
                  borderBottom: sizeChartTab === 'adult' ? '2.5px solid var(--color-text-primary)' : '2.5px solid transparent',
                  color: sizeChartTab === 'adult' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                👩 Adult Standard (Inches)
              </button>
              <button 
                type="button"
                onClick={() => setSizeChartTab('kids')}
                style={{
                  padding: '8px 16px',
                  fontSize: '12px',
                  fontWeight: sizeChartTab === 'kids' ? 600 : 500,
                  border: 'none',
                  background: 'none',
                  borderBottom: sizeChartTab === 'kids' ? '2.5px solid #8b0000' : '2.5px solid transparent',
                  color: sizeChartTab === 'kids' ? '#8b0000' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                👶 Kids by Age Group
              </button>
            </div>

            <div className="size-chart-body" style={{ padding: '16px 20px 20px' }}>
              {sizeChartTab === 'adult' ? (
                <div style={{ overflowX: 'auto' }}>
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
                        <td><strong>XS</strong></td>
                        <td>32"</td>
                        <td>26"</td>
                        <td>36"</td>
                        <td>42"</td>
                      </tr>
                      <tr>
                        <td><strong>S</strong></td>
                        <td>34"</td>
                        <td>28"</td>
                        <td>38"</td>
                        <td>42"</td>
                      </tr>
                      <tr>
                        <td><strong>M</strong></td>
                        <td>36"</td>
                        <td>30"</td>
                        <td>40"</td>
                        <td>43"</td>
                      </tr>
                      <tr>
                        <td><strong>L</strong></td>
                        <td>38"</td>
                        <td>32"</td>
                        <td>42"</td>
                        <td>43"</td>
                      </tr>
                      <tr>
                        <td><strong>XL</strong></td>
                        <td>40"</td>
                        <td>34"</td>
                        <td>44"</td>
                        <td>44"</td>
                      </tr>
                      <tr>
                        <td><strong>XXL</strong></td>
                        <td>42"</td>
                        <td>36"</td>
                        <td>46"</td>
                        <td>44"</td>
                      </tr>
                      <tr>
                        <td><strong>3XL</strong></td>
                        <td>44"</td>
                        <td>38"</td>
                        <td>48"</td>
                        <td>44"</td>
                      </tr>
                      <tr>
                        <td><strong>Free Size</strong></td>
                        <td>34" - 42"</td>
                        <td>Flexible</td>
                        <td>40" - 46"</td>
                        <td>43"</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="size-chart-footer-note">
                    Note: If your measurements fall between sizes, we recommend selecting the larger size or opting for our custom tailoring option for a personalized fit.
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ maxHeight: '280px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: '6px', marginBottom: '14px' }}>
                    <table style={{ margin: 0 }}>
                      <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                        <tr>
                          <th>Age Group</th>
                          <th>Chest (in)</th>
                          <th>Waist (in)</th>
                          <th>Approx. Height</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td><strong>0-6M</strong></td><td>17" - 18"</td><td>18"</td><td>60 - 68 cm</td></tr>
                        <tr><td><strong>6-12M</strong></td><td>18" - 19"</td><td>19"</td><td>68 - 76 cm</td></tr>
                        <tr><td><strong>1-2Y</strong></td><td>20" - 21"</td><td>20"</td><td>80 - 88 cm</td></tr>
                        <tr><td><strong>2-3Y</strong></td><td>21" - 22"</td><td>20.5"</td><td>90 - 98 cm</td></tr>
                        <tr><td><strong>3-4Y</strong></td><td>22" - 23"</td><td>21"</td><td>98 - 104 cm</td></tr>
                        <tr><td><strong>4-5Y</strong></td><td>23" - 24"</td><td>21.5"</td><td>104 - 110 cm</td></tr>
                        <tr><td><strong>5-6Y</strong></td><td>24" - 25"</td><td>22"</td><td>110 - 116 cm</td></tr>
                        <tr><td><strong>6-7Y</strong></td><td>25" - 26"</td><td>22.5"</td><td>116 - 122 cm</td></tr>
                        <tr><td><strong>7-8Y</strong></td><td>26" - 27"</td><td>23"</td><td>122 - 128 cm</td></tr>
                        <tr><td><strong>8-9Y</strong></td><td>27" - 28"</td><td>24"</td><td>128 - 134 cm</td></tr>
                        <tr><td><strong>9-10Y</strong></td><td>28" - 29"</td><td>24.5"</td><td>134 - 140 cm</td></tr>
                        <tr><td><strong>10-12Y</strong></td><td>29" - 31"</td><td>25.5"</td><td>140 - 152 cm</td></tr>
                        <tr><td><strong>12-14Y</strong></td><td>31" - 33"</td><td>26.5"</td><td>152 - 162 cm</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="size-chart-footer-note">
                    👶 <strong>Tip for Parents:</strong> Kids grow fast! If your child is between age brackets or taller than average, we recommend choosing one size up for the most comfortable fit.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
