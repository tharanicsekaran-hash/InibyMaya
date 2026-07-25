import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import CategoryStrip from './components/CategoryStrip';
import OffersBanner from './components/OffersBanner';
import ProductCard from './components/ProductCard';
import ProductGrid from './components/ProductGrid';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import CheckoutModal from './components/CheckoutModal';
import AdminDashboard from './components/AdminDashboard';
import ConfettiEffect from './components/ConfettiEffect';
import InfoPage from './components/InfoPage';
import ReelCard from './components/ReelCard';
import { products as initialProducts } from './data/products';
import { CheckCircle2, Calendar, Truck, ArrowLeft, Heart, ShoppingBag, Sparkles, Scissors, X, Film, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase, supabaseMedia } from './supabaseClient';
import './App.css';

// Database column mapping helpers
const mapDbProductToClient = (dbProd) => {
  const hNewArrival = dbProd.highlights?.newArrival;
  const isNewArrival = dbProd.new_arrival !== undefined 
    ? Boolean(dbProd.new_arrival) 
    : (hNewArrival !== undefined ? Boolean(hNewArrival) : Boolean(dbProd.newArrival));

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
    bestSeller: Boolean(dbProd.best_seller),
    newArrival: isNewArrival,
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
    best_seller: Boolean(clientProd.bestSeller),
    new_arrival: Boolean(clientProd.newArrival),
    occasion: clientProd.occasion || 'Daily Elegance',
    highlights: {
      ...(clientProd.highlights || {}),
      newArrival: Boolean(clientProd.newArrival)
    }
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
    product_id: (clientReel.productId && clientReel.productId !== 'none' && String(clientReel.productId).trim() !== '') ? clientReel.productId : null,
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
  let parsedItems = dbOrder.items;
  if (typeof parsedItems === 'string') {
    try { parsedItems = JSON.parse(parsedItems); } catch (e) {}
  }
  let parsedShipping = dbOrder.shipping_details;
  if (typeof parsedShipping === 'string') {
    try { parsedShipping = JSON.parse(parsedShipping); } catch (e) {}
  }

  return {
    id: dbOrder.id,
    user_id: dbOrder.user_id,
    userId: dbOrder.user_id,
    items: Array.isArray(parsedItems) ? parsedItems : [],
    shippingDetails: parsedShipping || {},
    subtotal: Number(dbOrder.subtotal || 0),
    discount: Number(dbOrder.discount || 0),
    shipping: Number(dbOrder.shipping || 0),
    total: Number(dbOrder.total || 0),
    paymentId: dbOrder.payment_id || '',
    status: dbOrder.status || 'Pending',
    trackingNumber: dbOrder.tracking_number || '',
    notes: dbOrder.notes || '',
    timestamp: dbOrder.timestamp || new Date().toISOString()
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
      newsletterEnabled: true,
      categories: JSON.stringify([
        { name: 'Long Kurtas', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=200&auto=format&fit=crop', filter: 'Long Kurtas' },
        { name: 'Straight Kurtas', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=200&auto=format&fit=crop', filter: 'Straight Kurtas' },
        { name: 'Anarkali Suits', image: 'https://images.unsplash.com/photo-1609357518652-6cf0416f0cbe?q=80&w=200&auto=format&fit=crop', filter: 'Anarkali Suits' },
        { name: 'Co-ord Sets', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=200&auto=format&fit=crop', filter: 'Co-ord Sets' },
        { name: 'A-Line Kurtas', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=200&auto=format&fit=crop', filter: 'A-Line Kurtas' },
        { name: 'Custom Tailoring', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=200&auto=format&fit=crop', filter: 'custom' }
      ]),
      occasions: JSON.stringify([
        { name: 'Festive Couture', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800', filter: 'anarkali' },
        { name: 'Daily Elegance', image: 'https://images.unsplash.com/photo-1609357518652-6cf0416f0cbe?q=80&w=800', filter: 'cotton' },
        { name: 'Formal Grace', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800', filter: 'straight' },
        { name: 'Celebrations', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800', filter: 'set' }
      ]),
      offerBanners: JSON.stringify([
        {
          id: 'default-offer-1',
          image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1600',
          mobileImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
          title: 'Special Festive Couture Offer'
        }
      ])
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
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        productId: 'im-kurtaset-1',
        productTitle: 'Indigo Chikankari Cotton Long Kurta',
        productPrice: 2499,
        productImage: 'https://images.unsplash.com/photo-1609357518652-6cf0416f0cbe?q=80&w=800'
      },
      {
        id: 'reel-2',
        title: 'Ivory Georgette Anarkali Elegance',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        productId: 'im-anarkali-1',
        productTitle: 'Ivory Georgette Anarkali Suit',
        productPrice: 3899,
        productImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800'
      },
      {
        id: 'reel-3',
        title: 'Sage Green Organza Motion Line',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
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

  // Favorites State (stored in localStorage)
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('im_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Current session user (Supabase simulator)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('im_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Top Welcome Push Notification Toast
  const [authToast, setAuthToast] = useState(null);

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
  const [isDbRlsActive, setIsDbRlsActive] = useState(false);
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

  // 1. Initial Supabase Fetch & Session Bindings (Optimized for Instant Storefront Settings Load)
  useEffect(() => {
    const loadSupabaseData = async () => {
      if (!supabase) return;

      // 1a. Load Settings IMMEDIATELY with a 2.5s max timeout so Hero & Offer Banners render instantly!
      try {
        const mediaClient = supabaseMedia || supabase;
        const settingsPromise = mediaClient.from('settings').select('key, value');
        const timeoutPromise = new Promise(resolve => setTimeout(() => resolve({ data: null, error: 'Timeout' }), 2500));
        const { data: sData } = await Promise.race([settingsPromise, timeoutPromise]);

        if (sData && Array.isArray(sData) && sData.length > 0) {
          const settingsObj = {};
          sData.forEach(item => {
            if (item.key && item.value) {
              settingsObj[item.key] = item.value;
            }
          });
          setBoutiqueSettings(prev => {
            const updated = { ...prev, ...settingsObj };
            safeSetItem('im_settings', JSON.stringify(updated));
            return updated;
          });
        }
      } catch (err) {
        console.warn('Instant settings sync bypassed:', err);
      }

      // 1b. Load products table immediately with top priority (Instant Mobile & Desktop Render)
      try {
        const { data: prodData, error: prodErr } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (prodData && Array.isArray(prodData)) {
          const remoteProds = prodData.map(mapDbProductToClient);
          setProductsList(remoteProds);
          safeSetItem('im_catalog', JSON.stringify(remoteProds));
        } else if (prodErr) {
          console.warn('Primary products fetch notice:', prodErr.message);
        }
      } catch (err) {
        console.warn('Products query exception:', err);
      }

      // 1c. Load remaining auxiliary tables (Reels, Promos, Orders, Testimonials)
      try {
        const mediaClient = supabaseMedia || supabase;
        const [
          rRes,
          promoRes,
          oRes,
          tRes
        ] = await Promise.all([
          mediaClient.from('reels').select('*').order('created_at', { ascending: true }).catch(() => ({ data: null })),
          supabase.from('promos').select('*').catch(() => ({ data: null })),
          supabase.from('orders').select('*').order('timestamp', { ascending: false }).catch(() => ({ data: null })),
          mediaClient.from('testimonials').select('*').order('created_at', { ascending: true }).catch(() => ({ data: null }))
        ]);

        if (rRes?.data && Array.isArray(rRes.data)) {
          const remoteReels = rRes.data.map(mapDbReelToClient);
          setReelsList(remoteReels);
          safeSetItem('im_reels', JSON.stringify(remoteReels));
        }
        if (promoRes?.data && Array.isArray(promoRes.data)) setPromosList(promoRes.data.map(mapDbPromoToClient));
        if (oRes?.data && Array.isArray(oRes.data)) {
          const remoteOrders = oRes.data.map(mapDbOrderToClient);
          setOrdersList(remoteOrders);
          safeSetItem('im_orders', JSON.stringify(remoteOrders));
        }
        if (tRes?.data && Array.isArray(tRes.data)) {
          setTestimonialsList(tRes.data.map(t => ({
            id: t.id,
            name: t.name,
            imageUrl: t.image_url,
            quote: t.quote,
            rating: t.rating,
            tag: t.tag
          })));
        }
      } catch (err) {
        console.warn('Background sync complete with fallbacks:', err);
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
            .select('id, name, email, phone')
            .eq('id', session.user.id)
            .maybeSingle();

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

      // Realtime Orders Subscription
      const ordersChannel = supabase
        .channel('realtime:orders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
          console.log('Realtime order change detected:', payload);
          if (payload.eventType === 'INSERT') {
            const newOrder = mapDbOrderToClient(payload.new);
            setOrdersList(prev => {
              if (prev.some(o => o.id === newOrder.id)) return prev;
              return [newOrder, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedOrder = mapDbOrderToClient(payload.new);
            setOrdersList(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
          } else if (payload.eventType === 'DELETE') {
            setOrdersList(prev => prev.filter(o => o.id !== payload.old.id));
          }
        })
        .subscribe();

      // Realtime Testimonials Subscription — keeps customer page in sync when admin adds/removes reviews
      const testimonialsChannel = supabase
        .channel('realtime:testimonials')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, (payload) => {
          console.log('Realtime testimonial change detected:', payload);
          if (payload.eventType === 'INSERT') {
            const newT = {
              id: payload.new.id,
              name: payload.new.name,
              imageUrl: payload.new.image_url,
              quote: payload.new.quote,
              rating: payload.new.rating,
              tag: payload.new.tag
            };
            setTestimonialsList(prev => {
              if (prev.some(t => t.id === newT.id)) return prev;
              return [...prev, newT];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedT = {
              id: payload.new.id,
              name: payload.new.name,
              imageUrl: payload.new.image_url,
              quote: payload.new.quote,
              rating: payload.new.rating,
              tag: payload.new.tag
            };
            setTestimonialsList(prev => prev.map(t => t.id === updatedT.id ? updatedT : t));
          } else if (payload.eventType === 'DELETE') {
            setTestimonialsList(prev => prev.filter(t => t.id !== payload.old.id));
          }
        })
        .subscribe();

      // Realtime Products Subscription — keeps user console in sync when admin adds/edits/deletes products
      const productsChannel = supabase
        .channel('realtime:products')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
          console.log('Realtime product change detected:', payload);
          if (payload.eventType === 'INSERT') {
            const newProd = mapDbProductToClient(payload.new);
            setProductsList(prev => {
              if (prev.some(p => p.id === newProd.id)) return prev;
              return [newProd, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedProd = mapDbProductToClient(payload.new);
            setProductsList(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
          } else if (payload.eventType === 'DELETE') {
            setProductsList(prev => prev.filter(p => p.id !== payload.old.id));
          }
        })
        .subscribe();

      // Realtime Reels Subscription — keeps admin panel & customer console in sync when reels are published or removed
      const reelsChannel = supabase
        .channel('realtime:reels')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'reels' }, (payload) => {
          console.log('Realtime reel change detected:', payload);
          if (payload.eventType === 'INSERT') {
            const newReel = mapDbReelToClient(payload.new);
            setReelsList(prev => {
              if (prev.some(r => r.id === newReel.id)) return prev;
              return [...prev, newReel];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedReel = mapDbReelToClient(payload.new);
            setReelsList(prev => prev.map(r => r.id === updatedReel.id ? updatedReel : r));
          } else if (payload.eventType === 'DELETE') {
            setReelsList(prev => prev.filter(r => r.id !== payload.old.id));
          }
        })
        .subscribe();

      return () => {
        subscription?.unsubscribe();
        supabase.removeChannel(ordersChannel);
        supabase.removeChannel(testimonialsChannel);
        supabase.removeChannel(productsChannel);
        supabase.removeChannel(reelsChannel);
      };
    }
  }, [activePage]);

  // Centralized Scroll-to-Top trigger upon view/tab/order/product transitions
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activePage, infoPageTab, selectedProduct, successOrder]);

  // LocalStorage backups (for hybrid fallback operation)
  const safeSetItem = (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      // Quietly handle storage limits without console warnings
    }
  };

  useEffect(() => {
    // Strip large base64 image blobs from catalog before storing in localStorage to avoid quota crash,
    // while providing a valid fallback image URL so product cards are always displayed cleanly on user console.
    const fallbackUrl = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800';
    const catalogForStorage = productsList.map(p => ({
      ...p,
      images: (p.images || []).map(img => (img && img.startsWith('data:')) ? fallbackUrl : (img || fallbackUrl))
    }));
    safeSetItem('im_catalog', JSON.stringify(catalogForStorage));
  }, [productsList]);

  useEffect(() => {
    // Strip base64 product images from cart items before storing
    const cartForStorage = cartItems.map(item => ({
      ...item,
      product: {
        ...item.product,
        images: (item.product?.images || []).map(img => (img && img.startsWith('data:')) ? '' : img)
      }
    }));
    safeSetItem('im_cart', JSON.stringify(cartForStorage));
  }, [cartItems]);

  useEffect(() => {
    safeSetItem('im_orders', JSON.stringify(ordersList));
  }, [ordersList]);

  useEffect(() => {
    safeSetItem('im_promos', JSON.stringify(promosList));
  }, [promosList]);

  useEffect(() => {
    // Strip large base64 video blobs and data URLs from reels before storing - videos can be 10MB+ encoded
    const reelsForStorage = reelsList.map(r => ({
      ...r,
      videoUrl: (r.videoUrl && r.videoUrl.startsWith('data:')) ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' : r.videoUrl,
      videoFile: (r.videoFile && r.videoFile.startsWith('data:')) ? null : r.videoFile,
      thumbnailFile: (r.thumbnailFile && r.thumbnailFile.startsWith('data:')) ? null : r.thumbnailFile,
    }));
    safeSetItem('im_reels', JSON.stringify(reelsForStorage));
  }, [reelsList]);

  useEffect(() => {
    // Strip base64 testimonial avatar images before storing
    const testimonialsForStorage = testimonialsList.map(t => ({
      ...t,
      imageUrl: (t.imageUrl && t.imageUrl.startsWith('data:')) ? '' : t.imageUrl
    }));
    safeSetItem('im_testimonials', JSON.stringify(testimonialsForStorage));
  }, [testimonialsList]);

  useEffect(() => {
    if (currentUser) {
      safeSetItem('im_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('im_user');
    }
  }, [currentUser]);

  useEffect(() => {
    safeSetItem('im_settings', JSON.stringify(boutiqueSettings));
  }, [boutiqueSettings]);

  useEffect(() => {
    safeSetItem('im_favorites', JSON.stringify(favorites));
  }, [favorites]);

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
    const userName = userObj.name || (userObj.email ? userObj.email.split('@')[0] : 'Valued Customer');
    setAuthToast(`Welcome back, ${userName}! ✨`);
    setTimeout(() => {
      setAuthToast(null);
    }, 3000);
  };
  const handleSignup = (userObj) => {
    setCurrentUser(userObj);
    setIsAuthOpen(false);
    const userName = userObj.name || (userObj.email ? userObj.email.split('@')[0] : 'Valued Customer');
    setAuthToast(`Hello, ${userName}! Welcome to Ini by Maya ✨`);
    setTimeout(() => {
      setAuthToast(null);
    }, 3000);
  };
  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    setActivePage('home');
  };

  const handleOpenProfile = async () => {
    setIsAuthOpen(true);
    if (supabase) {
      try {
        const { data: oData, error: oErr } = await supabase
          .from('orders')
          .select('id, user_id, items, shipping_details, subtotal, discount, shipping, total, payment_id, status, tracking_number, notes, timestamp')
          .order('timestamp', { ascending: false });
        if (!oErr && oData) {
          const remoteOrders = oData.map(mapDbOrderToClient);
          setOrdersList(remoteOrders);
          safeSetItem('im_orders', JSON.stringify(remoteOrders));
        }
      } catch (err) {
        console.error('Failed to sync orders background fetch:', err);
      }
    }
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
  };

  const handleToggleFavorite = (productId) => {
    setFavorites(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
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
    setProductsList(prev => {
      const updated = prev.some(p => p.id === newProd.id) ? prev.map(p => p.id === newProd.id ? newProd : p) : [newProd, ...prev];
      safeSetItem('im_catalog', JSON.stringify(updated));
      return updated;
    });
    if (supabase) {
      try {
        const payload = mapClientProductToDb(newProd);
        const { error } = await supabase.from('products').upsert(payload);
        if (error) {
          console.warn('Supabase product upsert initial attempt error, retrying fallback:', error.message);
          delete payload.new_arrival;
          await supabase.from('products').upsert(payload);
        }
      } catch (err) {
        console.error('Product save error:', err);
      }
    }
  };
  const handleDeleteProduct = async (id) => {
    setProductsList(prev => {
      const updated = prev.filter(p => p.id !== id);
      safeSetItem('im_catalog', JSON.stringify(updated));
      return updated;
    });
    if (supabase) {
      await supabase.from('products').delete().eq('id', id);
    }
  };
  const handleUpdateProduct = async (updatedProd) => {
    setProductsList(prev => {
      const updated = prev.map(p => p.id === updatedProd.id ? updatedProd : p);
      safeSetItem('im_catalog', JSON.stringify(updated));
      return updated;
    });
    if (supabase) {
      try {
        const payload = mapClientProductToDb(updatedProd);
        const { error } = await supabase.from('products').update(payload).eq('id', updatedProd.id);
        if (error) {
          console.warn('Supabase product update initial attempt error, retrying fallback:', error.message);
          delete payload.new_arrival;
          await supabase.from('products').update(payload).eq('id', updatedProd.id);
        }
      } catch (err) {
        console.error('Product update error:', err);
      }
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
    setReelsList(prev => {
      const updated = prev.some(r => r.id === newReel.id) ? prev.map(r => r.id === newReel.id ? newReel : r) : [...prev, newReel];
      safeSetItem('im_reels', JSON.stringify(updated));
      return updated;
    });

    const client = supabaseMedia || supabase;
    if (client) {
      try {
        const { error } = await client.from('reels').upsert(mapClientReelToDb(newReel));
        if (error) {
          console.error('Supabase reels table upsert failed:', error.message, error);
        }
      } catch (err) {
        console.error('Failed to sync reel with Supabase:', err);
      }
    }
  };
  const handleDeleteReel = async (id) => {
    setReelsList(prev => {
      const updated = prev.filter(r => r.id !== id);
      safeSetItem('im_reels', JSON.stringify(updated));
      return updated;
    });
    const client = supabaseMedia || supabase;
    if (client) {
      await client.from('reels').delete().eq('id', id);
    }
  };

  // Testimonials Configuration sync helpers
  const handleAddTestimonial = async (newT) => {
    setTestimonialsList(prev => [...prev, newT]);
    const client = supabaseMedia || supabase;
    if (client) {
      try {
        await client.from('testimonials').insert({
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
    const client = supabaseMedia || supabase;
    if (client) {
      try {
        await client.from('testimonials').delete().eq('id', id);
      } catch (err) {
        console.error('Failed to sync delete testimonial with Supabase:', err);
      }
    }
  };

  const handleSaveSettings = async (newSettings) => {
    setBoutiqueSettings(newSettings);
    safeSetItem('im_settings', JSON.stringify(newSettings));
    const client = supabaseMedia || supabase;
    if (client) {
      try {
        const updates = Object.keys(newSettings).map(key => ({
          key,
          value: newSettings[key]
        }));
        await client.from('settings').upsert(updates);
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
        onCustomTailoringClick={() => {
          setActivePage('shop');
          setSearchQuery('custom tailoring');
          setSuccessOrder(null);
          setSelectedProduct(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onAboutClick={() => {
          setActivePage('info');
          setInfoPageTab('about-us');
          setSuccessOrder(null);
          setSelectedProduct(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
        onProfileClick={handleOpenProfile}
        user={currentUser}
        logout={handleLogout}
        onSearchToggle={handleSearchToggle}
        favoritesCount={favorites.length}
        onFavoritesClick={() => {
          setActivePage('favorites');
          setSuccessOrder(null);
          setSelectedProduct(null);
        }}
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

              {(successOrder.status === 'Cancelled' || successOrder.status === 'Cancelled by Customer') && (
                <div className="order-cancelled-callout-bar animate-fadeIn" style={{ margin: '0 20px 20px' }}>
                  This order has been cancelled
                </div>
              )}

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

            <div className="success-actions" style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '440px', margin: '24px auto 0' }}>
              <button className="btn-primary back-to-shop-btn" style={{ width: '100%' }} onClick={() => { setSuccessOrder(null); setActivePage('shop'); }}>
                <ArrowLeft size={16} />
                <span>Continue Shopping</span>
              </button>
              
              {successOrder.status !== 'Cancelled' && successOrder.status !== 'Cancelled by Customer' && (
                <button 
                  className="cancel-order-success-btn"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to cancel order ${successOrder.id}?`)) {
                      handleUpdateOrderStatus(successOrder.id, 'Cancelled by Customer', successOrder.trackingNumber);
                      setSuccessOrder(prev => ({ ...prev, status: 'Cancelled by Customer' }));
                    }
                  }}
                >
                  Cancel Order
                </button>
              )}
            </div>
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
            {/* 1. Banner (Hero Multi-Slide Carousel) */}
            <Hero 
              onShopClick={() => setActivePage('shop')} 
              onCustomClick={() => {
                setActivePage('shop');
                setSearchQuery('custom tailoring');
              }}
              settings={boutiqueSettings}
            />

            {/* 2. Shop by Categories */}
            <CategoryStrip
              categories={(() => {
                try { return JSON.parse(boutiqueSettings.categories || '[]'); } catch { return []; }
              })()}
              onCategoryClick={(filter) => {
                if (filter === 'custom') {
                  setActivePage('shop');
                  setSearchQuery('custom tailoring');
                } else {
                  setSearchQuery(filter);
                  setActivePage('shop');
                }
              }}
            />

            {/* 2b. Offers Banner (Placed after Shop by Category) */}
            <OffersBanner 
              onShopClick={() => { setSearchQuery(''); setActivePage('shop'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              settings={boutiqueSettings}
            />

            {/* 3. New Arrival */}
            <section className="new-arrivals-section container">
              <div className="section-header-centered">
                <h2>New Arrivals</h2>
                <p>Fresh drops & handwoven additions curated every week for the modern wardrobe.</p>
              </div>
              <div className="product-grid">
                {productsList.filter(p => Boolean(p.newArrival)).slice(0, 4).map(product => (
                  <ProductCard 
                    key={product.id}
                    product={product}
                    isFavorite={favorites.includes(product.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onProductClick={(prod, size) => {
                      setPreselectedSize(size);
                      setSelectedProduct(prod);
                    }}
                  />
                ))}
              </div>
              <div className="view-all-row">
                <button className="btn-primary" onClick={() => { setSearchQuery('New Arrivals'); setActivePage('shop'); }}>
                  Explore All New Arrivals
                </button>
              </div>
            </section>

            {/* 4. Shop By Occasion */}
            <section className="occasion-section container">
              <div className="section-header-centered">
                <h2>Shop By Occasion</h2>
                <p>Curated ensembles designed for every moment, from intimate home gatherings to grand celebrations.</p>
              </div>

              <div className="occasion-grid">
                {(() => {
                  let occasions = [];
                  try { occasions = JSON.parse(boutiqueSettings.occasions || '[]'); } catch {}
                  if (!occasions.length) {
                    occasions = [
                      { name: 'Festive Couture', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800', filter: 'anarkali' },
                      { name: 'Daily Elegance', image: 'https://images.unsplash.com/photo-1609357518652-6cf0416f0cbe?q=80&w=800', filter: 'cotton' },
                      { name: 'Formal Grace', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800', filter: 'straight' },
                      { name: 'Celebrations', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800', filter: 'set' }
                    ];
                  }
                  return occasions.map((occ, idx) => (
                    <div 
                      key={occ.filter || idx}
                      className="occasion-card" 
                      onClick={() => {
                        setSearchQuery(occ.filter || occ.name);
                        setActivePage('shop');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      <div className="occasion-image-wrapper">
                        <img src={occ.image} alt={occ.name} className="occasion-image" />
                      </div>
                      <div className="occasion-title-strip">
                        <span>{occ.name}</span>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </section>

            {/* 5. Our Bestseller */}
            <section className="bestsellers-spotlight container">
              <div className="section-header-centered">
                <h2>Our Bestsellers</h2>
                <p>Explore traditional silhouettes loved by our patrons across the country.</p>
              </div>
              {productsList.length > 0 ? (
                <div className="product-grid">
                  {(productsList.filter(p => Boolean(p.bestSeller)).length > 0 
                    ? productsList.filter(p => Boolean(p.bestSeller)) 
                    : productsList
                  ).slice(0, 4).map(product => (
                    <ProductCard 
                      key={product.id}
                      product={product}
                      isFavorite={favorites.includes(product.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onProductClick={(prod, size) => {
                        setPreselectedSize(size);
                        setSelectedProduct(prod);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                  <p>No active boutique creations yet. Publish products from the Admin Console to feature them here.</p>
                </div>
              )}
              <div className="view-all-row">
                <button className="btn-primary" onClick={() => setActivePage('shop')}>View Entire Collection</button>
              </div>
            </section>

            {/* 6. Reels */}
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
                      <ReelCard
                        key={reel.id}
                        reel={reel}
                        onShopOutfit={() => {
                          if (reel.productId) {
                            const matched = productsList.find(p => p.id === reel.productId);
                            if (matched) setSelectedProduct(matched);
                          }
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="empty-reels-notice">
                    <p>No video reels active. Open the Admin Console to add reels showcases.</p>
                  </div>
                )}
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
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        ) : activePage === 'favorites' ? (
          // Favorites Page
          <div className="favorites-page-container container">
            <div className="section-header-centered" style={{ marginBottom: '40px' }}>
              <h2>My Favorites</h2>
              <p>Keep track of the custom couture styles you love the most.</p>
            </div>
            {favorites.length > 0 ? (
              <div className="catalog-products-grid animate-slideUp">
                {productsList
                  .filter(p => favorites.includes(p.id))
                  .map(product => (
                    <ProductCard 
                      key={product.id}
                      product={product}
                      isFavorite={true}
                      onToggleFavorite={handleToggleFavorite}
                      onProductClick={(prod, size) => {
                        setPreselectedSize(size);
                        setSelectedProduct(prod);
                      }}
                    />
                  ))
                }
              </div>
            ) : (
              <div className="favorites-empty-state card animate-slideUp" style={{ border: '1px dashed var(--color-border)', borderRadius: '12px' }}>
                <div className="favorites-empty-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                  <Heart size={48} strokeWidth={1} style={{ color: 'var(--color-border)' }} />
                </div>
                <h3>Your wishlist is empty</h3>
                <p>Browse our curated collections of premium long kurtas, anarkalis, and suit sets to save your favorites here.</p>
                <button className="btn-primary" onClick={() => setActivePage('shop')}>
                  Browse Collection
                </button>
              </div>
            )}
          </div>
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
            isDbRlsActive={isDbRlsActive}
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
            <div className="footer-logo-wrapper" style={{ marginBottom: '16px' }}>
              <img src="/footer-logo.png" alt="INI By Maya" className="footer-logo-img" style={{ height: '48px', width: 'auto' }} />
            </div>
            <p className="footer-desc">{boutiqueSettings.description}</p>
            <div className="footer-contact">
              <p className="footer-contact-item"><strong>Email:</strong> {boutiqueSettings.email}</p>
              <p className="footer-contact-item"><strong>Phone:</strong> {boutiqueSettings.phone}</p>
            </div>
            <div className="footer-instagram-card">
              <a 
                href="https://www.instagram.com/inibymaya?igsh=MWl1MXh3anNucDJyNg==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="insta-profile-wrapper"
                title="Follow INI By Maya on Instagram"
              >
                <div className="insta-story-ring">
                  <div className="insta-avatar-circle">
                    <img src="/footer-logo.png" alt="INI by Maya" className="insta-avatar-img" />
                  </div>
                </div>
                <div className="insta-profile-details">
                  <div className="insta-handle-row">
                    <span className="insta-profile-name">INI BY MAYA</span>
                    <svg className="insta-verified-badge" width="14" height="14" viewBox="0 0 24 24" fill="#3897f0">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <span className="insta-profile-username">@inibymaya</span>
                  <span className="insta-followers-tag">Join 50K+ Couture Community</span>
                </div>
              </a>
              <a 
                href="https://www.instagram.com/inibymaya?igsh=MWl1MXh3anNucDJyNg==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="insta-follow-btn"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                <span>Follow</span>
              </a>
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
          onUpdateOrderStatus={handleUpdateOrderStatus}
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
            
            <div className="newsletter-logo-header" style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <img src="/logo.png" alt="INI By Maya" style={{ height: '42px', width: 'auto' }} />
            </div>
            
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

      {/* Top Floating Push Notification Toast */}
      {authToast && (
        <div className="top-login-toast">
          <span className="top-login-toast-icon">
            <Sparkles size={18} />
          </span>
          <span>{authToast}</span>
        </div>
      )}
    </>
  );
}
