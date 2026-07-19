import React, { useState, useMemo, useEffect } from 'react';
import ProductCard from './ProductCard';
import { SlidersHorizontal, Search, X, Check } from 'lucide-react';

export default function ProductGrid({ 
  products, 
  onProductClick, 
  searchQuery, 
  setSearchQuery, 
  selectedSize, 
  setSelectedSize 
}) {
  // Multiple Filter States
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [minPrice, setMinPrice] = useState(1000);
  const [maxPrice, setMaxPrice] = useState(6000);
  const [sortBy, setSortBy] = useState('featured');
  
  // Mobile Filter Drawer Toggle
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync preselectedSize prop from homepage banner
  useEffect(() => {
    if (selectedSize) {
      setSelectedSizes(prev => prev.includes(selectedSize) ? prev : [...prev, selectedSize]);
    }
  }, [selectedSize]);

  // Extract all categories dynamically from the loaded products catalog
  const categories = useMemo(() => {
    const set = new Set(products.map(p => p.category));
    return Array.from(set).filter(Boolean);
  }, [products]);

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
    setMinPrice(1000);
    setMaxPrice(6000);
    setSearchQuery('');
    setSelectedSize(null);
  };

  // Filtered and Sorted products computed cache
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Categories Filter (Multiple Select)
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category));
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
    result = result.filter(p => p.price >= minPrice && p.price <= maxPrice);

    // 5. Search Box query filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        (p.occasion && p.occasion.toLowerCase().includes(q))
      );
    }

    // 6. Sort Switchees
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
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
      maxPrice < 6000 ||
      minPrice > 1000 ||
      searchQuery.trim() !== ''
    );
  }, [selectedCategories, selectedColors, selectedSizes, minPrice, maxPrice, searchQuery]);

  return (
    <div className="shop-section container">
      {/* Search Header Banner */}
      <div className="shop-header animate-fadeIn">
        <h2 className="section-title">The Boutique Collections</h2>
        <p className="section-description">Browse handcrafted traditional wear tailored to fit you perfectly.</p>
      </div>

      {/* Mobile Toggle Button */}
      <div className="mobile-filter-toolbar">
        <button 
          className={`mobile-filter-toggle-btn ${showMobileFilters ? 'active' : ''}`}
          onClick={() => setShowMobileFilters(!showMobileFilters)}
        >
          <SlidersHorizontal size={15} />
          <span>{showMobileFilters ? 'Hide Filter Options' : 'Filter Options'}</span>
        </button>
      </div>

      {/* Main Side-by-Side Shop Grid Layout */}
      <div className="shop-grid-layout">
        
        {/* Left Column: Filter Sidebar Panel */}
        <aside className={`filter-sidebar-panel ${showMobileFilters ? 'mobile-visible' : ''}`}>
          <div className="sidebar-sticky-wrap">
            <div className="sidebar-title-row">
              <h3>Filter Options</h3>
              {hasActiveFilters && (
                <button className="sidebar-clear-link" onClick={handleClearAll}>
                  Clear All
                </button>
              )}
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
                  min={1000} 
                  max={6000} 
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
          </div>
        </aside>

        {/* Right Column: Catalog Content Panel */}
        <div className="catalog-content-panel">
          
          {/* Top Row: Toolbar Summary & Sort selection */}
          <div className="catalog-toolbar-row">
            <span className="showing-results-count">
              Showing 1–{filteredProducts.length} of {products.length} results
            </span>

            <div className="catalog-toolbar-right">
              {/* Search Bar inside Toolbar */}
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
                  onProductClick={(prod, size) => {
                    if (setSelectedSize) {
                      setSelectedSize(size);
                    }
                    onProductClick(prod);
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
