import React from 'react';

export default function Hero({ onShopClick, onCustomClick, settings = {} }) {
  const heroImg = settings.heroImage || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1600';
  const tagline = settings.heroTagline || '';
  const titleLine1 = settings.heroTitleLine1 || 'Where Heritage Meets';
  const titleLine2 = settings.heroTitleLine2 || 'Modern Couture';
  const subtitle = settings.heroSubtitle || 'Handcrafted Chikankari, rich velvet sets, and custom-tailored Anarkalis designed for the modern connoisseur.';
  const primaryBtnText = settings.heroPrimaryBtnText || 'Explore the Collection';
  const secondaryBtnText = settings.heroSecondaryBtnText || 'Custom Fitting Guide';

  return (
    <div className="hero-section">
      <div className="hero-overlay"></div>
      <div 
        className="hero-background-image" 
        style={{ backgroundImage: `url("${heroImg}")` }}
      ></div>
      <div className="hero-content container">
        {tagline && <div className="hero-tagline-badge">{tagline}</div>}
        <h1 className="hero-title">
          {titleLine1} {titleLine2 && <><br /><span>{titleLine2}</span></>}
        </h1>
        <p className="hero-subtitle">
          {subtitle}
        </p>
        <div className="hero-actions">
          <button className="btn-primary" onClick={onShopClick}>
            {primaryBtnText}
          </button>
          <button className="btn-secondary-outline" onClick={onCustomClick || onShopClick}>
            {secondaryBtnText}
          </button>
        </div>
      </div>
    </div>
  );
}
