import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function OffersBanner({ onShopClick, settings = {} }) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Parse offer banners from settings or fallback to default offer banner
  const banners = React.useMemo(() => {
    let rawList = [];
    try {
      if (settings.offerBanners) {
        const parsed = typeof settings.offerBanners === 'string' 
          ? JSON.parse(settings.offerBanners) 
          : settings.offerBanners;
        if (Array.isArray(parsed) && parsed.length > 0) {
          rawList = parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse offerBanners settings:', e);
    }

    // Default fallback offer banner if none configured in settings yet
    if (rawList.length === 0) {
      rawList = [
        {
          id: 'default-offer-1',
          image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1600',
          mobileImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
          title: 'Special Festive Couture Offer'
        }
      ];
    }

    // Filter slides that have at least one valid image (image or mobileImage)
    const validSlides = rawList.filter(b => (b.image && b.image.trim()) || (b.mobileImage && b.mobileImage.trim()));

    return validSlides.map(b => ({
      ...b,
      displayImg: isMobile 
        ? (b.mobileImage && b.mobileImage.trim() ? b.mobileImage : b.image) 
        : (b.image && b.image.trim() ? b.image : b.mobileImage)
    }));
  }, [settings, isMobile]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Auto-play slide rotation every 3 seconds if multiple offer banners exist
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % banners.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [banners.length, isPaused]);

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

  if (!banners || banners.length === 0) return null;

  return (
    <section className="offers-banner-section container">
      <div 
        className="offers-banner-carousel clickable-hero-banner"
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
              src={banner.displayImg || banner.image || banner.mobileImage}
              alt={banner.title || 'Special Couture Offer Banner'}
              className="hero-slide-img"
              loading="eager"
              decoding="async"
            />
          </picture>
        ))}

        {/* Navigation Arrows (visible on desktop if multiple banners exist) */}
        {banners.length > 1 && (
          <>
            <button 
              className="hero-nav-arrow left" 
              onClick={(e) => { e.stopPropagation(); handlePrev(); }} 
              aria-label="Previous Offer"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              className="hero-nav-arrow right" 
              onClick={(e) => { e.stopPropagation(); handleNext(); }} 
              aria-label="Next Offer"
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
                  aria-label={`Go to offer slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
