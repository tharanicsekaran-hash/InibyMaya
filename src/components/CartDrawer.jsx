import React, { useState, useEffect } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Pencil } from 'lucide-react';

export default function CartDrawer({ 
  cartItems, 
  onClose, 
  onUpdateQty, 
  onRemoveItem, 
  onCheckoutClick,
  promosList = [],
  autoAppliedCode = ''
}) {
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0); // in Rupees
  const [promoSuccessMsg, setPromoSuccessMsg] = useState('');
  const [promoErrorMsg, setPromoErrorMsg] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

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

  const applyPromo = () => {
    setPromoErrorMsg('');
    setPromoSuccessMsg('');
    
    const code = promoCode.trim().toUpperCase();
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
        setPromoSuccessMsg(`Promo applied: ${matchedPromo.description || `₹${discount} off!`}`);
      } else {
        setPromoErrorMsg(`${code} requires a minimum purchase of ₹${matchedPromo.minPurchase.toLocaleString('en-IN')}`);
      }
    } else {
      setPromoErrorMsg('Invalid promotion code');
    }
  };

  const shipping = subtotal > 1500 || subtotal === 0 ? 0 : 99;
  const finalTotal = Math.max(0, subtotal - appliedDiscount + shipping);

  return (
    <div className="overlay cart-drawer-overlay" onClick={onClose}>
      <div className="cart-drawer animate-slideInRight" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title-row">
            <ShoppingBag size={20} />
            <h3>Your Shopping Cart ({cartItems.length})</h3>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close cart drawer">
            <X size={24} />
          </button>
        </div>

        {/* Free Shipping Progress */}
        {subtotal > 0 && (
          <div className="shipping-progress-banner">
            {subtotal >= 1500 ? (
              <span className="success-text">🎉 You qualify for <strong>FREE shipping</strong>!</span>
            ) : (
              <span>Add <strong>₹{(1500 - subtotal).toLocaleString('en-IN')}</strong> more for <strong>FREE shipping</strong>!</span>
            )}
            <div className="progress-bar-track">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${Math.min(100, (subtotal / 1500) * 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Drawer Body */}
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
                    <h4 className="cart-item-title">{item.product.title}</h4>
                    <p className="cart-item-meta">Color: {item.color} | Size: {item.size}</p>
                    
                    {/* Measurements summary if custom tailored */}
                    {item.wantsCustomStitching && item.measurements && (
                      <div className="cart-item-measurements-readout">
                        <span>Bust: {item.measurements.bust}"</span>
                        <span>Waist: {item.measurements.waist}"</span>
                        <span>Hips: {item.measurements.hips}"</span>
                        <span>Height: {item.measurements.height}</span>
                        {item.measurements.notes && <p className="notes-para">Note: {item.measurements.notes}</p>}
                      </div>
                    )}

                    <div className="cart-item-actions-row">
                      <div className="qty-counter">
                        <button onClick={() => onUpdateQty(idx, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => onUpdateQty(idx, item.quantity + 1)}>+</button>
                      </div>
                      <span className="cart-item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                      <button 
                        className="remove-item-btn" 
                        onClick={() => onRemoveItem(idx)}
                        title="Remove product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-cart-state">
              <ShoppingBag size={48} className="empty-icon" />
              <h3>Your cart is empty</h3>
              <p>Add handcrafted garments to begin tailoring your wardrobe.</p>
              <button className="btn-primary" onClick={onClose}>Continue Shopping</button>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {cartItems.length > 0 && (
          <div className="drawer-footer">
            {/* Promo Code Box */}
            <div className="promo-code-container">
              <div className="promo-input-row">
                <Tag size={16} />
                <input 
                  type="text" 
                  placeholder="Enter promo code (e.g. WELCOME10)" 
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <button onClick={applyPromo}>Apply</button>
              </div>
              {promoSuccessMsg && <p className="promo-success-msg">{promoSuccessMsg}</p>}
              {promoErrorMsg && <p className="promo-error-msg">{promoErrorMsg}</p>}
              
              {promosList.length > 0 && (
                <div className="active-promos-hints">
                  <span>Click to Apply:</span>
                  <div className="promo-hints-row">
                    {promosList.map(p => (
                      <button 
                        key={p.code}
                        type="button"
                        className="promo-hint-tag"
                        onClick={() => {
                          setPromoCode(p.code);
                          setTimeout(() => {
                            const matchedPromo = promosList.find(pr => pr.code === p.code);
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
                              } else {
                                setPromoErrorMsg(`${p.code} requires a minimum purchase of ₹${matchedPromo.minPurchase.toLocaleString('en-IN')}`);
                                setPromoSuccessMsg('');
                              }
                            }
                          }, 50);
                        }}
                      >
                        {p.code}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Order Note Collapsible Row */}
            <div className="cart-order-note-container">
              <button 
                type="button"
                className="cart-note-toggle-btn"
                onClick={() => setShowNoteInput(!showNoteInput)}
              >
                <Pencil size={14} />
                <span>{orderNote ? 'EDIT SPECIAL INSTRUCTION' : 'SPECIAL INSTRUCTION'}</span>
              </button>
              {showNoteInput && (
                <div className="cart-note-input-wrapper animate-slideDown">
                  <textarea
                    rows="2"
                    placeholder="e.g., Please deliver after 5 PM or shorten sleeves by 1 inch..."
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Calculations */}
            <div className="calc-table">
              <div className="calc-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="calc-row discount-row">
                  <span>Discount</span>
                  <span>- ₹{appliedDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="calc-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
              </div>
              <hr />
              <div className="calc-row total-row red-totals">
                <span className="total-label-red">Total</span>
                <span className="total-amount-red">₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Checkout Call-to-action */}
            <button 
              className="checkout-btn-large" 
              onClick={() => onCheckoutClick({ subtotal, appliedDiscount, shipping, finalTotal, orderNote })}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
