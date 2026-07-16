import React, { useState } from 'react';
import { 
  User, Phone, Mail, MapPin, Clock, Truck, 
  Ruler, Calendar, Search, Scissors, CheckCircle2, ChevronRight 
} from 'lucide-react';

export default function InfoPage({ tab, setTab, orders = [], boutiqueSettings = {} }) {
  // Order Tracking Lookup States
  const [searchOrderId, setSearchOrderId] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [searchError, setSearchError] = useState('');

  const menuItems = [
    { id: 'about-us', label: 'About Us' },
    { id: 'track-order', label: 'Track Couture Order' },
    { id: 'contact-care', label: 'Contact Care' },
    { id: 'fit-guide', label: 'Couture Fit Guide' },
    { id: 'shipping-delivery', label: 'Shipping & Delivery' },
    { id: 'returns-alterations', label: 'Returns & Alterations' },
    { id: 'privacy-policy', label: 'Privacy Policy' },
    { id: 'terms', label: 'Terms of Service' }
  ];

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    setSearchError('');
    setTrackedOrder(null);

    if (!searchOrderId || !searchPhone) {
      setSearchError('Please fill in both Order ID and Contact Phone.');
      return;
    }

    const orderIdClean = searchOrderId.trim().toUpperCase();
    const phoneClean = searchPhone.trim().replace(/\D/g, ''); // keep only numbers

    // Look up order in database list
    const found = orders.find(o => {
      const matchId = o.id.toUpperCase() === orderIdClean;
      const orderPhoneClean = o.shippingDetails.phone.replace(/\D/g, '');
      // Match last 10 digits of phone or exact match
      const matchPhone = orderPhoneClean.endsWith(phoneClean) || phoneClean.endsWith(orderPhoneClean);
      return matchId && matchPhone;
    });

    if (found) {
      setTrackedOrder(found);
    } else {
      setSearchError('No matching order found. Please verify your Order ID and phone number.');
    }
  };

  const getProgressPct = (status, custom) => {
    if (custom) {
      switch(status) {
        case 'Pending Stitching': return 15;
        case 'Pattern Drafting': return 35;
        case 'Stitching in Progress': return 55;
        case 'Quality Check': return 75;
        case 'Shipped': return 90;
        case 'Delivered': return 100;
        default: return 15;
      }
    } else {
      switch(status) {
        case 'Pending Shipment': return 25;
        case 'Quality Check': return 55;
        case 'Shipped': return 80;
        case 'Delivered': return 100;
        default: return 25;
      }
    }
  };

  return (
    <div className="info-page-layout-grid container animate-fadeIn">
      {/* Sidebar Navigation */}
      <aside className="info-sidebar-column">
        <h3 className="sidebar-brand-title">INIBYMAYA</h3>
        <p className="sidebar-brand-subtitle">Support Center</p>
        <ul className="sidebar-menu-list">
          {menuItems.map(item => (
            <li key={item.id}>
              <button 
                type="button"
                className={`sidebar-menu-btn ${tab === item.id ? 'active' : ''}`}
                onClick={() => {
                  setTab(item.id);
                  setSearchError('');
                  setTrackedOrder(null);
                }}
              >
                <span>{item.label}</span>
                <ChevronRight size={14} className="chevron" />
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content Area */}
      <section className="info-content-column">
        {/* About Us */}
        {tab === 'about-us' && (
          <div className="info-content-tab-block animate-slideUp">
            <h2>Our Legacy & Heritage</h2>
            <p className="tab-lead-paragraph">Crafting luxury silhouettes that speak of timeless artisan craftsmanship, organic handloom fibers, and coordinates of custom tailoring fits.</p>
            
            <div className="tab-image-banner-wrapper">
              <img 
                src="https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&q=80&w=800&h=400" 
                alt="Artisan Weavers Loom" 
                className="tab-banner-img"
              />
            </div>

            <div className="tab-text-rich">
              <h3>Weaving Traditions</h3>
              <p>InibyMaya was founded on the principles of preserving the rich textile heritage of India. Every outfit in our boutique catalog is hand-selected and crafted from heritage fabric clusters. We collaborate closely with local master weavers in Chanderi, Lucknow, and Varanasi to source pure linens, muslin silks, and raw velvets.</p>
              
              <div className="heritage-pillars-grid">
                <div className="heritage-pillar-card">
                  <Scissors size={20} className="icon" />
                  <h4>Bespoke Tailoring</h4>
                  <p>We reject standard sizing constraints. Our custom tailoring option allows customers to submit exact body sizes so our boutique master tailors can sew unique cuts that flatter your figure.</p>
                </div>
                <div className="heritage-pillar-card">
                  <CheckCircle2 size={20} className="icon" />
                  <h4>Artisan First</h4>
                  <p>By bypassing middle channels, we direct fair wages back to Chanderi looms and Chikankari artisans in Uttar Pradesh, sustaining their legacy craft loops for future generations.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Track Couture Order */}
        {tab === 'track-order' && (
          <div className="info-content-tab-block animate-slideUp">
            <h2>Track Your Couture Order</h2>
            <p className="tab-lead-paragraph">Monitor your custom tailoring progress and shipment tracking live from our boutique workshop.</p>

            <form onSubmit={handleTrackSubmit} className="order-tracker-lookup-form">
              <div className="form-row-double">
                <div className="form-group">
                  <label>Order ID *</label>
                  <input 
                    type="text" 
                    placeholder="e.g., ORD-123456" 
                    value={searchOrderId}
                    onChange={(e) => setSearchOrderId(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Recipient Phone Number *</label>
                  <input 
                    type="tel" 
                    placeholder="e.g., 9876543210" 
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="tracker-search-btn">
                <Search size={16} />
                <span>Search Order</span>
              </button>
            </form>

            {searchError && <p className="tracker-error-banner">{searchError}</p>}

            {/* Tracking Result readout */}
            {trackedOrder && (
              <div className="tracker-results-box animate-fadeIn">
                <div className="tracker-results-header">
                  <div>
                    <h4>Order {trackedOrder.id}</h4>
                    <span className="order-date-label">Placed on: {new Date(trackedOrder.timestamp).toLocaleDateString()}</span>
                  </div>
                  <span className={`status-pill status-${trackedOrder.status ? trackedOrder.status.toLowerCase().replace(/\s+/g, '-') : 'placed'}`}>
                    {trackedOrder.status}
                  </span>
                </div>

                {/* Progress bar animation */}
                {(() => {
                  const isCustomOrder = trackedOrder.items.some(i => i.wantsCustomStitching);
                  const pct = getProgressPct(trackedOrder.status, isCustomOrder);
                  return (
                    <div className="tracker-progress-wrapper">
                      <div className="progress-bar-rail">
                        <div className="progress-bar-fill" style={{ width: `${pct}%` }}></div>
                      </div>
                      <div className="progress-labels-row">
                        <span className={pct >= 15 ? 'active' : ''}>{isCustomOrder ? 'Drafting' : 'Placed'}</span>
                        <span className={pct >= 55 ? 'active' : ''}>{isCustomOrder ? 'Stitching' : 'Approved'}</span>
                        <span className={pct >= 90 ? 'active' : ''}>Shipped</span>
                        <span className={pct >= 100 ? 'active' : ''}>Delivered</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Delhivery tracking details */}
                {trackedOrder.trackingNumber && (
                  <div className="tracker-delivery-callout">
                    <Truck size={16} />
                    <span>Delhivery Airway Bill (AWB) ID: <strong>{trackedOrder.trackingNumber}</strong></span>
                  </div>
                )}

                {/* Special Instructions note */}
                {trackedOrder.notes && (
                  <div className="tracker-instruction-callout">
                    <strong>Special Instruction:</strong> "{trackedOrder.notes}"
                  </div>
                )}

                {/* Items preview list */}
                <div className="tracker-items-list">
                  <h5>Order Outfits:</h5>
                  {trackedOrder.items.map((item, index) => (
                    <div key={index} className="tracker-item-row">
                      <img src={item.product.images[0]} alt={item.product.title} />
                      <div className="tracker-item-info">
                        <h6>{item.product.title}</h6>
                        <span>Color: {item.color} | Size: {item.size} | Qty: {item.quantity}</span>
                        {item.wantsCustomStitching && (
                          <span className="tailoring-indicator">Bespoke Fit Active (+₹399)</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Contact Care */}
        {tab === 'contact-care' && (
          <div className="info-content-tab-block animate-slideUp">
            <h2>Boutique Support Concierge</h2>
            <p className="tab-lead-paragraph">We are here to assist with custom tailoring measurements, shipping priorities, and fabric coordinates.</p>

            <div className="contact-details-grid">
              <div className="contact-block-card">
                <Mail size={22} className="icon" />
                <h4>Email Care</h4>
                <p>For order queries, fitting changes, or feedback:</p>
                <a href={`mailto:${boutiqueSettings.email || 'care@inibymaya.com'}`} className="contact-link">
                  {boutiqueSettings.email || 'care@inibymaya.com'}
                </a>
              </div>
              
              <div className="contact-block-card">
                <Phone size={22} className="icon" />
                <h4>Call Boutique Hotline</h4>
                <p>Monday to Saturday, 10 AM to 7 PM IST:</p>
                <a href={`tel:${boutiqueSettings.phone || '+91 98765 43210'}`} className="contact-link">
                  {boutiqueSettings.phone || '+91 98765 43210'}
                </a>
              </div>

              <div className="contact-block-card">
                <MapPin size={22} className="icon" />
                <h4>Boutique Atelier Address</h4>
                <p>Visit us for fittings & swatch selections:</p>
                <span className="address-text">{boutiqueSettings.address || '14, Ground Floor, Linen Road, Jubilee Hills, Hyderabad - 500033'}</span>
              </div>

              <div className="contact-block-card">
                <Clock size={22} className="icon" />
                <h4>Operating Hours</h4>
                <p>Support team and tailor drafting operating times:</p>
                <span className="address-text">{boutiqueSettings.hours || 'Mon - Sat: 10:00 AM - 07:00 PM IST'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Couture Fit Guide */}
        {tab === 'fit-guide' && (
          <div className="info-content-tab-block animate-slideUp">
            <h2>Couture Fit Guide</h2>
            <p className="tab-lead-paragraph">Understand our sizing coordinates or take accurate body dimensions for customized tailoring.</p>

            <div className="fit-guide-container">
              <h3>Standard Sizing Matrix (Inches)</h3>
              <table className="fit-guide-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Bust</th>
                    <th>Waist</th>
                    <th>Hip</th>
                    <th>Shoulder</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>XS</td>
                    <td>32"</td>
                    <td>26"</td>
                    <td>36"</td>
                    <td>13.5"</td>
                  </tr>
                  <tr>
                    <td>S</td>
                    <td>34"</td>
                    <td>28"</td>
                    <td>38"</td>
                    <td>14"</td>
                  </tr>
                  <tr>
                    <td>M</td>
                    <td>36"</td>
                    <td>30"</td>
                    <td>40"</td>
                    <td>14.5"</td>
                  </tr>
                  <tr>
                    <td>L</td>
                    <td>38"</td>
                    <td>32"</td>
                    <td>42"</td>
                    <td>15"</td>
                  </tr>
                  <tr>
                    <td>XL</td>
                    <td>40"</td>
                    <td>34"</td>
                    <td>44"</td>
                    <td>15.5"</td>
                  </tr>
                  <tr>
                    <td>XXL</td>
                    <td>42"</td>
                    <td>36"</td>
                    <td>46"</td>
                    <td>16"</td>
                  </tr>
                </tbody>
              </table>

              <div className="fit-guide-instructions">
                <h3>How to Measure Yourself</h3>
                <ol>
                  <li>
                    <strong>Bust:</strong> Measure around the fullest part of your chest, keeping the tape straight across your back.
                  </li>
                  <li>
                    <strong>Waist:</strong> Wrap the tape measure around your natural waistline (usually right above your belly button).
                  </li>
                  <li>
                    <strong>Hips:</strong> Measure around the widest part of your hips (usually 7-8 inches below your waist).
                  </li>
                  <li>
                    <strong>Height:</strong> Stand straight against a wall without shoes to measure your full height.
                  </li>
                </ol>
                <div className="custom-stitching-tip-box">
                  <Ruler size={18} />
                  <p><strong>Note:</strong> Every customizable product has a <strong>"Custom Measurements Stitching"</strong> card in our boutique catalog. Toggling this lets you type these exact dimensions so our master tailors can craft the dress to fit your body curves perfectly.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shipping & Delivery */}
        {tab === 'shipping-delivery' && (
          <div className="info-content-tab-block animate-slideUp">
            <h2>Shipping & Delivery</h2>
            <div className="tab-legal-rich">
              <h3>Dispatch & Tailoring Timelines</h3>
              <p>Standard size orders are packed and dispatched from our Jubilee Hills workshop within 3 to 5 business days.</p>
              <p>Custom tailored orders (bespoke sizing cuts) require an additional 2 days for tailor pattern layout checks, lining attachment, and quality tests. Dispatch for custom creations occurs within 5 to 7 business days.</p>

              <h3>Pan-India Courier Network</h3>
              <p>We partner with premier domestic logistics aggregates (primarily Delhivery, BlueDart, and DTDC) to ship orders safely. All shipments are trackable. Airway Bill IDs are emailed to you once your courier package leaves the workshop.</p>

              <h3>Shipping Charges</h3>
              <ul>
                <li>Free shipping applies on all boutique orders above ₹1,500 across India.</li>
                <li>Flat shipping fee of ₹99 applies on all orders under ₹1,500.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Returns & Alterations */}
        {tab === 'returns-alterations' && (
          <div className="info-content-tab-block animate-slideUp">
            <h2>Returns & Alterations</h2>
            <div className="tab-legal-rich">
              <h3>7-Day Return Policy</h3>
              <p>For standard standard size outfits (XS, S, M, L, XL, XXL), we offer free exchanges or store credit returns within 7 days of package delivery. Outfits must be returned unworn, unwashed, and in their original packaging with tags attached.</p>

              <h3>Bespoke Stitching Return Terms</h3>
              <p>Bespoke custom-tailored garments are crafted specifically to your custom measurements and body size. Consequently, we cannot accept returns, refunds, or exchanges on customized orders. However, we offer **free alterations for life** to ensure you get your desired fit!</p>

              <h3>How to Request an Alteration</h3>
              <p>If your custom garment requires minor sizing modifications, please pack it and contact us at <strong>care@inibymaya.com</strong>. Our concierge will guide you through return labels, coordinate sizing adjustments with our tailors, and ship it back to you free of cost.</p>
            </div>
          </div>
        )}

        {/* Privacy Policy */}
        {tab === 'privacy-policy' && (
          <div className="info-content-tab-block animate-slideUp">
            <h2>Privacy Policy</h2>
            <div className="tab-legal-rich">
              <h3>1. Personal Information Collection</h3>
              <p>We collect personal information such as recipient names, emails, billing/shipping addresses, phone numbers, and sizing measurements to process boutique orders and tailor custom garments.</p>

              <h3>2. Data Safety & Supabase Integration</h3>
              <p>Customer registry records and tailoring notes are safely housed inside our private Supabase database. Sizing inputs are handled solely by our workshop supervisors and tailors to draft patterns. We never distribute your personal profile details or coordinates to external marketing networks.</p>

              <h3>3. Cookie Policy</h3>
              <p>Our website utilizes local storage cookies to remember items in your shopping bag, login sessions, and applied coupon deals, ensuring smooth navigation loops.</p>
            </div>
          </div>
        )}

        {/* Terms of Service */}
        {tab === 'terms' && (
          <div className="info-content-tab-block animate-slideUp">
            <h2>Terms of Service</h2>
            <div className="tab-legal-rich">
              <h3>1. General Boutique Conditions</h3>
              <p>By accessing InibyMaya Couture, placing orders, or submitting custom tailoring files, you agree to comply with our dispatch timelines, COD transactions handling terms, and alteration guidelines.</p>

              <h3>2. Tailoring Liability</h3>
              <p>Customers are responsible for ensuring that all body measurements submitted for custom tailoring options are accurate. Our tailors sew strictly to the coordinates provided. If incorrect measurements were submitted, we offer alterations at nominal fees.</p>

              <h3>3. Cash on Delivery (COD)</h3>
              <p>We provide Cash on Delivery (COD) as our primary secure payment method. The full invoice amount shown must be paid to the courier agent upon package receipt. Refusal to pay COD parcels may result in account termination.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
