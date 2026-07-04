import React, { useState } from 'react';
import { Package, BarChart3, ShoppingBag, PlusCircle, Trash2, CheckCircle2, User, Ruler, Tag, Edit3, XCircle, Phone, Truck } from 'lucide-react';

export default function AdminDashboard({ 
  products, 
  orders, 
  onAddProduct, 
  onDeleteProduct,
  onUpdateProduct,
  onUpdateOrderStatus,
  promosList = [],
  setPromosList
}) {
  const [activeTab, setActiveTab] = useState('orders');

  // Add/Edit product states
  const [editingProduct, setEditingProduct] = useState(null); // null if adding new
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Long Kurtas');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image1, setImage1] = useState('');
  const [image2, setImage2] = useState('');
  const [customizable, setCustomizable] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  // Promo Code manager states
  const [promoCode, setPromoCode] = useState('');
  const [promoType, setPromoType] = useState('percent'); // percent or flat
  const [promoValue, setPromoValue] = useState('');
  const [promoMinPurchase, setPromoMinPurchase] = useState('0');
  const [promoDesc, setPromoDesc] = useState('');
  const [promoSuccessMsg, setPromoSuccessMsg] = useState('');

  // Tracking number temporary inputs dictionary
  const [trackingNums, setTrackingNums] = useState({});

  // Calculations for stats
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const totalOrders = orders.length;
  const customOrdersCount = orders.filter(o => o.items.some(item => item.wantsCustomStitching)).length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

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

  // Product Add / Update Trigger
  const handleProductSubmit = (e) => {
    e.preventDefault();
    if (!title || !price || !description || !image1) {
      alert('Please fill out all required fields.');
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
        customizable
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
          colors: [{ name: 'Default Indigo', hex: '#1a365d' }],
          sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
        },
        customizable,
        bestSeller: false
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

    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleEditClick = (prod) => {
    setEditingProduct(prod);
    setTitle(prod.title);
    setCategory(prod.category);
    setPrice(prod.price);
    setDescription(prod.description);
    setImage1(prod.images[0]);
    setImage2(prod.images[1] || '');
    setCustomizable(prod.customizable);
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
    
    setPromosList(prev => [...prev, newPromo]);
    setPromoSuccessMsg('Promo offer configured!');
    setTimeout(() => setPromoSuccessMsg(''), 3000);
  };

  const handleDeletePromo = (code) => {
    setPromosList(prev => prev.filter(p => p.code !== code));
  };

  // Tracking submit helper
  const handleSaveTracking = (orderId) => {
    const num = trackingNums[orderId] || '';
    if (!num) return;
    
    // Find current status of order
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
            className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <BarChart3 size={15} />
            <span>Sizing Insights</span>
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
                            <span className="pay-id-badge">Pay ID: {order.paymentId.substring(0, 12)}</span>
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
                          {/* Lifecycle dropdown selectors */}
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

                            {/* Tracking Number input if Shipped */}
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
                          <strong className="table-cost-total">₹{order.total.toLocaleString('en-IN')}</strong>
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
                  <label>Price (INR) *</label>
                  <input 
                    type="number" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    placeholder="e.g. 2999" 
                    required 
                  />
                </div>
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
              <div className="form-group">
                <label>Primary Image URL *</label>
                <input 
                  type="url" 
                  value={image1} 
                  onChange={(e) => setImage1(e.target.value)} 
                  placeholder="https://images.unsplash.com/photo-..." 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Secondary Image URL (for Hover Swap)</label>
                <input 
                  type="url" 
                  value={image2} 
                  onChange={(e) => setImage2(e.target.value)} 
                  placeholder="https://images.unsplash.com/photo-..." 
                />
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
          {/* Add Coupon Offer Form */}
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

          {/* List of active promos */}
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

      {/* Tab 4: Sizing Insights & Demands */}
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
            {/* Sizing Distribution Table */}
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

            {/* Custom Notes Logs */}
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
    </div>
  );
}
