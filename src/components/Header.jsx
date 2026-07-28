import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, User, Settings, LogOut, Menu, X, Heart } from 'lucide-react';

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
  onFavoritesClick
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY || window.pageYOffset || 0;
      if (currentScroll > 60) {
        setIsScrolled(true);
      } else if (currentScroll < 20) {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        {/* Left Side Navigation / Menu */}
        <div className="header-left">
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

        {/* Brand Logo */}
        <div className="brand-logo" onClick={() => setActivePage('home')}>
          <img src="/logo.png" alt="INI By Maya" className="brand-logo-img" />
        </div>

        {/* Actions */}
        <div className="header-actions">
          <button className="action-btn" onClick={onSearchToggle} aria-label="Search">
            <Search size={20} />
          </button>

          {user ? (
            <div className="user-profile-menu">
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
            <button className="action-btn" onClick={onProfileClick} aria-label="Login">
              <User size={20} />
            </button>
          )}

          <button className={`action-btn favorites-btn ${activePage === 'favorites' ? 'active' : ''}`} onClick={onFavoritesClick} aria-label="Favorites" title="My Wishlist">
            <Heart size={20} />
            {favoritesCount > 0 && <span className="favorites-badge">{favoritesCount}</span>}
          </button>

          <button className="action-btn cart-btn" onClick={onCartClick} aria-label="Cart">
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
  );
}
