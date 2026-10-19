import React, { useState } from 'react';
import { X, ShieldCheck, RefreshCw, CreditCard, Lock, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function CheckoutModal({ 
  cartItems, 
  priceSummary, 
  onClose, 
  onOrderSuccess, 
  user 
}) {
  const [name, setName] = useState(user?.name || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' (Razorpay) or 'cod'
  const [validationError, setValidationError] = useState('');
  const [razorpayError, setRazorpayError] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);

  // Dynamic calculations to guarantee 100% mathematical alignment with cartItems
  const computedSubtotal = cartItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
  const computedDiscount = priceSummary?.appliedDiscount || 0;
  const computedShipping = priceSummary?.shipping !== undefined ? priceSummary.shipping : 99;
  const computedFinalTotal = Math.max(0, computedSubtotal - computedDiscount + computedShipping);

  // Load Razorpay SDK dynamically if not already available on window
  const ensureRazorpayLoaded = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(true));
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleOnlineRazorpayPayment = async (orderId, hasCustom) => {
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

    // 1. If Razorpay Key is configured in environment, launch official Razorpay Checkout popup
    if (razorpayKey && razorpayKey.trim() !== '') {
      const isLoaded = await ensureRazorpayLoaded();
      if (!isLoaded || !window.Razorpay) {
        setIsPlacing(false);
        setRazorpayError('Unable to load Razorpay payment gateway. Please check your internet connection or choose Cash on Delivery.');
        return;
      }

      try {
        const options = {
          key: razorpayKey.trim(),
          amount: Math.round(computedFinalTotal * 100), // amount in paise (₹100 = 10000 paise)
          currency: 'INR',
          name: 'INI By Maya',
          description: `Order #${orderId} - Boutique Couture Apparel`,
          image: '/logo.png',
          prefill: {
            name: name.trim(),
            contact: phone.trim(),
            email: user?.email || 'care@inibymaya.com'
          },
          notes: {
            order_id: orderId,
            city: city.trim(),
            pincode: pincode.trim(),
            notes: priceSummary?.orderNote || ''
          },
          theme: {
            color: '#8b0000' // INI By Maya's signature boutique crimson
          },
          modal: {
            ondismiss: function () {
              setIsPlacing(false);
              setRazorpayError('Payment was cancelled. You can retry online payment or switch to Cash on Delivery.');
            }
          },
          handler: function (response) {
            // Payment success callback from Razorpay
            setIsPlacing(true);
            const payId = response.razorpay_payment_id || `pay_${Date.now()}`;
            const orderData = {
              id: orderId,
              items: cartItems,
              shippingDetails: { 
                name: name.trim(), 
                address: address.trim(), 
                city: city.trim(), 
                pincode: pincode.trim(), 
                phone: phone.trim(), 
                email: user?.email || 'care@inibymaya.com' 
              },
              subtotal: computedSubtotal,
              discount: computedDiscount,
              shipping: computedShipping,
              shippingFee: computedShipping,
              total: computedFinalTotal,
              paymentId: payId,
              paymentMethod: 'Razorpay',
              paymentStatus: 'Paid',
              timestamp: new Date().toISOString(),
              status: hasCustom ? 'Pending Stitching' : 'Order Placed & Paid',
              trackingNumber: '',
              notes: priceSummary?.orderNote || ''
            };
            onOrderSuccess(orderData);
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          setIsPlacing(false);
          setRazorpayError(`Payment failed: ${resp.error?.description || 'Transaction declined by bank.'}`);
        });
        rzp.open();
      } catch (err) {
        console.error('Razorpay initialization exception:', err);
        setIsPlacing(false);
        setRazorpayError(`Payment initialization failed: ${err.message || 'Please retry'}`);
      }
    } else {
      // 2. Demo / Simulation Mode: If Razorpay Key is not set in .env yet
      // Simulate Razorpay instant verification so UI/UX is fully testable immediately
      setTimeout(() => {
        const payId = `pay_demo_${Math.floor(100000000 + Math.random() * 900000000)}`;
        const orderData = {
          id: orderId,
          items: cartItems,
          shippingDetails: { 
            name: name.trim(), 
            address: address.trim(), 
            city: city.trim(), 
            pincode: pincode.trim(), 
            phone: phone.trim(), 
            email: user?.email || 'care@inibymaya.com' 
          },
          subtotal: computedSubtotal,
          discount: computedDiscount,
          shipping: computedShipping,
          shippingFee: computedShipping,
          total: computedFinalTotal,
          paymentId: payId,
          paymentMethod: 'Razorpay',
          paymentStatus: 'Paid (Test / Demo Mode)',
          timestamp: new Date().toISOString(),
          status: hasCustom ? 'Pending Stitching' : 'Order Placed & Paid',
          trackingNumber: '',
          notes: priceSummary?.orderNote || ''
        };
        onOrderSuccess(orderData);
      }, 1500);
    }
  };

  const handleConfirmOrder = (e) => {
    e.preventDefault();
    setRazorpayError('');
    
    // Blur active input to dismiss virtual keyboard & prevent mobile Safari auto-zoom
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }

    if (!name.trim() || !address.trim() || !city.trim() || !pincode.trim() || !phone.trim()) {
      setValidationError('Please fill in all shipping details.');
      return;
    }
    if (phone.trim().length < 10) {
      setValidationError('Please enter a valid 10-digit contact number.');
      return;
    }
    setValidationError('');
    setIsPlacing(true);

    const hasCustom = cartItems.some(item => item.wantsCustomStitching);
    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    if (paymentMethod === 'online') {
      handleOnlineRazorpayPayment(orderId, hasCustom);
    } else {
      // Cash on Delivery Order placement
      setTimeout(() => {
        const payId = `COD-${Math.floor(100000 + Math.random() * 900000)}`;
        const orderData = {
          id: orderId,
          items: cartItems,
          shippingDetails: { 
            name: name.trim(), 
            address: address.trim(), 
            city: city.trim(), 
            pincode: pincode.trim(), 
            phone: phone.trim(), 
            email: user?.email || 'care@inibymaya.com' 
          },
          subtotal: computedSubtotal,
          discount: computedDiscount,
          shipping: computedShipping,
          shippingFee: computedShipping,
          total: computedFinalTotal,
          paymentId: payId,
          paymentMethod: 'Cash on Delivery',
          paymentStatus: 'Pending (COD)',
          timestamp: new Date().toISOString(),
          status: hasCustom ? 'Pending Stitching' : 'Pending Shipment',
          trackingNumber: '',
          notes: priceSummary?.orderNote || ''
        };
        onOrderSuccess(orderData);
      }, 1500);
    }
  };

  const hasRazorpayKey = Boolean(import.meta.env.VITE_RAZORPAY_KEY_ID);

  return (
    <div className="overlay modal-overlay checkout-modal-overlay">
      <div className="checkout-modal-container">
        {/* Header */}
        <div className="checkout-header">
          <div className="brand-logo" style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="INI By Maya" className="brand-logo-img" style={{ height: '46px', width: 'auto' }} />
          </div>
          <button className="close-btn" onClick={onClose} disabled={isPlacing}>
            <X size={20} />
          </button>
        </div>

        <div className="checkout-main-grid">
          {/* Form Side */}
          <div className="checkout-form-column">
            <h3>Shipping Details</h3>
            <form onSubmit={handleConfirmOrder} className="checkout-shipping-form">
              <div className="form-group">
                <label>Recipient Name *</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. Shalini Roy"
                  required 
                  disabled={isPlacing}
                />
              </div>
              <div className="form-group">
                <label>Street Address *</label>
                <input 
                  type="text" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  placeholder="e.g. Flat 304, Green Heights Apartment" 
                  required 
                  disabled={isPlacing}
                />
              </div>
              <div className="form-row-double">
                <div className="form-group">
                  <label>City *</label>
                  <input 
                    type="text" 
                    value={city} 
                    onChange={(e) => setCity(e.target.value)} 
                    placeholder="e.g. Mumbai" 
                    required 
                    disabled={isPlacing}
                  />
                </div>
                <div className="form-group">
                  <label>Pincode *</label>
                  <input 
                    type="number" 
                    value={pincode} 
                    onChange={(e) => setPincode(e.target.value)} 
                    placeholder="e.g. 400001" 
                    required 
                    disabled={isPlacing}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Contact Number *</label>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="10-digit mobile number" 
                  required 
                  disabled={isPlacing}
                />
              </div>

              {/* Payment Method Selector */}
              <div className="checkout-payment-methods">
                <label className="section-label">Select Payment Method *</label>
                <div className="payment-options-grid">
                  {/* Online via Razorpay */}
                  <div 
                    className={`payment-option-card ${paymentMethod === 'online' ? 'selected' : ''}`}
                    onClick={() => { setPaymentMethod('online'); setRazorpayError(''); }}
                  >
                    <div className="payment-option-header">
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        checked={paymentMethod === 'online'} 
                        onChange={() => { setPaymentMethod('online'); setRazorpayError(''); }} 
                        disabled={isPlacing}
                      />
                      <div className="payment-option-content">
                        <div className="payment-option-title-row">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <CreditCard size={16} style={{ color: '#8b0000' }} />
                            <strong>Pay Online via Razorpay</strong>
                          </div>
                          <span className="payment-recommended-pill">⚡ Recommended</span>
                        </div>
                        <p className="payment-option-desc">
                          UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, NetBanking, Wallets
                        </p>
                      </div>
                    </div>
                    <div className="payment-option-badges">
                      <span className="razorpay-badge-pill">
                        <Lock size={11} /> 100% RBI Compliant & Secure
                      </span>
                    </div>
                  </div>

                  {/* Cash on Delivery */}
                  <div 
                    className={`payment-option-card ${paymentMethod === 'cod' ? 'selected' : ''}`}
                    onClick={() => { setPaymentMethod('cod'); setRazorpayError(''); }}
                  >
                    <div className="payment-option-header">
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        checked={paymentMethod === 'cod'} 
                        onChange={() => { setPaymentMethod('cod'); setRazorpayError(''); }} 
                        disabled={isPlacing}
                      />
                      <div className="payment-option-content">
                        <div className="payment-option-title-row">
                          <strong>Cash on Delivery (COD)</strong>
                        </div>
                        <p className="payment-option-desc">
                          Pay cash or UPI to the courier agent upon doorstep delivery
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notice if Razorpay Key is in demo mode */}
              {paymentMethod === 'online' && !hasRazorpayKey && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 12px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '6px', fontSize: '11.5px', color: '#0369a1', lineHeight: '1.4' }}>
                  <Info size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
                  <span>
                    <strong>Razorpay Preview Active:</strong> Add your <code>VITE_RAZORPAY_KEY_ID</code> to <code>.env</code> to connect your live/test Razorpay merchant account.
                  </span>
                </div>
              )}

              {/* Error messages */}
              {validationError && <p className="error-text-summary">{validationError}</p>}
              {razorpayError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontSize: '12.5px', fontWeight: 500 }}>
                  <AlertCircle size={15} />
                  <span>{razorpayError}</span>
                </div>
              )}

              <button 
                type="submit" 
                className={`pay-now-btn-trigger ${paymentMethod === 'cod' ? 'btn-cod' : ''}`} 
                disabled={isPlacing}
              >
                {isPlacing ? (
                  <div className="loading-spinner-row">
                    <RefreshCw size={16} className="spinner" />
                    <span>{paymentMethod === 'online' ? 'Opening Razorpay Gateway...' : 'Placing Order...'}</span>
                  </div>
                ) : (
                  <>
                    {paymentMethod === 'online' ? (
                      <>
                        <Lock size={16} />
                        <span>Pay ₹{computedFinalTotal.toLocaleString('en-IN')} via Razorpay</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={18} />
                        <span>Confirm Cash on Delivery Order</span>
                      </>
                    )}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Receipt Side */}
          <div className="checkout-receipt-column">
            <h3>Order Summary</h3>
            <div className="receipt-items-scroller">
              {cartItems.map((item, idx) => (
                <div key={idx} className="receipt-item-line">
                  <img src={item.product.images[0]} alt={item.product.title} />
                  <div className="receipt-item-details">
                    <h5>{item.product.title}</h5>
                    <span>Qty: {item.quantity} | Size: {item.size}</span>
                    {item.wantsCustomStitching && <span className="tailored-indicator">Custom Fitted</span>}
                  </div>
                  <span className="receipt-item-cost">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            {(() => {
              const customTailoringTotal = (cartItems || []).reduce((acc, item) => {
                const fee = item.tailoringFee || item.styleCustomization?.tailoringCost || 0;
                return acc + (fee * item.quantity);
              }, 0);

              const itemsOnlySubtotal = computedSubtotal - customTailoringTotal;

              return (
                <div className="receipt-calculations">
                  <div className="receipt-row">
                    <span>Items Subtotal</span>
                    <span>₹{itemsOnlySubtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {customTailoringTotal > 0 && (
                    <div className="receipt-row" style={{ color: '#8b0000', fontWeight: '600' }}>
                      <span>Custom Tailoring Add-on</span>
                      <span>+ ₹{customTailoringTotal.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {computedDiscount > 0 && (
                    <div className="receipt-row discount">
                      <span>Coupons Discount</span>
                      <span>- ₹{computedDiscount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="receipt-row">
                    <span>{paymentMethod === 'online' ? 'Standard Shipping' : 'Cash on Delivery Shipping'}</span>
                    <span>{computedShipping === 0 ? 'FREE' : `₹${computedShipping}`}</span>
                  </div>
                  <hr />
                  <div className="receipt-row grand-total-row red-totals">
                    <span className="total-label-red">
                      Grand Total {paymentMethod === 'online' ? '(Online Prepaid)' : '(COD)'}
                    </span>
                    <span className="total-amount-red">₹{computedFinalTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="cod-notice-footer">
                    {paymentMethod === 'online' ? (
                      <span style={{ color: '#15803d', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={13} /> Instant confirmation with Razorpay receipt & tracking
                      </span>
                    ) : (
                      <span>ℹ️ Pay cash/UPI to courier at the time of delivery.</span>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
