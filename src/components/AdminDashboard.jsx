import React, { useState, useEffect } from 'react';
import { Package, BarChart3, ShoppingBag, PlusCircle, Trash2, CheckCircle2, User, Ruler, Tag, Edit3, XCircle, Phone, Truck, Film, Upload, Settings } from 'lucide-react';

export default function AdminDashboard({ 
  products, 
  orders, 
  onAddProduct, 
  onDeleteProduct,
  onUpdateProduct,
  onUpdateOrderStatus,
  promosList = [],
  setPromosList,
  reelsList = [],
  setReelsList,
  onAddPromo,
  onDeletePromo,
  onAddReel,
  onDeleteReel,
  testimonialsList = [],
  onAddTestimonial,
  onDeleteTestimonial,
  boutiqueSettings = {},
  onSaveSettings
}) {
  const [activeTab, setActiveTab] = useState('orders');

  // Boutique Settings Form States
  const [settingsDesc, setSettingsDesc] = useState('');
  const [settingsEmail, setSettingsEmail] = useState('');
  const [settingsPhone, setSettingsPhone] = useState('');
  const [settingsAddress, setSettingsAddress] = useState('');
  const [settingsHours, setSettingsHours] = useState('');
  const [newsletterTitle, setNewsletterTitle] = useState('');
  const [newsletterSubtitle, setNewsletterSubtitle] = useState('');
  const [newsletterDiscount, setNewsletterDiscount] = useState(10);
  const [newsletterPromoCode, setNewsletterPromoCode] = useState('WELCOME10');
  const [newsletterEnabled, setNewsletterEnabled] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState('');

  useEffect(() => {
    if (boutiqueSettings && Object.keys(boutiqueSettings).length > 0 && !settingsLoaded) {
      setSettingsDesc(boutiqueSettings.description || '');
      setSettingsEmail(boutiqueSettings.email || '');
      setSettingsPhone(boutiqueSettings.phone || '');
      setSettingsAddress(boutiqueSettings.address || '');
      setSettingsHours(boutiqueSettings.hours || '');
      setNewsletterTitle(boutiqueSettings.newsletterTitle || 'Subscribe and Get 10% OFF');
      setNewsletterSubtitle(boutiqueSettings.newsletterSubtitle || 'No Spam, No Drama – Just Good Clothes');
      setNewsletterDiscount(Number(boutiqueSettings.newsletterDiscount !== undefined ? boutiqueSettings.newsletterDiscount : 10));
      setNewsletterPromoCode(boutiqueSettings.newsletterPromoCode || 'WELCOME10');
      setNewsletterEnabled(boutiqueSettings.newsletterEnabled !== false);
      setSettingsLoaded(true);
    }
  }, [boutiqueSettings, settingsLoaded]);

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    setSettingsSuccessMsg('');
    if (onSaveSettings) {
      onSaveSettings({
        description: settingsDesc,
        email: settingsEmail,
        phone: settingsPhone,
        address: settingsAddress,
        hours: settingsHours,
        newsletterTitle,
        newsletterSubtitle,
        newsletterDiscount: Number(newsletterDiscount),
        newsletterPromoCode: newsletterPromoCode.trim().toUpperCase(),
        newsletterEnabled
      });
      setSettingsSuccessMsg('Boutique configurations updated successfully!');
      setTimeout(() => setSettingsSuccessMsg(''), 4000);
    }
  };

  // Testimonials state managers
  const [tName, setTName] = useState('');
  const [tQuote, setTQuote] = useState('');
  const [tImageUrl, setTImageUrl] = useState('');
  const [tRating, setTRating] = useState(5);
  const [tTag, setTTag] = useState('HAY!');
  const [tSuccessMsg, setTSuccessMsg] = useState('');

  const handleTestimonialImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setTImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleTestimonialSubmit = (e) => {
    e.preventDefault();
    if (!tName || !tQuote) {
      alert('Please enter a customer name and review comment.');
      return;
    }
    const newT = {
      id: `t-${Date.now()}`,
      name: tName,
      imageUrl: tImageUrl || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800',
      quote: tQuote,
      rating: parseInt(tRating),
      tag: tTag || 'HAY!'
    };
    if (onAddTestimonial) {
      onAddTestimonial(newT);
    }
    setTName('');
    setTQuote('');
    setTImageUrl('');
    setTRating(5);
    setTTag('HAY!');
    setTSuccessMsg('Customer review published successfully!');
    setTimeout(() => setTSuccessMsg(''), 3000);
  };

  // Add/Edit product states
  const [editingProduct, setEditingProduct] = useState(null); 
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Long Kurtas');
  const [occasion, setOccasion] = useState('Daily Elegance');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image1, setImage1] = useState('');
  const [image2, setImage2] = useState('');
  const [customizable, setCustomizable] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  // Variants editing states
  const [productColors, setProductColors] = useState([{ name: 'Indigo Blue', hex: '#1a365d' }]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#1a365d');
  const [productSizes, setProductSizes] = useState(['XS', 'S', 'M', 'L', 'XL', 'XXL']);

  // Key Highlights fields
  const [hFit, setHFit] = useState('Straight Regular Fit');
  const [hFabric, setHFabric] = useState('100% Breathable Cotton');
  const [hNeck, setHNeck] = useState('Mandarin Neck');
  const [hSleeve, setHSleeve] = useState('3/4 Sleeves');
  const [hLength, setHLength] = useState('44 Inches');
  const [hTechnique, setHTechnique] = useState('Handcrafted Chikankari');

  // Promo Code manager states
  const [promoCode, setPromoCode] = useState('');
  const [promoType, setPromoType] = useState('percent'); 
  const [promoValue, setPromoValue] = useState('');
  const [promoMinPurchase, setPromoMinPurchase] = useState('0');
  const [promoDesc, setPromoDesc] = useState('');
  const [promoSuccessMsg, setPromoSuccessMsg] = useState('');

  // Reels manager states
  const [reelTitle, setReelTitle] = useState('');
  const [reelVideoFile, setReelVideoFile] = useState('');
  const [reelProductId, setReelProductId] = useState('');
  const [reelSuccessMsg, setReelSuccessMsg] = useState('');

  // Tracking number temporary inputs
  const [trackingNums, setTrackingNums] = useState({});

  // Sizing demands counting helper
  const sizeDemands = {
    'XS': 0, 'S': 0, 'M': 0, 'L': 0, 'XL': 0, 'XXL': 0, 'Custom Tailored': 0
  };
  orders.forEach(order => {
    order.items.forEach(item => {
      if (item.wantsCustomStitching) {
        sizeDemands['Custom Tailored'] += item.quantity;
      } else if (sizeDemands[item.size] !== undefined) {
        sizeDemands[item.size] += item.quantity;
      }
    });
  });

  // Calculations for stats
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const totalOrders = orders.length;
  const customOrdersCount = orders.filter(o => o.items.some(item => item.wantsCustomStitching)).length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // File Upload base64 read helper
  const handleImageUpload = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (index === 1) {
        setImage1(reader.result);
      } else {
        setImage2(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Video File read helper for Reels
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setReelVideoFile(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAddColor = (e) => {
    e.preventDefault();
    if (!newColorName.trim()) return;
    if (productColors.some(c => c.name.toLowerCase() === newColorName.trim().toLowerCase())) {
      alert('Color name already added!');
      return;
    }
    setProductColors(prev => [...prev, { name: newColorName.trim(), hex: newColorHex }]);
    setNewColorName('');
  };

  const handleRemoveColor = (name) => {
    setProductColors(prev => prev.filter(c => c.name !== name));
  };

  const handleSizeCheckboxToggle = (size) => {
    setProductSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  // Product Add / Update Submit
  const handleProductSubmit = (e) => {
    e.preventDefault();
    if (!title || !price || !description || !image1) {
      alert('Please fill out all required fields (including primary image file).');
      return;
    }
    if (productColors.length === 0) {
      alert('Please configure at least one color variant for the product.');
      return;
    }
    if (productSizes.length === 0) {
      alert('Please configure at least one available size for the product.');
      return;
    }

    if (editingProduct) {
      const updatedProduct = {
        ...editingProduct,
        title,
        category,
        price: parseFloat(price),
        description,
        images: [image1, image2 || image1],
        variants: {
          colors: productColors,
          sizes: productSizes
        },
        customizable,
        occasion,
        highlights: {
          fit: hFit,
          fabric: hFabric,
          neck: hNeck,
          sleeve: hSleeve,
          length: hLength,
          technique: hTechnique
        }
      };
      onUpdateProduct(updatedProduct);
      setSuccessMsg('Product updated successfully!');
      setEditingProduct(null);
    } else {
      const newProduct = {
        id: `im-added-${Date.now()}`,
        title,
        category,
        price: parseFloat(price),
        rating: 5.0,
        reviewsCount: 1,
        description,
        details: ['Handcrafted quality fabric', 'Modern regular fitting style', 'Breathable weave structure'],
        images: [image1, image2 || image1],
        variants: {
          colors: productColors,
          sizes: productSizes
        },
        customizable,
        bestSeller: false,
        occasion,
        highlights: {
          fit: hFit,
          fabric: hFabric,
          neck: hNeck,
          sleeve: hSleeve,
          length: hLength,
          technique: hTechnique
        }
      };
      onAddProduct(newProduct);
      setSuccessMsg('Product published successfully!');
    }

    // Reset Form
    setTitle('');
    setPrice('');
    setDescription('');
    setImage1('');
    setImage2('');
    setCustomizable(true);
    setOccasion('Daily Elegance');
    setProductColors([{ name: 'Indigo Blue', hex: '#1a365d' }]);
    setProductSizes(['XS', 'S', 'M', 'L', 'XL', 'XXL']);
    setHFit('Straight Regular Fit');
    setHFabric('100% Breathable Cotton');
    setHNeck('Mandarin Neck');
    setHSleeve('3/4 Sleeves');
    setHLength('44 Inches');
    setHTechnique('Handcrafted Chikankari');

    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleEditClick = (prod) => {
    setEditingProduct(prod);
    setTitle(prod.title);
    setCategory(prod.category);
    setOccasion(prod.occasion || 'Daily Elegance');
    setPrice(prod.price);
    setDescription(prod.description);
    setImage1(prod.images[0]);
    setImage2(prod.images[1] || '');
    setCustomizable(prod.customizable);
    setProductColors(prod.variants?.colors || [{ name: 'Indigo Blue', hex: '#1a365d' }]);
    setProductSizes(prod.variants?.sizes || ['XS', 'S', 'M', 'L', 'XL', 'XXL']);
    setHFit(prod.highlights?.fit || 'Straight Regular Fit');
    setHFabric(prod.highlights?.fabric || '100% Breathable Cotton');
    setHNeck(prod.highlights?.neck || 'Mandarin Neck');
    setHSleeve(prod.highlights?.sleeve || '3/4 Sleeves');
    setHLength(prod.highlights?.length || '44 Inches');
    setHTechnique(prod.highlights?.technique || 'Handcrafted Chikankari');
    setSuccessMsg('');
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setTitle('');
    setPrice('');
    setDescription('');
    setImage1('');
    setImage2('');
    setCustomizable(true);
    setOccasion('Daily Elegance');
    setProductColors([{ name: 'Indigo Blue', hex: '#1a365d' }]);
    setProductSizes(['XS', 'S', 'M', 'L', 'XL', 'XXL']);
    setHFit('Straight Regular Fit');
    setHFabric('100% Breathable Cotton');
    setHNeck('Mandarin Neck');
    setHSleeve('3/4 Sleeves');
    setHLength('44 Inches');
    setHTechnique('Handcrafted Chikankari');
  };

  // Promo operations
  const handleAddPromoSubmit = (e) => {
    e.preventDefault();
    if (!promoCode || !promoValue) return;

    const newPromo = {
      code: promoCode.trim().toUpperCase(),
      type: promoType,
      value: parseFloat(promoValue),
      minPurchase: parseFloat(promoMinPurchase || 0),
      description: promoDesc || `${promoType === 'percent' ? `${promoValue}%` : `₹${promoValue}`} off`
    };

    setPromoCode('');
    setPromoValue('');
    setPromoMinPurchase('0');
    setPromoDesc('');
    
    if (onAddPromo) {
      onAddPromo(newPromo);
    } else {
      setPromosList(prev => [...prev, newPromo]);
    }
    setPromoSuccessMsg('Promo offer configured!');
    setTimeout(() => setPromoSuccessMsg(''), 3000);
  };

  const handleDeletePromo = (code) => {
    if (onDeletePromo) {
      onDeletePromo(code);
    } else {
      setPromosList(prev => prev.filter(p => p.code !== code));
    }
  };

  // Reels operations
  const handleAddReelSubmit = (e) => {
    e.preventDefault();
    if (!reelTitle || !reelVideoFile) {
      alert('Please enter a title and select/input a vertical video source.');
      return;
    }

    const matchedProd = products.find(p => p.id === reelProductId);

    const newReel = {
      id: `reel-${Date.now()}`,
      title: reelTitle,
      videoUrl: reelVideoFile,
      productId: reelProductId || '',
      productTitle: matchedProd ? matchedProd.title : '',
      productPrice: matchedProd ? matchedProd.price : 0,
      productImage: matchedProd ? matchedProd.images[0] : ''
    };

    if (onAddReel) {
      onAddReel(newReel);
    } else {
      setReelsList(prev => [...prev, newReel]);
    }
    setReelTitle('');
    setReelVideoFile('');
    setReelProductId('');
    setReelSuccessMsg('Couture reel added to landing page!');
    setTimeout(() => setReelSuccessMsg(''), 3000);
  };

  const handleDeleteReel = (id) => {
    if (onDeleteReel) {
      onDeleteReel(id);
    } else {
      setReelsList(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleSaveTracking = (orderId) => {
    const num = trackingNums[orderId] || '';
    if (!num) return;
    const order = orders.find(o => o.id === orderId);
    onUpdateOrderStatus(orderId, order?.status || 'Shipped', num);
    alert(`Delhivery Tracking Number ${num} saved for Order ${orderId}!`);
  };

  return (
    <div className="admin-dashboard-container container">
      {/* Sidebar / Sidebar Header */}
      <div className="admin-header-row">
        <h2>InibyMaya Store Manager Console</h2>
        
        <div className="admin-tabs">
          <button 
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag size={15} />
            <span>Orders Lifecycle ({orders.length})</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => { setActiveTab('products'); handleCancelEdit(); }}
          >
            <Package size={15} />
            <span>Catalog Items ({products.length})</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'promos' ? 'active' : ''}`}
            onClick={() => setActiveTab('promos')}
          >
            <Tag size={15} />
            <span>Store Coupons ({promosList.length})</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'reels' ? 'active' : ''}`}
            onClick={() => setActiveTab('reels')}
          >
            <Film size={15} />
            <span>Couture Reels ({reelsList.length})</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <BarChart3 size={15} />
            <span>Sizing Insights</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'testimonials' ? 'active' : ''}`}
            onClick={() => setActiveTab('testimonials')}
          >
            <User size={15} />
            <span>Patron Reviews ({testimonialsList.length})</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={15} />
            <span>Boutique Settings</span>
          </button>
        </div>
      </div>

      <hr className="detail-divider" />

      {/* Tab 1: Orders Lifecycle */}
      {activeTab === 'orders' && (
        <div className="admin-content-section animate-fadeIn">
          <div className="admin-section-header">
            <h3>Stitching & Dispatch Operations</h3>
            <p>Advance each customer's order through the boutique stitching rooms, pattern drafts, quality control, and final Delhivery courier dispatch.</p>
          </div>

          {orders.length > 0 ? (
            <div className="admin-orders-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID / Date</th>
                    <th>Customer Contact</th>
                    <th>Sizing / Tailoring Inputs</th>
                    <th>Lifecycle Status Updates</th>
                    <th>Price Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, idx) => {
                    const isCustom = order.items.some(i => i.wantsCustomStitching);
                    return (
                      <tr key={idx}>
                        <td>
                          <strong className="order-id-label">{order.id}</strong>
                          <div className="order-meta-small">
                            <span>{new Date(order.timestamp).toLocaleDateString()}</span>
                            <br />
                            <span className="pay-id-badge">{order.paymentId}</span>
                          </div>
                        </td>
                        <td>
                          <div className="cust-info">
                            <User size={12} />
                            <span><strong>{order.shippingDetails.name}</strong></span>
                          </div>
                          <p className="cust-address">{order.shippingDetails.address}, {order.shippingDetails.city} - {order.shippingDetails.pincode}</p>
                          <p className="cust-phone">
                            <Phone size={11} style={{ marginRight: '4px', verticalAlign: 'middle', opacity: 0.7 }} />
                            <span>+91 {order.shippingDetails.phone}</span>
                          </p>
                          {order.notes && (
                            <div className="admin-order-customer-note-callout">
                              <strong>Special Instruction:</strong> "{order.notes}"
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="order-table-items-list">
                            {order.items.map((item, itemIdx) => (
                              <div key={itemIdx} className="table-item-desc">
                                <span>• <strong>{item.product.title}</strong> ({item.color}) - Qty: {item.quantity}</span>
                                <div className="sizing-readout-row">
                                  <span>Standard Size: <span className="size-badge-table">{item.size}</span></span>
                                  {item.wantsCustomStitching && item.measurements && (
                                    <div className="table-item-measurements animate-fadeIn">
                                      <Ruler size={10} />
                                      <span><strong>Bust: {item.measurements.bust}"</strong> | <strong>Waist: {item.measurements.waist}"</strong> | <strong>Hips: {item.measurements.hips}"</strong> | <strong>Height: {item.measurements.height}</strong></span>
                                      {item.measurements.notes && <p className="admin-tailoring-notes">Notes: "{item.measurements.notes}"</p>}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td>
                          <div className="status-selector-container">
                            <select 
                              value={order.status || (isCustom ? 'Pending Stitching' : 'Pending Shipment')}
                              onChange={(e) => onUpdateOrderStatus(order.id, e.target.value, order.trackingNumber)}
                              className={`status-updater-dropdown status-${order.status ? order.status.toLowerCase().replace(/\s+/g, '-') : 'placed'}`}
                            >
                              {isCustom ? (
                                <>
                                  <option value="Pending Stitching">Pending Stitching</option>
                                  <option value="Pattern Drafting">Pattern Drafting</option>
                                  <option value="Stitching in Progress">Stitching in Progress</option>
                                  <option value="Quality Check">Quality Check</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Delivered">Delivered</option>
                                </>
                              ) : (
                                <>
                                  <option value="Pending Shipment">Pending Shipment</option>
                                  <option value="Quality Check">Quality Check</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Delivered">Delivered</option>
                                </>
                              )}
                            </select>

                            {order.status === 'Shipped' && (
                              <div className="tracking-updater-row animate-slideDown">
                                <input 
                                  type="text" 
                                  placeholder="Delhivery AWB ID"
                                  value={trackingNums[order.id] !== undefined ? trackingNums[order.id] : (order.trackingNumber || '')}
                                  onChange={(e) => setTrackingNums({
                                    ...trackingNums,
                                    [order.id]: e.target.value
                                  })}
                                />
                                <button onClick={() => handleSaveTracking(order.id)}>Save</button>
                              </div>
                            )}
                            
                            {order.status !== 'Shipped' && order.trackingNumber && (
                              <span className="current-tracking-label">Delhivery: {order.trackingNumber}</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <strong className="table-cost-total red-totals-text">₹{order.total.toLocaleString('en-IN')}</strong>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-admin-state">
              <p>No orders placed yet. Place some mock orders in standard customer mode first.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Catalog management */}
      {activeTab === 'products' && (
        <div className="admin-content-section catalog-management-grid animate-fadeIn">
          {/* Add / Edit Form */}
          <div className="add-product-form-box">
            <h4>{editingProduct ? 'Edit Boutique Creation' : 'Publish New Couture Item'}</h4>
            {successMsg && <p className="success-banner">{successMsg}</p>}
            
            <form onSubmit={handleProductSubmit}>
              <div className="form-group">
                <label>Product Title *</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="e.g. Crimson Velvet Long Kurta Set" 
                  required 
                />
              </div>
              <div className="form-row-double">
                <div className="form-group">
                  <label>Category *</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="Long Kurtas">Long Kurtas</option>
                    <option value="Straight Kurtas">Straight Kurtas</option>
                    <option value="Anarkali Suits">Anarkali Suits</option>
                    <option value="Co-ord Sets">Co-ord Sets</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Occasion Category *</label>
                  <select value={occasion} onChange={(e) => setOccasion(e.target.value)}>
                    <option value="Daily Elegance">Daily Elegance</option>
                    <option value="Formal Grace">Formal Grace</option>
                    <option value="Festive Couture">Festive Couture</option>
                    <option value="Celebrations">Celebrations</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Price (INR) *</label>
                <input 
                  type="number" 
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)} 
                  placeholder="e.g. 2999" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Description Details *</label>
                <textarea 
                  rows="3" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Fabric, embroidery type, wash care tips..."
                  required 
                />
              </div>

              {/* Product Variants (Sizes & Colors) Configurator */}
              <div className="variants-configurator-box" style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '16px', marginBottom: '20px', backgroundColor: 'var(--color-bg-secondary)' }}>
                <h5 style={{ margin: '0 0 16px 0', fontSize: '13.5px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Garment Variants Configuration</h5>
                
                {/* Size selections */}
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Available Sizes *</label>
                  <div className="admin-sizes-checkbox-grid" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => {
                      const isChecked = productSizes.includes(size);
                      return (
                        <label key={size} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', userSelect: 'none' }}>
                          <input 
                            type="checkbox" 
                            checked={isChecked} 
                            onChange={() => handleSizeCheckboxToggle(size)}
                          />
                          <span>{size}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Color configurer */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Add Couture Color Variant *</label>
                  
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '14px' }}>
                    <input 
                      type="text" 
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      placeholder="e.g. Sage Green"
                      style={{ flexGrow: 1, height: '38px', minWidth: '150px', padding: '0 12px', border: '1px solid var(--color-border)', borderRadius: '4px', backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '38px', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0 8px', backgroundColor: 'var(--color-bg-primary)' }}>
                      <input 
                        type="color" 
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        style={{ width: '28px', height: '24px', padding: 0, border: 'none', cursor: 'pointer', backgroundColor: 'transparent' }}
                      />
                      <input 
                        type="text" 
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        placeholder="#hex"
                        style={{ border: 'none', outline: 'none', background: 'none', width: '70px', padding: 0, fontSize: '12px', color: 'var(--color-text-primary)' }}
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={handleAddColor} 
                      className="btn-secondary" 
                      style={{ height: '38px', padding: '0 16px', whiteSpace: 'nowrap', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      + Add Color
                    </button>
                  </div>

                  {/* Colors List */}
                  {productColors.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                      {productColors.map(color => (
                        <div 
                          key={color.name} 
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}
                        >
                          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color.hex, border: '1px solid rgba(0,0,0,0.1)' }}></span>
                          <span>{color.name} ({color.hex})</span>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveColor(color.name)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-accent)', padding: '2px', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Product Highlights Inputs */}
              <div className="highlights-form-section" style={{ border: '1px dashed var(--color-border)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: 'var(--color-accent)' }}>Key Highlights Configuration</h5>
                
                <div className="form-row-double">
                  <div className="form-group">
                    <label>Garment Fit</label>
                    <input 
                      type="text" 
                      value={hFit} 
                      onChange={(e) => setHFit(e.target.value)} 
                      placeholder="e.g. A-line fit"
                    />
                  </div>
                  <div className="form-group">
                    <label>Top Fabric</label>
                    <input 
                      type="text" 
                      value={hFabric} 
                      onChange={(e) => setHFabric(e.target.value)} 
                      placeholder="e.g. Viscose / Silk Velvet"
                    />
                  </div>
                </div>

                <div className="form-row-double">
                  <div className="form-group">
                    <label>Neckline Style</label>
                    <input 
                      type="text" 
                      value={hNeck} 
                      onChange={(e) => setHNeck(e.target.value)} 
                      placeholder="e.g. Frill Neck"
                    />
                  </div>
                  <div className="form-group">
                    <label>Sleeve Styling</label>
                    <input 
                      type="text" 
                      value={hSleeve} 
                      onChange={(e) => setHSleeve(e.target.value)} 
                      placeholder="e.g. 3/4th sleeve with Frills"
                    />
                  </div>
                </div>

                <div className="form-row-double">
                  <div className="form-group">
                    <label>Sleeve Length</label>
                    <input 
                      type="text" 
                      value={hLength} 
                      onChange={(e) => setHLength(e.target.value)} 
                      placeholder="e.g. 16 Inches"
                    />
                  </div>
                  <div className="form-group">
                    <label>Top Technique</label>
                    <input 
                      type="text" 
                      value={hTechnique} 
                      onChange={(e) => setHTechnique(e.target.value)} 
                      placeholder="e.g. Printed / Hand-embroidered"
                    />
                  </div>
                </div>
              </div>
              
              {/* Premium Image File Uploads */}
              <div className="form-group">
                <label>Primary Image (File Upload) *</label>
                <div className="file-upload-wrapper">
                  <label className="custom-file-upload">
                    <Upload size={14} />
                    <span>Select Primary File</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleImageUpload(e, 1)} 
                    />
                  </label>
                </div>
                {image1 && (
                  <div className="admin-image-preview">
                    <img src={image1} alt="Primary Preview" />
                    <span className="file-loaded-status">Image Loaded ✓</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Secondary Image (for Hover Swap)</label>
                <div className="file-upload-wrapper">
                  <label className="custom-file-upload">
                    <Upload size={14} />
                    <span>Select Secondary File</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleImageUpload(e, 2)} 
                    />
                  </label>
                </div>
                {image2 && (
                  <div className="admin-image-preview">
                    <img src={image2} alt="Secondary Preview" />
                    <span className="file-loaded-status">Secondary Image Loaded ✓</span>
                  </div>
                )}
              </div>

              <div className="form-group-checkbox">
                <input 
                  type="checkbox" 
                  id="custom-tailor" 
                  checked={customizable} 
                  onChange={() => setCustomizable(!customizable)} 
                />
                <label htmlFor="custom-tailor">Supports Custom Stitching Form</label>
              </div>

              <div className="form-buttons-row">
                <button type="submit" className="add-btn-submit">
                  {editingProduct ? <Edit3 size={14} /> : <PlusCircle size={14} />}
                  <span>{editingProduct ? 'Save Changes' : 'Publish Product'}</span>
                </button>
                {editingProduct && (
                  <button type="button" className="cancel-edit-btn" onClick={handleCancelEdit}>
                    <XCircle size={14} />
                    <span>Cancel Edit</span>
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Listing Inventory */}
          <div className="admin-catalog-listing">
            <h4>Boutique Catalog Control</h4>
            <div className="admin-inventory-list">
              {products.map((prod) => (
                <div key={prod.id} className="inventory-card">
                  <img src={prod.images[0]} alt={prod.title} />
                  <div className="inventory-details">
                    <h5>{prod.title}</h5>
                    <p>{prod.category} | <strong>₹{prod.price}</strong></p>
                    <span className="customize-tag">{prod.customizable ? 'Tailoring Available' : 'Standard Sizing'}</span>
                  </div>
                  <div className="inventory-card-actions">
                    <button 
                      className="edit-item-btn" 
                      onClick={() => handleEditClick(prod)}
                      title="Edit Item details"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button 
                      className="delete-item-btn" 
                      onClick={() => onDeleteProduct(prod.id)}
                      title="Delete Item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Store Coupons Configurator */}
      {activeTab === 'promos' && (
        <div className="admin-content-section catalog-management-grid animate-fadeIn">
          <div className="add-product-form-box">
            <h4>Configure Store Coupons</h4>
            {promoSuccessMsg && <p className="success-banner">{promoSuccessMsg}</p>}
            <form onSubmit={handleAddPromoSubmit}>
              <div className="form-group">
                <label>Promo Coupon Code *</label>
                <input 
                  type="text" 
                  value={promoCode} 
                  onChange={(e) => setPromoCode(e.target.value)} 
                  placeholder="e.g. SILK20" 
                  required 
                />
              </div>
              <div className="form-row-double">
                <div className="form-group">
                  <label>Discount Type *</label>
                  <select value={promoType} onChange={(e) => setPromoType(e.target.value)}>
                    <option value="percent">Percent Discount (%)</option>
                    <option value="flat">Flat Cash Discount (₹)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Value (Amt / %)*</label>
                  <input 
                    type="number" 
                    value={promoValue} 
                    onChange={(e) => setPromoValue(e.target.value)} 
                    placeholder="e.g. 15 for percent, 200 for flat" 
                    required 
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Minimum Purchase Threshold (₹)*</label>
                <input 
                  type="number" 
                  value={promoMinPurchase} 
                  onChange={(e) => setPromoMinPurchase(e.target.value)} 
                  placeholder="0" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Description Label (shown to Customer)</label>
                <input 
                  type="text" 
                  value={promoDesc} 
                  onChange={(e) => setPromoDesc(e.target.value)} 
                  placeholder="e.g. 10% discount on all orders!" 
                />
              </div>

              <button type="submit" className="add-btn-submit">
                <Tag size={14} />
                <span>Create Offer Coupon</span>
              </button>
            </form>
          </div>

          <div className="admin-catalog-listing">
            <h4>Active Promotion Codes</h4>
            <div className="admin-inventory-list">
              {promosList.map((promo) => (
                <div key={promo.code} className="inventory-card promo-card-item">
                  <div className="promo-tag-icon-box">
                    <Tag size={20} />
                  </div>
                  <div className="inventory-details text-left">
                    <h5 className="promo-tag-code">{promo.code}</h5>
                    <p>{promo.description}</p>
                    <span className="customize-tag">
                      {promo.minPurchase > 0 ? `Min Purchase: ₹${promo.minPurchase}` : 'No minimum purchase'}
                    </span>
                  </div>
                  <button 
                    className="delete-item-btn" 
                    onClick={() => handleDeletePromo(promo.code)}
                    title="Remove Promo Code"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Couture Reels Manager */}
      {activeTab === 'reels' && (
        <div className="admin-content-section catalog-management-grid animate-fadeIn">
          {/* Add Reel Form */}
          <div className="add-product-form-box">
            <h4>Publish New Couture Reel</h4>
            {reelSuccessMsg && <p className="success-banner">{reelSuccessMsg}</p>}
            <p className="admin-form-intro">Configure vertical video banners with play loops to showcase outfit overlays directly on the homepage.</p>
            
            <form onSubmit={handleAddReelSubmit}>
              <div className="form-group">
                <label>Reel Title *</label>
                <input 
                  type="text" 
                  value={reelTitle} 
                  onChange={(e) => setReelTitle(e.target.value)} 
                  placeholder="e.g. Silk Anarkali Motion Showcase" 
                  required 
                />
              </div>

              {/* Upload MP4 File */}
              <div className="form-group">
                <label>Upload Vertical Video (MP4)</label>
                <div className="file-upload-wrapper">
                  <label className="custom-file-upload">
                    <Upload size={14} />
                    <span>Select Video File</span>
                    <input 
                      type="file" 
                      accept="video/*" 
                      onChange={handleVideoUpload} 
                    />
                  </label>
                </div>
              </div>

              <div className="form-group-divider"><span>OR</span></div>

              {/* Input Video URL */}
              <div className="form-group">
                <label>Vertical Video MP4 URL</label>
                <input 
                  type="url" 
                  value={reelVideoFile && !reelVideoFile.startsWith('data:video') ? reelVideoFile : ''} 
                  onChange={(e) => setReelVideoFile(e.target.value)} 
                  placeholder="https://assets.mixkit.co/videos/..." 
                />
              </div>

              {reelVideoFile && (
                <div className="admin-video-preview">
                  <span className="file-loaded-status">Video Source Set ✓</span>
                  <video src={reelVideoFile} muted style={{ width: '120px', height: '213px', objectFit: 'cover', display: 'block', margin: '10px 0', borderRadius: '6px' }} />
                </div>
              )}

              {/* Associate with catalog product */}
              <div className="form-group">
                <label>Link Catalog Outfit (Optional)</label>
                <select value={reelProductId} onChange={(e) => setReelProductId(e.target.value)}>
                  <option value="">-- Select Product --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.title} (₹{p.price})</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="add-btn-submit">
                <Film size={14} />
                <span>Publish Reel banner</span>
              </button>
            </form>
          </div>

          {/* Active Reels List */}
          <div className="admin-catalog-listing">
            <h4>Live Couture Reels Banners</h4>
            <div className="admin-inventory-list">
              {reelsList.map((reel) => (
                <div key={reel.id} className="inventory-card reel-admin-card">
                  {reel.videoUrl && (
                    <video src={reel.videoUrl} muted autoPlay loop style={{ width: '60px', height: '100px', objectFit: 'cover', borderRadius: '4px' }} />
                  )}
                  <div className="inventory-details text-left">
                    <h5>{reel.title}</h5>
                    <p className="associated-status-label">
                      {reel.productId ? `🔗 Linked: ${reel.productTitle || 'Product'}` : 'No associated product'}
                    </p>
                  </div>
                  <button 
                    className="delete-item-btn" 
                    onClick={() => handleDeleteReel(reel.id)}
                    title="Remove Reel Banner"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Sizing Insights & Demands */}
      {activeTab === 'stats' && (
        <div className="admin-content-section animate-fadeIn">
          <div className="admin-section-header">
            <h3>Bespoke Sizing Analytics</h3>
            <p>Review customer sizing patterns, standard vs. custom ratios, and revenue totals.</p>
          </div>

          <div className="insights-summary-grid">
            <div className="stat-card">
              <span className="stat-label">Boutique Revenue</span>
              <h2 className="stat-value">₹{totalRevenue.toLocaleString('en-IN')}</h2>
            </div>
            <div className="stat-card">
              <span className="stat-label">Orders Sewn</span>
              <h2 className="stat-value">{totalOrders}</h2>
            </div>
            <div className="stat-card">
              <span className="stat-label">Bespoke Fit Rate</span>
              <h2 className="stat-value">{customOrdersCount}</h2>
              <span className="stat-subtext">{totalOrders > 0 ? Math.round((customOrdersCount / totalOrders) * 100) : 0}% custom stitched</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Average Order Val</span>
              <h2 className="stat-value">₹{avgOrderValue.toLocaleString('en-IN')}</h2>
            </div>
          </div>

          <div className="insights-flex-grid">
            <div className="custom-sizing-analysis sizing-chart-card">
              <h4>Standard vs. Custom Sizing Demand</h4>
              <p>Breakdown of standard sizes select versus bespoke measurement fitting inputs.</p>
              <table className="insights-table">
                <thead>
                  <tr>
                    <th>Sizing Category</th>
                    <th>Count of Items Ordered</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(sizeDemands).map(([size, count]) => (
                    <tr key={size} className={size === 'Custom Tailored' ? 'highlight-custom-row' : ''}>
                      <td><strong>{size}</strong></td>
                      <td>{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="custom-sizing-analysis notes-log-card">
              <h4>Patron Stitching Notes</h4>
              <p>Special instructions submitted during tailor mapping configuration:</p>
              <div className="notes-scroller-box">
                {orders.some(o => o.items.some(item => item.measurements && item.measurements.notes)) ? (
                  orders.map(order => 
                    order.items.map((item, iIdx) => 
                      item.measurements && item.measurements.notes && (
                        <div key={`${order.id}-${iIdx}`} className="notes-log-item">
                          <span><strong>{order.id}</strong> (Customer: {order.shippingDetails.name})</span>
                          <p>"{item.measurements.notes}"</p>
                        </div>
                      )
                    )
                  )
                ) : (
                  <p className="no-notes-status">No specific tailoring notes submitted yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Testimonials Configurator */}
      {activeTab === 'testimonials' && (
        <div className="admin-content-section animate-fadeIn">
          <div className="admin-section-header">
            <h3>Configure Customer Testimonials</h3>
            <p>Manage customer reviews, photos, star ratings, and brand labels shown on the homepage.</p>
          </div>

          <div className="admin-split-layout">
            <div className="admin-form-box">
              <h4>Publish New Review</h4>
              {tSuccessMsg && <p className="success-banner">{tSuccessMsg}</p>}
              
              <form onSubmit={handleTestimonialSubmit}>
                <div className="form-group">
                  <label>Customer Name *</label>
                  <input 
                    type="text" 
                    value={tName} 
                    onChange={(e) => setTName(e.target.value)} 
                    placeholder="e.g. Gayathri Arvind" 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Review Comment *</label>
                  <textarea 
                    value={tQuote} 
                    onChange={(e) => setTQuote(e.target.value)} 
                    placeholder="e.g. I have many kurtas from you. Every piece is awesome..." 
                    rows={3}
                    required 
                  />
                </div>

                <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Star Rating</label>
                    <select value={tRating} onChange={(e) => setTRating(parseInt(e.target.value))}>
                      <option value={5}>5 Stars</option>
                      <option value={4}>4 Stars</option>
                      <option value={3}>3 Stars</option>
                      <option value={2}>2 Stars</option>
                      <option value={1}>1 Star</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Brand Tag Code</label>
                    <input 
                      type="text" 
                      value={tTag} 
                      onChange={(e) => setTTag(e.target.value)} 
                      placeholder="e.g. HAY!" 
                    />
                  </div>
                </div>

                {/* Customer Photo Upload */}
                <div className="form-group">
                  <label>Upload Customer Photo</label>
                  <div className="file-upload-wrapper">
                    <label className="custom-file-upload">
                      <Upload size={14} />
                      <span>Select Photo File</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleTestimonialImageUpload} 
                      />
                    </label>
                  </div>
                </div>

                <div className="form-group-divider"><span>OR</span></div>

                <div className="form-group">
                  <label>Customer Photo Image URL</label>
                  <input 
                    type="url" 
                    value={tImageUrl && !tImageUrl.startsWith('data:image') ? tImageUrl : ''} 
                    onChange={(e) => setTImageUrl(e.target.value)} 
                    placeholder="https://images.unsplash.com/..." 
                  />
                </div>

                {tImageUrl && (
                  <div className="admin-image-preview" style={{ marginTop: '10px' }}>
                    <span className="file-loaded-status">Photo Loaded ✓</span>
                    <img src={tImageUrl} alt="Reviewer preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '50%', display: 'block', margin: '10px 0', border: '2px solid var(--color-border)' }} />
                  </div>
                )}

                <button type="submit" className="add-btn-submit">
                  <PlusCircle size={14} />
                  <span>Publish Testimonial</span>
                </button>
              </form>
            </div>

            <div className="admin-catalog-listing">
              <h4>Live Patron Reviews ({testimonialsList.length})</h4>
              <div className="admin-inventory-list">
                {testimonialsList.map((t) => (
                  <div key={t.id} className="inventory-card testimonial-admin-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', border: '1px solid var(--color-border)', borderRadius: '8px', marginBottom: '12px' }}>
                    {t.imageUrl && (
                      <img src={t.imageUrl} alt={t.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '50%' }} />
                    )}
                    <div className="inventory-details text-left" style={{ flexGrow: 1 }}>
                      <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{t.name} <span className="review-tag-badge" style={{ fontSize: '10px', background: 'var(--color-bg-secondary)', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', color: 'var(--color-text-secondary)' }}>{t.tag || 'HAY!'}</span></h5>
                      <p style={{ margin: '4px 0', fontSize: '12.5px', color: 'var(--color-text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>"{t.quote}"</p>
                      <div className="stars-row" style={{ color: '#03a685', fontSize: '11px', display: 'flex', gap: '2px' }}>
                        {Array.from({ length: t.rating || 5 }).map((_, i) => '★')}
                      </div>
                    </div>
                    <button 
                      className="delete-item-btn" 
                      onClick={() => {
                        if (confirm(`Remove review from ${t.name}?`)) {
                          onDeleteTestimonial(t.id);
                        }
                      }}
                      title="Remove Testimonial"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Boutique Settings Configurator */}
      {activeTab === 'settings' && (
        <div className="admin-content-section animate-fadeIn">
          <div className="admin-section-header">
            <h3>Configure Boutique Settings</h3>
            <p>Update your e-commerce store brand description, support emails, contact hotline, atelier showroom address, and operating hours shown in the footer and help pages.</p>
          </div>

          <div className="admin-form-box" style={{ maxWidth: '680px', margin: '0 auto' }}>
            {settingsSuccessMsg && <p className="success-banner">{settingsSuccessMsg}</p>}
            
            <form onSubmit={handleSettingsSubmit}>
              <div className="form-group">
                <label>Boutique Description *</label>
                <textarea 
                  value={settingsDesc} 
                  onChange={(e) => setSettingsDesc(e.target.value)} 
                  placeholder="High-end Indian traditional wear..." 
                  rows={3}
                  required 
                />
              </div>

              <div className="form-row-double">
                <div className="form-group">
                  <label>Support Email Address *</label>
                  <input 
                    type="email" 
                    value={settingsEmail} 
                    onChange={(e) => setSettingsEmail(e.target.value)} 
                    placeholder="care@inibymaya.com" 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Hotline Phone Number *</label>
                  <input 
                    type="text" 
                    value={settingsPhone} 
                    onChange={(e) => setSettingsPhone(e.target.value)} 
                    placeholder="+91 98765 43210" 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Boutique Atelier Address *</label>
                <textarea 
                  value={settingsAddress} 
                  onChange={(e) => setSettingsAddress(e.target.value)} 
                  placeholder="Showroom address..." 
                  rows={2}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Operating Hours *</label>
                <input 
                  type="text" 
                  value={settingsHours} 
                  onChange={(e) => setSettingsHours(e.target.value)} 
                  placeholder="Mon - Sat: 10:00 AM - 07:00 PM IST" 
                  required 
                />
              </div>

              {/* Newsletter Offer Configurator */}
              <div className="newsletter-config-section" style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px', color: 'var(--color-text-primary)' }}>Newsletter Subscription Popup Configuration</h4>
                
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <input 
                    type="checkbox" 
                    id="newsletterEnabled"
                    checked={newsletterEnabled} 
                    onChange={(e) => setNewsletterEnabled(e.target.checked)} 
                    style={{ width: 'auto', cursor: 'pointer' }}
                  />
                  <label htmlFor="newsletterEnabled" style={{ cursor: 'pointer', userSelect: 'none', marginBottom: 0 }}>Enable Newsletter Popup for Guests</label>
                </div>

                {newsletterEnabled && (
                  <>
                    <div className="form-group">
                      <label>Newsletter Title *</label>
                      <input 
                        type="text" 
                        value={newsletterTitle} 
                        onChange={(e) => setNewsletterTitle(e.target.value)} 
                        placeholder="Subscribe and Get 10% OFF" 
                        required 
                      />
                    </div>

                    <div className="form-group">
                      <label>Newsletter Subtitle *</label>
                      <input 
                        type="text" 
                        value={newsletterSubtitle} 
                        onChange={(e) => setNewsletterSubtitle(e.target.value)} 
                        placeholder="No Spam, No Drama – Just Good Clothes" 
                        required 
                      />
                    </div>

                    <div className="form-row-double">
                      <div className="form-group">
                        <label>Discount Percentage (%) *</label>
                        <input 
                          type="number" 
                          min={1}
                          max={100}
                          value={newsletterDiscount} 
                          onChange={(e) => setNewsletterDiscount(e.target.value)} 
                          placeholder="e.g. 10" 
                          required 
                        />
                      </div>

                      <div className="form-group">
                        <label>Generated Promo Code *</label>
                        <input 
                          type="text" 
                          value={newsletterPromoCode} 
                          onChange={(e) => setNewsletterPromoCode(e.target.value)} 
                          placeholder="WELCOME10" 
                          required 
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button type="submit" className="add-btn-submit" style={{ marginTop: '16px' }}>
                <CheckCircle2 size={14} />
                <span>Save Boutique Settings</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
