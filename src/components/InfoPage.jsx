import React, { useState } from 'react';
import { 
  User, Phone, Mail, MapPin, Clock, Truck, 
  Ruler, Calendar, Search, Scissors, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { renderRichTextHtml } from '../utils/textParser';

export default function InfoPage({ tab, setTab, orders = [], boutiqueSettings = {} }) {
  // Order Tracking Lookup States
  const [searchOrderId, setSearchOrderId] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const menuItems = [
    { id: 'about-us', label: 'About Us' },
    { id: 'faq', label: 'FAQ' },
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
      }
    }
  };

  // Parse custom configured footer pages from Admin Console
  const customPagesMap = (() => {
    try {
      if (boutiqueSettings?.footerPages) {
        return JSON.parse(boutiqueSettings.footerPages);
      }
    } catch (e) {}
    return {};
  })();

  const activeCustomPage = customPagesMap[tab];

  return (
    <div className="info-page-layout-grid container animate-fadeIn">
      {/* Mobile-Only Horizontal Scrollable Touch Pill Strip */}
      <div className="info-mobile-nav-wrapper">
        <div className="info-mobile-pill-strip">
          {menuItems.map(item => (
            <button
              key={item.id}
              type="button"
              className={`mobile-pill-btn ${tab === item.id ? 'active' : ''}`}
              onClick={() => {
                setTab(item.id);
                setSearchError('');
                setTrackedOrder(null);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Sidebar Navigation */}
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
        {/* Dynamic Context Editable Footer Page Content */}
        {activeCustomPage ? (
          <div className="info-content-tab-block animate-slideUp">
            <h2>{activeCustomPage.title}</h2>
            {activeCustomPage.subtitle && (
              <p className="tab-lead-paragraph" style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>
                {activeCustomPage.subtitle}
              </p>
            )}

            {/* Track Couture Order Live Form */}
            {tab === 'track-order' && (
              <div style={{ marginBottom: '28px' }}>
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
                  <div className="tracker-results-box animate-fadeIn" style={{ marginTop: '20px' }}>
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
                          <img src={item.product?.images?.[0] || item.images?.[0] || '/logo.png'} alt={item.product?.title || item.title} />
                          <div className="tracker-item-info">
                            <h6>{item.product?.title || item.title}</h6>
                            <span>Color: {item.color || item.selectedColor || 'Default'} | Size: {item.size || item.selectedSize} | Qty: {item.quantity || 1}</span>
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

            <div className="tab-legal-rich">
              {tab === 'about-us' && activeCustomPage.aboutImages && activeCustomPage.aboutImages.filter(Boolean).length > 0 && (
                <div className="about-us-gallery-section" style={{ marginTop: '8px', marginBottom: '28px' }}>
                  <div className="about-gallery-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '16px'
                  }}>
                    {activeCustomPage.aboutImages.filter(Boolean).map((imgUrl, i) => (
                      <div key={i} className="about-gallery-card" style={{ borderRadius: '12px', overflow: 'hidden', height: '280px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)' }}>
                        <img src={imgUrl} alt={`About Us Atelier Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === 'faq' ? (
                <div className="faq-page-container">
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#8b0000', marginBottom: '8px' }}>
                      💡 Frequently Asked Questions
                    </h4>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                      Click on any question below to expand details regarding custom fitting, orders, cash on delivery, shipping, and exchanges.
                    </p>
                  </div>

                  {(() => {
                    const faqList = (activeCustomPage.faqs && activeCustomPage.faqs.length > 0) 
                      ? activeCustomPage.faqs 
                      : [
                        {
                          question: 'How do I place an order with Cash on Delivery (COD)?',
                          answer: 'Simply select your desired couture outfit, add it to your bag, and choose Cash on Delivery at checkout. Payment will be collected in cash or via UPI when the courier delivers your package to your doorstep.'
                        },
                        {
                          question: 'How does Bespoke Custom Tailoring work?',
                          answer: 'You can choose "Bespoke Custom Tailoring" on any outfit product page. Enter your custom measurements (Bust, Waist, Hips, Shoulder, Sleeve Length, Kurta Length) and special fitting notes. Our atelier tailors will stitch the outfit precisely to your specifications at no extra cost!'
                        },
                        {
                          question: 'How long does domestic shipping and delivery take?',
                          answer: 'Ready-to-wear orders are dispatched within 24–48 hours. Custom-tailored orders require 5–10 business days for hand-stitching before dispatch. Delivery via Delhivery Express takes 2–4 business days across India.'
                        },
                        {
                          question: 'How can I track my order status?',
                          answer: 'Click "Track Order" in the website footer or menu drawer. Enter your Order ID (e.g. ORD-123456) and registered phone number to view live courier tracking updates.'
                        },
                        {
                          question: 'What is your size exchange policy?',
                          answer: 'We offer a 7-day hassle-free size exchange policy. If your piece needs a different size, email care@inibymaya.com or contact us on WhatsApp (+91 98765 43210).'
                        },
                        {
                          question: 'Are there any extra charges for custom stitching?',
                          answer: 'No! All custom tailoring and measurement stitching services are provided complimentary with zero extra fees.'
                        }
                      ];

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {faqList.map((item, fIdx) => {
                          const isOpen = openFaqIndex === fIdx;
                          return (
                            <div 
                              key={fIdx} 
                              style={{ 
                                border: '1px solid var(--color-border)', 
                                borderRadius: '10px', 
                                overflow: 'hidden',
                                backgroundColor: 'var(--color-bg-secondary)',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => setOpenFaqIndex(isOpen ? -1 : fIdx)}
                                style={{
                                  width: '100%',
                                  padding: '16px 20px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  border: 'none',
                                  background: 'none',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  fontSize: '14.5px',
                                  fontWeight: '600',
                                  color: 'var(--color-text-primary)'
                                }}
                              >
                                <span>{item.question}</span>
                                <span style={{ fontSize: '18px', color: '#8b0000', marginLeft: '12px', fontWeight: 'bold' }}>
                                  {isOpen ? '−' : '+'}
                                </span>
                              </button>

                              {isOpen && (
                                <div style={{ 
                                  padding: '0 20px 18px 20px', 
                                  fontSize: '13.5px', 
                                  lineHeight: '1.7', 
                                  color: 'var(--color-text-secondary)',
                                  borderTop: '1px solid rgba(0, 0, 0, 0.05)',
                                  paddingTop: '12px'
                                }}>
                                  {item.answer}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <>
                  {/* Unified Rich Text Render for All Footer Pages */}
                  {(activeCustomPage.fullDescription || activeCustomPage.section1Content || activeCustomPage.section2Content || activeCustomPage.section1Heading || activeCustomPage.section2Heading) && (() => {
                    const rawContent = activeCustomPage.fullDescription !== undefined
                      ? activeCustomPage.fullDescription
                      : [
                          activeCustomPage.section1Heading ? `## ${activeCustomPage.section1Heading}` : null,
                          activeCustomPage.section1Content,
                          activeCustomPage.section2Heading ? `## ${activeCustomPage.section2Heading}` : null,
                          activeCustomPage.section2Content
                        ].filter(Boolean).join('\n\n');

                    const parsedHtml = renderRichTextHtml(rawContent);

                    return (
                      <div 
                        className="about-us-rich-content"
                        dangerouslySetInnerHTML={{ __html: parsedHtml }}
                        style={{ fontSize: '14.5px', lineHeight: '1.85', color: 'var(--color-text-secondary)', marginBottom: '32px' }}
                      />
                    );
                  })()}
                </>
              )}

              {/* Highlight Callout Box Notice (Hidden for About Us and FAQ) */}
              {tab !== 'about-us' && tab !== 'faq' && activeCustomPage.calloutTitle && (
                <div className="tab-highlight-callout" style={{
                  backgroundColor: '#fffdfa',
                  padding: '20px 24px',
                  borderRadius: '8px',
                  border: '1px solid #d4af37',
                  marginTop: '24px',
                  boxShadow: '0 4px 12px rgba(212, 175, 55, 0.08)'
                }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#8b0000', fontFamily: 'var(--font-display)', fontSize: '16px' }}>
                    ✨ {activeCustomPage.calloutTitle}
                  </h4>
                  <p style={{ margin: 0, fontSize: '13.5px', color: '#555', lineHeight: '1.6' }}>
                    {activeCustomPage.calloutText}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
