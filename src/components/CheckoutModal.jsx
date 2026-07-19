import React, { useState } from 'react';
import { X, ShieldCheck, RefreshCw } from 'lucide-react';

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
  const [isPlacing, setIsPlacing] = useState(false);

  const handleConfirmOrder = (e) => {
    e.preventDefault();
    if (!name || !address || !city || !pincode || !phone) {
      setValidationError('Please fill in all shipping details.');
      return;
    }
    if (phone.trim().length < 10) {
      setValidationError('Please enter a valid 10-digit contact number.');
      return;
    }
    setValidationError('');
    setIsPlacing(true);

    // Simulate luxury order verification processing
    setTimeout(() => {
      const hasCustom = cartItems.some(item => item.wantsCustomStitching);
      const payId = `COD-${Math.floor(100000 + Math.random() * 900000)}`;
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
        trackingNumber: '',
        notes: priceSummary.orderNote || ''
      };
      onOrderSuccess(orderData);
    }, 1500);
  };

  return (
    <div className="overlay modal-overlay">
      <div className="checkout-modal-container">
        {/* Header */}
        <div className="checkout-header">
          <div className="brand-logo">INIBYMAYA</div>
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

              {validationError && <p className="error-text-summary">{validationError}</p>}

              <button type="submit" className="pay-now-btn-trigger" disabled={isPlacing}>
                {isPlacing ? (
                  <div className="loading-spinner-row">
                    <RefreshCw size={16} className="spinner" />
                    <span>Placing Order...</span>
                  </div>
                ) : (
                  <>
                    <span>Confirm Order</span>
                    <ShieldCheck size={18} />
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
                <span>Cash on Delivery Shipping</span>
                <span>{priceSummary.shipping === 0 ? 'FREE' : `₹${priceSummary.shipping}`}</span>
              </div>
              <hr />
              <div className="receipt-row grand-total-row red-totals">
                <span className="total-label-red">Grand Total (COD)</span>
                <span className="total-amount-red">₹{priceSummary.finalTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="cod-notice-footer">
                <span>ℹ️ Pay cash/UPI to courier at the time of delivery.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
