import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, User, Settings, LogOut, Menu, X } from 'lucide-react';

export default function Header({ 
  activePage, 
  setActivePage, 
  cartCount, 
  onCartClick, 
  onProfileClick, 
  user, 
  logout, 
  onSearchToggle 
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
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
              className={`nav-link ${activePage === 'long-kurtas' ? 'active' : ''}`} 
              onClick={() => setActivePage('shop')}
            >
              Long Kurtas
            </button>
            <button 
              className={`nav-link ${activePage === 'anarkali' ? 'active' : ''}`} 
              onClick={() => setActivePage('shop')}
            >
              Anarkali
            </button>
          </nav>
        </div>

        {/* Brand Logo */}
        <div className="brand-logo" onClick={() => setActivePage('home')}>
          INIBYMAYA
          <span>COUTURE</span>
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
                <span className="user-name-label">{user.email.split('@')[0]}</span>
              </button>
              {user.email === 'tharanichandrasekaran2000@gmail.com' && (
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
              <div className="brand-logo">INIBYMAYA</div>
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
                onClick={() => { setActivePage('shop'); setMobileMenuOpen(false); }}
                className="category-btn"
              >
                Long Kurtas
              </button>
              <button 
                onClick={() => { setActivePage('shop'); setMobileMenuOpen(false); }}
                className="category-btn"
              >
                Anarkali Suits
              </button>
              {user && user.email === 'tharanichandrasekaran2000@gmail.com' && (
                <button 
                  onClick={() => { setActivePage('admin'); setMobileMenuOpen(false); }}
                  className={activePage === 'admin' ? 'active' : ''}
                >
                  Admin Panel
                </button>
              )}
              {user ? (
                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="mobile-logout">
                  Logout ({user.email})
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
