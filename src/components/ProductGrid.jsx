import React, { useState, useMemo, useEffect } from 'react';
import ProductCard from './ProductCard';
import { SlidersHorizontal, Search, X, Check } from 'lucide-react';

export default function ProductGrid({ 
  products, 
  onProductClick, 
  onQuickViewClick,
  searchQuery, 
  setSearchQuery, 
  selectedSize, 
  setSelectedSize,
  favorites = [],
  onToggleFavorite,
  initialCategory,
  onClearInitialCategory,
  boutiqueSettings
}) {
  // Dynamic price range calculation from catalog
  const catalogMaxPrice = useMemo(() => {
    if (!products || products.length === 0) return 10000;
    const maxP = Math.max(...products.map(p => Number(p.price) || 0));
    return Math.max(10000, maxP);
  }, [products]);

  // Multiple Filter States
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(25000);
  const [sortBy, setSortBy] = useState('featured');
  
  // Mobile Filter Drawer Toggle
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync maxPrice if catalog contains higher priced items
  useEffect(() => {
    if (catalogMaxPrice > maxPrice) {
      setMaxPrice(catalogMaxPrice);
    }
  }, [catalogMaxPrice]);

  // Sync preselectedSize prop from homepage banner
  useEffect(() => {
    if (selectedSize) {
      setSelectedSizes(prev => prev.includes(selectedSize) ? prev : [...prev, selectedSize]);
    }
  }, [selectedSize]);

  // Extract all categories dynamically from Admin panel settings + active products catalog
  const categories = useMemo(() => {
    let adminCats = [];
    if (boutiqueSettings && boutiqueSettings.categories) {
      try {
        const parsed = typeof boutiqueSettings.categories === 'string' 
          ? JSON.parse(boutiqueSettings.categories) 
          : boutiqueSettings.categories;
        if (Array.isArray(parsed) && parsed.length > 0) {
          adminCats = parsed.map(c => {
            const val = typeof c === 'string' ? c : (c.name || c.filter);
            if (val && (val.toLowerCase() === 'kurti' || val.toLowerCase() === 'kurtas')) return 'Long Kurti';
            return val;
          }).filter(Boolean);
        }
      } catch (e) {}
    }

    const rawList = adminCats.length > 0
      ? ['New Arrivals', ...adminCats]
      : ['New Arrivals', ...new Set(products.map(p => {
          const val = p.category;
          if (val && (val.toLowerCase() === 'kurti' || val.toLowerCase() === 'kurtas')) return 'Long Kurti';
          return val;
        }))];

    const set = new Set(rawList.filter(Boolean));
    return Array.from(set);
  }, [products, boutiqueSettings]);

  // Sync initialCategory prop from parent (e.g. clicking category card from homepage)
  useEffect(() => {
    if (initialCategory) {
      let target = initialCategory.trim();
      if (target.toLowerCase() === 'kurti' || target.toLowerCase() === 'kurtas') {
        target = 'Long Kurti';
      }

      // Match exact case from categories list if available
      const match = categories.find(c => c.toLowerCase().trim() === target.toLowerCase());
      setSelectedCategories([match || target]);
    }
  }, [initialCategory, categories]);

  // Extract all unique color swatches and values dynamically
  const allColors = useMemo(() => {
    const map = new Map();
    products.forEach(p => {
      if (p.variants && p.variants.colors) {
        p.variants.colors.forEach(c => {
          if (c.name && c.hex) {
            map.set(c.name, c.hex);
          }
        });
      }
    });
    return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
  }, [products]);

  // Standard couture size guide items
  const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // Toggle helpers
  const handleCategoryToggle = (cat) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleColorToggle = (colorName) => {
    setSelectedColors(prev => 
      prev.includes(colorName) ? prev.filter(c => c !== colorName) : [...prev, colorName]
    );
  };

  const handleSizeToggle = (size) => {
    setSelectedSizes(prev => {
      const next = prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size];
      // Sync back to top-level size prop if cleared or changed
      if (selectedSize && !next.includes(selectedSize)) {
        setSelectedSize(null);
      }
      return next;
    });
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setMinPrice(0);
    setMaxPrice(catalogMaxPrice);
    setSearchQuery('');
    setSelectedSize(null);
    if (onClearInitialCategory) onClearInitialCategory();
  };

  // Filtered and Sorted products computed cache
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Categories & Occasions Filter (Exact Category Match)
    if (selectedCategories.length > 0) {
      result = result.filter(p => {
        const pCat = (p.category || '').toLowerCase().trim();
        const pOcc = (p.occasion || '').toLowerCase().trim();

        const matchesCategory = selectedCategories.some(sc => {
          const scLower = sc.toLowerCase().trim();
          return pCat === scLower || (pCat.includes(scLower) && scLower.length > 4 && pCat.length > 4);
        });

        const matchesOccasion = selectedCategories.some(sc => {
          const scLower = sc.toLowerCase().trim();
          return pOcc === scLower;
        });

        const matchesNewArrival = selectedCategories.some(c => 
          (c.toLowerCase().includes('new arrival') || c.toLowerCase().includes('new arrivals')) && Boolean(p.newArrival)
        );

        return matchesCategory || matchesOccasion || matchesNewArrival;
      });
    }

    // 2. Colors Filter (Multiple Select)
    if (selectedColors.length > 0) {
      result = result.filter(p => {
        if (!p.variants || !p.variants.colors) return false;
        return p.variants.colors.some(c => selectedColors.includes(c.name));
      });
    }

    // 3. Sizes Filter (Multiple Select)
    if (selectedSizes.length > 0) {
      result = result.filter(p => {
        if (!p.variants || !p.variants.sizes) return false;
        return p.variants.sizes.some(s => selectedSizes.includes(s));
      });
    }

    // 4. Price Slider Filter
    result = result.filter(p => {
      const priceNum = Number(p.price) || 0;
      return priceNum >= minPrice && priceNum <= maxPrice;
    });

    // 5. Search Box query filter
    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const filtered = result.filter(p => {
        const titleMatch = p.title ? p.title.toLowerCase().includes(q) : false;
        const catMatch = p.category ? p.category.toLowerCase().includes(q) : false;
        const descMatch = p.description ? p.description.toLowerCase().includes(q) : false;
        const occMatch = p.occasion ? p.occasion.toLowerCase().includes(q) : false;
        return titleMatch || catMatch || descMatch || occMatch;
      });
      // If search query matched items, return them! Otherwise if 0 matched, return all products so mobile users are never stuck on empty screen!
      if (filtered.length > 0) {
        result = filtered;
      }
    }

    // 6. Sort Switchees
    if (sortBy === 'price-low') {
      result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    } else if (sortBy === 'featured') {
      result.sort((a, b) => (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0));
    }

    return result;
  }, [products, selectedCategories, selectedColors, selectedSizes, minPrice, maxPrice, searchQuery, sortBy]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      selectedCategories.length > 0 ||
      selectedColors.length > 0 ||
      selectedSizes.length > 0 ||
      minPrice > 0 ||
      maxPrice < catalogMaxPrice ||
      (searchQuery && searchQuery.trim() !== '')
    );
  }, [selectedCategories, selectedColors, selectedSizes, minPrice, maxPrice, catalogMaxPrice, searchQuery]);

  return (
    <div className="shop-section container">
      {/* Search Header Banner */}
      <div className="shop-header animate-fadeIn">
        <h2 className="section-title">The Boutique Collections</h2>
        <p className="section-description">Browse handcrafted traditional wear tailored to fit you perfectly.</p>
      </div>

      {/* Mobile Filter Drawer Backdrop */}
      {showMobileFilters && (
        <div 
          className="mobile-filter-overlay" 
          onClick={() => setShowMobileFilters(false)}
        />
      )}

      <div className="shop-grid-layout">
        {/* Left Column: Filter Sidebar */}
        <aside className={`filter-sidebar-panel ${showMobileFilters ? 'mobile-visible' : ''}`}>
          <div className="sidebar-title-row">
            <h3>Filters</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {hasActiveFilters && (
                <button className="sidebar-clear-link" onClick={handleClearAll}>
                  Clear All
                </button>
              )}
              <button 
                className="close-drawer-btn" 
                onClick={() => setShowMobileFilters(false)}
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
            </div>
          </div>

            {/* Category Filter Widget */}
            <div className="filter-section-widget">
              <h4 className="filter-widget-title">Category</h4>
              <div className="filter-checkbox-list">
                {categories.map(cat => (
                  <label key={cat} className="filter-checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={selectedCategories.includes(cat)}
                      onChange={() => handleCategoryToggle(cat)}
                      className="filter-checkbox"
                    />
                    <span className="checkbox-custom-box"></span>
                    <span className="filter-checkbox-text">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price range filter widget */}
            <div className="filter-section-widget">
              <h4 className="filter-widget-title">Price Range</h4>
              <div className="price-slider-wrapper">
                <input 
                  type="range" 
                  min={0} 
                  max={catalogMaxPrice} 
                  step={100}
                  value={maxPrice} 
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="price-range-slider"
                />
                <div className="price-range-indicator">
                  <span>Up to: <strong>₹{maxPrice}</strong></span>
                </div>
              </div>
            </div>

            {/* Color Swatch Filter Widget */}
            <div className="filter-section-widget">
              <h4 className="filter-widget-title">Color</h4>
              <div className="filter-color-list">
                {allColors.map(color => {
                  const isActive = selectedColors.includes(color.name);
                  return (
                    <button
                      key={color.name}
                      className={`filter-color-row ${isActive ? 'active' : ''}`}
                      onClick={() => handleColorToggle(color.name)}
                    >
                      <span 
                        className="color-dot-indicator" 
                        style={{ backgroundColor: color.hex }}
                      >
                        {isActive && <Check size={10} className="active-check-icon" />}
                      </span>
                      <span className="color-name-label">{color.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Filter Widget */}
            <div className="filter-section-widget">
              <h4 className="filter-widget-title">Size</h4>
              <div className="filter-checkbox-list">
                {allSizes.map(size => (
                  <label key={size} className="filter-checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={selectedSizes.includes(size)}
                      onChange={() => handleSizeToggle(size)}
                      className="filter-checkbox"
                    />
                    <span className="checkbox-custom-box"></span>
                    <span className="filter-checkbox-text">{size}</span>
                  </label>
                ))}
              </div>
            </div>
        </aside>

        {/* Right Column: Catalog Content Panel */}
        <div className="catalog-content-panel">
          
          {/* Top Row: Toolbar Summary & Sort selection */}
          <div className="catalog-toolbar-row">
            {/* Search Bar inside Toolbar (positioned on top on mobile, inline on desktop) */}
            <div className="toolbar-search-box-wrap">
              <Search className="search-icon" size={14} />
              <input
                type="text"
                placeholder="Search outfits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="toolbar-search-input"
              />
            </div>

            <div className="catalog-toolbar-right">
              {/* Filter toggle button (only visible on mobile, positioned on left side) */}
              <button 
                className={`mobile-filter-toggle-btn ${showMobileFilters ? 'active' : ''}`}
                onClick={() => setShowMobileFilters(!showMobileFilters)}
              >
                <SlidersHorizontal size={14} />
                <span>{showMobileFilters ? 'Hide Filters' : 'Filter Options'}</span>
              </button>

              {/* Sorting select */}
              <div className="sort-selector-wrap">
                <SlidersHorizontal size={14} className="sort-icon-indicator" />
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select-menu"
                >
                  <option value="featured">Default Sorting</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Sort by: Top Rated</option>
                </select>
              </div>
            </div>

            <div className="toolbar-results-row">
              <span className="showing-results-count">
                Showing 1–{filteredProducts.length} of {products.length} results
              </span>
            </div>
          </div>

          {/* Active Chips Tag Row */}
          {hasActiveFilters && (
            <div className="active-filters-chips-row animate-fadeIn">
              <span className="active-filters-label">Active Filters:</span>
              
              <div className="chips-list-wrap">
                {/* Categories tags */}
                {selectedCategories.map(cat => (
                  <div key={cat} className="active-filter-chip">
                    <span>{cat}</span>
                    <button onClick={() => handleCategoryToggle(cat)}>
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {/* Colors tags */}
                {selectedColors.map(color => (
                  <div key={color} className="active-filter-chip">
                    <span>{color}</span>
                    <button onClick={() => handleColorToggle(color)}>
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {/* Sizes tags */}
                {selectedSizes.map(size => (
                  <div key={size} className="active-filter-chip">
                    <span>Size: {size}</span>
                    <button onClick={() => handleSizeToggle(size)}>
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {/* Price tag */}
                {maxPrice < 6000 && (
                  <div className="active-filter-chip">
                    <span>Under ₹{maxPrice}</span>
                    <button onClick={() => setMaxPrice(6000)}>
                      <X size={12} />
                    </button>
                  </div>
                )}

                {/* Min Price tag */}
                {minPrice > 1000 && (
                  <div className="active-filter-chip">
                    <span>Over ₹{minPrice}</span>
                    <button onClick={() => setMinPrice(1000)}>
                      <X size={12} />
                    </button>
                  </div>
                )}

                {/* Search tag */}
                {searchQuery.trim() !== '' && (
                  <div className="active-filter-chip">
                    <span>Search: "{searchQuery}"</span>
                    <button onClick={() => setSearchQuery('')}>
                      <X size={12} />
                    </button>
                  </div>
                )}

                {/* Clear All action button */}
                <button className="clear-all-chips-btn" onClick={handleClearAll}>
                  Clear All
                </button>
              </div>
            </div>
          )}

          {/* Product Results list */}
          {filteredProducts.length > 0 ? (
            <div className="catalog-products-grid animate-slideUp">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  isFavorite={favorites.includes(product.id)}
                  onToggleFavorite={onToggleFavorite}
                  onProductClick={(prod) => onProductClick(prod)}
                  onQuickViewClick={(prod, size) => {
                    if (setSelectedSize && size) {
                      setSelectedSize(size);
                    }
                    if (onQuickViewClick) {
                      onQuickViewClick(prod, size);
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="no-catalog-results-card">
              <h3>No ethnic creations match your active filters.</h3>
              <p>Try resetting some parameters or adjusting the price range selectors.</p>
              <button className="btn-primary" onClick={handleClearAll}>
                Reset Filter Settings
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
