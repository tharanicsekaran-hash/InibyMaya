import { useEffect, useRef, useState } from 'react';

/**
 * ReelCard — Self-contained reel video card with instant page-load video streaming.
 */
function ReelCard({ reel, onShopOutfit }) {
  const videoRef = useRef(null);
  const wrapperRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const posterImg = reel.thumbnailFile || reel.productImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600&h=800';

  useEffect(() => {
    const video = videoRef.current;
    const wrapper = wrapperRef.current;
    if (!video || !wrapper) return;

    // Immediately trigger play on mount for instant loading right after page enter/refresh
    video.play().catch(() => {});

    // IntersectionObserver to auto-play when visible and pause when scrolled far vertically
    const playObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          }
        });
      },
      {
        root: null,
        rootMargin: '300px 1000px 300px 1000px', // generous bounds so all carousel reels load & play immediately
        threshold: 0,
      }
    );

    const pauseObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            video.pause();
          }
        });
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0,
      }
    );

    playObserver.observe(wrapper);
    pauseObserver.observe(wrapper);

    return () => {
      playObserver.disconnect();
      pauseObserver.disconnect();
    };
  }, [reel.videoUrl]);

  const hasProduct = Boolean(reel.productId);

  const handleClick = (e) => {
    e.stopPropagation();
    if (hasProduct) onShopOutfit();
  };

  return (
    <div className="reel-card-wrapper" ref={wrapperRef}>
      <div
        className="reel-card"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        style={{ cursor: hasProduct ? 'pointer' : 'default' }}
      >
        {/* Poster Backdrop Image — renders instantly on page load (0ms) so card NEVER looks broken */}
        <img
          src={posterImg}
          alt={reel.title || "Reel video preview"}
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 1,
            opacity: isLoaded ? 0 : 1,
            transition: 'opacity 0.4s ease-in-out',
            pointerEvents: 'none'
          }}
        />

        {/* Video Element — configured with autoPlay, preload="auto", and poster */}
        <video
          ref={videoRef}
          src={reel.videoUrl}
          poster={posterImg}
          loop
          muted
          autoPlay
          playsInline
          preload="auto"
          className="reel-video"
          style={{ 
            position: 'relative', 
            zIndex: 2,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          onLoadedData={() => {
            setIsLoaded(true);
            if (videoRef.current) videoRef.current.play().catch(() => {});
          }}
          onCanPlay={() => {
            setIsLoaded(true);
            if (videoRef.current) videoRef.current.play().catch(() => {});
          }}
          onPlaying={() => setIsLoaded(true)}
        />

        {/* Dark gradient overlay */}
        <div className="reel-overlay" style={{ zIndex: 3 }}>
          {/* Shop Outfit — hover only, product-linked reels only */}
          {isHovered && hasProduct && (
            <button
              className="reel-shop-now-btn animate-fadeIn"
              onClick={(e) => {
                e.stopPropagation();
                onShopOutfit();
              }}
            >
              Shop Outfit
            </button>
          )}

          {/* Footer */}
          <div className="reel-premium-footer">
            {reel.productImage && (
              <img
                src={reel.productImage}
                alt="Outfit thumbnail"
                className="reel-thumbnail-thumb"
                loading="lazy"
              />
            )}
            <div className="reel-footer-text">
              <p className="reel-product-title">{reel.productTitle || reel.title}</p>
              {reel.productPrice > 0 && (
                <span className="reel-product-price">
                  &#8377;{Number(reel.productPrice).toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReelCard;
