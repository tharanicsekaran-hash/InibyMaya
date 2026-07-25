import React from 'react';

/**
 * CategoryStrip — Horizontal scrollable category icon row.
 * Shown directly below the Hero banner on the homepage.
 * Each icon navigates to the Shop page filtered by that category.
 *
 * Categories are populated directly from Admin settings or live catalog.
 */

export default function CategoryStrip({ categories = [], products = [], onCategoryClick }) {
  // If categories are explicitly configured in Admin settings, use them!
  // Otherwise, dynamically derive categories from active products in the store.
  const items = React.useMemo(() => {
    if (Array.isArray(categories) && categories.length > 0) {
      return categories;
    }
    
    // Derive unique active categories from live products
    if (Array.isArray(products) && products.length > 0) {
      const categoryMap = new Map();
      products.forEach(p => {
        if (p.category && !categoryMap.has(p.category)) {
          const sampleImg = p.images && p.images[0] ? p.images[0] : '';
          categoryMap.set(p.category, {
            name: p.category,
            filter: p.category,
            image: sampleImg
          });
        }
      });
      return Array.from(categoryMap.values());
    }

    return [];
  }, [categories, products]);

  if (!items || items.length === 0) return null;

  return (
    <section className="category-strip-section" aria-label="Shop by Category">
      <p className="category-strip-heading">Shop by Category</p>
      <div className="category-strip-scroll">
        {items.map((cat, idx) => (
          <button
            key={cat.filter || cat.name || idx}
            className="category-icon-item"
            onClick={() => onCategoryClick(cat.filter || cat.name)}
            aria-label={`Browse ${cat.name}`}
          >
            <div className="category-circle">
              {cat.image ? (
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              {/* Letter fallback */}
              <span className="category-emoji-fallback" style={{ display: cat.image ? 'none' : 'flex' }}>
                {cat.name?.charAt(0) || '•'}
              </span>
            </div>
            <span className="category-icon-name">{cat.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
