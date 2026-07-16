import React, { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import { SlidersHorizontal, Grid, List, Search } from 'lucide-react';

export default function ProductGrid({ products, onProductClick, searchQuery, setSearchQuery, selectedSize, setSelectedSize }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');

  // Categories list
  const categories = useMemo(() => {
    const list = new Set(products.map(p => p.category));
    return ['All', ...list];
  }, [products]);

  // Thumbnail picker for categories
  const getCategoryThumbnail = (cat) => {
    if (cat === 'All') {
      const bestseller = products.find(p => p.bestSeller) || products[0];
      return bestseller?.images[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=100&h=100';
    }
    const matched = products.find(p => p.category === cat);
    return matched?.images[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=100&h=100';
  };

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Size filter
    if (selectedSize) {
      result = result.filter(p => p.variants && p.variants.sizes && p.variants.sizes.includes(selectedSize));
    }

    // Search query filter (supporting titles, categories, descriptions, and occasion tags)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        (p.occasion && p.occasion.toLowerCase().includes(q))
      );
    }

    // Sorting
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
  }, [products, selectedCategory, selectedSize, searchQuery, sortBy]);

  return (
    <div className="shop-section container">
      <div className="shop-header">
        <h2 className="section-title">The Boutique Collections</h2>
        <p className="section-description">Browse handcrafted traditional wear tailored to fit you perfectly.</p>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="toolbar">
        {/* Dress Style pills carousel with circular avatars */}
        <div className="dress-styles-row-outer">
          <div className="dress-style-pills">
            {categories.map(cat => {
              const thumb = getCategoryThumbnail(cat);
              return (
                <button
                  key={cat}
                  className={`dress-style-pill ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  <img src={thumb} alt={cat} className="dress-style-pill-thumb" />
                  <span className="dress-style-pill-text">{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Bar & Sort Dropdown */}
        <div className="toolbar-controls">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Search boutique..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="toolbar-search"
            />
          </div>

          <div className="sort-wrapper">
            <SlidersHorizontal size={16} />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="featured">Sort by: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Sizing filter bar */}
      <div className="quick-size-bar">
        <div className="quick-size-title">Select your size for quicker browsing:</div>
        <div className="quick-size-buttons">
          {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
            <button
              key={size}
              className={`quick-size-btn ${selectedSize === size ? 'active' : ''}`}
              onClick={() => setSelectedSize(selectedSize === size ? null : size)}
            >
              {size}
            </button>
          ))}
        </div>
        
        {(selectedCategory !== 'All' || selectedSize || searchQuery.trim() !== '') && (
          <div className="clear-all-row-wrapper">
            <button 
              className="clear-all-filters-btn"
              onClick={() => {
                setSelectedCategory('All');
                setSelectedSize(null);
                setSearchQuery('');
              }}
            >
              ✕ Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Product Results */}
      {filteredProducts.length > 0 ? (
        <div className="product-grid">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onProductClick={onProductClick} 
            />
          ))}
        </div>
      ) : (
        <div className="no-results">
          <h3>No creations found matching your search.</h3>
          <p>Try resetting filters or checking your spelling.</p>
          <button className="btn-primary" onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}>
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
