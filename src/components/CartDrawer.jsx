import React, { useState, useEffect } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Pencil } from 'lucide-react';

export default function CartDrawer({ 
  cartItems, 
  onClose, 
  onUpdateQty, 
  onRemoveItem, 
  onCheckoutClick,
  promosList = [],
  autoAppliedCode = '',
  boutiqueSettings = {}
}) {
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0); // in Rupees
  const [promoSuccessMsg, setPromoSuccessMsg] = useState('');
  const [promoErrorMsg, setPromoErrorMsg] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);

  // Subtotal before discounts
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // Auto-apply landing promo code
  useEffect(() => {
    if (autoAppliedCode && subtotal > 0) {
      setPromoCode(autoAppliedCode);
      const matchedPromo = promosList.find(p => p.code === autoAppliedCode.trim().toUpperCase());
      if (matchedPromo) {
        if (subtotal >= matchedPromo.minPurchase) {
          let discount = 0;
          if (matchedPromo.type === 'percent') {
            discount = Math.round(subtotal * (matchedPromo.value / 100));
          } else {
            discount = matchedPromo.value;
          }
          setAppliedDiscount(discount);
          setPromoSuccessMsg(`Promo applied: ${matchedPromo.description || `₹${discount} off!`}`);
          setPromoErrorMsg('');
        }
      }
    }
  }, [autoAppliedCode, subtotal, promosList]);

  const applyPromo = (codeToApply) => {
    setPromoErrorMsg('');
    setPromoSuccessMsg('');
    
    const code = (codeToApply || promoCode).trim().toUpperCase();
    if (!code) return;

    const matchedPromo = promosList.find(p => p.code === code);

    if (matchedPromo) {
      if (subtotal >= matchedPromo.minPurchase) {
        let discount = 0;
        if (matchedPromo.type === 'percent') {
          discount = Math.round(subtotal * (matchedPromo.value / 100));
        } else {
          discount = matchedPromo.value;
        }
        setAppliedDiscount(discount);
        setPromoCode(code);
        setPromoSuccessMsg(`Promo applied: ${matchedPromo.description || `₹${discount} off!`}`);
        setShowPromoInput(false);
      } else {
        setPromoErrorMsg(`${code} requires minimum purchase of ₹${matchedPromo.minPurchase.toLocaleString('en-IN')}`);
      }
    } else {
      setPromoErrorMsg('Invalid promotion code');
    }
  };

  const standardShippingPrice = boutiqueSettings?.standardShippingPrice !== undefined ? Number(boutiqueSettings.standardShippingPrice) : 99;
  const freeShippingThreshold = boutiqueSettings?.freeShippingThreshold !== undefined ? Number(boutiqueSettings.freeShippingThreshold) : 1500;

  const isFreeShipping = (freeShippingThreshold > 0 && subtotal >= freeShippingThreshold) || subtotal === 0 || standardShippingPrice === 0;
  const shipping = isFreeShipping ? 0 : standardShippingPrice;
  const finalTotal = Math.max(0, subtotal - appliedDiscount + shipping);

  return (
    <div className="overlay cart-drawer-overlay" onClick={onClose}>
      <div className="cart-drawer animate-slideInRight" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title-row">
            <ShoppingBag size={18} />
            <h3>Your Shopping Cart ({cartItems.length})</h3>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close cart drawer">
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Progress */}
        {subtotal > 0 && freeShippingThreshold > 0 && standardShippingPrice > 0 && (
          <div className="shipping-progress-banner">
            {subtotal >= freeShippingThreshold ? (
              <span className="success-text">🎉 You qualify for <strong>FREE shipping</strong>!</span>
            ) : (
              <span>Add <strong>₹{(freeShippingThreshold - subtotal).toLocaleString('en-IN')}</strong> more for <strong>FREE shipping</strong>!</span>
            )}
            <div className="progress-bar-track">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
              ></div>
            </div>
          </div>
        )}
        {subtotal > 0 && standardShippingPrice === 0 && (
          <div className="shipping-progress-banner">
            <span className="success-text">🎉 You qualify for <strong>FREE shipping</strong> on all orders!</span>
          </div>
        )}

        {/* Drawer Body: Optimized Compact Cards so multiple products are visible at once */}
        <div className="drawer-body">
          {cartItems.length > 0 ? (
            <div className="cart-items-list">
              {cartItems.map((item, idx) => (
                <div key={idx} className="cart-item-card">
                  <img 
                    src={item.product.images[0]} 
                    alt={item.product.title} 
                    className="cart-item-img" 
                  />
                  <div className="cart-item-info">
                    <div className="cart-item-header-row">
                      <h4 className="cart-item-title" title={item.product.title}>{item.product.title}</h4>
                      <button 
                        className="remove-item-btn" 
                        onClick={() => onRemoveItem(idx)}
                        title="Remove product"
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <p className="cart-item-meta">Color: {item.color} | Size: {item.size}</p>
                    
                    {/* Measurements summary if custom tailored */}
                    {item.wantsCustomStitching && item.measurements && (
                      <div className="cart-item-measurements-readout">
                        <span>B: {item.measurements.bust}"</span>
                        <span>W: {item.measurements.waist}"</span>
                        <span>H: {item.measurements.hips}"</span>
                        <span>Ht: {item.measurements.height}</span>
                        {item.measurements.notes && <p className="notes-para">Note: {item.measurements.notes}</p>}
                      </div>
                    )}

                    {(item.tailoringFee > 0 || item.styleCustomization?.tailoringCost > 0) && (
                      <p className="cart-item-tailoring-badge">
                        ✨ Bespoke (+₹{(item.tailoringFee || item.styleCustomization?.tailoringCost || 0)})
                      </p>
                    )}

                    <div className="cart-item-actions-row">
                      <div className="qty-counter">
                        <button onClick={() => onUpdateQty(idx, item.quantity - 1)} aria-label="Decrease quantity">-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => onUpdateQty(idx, item.quantity + 1)} aria-label="Increase quantity">+</button>
                      </div>
                      <p className="cart-item-price-tag">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-cart-state">
              <ShoppingBag size={44} className="empty-icon" />
              <h3>Your cart is empty</h3>
              <p>Add handcrafted garments to begin tailoring your wardrobe.</p>
              <button className="btn-primary" onClick={onClose}>Continue Shopping</button>
            </div>
          )}
        </div>

        {/* Drawer Footer: Space-saving streamlined footer */}
        {cartItems.length > 0 && (
          <div className="drawer-footer">
            {/* Promo Code & Order Note Bar */}
            {appliedDiscount > 0 ? (
              <div className="cart-applied-promo-bar animate-fadeIn">
                <div className="applied-promo-info">
                  <Tag size={12} />
                  <span>Promo <strong>{promoCode}</strong> applied (-₹{appliedDiscount.toLocaleString('en-IN')})</span>
                </div>
                <button 
                  type="button" 
                  className="remove-promo-btn"
                  onClick={() => {
                    setAppliedDiscount(0);
                    setPromoCode('');
                    setPromoSuccessMsg('');
                    setPromoErrorMsg('');
                  }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="cart-footer-tools-row">
                <button 
                  type="button" 
                  className="cart-tool-link-btn"
                  onClick={() => setShowPromoInput(!showPromoInput)}
                >
                  <Tag size={12} />
                  <span>{showPromoInput ? 'Hide Coupon' : 'Have a Promo Code?'}</span>
                </button>
                <button 
                  type="button" 
                  className="cart-tool-link-btn"
                  onClick={() => setShowNoteInput(!showNoteInput)}
                >
                  <Pencil size={12} />
                  <span>{orderNote ? 'Edit Order Note' : '+ Special Instruction'}</span>
                </button>
              </div>
            )}

            {/* Expandable Promo Input */}
            {showPromoInput && !appliedDiscount && (
              <div className="promo-code-container animate-slideDown">
                <div className="promo-input-row compact">
                  <Tag size={14} />
                  <input 
                    type="text" 
                    placeholder="Enter promo code" 
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <button onClick={() => applyPromo()}>Apply</button>
                </div>
                {promoSuccessMsg && <p className="promo-success-msg">{promoSuccessMsg}</p>}
                {promoErrorMsg && <p className="promo-error-msg">{promoErrorMsg}</p>}
                
                {promosList.length > 0 && (
                  <div className="active-promos-hints compact">
                    <span>Available:</span>
                    <div className="promo-hints-row">
                      {promosList.map(p => (
                        <button 
                          key={p.code}
                          type="button"
                          className="promo-hint-tag"
                          onClick={() => applyPromo(p.code)}
                        >
                          {p.code}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Expandable Special Instruction */}
            {showNoteInput && (
              <div className="cart-note-input-wrapper compact animate-slideDown">
                <textarea
                  rows="2"
                  placeholder="Special instructions or tailoring preferences..."
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                />
              </div>
            )}

            {/* Calculations Table */}
            {(() => {
              const customizationFeeTotal = cartItems.reduce((acc, item) => {
                const fee = item.tailoringFee || item.styleCustomization?.tailoringCost || 0;
                return acc + (fee * item.quantity);
              }, 0);

              const itemsOnlySubtotal = subtotal - customizationFeeTotal;

              return (
                <div className="calc-table compact">
                  <div className="calc-row">
                    <span>Items Subtotal</span>
                    <span>₹{itemsOnlySubtotal.toLocaleString('en-IN')}</span>
                  </div>

                  {customizationFeeTotal > 0 && (
                    <div className="calc-row" style={{ color: '#8b0000', fontWeight: '600' }}>
                      <span>Custom Tailoring Add-on</span>
                      <span>+ ₹{customizationFeeTotal.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {appliedDiscount > 0 && (
                    <div className="calc-row discount-row">
                      <span>Discount ({promoCode})</span>
                      <span>- ₹{appliedDiscount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="calc-row">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                  </div>
                  <hr style={{ margin: '6px 0', borderColor: 'var(--color-border)' }} />
                  <div className="calc-row total-row red-totals">
                    <span className="total-label-red">Total</span>
                    <span className="total-amount-red">₹{finalTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              );
            })()}

            {/* Checkout Call-to-action */}
            <button 
              className="checkout-btn-large compact" 
              onClick={() => onCheckoutClick({ subtotal, appliedDiscount, shipping, finalTotal, orderNote })}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
