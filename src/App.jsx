import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProductGrid from './components/ProductGrid';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import CheckoutModal from './components/CheckoutModal';
import AdminDashboard from './components/AdminDashboard';
import ConfettiEffect from './components/ConfettiEffect';
import InfoPage from './components/InfoPage';
import { products as initialProducts } from './data/products';
import { CheckCircle2, Calendar, Truck, ArrowLeft, Heart, ShoppingBag, Sparkles, Scissors, X, Film, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from './supabaseClient';
import './App.css';

// Database column mapping helpers
const mapDbProductToClient = (dbProd) => {
  return {
    id: dbProd.id,
    title: dbProd.title,
    category: dbProd.category,
    price: Number(dbProd.price),
    rating: Number(dbProd.rating || 5.0),
    reviewsCount: Number(dbProd.reviews_count || 0),
    description: dbProd.description,
    details: dbProd.details || [],
    images: dbProd.images,
    variants: dbProd.variants,
    customizable: dbProd.customizable,
    bestSeller: dbProd.best_seller,
    occasion: dbProd.occasion || 'Daily Elegance',
    highlights: dbProd.highlights || {}
  };
};

const mapClientProductToDb = (clientProd) => {
  return {
    id: clientProd.id,
    title: clientProd.title,
    category: clientProd.category,
    price: clientProd.price,
    rating: clientProd.rating || 5.0,
    reviews_count: clientProd.reviewsCount || 0,
    description: clientProd.description,
    details: clientProd.details || [],
    images: clientProd.images,
    variants: clientProd.variants,
    customizable: clientProd.customizable,
    best_seller: clientProd.bestSeller,
    occasion: clientProd.occasion || 'Daily Elegance',
    highlights: clientProd.highlights || {}
  };
};

const isValidUuid = (str) => {
  if (!str) return false;
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(str);
};

const mapDbReelToClient = (dbReel) => {
  return {
    id: dbReel.id,
    title: dbReel.title,
    videoUrl: dbReel.video_url,
    productId: dbReel.product_id || '',
    productTitle: dbReel.product_title || '',
    productPrice: Number(dbReel.product_price || 0),
    productImage: dbReel.product_image || ''
  };
};

const mapClientReelToDb = (clientReel) => {
  return {
    id: clientReel.id,
    title: clientReel.title,
    video_url: clientReel.videoUrl,
    product_id: clientReel.productId || null,
    product_title: clientReel.productTitle || '',
    product_price: clientReel.productPrice || 0,
    product_image: clientReel.productImage || ''
  };
};

const mapDbPromoToClient = (dbPromo) => {
  return {
    code: dbPromo.code,
    type: dbPromo.type,
    value: Number(dbPromo.value),
    minPurchase: Number(dbPromo.min_purchase || 0),
    description: dbPromo.description || ''
  };
};

const mapClientPromoToDb = (clientPromo) => {
  return {
    code: clientPromo.code,
    type: clientPromo.type,
    value: clientPromo.value,
    min_purchase: clientPromo.minPurchase || 0,
    description: clientPromo.description || ''
  };
};

const mapDbOrderToClient = (dbOrder) => {
  return {
    id: dbOrder.id,
    user_id: dbOrder.user_id,
    userId: dbOrder.user_id,
    items: dbOrder.items,
    shippingDetails: dbOrder.shipping_details,
    subtotal: Number(dbOrder.subtotal),
    discount: Number(dbOrder.discount || 0),
    shipping: Number(dbOrder.shipping || 0),
    total: Number(dbOrder.total),
    paymentId: dbOrder.payment_id,
    status: dbOrder.status,
    trackingNumber: dbOrder.tracking_number || '',
    notes: dbOrder.notes || '',
    timestamp: dbOrder.timestamp
  };
};

export default function App() {
  // Navigation & Page routing
  const [activePage, setActivePage] = useState('home'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [preselectedSize, setPreselectedSize] = useState(null);
  const [infoPageTab, setInfoPageTab] = useState('about-us');
  const [boutiqueSettings, setBoutiqueSettings] = useState(() => {
    const cached = localStorage.getItem('im_settings');
    const defaults = {
      description: 'High-end Indian traditional wear and bespoke custom-tailored apparel for special celebrations and elegant daily comfort.',
      email: 'care@inibymaya.com',
      phone: '+91 98765 43210',
      address: '14, Ground Floor, Linen Road, Jubilee Hills, Hyderabad - 500033',
      hours: 'Mon - Sat: 10:00 AM - 07:00 PM IST',
      newsletterTitle: 'Subscribe and Get 10% OFF',
      newsletterSubtitle: 'No Spam, No Drama – Just Good Clothes',
      newsletterDiscount: 10,
      newsletterPromoCode: 'WELCOME10',
      newsletterEnabled: true
    };
    return cached ? { ...defaults, ...JSON.parse(cached) } : defaults;
  });

  const handleScrollReels = (direction) => {
    const container = document.querySelector('.reels-carousel-container');
    if (container) {
      const scrollAmount = 320;
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const handleScrollTestimonials = (direction) => {
    const container = document.querySelector('.testimonials-carousel-container');
    if (container) {
      const scrollAmount = 300;
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  // Catalog State (allows admin modification)
  const [productsList, setProductsList] = useState(() => {
    const saved = localStorage.getItem('im_catalog');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  // Cart & Orders State
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('im_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [ordersList, setOrdersList] = useState(() => {
    const saved = localStorage.getItem('im_orders');
    return saved ? JSON.parse(saved) : [];
  });

  // Offers / Promos State
  const [promosList, setPromosList] = useState(() => {
    const saved = localStorage.getItem('im_promos');
    return saved ? JSON.parse(saved) : [
      { code: 'WELCOME10', type: 'percent', value: 10, minPurchase: 0, description: '10% off on all products' },
      { code: 'MAYA300', type: 'flat', value: 300, minPurchase: 1500, description: '₹300 off on orders above ₹1,500' }
    ];
  });

  // Dynamic Reels State (configurable by Admin)
  const [reelsList, setReelsList] = useState(() => {
    const saved = localStorage.getItem('im_reels');
    if (saved && !saved.includes('vimeo.com')) {
      return JSON.parse(saved);
    }
    const defaults = [
      {
        id: 'reel-1',
        title: 'Indigo Chikankari Motion Showcase',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-beautiful-woman-in-traditional-indian-dress-standing-outdoors-48866-large.mp4',
        productId: 'im-kurtaset-1',
        productTitle: 'Indigo Chikankari Cotton Long Kurta',
        productPrice: 2499,
        productImage: 'https://images.unsplash.com/photo-1609357518652-6cf0416f0cbe?q=80&w=800'
      },
      {
        id: 'reel-2',
        title: 'Ivory Georgette Anarkali Elegance',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-in-traditional-indian-clothing-dancing-48873-large.mp4',
        productId: 'im-anarkali-1',
        productTitle: 'Ivory Georgette Anarkali Suit',
        productPrice: 3899,
        productImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800'
      },
      {
        id: 'reel-3',
        title: 'Sage Green Organza Motion Line',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-in-traditional-clothing-outdoors-48871-large.mp4',
        productId: 'im-kurtaset-2',
        productTitle: 'Sage Green Organza Straight Kurta',
        productPrice: 2299,
        productImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800'
      }
    ];
    localStorage.setItem('im_reels', JSON.stringify(defaults));
    return defaults;
  });

  // Reels interactive autoplay & scroll states
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [activeReelId, setActiveReelId] = useState(null);

  // Current session user (Supabase simulator)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('im_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Testimonials State (Loved by Lakhs of Women)
  const [testimonialsList, setTestimonialsList] = useState(() => {
    const saved = localStorage.getItem('im_testimonials');
    if (saved) return JSON.parse(saved);
    const defaults = [
      {
        id: 't-1',
        name: 'Gayathri Arvind',
        imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800',
        quote: 'I have many kurtas from you. Every piece is awesome. Am so happy to buy!',
        rating: 5,
        tag: 'HAY!'
      },
      {
        id: 't-2',
        name: 'Preethi',
        imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800',
        quote: 'Absolutely loved this piece. The quality, fit, and detailing feel so luxury.',
        rating: 5,
        tag: 'HAY!'
      },
      {
        id: 't-3',
        name: 'Suchi Kailash',
        imageUrl: 'https://images.unsplash.com/photo-1609357518652-6cf0416f0cbe?q=80&w=800',
        quote: 'Great service! I needed this dress for my birthday and received it right on time.',
        rating: 5,
        tag: 'HAY!'
      },
      {
        id: 't-4',
        name: 'Aisha',
        imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800',
        quote: 'Beautiful fitting and rich colors. The custom tailoring has an extremely premium silhouette.',
        rating: 5,
        tag: 'HAY!'
      }
    ];
    localStorage.setItem('im_testimonials', JSON.stringify(defaults));
    return defaults;
  });

  // Modal Triggers & Newsletter Offer
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [checkoutSummary, setCheckoutSummary] = useState(null); 
  const [successOrder, setSuccessOrder] = useState(null); 
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [subscriberContact, setSubscriberContact] = useState('');
  const [offerError, setOfferError] = useState('');
  const [offerSuccess, setOfferSuccess] = useState('');
  const [autoAppliedPromo, setAutoAppliedPromo] = useState(() => {
    const subscribed = localStorage.getItem('im_newsletter_subscribed') === 'true';
    const used = localStorage.getItem('im_newsletter_promo_used') === 'true';
    if (subscribed && !used) {
      return localStorage.getItem('im_newsletter_promo_code') || 'WELCOME10';
    }
    return '';
  });

  // 1. Initial Supabase Fetch & Session Bindings
  useEffect(() => {
    const loadSupabaseData = async () => {
      if (!supabase) return;
      try {
        // Fetch Catalog
        const { data: pData, error: pErr } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (!pErr && pData) {
          if (pData.length === 0) {
            await supabase.from('products').insert(initialProducts.map(mapClientProductToDb));
            setProductsList(initialProducts);
          } else {
            setProductsList(pData.map(mapDbProductToClient));
          }
        }

        // Fetch Reels
        const { data: rData, error: rErr } = await supabase.from('reels').select('*').order('created_at', { ascending: true });
        if (!rErr && rData) {
          if (rData.length === 0) {
            const defaultReels = [
              {
                id: 'reel-1',
                title: 'Indigo Chikankari Motion Showcase',
                videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-beautiful-woman-in-traditional-indian-dress-standing-outdoors-48866-large.mp4',
                productId: 'im-kurtaset-1',
                productTitle: 'Indigo Chikankari Cotton Long Kurta',
                productPrice: 2499,
                productImage: 'https://images.unsplash.com/photo-1609357518652-6cf0416f0cbe?q=80&w=800'
              },
              {
                id: 'reel-2',
                title: 'Ivory Georgette Anarkali Elegance',
                videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-in-traditional-indian-clothing-dancing-48873-large.mp4',
                productId: 'im-anarkali-1',
                productTitle: 'Ivory Georgette Anarkali Suit',
                productPrice: 3899,
                productImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800'
              },
              {
                id: 'reel-3',
                title: 'Sage Green Organza Motion Line',
                videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-in-traditional-clothing-outdoors-48871-large.mp4',
                productId: 'im-kurtaset-2',
                productTitle: 'Sage Green Organza Straight Kurta',
                productPrice: 2299,
                productImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800'
              }
            ];
            await supabase.from('reels').insert(defaultReels.map(mapClientReelToDb));
            setReelsList(defaultReels);
          } else {
            setReelsList(rData.map(mapDbReelToClient));
          }
        }

        // Fetch Coupons
        const { data: promoData, error: promoErr } = await supabase.from('promos').select('*');
        if (!promoErr && promoData) {
          if (promoData.length === 0) {
            const defaultPromos = [
              { code: 'WELCOME10', type: 'percent', value: 10, minPurchase: 0, description: '10% off for subscribing' },
              { code: 'MAYA300', type: 'flat', value: 300, minPurchase: 1500, description: '₹300 off on orders above ₹1,500' }
            ];
            await supabase.from('promos').insert(defaultPromos.map(mapClientPromoToDb));
            setPromosList(defaultPromos);
          } else {
            setPromosList(promoData.map(mapDbPromoToClient));
          }
        }

        // Fetch Orders
        const { data: oData, error: oErr } = await supabase.from('orders').select('*').order('timestamp', { ascending: false });
        if (!oErr && oData) {
          const remoteOrders = oData.map(mapDbOrderToClient);
          setOrdersList(remoteOrders);
          localStorage.setItem('im_orders', JSON.stringify(remoteOrders));
        }

        // Fetch Testimonials
        const { data: tData, error: tErr } = await supabase.from('testimonials').select('*').order('created_at', { ascending: true });
        if (!tErr && tData) {
          if (tData.length === 0) {
            const defaultTestimonials = [
              {
                id: 't-1',
                name: 'Gayathri Arvind',
                imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800',
                quote: 'I have many kurtas from you. Every piece is awesome. Am so happy to buy!',
                rating: 5,
                tag: 'HAY!'
              },
              {
                id: 't-2',
                name: 'Preethi',
                imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800',
                quote: 'Absolutely loved this piece. The quality, fit, and detailing feel so luxury.',
                rating: 5,
                tag: 'HAY!'
              },
              {
                id: 't-3',
                name: 'Suchi Kailash',
                imageUrl: 'https://images.unsplash.com/photo-1609357518652-6cf0416f0cbe?q=80&w=800',
                quote: 'Great service! I needed this dress for my birthday and received it right on time.',
                rating: 5,
                tag: 'HAY!'
              },
              {
                id: 't-4',
                name: 'Aisha',
                imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800',
                quote: 'Beautiful fitting and rich colors. The custom tailoring has an extremely premium silhouette.',
                rating: 5,
                tag: 'HAY!'
              }
            ];
            await supabase.from('testimonials').insert(defaultTestimonials.map(t => ({
              id: t.id,
              name: t.name,
              image_url: t.imageUrl,
              quote: t.quote,
              rating: t.rating,
              tag: t.tag
            })));
            setTestimonialsList(defaultTestimonials);
          } else {
            setTestimonialsList(tData.map(t => ({
              id: t.id,
              name: t.name,
              imageUrl: t.image_url,
              quote: t.quote,
              rating: t.rating,
              tag: t.tag
            })));
          }
        }

        // Fetch Settings
        const { data: sData, error: sErr } = await supabase.from('settings').select('*');
        if (!sErr && sData && sData.length > 0) {
          const settingsObj = {};
          sData.forEach(item => {
            settingsObj[item.key] = item.value;
          });
          setBoutiqueSettings(prev => ({
            ...prev,
            ...settingsObj
          }));
        }
      } catch (err) {
        console.error('Failed to sync Supabase tables during boot:', err);
      }
    };

    loadSupabaseData();

    // Supabase Session Listener
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session && session.user) {
          // Find customer profile metadata
          const { data: customerProfile } = await supabase
            .from('customers')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setCurrentUser({
            id: session.user.id,
            email: session.user.email,
            name: customerProfile ? customerProfile.name : (session.user.user_metadata?.name || session.user.email.split('@')[0])
          });
        } else if (event === 'SIGNED_OUT') {
          // Keep local / simulated sessions valid upon reloads and page transitions
          setCurrentUser(null);
        }
      });

      return () => {
        subscription?.unsubscribe();
      };
    }
  }, [activePage]);

  // Centralized Scroll-to-Top trigger upon view/tab/order/product transitions
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activePage, infoPageTab, selectedProduct, successOrder]);

  // LocalStorage backups (for hybrid fallback operation)
  useEffect(() => {
    localStorage.setItem('im_catalog', JSON.stringify(productsList));
  }, [productsList]);

  useEffect(() => {
    localStorage.setItem('im_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('im_orders', JSON.stringify(ordersList));
  }, [ordersList]);

  useEffect(() => {
    localStorage.setItem('im_promos', JSON.stringify(promosList));
  }, [promosList]);

  useEffect(() => {
    localStorage.setItem('im_reels', JSON.stringify(reelsList));
  }, [reelsList]);

  useEffect(() => {
    localStorage.setItem('im_testimonials', JSON.stringify(testimonialsList));
  }, [testimonialsList]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('im_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('im_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('im_settings', JSON.stringify(boutiqueSettings));
  }, [boutiqueSettings]);

  // Offer popup triggers on page load once per user session/lifetime if not logged in
  useEffect(() => {
    const shown = localStorage.getItem('im_offer_modal_shown');
    const isEnabled = boutiqueSettings.newsletterEnabled !== false;
    if (!shown && !currentUser && isEnabled) {
      const timer = setTimeout(() => {
        if (!currentUser && boutiqueSettings.newsletterEnabled !== false) {
          setShowOfferModal(true);
        }
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentUser, boutiqueSettings.newsletterEnabled]);

  useEffect(() => {
    if (currentUser) {
      setShowOfferModal(false);
    }
  }, [currentUser]);

  // Autoscroll reels video carousel
  useEffect(() => {
    if (reelsList.length <= 1 || !isAutoScrolling) return;
    
    const container = document.querySelector('.reels-carousel-container');
    if (!container) return;

    let intervalId;
    let isHovered = false;

    const startScrolling = () => {
      intervalId = setInterval(() => {
        if (isHovered) return;
        
        container.scrollLeft += 1;
        
        // Loop back to start if we scroll near the end
        if (container.scrollLeft >= container.scrollWidth - container.clientWidth - 1) {
          container.scrollLeft = 0;
        }
      }, 30);
    };

    const handleMouseEnter = () => {
      isHovered = true;
    };
    const handleMouseLeave = () => {
      isHovered = false;
    };
    const handleTouchStart = () => {
      // Pause autoscrolling on user manual swipe or tap
      setIsAutoScrolling(false);
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    
    startScrolling();

    return () => {
      clearInterval(intervalId);
      if (container) {
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
        container.removeEventListener('touchstart', handleTouchStart);
      }
    };
  }, [reelsList, activePage, isAutoScrolling]);

  // Phone / Email verification handler
  const handleSubscribeSubmit = (e) => {
    e.preventDefault();
    const contact = subscriberContact.trim();
    if (!contact) return;

    setOfferError('');
    setOfferSuccess('');

    const normalized = contact.toLowerCase();
    // Simple email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalized)) {
      setOfferError('Please enter a valid email address.');
      return;
    }
    
    // Check order histories or active user logins to detect existing customers
    const isExisting = ordersList.some(order => 
      (order.shippingDetails.email || '').toLowerCase() === normalized
    ) || (currentUser && currentUser.email.toLowerCase() === normalized);

    if (isExisting) {
      setOfferError('You are already an existing patron! This offer is for new visitors only.');
      return;
    }

    // Generate coupon & Auto-apply to cart drawer
    const discountVal = Number(boutiqueSettings.newsletterDiscount !== undefined ? boutiqueSettings.newsletterDiscount : 10);
    const code = (boutiqueSettings.newsletterPromoCode || 'WELCOME10').trim().toUpperCase();
    
    if (!promosList.some(p => p.code === code)) {
      handleAddPromo({ 
        code, 
        type: 'percent', 
        value: discountVal, 
        minPurchase: 0, 
        description: `${discountVal}% off for subscribing` 
      });
    }
    
    setAutoAppliedPromo(code);
    setOfferSuccess(`Thank you! Your ${discountVal}% coupon ${code} is now auto-applied to your cart!`);
    localStorage.setItem('im_offer_modal_shown', 'true');
    localStorage.setItem('im_newsletter_subscribed', 'true');
    localStorage.setItem('im_newsletter_promo_code', code);
    localStorage.setItem('im_newsletter_promo_used', 'false');
  };

  // Auth simulators
  const handleLogin = (userObj) => {
    setCurrentUser(userObj);
    setIsAuthOpen(false);
  };
  const handleSignup = (userObj) => {
    setCurrentUser(userObj);
    setIsAuthOpen(false);
  };
  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    setActivePage('home');
  };

  // Cart operations
  const handleAddToCart = (item) => {
    setCartItems(prev => {
      const idx = prev.findIndex(i => 
        i.product.id === item.product.id && 
        i.size === item.size && 
        i.color === item.color
      );
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity += item.quantity;
        return updated;
      }
      return [...prev, item];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQty = (idx, newQty) => {
    if (newQty < 1) return;
    setCartItems(prev => {
      const updated = [...prev];
      updated[idx].quantity = newQty;
      return updated;
    });
  };

  const handleRemoveCartItem = (idx) => {
    setCartItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCheckoutTrigger = (prices) => {
    setIsCartOpen(false);
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    setCheckoutSummary(prices);
  };

  const handleOrderSuccess = async (orderData) => {
    setOrdersList(prev => [orderData, ...prev]);
    setCartItems([]); 
    setCheckoutSummary(null); 
    setSuccessOrder(orderData); 
    
    // Mark subscriber coupon as used so it doesn't auto-apply to future carts
    localStorage.setItem('im_newsletter_promo_used', 'true');
    setAutoAppliedPromo('');

    if (supabase) {
      try {
        const dbOrder = {
          id: orderData.id,
          user_id: (currentUser && isValidUuid(currentUser.id)) ? currentUser.id : null,
          items: orderData.items,
          shipping_details: orderData.shippingDetails,
          subtotal: orderData.subtotal,
          discount: orderData.discount,
          shipping: orderData.shipping,
          total: orderData.total,
          payment_id: orderData.paymentId,
          status: orderData.status,
          tracking_number: orderData.trackingNumber,
          notes: orderData.notes || '',
          timestamp: orderData.timestamp
        };
        const { error } = await supabase.from('orders').insert(dbOrder);
        if (error) {
          console.error('Supabase orders table insert failed:', error.message, error.details || '');
        } else {
          console.log('Order successfully synced with Supabase database!');
        }
      } catch (err) {
        console.error('Supabase write error during checkout:', err);
      }
    }
  };

  // Admin adjustments
  const handleAddProduct = async (newProd) => {
    setProductsList(prev => [newProd, ...prev]);
    if (supabase) {
      await supabase.from('products').insert(mapClientProductToDb(newProd));
    }
  };
  const handleDeleteProduct = async (id) => {
    setProductsList(prev => prev.filter(p => p.id !== id));
    if (supabase) {
      await supabase.from('products').delete().eq('id', id);
    }
  };
  const handleUpdateProduct = async (updatedProd) => {
    setProductsList(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
    if (supabase) {
      await supabase.from('products').update(mapClientProductToDb(updatedProd)).eq('id', updatedProd.id);
    }
  };
  const handleUpdateOrderStatus = async (orderId, nextStatus, trackingNum = '') => {
    setOrdersList(prev => prev.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          status: nextStatus,
          trackingNumber: trackingNum || order.trackingNumber || ''
        };
      }
      return order;
    }));

    if (supabase) {
      const { error } = await supabase.from('orders')
        .update({ 
          status: nextStatus, 
          tracking_number: trackingNum 
        })
        .eq('id', orderId);
      if (error) {
        console.error('Supabase orders status update failed:', error.message);
      }
    }
  };

  // Promo Configuration sync helpers
  const handleAddPromo = async (newPromo) => {
    setPromosList(prev => [...prev, newPromo]);
    if (supabase) {
      await supabase.from('promos').insert(mapClientPromoToDb(newPromo));
    }
  };
  const handleDeletePromo = async (code) => {
    setPromosList(prev => prev.filter(p => p.code !== code));
    if (supabase) {
      await supabase.from('promos').delete().eq('code', code);
    }
  };

  // Reels Configuration sync helpers
  const handleAddReel = async (newReel) => {
    setReelsList(prev => [...prev, newReel]);
    if (supabase) {
      await supabase.from('reels').insert(mapClientReelToDb(newReel));
    }
  };
  const handleDeleteReel = async (id) => {
    setReelsList(prev => prev.filter(r => r.id !== id));
    if (supabase) {
      await supabase.from('reels').delete().eq('id', id);
    }
  };

  // Testimonials Configuration sync helpers
  const handleAddTestimonial = async (newT) => {
    setTestimonialsList(prev => [...prev, newT]);
    if (supabase) {
      try {
        await supabase.from('testimonials').insert({
          id: newT.id,
          name: newT.name,
          image_url: newT.imageUrl,
          quote: newT.quote,
          rating: newT.rating,
          tag: newT.tag
        });
      } catch (err) {
        console.error('Failed to sync insert testimonial with Supabase:', err);
      }
    }
  };

  const handleDeleteTestimonial = async (id) => {
    setTestimonialsList(prev => prev.filter(t => t.id !== id));
    if (supabase) {
      try {
        await supabase.from('testimonials').delete().eq('id', id);
      } catch (err) {
        console.error('Failed to sync delete testimonial with Supabase:', err);
      }
    }
  };

  const handleSaveSettings = async (newSettings) => {
    setBoutiqueSettings(newSettings);
    if (supabase) {
      try {
        const updates = Object.keys(newSettings).map(key => ({
          key,
          value: newSettings[key]
        }));
        await supabase.from('settings').upsert(updates);
      } catch (err) {
        console.error('Failed to sync settings updates with Supabase:', err);
      }
    }
  };

  const handleSearchToggle = () => {
    setActivePage('shop');
    setTimeout(() => {
      const searchBar = document.querySelector('.toolbar-search');
      if (searchBar) searchBar.focus();
    }, 200);
  };

  // User-specific order history
  const userOrderHistory = ordersList.filter(o => 
    (currentUser && o.shippingDetails?.email && o.shippingDetails.email.toLowerCase() === currentUser.email.toLowerCase()) ||
    o.shippingDetails?.name === currentUser?.name || 
    o.shippingDetails?.phone === currentUser?.phone || 
    (currentUser && o.shippingDetails?.name?.toLowerCase().includes(currentUser.email.split('@')[0].toLowerCase())) ||
    (currentUser && o.user_id === currentUser.id)
  );

  return (
    <>
      {successOrder && <ConfettiEffect />}
      <Header 
        activePage={activePage}
        setActivePage={(page) => {
          setActivePage(page);
          setSuccessOrder(null);
          setSelectedProduct(null);
        }}
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
        onProfileClick={() => setIsAuthOpen(true)}
        user={currentUser}
        logout={handleLogout}
        onSearchToggle={handleSearchToggle}
      />

      {/* Main Content Layout routing */}
      <main className="main-content-layout">
        {successOrder ? (
          // Order Confirmation Success Screen
          <div className="order-success-screen container animate-slideUp">
            <div className="success-badge-circle">
              <CheckCircle2 size={48} />
            </div>
            <h1>Your Couture Order is Placed!</h1>
            <p className="order-sub-heading">Thank you for shopping with InibyMaya. Your traditional garment details are logged in our tailoring workshop.</p>
            
            <div className="success-card">
              <div className="card-header">
                <div>
                  <span>Order ID</span>
                  <h3>{successOrder.id}</h3>
                </div>
                <div>
                  <span>Estimated Delivery</span>
                  <h3>
                    {successOrder.items.some(i => i.wantsCustomStitching) 
                      ? '7 to 10 Business Days (Custom Tailored)' 
                      : '3 to 5 Business Days'
                    }
                  </h3>
                </div>
              </div>
              
              <div className="success-items-list">
                {successOrder.items.map((item, idx) => (
                  <div key={idx} className="success-item-row">
                    <img src={item.product.images[0]} alt={item.product.title} />
                    <div className="item-detail-column">
                      <h4>{item.product.title}</h4>
                      <span>Qty: {item.quantity} | Color: {item.color} | Size: {item.size}</span>
                      {item.wantsCustomStitching && (
                        <span className="tailoring-pill">Bespoke Fit Required</span>
                      )}
                    </div>
                    <strong className="item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</strong>
                  </div>
                ))}
              </div>

              <div className="success-totals-box">
                <div className="total-row">
                  <span>Cash on Delivery Shipping</span>
                  <span>{successOrder.shipping === 0 ? 'FREE' : `₹${successOrder.shipping}`}</span>
                </div>
                <div className="total-row grand">
                  <span>Amount Due (COD)</span>
                  <span>₹{successOrder.total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="success-shipping-info">
                <div className="info-block">
                  <Truck size={18} />
                  <div>
                    <h5>Shipping To</h5>
                    <p>{successOrder.shippingDetails.name}</p>
                    <p>{successOrder.shippingDetails.address}, {successOrder.shippingDetails.city} - {successOrder.shippingDetails.pincode}</p>
                  </div>
                </div>
                <div className="info-block">
                  <Calendar size={18} />
                  <div>
                    <h5>Status Updates</h5>
                    <p>Tracking updates and invoices will be sent to {currentUser?.email}.</p>
                  </div>
                </div>
              </div>
            </div>

            <button className="btn-primary back-to-shop-btn" onClick={() => { setSuccessOrder(null); setActivePage('shop'); }}>
              <ArrowLeft size={16} />
              <span>Continue Shopping</span>
            </button>
          </div>
        ) : selectedProduct ? (
          <ProductDetailModal 
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={handleAddToCart}
            preselectedSize={preselectedSize}
          />
        ) : activePage === 'home' ? (
          // Home Page
          <>
            <Hero onShopClick={() => setActivePage('shop')} />
            
            {/* 1. Couture Reels in Motion Showcase */}
            <section className="reels-section container">
              <div className="section-header-centered">
                <h2>Couture In Motion</h2>
                <p>Experience the flow, weight, and texture of our hand-crafted silhouettes in real-time motion loops.</p>
              </div>
              
              <div className="reels-section-wrapper">
                <button className="reels-nav-btn prev" onClick={() => handleScrollReels('left')} aria-label="Previous Reels">
                  <ChevronLeft size={20} />
                </button>
                <button className="reels-nav-btn next" onClick={() => handleScrollReels('right')} aria-label="Next Reels">
                  <ChevronRight size={20} />
                </button>

                {reelsList.length > 0 ? (
                  <div className="reels-carousel-container scroll-layout">
                    {reelsList.map(reel => (
                      <div key={reel.id} className="reel-card-wrapper">
                        <div 
                          className={`reel-card ${activeReelId === reel.id ? 'active-playing' : ''}`}
                          onMouseEnter={(e) => {
                            setIsAutoScrolling(false);
                            setActiveReelId(reel.id);
                            const video = e.currentTarget.querySelector('video');
                            if (video) {
                              document.querySelectorAll('.reel-video').forEach(v => {
                                if (v !== video) {
                                  v.pause();
                                }
                              });
                              video.play().catch(err => console.log('Playback error', err));
                            }
                          }}
                          onMouseLeave={(e) => {
                            setIsAutoScrolling(true);
                            setActiveReelId(null);
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsAutoScrolling(false);
                            setActiveReelId(reel.id);
                            const video = e.currentTarget.querySelector('video');
                            if (video) {
                              document.querySelectorAll('.reel-video').forEach(v => {
                                if (v !== video) {
                                  v.pause();
                                }
                              });
                              if (video.paused) {
                                video.play().catch(err => {});
                              }
                            }
                          }}
                        >
                          <video 
                            src={reel.videoUrl} 
                            loop 
                            muted 
                            playsInline 
                            autoPlay
                            className="reel-video"
                          />
                          <div className="reel-overlay">
                            {activeReelId === reel.id ? (
                              <button 
                                className="reel-shop-now-btn animate-fadeIn" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (reel.productId) {
                                    const matched = productsList.find(p => p.id === reel.productId);
                                    if (matched) setSelectedProduct(matched);
                                  }
                                }}
                                style={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  backgroundColor: 'var(--color-accent)',
                                  color: 'var(--color-white)',
                                  border: 'none',
                                  padding: '12px 24px',
                                  borderRadius: '30px',
                                  fontWeight: 'bold',
                                  fontSize: '13px',
                                  cursor: 'pointer',
                                  boxShadow: 'var(--shadow-lg)',
                                  zIndex: 10,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                  pointerEvents: 'auto'
                                }}
                              >
                                Shop Outfit
                              </button>
                            ) : (
                              <div className="play-icon-overlay">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            )}
                            
                            <div className="reel-premium-footer">
                              {reel.productImage && (
                                <img 
                                  src={reel.productImage} 
                                  alt="Outfit thumbnail" 
                                  className="reel-thumbnail-thumb" 
                                />
                              )}
                              <div className="reel-footer-text">
                                <p className="reel-product-title">{reel.productTitle || reel.title}</p>
                                {reel.productPrice > 0 && <span className="reel-product-price">₹{reel.productPrice.toLocaleString('en-IN')}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-reels-notice">
                    <p>No video reels active. Open the Admin Console to add reels showcases.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Shop By Occasion */}
            <section className="occasion-section container">
              <div className="section-header-centered">
                <h2>Shop By Occasion</h2>
                <p>Curated ensembles designed for every moment, from intimate home gatherings to grand celebrations.</p>
              </div>

              <div className="occasion-grid">
                <div 
                  className="occasion-card" 
                  onClick={() => {
                    setSearchQuery('anarkali');
                    setActivePage('shop');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <div className="occasion-image-wrapper">
                    <img src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800" alt="Festive Couture" className="occasion-image" />
                  </div>
                  <div className="occasion-title-strip">
                    <span>Festive Couture</span>
                  </div>
                </div>

                <div 
                  className="occasion-card" 
                  onClick={() => {
                    setSearchQuery('cotton');
                    setActivePage('shop');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <div className="occasion-image-wrapper">
                    <img src="https://images.unsplash.com/photo-1609357518652-6cf0416f0cbe?q=80&w=800" alt="Daily Elegance" className="occasion-image" />
                  </div>
                  <div className="occasion-title-strip">
                    <span>Daily Elegance</span>
                  </div>
                </div>

                <div 
                  className="occasion-card" 
                  onClick={() => {
                    setSearchQuery('straight');
                    setActivePage('shop');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <div className="occasion-image-wrapper">
                    <img src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800" alt="Formal Grace" className="occasion-image" />
                  </div>
                  <div className="occasion-title-strip">
                    <span>Formal Grace</span>
                  </div>
                </div>

                <div 
                  className="occasion-card" 
                  onClick={() => {
                    setSearchQuery('set');
                    setActivePage('shop');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <div className="occasion-image-wrapper">
                    <img src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800" alt="Celebrations" className="occasion-image" />
                  </div>
                  <div className="occasion-title-strip">
                    <span>Celebrations</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Bestsellers Spotlight (Featured products) */}
            <section className="bestsellers-spotlight container">
              <div className="section-header-centered">
                <h2>Our Bestselling Couture</h2>
                <p>Explore traditional silhouettes loved by our patrons across the country.</p>
              </div>
              <div className="product-grid">
                {productsList.slice(0, 3).map(product => (
                  <ProductCard 
                    key={product.id}
                    product={product}
                    onProductClick={(prod, size) => {
                      setPreselectedSize(size);
                      setSelectedProduct(prod);
                    }}
                  />
                ))}
              </div>
              <div className="view-all-row">
                <button className="btn-primary" onClick={() => setActivePage('shop')}>View Entire Collection</button>
              </div>
            </section>

            {/* 3. Features Info Section */}
            <section className="features-info-section">
              <div className="features-info-bar container">
                <div className="feature-card">
                  <div className="feature-icon-wrapper">
                    <Sparkles size={24} strokeWidth={1.2} />
                  </div>
                  <h4>Luxury Fabrics</h4>
                  <p>Curated silk weaves, rich velvets, and handpicked linen threads.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon-wrapper">
                    <Scissors size={24} strokeWidth={1.2} />
                  </div>
                  <h4>Custom Stitching</h4>
                  <p>Provide measurements during checkout. Handcrafted by master tailors.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon-wrapper">
                    <Truck size={24} strokeWidth={1.2} />
                  </div>
                  <h4>Pan-India Delivery</h4>
                  <p>Free standard courier delivery across India on orders above ₹1,500.</p>
                </div>
              </div>
            </section>

            {/* 4. Patron Testimonials */}
            <section className="testimonials-section container">
              <div className="section-header-centered">
                <h2>What Our Patrons Say</h2>
                <p>Real stories from women who wear their confidence in every thread.</p>
              </div>

              <div className="testimonials-carousel-wrapper">
                <button className="reels-nav-btn prev" onClick={() => handleScrollTestimonials('left')} aria-label="Previous Testimonials">
                  <ChevronLeft size={20} />
                </button>
                <button className="reels-nav-btn next" onClick={() => handleScrollTestimonials('right')} aria-label="Next Testimonials">
                  <ChevronRight size={20} />
                </button>

                <div className="testimonials-carousel-container">
                  {testimonialsList.map(t => (
                    <div key={t.id} className="testimonial-slide-card">
                      {t.imageUrl && <img src={t.imageUrl} alt={`${t.name} wearing outfit`} className="testimonial-cust-img" />}
                      <div className="testimonial-card-details">
                        <p className="testimonial-card-quote">"{t.quote}"</p>
                        <div className="stars-row">
                          {Array.from({ length: t.rating || 5 }).map((_, i) => (
                            <Star key={i} size={14} fill="currentColor" />
                          ))}
                        </div>
                        <strong className="testimonial-card-name">{t.name}</strong>
                        <span className="testimonial-card-tag">{t.tag || 'HAY!'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Social Proof Footer inside Testimonials */}
              <div className="social-proof-inner">
                <h3 className="social-proof-headline">Trusted by 4 Lakh+ Women Across India</h3>
                <p className="social-proof-subtext">From first-time buyers to loyal patrons — every woman who wears InibyMaya carries a piece of handcrafted tradition.</p>
                <div className="social-proof-stats-row">
                  <div className="social-proof-stat">
                    <div className="stars-row social-proof-stars">
                      <Star size={20} fill="currentColor" />
                      <Star size={20} fill="currentColor" />
                      <Star size={20} fill="currentColor" />
                      <Star size={20} fill="currentColor" />
                      <Star size={20} fill="currentColor" />
                    </div>
                    <span className="social-proof-rating">4.89 ★ (1,867 reviews)</span>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : activePage === 'shop' ? (
          // Catalog Page
          <ProductGrid 
            products={productsList} 
            onProductClick={(prod) => setSelectedProduct(prod)} 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedSize={preselectedSize}
            setSelectedSize={setPreselectedSize}
          />
        ) : activePage === 'admin' ? (
          // Admin Dashboard
          <AdminDashboard 
            products={productsList}
            orders={ordersList}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateProduct={handleUpdateProduct}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            promosList={promosList}
            setPromosList={setPromosList}
            reelsList={reelsList}
            setReelsList={setReelsList}
            onAddPromo={handleAddPromo}
            onDeletePromo={handleDeletePromo}
            onAddReel={handleAddReel}
            onDeleteReel={handleDeleteReel}
            testimonialsList={testimonialsList}
            onAddTestimonial={handleAddTestimonial}
            onDeleteTestimonial={handleDeleteTestimonial}
            boutiqueSettings={boutiqueSettings}
            onSaveSettings={handleSaveSettings}
          />
        ) : activePage === 'info' ? (
          <InfoPage 
            tab={infoPageTab}
            setTab={setInfoPageTab}
            orders={ordersList}
            boutiqueSettings={boutiqueSettings}
          />
        ) : null}
      </main>

      {/* Footer */}
      <footer className="footer-section">
        <div className="footer-container container">
          <div className="footer-column brand-col">
            <h3 className="footer-brand">INIBYMAYA</h3>
            <p className="footer-desc">{boutiqueSettings.description}</p>
            <div className="footer-contact">
              <span>Email: {boutiqueSettings.email}</span>
              <span>Phone: {boutiqueSettings.phone}</span>
            </div>
          </div>
          <div className="footer-column">
            <h4>Boutique Collections</h4>
            <ul>
              <li><button onClick={() => setActivePage('shop')}>Long Kurtas</button></li>
              <li><button onClick={() => setActivePage('shop')}>Anarkali Suits</button></li>
              <li><button onClick={() => setActivePage('shop')}>Straight Kurtis</button></li>
              <li><button onClick={() => setActivePage('shop')}>Plazo & Co-ord Sets</button></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Customer Support</h4>
            <ul>
              <li><button onClick={() => { setActivePage('info'); setInfoPageTab('about-us'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>About Us</button></li>
              <li><button onClick={() => { setActivePage('info'); setInfoPageTab('track-order'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Track Couture Order</button></li>
              <li><button onClick={() => { setActivePage('info'); setInfoPageTab('contact-care'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Contact Care</button></li>
              <li><button onClick={() => { setActivePage('info'); setInfoPageTab('fit-guide'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Couture Fit Guide</button></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Store Policies</h4>
            <ul>
              <li><button onClick={() => { setActivePage('info'); setInfoPageTab('shipping-delivery'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Shipping & Delivery</button></li>
              <li><button onClick={() => { setActivePage('info'); setInfoPageTab('returns-alterations'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Returns & Alterations</button></li>
              <li><button onClick={() => { setActivePage('info'); setInfoPageTab('privacy-policy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Privacy Policy</button></li>
              <li><button onClick={() => { setActivePage('info'); setInfoPageTab('terms'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Terms of Service</button></li>
            </ul>
          </div>
        </div>
        <div className="footer-copyright">
          <p>© 2026 InibyMaya Couture. All rights reserved. Crafting premium heritage silhouettes.</p>
        </div>
      </footer>

      {/* MODALS */}

      {/* 1. Slide Out Cart Drawer */}
      {isCartOpen && (
        <CartDrawer 
          cartItems={cartItems}
          onClose={() => setIsCartOpen(false)}
          onUpdateQty={handleUpdateQty}
          onRemoveItem={handleRemoveCartItem}
          onCheckoutClick={handleCheckoutTrigger}
          promosList={promosList}
          autoAppliedCode={autoAppliedPromo}
        />
      )}

      {/* 3. Auth Modal (Supabase simulator) */}
      {isAuthOpen && (
        <AuthModal 
          user={currentUser}
          login={handleLogin}
          signup={handleSignup}
          logout={handleLogout}
          onClose={() => setIsAuthOpen(false)}
          orderHistory={userOrderHistory}
        />
      )}

      {/* 4. Checkout Modal (COD Only) */}
      {checkoutSummary && (
        <CheckoutModal 
          cartItems={cartItems}
          priceSummary={checkoutSummary}
          onClose={() => setCheckoutSummary(null)}
          onOrderSuccess={handleOrderSuccess}
          user={currentUser}
        />
      )}

      {/* 5. Subscribe Offer Newsletter Modal Popup */}
      {showOfferModal && (
        <div className="newsletter-overlay" onClick={() => { setShowOfferModal(false); localStorage.setItem('im_offer_modal_shown', 'true'); }}>
          <div className="newsletter-modal animate-slideDown" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close-btn" 
              onClick={() => { setShowOfferModal(false); localStorage.setItem('im_offer_modal_shown', 'true'); }}
            >
              <X size={18} />
            </button>
            
            <div className="newsletter-logo-header">INIBYMAYA</div>
            
            {offerSuccess ? (
              <div className="newsletter-success-state animate-fadeIn">
                <div className="success-sparkle" style={{ fontSize: '32px', marginBottom: '12px' }}>✨</div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: '#111827' }}>Welcome to the Club!</h3>
                <p style={{ fontSize: '13.5px', color: '#4b5563', marginBottom: '16px', lineHeight: '1.5' }}>Use the code below at checkout for 10% off your purchase:</p>
                <div className="discount-code-badge" style={{
                  background: '#f3f4f6',
                  border: '1px dashed var(--color-accent)',
                  color: 'var(--color-accent)',
                  padding: '12px 30px',
                  fontSize: '20px',
                  fontWeight: '700',
                  letterSpacing: '0.1em',
                  borderRadius: '8px',
                  margin: '16px 0 24px',
                  display: 'inline-block'
                }}>
                  WELCOME10
                </div>
                <div>
                  <button 
                    type="button"
                    className="btn-primary" 
                    onClick={() => { setShowOfferModal(false); localStorage.setItem('im_offer_modal_shown', 'true'); }}
                    style={{ borderRadius: '30px', padding: '10px 24px', fontSize: '13px' }}
                  >
                    Start Shopping
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3>Subscribe and Get 10% OFF</h3>
                <p>No Spam, No Drama – Just Good Clothes</p>

                <form onSubmit={handleSubscribeSubmit} className="newsletter-form">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <input 
                      type="email" 
                      value={subscriberContact}
                      onChange={(e) => setSubscriberContact(e.target.value)}
                      placeholder="Enter your email address"
                      required
                    />
                  </div>

                  {offerError && <p className="newsletter-error-msg">{offerError}</p>}

                  <button type="submit" className="newsletter-btn">
                    Get discount code
                  </button>
                </form>

                <span className="newsletter-policy-notice">
                  I agree to receive automated marketing updates. View our Privacy Policy and Terms of Service.
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
