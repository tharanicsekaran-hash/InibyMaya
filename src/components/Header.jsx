import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ShoppingBag, User, Settings, LogOut, Menu, X, Heart, ArrowRight, TrendingUp } from 'lucide-react';

export default function Header({ 
  activePage, 
  setActivePage, 
  onCustomTailoringClick,
  onAboutClick,
  cartCount, 
  onCartClick, 
  onProfileClick, 
  user, 
  logout, 
  onSearchToggle,
  favoritesCount = 0,
  onFavoritesClick,
  boutiqueSettings = {},
  products = [],
  onProductClick,
  onViewAll
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  const announcementEnabled = boutiqueSettings?.headerBannerEnabled !== false;
  const announcementText = boutiqueSettings?.headerBannerText || 'FREE SHIPPING PAN INDIA';
  const announcementBg = boutiqueSettings?.headerBannerBg || '#f6f0e6';
  const announcementColor = boutiqueSettings?.headerBannerColor || '#333333';

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY || window.pageYOffset || 0;
      if (currentScroll > 60) setIsScrolled(true);
      else if (currentScroll < 20) setIsScrolled(false);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 80);
    } else {
      setSearchQuery('');
    }
  }, [searchOpen]);

  // Close on Escape, click outside
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setSearchOpen(false); };
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    if (searchOpen) {
      document.addEventListener('keydown', handleKey);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchOpen]);

  // Live search results
  const results = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return [];
    const q = searchQuery.toLowerCase().trim();
    return products
      .filter(p =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.occasion || '').toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [searchQuery, products]);

  // Trending / popular products
  const trending = useMemo(() => {
    return products.filter(p => p.bestSeller || p.newArrival).slice(0, 4);
  }, [products]);

  const handleOpenSearch = () => {
    setSearchOpen(true);
    if (onSearchToggle) onSearchToggle();
  };

  const handleCloseSearch = () => {
    setSearchOpen(false);
  };

  const handleProductSelect = (product) => {
    setSearchOpen(false);
    if (onProductClick) onProductClick(product);
  };

  const handleViewAllResults = () => {
    setSearchOpen(false);
    if (onViewAll) onViewAll(searchQuery.trim());
  };

  const showDropdown = searchOpen && (searchQuery.trim().length >= 2 ? results.length >= 0 : trending.length > 0);

  return (
    <>
      {/* Top Announcement Bar */}
      {announcementEnabled && (
        <div 
          className="top-announcement-bar" 
          style={{ 
            backgroundColor: announcementBg, 
            color: announcementColor,
            padding: '7px 16px',
            textAlign: 'center',
            fontSize: '11.5px',
            fontWeight: '600',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            borderBottom: '1px solid rgba(0,0,0,0.04)'
          }}
        >
          <span>{announcementText}</span>
        </div>
      )}

      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          {/* Left Side Navigation / Menu */}
          <div className={`header-left ${searchOpen ? 'search-active-hide' : ''}`}>
            {/* Mobile Menu Toggle */}
            <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={22} />
            </button>

            {/* Navigation Links (Desktop) */}
            <nav className="desktop-nav">
              <button 
                className={`nav-link ${activePage === 'home' ? 'active' : ''}`} 
                onClick={() => setActivePage('home')}
              >
                Home
              </button>
              <button 
                className={`nav-link ${activePage === 'shop' ? 'active' : ''}`} 
                onClick={() => setActivePage('shop')}
              >
                Shop All
              </button>
              <button 
                className="nav-link" 
                onClick={() => {
                  if (onCustomTailoringClick) onCustomTailoringClick();
                  else setActivePage('shop');
                }}
              >
                Custom Tailoring
              </button>
              <button 
                className="nav-link" 
                onClick={() => {
                  if (onAboutClick) onAboutClick();
                  else setActivePage('info');
                }}
              >
                Our Story
              </button>
            </nav>
          </div>

          {/* Brand Logo — hidden when search is open */}
          <div className={`brand-logo ${searchOpen ? 'search-active-hide' : ''}`} onClick={() => setActivePage('home')}>
            <img src="/logo.png" alt="INI By Maya" className="brand-logo-img" />
          </div>

          {/* Search Bar + Actions */}
          <div className="header-actions">

            {/* Inline Expanding Search */}
            <div
              ref={searchContainerRef}
              className={`header-search-wrap ${searchOpen ? 'open' : ''}`}
            >
              {/* Search Input (visible when open) */}
              <div className="header-search-bar">
                <Search size={17} className="header-search-bar-icon" />
                <input
                  ref={searchInputRef}
                  type="text"
                  className="header-search-input"
                  placeholder="Search products, styles..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && searchQuery.trim().length >= 2) handleViewAllResults();
                  }}
                  autoComplete="off"
                  spellCheck={false}
                  aria-label="Search"
                />
                {searchQuery && (
                  <button className="header-search-clear" onClick={() => setSearchQuery('')} aria-label="Clear">
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Search Toggle Icon Button (visible when closed) */}
              <button
                className={`action-btn header-search-icon-btn ${searchOpen ? 'hidden' : ''}`}
                onClick={handleOpenSearch}
                aria-label="Open search"
              >
                <Search size={20} />
              </button>

              {/* Close button (visible when open) */}
              {searchOpen && (
                <button className="action-btn header-search-close-btn" onClick={handleCloseSearch} aria-label="Close search">
                  <X size={18} />
                </button>
              )}

              {/* Live Results Dropdown */}
              {showDropdown && (
                <div className="header-search-dropdown">
                  {searchQuery.trim().length >= 2 ? (
                    results.length > 0 ? (
                      <>
                        <div className="hsd-label">{results.length} result{results.length !== 1 ? 's' : ''} for "<strong>{searchQuery}</strong>"</div>
                        <div className="hsd-list">
                          {results.map(product => (
                            <button key={product.id} className="hsd-item" onClick={() => handleProductSelect(product)}>
                              <div className="hsd-img-wrap">
                                <img
                                  src={product.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=100'}
                                  alt={product.title}
                                  className="hsd-img"
                                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=100'; }}
                                />
                              </div>
                              <div className="hsd-info">
                                <span className="hsd-title">{product.title}</span>
                                <span className="hsd-meta">{product.category}</span>
                              </div>
                              <span className="hsd-price">&#8377;{Number(product.price).toLocaleString('en-IN')}</span>
                            </button>
                          ))}
                        </div>
                        <button className="hsd-view-all" onClick={handleViewAllResults}>
                          View all results <ArrowRight size={13} />
                        </button>
                      </>
                    ) : (
                      <div className="hsd-empty">
                        <Search size={22} style={{ opacity: 0.2 }} />
                        <span>No results for "<strong>{searchQuery}</strong>"</span>
                      </div>
                    )
                  ) : (
                    trending.length > 0 && (
                      <>
                        <div className="hsd-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <TrendingUp size={12} /> Trending Now
                        </div>
                        <div className="hsd-list">
                          {trending.map(product => (
                            <button key={product.id} className="hsd-item" onClick={() => handleProductSelect(product)}>
                              <div className="hsd-img-wrap">
                                <img
                                  src={product.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=100'}
                                  alt={product.title}
                                  className="hsd-img"
                                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=100'; }}
                                />
                              </div>
                              <div className="hsd-info">
                                <span className="hsd-title">{product.title}</span>
                                <span className="hsd-meta">{product.category}</span>
                              </div>
                              <div className="hsd-right">
                                <span className="hsd-price">&#8377;{Number(product.price).toLocaleString('en-IN')}</span>
                                {product.bestSeller && <span className="hsd-badge">Best Seller</span>}
                                {product.newArrival && !product.bestSeller && <span className="hsd-badge new">New</span>}
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    )
                  )}
                </div>
              )}
            </div>

            {/* User / Auth */}
            {user ? (
              <div className={`user-profile-menu ${searchOpen ? 'search-active-hide' : ''}`}>
                <button className="action-btn user-btn" onClick={onProfileClick} aria-label="Profile">
                  <User size={20} />
                  <span className="user-name-label">{user.name || user.email.split('@')[0]}</span>
                </button>
                {user?.email && ['inibymaya@gmail.com', 'inibymaya2026@gmail.com', 'tharanichandrasekaran2000@gmail.com', 'care@inibymaya.com'].includes(user.email.toLowerCase().trim()) && (
                  <button 
                    className={`action-btn admin-btn ${activePage === 'admin' ? 'active' : ''}`} 
                    onClick={() => setActivePage('admin')} 
                    title="Admin Dashboard"
                  >
                    <Settings size={20} />
                  </button>
                )}
                <button className="action-btn logout-btn" onClick={logout} title="Logout">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button className={`action-btn ${searchOpen ? 'search-active-hide' : ''}`} onClick={onProfileClick} aria-label="Login">
                <User size={20} />
              </button>
            )}

            <button
              className={`action-btn favorites-btn ${activePage === 'favorites' ? 'active' : ''} ${searchOpen ? 'search-active-hide' : ''}`}
              onClick={onFavoritesClick}
              aria-label="Favorites"
              title="My Wishlist"
            >
              <Heart size={20} />
              {favoritesCount > 0 && <span className="favorites-badge">{favoritesCount}</span>}
            </button>

            <button
              className={`action-btn cart-btn ${searchOpen ? 'search-active-hide' : ''}`}
              onClick={onCartClick}
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Navigation */}
        {mobileMenuOpen && (
          <>
            <div className="mobile-nav-overlay" onClick={() => setMobileMenuOpen(false)}></div>
            <div className="mobile-nav-drawer">
              <div className="drawer-header">
                <div className="brand-logo" onClick={() => { setActivePage('home'); setMobileMenuOpen(false); }}>
                  <img src="/logo.png" alt="INI By Maya" className="brand-logo-img" style={{ height: '44px', width: 'auto' }} />
                </div>
                <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                  <X size={24} />
                </button>
              </div>
              <nav className="mobile-nav-links">
                <button 
                  onClick={() => { setActivePage('home'); setMobileMenuOpen(false); }}
                  className={activePage === 'home' ? 'active' : ''}
                >
                  Home
                </button>
                <button 
                  onClick={() => { setActivePage('shop'); setMobileMenuOpen(false); }}
                  className={activePage === 'shop' ? 'active' : ''}
                >
                  Shop All
                </button>
                <button 
                  onClick={() => { 
                    if (onCustomTailoringClick) onCustomTailoringClick();
                    else setActivePage('shop');
                    setMobileMenuOpen(false); 
                  }}
                  className="mobile-submenu-item"
                >
                  Custom Tailoring
                </button>
                <button 
                  onClick={() => { 
                    if (onAboutClick) onAboutClick();
                    else setActivePage('info');
                    setMobileMenuOpen(false); 
                  }}
                  className="mobile-submenu-item"
                >
                  Our Story
                </button>
                {user?.email && ['inibymaya@gmail.com', 'inibymaya2026@gmail.com', 'tharanichandrasekaran2000@gmail.com', 'care@inibymaya.com'].includes(user.email.toLowerCase().trim()) && (
                  <button 
                    onClick={() => { setActivePage('admin'); setMobileMenuOpen(false); }}
                    className={activePage === 'admin' ? 'active' : ''}
                  >
                    Admin Panel
                  </button>
                )}
                {user ? (
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="mobile-logout">
                    Logout ({user.name || user.email})
                  </button>
                ) : (
                  <button onClick={() => { onProfileClick(); setMobileMenuOpen(false); }}>
                    Login / Register
                  </button>
                )}
              </nav>
            </div>
          </>
        )}
      </header>
    </>
  );
}
