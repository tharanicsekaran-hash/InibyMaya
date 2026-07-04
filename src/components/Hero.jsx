import React from 'react';

export default function Hero({ onShopClick }) {
  return (
    <div className="hero-section">
      <div className="hero-overlay"></div>
      <div className="hero-background-image" style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1600")'
      }}></div>
      <div className="hero-content container">
        <h1 className="hero-title">
          Where Heritage Meets <br />
          <span>Modern Couture</span>
        </h1>
        <p className="hero-subtitle">
          Handcrafted Chikankari, rich velvet sets, and custom-tailored Anarkalis designed for the modern connoisseur.
        </p>
        <div className="hero-actions">
          <button className="btn-primary" onClick={onShopClick}>
            Explore the Collection
          </button>
          <button className="btn-secondary-outline" onClick={onShopClick}>
            Custom Stitching Guide
          </button>
        </div>
      </div>
    </div>
  );
}
