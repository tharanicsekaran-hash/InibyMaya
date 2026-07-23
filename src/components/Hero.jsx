import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Hero({ onShopClick, onCustomClick, settings = {} }) {
  // Parse hero banners from settings or construct default list
  const banners = React.useMemo(() => {
    try {
      if (settings.heroBanners) {
        const parsed = typeof settings.heroBanners === 'string' 
          ? JSON.parse(settings.heroBanners) 
          : settings.heroBanners;
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse heroBanners settings:', e);
    }

    // Default fallback banners
    return [
      {
        id: 'banner-1',
        image: settings.heroImage || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1600',
        tagline: settings.heroTagline || 'AUTUMN / WINTER 2026 COUTURE',
        titleLine1: settings.heroTitleLine1 || 'Where Heritage Meets',
        titleLine2: settings.heroTitleLine2 || 'Modern Couture',
        subtitle: settings.heroSubtitle || 'Handcrafted Chikankari, rich velvet sets, and custom-tailored Anarkalis designed for the modern connoisseur.',
        primaryBtnText: settings.heroPrimaryBtnText || 'Explore the Collection',
        secondaryBtnText: settings.heroSecondaryBtnText || 'Custom Fitting Guide'
      },
      {
        id: 'banner-2',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1600',
        tagline: 'FRESH DROPS, EVERY WEEK',
        titleLine1: 'The Latest',
        titleLine2: "You'll Love",
        subtitle: 'Discover our newest handwoven arrivals crafted with timeless artistry and modern silhouettes.',
        primaryBtnText: 'Shop New Arrivals',
        secondaryBtnText: 'View Bestsellers'
      },
      {
        id: 'banner-3',
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1600',
        tagline: 'ROYAL FESTIVE SELECTION',
        titleLine1: 'Bespoke Anarkalis &',
        titleLine2: 'Silk Ensembles',
        subtitle: 'Elevate your festive wardrobe with intricate zari embroidery and custom-made fits.',
        primaryBtnText: 'Explore Occasions',
        secondaryBtnText: 'Book Tailor'
      }
    ];
  }, [settings]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Auto-play slide rotation every 3 seconds
  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % banners.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [banners.length]);

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % banners.length);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const currentBanner = banners[currentIndex] || banners[0];

  return (
    <div 
      className="hero-section hero-carousel-section clickable-hero-banner"
      onClick={onShopClick}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ cursor: 'pointer' }}
    >
      {/* Background Banner Slides — Dual HTML Picture Elements for 100% Uncropped Perfection */}
      {banners.map((banner, index) => (
        <picture
          key={banner.id || index}
          className={`hero-slide-picture ${index === currentIndex ? 'active' : ''}`}
        >
          {banner.mobileImage && (
            <source media="(max-width: 768px)" srcSet={banner.mobileImage} />
          )}
          <img
            src={banner.image}
            alt={banner.titleLine1 || banner.titleLine2 || 'Hero Banner'}
            className="hero-slide-img"
            loading="eager"
            decoding="async"
          />
        </picture>
      ))}

      {/* Navigation Arrows (visible on hover or desktop) */}
      {banners.length > 1 && (
        <>
          <button 
            className="hero-nav-arrow left" 
            onClick={(e) => { e.stopPropagation(); handlePrev(); }} 
            aria-label="Previous Banner"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            className="hero-nav-arrow right" 
            onClick={(e) => { e.stopPropagation(); handleNext(); }} 
            aria-label="Next Banner"
          >
            <ChevronRight size={24} />
          </button>

          {/* Banner Carousel Pagination Dots */}
          <div className="hero-carousel-dots-bottom-right" onClick={(e) => e.stopPropagation()}>
            {banners.map((_, idx) => (
              <button
                key={idx}
                className={`hero-dot ${idx === currentIndex ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
