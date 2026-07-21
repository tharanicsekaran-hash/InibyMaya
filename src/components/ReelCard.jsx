import { useEffect, useRef, useState } from 'react';

/**
 * ReelCard — Self-contained reel video card.
 *
 * Fixes applied:
 *  1. preload="metadata" — browser downloads just the first frame + duration.
 *     This eliminates the black-flash flicker on the first (visible) reel, because
 *     the first frame is available immediately as a visual placeholder.
 *
 *  2. rootMargin: "0px 600px 0px 600px" on the IntersectionObserver — widens
 *     the detection zone 600 px to the LEFT and RIGHT of the viewport.
 *     This means ALL reels in the horizontal carousel are "considered visible"
 *     and get their play() call fired, even though they're horizontally off-screen.
 *
 *  3. Separate vertical-scroll observer — pauses videos when the entire
 *     reels section scrolls out of the vertical viewport (saves battery/CPU).
 */
function ReelCard({ reel, onShopOutfit }) {
  const videoRef = useRef(null);
  const wrapperRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const wrapper = wrapperRef.current;
    if (!video || !wrapper) return;

    // ── Observer 1: wide horizontal rootMargin catches all carousel cards ──
    // root: null (viewport), but with 600px margin on left & right so every
    // reel in the horizontal scroll row is treated as "intersecting".
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
        rootMargin: '200px 800px 200px 800px', // generous horizontal margins
        threshold: 0,
      }
    );

    // ── Observer 2: tight vertical check — pause if section scrolls off-screen ──
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
        rootMargin: '0px',
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
        {/* Thumbnail placeholder shown while video is buffering — eliminates black flash */}
        {!isLoaded && (reel.thumbnailFile || reel.productImage) && (
          <img
            src={reel.thumbnailFile || reel.productImage}
            alt=""
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 1,
            }}
          />
        )}

        {/*
          preload="metadata": browser fetches just the first frame + duration.
          This gives an instant visual frame so there's no black-screen flash.
          It does NOT download the full video — only ~a few KB of headers.
        */}
        <video
          ref={videoRef}
          src={reel.videoUrl}
          loop
          muted
          playsInline
          preload="metadata"
          className="reel-video"
          style={{ position: 'relative', zIndex: 2 }}
          onCanPlay={() => setIsLoaded(true)}
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
                  &#8377;{reel.productPrice.toLocaleString('en-IN')}
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
