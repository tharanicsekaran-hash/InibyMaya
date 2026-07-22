import React from 'react';

/**
 * CategoryStrip — Horizontal scrollable category icon row.
 * Shown directly below the Hero banner on the homepage.
 * Each icon navigates to the Shop page filtered by that category.
 *
 * Categories are now configurable from the Admin Console settings.
 */

const DEFAULT_CATEGORIES = [
  { name: 'Long Kurtas', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=200&auto=format&fit=crop', filter: 'Long Kurtas' },
  { name: 'Straight Kurtas', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=200&auto=format&fit=crop', filter: 'Straight Kurtas' },
  { name: 'Anarkali Suits', image: 'https://images.unsplash.com/photo-1609357518652-6cf0416f0cbe?q=80&w=200&auto=format&fit=crop', filter: 'Anarkali Suits' },
  { name: 'Co-ord Sets', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=200&auto=format&fit=crop', filter: 'Co-ord Sets' },
  { name: 'A-Line Kurtas', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=200&auto=format&fit=crop', filter: 'A-Line Kurtas' },
  { name: 'Custom Tailoring', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=200&auto=format&fit=crop', filter: 'custom' },
];

export { DEFAULT_CATEGORIES };

export default function CategoryStrip({ categories, onCategoryClick }) {
  const items = (categories && categories.length > 0) ? categories : DEFAULT_CATEGORIES;

  return (
    <section className="category-strip-section" aria-label="Shop by Category">
      <p className="category-strip-heading">Shop by Category</p>
      <div className="category-strip-scroll">
        {items.map((cat, idx) => (
          <button
            key={cat.filter || idx}
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
                    e.currentTarget.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              {/* Emoji/letter fallback */}
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
