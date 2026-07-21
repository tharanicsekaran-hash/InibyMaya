import React from 'react';

/**
 * CategoryStrip — Horizontal scrollable category icon row.
 * Shown directly below the Hero banner on the homepage.
 * Each icon navigates to the Shop page filtered by that category.
 */

const CATEGORIES = [
  {
    name: 'Long Kurtas',
    emoji: '👗',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=200&auto=format&fit=crop',
    filter: 'Long Kurtas',
  },
  {
    name: 'Straight Kurtas',
    emoji: '👘',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=200&auto=format&fit=crop',
    filter: 'Straight Kurtas',
  },
  {
    name: 'Anarkali Suits',
    emoji: '🪷',
    image: 'https://images.unsplash.com/photo-1609357518652-6cf0416f0cbe?q=80&w=200&auto=format&fit=crop',
    filter: 'Anarkali Suits',
  },
  {
    name: 'Co-ord Sets',
    emoji: '✨',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=200&auto=format&fit=crop',
    filter: 'Co-ord Sets',
  },
  {
    name: 'A-Line Kurtas',
    emoji: '🌸',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=200&auto=format&fit=crop',
    filter: 'A-Line Kurtas',
  },
  {
    name: 'Custom Tailoring',
    emoji: '🪡',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=200&auto=format&fit=crop',
    filter: 'custom',
  },
];

export default function CategoryStrip({ onCategoryClick }) {
  return (
    <section className="category-strip-section" aria-label="Shop by Category">
      <p className="category-strip-heading">Shop by Category</p>
      <div className="category-strip-scroll">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.filter}
            className="category-icon-item"
            onClick={() => onCategoryClick(cat.filter)}
            aria-label={`Browse ${cat.name}`}
          >
            <div className="category-circle">
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                onError={(e) => {
                  // Fallback to emoji if image fails
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextSibling.style.display = 'flex';
                }}
              />
              {/* Emoji fallback hidden by default */}
              <span className="category-emoji-fallback" style={{ display: 'none' }}>
                {cat.emoji}
              </span>
            </div>
            <span className="category-icon-name">{cat.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
