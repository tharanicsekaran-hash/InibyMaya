import React, { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import { SlidersHorizontal, Grid, List, Search } from 'lucide-react';

export default function ProductGrid({ products, onProductClick, searchQuery, setSearchQuery }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');

  // Categories list
  const categories = useMemo(() => {
    const list = new Set(products.map(p => p.category));
    return ['All', ...list];
  }, [products]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Search query filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q)
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
      // Bestsellers first
      result.sort((a, b) => (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0));
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="shop-section container">
      <div className="shop-header">
        <h2 className="section-title">The Boutique Collections</h2>
        <p className="section-description">Browse handcrafted traditional wear tailored to fit you perfectly.</p>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="toolbar">
        {/* Category Pills */}
        <div className="category-pills">
          {categories.map(cat => (
            <button
              key={cat}
              className={`pill-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
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
