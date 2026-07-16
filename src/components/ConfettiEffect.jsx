import React, { useEffect, useRef } from 'react';

export default function ConfettiEffect() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Set sizes
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const handleResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.width = window.innerWidth;
        height = canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    // Luxury celebration color palette
    const colors = [
      '#f43f5e', // Rose
      '#ec4899', // Pink
      '#d946ef', // Fuchsia
      '#a855f7', // Purple
      '#6366f1', // Indigo
      '#3b82f6', // Blue
      '#0ea5e9', // Sky
      '#10b981', // Emerald
      '#f59e0b', // Amber
      '#f97316', // Orange
      '#eab308'  // Gold yellow
    ];
    
    const particles = [];
    const maxParticles = 180; // High density for satisfying explosion

    const createParticle = (originX, originY, side) => {
      // Angle directed towards the top-center
      const angle = side === 'left' 
        ? (Math.random() * 35 + 40) * Math.PI / 180   // 40° to 75°
        : (Math.random() * 35 + 105) * Math.PI / 180; // 105° to 140°
      
      const velocity = Math.random() * 25 + 15; // Powerful upward force

      return {
        x: originX,
        y: originY,
        vx: Math.cos(angle) * velocity,
        vy: -Math.sin(angle) * velocity,
        width: Math.random() * 8 + 6,
        height: Math.random() * 14 + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: Math.random() * 0.16 - 0.08,
        scaleY: 1,
        opacity: 1.0,
        gravity: 0.5, // Natural pull
        friction: 0.975 // Air drag
      };
    };

    // Half of the particles burst from left bottom corner, half from right bottom
    for (let i = 0; i < maxParticles; i++) {
      if (i % 2 === 0) {
        particles.push(createParticle(0, height, 'left'));
      } else {
        particles.push(createParticle(width, height, 'right'));
      }
    }

    let animationFrameId;
    const startTime = Date.now();
    const fadeStartDelay = 2500; // Start fading after 2.5 seconds

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      let active = false;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Apply physics with drag and gravity
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        
        // 3D rotation flip speed
        p.rotation += p.rotationSpeed;
        p.scaleY = Math.sin(p.rotation * 1.5);

        // Draw satisfying 3D rotating rectangle confetti strip
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.scale(1, p.scaleY);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        ctx.restore();

        // Slow fade out past the delay threshold
        const elapsed = Date.now() - startTime;
        if (elapsed > fadeStartDelay) {
          p.opacity -= 0.015;
        }

        // Keep animation loop ticking if particles are visible on screen
        if (p.opacity > 0 && p.y < height + 40 && p.x > -40 && p.x < width + 40) {
          active = true;
        }
      }

      if (active) {
        animationFrameId = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 999999, // Rendered above header/checkout screen
      }}
    />
  );
}
