import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import CheckoutModal from './components/CheckoutModal';
import AdminDashboard from './components/AdminDashboard';
import { products as initialProducts } from './data/products';
import { CheckCircle2, Calendar, Truck, ArrowLeft, Heart, ShoppingBag, Sparkles, Scissors } from 'lucide-react';
import './App.css';

export default function App() {
  // Navigation & Page routing
  const [activePage, setActivePage] = useState('home'); // home, shop, admin
  const [searchQuery, setSearchQuery] = useState('');

  // Catalog State (allows admin modification)
  const [productsList, setProductsList] = useState(() => {
    const saved = localStorage.getItem('im_catalog');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  // Cart & Orders State
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('im_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [ordersList, setOrdersList] = useState(() => {
    const saved = localStorage.getItem('im_orders');
    return saved ? JSON.parse(saved) : [];
  });

  // Offers / Promos State
  const [promosList, setPromosList] = useState(() => {
    const saved = localStorage.getItem('im_promos');
    return saved ? JSON.parse(saved) : [
      { code: 'WELCOME10', type: 'percent', value: 10, minPurchase: 0, description: '10% off on all products' },
      { code: 'MAYA300', type: 'flat', value: 300, minPurchase: 1500, description: '₹300 off on orders above ₹1,500' }
    ];
  });

  // Current session user (Supabase simulator)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('im_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Modal Triggers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [checkoutSummary, setCheckoutSummary] = useState(null); // contains prices when checkout is open
  const [successOrder, setSuccessOrder] = useState(null); // stores successful order object to show confirmation screen

  // LocalStorage Persistences
  useEffect(() => {
    localStorage.setItem('im_catalog', JSON.stringify(productsList));
  }, [productsList]);

  useEffect(() => {
    localStorage.setItem('im_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('im_orders', JSON.stringify(ordersList));
  }, [ordersList]);

  useEffect(() => {
    localStorage.setItem('im_promos', JSON.stringify(promosList));
  }, [promosList]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('im_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('im_user');
    }
  }, [currentUser]);

  // Auth simulators
  const handleLogin = (userObj) => {
    setCurrentUser(userObj);
    setIsAuthOpen(false);
  };
  const handleSignup = (userObj) => {
    setCurrentUser(userObj);
    setIsAuthOpen(false);
  };
  const handleLogout = () => {
    setCurrentUser(null);
    setActivePage('home');
  };

  // Cart operations
  const handleAddToCart = (item) => {
    setCartItems(prev => {
      // Check if item with same ID, size, and color is already in cart
      const idx = prev.findIndex(i => 
        i.product.id === item.product.id && 
        i.size === item.size && 
        i.color === item.color
      );
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity += item.quantity;
        return updated;
      }
      return [...prev, item];
    });
    // Automatically slide cart drawer open
    setIsCartOpen(true);
  };

  const handleUpdateQty = (idx, newQty) => {
    if (newQty < 1) return;
    setCartItems(prev => {
      const updated = [...prev];
      updated[idx].quantity = newQty;
      return updated;
    });
  };

  const handleRemoveCartItem = (idx) => {
    setCartItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCheckoutTrigger = (prices) => {
    setIsCartOpen(false);
    setCheckoutSummary(prices);
  };

  // Order Placement Success callback
  const handleOrderSuccess = (orderData) => {
    setOrdersList(prev => [orderData, ...prev]);
    setCartItems([]); // Clear cart
    setCheckoutSummary(null); // Close checkout modal
    setSuccessOrder(orderData); // Triggers success screen
  };

  // Admin adjustments
  const handleAddProduct = (newProd) => {
    setProductsList(prev => [newProd, ...prev]);
  };
  const handleDeleteProduct = (id) => {
    setProductsList(prev => prev.filter(p => p.id !== id));
  };
  const handleUpdateProduct = (updatedProd) => {
    setProductsList(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
  };
  const handleUpdateOrderStatus = (orderId, nextStatus, trackingNum = '') => {
    setOrdersList(prev => prev.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          status: nextStatus,
          trackingNumber: trackingNum || order.trackingNumber || ''
        };
      }
      return order;
    }));
  };

  const handleSearchToggle = () => {
    setActivePage('shop');
    setTimeout(() => {
      const searchBar = document.querySelector('.toolbar-search');
      if (searchBar) searchBar.focus();
    }, 200);
  };

  // User-specific order history
  const userOrderHistory = ordersList.filter(o => o.shippingDetails.name === currentUser?.name || o.shippingDetails.phone === currentUser?.phone || (currentUser && o.shippingDetails.name.toLowerCase().includes(currentUser.email.split('@')[0].toLowerCase())));

  return (
    <>
      <Header 
        activePage={activePage}
        setActivePage={(page) => {
          setActivePage(page);
          setSuccessOrder(null);
          setSelectedProduct(null);
        }}
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
        onProfileClick={() => setIsAuthOpen(true)}
        user={currentUser}
        logout={handleLogout}
        onSearchToggle={handleSearchToggle}
      />

      {/* Main Content Layout routing */}
      <main className="main-content-layout">
        {successOrder ? (
          // Order Confirmation Success Screen
          <div className="order-success-screen container animate-slideUp">
            <div className="success-badge-circle">
              <CheckCircle2 size={48} />
            </div>
            <h1>Your Couture Order is Placed!</h1>
            <p className="order-sub-heading">Thank you for shopping with InibyMaya. Your traditional garment details are logged in our tailoring workshop.</p>
            
            <div className="success-card">
              <div className="card-header">
                <div>
                  <span>Order ID</span>
                  <h3>{successOrder.id}</h3>
                </div>
                <div>
                  <span>Estimated Delivery</span>
                  <h3>
                    {successOrder.items.some(i => i.wantsCustomStitching) 
                      ? '7 to 10 Business Days (Custom Tailored)' 
                      : '3 to 5 Business Days'
                    }
                  </h3>
                </div>
              </div>
              
              <div className="success-items-list">
                {successOrder.items.map((item, idx) => (
                  <div key={idx} className="success-item-row">
                    <img src={item.product.images[0]} alt={item.product.title} />
                    <div className="item-detail-column">
                      <h4>{item.product.title}</h4>
                      <span>Qty: {item.quantity} | Color: {item.color} | Size: {item.size}</span>
                      {item.wantsCustomStitching && (
                        <span className="tailoring-pill">Bespoke Fit Required</span>
                      )}
                    </div>
                    <strong className="item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</strong>
                  </div>
                ))}
              </div>

              <div className="success-totals-box">
                <div className="total-row">
                  <span>Standard Shipping</span>
                  <span>{successOrder.shipping === 0 ? 'FREE' : `₹${successOrder.shipping}`}</span>
                </div>
                <div className="total-row grand">
                  <span>Amount Paid (Razorpay Sim)</span>
                  <span>₹{successOrder.total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="success-shipping-info">
                <div className="info-block">
                  <Truck size={18} />
                  <div>
                    <h5>Shipping To</h5>
                    <p>{successOrder.shippingDetails.name}</p>
                    <p>{successOrder.shippingDetails.address}, {successOrder.shippingDetails.city} - {successOrder.shippingDetails.pincode}</p>
                  </div>
                </div>
                <div className="info-block">
                  <Calendar size={18} />
                  <div>
                    <h5>Status Updates</h5>
                    <p>Tracking notifications will be sent to +91 {successOrder.shippingDetails.phone}.</p>
                  </div>
                </div>
              </div>
            </div>

            <button className="btn-primary back-to-shop-btn" onClick={() => { setSuccessOrder(null); setActivePage('shop'); }}>
              <ArrowLeft size={16} />
              <span>Continue Shopping</span>
            </button>
          </div>
        ) : selectedProduct ? (
          <ProductDetailModal 
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={handleAddToCart}
          />
        ) : activePage === 'home' ? (
          // Home Page
          <>
            <Hero onShopClick={() => setActivePage('shop')} />
            
            {/* Features Info Bar */}
            <section className="features-info-bar container">
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <Sparkles size={24} />
                </div>
                <h4>Luxury Fabrics</h4>
                <p>Curated silk weaves, rich velvets, and handpicked linen threads.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <Scissors size={24} />
                </div>
                <h4>Custom Stitching</h4>
                <p>Provide measurements during checkout. Handcrafted by master tailors.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <Truck size={24} />
                </div>
                <h4>Pan-India Delivery</h4>
                <p>Free standard courier delivery across India on orders above ₹1,500.</p>
              </div>
            </section>

            {/* Bestsellers Spotlight */}
            <section className="bestsellers-spotlight container">
              <div className="section-header-centered">
                <h2>Our Bestselling Couture</h2>
                <p>Explore traditional silhouettes loved by our patrons across the country.</p>
              </div>
              <div className="product-grid">
                {productsList.slice(0, 3).map(product => (
                  <div key={product.id} className="product-card" onClick={() => setSelectedProduct(product)}>
                    <div className="product-card-image-wrapper">
                      <img src={product.images[0]} alt={product.title} className="product-card-image primary-image" />
                      {product.images[1] && <img src={product.images[1]} alt={product.title} className="product-card-image secondary-image" />}
                    </div>
                    <div className="product-card-info">
                      <span className="product-card-category">{product.category}</span>
                      <h3 className="product-card-title">{product.title}</h3>
                      <div className="product-card-price">₹{product.price.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="view-all-row">
                <button className="btn-primary" onClick={() => setActivePage('shop')}>View Entire Collection</button>
              </div>
            </section>
          </>
        ) : activePage === 'shop' ? (
          // Catalog Page
          <ProductGrid 
            products={productsList} 
            onProductClick={(prod) => setSelectedProduct(prod)} 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        ) : activePage === 'admin' ? (
          // Admin Dashboard
          <AdminDashboard 
            products={productsList}
            orders={ordersList}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateProduct={handleUpdateProduct}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            promosList={promosList}
            setPromosList={setPromosList}
          />
        ) : null}
      </main>

      {/* Footer */}
      <footer className="footer-section">
        <div className="footer-container container">
          <div className="footer-column brand-col">
            <h3 className="footer-brand">INIBYMAYA</h3>
            <p className="footer-desc">High-end Indian traditional wear and bespoke custom-tailored apparel for special celebrations and elegant daily comfort.</p>
            <div className="footer-contact">
              <span>Email: care@inibymaya.com</span>
              <span>Phone: +91 98765 43210</span>
            </div>
          </div>
          <div className="footer-column">
            <h4>Boutique Collections</h4>
            <ul>
              <li><button onClick={() => setActivePage('shop')}>Long Kurtas</button></li>
              <li><button onClick={() => setActivePage('shop')}>Anarkali Suits</button></li>
              <li><button onClick={() => setActivePage('shop')}>Straight Kurtis</button></li>
              <li><button onClick={() => setActivePage('shop')}>Plazo & Co-ord Sets</button></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Customer Support</h4>
            <ul>
              <li><button onClick={() => setActivePage('shop')}>About Us</button></li>
              <li><button onClick={() => setIsAuthOpen(true)}>Track Couture Order</button></li>
              <li><button onClick={() => alert('For any assistance, please write to us at care@inibymaya.com')}>Contact Care</button></li>
              <li><button onClick={() => alert('Sizing Guide: Standard sizes from XS to XXL are available. You can also select the Custom Stitching option on any customizable product page to input your custom measurements.')}>Couture Fit Guide</button></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Store Policies</h4>
            <ul>
              <li><button onClick={() => alert('Shipping Policy: We offer free standard delivery across India for orders above ₹1,500. Orders with custom stitching require 7-10 business days for tailoring and delivery.')}>Shipping & Delivery</button></li>
              <li><button onClick={() => alert('Return Policy: Standard size orders can be returned within 14 days of delivery. Bespoke custom-tailored garments are crafted specifically to your measurements and cannot be returned, but we offer free alterations.')}>Returns & Alterations</button></li>
              <li><button onClick={() => alert('Privacy Policy: Your data and measurements are securely stored in our private database and never shared with third parties.')}>Privacy Policy</button></li>
              <li><button onClick={() => alert('Terms of Service: By placing an order, you agree to our tailoring and shipping timelines. Sizing details entered must be accurate.')}>Terms of Service</button></li>
            </ul>
          </div>
        </div>
        <div className="footer-copyright">
          <p>© 2026 InibyMaya Couture. All rights reserved. Crafting premium heritage silhouettes.</p>
        </div>
      </footer>

      {/* MODALS */}

      {/* 1. Slide Out Cart Drawer */}
      {isCartOpen && (
        <CartDrawer 
          cartItems={cartItems}
          onClose={() => setIsCartOpen(false)}
          onUpdateQty={handleUpdateQty}
          onRemoveItem={handleRemoveCartItem}
          onCheckoutClick={handleCheckoutTrigger}
          promosList={promosList}
        />
      )}

      {/* 3. Auth Modal (Supabase simulator) */}
      {isAuthOpen && (
        <AuthModal 
          user={currentUser}
          login={handleLogin}
          signup={handleSignup}
          logout={handleLogout}
          onClose={() => setIsAuthOpen(false)}
          orderHistory={userOrderHistory}
        />
      )}

      {/* 4. Checkout Modal (Razorpay simulation) */}
      {checkoutSummary && (
        <CheckoutModal 
          cartItems={cartItems}
          priceSummary={checkoutSummary}
          onClose={() => setCheckoutSummary(null)}
          onOrderSuccess={handleOrderSuccess}
          user={currentUser}
        />
      )}
    </>
  );
}
