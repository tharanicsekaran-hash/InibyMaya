import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, CreditCard, Sparkles } from 'lucide-react';

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
  const [validationError, setValidationError] = useState('');
  
  // Razorpay simulator states
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [activePaymentTab, setActivePaymentTab] = useState('card');
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, success, failed
  const [simulatedPaymentId, setSimulatedPaymentId] = useState('');

  const handleProceedToRazorpay = (e) => {
    e.preventDefault();
    if (!name || !address || !city || !pincode || !phone) {
      setValidationError('Please fill in all shipping details.');
      return;
    }
    setValidationError('');
    setShowRazorpay(true);
  };

  const handleSimulatePayment = (status) => {
    if (status === 'success') {
      const payId = `pay_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
      setSimulatedPaymentId(payId);
      setPaymentStatus('success');
      
      // Delay closing/processing to show success screen
      setTimeout(() => {
        const hasCustom = cartItems.some(item => item.wantsCustomStitching);
        const orderData = {
          id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
          items: cartItems,
          shippingDetails: { name, address, city, pincode, phone },
          subtotal: priceSummary.subtotal,
          discount: priceSummary.appliedDiscount,
          shipping: priceSummary.shipping,
          total: priceSummary.finalTotal,
          paymentId: payId,
          timestamp: new Date().toISOString(),
          status: hasCustom ? 'Pending Stitching' : 'Pending Shipment',
          trackingNumber: ''
        };
        onOrderSuccess(orderData);
      }, 1500);
    } else {
      setPaymentStatus('failed');
      setTimeout(() => {
        setPaymentStatus('pending');
        setShowRazorpay(false);
      }, 2000);
    }
  };

  return (
    <div className="overlay modal-overlay">
      <div className="checkout-modal-container">
        {/* Header */}
        <div className="checkout-header">
          <div className="brand-logo">INIBYMAYA</div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="checkout-main-grid">
          {/* Form Side */}
          <div className="checkout-form-column">
            <h3>Shipping Details</h3>
            <form onSubmit={handleProceedToRazorpay} className="checkout-shipping-form">
              <div className="form-group">
                <label>Recipient Name *</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. Shalini Roy"
                  required 
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
                />
              </div>

              {validationError && <p className="error-text-summary">{validationError}</p>}

              <button type="submit" className="pay-now-btn-trigger">
                <span>Select Payment Mode</span>
                <ShieldCheck size={18} />
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

            <div className="receipt-calculations">
              <div className="receipt-row">
                <span>Subtotal</span>
                <span>₹{priceSummary.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {priceSummary.appliedDiscount > 0 && (
                <div className="receipt-row discount">
                  <span>Coupons Discount</span>
                  <span>- ₹{priceSummary.appliedDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="receipt-row">
                <span>Standard Delivery</span>
                <span>{priceSummary.shipping === 0 ? 'FREE' : `₹${priceSummary.shipping}`}</span>
              </div>
              <hr />
              <div className="receipt-row grand-total-row">
                <span>Grand Total</span>
                <span>₹{priceSummary.finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Simulation Overlay Portal */}
      {showRazorpay && (
        <div className="razorpay-simulation-portal">
          <div className="razorpay-modal">
            {/* Header */}
            <div className="razorpay-header">
              <div className="merchant-branding">
                <span className="razorpay-badge-mock">Razorpay</span>
                <h4>InibyMaya Couture</h4>
              </div>
              <div className="checkout-amount-display">
                <span>Paying:</span>
                <h2>₹{priceSummary.finalTotal.toLocaleString('en-IN')}</h2>
              </div>
            </div>

            {/* Inner Content */}
            {paymentStatus === 'pending' ? (
              <div className="razorpay-methods-container">
                {/* Method Sidebar */}
                <div className="payment-tabs-sidebar">
                  <button 
                    className={activePaymentTab === 'card' ? 'active' : ''}
                    onClick={() => setActivePaymentTab('card')}
                  >
                    <CreditCard size={14} />
                    <span>Cards (Visa/Master)</span>
                  </button>
                  <button 
                    className={activePaymentTab === 'upi' ? 'active' : ''}
                    onClick={() => setActivePaymentTab('upi')}
                  >
                    <Sparkles size={14} />
                    <span>UPI / QR</span>
                  </button>
                </div>

                {/* Methods Panel */}
                <div className="payment-tab-content-panel">
                  {activePaymentTab === 'card' ? (
                    <div className="razorpay-card-form animate-fadeIn">
                      <div className="r-group">
                        <label>Card Number</label>
                        <input 
                          type="text" 
                          placeholder="4312 8843 9081 2235" 
                          value={cardNumber} 
                          onChange={(e) => setCardNumber(e.target.value)} 
                        />
                      </div>
                      <div className="r-row">
                        <div className="r-group">
                          <label>Expiry Date</label>
                          <input 
                            type="text" 
                            placeholder="MM/YY" 
                            value={cardExpiry} 
                            onChange={(e) => setCardExpiry(e.target.value)} 
                          />
                        </div>
                        <div className="r-group">
                          <label>CVV</label>
                          <input 
                            type="password" 
                            placeholder="•••" 
                            value={cardCvv} 
                            onChange={(e) => setCardCvv(e.target.value)} 
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="razorpay-upi-panel animate-fadeIn">
                      <div className="qr-box-placeholder">
                        <div className="mock-qr">QR CODE</div>
                        <span>Scan with GPay / PhonePe / BHIM</span>
                      </div>
                      <div className="r-group">
                        <label>UPI ID (VPA)</label>
                        <input type="text" placeholder="name@upi" />
                      </div>
                    </div>
                  )}

                  {/* Sandbox Operations */}
                  <div className="sandbox-actions-box">
                    <p>Sandbox Simulator Mode:</p>
                    <div className="sim-btns">
                      <button className="sim-btn-success" onClick={() => handleSimulatePayment('success')}>
                        Approve Payment
                      </button>
                      <button className="sim-btn-fail" onClick={() => handleSimulatePayment('fail')}>
                        Decline/Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : paymentStatus === 'success' ? (
              <div className="razorpay-result-screen success animate-fadeIn">
                <CheckCircle2 size={48} className="result-icon success-spin" />
                <h3>Payment Successful</h3>
                <p>Transaction ID: {simulatedPaymentId}</p>
                <span>Completing order stitching details...</span>
              </div>
            ) : (
              <div className="razorpay-result-screen failed animate-fadeIn">
                <AlertTriangle size={48} className="result-icon fail-shake" />
                <h3>Payment Declined</h3>
                <p>The transaction was declined by the bank simulator.</p>
                <span>Returning to checkout...</span>
              </div>
            )}

            {/* Footer */}
            <div className="razorpay-footer">
              <span className="secure-badge">🔒 256-bit Secure Sandbox Payment System</span>
              <button className="cancel-trans-btn" onClick={() => setShowRazorpay(false)}>Cancel Transaction</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
