import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, TrendingUp, ArrowRight } from 'lucide-react';

export default function SearchOverlay({ isOpen, onClose, products = [], onProductClick, onViewAll }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    if (!query.trim() || query.trim().length < 2) return [];
    const q = query.toLowerCase().trim();
    return products
      .filter(p =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.occasion || '').toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [query, products]);

  const trending = useMemo(() => {
    return products.filter(p => p.bestSeller || p.newArrival).slice(0, 5);
  }, [products]);

  if (!isOpen) return null;

  const handleProductSelect = (product) => {
    onProductClick(product);
    onClose();
  };

  const handleViewAll = () => {
    if (query.trim()) onViewAll(query.trim());
    onClose();
  };

  return (
    <div className="search-overlay-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="search-overlay-panel">
        <div className="search-overlay-input-row">
          <Search size={20} className="search-overlay-icon" />
          <input
            ref={inputRef}
            type="text"
            className="search-overlay-input"
            placeholder="Search products, styles, occasions..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && query.trim().length >= 2) handleViewAll();
            }}
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button className="search-overlay-clear" onClick={() => setQuery('')} aria-label="Clear search">
              <X size={18} />
            </button>
          )}
          <button className="search-overlay-close-btn" onClick={onClose} aria-label="Close search">
            <span>ESC</span>
          </button>
        </div>

        <div className="search-overlay-body">
          {query.trim().length >= 2 ? (
            results.length > 0 ? (
              <>
                <div className="search-results-label">
                  {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;<strong>{query}</strong>&rdquo;
                </div>
                <div className="search-results-list">
                  {results.map(product => (
                    <button
                      key={product.id}
                      className="search-result-item"
                      onClick={() => handleProductSelect(product)}
                    >
                      <div className="search-result-img-wrap">
                        <img
                          src={product.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=200'}
                          alt={product.title}
                          className="search-result-img"
                          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=200'; }}
                        />
                      </div>
                      <div className="search-result-info">
                        <span className="search-result-title">{product.title}</span>
                        <span className="search-result-meta">{product.category} &middot; {product.occasion}</span>
                      </div>
                      <div className="search-result-right">
                        <span className="search-result-price">&#8377;{Number(product.price).toLocaleString('en-IN')}</span>
                        <ArrowRight size={14} className="search-result-arrow" />
                      </div>
                    </button>
                  ))}
                </div>
                <button className="search-view-all-btn" onClick={handleViewAll}>
                  View all results for &ldquo;{query}&rdquo;
                  <ArrowRight size={15} />
                </button>
              </>
            ) : (
              <div className="search-no-results">
                <Search size={40} style={{ opacity: 0.18 }} />
                <p>No products found for &ldquo;<strong>{query}</strong>&rdquo;</p>
                <span>Try different keywords or browse our categories.</span>
              </div>
            )
          ) : (
            trending.length > 0 && (
              <>
                <div className="search-results-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <TrendingUp size={14} />
                  Trending Now
                </div>
                <div className="search-results-list">
                  {trending.map(product => (
                    <button
                      key={product.id}
                      className="search-result-item"
                      onClick={() => handleProductSelect(product)}
                    >
                      <div className="search-result-img-wrap">
                        <img
                          src={product.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=200'}
                          alt={product.title}
                          className="search-result-img"
                          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=200'; }}
                        />
                      </div>
                      <div className="search-result-info">
                        <span className="search-result-title">{product.title}</span>
                        <span className="search-result-meta">{product.category} &middot; {product.occasion}</span>
                      </div>
                      <div className="search-result-right">
                        <span className="search-result-price">&#8377;{Number(product.price).toLocaleString('en-IN')}</span>
                        {product.bestSeller && <span className="search-result-badge">Best Seller</span>}
                        {product.newArrival && !product.bestSeller && <span className="search-result-badge new">New</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
}
