import React, { useState, useEffect, useMemo } from 'react';
import { Package, BarChart3, ShoppingBag, PlusCircle, Trash2, CheckCircle2, User, Ruler, Tag, Edit3, XCircle, X, Phone, Truck, Film, Upload, Settings, Layout, ChevronUp, ChevronDown, Plus, Mail, FileText, Download, Sparkles, Palette, Check, Search } from 'lucide-react';
import { uploadFileToGithub } from '../utils/githubUploader';
import { sendOrderConfirmationEmail } from '../utils/resendEmail';
import { DEFAULT_FOOTER_PAGES } from '../utils/footerPagesData';
import { DEFAULT_CUSTOMIZER_PARTS } from '../utils/customizerData';
import { renderRichTextHtml } from '../utils/textParser';
import RichTextEditor from './RichTextEditor';

function DonutChart({ data, centerTitle, centerSub }) {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  if (total === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
        No orders found for selected timeframe.
      </div>
    );
  }

  let accumulatedAngle = 0;
  const radius = 70;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;

  const slices = data.map((item, idx) => {
    const percentage = item.value / total;
    const strokeDasharray = `${percentage * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedAngle * circumference;
    accumulatedAngle += percentage;

    return (
      <circle
        key={idx}
        cx="100"
        cy="100"
        r={radius}
        fill="transparent"
        stroke={item.color}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
        style={{ transition: 'stroke-dashoffset 0.6s ease, stroke-dasharray 0.6s ease' }}
      />
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <div style={{ position: 'relative', width: '190px', height: '190px' }}>
        <svg viewBox="0 0 200 200" width="190" height="190" style={{ transform: 'rotate(-90deg)' }}>
          {slices}
        </svg>
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          <span style={{ fontSize: '22px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{centerTitle}</span>
          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{centerSub}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', width: '100%' }}>
        {data.map((item, idx) => {
          const pct = Math.round((item.value / total) * 100);
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color, display: 'inline-block' }}></span>
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: '500' }}>{item.label}</span>
              </div>
              <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{item.value} ({pct}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HorizontalBarList({ items }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      {items.map((item, idx) => {
        const pct = item.maxVal > 0 ? Math.min(100, Math.round((item.value / item.maxVal) * 100)) : 0;
        return (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ fontWeight: '500', color: 'var(--color-text-primary)' }}>{item.label}</span>
              <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
                {item.subtext || `${item.value}`}
              </span>
            </div>
            <div style={{ height: '8px', width: '100%', backgroundColor: 'rgba(0, 0, 0, 0.06)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, backgroundColor: item.color || '#8b0000', borderRadius: '4px', transition: 'width 0.5s ease' }}></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const getSleeveName = (id) => {
  const sleevesMap = {
    'thin-strap': 'Thin Strap',
    '1inch-strap': '1 Inch Strap',
    'tank': 'Tank',
    'cap': 'Cap Sleeves',
    'short': 'Short Sleeves',
    'short-balloon': 'Short Balloon Puff',
    'above-elbow': 'Above Elbow',
    'above-elbow-puff': 'Above Elbow With Puff',
    'three-quarter': 'Three Quarter Sleeves',
    'full': 'Full Sleeves',
    'chudidaar': 'Chudidaar',
    'bell': 'Full Bell Sleeves'
  };
  return sleevesMap[id] || id;
};

const getNeckName = (id) => {
  const necksMap = {
    'round': 'Round Neck',
    'v-neck': 'V Neck',
    'scalloped-round': 'Scalloped Round Neck',
    'scalloped-v': 'Scalloped V Neck',
    'square': 'Square Neck',
    'rectangular': 'Rectangular Neck',
    'sweetheart': 'Sweetheart Neck',
    'keyhole': 'Round Keyhole With Button',
    'round-v-cut': 'Round V Cut',
    'paan': 'Paan Neck',
    'masaba': 'Masaba Neck',
    'halter': 'Halter Neck',
    'v-overlap': 'V-Overlap Collar',
    'chinese': 'Chinese Collar',
    'shirt': 'Shirt Collar',
    'kaftan': 'Kaftan Neck',
    'boat': 'Boat Neck',
    'sabrina': 'Sabrina Neck',
    'glass': 'Glass Neck',
    'diamond': 'Diamond Neck'
  };
  return necksMap[id] || id;
};

// Utility to format GitHub web URLs to clean raw CDN links for public repository media
export const formatGithubUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  let trimmed = url.trim();

  // If URL is already a raw GitHub CDN link, return as is!
  if (trimmed.includes('raw.githubusercontent.com')) {
    return trimmed;
  }

  // Convert GitHub blob web link (e.g. github.com/user/repo/blob/main/public/media/...) to raw CDN link
  if (trimmed.includes('github.com') && trimmed.includes('/blob/')) {
    return trimmed
      .replace('github.com', 'raw.githubusercontent.com')
      .replace('/blob/', '/');
  }

  // Convert relative path if user typed public/media/... or media/...
  if (trimmed.startsWith('public/media/')) {
    return `https://raw.githubusercontent.com/tharanicsekaran-hash/InibyMaya/main/${trimmed}`;
  }
  if (trimmed.startsWith('media/')) {
    return `https://raw.githubusercontent.com/tharanicsekaran-hash/InibyMaya/main/public/${trimmed}`;
  }

  return trimmed;
};

// Curated boutique starter color palette for InibyMaya
export const DEFAULT_BOUTIQUE_COLORS = [
  { name: 'Wild Black', hex: '#000000' },
  { name: 'Cloud White', hex: '#ffffff' },
  { name: 'Indigo Blue', hex: '#1a365d' },
  { name: 'Royal Blue', hex: '#2563eb' },
  { name: 'Peacock Blue', hex: '#004d65' },
  { name: 'Dreamy Green', hex: '#263e0f' },
  { name: 'Sage Green', hex: '#84a98c' },
  { name: 'Mud Green', hex: '#4f5504' },
  { name: 'Olive Green', hex: '#556b2f' },
  { name: 'Pink', hex: '#f240a8' },
  { name: 'Blush Pink', hex: '#f472b6' },
  { name: 'Mandarin Orange', hex: '#ff6a00' },
  { name: 'Yellow', hex: '#e9ec3c' },
  { name: 'Fresh Cream', hex: '#ffecd4' },
  { name: 'Clay Gray', hex: '#474747' },
  { name: 'Dirty Grey', hex: '#48505b' },
  { name: 'Maroon', hex: '#831843' },
  { name: 'Rust Red', hex: '#b91c1c' },
  { name: 'Lavender', hex: '#c084fc' }
];

// Helper to strictly deduplicate colors by trimmed case-insensitive name AND hex code
export const deduplicateColors = (colorList = []) => {
  if (!Array.isArray(colorList)) return [];
  const seenNames = new Set();
  const seenHexes = new Set();
  const result = [];

  for (const c of colorList) {
    if (!c) continue;
    const rawName = (typeof c === 'string' ? c : c.name || '').trim();
    let rawHex = (typeof c === 'object' && c.hex ? c.hex : '#111111').trim();
    if (!rawHex.startsWith('#') && /^[0-9a-fA-F]{3,8}$/.test(rawHex)) {
      rawHex = '#' + rawHex;
    }
    if (!rawName) continue;

    const normName = rawName.toLowerCase();
    const normHex = rawHex.toLowerCase();

    if (!seenNames.has(normName) && !seenHexes.has(normHex)) {
      seenNames.add(normName);
      seenHexes.add(normHex);
      result.push({
        name: rawName,
        hex: rawHex
      });
    }
  }

  return result;
};

const DEFAULT_ADULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'];
const DEFAULT_KIDS_SIZES = [
  '0-6M', '6-12M', '1-2Y', '2-3Y', '3-4Y', '4-5Y', '5-6Y', '6-7Y', '7-8Y', '8-9Y', '9-10Y', '10-12Y', '12-14Y'
];

const toSafeSizesArray = (arr) => {
  if (Array.isArray(arr)) return arr.map(s => (s !== null && s !== undefined ? String(s).trim() : '')).filter(Boolean);
  if (typeof arr === 'string') {
    try {
      const parsed = JSON.parse(arr);
      if (Array.isArray(parsed)) return parsed.map(s => (s !== null && s !== undefined ? String(s).trim() : '')).filter(Boolean);
    } catch (e) {}
    return arr.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
};

const isKidsSizeString = (s) => /^\d+[-–]\d+[MY]|^\d+[MY]|\b(month|year|newborn|infant|toddler)\b/i.test(String(s || '').trim());

export default function AdminDashboard({ 
  products, 
  orders, 
  onAddProduct, 
  onDeleteProduct,
  onUpdateProduct,
  onUpdateOrderStatus,
  onDeleteOrder,
  promosList = [],
  setPromosList,
  reelsList = [],
  setReelsList,
  onAddPromo,
  onDeletePromo,
  onAddReel,
  onDeleteReel,
  testimonialsList = [],
  onAddTestimonial,
  onDeleteTestimonial,
  boutiqueSettings = {},
  onSaveSettings,
  onClearAllOrders,
  isDbRlsActive = false
}) {
  const [activeTab, setActiveTab] = useState('orders');
  const [deleteConfirmOrder, setDeleteConfirmOrder] = useState(null);

  // Boutique Settings Form States
  const [settingsDesc, setSettingsDesc] = useState('');
  const [settingsEmail, setSettingsEmail] = useState('');
  const [settingsPhone, setSettingsPhone] = useState('');
  const [settingsAddress, setSettingsAddress] = useState('');
  const [settingsHours, setSettingsHours] = useState('');

  const [settingsShippingPrice, setSettingsShippingPrice] = useState(() => (boutiqueSettings?.standardShippingPrice !== undefined ? Number(boutiqueSettings.standardShippingPrice) : 99));
  const [settingsFreeShippingThreshold, setSettingsFreeShippingThreshold] = useState(() => (boutiqueSettings?.freeShippingThreshold !== undefined ? Number(boutiqueSettings.freeShippingThreshold) : 1500));

  const [customAdultSizes, setCustomAdultSizes] = useState(() => {
    try {
      if (boutiqueSettings?.adultSizes) {
        const parsed = JSON.parse(boutiqueSettings.adultSizes);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_ADULT_SIZES;
  });

  const [customKidsSizes, setCustomKidsSizes] = useState(() => {
    try {
      if (boutiqueSettings?.kidsSizes) {
        const parsed = JSON.parse(boutiqueSettings.kidsSizes);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_KIDS_SIZES;
  });

  const [settingsAdultSizes, setSettingsAdultSizes] = useState(() => {
    try {
      if (boutiqueSettings?.adultSizes) {
        const parsed = JSON.parse(boutiqueSettings.adultSizes);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.join(', ');
      }
    } catch (e) {}
    return DEFAULT_ADULT_SIZES.join(', ');
  });

  const [settingsKidsSizes, setSettingsKidsSizes] = useState(() => {
    try {
      if (boutiqueSettings?.kidsSizes) {
        const parsed = JSON.parse(boutiqueSettings.kidsSizes);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.join(', ');
      }
    } catch (e) {}
    return DEFAULT_KIDS_SIZES.join(', ');
  });
  const [newsletterTitle, setNewsletterTitle] = useState('');
  const [newsletterSubtitle, setNewsletterSubtitle] = useState('');
  const [newsletterDiscount, setNewsletterDiscount] = useState(10);
  const [newsletterPromoCode, setNewsletterPromoCode] = useState('WELCOME10');
  const [newsletterEnabled, setNewsletterEnabled] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState('');

  // Resend Email Integration State
  const [resendApiKey, setResendApiKey] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('im_resend_api_key') || '' : ''));
  const [resendStatus, setResendStatus] = useState('');

  const handleSaveResendKey = (e) => {
    e.preventDefault();
    localStorage.setItem('im_resend_api_key', resendApiKey.trim());
    setResendStatus('✅ Resend API Key saved successfully!');
    setTimeout(() => setResendStatus(''), 4000);
  };

  const handleSendTestEmail = async () => {
    setResendStatus('⏳ Dispatching live test email to inibymaya@gmail.com...');
    try {
      const result = await sendOrderConfirmationEmail({
        id: 'TEST-ORDER-101',
        shippingDetails: {
          name: 'Boutique Administrator',
          email: 'inibymaya@gmail.com',
          address: 'Ini by Maya Atelier, Padur',
          city: 'Chennai',
          state: 'Tamil Nadu',
          pinCode: '603103',
          phone: '+91 98765 43210'
        },
        items: [
          {
            title: 'Ivory Chikankari Embroidered Anarkali',
            color: 'Ivory White',
            selectedSize: 'M',
            quantity: 1,
            price: 4999
          }
        ],
        subtotal: 4999,
        discount: 0,
        shippingFee: 0,
        total: 4999,
        paymentId: 'COD-TEST'
      });

      if (result && result.simulated) {
        setResendStatus('⚠️ Running in simulation mode. Enter a valid Resend API Key starting with re_ to send live emails.');
      } else if (result && result.success) {
        setResendStatus('🎉 Live Test Email sent successfully to inibymaya@gmail.com! Check your inbox.');
      } else {
        setResendStatus(`❌ Resend Notice: ${JSON.stringify(result?.error || 'Check API key or verified sender')}`);
      }
    } catch (err) {
      setResendStatus(`❌ Network Exception: ${err.message || err}`);
    }
  };

  // Storefront Categories, Occasions & Hero Banner state
  const [storefrontCategories, setStorefrontCategories] = useState([]);
  const [storefrontOccasions, setStorefrontOccasions] = useState([]);
  const [storefrontSuccessMsg, setStorefrontSuccessMsg] = useState('');

  // Header Top Announcement Banner State
  const [headerBannerEnabled, setHeaderBannerEnabled] = useState(true);
  const [headerBannerText, setHeaderBannerText] = useState('FREE SHIPPING PAN INDIA | COD AVAILABLE');
  const [headerBannerBg, setHeaderBannerBg] = useState('#f6f0e6');
  const [headerBannerColor, setHeaderBannerColor] = useState('#333333');

  // Homepage Hero Banner State
  const [heroImage, setHeroImage] = useState('');
  const [heroTagline, setHeroTagline] = useState('');
  const [heroTitleLine1, setHeroTitleLine1] = useState('');
  const [heroTitleLine2, setHeroTitleLine2] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroPrimaryBtnText, setHeroPrimaryBtnText] = useState('');
  const [heroSecondaryBtnText, setHeroSecondaryBtnText] = useState('');

  // Multi-Banner Hero Carousel State
  const [storefrontHeroBanners, setStorefrontHeroBanners] = useState([]);
  const [activeBannerTabId, setActiveBannerTabId] = useState(null);

  // Multi-Banner Offers Carousel State
  const [storefrontOfferBanners, setStorefrontOfferBanners] = useState([]);
  const [activeOfferBannerTabId, setActiveOfferBannerTabId] = useState(null);

  // Footer & Policies Pages State
  const [footerPagesConfig, setFooterPagesConfig] = useState(() => {
    try {
      if (boutiqueSettings?.footerPages) {
        return { ...DEFAULT_FOOTER_PAGES, ...JSON.parse(boutiqueSettings.footerPages) };
      }
    } catch (e) {}
    return DEFAULT_FOOTER_PAGES;
  });
  const [selectedFooterPageId, setSelectedFooterPageId] = useState('about-us');
  const [footerSaveSuccessMsg, setFooterSaveSuccessMsg] = useState('');
  const [aboutEditorMode, setAboutEditorMode] = useState('edit');

  useEffect(() => {
    if (boutiqueSettings && Object.keys(boutiqueSettings).length > 0) {
      setSettingsDesc(boutiqueSettings.description || '');
      setSettingsEmail(boutiqueSettings.email || '');
      setSettingsPhone(boutiqueSettings.phone || '');
      setSettingsAddress(boutiqueSettings.address || '');
      setSettingsHours(boutiqueSettings.hours || '');
      setSettingsShippingPrice(boutiqueSettings.standardShippingPrice !== undefined ? Number(boutiqueSettings.standardShippingPrice) : 99);
      setSettingsFreeShippingThreshold(boutiqueSettings.freeShippingThreshold !== undefined ? Number(boutiqueSettings.freeShippingThreshold) : 1500);
      if (boutiqueSettings.adultSizes) {
        try {
          const parsed = JSON.parse(boutiqueSettings.adultSizes);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCustomAdultSizes(parsed);
            setSettingsAdultSizes(parsed.join(', '));
          }
        } catch (e) {}
      }
      if (boutiqueSettings.kidsSizes) {
        try {
          const parsed = JSON.parse(boutiqueSettings.kidsSizes);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCustomKidsSizes(parsed);
            setSettingsKidsSizes(parsed.join(', '));
          }
        } catch (e) {}
      }
      setNewsletterTitle(boutiqueSettings.newsletterTitle || 'Subscribe and Get 10% OFF');
      setNewsletterSubtitle(boutiqueSettings.newsletterSubtitle || 'No Spam, No Drama – Just Good Clothes');
      setNewsletterDiscount(Number(boutiqueSettings.newsletterDiscount !== undefined ? boutiqueSettings.newsletterDiscount : 10));
      setNewsletterPromoCode(boutiqueSettings.newsletterPromoCode || 'WELCOME10');
      setNewsletterEnabled(boutiqueSettings.newsletterEnabled !== false);

      // Header Top Announcement Banner
      setHeaderBannerEnabled(boutiqueSettings.headerBannerEnabled !== false);
      setHeaderBannerText(boutiqueSettings.headerBannerText || 'FREE SHIPPING PAN INDIA | COD AVAILABLE');
      setHeaderBannerBg(boutiqueSettings.headerBannerBg || '#f6f0e6');
      setHeaderBannerColor(boutiqueSettings.headerBannerColor || '#333333');

      // Footer Pages Config
      try {
        if (boutiqueSettings.footerPages) {
          const parsedFooterPages = JSON.parse(boutiqueSettings.footerPages);
          setFooterPagesConfig(prev => ({ ...DEFAULT_FOOTER_PAGES, ...parsedFooterPages }));
        }
      } catch (e) {}

      // Hero Banner fields
      setHeroImage(boutiqueSettings.heroImage || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1600');
      setHeroTagline(boutiqueSettings.heroTagline || 'AUTUMN / WINTER 2026 COUTURE');
      setHeroTitleLine1(boutiqueSettings.heroTitleLine1 || 'Where Heritage Meets');
      setHeroTitleLine2(boutiqueSettings.heroTitleLine2 || 'Modern Couture');
      setHeroSubtitle(boutiqueSettings.heroSubtitle || 'Handcrafted Chikankari, rich velvet sets, and custom-tailored Anarkalis designed for the modern connoisseur.');
      setHeroPrimaryBtnText(boutiqueSettings.heroPrimaryBtnText || 'Explore the Collection');
      setHeroSecondaryBtnText(boutiqueSettings.heroSecondaryBtnText || 'Custom Fitting Guide');

      // Hero Banners Carousel Array
      try {
        const parsedBanners = JSON.parse(boutiqueSettings.heroBanners || '[]');
        if (Array.isArray(parsedBanners) && parsedBanners.length > 0) {
          setStorefrontHeroBanners(parsedBanners);
          setActiveBannerTabId(parsedBanners[0].id);
        } else {
          const defaultB = [
            {
              id: 'banner-1',
              image: boutiqueSettings.heroImage || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1600',
              tagline: boutiqueSettings.heroTagline || 'AUTUMN / WINTER 2026 COUTURE',
              titleLine1: boutiqueSettings.heroTitleLine1 || 'Where Heritage Meets',
              titleLine2: boutiqueSettings.heroTitleLine2 || 'Modern Couture',
              subtitle: boutiqueSettings.heroSubtitle || 'Handcrafted Chikankari, rich velvet sets, and custom-tailored Anarkalis designed for the modern connoisseur.',
              primaryBtnText: boutiqueSettings.heroPrimaryBtnText || 'Explore the Collection',
              secondaryBtnText: boutiqueSettings.heroSecondaryBtnText || 'Custom Fitting Guide'
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
          setStorefrontHeroBanners(defaultB);
          setActiveBannerTabId(defaultB[0].id);
        }
      } catch {
        setStorefrontHeroBanners([]);
      }

      // Offers Banner Carousel Array
      try {
        const parsedOffers = JSON.parse(boutiqueSettings.offerBanners || '[]');
        if (Array.isArray(parsedOffers) && parsedOffers.length > 0) {
          setStorefrontOfferBanners(parsedOffers);
          setActiveOfferBannerTabId(parsedOffers[0].id);
        } else {
          setStorefrontOfferBanners([]);
          setActiveOfferBannerTabId(null);
        }
      } catch {
        setStorefrontOfferBanners([]);
      }

      // Load categories/occasions from settings
      try { 
        const cats = JSON.parse(boutiqueSettings.categories || '[]');
        if (cats.length > 0) setStorefrontCategories(cats);
      } catch {}
      try { 
        const occs = JSON.parse(boutiqueSettings.occasions || '[]');
        if (occs.length > 0) setStorefrontOccasions(occs);
      } catch {}
      setSettingsLoaded(true);
    }
  }, [boutiqueSettings]);

  // Dynamic categories and occasions derived directly from Storefront settings & existing products
  const availableCategories = React.useMemo(() => {
    let list = [];
    if (storefrontCategories && storefrontCategories.length > 0) {
      list = storefrontCategories.map(c => (typeof c === 'string' ? c : c.name)).filter(Boolean);
    } else if (boutiqueSettings && boutiqueSettings.categories) {
      try {
        const parsed = typeof boutiqueSettings.categories === 'string' 
          ? JSON.parse(boutiqueSettings.categories) 
          : boutiqueSettings.categories;
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed.map(c => (typeof c === 'string' ? c : c.name)).filter(Boolean);
        }
      } catch (e) {}
    }

    // Fallback defaults ONLY if zero storefront categories configured
    if (list.length === 0) {
      list = ['Short kurti', 'Long Kurti', 'Crop top', 'Co-ord Sets', 'Anarkali Suits', 'Custom Tailoring'];
    }

    const combined = [...list];
    
    (products || []).forEach(p => {
      if (p && p.category && !combined.includes(p.category)) {
        combined.push(p.category);
      }
    });

    const set = new Set(combined.filter(Boolean));
    return Array.from(set);
  }, [storefrontCategories, boutiqueSettings, products]);

  const availableOccasions = React.useMemo(() => {
    let list = [];
    if (storefrontOccasions && storefrontOccasions.length > 0) {
      list = storefrontOccasions.map(o => (typeof o === 'string' ? o : o.name)).filter(Boolean);
    } else if (boutiqueSettings && boutiqueSettings.occasions) {
      try {
        const parsed = typeof boutiqueSettings.occasions === 'string' 
          ? JSON.parse(boutiqueSettings.occasions) 
          : boutiqueSettings.occasions;
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed.map(o => (typeof o === 'string' ? o : o.name)).filter(Boolean);
        }
      } catch (e) {}
    }

    // Fallback defaults ONLY if zero storefront occasions configured
    if (list.length === 0) {
      list = ['Daily Elegance', 'Festive Couture', 'Formal Grace', 'Celebrations'];
    }

    const combined = [...list];

    (products || []).forEach(p => {
      if (p && p.occasion && !combined.includes(p.occasion)) {
        combined.push(p.occasion);
      }
    });

    const set = new Set(combined.filter(Boolean));
    return ['None', ...Array.from(set)];
  }, [storefrontOccasions, boutiqueSettings, products]);

  const handleAddBannerSlide = () => {
    const newSlide = {
      id: `banner-${Date.now()}`,
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1600',
      tagline: 'NEW COUTURE BANNER',
      titleLine1: 'Handcrafted With',
      titleLine2: 'Royal Heritage',
      subtitle: 'Experience exquisite silhouettes crafted by master artisans.',
      primaryBtnText: 'Shop Collection',
      secondaryBtnText: 'Explore Fits'
    };
    setStorefrontHeroBanners(prev => [...prev, newSlide]);
    setActiveBannerTabId(newSlide.id);
  };

  const handleUpdateBannerSlide = (id, field, value) => {
    setStorefrontHeroBanners(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const handleDeleteBannerSlide = (id) => {
    if (storefrontHeroBanners.length <= 1) {
      alert('You must maintain at least one active hero banner slide.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this hero banner slide?')) {
      const filtered = storefrontHeroBanners.filter(b => b.id !== id);
      setStorefrontHeroBanners(filtered);
      if (activeBannerTabId === id) {
        setActiveBannerTabId(filtered[0]?.id || null);
      }
    }
  };

  const handleMoveBannerSlide = (index, direction) => {
    const newBanners = [...storefrontHeroBanners];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newBanners.length) return;
    const temp = newBanners[index];
    newBanners[index] = newBanners[targetIdx];
    newBanners[targetIdx] = temp;
    setStorefrontHeroBanners(newBanners);
  };

  const handleAddOfferBannerSlide = () => {
    const newSlide = {
      id: `offer-banner-${Date.now()}`,
      image: '',
      mobileImage: '',
      title: ''
    };
    setStorefrontOfferBanners(prev => [...prev, newSlide]);
    setActiveOfferBannerTabId(newSlide.id);
  };

  const handleUpdateOfferBannerSlide = (id, field, value) => {
    setStorefrontOfferBanners(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const handleDeleteOfferBannerSlide = (id) => {
    if (storefrontOfferBanners.length <= 1) {
      alert('You must maintain at least one active offer banner slide.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this offer banner slide?')) {
      const filtered = storefrontOfferBanners.filter(b => b.id !== id);
      setStorefrontOfferBanners(filtered);
      if (activeOfferBannerTabId === id) {
        setActiveOfferBannerTabId(filtered[0]?.id || null);
      }
    }
  };

  const handleMoveOfferBannerSlide = (index, direction) => {
    const newBanners = [...storefrontOfferBanners];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newBanners.length) return;
    const temp = newBanners[index];
    newBanners[index] = newBanners[targetIdx];
    newBanners[targetIdx] = temp;
    setStorefrontOfferBanners(newBanners);
  };

  const handleSaveStorefront = () => {
    if (onSaveSettings) {
      const firstBanner = storefrontHeroBanners[0] || {};
      const currentSettings = { 
        ...boutiqueSettings,
        heroImage: firstBanner.image || heroImage,
        heroTagline: firstBanner.tagline || heroTagline,
        heroTitleLine1: firstBanner.titleLine1 || heroTitleLine1,
        heroTitleLine2: firstBanner.titleLine2 || heroTitleLine2,
        heroSubtitle: firstBanner.subtitle || heroSubtitle,
        heroPrimaryBtnText: firstBanner.primaryBtnText || heroPrimaryBtnText,
        heroSecondaryBtnText: firstBanner.secondaryBtnText || heroSecondaryBtnText,
        heroBanners: JSON.stringify(storefrontHeroBanners),
        offerBanners: JSON.stringify(storefrontOfferBanners),
        categories: JSON.stringify(storefrontCategories.filter(c => c.name && c.name.trim())),
        occasions: JSON.stringify(storefrontOccasions.filter(o => o.name && o.name.trim()))
      };
      onSaveSettings(currentSettings);
      setStorefrontSuccessMsg('Storefront & Hero/Offer Banner Carousel configuration saved successfully!');
      setTimeout(() => setStorefrontSuccessMsg(''), 4000);
    }
  };

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    setSettingsSuccessMsg('');
    if (onSaveSettings) {
      onSaveSettings({
        ...boutiqueSettings,
        description: settingsDesc,
        email: settingsEmail,
        phone: settingsPhone,
        address: settingsAddress,
        hours: settingsHours,
        standardShippingPrice: Math.max(0, Number(settingsShippingPrice) || 0),
        freeShippingThreshold: Math.max(0, Number(settingsFreeShippingThreshold) || 0),
        adultSizes: JSON.stringify(settingsAdultSizes.split(',').map(s => s.trim()).filter(Boolean)),
        kidsSizes: JSON.stringify(settingsKidsSizes.split(',').map(s => s.trim()).filter(Boolean)),
        newsletterTitle,
        newsletterSubtitle,
        newsletterDiscount: Number(newsletterDiscount),
        newsletterPromoCode: newsletterPromoCode.trim().toUpperCase(),
        newsletterEnabled,
        headerBannerEnabled,
        headerBannerText,
        headerBannerBg,
        headerBannerColor
      });
      setSettingsSuccessMsg('Boutique configurations updated successfully!');
      setTimeout(() => setSettingsSuccessMsg(''), 4000);
    }
  };

  // Testimonials state managers
  const [tName, setTName] = useState('');
  const [tQuote, setTQuote] = useState('');
  const [tImageUrl, setTImageUrl] = useState('');
  const [tRating, setTRating] = useState(5);
  const [tTag, setTTag] = useState('HAY!');
  const [tSuccessMsg, setTSuccessMsg] = useState('');

  const handleTestimonialImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setTImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleTestimonialSubmit = (e) => {
    e.preventDefault();
    if (!tName || !tQuote) {
      alert('Please enter a customer name and review comment.');
      return;
    }
    const newT = {
      id: `t-${Date.now()}`,
      name: tName,
      imageUrl: tImageUrl || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800',
      quote: tQuote,
      rating: parseInt(tRating),
      tag: tTag || 'HAY!'
    };
    if (onAddTestimonial) {
      onAddTestimonial(newT);
    }
    setTName('');
    setTQuote('');
    setTImageUrl('');
    setTRating(5);
    setTTag('HAY!');
    setTSuccessMsg('Customer review published successfully!');
    setTimeout(() => setTSuccessMsg(''), 3000);
  };

  // Add/Edit product states
  const [editingProduct, setEditingProduct] = useState(null); 
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Long Kurtas');
  const [occasion, setOccasion] = useState('Daily Elegance');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [description, setDescription] = useState('');
  const [primaryImages, setPrimaryImages] = useState(['']);
  const [hoverImage, setHoverImage] = useState('');
  const [customizable, setCustomizable] = useState(true);
  const [bestSeller, setBestSeller] = useState(false);
  const [newArrival, setNewArrival] = useState(false);
  const [rating, setRating] = useState(5.0);
  const [reviewsCount, setReviewsCount] = useState(1);
  const [successMsg, setSuccessMsg] = useState('');
  const [analyticsTimeFilter, setAnalyticsTimeFilter] = useState('all');
  const [customizerPartsConfig, setCustomizerPartsConfig] = useState(() => {
    if (boutiqueSettings?.customizerParts) {
      try { return JSON.parse(boutiqueSettings.customizerParts); } catch (e) { console.error(e); }
    }
    return DEFAULT_CUSTOMIZER_PARTS;
  });
  const [newPartNameInput, setNewPartNameInput] = useState('');
  const [newStyleInputs, setNewStyleInputs] = useState({});

  // Lightweight canvas image compressor utility (cuts bandwidth & DB egress usage by 99%)
  const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleMultiplePrimaryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    for (const file of files) {
      try {
        let imageUrl;
        if (import.meta.env.VITE_GITHUB_TOKEN) {
          imageUrl = await uploadFileToGithub(file, 'media/products');
        } else {
          imageUrl = await compressImage(file);
        }
        setPrimaryImages(prev => {
          const filtered = prev.filter(x => x && x.trim() !== '');
          return [...filtered, imageUrl];
        });
      } catch (err) {
        console.error('❌ [GitHub Upload Error]:', err.message || err);
        alert(`❌ Upload Failed: ${err.message || 'Error uploading file to GitHub'}`);
      }
    }
  };

  const handleHoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      let imageUrl;
      if (import.meta.env.VITE_GITHUB_TOKEN) {
        imageUrl = await uploadFileToGithub(file, 'media/products');
      } else {
        imageUrl = await compressImage(file);
      }
      setHoverImage(imageUrl);
    } catch (err) {
      console.error('❌ [GitHub Upload Error]:', err.message || err);
      alert(`❌ Upload Failed: ${err.message || 'Error uploading file to GitHub'}`);
    }
  };

  const handleColorImageUpload = async (colorName, e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploadingColor(colorName);
    try {
      let imageUrl;
      if (import.meta.env.VITE_GITHUB_TOKEN) {
        imageUrl = await uploadFileToGithub(file, 'media/products');
      } else {
        imageUrl = await compressImage(file);
      }
      setColorImages(prev => ({
        ...prev,
        [colorName]: imageUrl
      }));
      setPrimaryImages(prev => {
        if (!prev.includes(imageUrl)) {
          const filtered = prev.filter(x => x && x.trim() !== '');
          return [...filtered, imageUrl];
        }
        return prev;
      });
    } catch (err) {
      console.error('❌ [Color Photo Upload Error]:', err.message || err);
      alert(`❌ Upload Failed: ${err.message || 'Error uploading file'}`);
    } finally {
      setUploadingColor(null);
      if (e.target) e.target.value = '';
    }
  };

  const handleAddPrimaryRow = () => {
    setPrimaryImages(prev => [...prev, '']);
  };

  const handleRemovePrimaryRow = (index) => {
    setPrimaryImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.length === 0 ? [''] : updated;
    });
  };

  const handlePrimaryTextChange = (index, value) => {
    setPrimaryImages(prev => {
      const updated = [...prev];
      updated[index] = formatGithubUrl(value);
      return updated;
    });
  };

  // Persistent Stored Boutique Colors Library (shared across all products and persisted)
  const [storedColors, setStoredColors] = useState(() => {
    let saved = [];
    try {
      const item = localStorage.getItem('im_store_colors');
      if (item) saved = JSON.parse(item);
    } catch (e) {
      console.warn('Error reading im_store_colors:', e);
    }

    const fromProducts = [];
    if (Array.isArray(products)) {
      products.forEach(p => {
        if (p.variants?.colors && Array.isArray(p.variants.colors)) {
          fromProducts.push(...p.variants.colors);
        }
      });
    }

    return deduplicateColors([...saved, ...fromProducts, ...DEFAULT_BOUTIQUE_COLORS]);
  });

  // Keep stored colors updated when catalog products load or change
  useEffect(() => {
    if (Array.isArray(products) && products.length > 0) {
      setStoredColors(prev => {
        const fromProducts = [];
        products.forEach(p => {
          if (p.variants?.colors && Array.isArray(p.variants.colors)) {
            fromProducts.push(...p.variants.colors);
          }
        });
        const merged = deduplicateColors([...prev, ...fromProducts]);
        try {
          localStorage.setItem('im_store_colors', JSON.stringify(merged));
        } catch (e) {}
        return merged;
      });
    }
  }, [products]);

  const updateStoredColors = (newColors) => {
    const deduped = deduplicateColors(newColors);
    setStoredColors(deduped);
    try {
      localStorage.setItem('im_store_colors', JSON.stringify(deduped));
    } catch (e) {}
  };

  const handleRemoveStoredColor = (e, colorName) => {
    e.stopPropagation();
    if (window.confirm(`Remove "${colorName}" from the stored colors library?`)) {
      const filtered = storedColors.filter(c => c.name.toLowerCase() !== colorName.toLowerCase());
      updateStoredColors(filtered);
    }
  };

  // Variants editing states
  const [productColors, setProductColors] = useState([]); // Starts fresh/empty for new products
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#84a98c');
  const [colorErrorMsg, setColorErrorMsg] = useState('');
  const [sizeType, setSizeType] = useState('adult'); // 'adult' or 'kids'
  const [productSizes, setProductSizes] = useState(['XS', 'S', 'M', 'L', 'XL', 'XXL']);
  const [sizeQuantities, setSizeQuantities] = useState({});
  const [bulkSizeQty, setBulkSizeQty] = useState('10');
  const [showOutOfStock, setShowOutOfStock] = useState(false);
  const [isOutOfStock, setIsOutOfStock] = useState(false);
  const [newCustomSize, setNewCustomSize] = useState('');

  // Key Highlights fields
  const [hFit, setHFit] = useState('Straight Regular Fit');
  const [hFabric, setHFabric] = useState('100% Breathable Cotton');
  const [hNeck, setHNeck] = useState('Mandarin Neck');
  const [hFrontNeck, setHFrontNeck] = useState('');
  const [hBackNeck, setHBackNeck] = useState('');
  const [hSleeve, setHSleeve] = useState('3/4 Sleeves');
  const [hLength, setHLength] = useState('44 Inches');
  const [hTopHeight, setHTopHeight] = useState('');
  const [hBottomHeight, setHBottomHeight] = useState('');
  const [hTechnique, setHTechnique] = useState('Handcrafted Chikankari');
  // New state for toggling visibility of Key Highlights Config
  const [showKeyHighlightsConfig, setShowKeyHighlightsConfig] = useState(true);
  // Editable heading states with defaults
  const [headingFit, setHeadingFit] = useState('Garment Fit');
  const [headingFabric, setHeadingFabric] = useState('Fabric');
  const [headingNeck, setHeadingNeck] = useState('Neckline Style');
  const [headingFrontNeck, setHeadingFrontNeck] = useState('Front Neck');
  const [headingBackNeck, setHeadingBackNeck] = useState('Back Neck');
  const [headingSleeve, setHeadingSleeve] = useState('Sleeve Styling');
  const [headingLength, setHeadingLength] = useState('Sleeve Length');
  const [headingTopHeight, setHeadingTopHeight] = useState('Top Height');
  const [headingBottomHeight, setHeadingBottomHeight] = useState('Bottom Height');
  const [headingTechnique, setHeadingTechnique] = useState('Craft Technique');

  // Promo Code manager states
  const [promoCode, setPromoCode] = useState('');
  const [promoType, setPromoType] = useState('percent'); 
  const [promoValue, setPromoValue] = useState('');
  const [promoMinPurchase, setPromoMinPurchase] = useState('0');
  const [promoDesc, setPromoDesc] = useState('');
  const [promoSuccessMsg, setPromoSuccessMsg] = useState('');
  // Selective Coupon Applicability states
  const [promoApplicableType, setPromoApplicableType] = useState('all'); // 'all', 'category', 'product'
  const [promoApplicableCategories, setPromoApplicableCategories] = useState([]);
  const [promoApplicableProducts, setPromoApplicableProducts] = useState([]);
  const [couponProductSearch, setCouponProductSearch] = useState('');

  // Color Variations Image Map (colorName -> imageUrl)
  const [colorImages, setColorImages] = useState({});
  const [uploadingColor, setUploadingColor] = useState(null);

  // Boutique Catalog Control Search & Filter states
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState('all');

  // Memoized unique categories from products
  const uniqueCategories = useMemo(() => {
    const cats = new Set();
    (products || []).forEach(p => {
      if (p.category && p.category.trim()) {
        cats.add(p.category.trim());
      }
    });
    return Array.from(cats);
  }, [products]);

  // Memoized filtered catalog for Boutique Catalog Control
  const filteredCatalogProducts = useMemo(() => {
    return (products || []).filter(prod => {
      const q = catalogSearch.trim().toLowerCase();
      const matchesSearch = !q || 
        (prod.title && prod.title.toLowerCase().includes(q)) ||
        (prod.category && prod.category.toLowerCase().includes(q)) ||
        (prod.id && String(prod.id).toLowerCase().includes(q));
      const matchesCat = catalogCategoryFilter === 'all' || prod.category === catalogCategoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [products, catalogSearch, catalogCategoryFilter]);

  // Reels manager states
  const [reelTitle, setReelTitle] = useState('');
  const [reelVideoFile, setReelVideoFile] = useState('');
  const [reelProductId, setReelProductId] = useState('');
  const [reelSuccessMsg, setReelSuccessMsg] = useState('');

  // Tracking number temporary inputs
  const [trackingNums, setTrackingNums] = useState({});

  // Sizing demands counting helper
  const sizeDemands = {
    'XS': 0, 'S': 0, 'M': 0, 'L': 0, 'XL': 0, 'XXL': 0, 'Custom Tailored': 0
  };
  orders.forEach(order => {
    order.items.forEach(item => {
      if (item.wantsCustomStitching) {
        sizeDemands['Custom Tailored'] += item.quantity;
      } else if (sizeDemands[item.size] !== undefined) {
        sizeDemands[item.size] += item.quantity;
      }
    });
  });

  // Calculations for stats
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const totalOrders = orders.length;
  const customOrdersCount = orders.filter(o => o.items.some(item => item.wantsCustomStitching)).length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;



  const handleInsertImageIntoAboutText = async (file) => {
    if (!file) return;
    try {
      let imageUrl;
      if (import.meta.env.VITE_GITHUB_TOKEN) {
        imageUrl = await uploadFileToGithub(file, 'media/storefront');
      } else {
        imageUrl = await compressImage(file);
      }
      if (imageUrl) {
        const imgTag = `<img src="${imageUrl}" alt="About Us Image" style="max-width: 100%; border-radius: 10px; margin: 16px 0; display: block;" />`;
        const currentPage = footerPagesConfig[selectedFooterPageId] || {};
        const currentText = currentPage.fullDescription || currentPage.section1Content || '';
        const updatedText = currentText ? `${currentText}\n\n${imgTag}\n\n` : imgTag;
        
        handleUpdateCurrentFooterPage('fullDescription', updatedText);
        handleUpdateCurrentFooterPage('section1Content', updatedText);
      }
    } catch (err) {
      console.error('❌ [Inline Image Insert Error]:', err);
      alert(`❌ Image Insertion Failed: ${err.message || 'Error uploading image'}`);
    }
  };

  // Video File upload helper for Reels with automatic GitHub API integration
  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      if (import.meta.env.VITE_GITHUB_TOKEN) {
        const videoUrl = await uploadFileToGithub(file, 'media/reels');
        setReelVideoFile(videoUrl);
      } else {
        const reader = new FileReader();
        reader.onload = () => setReelVideoFile(reader.result);
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error('❌ [GitHub Video Upload Error]:', err.message || err);
      alert(`❌ Video Upload Failed: ${err.message || 'Error uploading video to GitHub'}`);
    }
  };

  // Storefront Banner image file upload helper with automatic GitHub API integration
  const handleUploadBannerFile = async (file, bannerId, field, folder = 'media/hero', isOffer = false) => {
    if (!file) return;
    try {
      let imageUrl;
      if (import.meta.env.VITE_GITHUB_TOKEN) {
        imageUrl = await uploadFileToGithub(file, folder);
      } else {
        imageUrl = await compressImage(file);
      }
      if (isOffer) {
        handleUpdateOfferBannerSlide(bannerId, field, imageUrl);
      } else {
        handleUpdateBannerSlide(bannerId, field, imageUrl);
      }
    } catch (err) {
      console.error('❌ [GitHub Banner Upload Error]:', err.message || err);
      alert(`❌ Banner Upload Failed: ${err.message || 'Error uploading banner to GitHub'}`);
    }
  };

  const handleUploadCategoryFile = async (file, idx) => {
    if (!file) return;
    try {
      let imageUrl;
      if (import.meta.env.VITE_GITHUB_TOKEN) {
        imageUrl = await uploadFileToGithub(file, 'media/storefront');
      } else {
        imageUrl = await compressImage(file);
      }
      setStorefrontCategories(prev => {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], image: imageUrl };
        return updated;
      });
    } catch (err) {
      console.error('❌ [Category Upload Error]:', err);
      alert(`❌ Category Upload Failed: ${err.message || 'Error uploading image'}`);
    }
  };

  const handleUploadOccasionFile = async (file, idx) => {
    if (!file) return;
    try {
      let imageUrl;
      if (import.meta.env.VITE_GITHUB_TOKEN) {
        imageUrl = await uploadFileToGithub(file, 'media/storefront');
      } else {
        imageUrl = await compressImage(file);
      }
      setStorefrontOccasions(prev => {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], image: imageUrl };
        return updated;
      });
    } catch (err) {
      console.error('❌ [Occasion Upload Error]:', err);
      alert(`❌ Occasion Upload Failed: ${err.message || 'Error uploading image'}`);
    }
  };

  const [isAboutImageUploading, setIsAboutImageUploading] = useState(false);
  const [isRichTextImageUploading, setIsRichTextImageUploading] = useState(false);

  const handleUploadRichTextImage = async (file) => {
    if (!file) return null;
    setIsRichTextImageUploading(true);
    try {
      let imageUrl;
      if (import.meta.env.VITE_GITHUB_TOKEN) {
        imageUrl = await uploadFileToGithub(file, 'media/storefront');
      } else {
        imageUrl = await compressImage(file);
      }
      return imageUrl;
    } catch (err) {
      console.error('❌ [Rich Text Image Upload Error]:', err);
      alert(`❌ Image Upload Failed: ${err.message || 'Error uploading image'}`);
      return null;
    } finally {
      setIsRichTextImageUploading(false);
    }
  };

  const handleUploadAboutUsImage = async (file) => {
    if (!file) return;
    setIsAboutImageUploading(true);
    try {
      let imageUrl;
      if (import.meta.env.VITE_GITHUB_TOKEN) {
        imageUrl = await uploadFileToGithub(file, 'media/storefront');
      } else {
        imageUrl = await compressImage(file);
      }
      if (imageUrl) {
        const currentPage = footerPagesConfig[selectedFooterPageId] || {};
        const currentList = currentPage.aboutImages || [];
        handleUpdateCurrentFooterPage('aboutImages', [...currentList, imageUrl]);
      }
    } catch (err) {
      console.error('❌ [About Image Upload Error]:', err);
      alert(`❌ Photo Upload Failed: ${err.message || 'Error uploading image to GitHub'}`);
    } finally {
      setIsAboutImageUploading(false);
    }
  };

  const handleToggleStoredColor = (color) => {
    setColorErrorMsg('');
    const normName = color.name.trim().toLowerCase();
    const normHex = color.hex.trim().toLowerCase();

    const isSelected = productColors.some(
      c => c.name.trim().toLowerCase() === normName || c.hex.trim().toLowerCase() === normHex
    );

    if (isSelected) {
      // Unselect: remove from current product
      setProductColors(prev => prev.filter(
        c => c.name.trim().toLowerCase() !== normName && c.hex.trim().toLowerCase() !== normHex
      ));
    } else {
      // Select: add to current product (strictly checking for duplicate name or hex)
      const dupByName = productColors.find(c => c.name.trim().toLowerCase() === normName);
      if (dupByName) {
        setColorErrorMsg(`⚠️ Color "${dupByName.name}" is already added to this product.`);
        return;
      }
      const dupByHex = productColors.find(c => c.hex.trim().toLowerCase() === normHex);
      if (dupByHex) {
        setColorErrorMsg(`⚠️ A color with hex code "${dupByHex.hex}" (${dupByHex.name}) is already added to this product.`);
        return;
      }

      setProductColors(prev => [...prev, { name: color.name.trim(), hex: color.hex.trim() }]);
    }
  };

  const handleAddColor = (e) => {
    if (e) e.preventDefault();
    setColorErrorMsg('');
    const trimmedName = newColorName.trim();
    const trimmedHex = (newColorHex || '#111111').trim();

    if (!trimmedName) {
      setColorErrorMsg('⚠️ Please enter a color name (e.g. Sage Green, Blush Pink).');
      return;
    }

    const normName = trimmedName.toLowerCase();
    const normHex = trimmedHex.toLowerCase();

    // 1. Strict Duplicate Check on current product by name
    const existingName = productColors.find(c => c.name.trim().toLowerCase() === normName);
    if (existingName) {
      setColorErrorMsg(`⚠️ Color name "${existingName.name}" is already added to this product! Duplicate colors are not allowed.`);
      return;
    }

    // 2. Strict Duplicate Check on current product by hex
    const existingHex = productColors.find(c => c.hex.trim().toLowerCase() === normHex);
    if (existingHex) {
      setColorErrorMsg(`⚠️ A color variant with hex code "${existingHex.hex}" (${existingHex.name}) is already added to this product! Duplicate hex colors are not allowed.`);
      return;
    }

    const newColorObj = { name: trimmedName, hex: trimmedHex };

    // Add to current product
    setProductColors(prev => [...prev, newColorObj]);

    // Automatically store in the persistent store library for all future products!
    updateStoredColors([...storedColors, newColorObj]);

    setNewColorName('');
    setColorErrorMsg('');
  };

  const handleRemoveColor = (nameToRemove) => {
    setColorErrorMsg('');
    setProductColors(prev => prev.filter(c => c.name.trim().toLowerCase() !== nameToRemove.trim().toLowerCase()));
  };

  const handleSizeCheckboxToggle = (size) => {
    setProductSizes(prev => {
      const safePrev = toSafeSizesArray(prev);
      return safePrev.includes(size) ? safePrev.filter(s => s !== size) : [...safePrev, size];
    });
  };

  const handleAddCustomSize = () => {
    const trimmed = (newCustomSize || '').trim();
    if (!trimmed) return;

    if (sizeType === 'kids') {
      const currentList = Array.isArray(customKidsSizes) ? customKidsSizes : DEFAULT_KIDS_SIZES;
      if (!currentList.some(s => String(s).toLowerCase() === trimmed.toLowerCase())) {
        const updated = [...currentList, trimmed];
        setCustomKidsSizes(updated);
        if (onSaveSettings) {
          onSaveSettings({ ...boutiqueSettings, kidsSizes: JSON.stringify(updated) });
        }
      }
    } else {
      const currentList = Array.isArray(customAdultSizes) ? customAdultSizes : DEFAULT_ADULT_SIZES;
      if (!currentList.some(s => String(s).toLowerCase() === trimmed.toLowerCase())) {
        const updated = [...currentList, trimmed];
        setCustomAdultSizes(updated);
        if (onSaveSettings) {
          onSaveSettings({ ...boutiqueSettings, adultSizes: JSON.stringify(updated) });
        }
      }
    }

    setProductSizes(prev => {
      const safePrev = toSafeSizesArray(prev);
      if (!safePrev.some(s => String(s).toLowerCase() === trimmed.toLowerCase())) {
        return [...safePrev, trimmed];
      }
      return safePrev;
    });
    setNewCustomSize('');
  };

  const handleDeleteCustomSize = (sizeToRemove) => {
    if (sizeType === 'kids') {
      const currentList = Array.isArray(customKidsSizes) ? customKidsSizes : DEFAULT_KIDS_SIZES;
      const updated = currentList.filter(s => s !== sizeToRemove);
      setCustomKidsSizes(updated);
      if (onSaveSettings) {
        onSaveSettings({ ...boutiqueSettings, kidsSizes: JSON.stringify(updated) });
      }
    } else {
      const currentList = Array.isArray(customAdultSizes) ? customAdultSizes : DEFAULT_ADULT_SIZES;
      const updated = currentList.filter(s => s !== sizeToRemove);
      setCustomAdultSizes(updated);
      if (onSaveSettings) {
        onSaveSettings({ ...boutiqueSettings, adultSizes: JSON.stringify(updated) });
      }
    }
    setProductSizes(prev => toSafeSizesArray(prev).filter(s => s !== sizeToRemove));
  };



  // Product Add / Update Submit
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const finalPrimary = primaryImages.filter(img => img && img.trim() !== '');
    if (finalPrimary.length === 0) {
      alert('Please upload or paste at least one primary product photo.');
      return;
    }

    // Merge primary photos and the hover swap image into the standard images array format
    let finalImages = [...finalPrimary];
    if (hoverImage && hoverImage.trim() !== '') {
      // Hover image goes at index 1
      finalImages.splice(1, 0, hoverImage.trim());
    }

    if (!title || !price || !description) {
      alert('Please fill out all required fields.');
      return;
    }
    const cleanProductColors = deduplicateColors(productColors);
    if (cleanProductColors.length === 0) {
      alert('Please select or add at least one color variant for the product.');
      return;
    }
    if (productSizes.length === 0) {
      alert('Please configure at least one available size for the product.');
      return;
    }

    // Automatically ensure all colors on this product are saved in stored colors library
    updateStoredColors([...storedColors, ...cleanProductColors]);

    const parsedPrice = parseFloat(price);
    const parsedOrigPrice = originalPrice ? parseFloat(originalPrice) : null;
    const validOrigPrice = (parsedOrigPrice && parsedOrigPrice > parsedPrice) ? parsedOrigPrice : null;

    const safeProductSizes = toSafeSizesArray(productSizes);
    const finalSizeQuantities = {};
    safeProductSizes.forEach(s => {
      finalSizeQuantities[s] = (sizeQuantities[s] !== undefined && sizeQuantities[s] !== '') ? Number(sizeQuantities[s]) : 10;
    });
    const isAllSizesZero = safeProductSizes.length > 0 && safeProductSizes.every(s => finalSizeQuantities[s] <= 0);
    const effectiveOutOfStock = isOutOfStock || isAllSizesZero;

    const highlightsPayload = {
      enabled: showKeyHighlightsConfig,
      fit: hFit,
      fabric: hFabric,
      neck: hNeck,
      frontNeck: hFrontNeck,
      backNeck: hBackNeck,
      sleeve: hSleeve,
      length: hLength,
      topHeight: hTopHeight,
      bottomHeight: hBottomHeight,
      technique: hTechnique,
      originalPrice: validOrigPrice,
      headings: {
        fit: headingFit,
        fabric: headingFabric,
        neck: headingNeck,
        frontNeck: headingFrontNeck,
        backNeck: headingBackNeck,
        sleeve: headingSleeve,
        length: headingLength,
        topHeight: headingTopHeight,
        bottomHeight: headingBottomHeight,
        technique: headingTechnique
      }
    };

    const colorsWithImages = cleanProductColors.map(c => ({
      ...c,
      image: colorImages[c.name] || c.image || ''
    }));

    // Ensure any assigned color images are also in finalImages gallery
    Object.values(colorImages).forEach(img => {
      if (img && typeof img === 'string' && img.trim() && !finalImages.includes(img.trim())) {
        finalImages.push(img.trim());
      }
    });

    if (editingProduct) {
      const updatedProduct = {
        ...editingProduct,
        title,
        category,
        price: parsedPrice,
        originalPrice: validOrigPrice,
        description,
        images: finalImages,
        variants: {
          colors: colorsWithImages,
          colorImages: colorImages,
          sizes: safeProductSizes,
          sizeQuantities: finalSizeQuantities,
          showOutOfStock: showOutOfStock,
          isOutOfStock: effectiveOutOfStock
        },
        colorImages: colorImages,
        sizeQuantities: finalSizeQuantities,
        showOutOfStock: showOutOfStock,
        isOutOfStock: effectiveOutOfStock,
        customizable,
        bestSeller,
        newArrival,
        rating: parseFloat(rating || 5.0),
        reviewsCount: parseInt(reviewsCount || 1),
        occasion,
        showKeyHighlights: showKeyHighlightsConfig,
        highlights: highlightsPayload
      };
      const res = await onUpdateProduct(updatedProduct);
      if (res && res.success === false) {
        setSuccessMsg(`⚠️ Product updated on storefront! (Live DB notice: ${res.error})`);
      } else {
        setSuccessMsg('🎉 Product updated successfully & synced to live database!');
      }
      setEditingProduct(null);
    } else {
      const newProduct = {
        id: `im-added-${Date.now()}`,
        title,
        category,
        price: parsedPrice,
        originalPrice: validOrigPrice,
        rating: parseFloat(rating || 5.0),
        reviewsCount: parseInt(reviewsCount || 1),
        description,
        details: ['Handcrafted quality fabric', 'Modern regular fitting style', 'Breathable weave structure'],
        images: finalImages,
        variants: {
          colors: colorsWithImages,
          colorImages: colorImages,
          sizes: safeProductSizes,
          sizeQuantities: finalSizeQuantities,
          showOutOfStock: showOutOfStock,
          isOutOfStock: effectiveOutOfStock
        },
        colorImages: colorImages,
        sizeQuantities: finalSizeQuantities,
        showOutOfStock: showOutOfStock,
        isOutOfStock: effectiveOutOfStock,
        customizable,
        bestSeller,
        newArrival,
        occasion,
        showKeyHighlights: showKeyHighlightsConfig,
        highlights: highlightsPayload
      };
      const res = await onAddProduct(newProduct);
      if (res && res.success === false) {
        setSuccessMsg(`⚠️ Product published to storefront! (Live DB notice: ${res.error})`);
      } else {
        setSuccessMsg('🎉 Product published successfully & synced to live database!');
      }
    }

    // Reset Form
    setTitle('');
    setPrice('');
    setOriginalPrice('');
    setDescription('');
    setPrimaryImages(['']);
    setHoverImage('');
    setCustomizable(true);
    setBestSeller(false);
    setNewArrival(false);
    setShowOutOfStock(false);
    setIsOutOfStock(false);
    setSizeQuantities({});
    setColorImages({});
    setRating(5.0);
    setReviewsCount(1);
    setOccasion('Daily Elegance');
    setProductColors([]);
    setColorErrorMsg('');
    setProductSizes(['XS', 'S', 'M', 'L', 'XL', 'XXL']);
    setHFit('Straight Regular Fit');
    setHFabric('100% Breathable Cotton');
    setHNeck('Mandarin Neck');
    setHFrontNeck('');
    setHBackNeck('');
    setHSleeve('3/4 Sleeves');
    setHLength('44 Inches');
    setHTopHeight('');
    setHBottomHeight('');
    setHTechnique('Handcrafted Chikankari');
    setShowKeyHighlightsConfig(true);

    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleEditClick = (prod) => {
    setEditingProduct(prod);
    setTitle(prod.title);
    setCategory(prod.category);
    setOccasion(prod.occasion || 'Daily Elegance');
    setPrice(prod.price);
    setOriginalPrice(prod.originalPrice || prod.highlights?.originalPrice || prod.original_price || '');
    setDescription(prod.description);
    
    // Separate hover swap image from primary images array
    const hoverImg = prod.images[1] || '';
    const primaryImgs = prod.images.filter((_, idx) => idx !== 1);
    setPrimaryImages(primaryImgs.length > 0 ? primaryImgs : ['']);
    setHoverImage(hoverImg);
    
    setCustomizable(Boolean(prod.customizable));
    setBestSeller(Boolean(prod.bestSeller));
    setNewArrival(Boolean(prod.newArrival));
    setShowOutOfStock(prod.showOutOfStock !== undefined ? Boolean(prod.showOutOfStock) : Boolean(prod.variants?.showOutOfStock));
    setIsOutOfStock(Boolean(prod.isOutOfStock || prod.variants?.isOutOfStock));
    setRating(prod.rating || 5.0);
    setReviewsCount(prod.reviewsCount || 1);
    
    const editColors = deduplicateColors(prod.variants?.colors || []);
    setProductColors(editColors);
    if (editColors.length > 0) {
      updateStoredColors([...storedColors, ...editColors]);
    }

    const initialColorImages = { ...(prod.variants?.colorImages || prod.colorImages || {}) };
    editColors.forEach(c => {
      if (c.image && !initialColorImages[c.name]) {
        initialColorImages[c.name] = c.image;
      }
    });
    setColorImages(initialColorImages);

    const existingSizes = toSafeSizesArray(prod.variants?.sizes);
    const finalSizes = existingSizes.length > 0 ? existingSizes : ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    setProductSizes(finalSizes);

    const rawSizeQuantities = prod.variants?.sizeQuantities || prod.sizeQuantities || {};
    setSizeQuantities(rawSizeQuantities);

    const isKidsProd = (prod.category || '').toLowerCase().includes('kid') || 
                       (prod.category || '').toLowerCase().includes('child') || 
                       (prod.category || '').toLowerCase().includes('baby') || 
                       finalSizes.some(isKidsSizeString);
    setSizeType(isKidsProd ? 'kids' : 'adult');

    const highlightsEnabled = prod.showKeyHighlights !== false && prod.highlights?.enabled !== false;
    setShowKeyHighlightsConfig(highlightsEnabled);
    if (prod.highlights?.headings) {
      setHeadingFit(prod.highlights.headings.fit || 'Garment Fit');
      setHeadingFabric(prod.highlights.headings.fabric || 'Fabric');
      setHeadingNeck(prod.highlights.headings.neck || 'Neckline Style');
      setHeadingFrontNeck(prod.highlights.headings.frontNeck || 'Front Neck');
      setHeadingBackNeck(prod.highlights.headings.backNeck || 'Back Neck');
      setHeadingSleeve(prod.highlights.headings.sleeve || 'Sleeve Styling');
      setHeadingLength(prod.highlights.headings.length || 'Sleeve Length');
      setHeadingTopHeight(prod.highlights.headings.topHeight || 'Top Height');
      setHeadingBottomHeight(prod.highlights.headings.bottomHeight || 'Bottom Height');
      setHeadingTechnique(prod.highlights.headings.technique || 'Craft Technique');
    }

    setHFit(prod.highlights?.fit || '');
    setHFabric(prod.highlights?.fabric || '');
    setHNeck(prod.highlights?.neck || '');
    setHFrontNeck(prod.highlights?.frontNeck || prod.highlights?.front_neck || '');
    setHBackNeck(prod.highlights?.backNeck || prod.highlights?.back_neck || '');
    setHSleeve(prod.highlights?.sleeve || '');
    setHLength(prod.highlights?.length || '');
    setHTopHeight(prod.highlights?.topHeight || prod.highlights?.top_height || '');
    setHBottomHeight(prod.highlights?.bottomHeight || prod.highlights?.bottom_height || '');
    setHTechnique(prod.highlights?.technique || '');
    setSuccessMsg('');
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setTitle('');
    setPrice('');
    setDescription('');
    setPrimaryImages(['']);
    setHoverImage('');
    setCustomizable(true);
    setBestSeller(false);
    setNewArrival(false);
    setShowOutOfStock(false);
    setIsOutOfStock(false);
    setSizeQuantities({});
    setColorImages({});
    setRating(5.0);
    setReviewsCount(1);
    setOccasion('Daily Elegance');
    setProductColors([]);
    setNewColorName('');
    setColorErrorMsg('');
    setSizeType('adult');
    setProductSizes(['XS', 'S', 'M', 'L', 'XL', 'XXL']);
    setHFit('Straight Regular Fit');
    setHFabric('100% Breathable Cotton');
    setHNeck('Mandarin Neck');
    setHFrontNeck('');
    setHBackNeck('');
    setHSleeve('3/4 Sleeves');
    setHLength('44 Inches');
    setHTopHeight('');
    setHBottomHeight('');
    setHTechnique('Handcrafted Chikankari');
    setShowKeyHighlightsConfig(true);
  };

  // Promo operations
  const handleAddPromoSubmit = (e) => {
    e.preventDefault();
    if (!promoCode || !promoValue) return;

    if (promoApplicableType === 'category' && promoApplicableCategories.length === 0) {
      alert('Please select at least one category for this coupon.');
      return;
    }
    if (promoApplicableType === 'product' && promoApplicableProducts.length === 0) {
      alert('Please select at least one product for this coupon.');
      return;
    }

    const targetMeta = {
      applicableType: promoApplicableType,
      applicableCategories: promoApplicableType === 'category' ? promoApplicableCategories : [],
      applicableProducts: promoApplicableType === 'product' ? promoApplicableProducts : []
    };
    const userDesc = promoDesc || `${promoType === 'percent' ? `${promoValue}%` : `₹${promoValue}`} off`;
    const fullDesc = `${userDesc}__TARGET__${JSON.stringify(targetMeta)}`;

    const newPromo = {
      code: promoCode.trim().toUpperCase(),
      type: promoType,
      value: parseFloat(promoValue),
      minPurchase: parseFloat(promoMinPurchase || 0),
      description: fullDesc,
      applicableType: promoApplicableType,
      applicableCategories: promoApplicableType === 'category' ? promoApplicableCategories : [],
      applicableProducts: promoApplicableType === 'product' ? promoApplicableProducts : []
    };

    setPromoCode('');
    setPromoValue('');
    setPromoMinPurchase('0');
    setPromoDesc('');
    setPromoApplicableType('all');
    setPromoApplicableCategories([]);
    setPromoApplicableProducts([]);
    
    if (onAddPromo) {
      onAddPromo(newPromo);
    } else {
      setPromosList(prev => [...prev, newPromo]);
    }
    setPromoSuccessMsg('Promo offer configured!');
    setTimeout(() => setPromoSuccessMsg(''), 3000);
  };

  const handleDeletePromo = (code) => {
    if (window.confirm(`Are you sure you want to delete promo code "${code}"?`)) {
      if (onDeletePromo) {
        onDeletePromo(code);
      } else {
        setPromosList(prev => prev.filter(p => p.code !== code));
      }
    }
  };

  // Reels operations
  const handleAddReelSubmit = (e) => {
    e.preventDefault();
    if (!reelTitle || !reelVideoFile) {
      alert('Please enter a title and select/input a vertical video source.');
      return;
    }

    const matchedProd = products.find(p => p.id === reelProductId);

    const newReel = {
      id: `reel-${Date.now()}`,
      title: reelTitle,
      videoUrl: formatGithubUrl(reelVideoFile),
      productId: reelProductId || '',
      productTitle: matchedProd ? matchedProd.title : '',
      productPrice: matchedProd ? matchedProd.price : 0,
      productImage: matchedProd ? matchedProd.images[0] : ''
    };

    if (onAddReel) {
      onAddReel(newReel);
    } else {
      setReelsList(prev => [...prev, newReel]);
    }
    setReelTitle('');
    setReelVideoFile('');
    setReelProductId('');
    setReelSuccessMsg('Couture reel added to landing page!');
    setTimeout(() => setReelSuccessMsg(''), 3000);
  };

  const handleDeleteReel = (id) => {
    if (window.confirm('Are you sure you want to delete this video reel showcase?')) {
      if (onDeleteReel) {
        onDeleteReel(id);
      } else {
        setReelsList(prev => prev.filter(r => r.id !== id));
      }
    }
  };

  const handleSaveTracking = (orderId) => {
    const num = trackingNums[orderId] || '';
    if (!num) return;
    const order = orders.find(o => o.id === orderId);
    onUpdateOrderStatus(orderId, order?.status || 'Shipped', num);
    alert(`Delhivery Tracking Number ${num} saved for Order ${orderId}!`);
  };

  const handleSaveFooterPages = (e) => {
    if (e) e.preventDefault();
    const updatedSettings = {
      ...boutiqueSettings,
      footerPages: JSON.stringify(footerPagesConfig)
    };
    onSaveSettings(updatedSettings);
    const currentPageObj = footerPagesConfig[selectedFooterPageId];
    setFooterSaveSuccessMsg(`✅ "${currentPageObj?.navLabel || selectedFooterPageId}" content saved and published live on storefront!`);
    setTimeout(() => setFooterSaveSuccessMsg(''), 4000);
  };

  const handleUpdateCurrentFooterPage = (field, value) => {
    setFooterPagesConfig(prev => ({
      ...prev,
      [selectedFooterPageId]: {
        ...prev[selectedFooterPageId] || {},
        [field]: value
      }
    }));
  };

  return (
    <div className="admin-dashboard-container container">
      {isDbRlsActive && (
        <div className="rls-warning-banner animate-fadeIn" style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '8px',
          padding: '18px 20px',
          marginBottom: '30px',
          color: '#991b1b',
          fontSize: '13px',
          lineHeight: '1.6',
          boxShadow: '0 2px 10px rgba(239, 68, 68, 0.05)'
        }}>
          <strong style={{ display: 'block', fontSize: '15px', marginBottom: '8px', fontFamily: 'var(--font-display)', letterSpacing: '0.03em' }}>
            ⚠️ SUPABASE ROW-LEVEL SECURITY (RLS) ACTIVE WARNING
          </strong>
          Row-Level Security is currently active on your Supabase tables. This blocks public read and write access for visitors, causing order list checks to return 0 orders on page refresh.
          <br /><br />
          <strong>To resolve this immediately:</strong>
          <ol style={{ marginLeft: '20px', marginTop: '8px', listStyleType: 'decimal' }}>
            <li>Log in to your <strong>Supabase Dashboard</strong>.</li>
            <li>Select the <strong>SQL Editor</strong> tool from the left navigation panel.</li>
            <li>Create a new query tab, copy and paste the SQL block below, and click <strong>Run</strong>:</li>
          </ol>
          <pre style={{
            backgroundColor: '#ffffff',
            border: '1px solid #fca5a5',
            borderRadius: '4px',
            padding: '12px',
            marginTop: '12px',
            fontSize: '11px',
            fontFamily: 'monospace',
            overflowX: 'auto',
            color: '#1f2937',
            lineHeight: '1.4'
          }}>{`-- Copy and execute in your Supabase SQL Editor:
alter table public.customers disable row level security;
alter table public.products disable row level security;
alter table public.reels disable row level security;
alter table public.promos disable row level security;
alter table public.orders disable row level security;
alter table public.testimonials disable row level security;
alter table public.settings disable row level security;`}</pre>
        </div>
      )}

      {/* Sidebar / Sidebar Header */}
      <div className="admin-header-row">
        <h2>InibyMaya Store Manager Console</h2>
        
        <div className="admin-tabs">
          <button 
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag size={15} />
            <span>Orders Lifecycle ({orders.length})</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => { setActiveTab('products'); handleCancelEdit(); }}
          >
            <Package size={15} />
            <span>Catalog Items ({products.length})</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'promos' ? 'active' : ''}`}
            onClick={() => setActiveTab('promos')}
          >
            <Tag size={15} />
            <span>Store Coupons ({promosList.length})</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'reels' ? 'active' : ''}`}
            onClick={() => setActiveTab('reels')}
          >
            <Film size={15} />
            <span>Couture Reels ({reelsList.length})</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <BarChart3 size={15} />
            <span>Analytics & Revenue</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'testimonials' ? 'active' : ''}`}
            onClick={() => setActiveTab('testimonials')}
          >
            <User size={15} />
            <span>Patron Reviews ({testimonialsList.length})</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            style={activeTab === 'settings' ? {} : { border: '1px solid #e2b3b3' }}
          >
            <Settings size={15} />
            <span>Boutique Settings & Shipping</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'storefront' ? 'active' : ''}`}
            onClick={() => setActiveTab('storefront')}
          >
            <Layout size={15} />
            <span>Storefront Customizer</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'footer' ? 'active' : ''}`}
            onClick={() => setActiveTab('footer')}
          >
            <FileText size={15} />
            <span>Footer & Policies</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'customizer' ? 'active' : ''}`}
            onClick={() => setActiveTab('customizer')}
          >
            <Sparkles size={15} />
            <span>2D Customizer Config</span>
          </button>
        </div>
      </div>

      <hr className="detail-divider" />

      {/* Tab 1: Orders Lifecycle */}
      {activeTab === 'orders' && (
        <div className="admin-content-section animate-fadeIn">
          <div className="admin-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
            <div>
              <h3 style={{ margin: '0 0 4px 0' }}>Stitching & Dispatch Operations</h3>
              <p style={{ margin: 0 }}>Advance each customer's order through the boutique stitching rooms, pattern drafts, quality control, and final Delhivery courier dispatch.</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '24px',
                backgroundColor: '#fff5f5',
                border: '1.5px solid #fca5a5',
                color: '#8b0000',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'all 0.2s ease'
              }}
              title="Click to configure Standard Shipping & Free Delivery Threshold"
            >
              <Truck size={16} />
              <span>Standard Shipping: <strong>₹{settingsShippingPrice}</strong> (Click to Configure)</span>
            </button>
          </div>

          {orders.length > 0 ? (
            <div className="admin-orders-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID / Date</th>
                    <th>Customer Contact</th>
                    <th>Sizing / Tailoring Inputs</th>
                    <th>Lifecycle Status Updates</th>
                    <th>Price Total</th>
                    <th style={{ width: '60px', textAlign: 'center' }}>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {(orders || []).map((order, idx) => {
                    const orderItems = Array.isArray(order.items) ? order.items : [];
                    const isCustom = orderItems.some(i => i && i.wantsCustomStitching);
                    const shipping = order.shippingDetails || {};
                    return (
                      <tr key={order.id || idx}>
                        <td>
                          <strong className="order-id-label">{order.id || `ORD-${idx+1}`}</strong>
                          <div className="order-meta-small">
                            <span>{order.timestamp ? new Date(order.timestamp).toLocaleDateString() : 'N/A'}</span>
                            <br />
                            {(() => {
                              const pId = (order.paymentId || order.payment_id || '').toString();
                              const isRazor = pId.startsWith('pay_') || (order.paymentMethod || '').toLowerCase().includes('razor');
                              if (isRazor) {
                                return (
                                  <span className="pay-id-badge" style={{ backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', fontWeight: '600' }} title="Verified Prepaid Online via Razorpay">
                                    💳 Razorpay: {pId}
                                  </span>
                                );
                              }
                              return (
                                <span className="pay-id-badge" style={{ backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }} title="Cash on Delivery">
                                  💵 {pId || 'COD'}
                                </span>
                              );
                            })()}
                          </div>
                        </td>
                        <td>
                          <div className="cust-info">
                            <User size={12} />
                            <span><strong>{shipping.name || 'Customer'}</strong></span>
                          </div>
                          <p className="cust-address">{shipping.address || ''}, {shipping.city || ''} {shipping.pincode ? `- ${shipping.pincode}` : ''}</p>
                          <p className="cust-phone">
                            <Phone size={11} style={{ marginRight: '4px', verticalAlign: 'middle', opacity: 0.7 }} />
                            <span>+91 {shipping.phone || 'N/A'}</span>
                          </p>
                          {order.notes && (
                            <div className="admin-order-customer-note-callout">
                              <strong>Special Instruction:</strong> "{order.notes}"
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="order-table-items-list">
                            {orderItems.map((item, itemIdx) => {
                              const itemTitle = item.product?.title || item.title || item.productTitle || 'Couture Item';
                              const itemColor = item.color || item.selectedColor || 'Standard';
                              const itemSize = item.size || item.selectedSize || 'M';
                              const itemQty = item.quantity || item.qty || 1;

                              // Dynamic product lookup from catalog to ensure exact image is displayed
                              const matchedProd = (products || []).find(p => String(p.id) === String(item.productId || item.id || item.product?.id)) 
                                || (products || []).find(p => p.title?.toLowerCase().trim() === itemTitle.toLowerCase().trim());

                              const rawImg = item.image 
                                || item.product?.image 
                                || item.productImage 
                                || (item.images && item.images[0]) 
                                || matchedProd?.image 
                                || (matchedProd?.images && matchedProd?.images[0]);

                              const itemImg = rawImg ? formatGithubUrl(rawImg) : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=200';

                              return (
                                <div key={itemIdx} className="table-item-desc" style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '10px', paddingBottom: itemIdx < orderItems.length - 1 ? '8px' : '0', borderBottom: itemIdx < orderItems.length - 1 ? '1px dashed var(--color-border)' : 'none' }}>
                                  <img 
                                    src={itemImg} 
                                    alt={itemTitle} 
                                    style={{ 
                                      width: '44px', 
                                      height: '44px', 
                                      borderRadius: '6px', 
                                      objectFit: 'cover', 
                                      flexShrink: 0,
                                      border: '1px solid var(--color-border)' 
                                    }} 
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=200';
                                    }}
                                  />
                                  <div style={{ flex: 1 }}>
                                    <span>• <strong>{itemTitle}</strong> ({itemColor}) - Qty: {itemQty}</span>
                                    <div className="sizing-readout-row">
                                      <span>Standard Size: <span className="size-badge-table">{itemSize}</span></span>
                                    </div>
                                  {item.wantsCustomStitching && (item.measurements || item.styleCustomization) && (
                                    <div className="table-item-measurements animate-fadeIn" style={{
                                      marginTop: '6px',
                                      padding: '8px 12px',
                                      borderRadius: '6px',
                                      border: '1px dashed var(--color-border)',
                                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                      fontSize: '11.5px',
                                      lineHeight: '1.5'
                                    }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', color: 'var(--color-text-primary)', fontWeight: '600' }}>
                                        <Ruler size={12} />
                                        <span>Style Studio Customizations:</span>
                                      </div>
                                      {item.measurements && (
                                        <div style={{ marginBottom: '6px' }}>
                                          <span><strong>Bust: {item.measurements.bust}"</strong> | <strong>Waist: {item.measurements.waist}"</strong> | <strong>Hips: {item.measurements.hips}"</strong> | <strong>Height: {item.measurements.height}</strong></span>
                                          {item.measurements.notes && <p className="admin-tailoring-notes">Notes: "{item.measurements.notes}"</p>}
                                        </div>
                                      )}
                                      {item.styleCustomization && (
                                        <>
                                          <ul style={{ paddingLeft: '14px', margin: '4px 0', listStyleType: 'disc' }}>
                                            <li><strong>Lining:</strong> {item.styleCustomization.lining || 'Without Lining'}</li>
                                            <li><strong>Maternity Zip:</strong> {item.styleCustomization.zip || 'No'}</li>
                                            {item.styleCustomization.sleeve && (
                                              <li><strong>Sleeve Style:</strong> {getSleeveName(item.styleCustomization.sleeve)}</li>
                                            )}
                                            {item.styleCustomization.neck && (
                                              <li><strong>Neck Style:</strong> {getNeckName(item.styleCustomization.neck)}</li>
                                            )}
                                          </ul>
                                          {item.styleCustomization.notes && (
                                            <div style={{ marginTop: '6px', color: 'var(--color-text-secondary)' }}>
                                              <strong>Custom Notes:</strong> "{item.styleCustomization.notes}"
                                            </div>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                            })}
                          </div>
                        </td>
                        <td>
                          <div className="status-selector-container">
                            <select 
                              value={order.status || (isCustom ? 'Pending Stitching' : 'Pending Shipment')}
                              onChange={(e) => onUpdateOrderStatus(order.id, e.target.value, order.trackingNumber)}
                              className={`status-updater-dropdown status-${order.status ? order.status.toLowerCase().replace(/\s+/g, '-') : 'placed'}`}
                            >
                              {isCustom ? (
                                <>
                                  <option value="Pending Stitching">Pending Stitching</option>
                                  <option value="Pattern Drafting">Pattern Drafting</option>
                                  <option value="Stitching in Progress">Stitching in Progress</option>
                                  <option value="Quality Check">Quality Check</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                                  <option value="Cancelled by Customer">Cancelled by Customer</option>
                                </>
                              ) : (
                                <>
                                  <option value="Pending Shipment">Pending Shipment</option>
                                  <option value="Quality Check">Quality Check</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                                  <option value="Cancelled by Customer">Cancelled by Customer</option>
                                </>
                              )}
                            </select>

                            {order.status === 'Shipped' && (
                              <div className="tracking-updater-row animate-slideDown">
                                <input 
                                  type="text" 
                                  placeholder="Delhivery AWB ID"
                                  value={trackingNums[order.id] !== undefined ? trackingNums[order.id] : (order.trackingNumber || '')}
                                  onChange={(e) => setTrackingNums({
                                    ...trackingNums,
                                    [order.id]: e.target.value
                                  })}
                                />
                                <button onClick={() => handleSaveTracking(order.id)}>Save</button>
                              </div>
                            )}
                            
                            {order.status !== 'Shipped' && order.trackingNumber && (
                              <span className="current-tracking-label">Delhivery: {order.trackingNumber}</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <strong className="table-cost-total red-totals-text">₹{order.total.toLocaleString('en-IN')}</strong>
                        </td>
                        <td style={{ textAlign: 'center', width: '60px' }}>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmOrder(order)}
                            style={{
                              border: 'none',
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              color: '#ef4444',
                              width: '34px',
                              height: '34px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease'
                            }}
                            className="order-trash-btn"
                            title="Delete Order"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-admin-state">
              <p>No orders placed yet. Place some mock orders in standard customer mode first.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Catalog management */}
      {activeTab === 'products' && (
        <div className="admin-content-section catalog-management-grid animate-fadeIn">
          {/* Add / Edit Form */}
          <div className="add-product-form-box">
            <h4>{editingProduct ? 'Edit Boutique Creation' : 'Publish New Couture Item'}</h4>
            {successMsg && <p className="success-banner">{successMsg}</p>}
            
            <form onSubmit={handleProductSubmit}>
              <div className="form-group">
                <label>Product Title *</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="e.g. Crimson Velvet Long Kurta Set" 
                  required 
                />
              </div>
              <div className="form-row-double">
                <div className="form-group">
                  <label>Category *</label>
                  <select 
                    value={category} 
                    onChange={(e) => {
                      const newCat = e.target.value;
                      setCategory(newCat);
                      const isKids = newCat.toLowerCase().includes('kid') || newCat.toLowerCase().includes('child') || newCat.toLowerCase().includes('baby');
                      if (isKids) {
                        setSizeType('kids');
                        setProductSizes(prev => {
                          const safePrev = toSafeSizesArray(prev);
                          if (!safePrev.some(isKidsSizeString)) {
                            return ['1-2Y', '2-3Y', '3-4Y', '4-5Y', '5-6Y'];
                          }
                          return safePrev;
                        });
                      }
                    }}
                  >
                    {availableCategories.map((catName) => (
                      <option key={catName} value={catName}>{catName}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Occasion Category *</label>
                  <select value={occasion} onChange={(e) => setOccasion(e.target.value)}>
                    {availableOccasions.map((occName) => (
                      <option key={occName} value={occName}>{occName}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Original MRP Price (₹)</label>
                  <input 
                    type="number" 
                    value={originalPrice} 
                    onChange={(e) => setOriginalPrice(e.target.value)} 
                    placeholder="e.g. 4999" 
                  />
                </div>
                <div className="form-group">
                  <label>Offer / Sale Price (₹) *</label>
                  <input 
                    type="number" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    placeholder="e.g. 2999" 
                    required 
                  />
                </div>
              </div>

              {originalPrice && price && parseFloat(originalPrice) > parseFloat(price) && (
                <div style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>
                  ✨ Automatic Discount: {Math.round(((parseFloat(originalPrice) - parseFloat(price)) / parseFloat(originalPrice)) * 100)}% OFF (Customer saves ₹{(parseFloat(originalPrice) - parseFloat(price)).toLocaleString('en-IN')})
                </div>
              )}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: 'var(--color-text-primary)' }}>Description Details *</label>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
                  Type, format, or copy & paste formatted text directly from Google Docs, Word, WhatsApp, or websites. Headings, Bold, Italics, Bullet lists, and font styles will reflect on the storefront exactly as it is.
                </p>
                <RichTextEditor
                  value={description || ''}
                  onChange={(newHtml) => setDescription(newHtml)}
                  onUploadImage={handleUploadRichTextImage}
                  isUploading={isRichTextImageUploading}
                />
              </div>

              {/* Product Variants (Sizes & Colors) Configurator */}
              <div className="variants-configurator-box" style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '16px', marginBottom: '20px', backgroundColor: 'var(--color-bg-secondary)' }}>
                <h5 style={{ margin: '0 0 16px 0', fontSize: '13.5px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Garment Variants Configuration</h5>
                
                {/* Size selections */}
                <div className="form-group" style={{ marginBottom: '22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', margin: 0, color: 'var(--color-text-primary)' }}>
                        Available Garment Sizes ({productSizes.length} selected) *
                      </label>
                      <span style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)' }}>
                        Configure standard adult sizing or custom kids age groups for this garment
                      </span>
                    </div>

                    {/* Sizing Mode Tabs */}
                    <div style={{ display: 'flex', gap: '6px', background: 'var(--color-bg-primary)', padding: '3px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setSizeType('adult');
                          setProductSizes(prev => {
                            const safePrev = toSafeSizesArray(prev);
                            if (safePrev.length === 0 || safePrev.every(isKidsSizeString)) {
                              return (Array.isArray(customAdultSizes) ? customAdultSizes : DEFAULT_ADULT_SIZES).slice(0, 6);
                            }
                            return safePrev;
                          });
                        }}
                        style={{
                          padding: '4px 10px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                          backgroundColor: sizeType === 'adult' ? 'var(--color-text-primary)' : 'transparent',
                          color: sizeType === 'adult' ? '#fff' : 'var(--color-text-secondary)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        👩 Adult Sizing
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSizeType('kids');
                          setProductSizes(prev => {
                            const safePrev = toSafeSizesArray(prev);
                            if (safePrev.length === 0 || !safePrev.some(isKidsSizeString)) {
                              return ['1-2Y', '2-3Y', '3-4Y', '4-5Y', '5-6Y', '6-7Y'];
                            }
                            return safePrev;
                          });
                        }}
                        style={{
                          padding: '4px 10px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                          backgroundColor: sizeType === 'kids' ? '#8b0000' : 'transparent',
                          color: sizeType === 'kids' ? '#fff' : 'var(--color-text-secondary)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        👶 Kids by Age Group
                      </button>
                    </div>
                  </div>

                  {/* KIDS AGE GROUP PRESETS BAR (Shown in Kids mode) */}
                  {sizeType === 'kids' && (
                    <div style={{ 
                      backgroundColor: '#fffaf8', 
                      border: '1px solid #fecaca', 
                      borderRadius: '6px', 
                      padding: '10px 12px', 
                      marginBottom: '12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      flexWrap: 'wrap', 
                      gap: '8px' 
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sparkles size={14} style={{ color: '#8b0000' }} />
                        <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#8b0000' }}>
                          Quick Age Presets:
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => setProductSizes(['0-6M', '6-12M', '1-2Y', '2-3Y'])}
                          style={{ padding: '3px 8px', fontSize: '11px', borderRadius: '4px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer' }}
                        >
                          Toddlers (0-3Y)
                        </button>
                        <button
                          type="button"
                          onClick={() => setProductSizes(['3-4Y', '4-5Y', '5-6Y', '6-7Y'])}
                          style={{ padding: '3px 8px', fontSize: '11px', borderRadius: '4px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer' }}
                        >
                          Young Kids (3-7Y)
                        </button>
                        <button
                          type="button"
                          onClick={() => setProductSizes(['7-8Y', '8-9Y', '9-10Y', '10-12Y', '12-14Y'])}
                          style={{ padding: '3px 8px', fontSize: '11px', borderRadius: '4px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer' }}
                        >
                          Older Kids (7-14Y)
                        </button>
                        <button
                          type="button"
                          onClick={() => setProductSizes(Array.isArray(customKidsSizes) ? customKidsSizes : DEFAULT_KIDS_SIZES)}
                          style={{ padding: '3px 8px', fontSize: '11px', borderRadius: '4px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontWeight: 600, color: '#8b0000' }}
                        >
                          Select All Kids
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SIZES CHECKBOX GRID */}
                  {(() => {
                    const safeProductSizes = toSafeSizesArray(productSizes);
                    const baseOptions = sizeType === 'kids'
                      ? (Array.isArray(customKidsSizes) ? customKidsSizes : DEFAULT_KIDS_SIZES)
                      : (Array.isArray(customAdultSizes) ? customAdultSizes : DEFAULT_ADULT_SIZES);

                    const relevantCurrent = sizeType === 'kids'
                      ? safeProductSizes.filter(isKidsSizeString)
                      : safeProductSizes.filter(s => !isKidsSizeString(s));

                    const activeSizeOptions = Array.from(new Set([...baseOptions, ...relevantCurrent]));

                    return (
                      <div className="admin-sizes-checkbox-grid" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                        {activeSizeOptions.map(size => {
                          const isChecked = safeProductSizes.includes(size);
                          const isDefault = (sizeType === 'kids' ? DEFAULT_KIDS_SIZES : DEFAULT_ADULT_SIZES).includes(size);

                          return (
                            <div 
                              key={size} 
                              onClick={() => handleSizeCheckboxToggle(size)}
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px', 
                                background: isChecked ? (sizeType === 'kids' ? '#fef2f2' : 'var(--color-bg-primary)') : 'var(--color-bg-primary)', 
                                border: isChecked ? (sizeType === 'kids' ? '1.5px solid #8b0000' : '1.5px solid var(--color-text-primary)') : '1px solid var(--color-border)', 
                                padding: '5px 10px', 
                                borderRadius: '4px', 
                                cursor: 'pointer', 
                                fontSize: '12.5px', 
                                userSelect: 'none',
                                fontWeight: isChecked ? 600 : 400,
                                color: isChecked ? (sizeType === 'kids' ? '#8b0000' : 'var(--color-text-primary)') : 'var(--color-text-secondary)',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <input 
                                type="checkbox" 
                                checked={isChecked} 
                                readOnly
                                style={{ width: 'auto', margin: 0, pointerEvents: 'none' }}
                              />
                              <span>{size}</span>
                              {!isDefault && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDeleteCustomSize(size);
                                  }}
                                  style={{ background: 'none', border: 'none', color: '#9ca3af', padding: '0 2px', cursor: 'pointer', display: 'flex' }}
                                  title="Delete custom size"
                                >
                                  <X size={12} />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {/* CUSTOM SIZE / AGE GROUP QUICK ADD INPUT */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '420px' }}>
                    <input
                      type="text"
                      placeholder={sizeType === 'kids' ? "Add custom age: e.g. 18-24M, 4-5Y, Newborn" : "Add custom size: e.g. 3XL, 4XL, Free Size"}
                      value={newCustomSize}
                      onChange={(e) => setNewCustomSize(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomSize();
                        }
                      }}
                      style={{ fontSize: '12px', padding: '6px 10px', flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomSize}
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor: 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Plus size={13} />
                      <span>Add {sizeType === 'kids' ? 'Age Group' : 'Size'}</span>
                    </button>
                  </div>

                  {/* Stock Quantity with respect to Sizes */}
                  {toSafeSizesArray(productSizes).length > 0 && (
                    <div className="admin-size-quantities-card" style={{
                      marginTop: '16px',
                      background: 'var(--color-bg-secondary)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      padding: '14px 16px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', margin: 0, color: 'var(--color-text-primary)' }}>
                            📊 Stock Quantity per Size *
                          </label>
                          <span style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)' }}>
                            Specify quantity per size (0 = Out of Stock, &lt; 4 = Limited Stock hurry up alert)
                          </span>
                        </div>
                        {/* Bulk Apply */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)' }}>Set all to:</span>
                          <input
                            type="number"
                            min="0"
                            value={bulkSizeQty}
                            onChange={(e) => setBulkSizeQty(e.target.value)}
                            style={{ width: '60px', padding: '4px 6px', fontSize: '12px', borderRadius: '4px', border: '1px solid var(--color-border)', textAlign: 'center' }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const val = Math.max(0, parseInt(bulkSizeQty, 10) || 0);
                              const updated = {};
                              toSafeSizesArray(productSizes).forEach(s => {
                                updated[s] = val;
                              });
                              setSizeQuantities(prev => ({ ...prev, ...updated }));
                            }}
                            style={{
                              padding: '4px 10px',
                              fontSize: '11.5px',
                              fontWeight: 600,
                              background: 'var(--color-text-primary)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Apply All
                          </button>
                        </div>
                      </div>

                      {/* Quantities per Size Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                        {toSafeSizesArray(productSizes).map(sz => {
                          const qtyVal = sizeQuantities[sz] !== undefined ? sizeQuantities[sz] : 10;
                          const num = Number(qtyVal) || 0;
                          const isZero = num === 0;
                          const isLimited = num > 0 && num < 4;

                          return (
                            <div 
                              key={sz}
                              style={{
                                border: isZero ? '1.5px solid #f87171' : isLimited ? '1.5px solid #fb923c' : '1px solid var(--color-border)',
                                background: isZero ? '#fef2f2' : isLimited ? '#fff7ed' : 'var(--color-bg-primary)',
                                borderRadius: '6px',
                                padding: '8px 10px'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <strong style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>{sz}</strong>
                                {isZero ? (
                                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#dc2626', background: '#fee2e2', padding: '1px 5px', borderRadius: '3px' }}>
                                    OUT OF STOCK
                                  </span>
                                ) : isLimited ? (
                                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#ea580c', background: '#ffedd5', padding: '1px 5px', borderRadius: '3px' }}>
                                    LIMITED ({num})
                                  </span>
                                ) : (
                                  <span style={{ fontSize: '9px', fontWeight: 600, color: '#16a34a', background: '#dcfce7', padding: '1px 5px', borderRadius: '3px' }}>
                                    IN STOCK
                                  </span>
                                )}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Qty:</span>
                                <input
                                  type="number"
                                  min="0"
                                  value={qtyVal}
                                  onChange={(e) => {
                                    const val = e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10) || 0);
                                    setSizeQuantities(prev => ({
                                      ...prev,
                                      [sz]: val
                                    }));
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '4px 6px',
                                    fontSize: '12px',
                                    borderRadius: '4px',
                                    border: '1px solid var(--color-border)',
                                    fontWeight: '600'
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Color configurer */}
                <div className="form-group" style={{ margin: 0 }}>
                  
                  {/* 1. Selected Colors for This Product */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <label style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-text-primary)', margin: 0 }}>
                        Selected Product Colors ({productColors.length}) *
                      </label>
                      {productColors.length > 0 && (
                        <span style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)' }}>
                          Duplicates strictly prevented
                        </span>
                      )}
                    </div>

                    {productColors.length === 0 ? (
                      <div style={{ padding: '12px 14px', borderRadius: '6px', background: 'var(--color-bg-primary)', border: '1px dashed var(--color-border)', fontSize: '12.5px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={15} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                        <span>No colors selected yet. Click any color from the <strong>Stored Boutique Colors Library</strong> below, or add a custom color.</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px', background: 'var(--color-bg-primary)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            Selected Colors & Linked Photos
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                            Link an outfit photo to each color (swaps when customer clicks color)
                          </span>
                        </div>

                        {productColors.map(color => {
                          const assignedImg = colorImages[color.name] || color.image || '';
                          const availablePhotos = [
                            ...primaryImages.filter(img => img && typeof img === 'string' && img.trim().length > 5 && !img.startsWith('data:')),
                            ...(hoverImage && typeof hoverImage === 'string' && hoverImage.trim().length > 5 && !hoverImage.startsWith('data:') ? [hoverImage.trim()] : [])
                          ];

                          return (
                            <div 
                              key={`${color.name}-${color.hex}`}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '8px',
                                padding: '8px 12px',
                                background: 'var(--color-bg-secondary)',
                                borderRadius: '6px',
                                border: assignedImg ? '1px solid #86efac' : '1px solid var(--color-border)'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: color.hex, border: '1.5px solid rgba(0,0,0,0.2)', flexShrink: 0 }}></span>
                                <div>
                                  <strong style={{ fontSize: '12.5px', color: 'var(--color-text-primary)' }}>{color.name}</strong>
                                  <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginLeft: '6px' }}>({color.hex})</span>
                                </div>
                                <button 
                                  type="button" 
                                  onClick={() => handleRemoveColor(color.name)}
                                  title={`Remove ${color.name} from this product`}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-accent)', padding: '0 4px', fontSize: '13px' }}
                                >
                                  ✕
                                </button>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                {assignedImg ? (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <img 
                                      src={assignedImg} 
                                      alt={color.name} 
                                      style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px', border: '1.5px solid #16a34a' }} 
                                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=100'; }}
                                    />
                                    <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>Linked Photo</span>
                                    
                                    <label 
                                      className="custom-file-upload" 
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '4px 8px',
                                        fontSize: '11px',
                                        fontWeight: 500,
                                        cursor: uploadingColor === color.name ? 'wait' : 'pointer',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '4px',
                                        backgroundColor: 'var(--color-bg-primary)',
                                        color: 'var(--color-text-primary)'
                                      }}
                                      title="Upload a new photo for this color"
                                    >
                                      <Upload size={12} />
                                      <span>{uploadingColor === color.name ? 'Uploading...' : 'Change Photo'}</span>
                                      <input 
                                        type="file" 
                                        accept="image/*" 
                                        disabled={uploadingColor === color.name}
                                        onChange={(e) => handleColorImageUpload(color.name, e)} 
                                      />
                                    </label>

                                    <button
                                      type="button"
                                      onClick={() => setColorImages(prev => {
                                        const next = { ...prev };
                                        delete next[color.name];
                                        return next;
                                      })}
                                      style={{ fontSize: '11px', color: '#b91c1c', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                    <label 
                                      className="custom-file-upload" 
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        padding: '5px 10px',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        cursor: uploadingColor === color.name ? 'wait' : 'pointer',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '4px',
                                        backgroundColor: 'var(--color-bg-primary)',
                                        color: 'var(--color-text-primary)'
                                      }}
                                      title="Upload photo from your computer for this color"
                                    >
                                      <Upload size={12} />
                                      <span>{uploadingColor === color.name ? 'Uploading...' : 'Upload Photo'}</span>
                                      <input 
                                        type="file" 
                                        accept="image/*" 
                                        disabled={uploadingColor === color.name}
                                        onChange={(e) => handleColorImageUpload(color.name, e)} 
                                      />
                                    </label>

                                    {availablePhotos.length > 0 && (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Pick:</span>
                                        {availablePhotos.map((pImg, pIdx) => (
                                          <img 
                                            key={pIdx}
                                            src={pImg}
                                            alt="Photo option"
                                            title="Click to link this photo to this color"
                                            onClick={() => setColorImages(prev => ({ ...prev, [color.name]: pImg }))}
                                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                            style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                                          />
                                        ))}
                                      </div>
                                    )}

                                    <input 
                                      type="text"
                                      placeholder="Or paste photo URL..."
                                      value={colorImages[color.name] || ''}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setColorImages(prev => ({ ...prev, [color.name]: val }));
                                      }}
                                      style={{ width: '135px', padding: '4px 8px', fontSize: '11px', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-bg-primary)' }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 2. Stored Boutique Colors Library (Click to toggle) */}
                  <div style={{ marginBottom: '18px', padding: '12px', background: 'var(--color-bg-primary)', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', flexWrap: 'wrap', gap: '6px' }}>
                      <span style={{ fontWeight: 600, fontSize: '12.5px', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Palette size={14} style={{ color: 'var(--color-accent)' }} />
                        Stored Boutique Colors Library ({storedColors.length})
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                        Tap any color to instantly select / unselect
                      </span>
                    </div>
                    <p style={{ margin: '0 0 10px 0', fontSize: '11.5px', color: 'var(--color-text-secondary)' }}>
                      All catalog colors are stored here and reflect automatically for new products. No need to re-type colors every time!
                    </p>
                    
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', maxHeight: '180px', overflowY: 'auto', padding: '2px' }}>
                      {storedColors.map(color => {
                        const isSelected = productColors.some(
                          c => c.name.trim().toLowerCase() === color.name.trim().toLowerCase() ||
                               c.hex.trim().toLowerCase() === color.hex.trim().toLowerCase()
                        );
                        return (
                          <div
                            key={`${color.name}-${color.hex}`}
                            onClick={() => handleToggleStoredColor(color)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '5px 10px',
                              borderRadius: '16px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              border: isSelected ? '1.5px solid var(--color-accent)' : '1px solid var(--color-border)',
                              backgroundColor: isSelected ? 'rgba(139, 0, 0, 0.08)' : 'var(--color-bg-secondary)',
                              color: isSelected ? 'var(--color-accent)' : 'var(--color-text-primary)',
                              fontWeight: isSelected ? 600 : 400,
                              userSelect: 'none'
                            }}
                            title={`Click to ${isSelected ? 'remove' : 'add'} ${color.name} (${color.hex})`}
                          >
                            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color.hex, border: '1px solid rgba(0,0,0,0.15)', flexShrink: 0 }}></span>
                            <span>{color.name}</span>
                            {isSelected && (
                              <Check size={12} strokeWidth={2.5} style={{ color: 'var(--color-accent)', marginLeft: '2px' }} />
                            )}
                            <button
                              type="button"
                              onClick={(e) => handleRemoveStoredColor(e, color.name)}
                              title={`Delete ${color.name} from stored library`}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0 0 0 4px',
                                color: 'var(--color-text-secondary)',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                opacity: 0.5
                              }}
                              onMouseEnter={(e) => e.target.style.opacity = '1'}
                              onMouseLeave={(e) => e.target.style.opacity = '0.5'}
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Add Custom Color to Library & Product */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12.5px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      + Add Custom Color to Library & Product
                    </label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input 
                        type="text" 
                        value={newColorName}
                        onChange={(e) => { setNewColorName(e.target.value); setColorErrorMsg(''); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddColor(e); } }}
                        placeholder="Color name (e.g. Sage Green, Ruby Red)"
                        style={{ flexGrow: 1, height: '38px', minWidth: '180px', padding: '0 12px', border: '1px solid var(--color-border)', borderRadius: '4px', backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', fontSize: '13px' }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '38px', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0 8px', backgroundColor: 'var(--color-bg-primary)' }}>
                        <input 
                          type="color" 
                          value={newColorHex}
                          onChange={(e) => { setNewColorHex(e.target.value); setColorErrorMsg(''); }}
                          style={{ width: '28px', height: '24px', padding: 0, border: 'none', cursor: 'pointer', backgroundColor: 'transparent' }}
                        />
                        <input 
                          type="text" 
                          value={newColorHex}
                          onChange={(e) => { setNewColorHex(e.target.value); setColorErrorMsg(''); }}
                          placeholder="#hex"
                          style={{ border: 'none', outline: 'none', background: 'none', width: '70px', padding: 0, fontSize: '12px', color: 'var(--color-text-primary)' }}
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={handleAddColor} 
                        className="btn-secondary" 
                        style={{ height: '38px', padding: '0 16px', whiteSpace: 'nowrap', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}
                      >
                        + Add Color
                      </button>
                    </div>

                    {/* Color Error Message Banner */}
                    {colorErrorMsg && (
                      <div style={{ marginTop: '8px', padding: '8px 12px', borderRadius: '6px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '12px', fontWeight: 500 }}>
                        {colorErrorMsg}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Product Highlights Inputs */}
              <div className="highlights-form-section" style={{ border: '1px dashed var(--color-border)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                <div className="form-group" style={{ marginBottom: showKeyHighlightsConfig ? '12px' : '0' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', gap: '6px', fontWeight: 600 }}>
                    <input 
                      type="checkbox" 
                      id="showKeyHighlightsConfig" 
                      checked={showKeyHighlightsConfig} 
                      onChange={e => setShowKeyHighlightsConfig(e.target.checked)} 
                      style={{ width: 'auto', margin: 0 }}
                    />
                    <span>Enable Key Highlights Configurations</span>
                  </label>
                </div>
                {showKeyHighlightsConfig && (
                  <>
                    <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: 'var(--color-accent)' }}>Key Highlights Configuration</h5>

                    {/* Each highlight field: editable heading input on top, value input below */}
                    {(() => {
                      const hStyle = {
                        display: 'block',
                        width: '100%',
                        fontSize: '10px',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: 'var(--color-text-secondary)',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '1px dashed var(--color-border)',
                        outline: 'none',
                        marginBottom: '4px',
                        padding: '2px 0',
                        cursor: 'text',
                      };
                      return (
                        <>
                          <div className="form-row-double">
                            <div className="form-group">
                              <input style={hStyle} value={headingFit} onChange={e => setHeadingFit(e.target.value)} placeholder="Heading…" title="Edit heading" />
                              <input type="text" value={hFit} onChange={(e) => setHFit(e.target.value)} placeholder="e.g. Straight Regular Fit" />
                            </div>
                            <div className="form-group">
                              <input style={hStyle} value={headingFabric} onChange={e => setHeadingFabric(e.target.value)} placeholder="Heading…" title="Edit heading" />
                              <input type="text" value={hFabric} onChange={(e) => setHFabric(e.target.value)} placeholder="e.g. 100% Breathable Cotton" />
                            </div>
                          </div>

                          <div className="form-row-double">
                            <div className="form-group">
                              <input style={hStyle} value={headingNeck} onChange={e => setHeadingNeck(e.target.value)} placeholder="Heading…" title="Edit heading" />
                              <input type="text" value={hNeck} onChange={(e) => setHNeck(e.target.value)} placeholder="e.g. Mandarin Neck" />
                            </div>
                            <div className="form-group">
                              <input style={hStyle} value={headingSleeve} onChange={e => setHeadingSleeve(e.target.value)} placeholder="Heading…" title="Edit heading" />
                              <input type="text" value={hSleeve} onChange={(e) => setHSleeve(e.target.value)} placeholder="e.g. 3/4 Sleeves" />
                            </div>
                          </div>

                          <div className="form-row-double">
                            <div className="form-group">
                              <input style={hStyle} value={headingFrontNeck} onChange={e => setHeadingFrontNeck(e.target.value)} placeholder="Heading…" title="Edit heading" />
                              <input type="text" value={hFrontNeck} onChange={(e) => setHFrontNeck(e.target.value)} placeholder='e.g. 6.5 Inches or Round 7"' />
                            </div>
                            <div className="form-group">
                              <input style={hStyle} value={headingBackNeck} onChange={e => setHeadingBackNeck(e.target.value)} placeholder="Heading…" title="Edit heading" />
                              <input type="text" value={hBackNeck} onChange={(e) => setHBackNeck(e.target.value)} placeholder='e.g. 8 Inches or Deep U 8"' />
                            </div>
                          </div>

                          <div className="form-row-double">
                            <div className="form-group">
                              <input style={hStyle} value={headingLength} onChange={e => setHeadingLength(e.target.value)} placeholder="Heading…" title="Edit heading" />
                              <input type="text" value={hLength} onChange={(e) => setHLength(e.target.value)} placeholder="e.g. 16 Inches" />
                            </div>
                            <div className="form-group">
                              <input style={hStyle} value={headingTechnique} onChange={e => setHeadingTechnique(e.target.value)} placeholder="Heading…" title="Edit heading" />
                              <input type="text" value={hTechnique} onChange={(e) => setHTechnique(e.target.value)} placeholder="e.g. Handcrafted Chikankari" />
                            </div>
                          </div>

                          <div className="form-row-double">
                            <div className="form-group">
                              <input style={hStyle} value={headingTopHeight} onChange={e => setHeadingTopHeight(e.target.value)} placeholder="Heading…" title="Edit heading" />
                              <input type="text" value={hTopHeight} onChange={(e) => setHTopHeight(e.target.value)} placeholder="e.g. 44 Inches" />
                            </div>
                            <div className="form-group">
                              <input style={hStyle} value={headingBottomHeight} onChange={e => setHeadingBottomHeight(e.target.value)} placeholder="Heading…" title="Edit heading" />
                              <input type="text" value={hBottomHeight} onChange={(e) => setHBottomHeight(e.target.value)} placeholder="e.g. 38 Inches" />
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </>
                )}
              </div>
              
              {/* Primary Slideshow Images Upload & URLs */}
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '700' }}>Product Slideshow Photos * (Upload files or paste URLs)</span>
                  <span style={{ fontSize: '10.5px', color: 'var(--color-text-secondary)', fontWeight: '400' }}>These display in the detail slideshow carousel (exclude hover swap image here).</span>
                </label>
                
                {/* File Upload Selector */}
                <div className="file-upload-wrapper" style={{ marginBottom: '16px' }}>
                  <label className="custom-file-upload" style={{ display: 'inline-flex', cursor: 'pointer', gap: '8px', padding: '10px 16px', border: '1px dashed var(--color-text-secondary)', borderRadius: '6px' }}>
                    <Upload size={14} />
                    <span>Upload Multiple Primary Photos</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple
                      onChange={handleMultiplePrimaryUpload} 
                    />
                  </label>
                </div>

                {/* List of Image URLs / Uploaded Previews */}
                <div className="admin-images-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {primaryImages.map((imgUrl, index) => (
                    <div key={index} className="admin-image-input-item animate-fadeIn" style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      padding: '12px',
                      border: '1px solid var(--color-border)',
                      borderRadius: '6px',
                      backgroundColor: 'var(--color-bg-secondary)'
                    }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', minWidth: '85px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {index === 0 ? 'Primary 🌟' : `Photo ${index + 1}`}
                        </span>
                        <input 
                          type="text" 
                          placeholder="Paste primary image URL here..." 
                          value={imgUrl} 
                          onChange={(e) => handlePrimaryTextChange(index, e.target.value)}
                          style={{ flex: 1, margin: 0, padding: '8px 12px', fontSize: '12px', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                        />
                        <button 
                          type="button" 
                          onClick={() => handleRemovePrimaryRow(index)}
                          style={{
                            padding: '8px 14px',
                            fontSize: '11px',
                            fontWeight: '600',
                            backgroundColor: '#fee2e2',
                            border: '1px solid #fca5a5',
                            color: '#dc2626',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                      
                      {imgUrl && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                          <img 
                            src={imgUrl} 
                            alt={`Primary Preview ${index + 1}`} 
                            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=150'; }}
                          />
                          <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600' }}>Preview Loaded ✓</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button 
                  type="button" 
                  onClick={handleAddPrimaryRow}
                  style={{
                    marginTop: '12px',
                    padding: '10px 16px',
                    fontSize: '11px',
                    fontWeight: '600',
                    backgroundColor: 'transparent',
                    border: '1px dashed var(--color-text-secondary)',
                    color: 'var(--color-text-secondary)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  <PlusCircle size={13} />
                  Add Another Slideshow Photo Field
                </button>
              </div>

              {/* Designated Hover Effect Image Upload Field */}
              <div className="form-group" style={{ gridColumn: 'span 2', padding: '16px', border: '1px solid var(--color-border)', borderRadius: '6px', backgroundColor: 'var(--color-bg-secondary)' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '700', fontSize: '13px' }}>Hover Effect Image</span>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '400' }}>This photo will display when a user hovers over the product card in grids.</span>
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <label className="custom-file-upload" style={{ display: 'inline-flex', cursor: 'pointer', gap: '8px', padding: '10px 16px', border: '1px solid var(--color-border)', borderRadius: '6px', backgroundColor: 'var(--color-bg-primary)', fontSize: '12px', fontWeight: '500' }}>
                    <Upload size={14} />
                    <span>Upload Hover File</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleHoverUpload} 
                    />
                  </label>
                  <input 
                    type="text" 
                    placeholder="Or paste hover image URL here..." 
                    value={hoverImage} 
                    onChange={(e) => setHoverImage(e.target.value)}
                    style={{ flex: 1, margin: 0, padding: '10px 12px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-primary)' }}
                  />
                </div>
                {hoverImage && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                    <img 
                      src={hoverImage} 
                      alt="Hover Swap Preview" 
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=150'; }}
                    />
                    <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600' }}>Hover Preview Loaded ✓</span>
                  </div>
                )}
              </div>

              {/* Feasibility for Best Selling toggle, customizable toggle, ratings, and reviews count */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', gridColumn: 'span 2', marginTop: '10px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                <div className="form-group-checkbox" style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                  <input 
                    type="checkbox" 
                    id="custom-tailor" 
                    checked={customizable} 
                    onChange={() => setCustomizable(!customizable)} 
                  />
                  <label htmlFor="custom-tailor" style={{ fontWeight: '600', cursor: 'pointer' }}>Supports Custom Stitching</label>
                </div>

                <div className="form-group-checkbox" style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                  <input 
                    type="checkbox" 
                    id="best-seller" 
                    checked={bestSeller} 
                    onChange={() => setBestSeller(!bestSeller)} 
                  />
                  <label htmlFor="best-seller" style={{ fontWeight: '600', cursor: 'pointer' }}>Mark as Best Seller</label>
                </div>

                <div className="form-group-checkbox" style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                  <input 
                    type="checkbox" 
                    id="new-arrival-check" 
                    checked={newArrival} 
                    onChange={() => setNewArrival(!newArrival)} 
                  />
                  <label htmlFor="new-arrival-check" style={{ fontWeight: '600', cursor: 'pointer' }}>New Arrival 🔥</label>
                </div>

                <div className="form-group-checkbox" style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                  <input 
                    type="checkbox" 
                    id="product-show-oos" 
                    checked={showOutOfStock} 
                    onChange={(e) => setShowOutOfStock(e.target.checked)} 
                  />
                  <label htmlFor="product-show-oos" style={{ fontWeight: '600', cursor: 'pointer', fontSize: '12px' }}>
                    Show "Out of Stock" to customer (If unchecked when sold out, product is removed from customer view)
                  </label>
                </div>

                <div className="form-group-checkbox" style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                  <input 
                    type="checkbox" 
                    id="product-is-oos" 
                    checked={isOutOfStock} 
                    onChange={(e) => setIsOutOfStock(e.target.checked)} 
                  />
                  <label htmlFor="product-is-oos" style={{ fontWeight: '600', cursor: 'pointer', fontSize: '12px', color: isOutOfStock ? '#dc2626' : 'inherit' }}>
                    Mark entire product as Out of Stock
                  </label>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontWeight: '600', marginBottom: '4px', fontSize: '12px' }}>Product Rating (1.0 to 5.0)</label>
                  <input 
                    type="number" 
                    min="1.0" 
                    max="5.0" 
                    step="0.1" 
                    value={rating} 
                    onChange={(e) => setRating(e.target.value)} 
                    style={{ padding: '8px 12px', fontSize: '12px', borderRadius: '4px', border: '1px solid var(--color-border)', width: '100%' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontWeight: '600', marginBottom: '4px', fontSize: '12px' }}>Count of Reviews</label>
                  <input 
                    type="number" 
                    min="0" 
                    value={reviewsCount} 
                    onChange={(e) => setReviewsCount(e.target.value)} 
                    style={{ padding: '8px 12px', fontSize: '12px', borderRadius: '4px', border: '1px solid var(--color-border)', width: '100%' }}
                  />
                </div>
              </div>

              <div className="form-buttons-row">
                <button type="submit" className="add-btn-submit">
                  {editingProduct ? <Edit3 size={14} /> : <PlusCircle size={14} />}
                  <span>{editingProduct ? 'Save Changes' : 'Publish Product'}</span>
                </button>
                {editingProduct && (
                  <button type="button" className="cancel-edit-btn" onClick={handleCancelEdit}>
                    <XCircle size={14} />
                    <span>Cancel Edit</span>
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Listing Inventory */}
          <div className="admin-catalog-listing">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              <h4 style={{ margin: 0 }}>Boutique Catalog Control</h4>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                Showing {filteredCatalogProducts.length} of {products.length} outfits
              </span>
            </div>

            {/* Search and Category Filter Bar */}
            <div style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '16px',
              flexWrap: 'wrap',
              background: 'var(--color-bg-primary)',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)'
            }}>
              <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-bg-secondary)', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                <Search size={15} style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }} />
                <input 
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Search catalog by product name or category..."
                  style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '12.5px', color: 'var(--color-text-primary)' }}
                />
                {catalogSearch && (
                  <button 
                    type="button" 
                    onClick={() => setCatalogSearch('')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: 0 }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <select 
                value={catalogCategoryFilter}
                onChange={(e) => setCatalogCategoryFilter(e.target.value)}
                style={{
                  padding: '6px 12px',
                  fontSize: '12.5px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Categories ({products.length})</option>
                {uniqueCategories.map(cat => {
                  const count = products.filter(p => p.category === cat).length;
                  return (
                    <option key={cat} value={cat}>
                      {cat} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="admin-inventory-list">
              {filteredCatalogProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--color-text-secondary)', fontSize: '13px', background: 'var(--color-bg-primary)', borderRadius: '8px', border: '1px dashed var(--color-border)' }}>
                  <p style={{ margin: '0 0 8px 0' }}>No outfits found matching "<strong>{catalogSearch}</strong>"{catalogCategoryFilter !== 'all' ? ` in ${catalogCategoryFilter}` : ''}.</p>
                  <button 
                    type="button" 
                    onClick={() => { setCatalogSearch(''); setCatalogCategoryFilter('all'); }}
                    style={{ padding: '5px 14px', fontSize: '12px', fontWeight: 600, borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)', cursor: 'pointer' }}
                  >
                    Clear Filter
                  </button>
                </div>
              ) : (
                filteredCatalogProducts.map((prod) => (
                  <div key={prod.id} className="inventory-card">
                  <img src={prod.images[0]} alt={prod.title} />
                  <div className="inventory-details">
                    <h5>{prod.title}</h5>
                    {(() => {
                      const origP = prod.originalPrice || prod.highlights?.originalPrice;
                      const hasDiscount = origP && Number(origP) > Number(prod.price);
                      const discountPercent = hasDiscount ? Math.round(((Number(origP) - Number(prod.price)) / Number(origP)) * 100) : 0;
                      return (
                        <p style={{ margin: '2px 0 4px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                          {prod.category} | 
                          {hasDiscount && (
                            <span style={{ textDecoration: 'line-through', color: '#888888', margin: '0 4px', fontSize: '12px' }}>
                              ₹{Number(origP).toLocaleString('en-IN')}
                            </span>
                          )}
                          <strong style={{ color: 'var(--color-text-primary)' }}>₹{Number(prod.price).toLocaleString('en-IN')}</strong>
                          {hasDiscount && (
                            <span style={{ color: '#d90429', fontWeight: '700', marginLeft: '6px', fontSize: '12px' }}>
                              ({discountPercent}% OFF)
                            </span>
                          )}
                        </p>
                      );
                    })()}
                    <span className="customize-tag">{prod.customizable ? 'Tailoring Available' : 'Standard Sizing'}</span>

                    {/* Stock Status & Out of Stock Checkbox */}
                    {(() => {
                      const pSizes = Array.isArray(prod.variants?.sizes) ? prod.variants.sizes : [];
                      const pQuantities = prod.variants?.sizeQuantities || prod.sizeQuantities || {};
                      const hasSizes = pSizes.length > 0;
                      const isAllZero = hasSizes && pSizes.every(s => (pQuantities[s] !== undefined && Number(pQuantities[s]) <= 0));
                      const isSoldOut = Boolean(prod.isOutOfStock || prod.variants?.isOutOfStock || isAllZero);
                      const isShowOos = Boolean(prod.showOutOfStock !== undefined ? prod.showOutOfStock : prod.variants?.showOutOfStock);
                      const totalUnits = pSizes.reduce((sum, s) => sum + (pQuantities[s] !== undefined ? Number(pQuantities[s]) : 10), 0);

                      return (
                        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--color-border)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                            {isSoldOut ? (
                              isShowOos ? (
                                <span style={{ fontSize: '11px', fontWeight: 600, color: '#c2410c', background: '#ffedd5', padding: '2px 8px', borderRadius: '4px' }}>
                                  ⚠️ Out of Stock (Shows to Customer)
                                </span>
                              ) : (
                                <span style={{ fontSize: '11px', fontWeight: 600, color: '#b91c1c', background: '#fee2e2', padding: '2px 8px', borderRadius: '4px' }}>
                                  🚫 Out of Stock (Hidden from Customer View)
                                </span>
                              )
                            ) : (
                              <span style={{ fontSize: '11px', fontWeight: 600, color: '#15803d', background: '#dcfce7', padding: '2px 8px', borderRadius: '4px' }}>
                                ✅ In Stock ({totalUnits} units)
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', cursor: 'pointer', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                              <input 
                                type="checkbox"
                                checked={isShowOos}
                                onChange={(e) => {
                                  const updated = {
                                    ...prod,
                                    showOutOfStock: e.target.checked,
                                    variants: {
                                      ...(prod.variants || {}),
                                      showOutOfStock: e.target.checked
                                    }
                                  };
                                  onUpdateProduct(updated);
                                }}
                                style={{ width: 'auto', margin: 0, cursor: 'pointer' }}
                              />
                              <span>Show Out of Stock to customer</span>
                            </label>

                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', cursor: 'pointer', color: isSoldOut ? '#dc2626' : 'var(--color-text-secondary)' }}>
                              <input 
                                type="checkbox"
                                checked={isSoldOut}
                                onChange={(e) => {
                                  const nextOos = e.target.checked;
                                  const updated = {
                                    ...prod,
                                    isOutOfStock: nextOos,
                                    variants: {
                                      ...(prod.variants || {}),
                                      isOutOfStock: nextOos
                                    }
                                  };
                                  onUpdateProduct(updated);
                                }}
                                style={{ width: 'auto', margin: 0, cursor: 'pointer' }}
                              />
                              <span>Mark Out of Stock</span>
                            </label>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="inventory-card-actions">
                    <button 
                      className="edit-item-btn" 
                      onClick={() => handleEditClick(prod)}
                      title="Edit Item details"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button 
                      className="delete-item-btn" 
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${prod.title}"? This item will be permanently removed.`)) {
                          onDeleteProduct(prod.id);
                        }
                      }}
                      title="Delete Item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Store Coupons Configurator */}
      {activeTab === 'promos' && (
        <div className="admin-content-section catalog-management-grid animate-fadeIn">
          <div className="add-product-form-box">
            <h4>Configure Store Coupons</h4>
            {promoSuccessMsg && <p className="success-banner">{promoSuccessMsg}</p>}
            <form onSubmit={handleAddPromoSubmit}>
              <div className="form-group">
                <label>Promo Coupon Code *</label>
                <input 
                  type="text" 
                  value={promoCode} 
                  onChange={(e) => setPromoCode(e.target.value)} 
                  placeholder="e.g. SILK20" 
                  required 
                />
              </div>
              <div className="form-row-double">
                <div className="form-group">
                  <label>Discount Type *</label>
                  <select value={promoType} onChange={(e) => setPromoType(e.target.value)}>
                    <option value="percent">Percent Discount (%)</option>
                    <option value="flat">Flat Cash Discount (₹)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Value (Amt / %)*</label>
                  <input 
                    type="number" 
                    value={promoValue} 
                    onChange={(e) => setPromoValue(e.target.value)} 
                    placeholder="e.g. 15 for percent, 200 for flat" 
                    required 
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Minimum Purchase Threshold (₹)*</label>
                <input 
                  type="number" 
                  value={promoMinPurchase} 
                  onChange={(e) => setPromoMinPurchase(e.target.value)} 
                  placeholder="0" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Description Label (shown to Customer)</label>
                <input 
                  type="text" 
                  value={promoDesc} 
                  onChange={(e) => setPromoDesc(e.target.value)} 
                  placeholder="e.g. 10% discount on all orders!" 
                />
              </div>

              {/* Selective Coupon Targeting */}
              <div className="form-group" style={{ background: 'var(--color-bg-secondary)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', marginBottom: '16px' }}>
                <label style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px', display: 'block', color: 'var(--color-text-primary)' }}>
                  🎯 Coupon Scope / Applicability *
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'all', label: 'Store-Wide (All Products)' },
                    { id: 'category', label: 'Selective Categories' },
                    { id: 'product', label: 'Selective Outfits' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setPromoApplicableType(tab.id)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: '6px',
                        border: promoApplicableType === tab.id ? '1.5px solid var(--color-text-primary)' : '1px solid var(--color-border)',
                        background: promoApplicableType === tab.id ? 'var(--color-text-primary)' : 'var(--color-bg-primary)',
                        color: promoApplicableType === tab.id ? '#fff' : 'var(--color-text-primary)',
                        cursor: 'pointer'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* If Selective Categories */}
                {promoApplicableType === 'category' && (
                  <div style={{ marginTop: '8px' }}>
                    <span style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                      Select which categories this coupon applies to ({promoApplicableCategories.length} selected):
                    </span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {uniqueCategories.map(cat => {
                        const isChecked = promoApplicableCategories.includes(cat);
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              if (isChecked) {
                                setPromoApplicableCategories(prev => prev.filter(c => c !== cat));
                              } else {
                                setPromoApplicableCategories(prev => [...prev, cat]);
                              }
                            }}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '16px',
                              fontSize: '11.5px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              border: isChecked ? '1px solid #16a34a' : '1px solid var(--color-border)',
                              background: isChecked ? '#dcfce7' : 'var(--color-bg-primary)',
                              color: isChecked ? '#15803d' : 'var(--color-text-secondary)'
                            }}
                          >
                            {isChecked ? '✓ ' : '+ '} {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* If Selective Products */}
                {promoApplicableType === 'product' && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)' }}>
                        Select outfits eligible for this coupon ({promoApplicableProducts.length} selected):
                      </span>
                      {promoApplicableProducts.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setPromoApplicableProducts([])}
                          style={{ fontSize: '11px', color: '#b91c1c', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          Clear Selection
                        </button>
                      )}
                    </div>

                    <input 
                      type="text"
                      placeholder="Filter outfits by name or category..."
                      value={couponProductSearch}
                      onChange={(e) => setCouponProductSearch(e.target.value)}
                      style={{ width: '100%', padding: '6px 10px', fontSize: '12px', borderRadius: '4px', border: '1px solid var(--color-border)', marginBottom: '8px', background: 'var(--color-bg-primary)' }}
                    />

                    <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '6px', background: 'var(--color-bg-primary)' }}>
                      {(products || []).filter(p => !couponProductSearch || p.title.toLowerCase().includes(couponProductSearch.toLowerCase()) || p.category.toLowerCase().includes(couponProductSearch.toLowerCase())).map(p => {
                        const isChecked = promoApplicableProducts.includes(p.id);
                        return (
                          <div 
                            key={p.id}
                            onClick={() => {
                              if (isChecked) {
                                setPromoApplicableProducts(prev => prev.filter(id => id !== p.id));
                              } else {
                                setPromoApplicableProducts(prev => [...prev, p.id]);
                              }
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '6px 8px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              background: isChecked ? '#f0fdf4' : 'transparent',
                              border: isChecked ? '1px solid #86efac' : '1px solid transparent'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input 
                                type="checkbox" 
                                checked={isChecked} 
                                onChange={() => {}} 
                                style={{ cursor: 'pointer' }} 
                              />
                              <img 
                                src={p.images?.[0]} 
                                alt={p.title} 
                                style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px' }} 
                              />
                              <div>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)', display: 'block' }}>{p.title}</span>
                                <span style={{ fontSize: '10.5px', color: 'var(--color-text-secondary)' }}>{p.category} | ₹{Number(p.price).toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <button type="submit" className="add-btn-submit">
                <Tag size={14} />
                <span>Create Offer Coupon</span>
              </button>
            </form>
          </div>

          <div className="admin-catalog-listing">
            <h4>Active Promotion Codes</h4>
            <div className="admin-inventory-list">
              {promosList.map((promo) => {
                const cleanDescription = (promo.description || '').split('__TARGET__')[0];
                return (
                  <div key={promo.code} className="inventory-card promo-card-item">
                    <div className="promo-tag-icon-box">
                      <Tag size={20} />
                    </div>
                    <div className="inventory-details text-left">
                      <h5 className="promo-tag-code">{promo.code}</h5>
                      <p>{cleanDescription}</p>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                        <span className="customize-tag" style={{ margin: 0 }}>
                          {promo.minPurchase > 0 ? `Min: ₹${promo.minPurchase}` : 'No Min'}
                        </span>
                        {promo.applicableType === 'category' && promo.applicableCategories?.length > 0 ? (
                          <span style={{ fontSize: '11px', color: '#15803d', background: '#dcfce7', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                            🏷️ {promo.applicableCategories.join(', ')}
                          </span>
                        ) : promo.applicableType === 'product' && promo.applicableProducts?.length > 0 ? (
                          <span style={{ fontSize: '11px', color: '#0369a1', background: '#e0f2fe', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                            👗 {promo.applicableProducts.length} Selected Outfits
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#475569', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                            🌐 Store-Wide
                          </span>
                        )}
                      </div>
                    </div>
                    <button 
                      className="delete-item-btn" 
                      onClick={() => handleDeletePromo(promo.code)}
                      title="Remove Promo Code"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Couture Reels Manager */}
      {activeTab === 'reels' && (
        <div className="admin-content-section catalog-management-grid animate-fadeIn">
          {/* Add Reel Form */}
          <div className="add-product-form-box">
            <h4>Publish New Couture Reel</h4>
            {reelSuccessMsg && <p className="success-banner">{reelSuccessMsg}</p>}
            <p className="admin-form-intro">Configure vertical video banners with play loops to showcase outfit overlays directly on the homepage.</p>
            
            <form onSubmit={handleAddReelSubmit}>
              <div className="form-group">
                <label>Reel Title *</label>
                <input 
                  type="text" 
                  value={reelTitle} 
                  onChange={(e) => setReelTitle(e.target.value)} 
                  placeholder="e.g. Silk Anarkali Motion Showcase" 
                  required 
                />
              </div>

              {/* Upload MP4 File */}
              <div className="form-group">
                <label>Upload Vertical Video (MP4)</label>
                <div className="file-upload-wrapper">
                  <label className="custom-file-upload">
                    <Upload size={14} />
                    <span>Select Video File</span>
                    <input 
                      type="file" 
                      accept="video/*" 
                      onChange={handleVideoUpload} 
                    />
                  </label>
                </div>
              </div>

              <div className="form-group-divider"><span>OR</span></div>

              {/* Input Video URL */}
              <div className="form-group">
                <label>Vertical Video MP4 URL</label>
                <input 
                  type="url" 
                  value={reelVideoFile && !reelVideoFile.startsWith('data:video') ? reelVideoFile : ''} 
                  onChange={(e) => setReelVideoFile(e.target.value)} 
                  placeholder="https://assets.mixkit.co/videos/..." 
                />
              </div>

              {reelVideoFile && (
                <div className="admin-video-preview">
                  <span className="file-loaded-status">Video Source Set ✓</span>
                  <video src={reelVideoFile} muted style={{ width: '120px', height: '213px', objectFit: 'cover', display: 'block', margin: '10px 0', borderRadius: '6px' }} />
                </div>
              )}

              {/* Associate with catalog product */}
              <div className="form-group">
                <label>Link Catalog Outfit (Optional)</label>
                <select value={reelProductId} onChange={(e) => setReelProductId(e.target.value)}>
                  <option value="">-- Select Product --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.title} (₹{p.price})</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="add-btn-submit">
                <Film size={14} />
                <span>Publish Reel banner</span>
              </button>
            </form>
          </div>

          {/* Active Reels List */}
          <div className="admin-catalog-listing">
            <h4>Live Couture Reels Banners</h4>
            <div className="admin-inventory-list">
              {reelsList.map((reel) => (
                <div key={reel.id} className="inventory-card reel-admin-card">
                  {reel.videoUrl && (
                    <video 
                      src={reel.videoUrl} 
                      muted 
                      autoPlay 
                      loop 
                      playsInline
                      style={{ 
                        width: '60px', 
                        height: '100px', 
                        objectFit: 'cover', 
                        borderRadius: '6px',
                        pointerEvents: 'none'
                      }} 
                    />
                  )}
                  <div className="inventory-details text-left">
                    <h5>{reel.title}</h5>
                    <p className="associated-status-label">
                      {reel.productId ? `🔗 Linked: ${reel.productTitle || 'Product'}` : 'No associated product'}
                    </p>
                  </div>
                  <button 
                    className="delete-item-btn" 
                    onClick={() => handleDeleteReel(reel.id)}
                    title="Remove Reel Banner"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Analytics & Revenue Hub */}
      {activeTab === 'stats' && (() => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const filteredAnalyticsOrders = orders.filter(order => {
          if (analyticsTimeFilter === 'all') return true;
          const orderDate = new Date(order.timestamp || order.date || order.createdAt);
          if (isNaN(orderDate.getTime())) return true;

          if (analyticsTimeFilter === 'today') {
            return orderDate >= startOfToday;
          }
          if (analyticsTimeFilter === 'yesterday') {
            const startOfYesterday = new Date(startOfToday);
            startOfYesterday.setDate(startOfYesterday.getDate() - 1);
            return orderDate >= startOfYesterday && orderDate < startOfToday;
          }
          if (analyticsTimeFilter === '7days') {
            const sevenDaysAgo = new Date(startOfToday);
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return orderDate >= sevenDaysAgo;
          }
          if (analyticsTimeFilter === '30days') {
            const thirtyDaysAgo = new Date(startOfToday);
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return orderDate >= thirtyDaysAgo;
          }
          return true;
        });

        const validOrders = filteredAnalyticsOrders.filter(o => {
          const st = (o.status || '').toLowerCase();
          return !st.includes('cancel');
        });

        const filteredTotalOrders = validOrders.length;
        const filteredTotalRevenue = validOrders.reduce((sum, o) => sum + (o.total || o.totalAmount || 0), 0);
        const filteredAvgOrderVal = filteredTotalOrders > 0 ? Math.round(filteredTotalRevenue / filteredTotalOrders) : 0;

        const pendingPaymentOrders = filteredAnalyticsOrders.filter(o => {
          const st = (o.status || '').toLowerCase();
          if (st.includes('cancel') || st === 'delivered') return false;
          
          const payId = (o.paymentId || o.payment_id || '').toString().toUpperCase();
          const payMethod = (o.paymentMethod || '').toString().toUpperCase();
          const payStatus = (o.paymentStatus || '').toString().toUpperCase();

          const isCOD = payId.includes('COD') || 
                        payId === '' || 
                        payMethod.includes('COD') || 
                        payMethod.includes('CASH') || 
                        payMethod === '' ||
                        payStatus !== 'PAID';
          
          return isCOD;
        });
        const pendingPaymentCount = pendingPaymentOrders.length;
        const pendingPaymentRev = pendingPaymentOrders.reduce((sum, o) => sum + (o.total || o.totalAmount || 0), 0);

        const customFitOrders = filteredAnalyticsOrders.filter(o => 
          o.items?.some(i => i.wantsCustomStitching || i.size === 'Custom Tailored')
        ).length;
        const customFitPct = filteredTotalOrders > 0 ? Math.round((customFitOrders / filteredTotalOrders) * 100) : 0;

        const statusCounts = {
          'Pending Shipment': filteredAnalyticsOrders.filter(o => o.status === 'Pending Shipment' || o.status === 'Placed' || !o.status).length,
          'Quality Check': filteredAnalyticsOrders.filter(o => o.status === 'Quality Check').length,
          'Shipped': filteredAnalyticsOrders.filter(o => o.status === 'Shipped').length,
          'Delivered': filteredAnalyticsOrders.filter(o => o.status === 'Delivered').length,
          'Cancelled': filteredAnalyticsOrders.filter(o => (o.status || '').toLowerCase().includes('cancel')).length
        };

        const donutChartData = [
          { label: 'Pending Shipment', value: statusCounts['Pending Shipment'], color: '#3b82f6' },
          { label: 'Quality Check', value: statusCounts['Quality Check'], color: '#a855f7' },
          { label: 'Shipped', value: statusCounts['Shipped'], color: '#6366f1' },
          { label: 'Delivered', value: statusCounts['Delivered'], color: '#10b981' },
          { label: 'Cancelled', value: statusCounts['Cancelled'], color: '#ef4444' }
        ].filter(d => d.value > 0);

        const sizingCounts = { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0, 'Custom Tailored': 0 };
        filteredAnalyticsOrders.forEach(o => {
          o.items?.forEach(i => {
            if (i.wantsCustomStitching || i.size === 'Custom Tailored') {
              sizingCounts['Custom Tailored'] += (i.quantity || 1);
            } else if (i.size && sizingCounts[i.size] !== undefined) {
              sizingCounts[i.size] += (i.quantity || 1);
            } else if (i.selectedSize && sizingCounts[i.selectedSize] !== undefined) {
              sizingCounts[i.selectedSize] += (i.quantity || 1);
            }
          });
        });

        const totalItemsCount = Object.values(sizingCounts).reduce((a, b) => a + b, 0);

        const sizingBarItems = Object.entries(sizingCounts).map(([sz, cnt]) => ({
          label: sz,
          value: cnt,
          maxVal: Math.max(...Object.values(sizingCounts), 1),
          subtext: `${cnt} units (${totalItemsCount > 0 ? Math.round((cnt / totalItemsCount) * 100) : 0}%)`,
          color: sz === 'Custom Tailored' ? '#8b0000' : '#475569'
        }));

        const productSalesMap = {};
        filteredAnalyticsOrders.forEach(o => {
          if ((o.status || '').toLowerCase().includes('cancel')) return;
          o.items?.forEach(i => {
            const pId = i.product?.id || i.id || i.title;
            const pTitle = i.product?.title || i.title || 'Outfit Item';
            const qty = i.quantity || 1;
            const itemRev = (i.price || i.product?.price || 0) * qty;

            if (!productSalesMap[pId]) {
              productSalesMap[pId] = { title: pTitle, qty: 0, revenue: 0, image: i.product?.images?.[0] || i.images?.[0] };
            }
            productSalesMap[pId].qty += qty;
            productSalesMap[pId].revenue += itemRev;
          });
        });

        const sortedBestSellers = Object.values(productSalesMap)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        const handleExportCSV = () => {
          const filterLabels = { today: 'Today', yesterday: 'Yesterday', '7days': 'Last_7_Days', '30days': 'Last_30_Days', all: 'All_Time' };
          const label = filterLabels[analyticsTimeFilter] || 'Report';
          
          if (filteredAnalyticsOrders.length === 0) {
            alert('No orders found for the selected time filter to export.');
            return;
          }

          const headers = ['Order ID', 'Date', 'Customer Name', 'Phone', 'Total (INR)', 'Payment Status', 'Fulfillment Status', 'Items Count', 'Custom Tailored'];
          const rows = filteredAnalyticsOrders.map(o => {
            const isCustom = o.items?.some(i => i.wantsCustomStitching || i.size === 'Custom Tailored') ? 'Yes' : 'No';
            const dateStr = new Date(o.timestamp || o.date || o.createdAt).toLocaleDateString();
            const st = (o.status || '').toLowerCase();
            const calcPaymentStatus = st.includes('cancel') ? 'Cancelled' : (st === 'delivered' ? 'Paid' : 'Unpaid (COD Pending)');
            return [
              `"${o.id}"`,
              `"${dateStr}"`,
              `"${o.shippingDetails?.name || 'N/A'}"`,
              `"${o.shippingDetails?.phone || 'N/A'}"`,
              o.total || o.totalAmount || 0,
              `"${calcPaymentStatus}"`,
              `"${o.status || 'Placed'}"`,
              o.items?.length || 1,
              `"${isCustom}"`
            ].join(',');
          });

          const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
          const encodedUri = encodeURI(csvContent);
          const link = document.createElement('a');
          link.setAttribute('href', encodedUri);
          link.setAttribute('download', `IniByMaya_Sales_Analytics_${label}_${new Date().toISOString().slice(0, 10)}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };

        return (
          <div className="admin-content-section animate-fadeIn">
            <div className="admin-section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', paddingBottom: '14px', borderBottom: '1px solid var(--color-border)' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', color: '#8b0000', fontFamily: 'var(--font-display)' }}>📊 Analytics & Revenue Hub</h3>
              </div>

              <button
                type="button"
                className="btn-secondary"
                onClick={handleExportCSV}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontSize: '13px', borderRadius: '6px' }}
              >
                <Download size={15} /> Export Sales CSV
              </button>
            </div>

            {/* Time Filter Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--color-bg-secondary)',
              padding: '6px 12px',
              borderRadius: '30px',
              border: '1px solid var(--color-border)',
              marginBottom: '28px',
              overflowX: 'auto',
              maxWidth: '100%',
              whiteSpace: 'nowrap',
              WebkitOverflowScrolling: 'touch'
            }}>
              {[
                { id: 'today', label: 'Today' },
                { id: 'yesterday', label: 'Yesterday' },
                { id: '7days', label: 'Last 7 Days' },
                { id: '30days', label: 'Last 30 Days' },
                { id: 'all', label: 'All Time' }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setAnalyticsTimeFilter(f.id)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '20px',
                    border: 'none',
                    backgroundColor: analyticsTimeFilter === f.id ? '#8b0000' : 'transparent',
                    color: analyticsTimeFilter === f.id ? '#fff' : 'var(--color-text-primary)',
                    fontWeight: analyticsTimeFilter === f.id ? '600' : '500',
                    fontSize: '13px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                    boxShadow: analyticsTimeFilter === f.id ? '0 2px 8px rgba(139,0,0,0.25)' : 'none'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Summary KPI Cards Grid (4 Cards) */}
            <div className="insights-summary-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
              <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
                <span className="stat-label">Total Revenue</span>
                <h2 className="stat-value" style={{ color: '#047857' }}>₹{filteredTotalRevenue.toLocaleString('en-IN')}</h2>
                <span className="stat-subtext">Net earnings ({analyticsTimeFilter})</span>
              </div>
              <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                <span className="stat-label">Total Orders Sold</span>
                <h2 className="stat-value" style={{ color: '#1d4ed8' }}>{filteredTotalOrders}</h2>
                <span className="stat-subtext">{customFitPct}% bespoke custom stitched</span>
              </div>
              <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                <span className="stat-label">Pending Payments</span>
                <h2 className="stat-value" style={{ color: '#b45309' }}>₹{pendingPaymentRev.toLocaleString('en-IN')}</h2>
                <span className="stat-subtext">{pendingPaymentCount} orders pending payment</span>
              </div>
              <div className="stat-card" style={{ borderLeft: '4px solid #8b0000' }}>
                <span className="stat-label">Average Order Value</span>
                <h2 className="stat-value" style={{ color: '#8b0000' }}>₹{filteredAvgOrderVal.toLocaleString('en-IN')}</h2>
                <span className="stat-subtext">Revenue per order</span>
              </div>
            </div>

            {/* Visual Analytics Grid: Donut Chart + Sizing Demands */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '28px' }}>
              {/* Card 1: Dynamic Donut Chart for Fulfillment & Payments */}
              <div className="admin-form-box" style={{ padding: '24px' }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: 'var(--color-text-primary)' }}>
                  🍩 Order Status & Payment Breakdown
                </h4>
                <p style={{ margin: '0 0 20px 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  Interactive pie chart distribution across payment and shipping stages.
                </p>

                <DonutChart 
                  data={donutChartData} 
                  centerTitle={`${filteredTotalOrders}`} 
                  centerSub="Total Orders" 
                />
              </div>

              {/* Card 2: Sizing Demand Distribution Bar Chart */}
              <div className="admin-form-box" style={{ padding: '24px' }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: 'var(--color-text-primary)' }}>
                  📏 Standard vs. Bespoke Sizing Demands
                </h4>
                <p style={{ margin: '0 0 20px 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  Frequency distribution of patron measurements and fitting selections.
                </p>

                <HorizontalBarList items={sizingBarItems} />
              </div>
            </div>

            {/* Card 3: Best Seller Garments Performance */}
            <div className="admin-form-box" style={{ padding: '24px' }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: 'var(--color-text-primary)' }}>
                🏆 Top Performing Outfits ({analyticsTimeFilter})
              </h4>
              <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                Highest revenue-generating garments sold during the selected timeframe.
              </p>

              {sortedBestSellers.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table className="insights-table" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Outfit Title</th>
                        <th>Units Sold</th>
                        <th>Gross Revenue (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedBestSellers.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {item.image && (
                              <img src={item.image} alt={item.title} style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} />
                            )}
                            <strong>{item.title}</strong>
                          </td>
                          <td><strong>{item.qty} pcs</strong></td>
                          <td style={{ color: '#047857', fontWeight: '600' }}>₹{item.revenue.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textAlign: 'center', padding: '20px 0' }}>
                  No outfit sales recorded for this timeframe.
                </p>
              )}
            </div>
          </div>
        );
      })()}

      {/* Tab 6: Testimonials Configurator */}
      {activeTab === 'testimonials' && (
        <div className="admin-content-section animate-fadeIn">
          <div className="admin-section-header">
            <h3>Configure Customer Testimonials</h3>
            <p>Manage customer reviews, photos, star ratings, and brand labels shown on the homepage.</p>
          </div>

          <div className="admin-split-layout">
            <div className="admin-form-box">
              <h4>Publish New Review</h4>
              {tSuccessMsg && <p className="success-banner">{tSuccessMsg}</p>}
              
              <form onSubmit={handleTestimonialSubmit}>
                <div className="form-group">
                  <label>Customer Name *</label>
                  <input 
                    type="text" 
                    value={tName} 
                    onChange={(e) => setTName(e.target.value)} 
                    placeholder="e.g. Gayathri Arvind" 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Review Comment *</label>
                  <textarea 
                    value={tQuote} 
                    onChange={(e) => setTQuote(e.target.value)} 
                    placeholder="e.g. I have many kurtas from you. Every piece is awesome..." 
                    rows={3}
                    required 
                  />
                </div>

                <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Star Rating</label>
                    <select value={tRating} onChange={(e) => setTRating(parseInt(e.target.value))}>
                      <option value={5}>5 Stars</option>
                      <option value={4}>4 Stars</option>
                      <option value={3}>3 Stars</option>
                      <option value={2}>2 Stars</option>
                      <option value={1}>1 Star</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Brand Tag Code</label>
                    <input 
                      type="text" 
                      value={tTag} 
                      onChange={(e) => setTTag(e.target.value)} 
                      placeholder="e.g. HAY!" 
                    />
                  </div>
                </div>

                {/* Customer Photo Upload */}
                <div className="form-group">
                  <label>Upload Customer Photo</label>
                  <div className="file-upload-wrapper">
                    <label className="custom-file-upload">
                      <Upload size={14} />
                      <span>Select Photo File</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleTestimonialImageUpload} 
                      />
                    </label>
                  </div>
                </div>

                <div className="form-group-divider"><span>OR</span></div>

                <div className="form-group">
                  <label>Customer Photo Image URL</label>
                  <input 
                    type="url" 
                    value={tImageUrl && !tImageUrl.startsWith('data:image') ? tImageUrl : ''} 
                    onChange={(e) => setTImageUrl(e.target.value)} 
                    placeholder="https://images.unsplash.com/..." 
                  />
                </div>

                {tImageUrl && (
                  <div className="admin-image-preview" style={{ marginTop: '10px' }}>
                    <span className="file-loaded-status">Photo Loaded ✓</span>
                    <img src={tImageUrl} alt="Reviewer preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '50%', display: 'block', margin: '10px 0', border: '2px solid var(--color-border)' }} />
                  </div>
                )}

                <button type="submit" className="add-btn-submit">
                  <PlusCircle size={14} />
                  <span>Publish Testimonial</span>
                </button>
              </form>
            </div>

            <div className="admin-catalog-listing">
              <h4>Live Patron Reviews ({testimonialsList.length})</h4>
              <div className="admin-inventory-list">
                {testimonialsList.map((t) => (
                  <div key={t.id} className="inventory-card testimonial-admin-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', border: '1px solid var(--color-border)', borderRadius: '8px', marginBottom: '12px' }}>
                    {t.imageUrl && (
                      <img src={t.imageUrl} alt={t.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '50%' }} />
                    )}
                    <div className="inventory-details text-left" style={{ flexGrow: 1 }}>
                      <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{t.name} <span className="review-tag-badge" style={{ fontSize: '10px', background: 'var(--color-bg-secondary)', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', color: 'var(--color-text-secondary)' }}>{t.tag || 'HAY!'}</span></h5>
                      <p style={{ margin: '4px 0', fontSize: '12.5px', color: 'var(--color-text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>"{t.quote}"</p>
                      <div className="stars-row" style={{ color: '#03a685', fontSize: '11px', display: 'flex', gap: '2px' }}>
                        {Array.from({ length: t.rating || 5 }).map((_, i) => '★')}
                      </div>
                    </div>
                    <button 
                      className="delete-item-btn" 
                      onClick={() => {
                        if (confirm(`Remove review from ${t.name}?`)) {
                          onDeleteTestimonial(t.id);
                        }
                      }}
                      title="Remove Testimonial"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Boutique Settings Configurator */}
      {activeTab === 'settings' && (
        <div className="admin-content-section animate-fadeIn">
          <div className="admin-section-header" style={{ marginBottom: '20px' }}>
            <h3>Configure Boutique Settings</h3>
            <p>Update your e-commerce store brand description, support emails, contact hotline, atelier showroom address, and operating hours shown in the footer and help pages.</p>
          </div>

          <div className="admin-form-box" style={{ maxWidth: '680px', margin: '0 auto' }}>
            {settingsSuccessMsg && <p className="success-banner">{settingsSuccessMsg}</p>}
            
            <form onSubmit={handleSettingsSubmit}>
              {/* Shipping & Delivery Charges Configurator (FEATURED AT TOP) */}
              <div style={{ 
                marginBottom: '26px', 
                padding: '18px 20px', 
                backgroundColor: '#fffaf8', 
                border: '1.5px solid #8b0000', 
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(139, 0, 0, 0.06)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#8b0000', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Truck size={18} />
                    <span>🚚 Standard Shipping & Delivery Fee</span>
                  </h4>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: 700, 
                    padding: '3px 8px', 
                    borderRadius: '12px', 
                    backgroundColor: '#dcfce7', 
                    color: '#15803d',
                    border: '1px solid #86efac'
                  }}>
                    LIVE ON STOREFRONT
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '14px', lineHeight: '1.5' }}>
                  Configure the standard shipping fee charged at cart checkout and the qualifying subtotal threshold for complimentary free delivery.
                </p>

                <div className="form-row-double">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontWeight: '600' }}>Standard Shipping Charge (₹) *</label>
                    <input 
                      type="number" 
                      min="0"
                      step="1"
                      value={settingsShippingPrice} 
                      onChange={(e) => setSettingsShippingPrice(e.target.value)} 
                      placeholder="99" 
                      required 
                      style={{ fontSize: '15px', fontWeight: '600' }}
                    />
                    <small style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px', display: 'block' }}>
                      Flat rate applied at checkout when cart subtotal is below the free shipping threshold. (Set to 0 for free delivery on all orders)
                    </small>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontWeight: '600' }}>Free Shipping Minimum Order (₹) *</label>
                    <input 
                      type="number" 
                      min="0"
                      step="1"
                      value={settingsFreeShippingThreshold} 
                      onChange={(e) => setSettingsFreeShippingThreshold(e.target.value)} 
                      placeholder="1500" 
                      required 
                      style={{ fontSize: '15px', fontWeight: '600' }}
                    />
                    <small style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px', display: 'block' }}>
                      Orders at or above this amount automatically receive FREE delivery. (Set to 0 to disable free shipping)
                    </small>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Boutique Description *</label>
                <textarea 
                  value={settingsDesc} 
                  onChange={(e) => setSettingsDesc(e.target.value)} 
                  placeholder="High-end Indian traditional wear..." 
                  rows={3}
                  required 
                />
              </div>

              <div className="form-row-double">
                <div className="form-group">
                  <label>Support Email Address *</label>
                  <input 
                    type="email" 
                    value={settingsEmail} 
                    onChange={(e) => setSettingsEmail(e.target.value)} 
                    placeholder="care@inibymaya.com" 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Hotline Phone Number *</label>
                  <input 
                    type="text" 
                    value={settingsPhone} 
                    onChange={(e) => setSettingsPhone(e.target.value)} 
                    placeholder="+91 98765 43210" 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Boutique Atelier Address *</label>
                <textarea 
                  value={settingsAddress} 
                  onChange={(e) => setSettingsAddress(e.target.value)} 
                  placeholder="Showroom address..." 
                  rows={2}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Operating Hours *</label>
                <input 
                  type="text" 
                  value={settingsHours} 
                  onChange={(e) => setSettingsHours(e.target.value)} 
                  placeholder="Mon - Sat: 10:00 AM - 07:00 PM IST" 
                  required 
                />
              </div>

              {/* Garment Sizing & Kids Age Groups Configuration */}
              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '600', margin: 0, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Ruler size={18} style={{ color: '#8b0000' }} />
                    <span>Garment Sizing & Kids Age Groups Configuration</span>
                  </h4>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: 700, 
                    padding: '3px 8px', 
                    borderRadius: '12px', 
                    backgroundColor: '#fef3c7', 
                    color: '#92400e',
                    border: '1px solid #fde68a'
                  }}>
                    CATALOG DEFAULT PRESETS
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '14px', lineHeight: '1.5' }}>
                  Configure the global sizing presets available when adding garments. Enter sizes separated by commas.
                </p>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label>Standard Adult Garment Sizes (comma-separated) *</label>
                  <input 
                    type="text" 
                    value={settingsAdultSizes} 
                    onChange={(e) => setSettingsAdultSizes(e.target.value)} 
                    placeholder="XS, S, M, L, XL, XXL, 3XL, Free Size" 
                    required 
                  />
                  <small style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px', display: 'block' }}>
                    Default sizes available for Women's & Adult couture collections.
                  </small>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Kids Garment Sizes by Age Group (comma-separated) *</label>
                  <input 
                    type="text" 
                    value={settingsKidsSizes} 
                    onChange={(e) => setSettingsKidsSizes(e.target.value)} 
                    placeholder="0-6M, 6-12M, 1-2Y, 2-3Y, 3-4Y, 4-5Y, 5-6Y, 6-7Y, 7-8Y, 8-9Y, 9-10Y, 10-12Y, 12-14Y" 
                    required 
                  />
                  <small style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px', display: 'block' }}>
                    Default age-based sizes available for Children & Kids Wear collections (e.g. 0-6M, 1-2Y, 3-4Y).
                  </small>
                </div>
              </div>

              {/* Newsletter Offer Configurator */}
              <div className="newsletter-config-section" style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px', color: 'var(--color-text-primary)' }}>Newsletter Subscription Popup Configuration</h4>
                
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <input 
                    type="checkbox" 
                    id="newsletterEnabled"
                    checked={newsletterEnabled} 
                    onChange={(e) => setNewsletterEnabled(e.target.checked)} 
                    style={{ width: 'auto', cursor: 'pointer' }}
                  />
                  <label htmlFor="newsletterEnabled" style={{ cursor: 'pointer', userSelect: 'none', marginBottom: 0 }}>Enable Newsletter Popup for Guests</label>
                </div>

                {newsletterEnabled && (
                  <>
                    <div className="form-group">
                  <label>Newsletter Title *</label>
                      <input 
                        type="text" 
                        value={newsletterTitle} 
                        onChange={(e) => setNewsletterTitle(e.target.value)} 
                        placeholder="Subscribe and Get 10% OFF" 
                        required 
                      />
                    </div>

                    <div className="form-group">
                      <label>Newsletter Subtitle *</label>
                      <input 
                        type="text" 
                        value={newsletterSubtitle} 
                        onChange={(e) => setNewsletterSubtitle(e.target.value)} 
                        placeholder="No Spam, No Drama – Just Good Clothes" 
                        required 
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Header Top Announcement Offer Banner Settings */}
              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px', color: '#8b0000' }}>
                  ✨ Header Top Announcement Banner (Offer Bar)
                </h4>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <input
                    type="checkbox"
                    id="headerBannerEnabled"
                    checked={headerBannerEnabled}
                    onChange={(e) => setHeaderBannerEnabled(e.target.checked)}
                    style={{ width: 'auto', cursor: 'pointer' }}
                  />
                  <label htmlFor="headerBannerEnabled" style={{ cursor: 'pointer', marginBottom: 0, fontWeight: '600' }}>
                    Enable Top Announcement Offer Banner
                  </label>
                </div>

                {headerBannerEnabled && (
                  <>
                    <div className="form-group" style={{ marginBottom: '14px' }}>
                      <label>Banner Text Content *</label>
                      <input
                        type="text"
                        value={headerBannerText}
                        onChange={(e) => setHeaderBannerText(e.target.value)}
                        placeholder="e.g. FREE SHIPPING PAN INDIA | COD AVAILABLE"
                        required
                      />
                    </div>

                    <div className="form-row-double" style={{ gap: '14px' }}>
                      <div className="form-group">
                        <label>Banner Background Color</label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input
                            type="color"
                            value={headerBannerBg}
                            onChange={(e) => setHeaderBannerBg(e.target.value)}
                            style={{ width: '40px', height: '36px', padding: 0, border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                          />
                          <input
                            type="text"
                            value={headerBannerBg}
                            onChange={(e) => setHeaderBannerBg(e.target.value)}
                            style={{ flex: 1 }}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Banner Text Color</label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input
                            type="color"
                            value={headerBannerColor}
                            onChange={(e) => setHeaderBannerColor(e.target.value)}
                            style={{ width: '40px', height: '36px', padding: 0, border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                          />
                          <input
                            type="text"
                            value={headerBannerColor}
                            onChange={(e) => setHeaderBannerColor(e.target.value)}
                            style={{ flex: 1 }}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Razorpay Online Payment Gateway Integration Card */}
              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '600', margin: 0, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>💳 Razorpay Payment Gateway Integration</span>
                  </h4>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: 700, 
                    padding: '3px 8px', 
                    borderRadius: '12px', 
                    backgroundColor: import.meta.env.VITE_RAZORPAY_KEY_ID ? '#dcfce7' : '#fef9c3', 
                    color: import.meta.env.VITE_RAZORPAY_KEY_ID ? '#15803d' : '#854d0e',
                    border: import.meta.env.VITE_RAZORPAY_KEY_ID ? '1px solid #86efac' : '1px solid #fde047'
                  }}>
                    {import.meta.env.VITE_RAZORPAY_KEY_ID ? 'CONNECTED (LIVE / TEST)' : 'PREVIEW MODE'}
                  </span>
                </div>
                
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '12px', lineHeight: '1.5' }}>
                  Allows customers to pay via UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards, NetBanking, and Wallets with 100% bank-grade encryption.
                </p>

                <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '12px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '4px' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Razorpay Key ID:</span>
                    <code style={{ background: 'var(--color-bg-primary)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}>
                      {import.meta.env.VITE_RAZORPAY_KEY_ID || 'Not set (Configured in .env as VITE_RAZORPAY_KEY_ID)'}
                    </code>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Supported Payment Modes:</span>
                    <span style={{ fontWeight: 600, color: '#15803d' }}>UPI, Cards, NetBanking, Wallets, PayLater</span>
                  </div>
                </div>
              </div>

              <button type="submit" className="add-btn-submit" style={{ marginTop: '20px' }}>
                <CheckCircle2 size={14} />
                <span>Save Boutique Settings</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab: Storefront Categories & Occasions Configurator */}
      {activeTab === 'storefront' && (
        <div className="admin-content-section animate-fadeIn">
          <div className="admin-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div>
              <h3>Configure Storefront Sections</h3>
              <p>Manage the "Shop by Category" icon strip and "Shop by Occasion" grid shown on the homepage.</p>
            </div>
            <button
              type="button"
              className="add-btn-submit"
              style={{ width: 'auto', margin: 0, padding: '10px 24px', whiteSpace: 'nowrap' }}
              onClick={handleSaveStorefront}
            >
              <CheckCircle2 size={15} />
              <span>Save Storefront Configuration</span>
            </button>
          </div>

          {storefrontSuccessMsg && <p className="success-banner" style={{ maxWidth: '750px', margin: '0 auto 16px auto' }}>{storefrontSuccessMsg}</p>}

          <div className="admin-form-box" style={{ maxWidth: '750px', margin: '0 auto' }}>

            {/* ── HOMEPAGE HERO BANNER CAROUSEL SECTION ── */}
            <div style={{ marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--color-text-primary)', margin: 0 }}>
                  Homepage Hero Banner Carousel ({storefrontHeroBanners.length} Slides)
                </h4>
                <button
                  type="button"
                  onClick={handleAddBannerSlide}
                  className="add-btn-submit"
                  style={{ width: 'auto', margin: 0, padding: '6px 14px', fontSize: '12px' }}
                >
                  <Plus size={13} />
                  <span>Add Banner Slide</span>
                </button>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
                Upload multiple bright portrait banner images and customize their titles, taglines, and buttons for the homepage carousel.
              </p>

              {/* Banner Slide Select Tabs / List */}
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '20px' }}>
                {storefrontHeroBanners.map((banner, index) => {
                  const isActive = banner.id === activeBannerTabId;
                  return (
                    <div
                      key={banner.id || index}
                      onClick={() => setActiveBannerTabId(banner.id)}
                      style={{
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 14px',
                        borderRadius: '24px',
                        border: isActive ? '2px solid #111111' : '1.5px solid var(--color-border)',
                        backgroundColor: isActive ? '#111111' : 'var(--color-bg-secondary)',
                        color: isActive ? '#ffffff' : 'var(--color-text-primary)',
                        cursor: 'pointer',
                        boxShadow: isActive ? '0 4px 12px rgba(0, 0, 0, 0.18)' : 'none',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {banner.image && (
                        <img 
                          src={banner.image} 
                          alt="" 
                          style={{ width: '32px', height: '22px', objectFit: 'cover', borderRadius: '4px', border: isActive ? '1px solid rgba(255,255,255,0.4)' : '1px solid var(--color-border)' }} 
                        />
                      )}
                      <span style={{ fontSize: '12px', fontWeight: isActive ? '700' : '500', color: isActive ? '#ffffff' : 'var(--color-text-primary)' }}>
                        Slide #{index + 1}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: '4px' }}>
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={(e) => { e.stopPropagation(); handleMoveBannerSlide(index, 'up'); }}
                          style={{ border: 'none', background: 'none', padding: '2px', cursor: index === 0 ? 'default' : 'pointer', color: isActive ? '#ffffff' : 'var(--color-text-primary)', opacity: index === 0 ? 0.3 : 0.9 }}
                          title="Move Slide Up"
                        >
                          <ChevronUp size={13} />
                        </button>
                        <button
                          type="button"
                          disabled={index === storefrontHeroBanners.length - 1}
                          onClick={(e) => { e.stopPropagation(); handleMoveBannerSlide(index, 'down'); }}
                          style={{ border: 'none', background: 'none', padding: '2px', cursor: index === storefrontHeroBanners.length - 1 ? 'default' : 'pointer', color: isActive ? '#ffffff' : 'var(--color-text-primary)', opacity: index === storefrontHeroBanners.length - 1 ? 0.3 : 0.9 }}
                          title="Move Slide Down"
                        >
                          <ChevronDown size={13} />
                        </button>
                        {storefrontHeroBanners.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleDeleteBannerSlide(banner.id); }}
                            style={{ border: 'none', background: 'none', padding: '2px', cursor: 'pointer', color: isActive ? '#ff6b6b' : '#e53e3e', opacity: 0.9, marginLeft: '2px' }}
                            title="Delete Slide"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active Banner Slide Form Editor */}
              {(() => {
                const activeBanner = storefrontHeroBanners.find(b => b.id === activeBannerTabId) || storefrontHeroBanners[0];
                if (!activeBanner) return null;

                return (
                  <div style={{ background: 'var(--color-bg-secondary)', padding: '16px', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                    {/* Desktop & Mobile Banner Images */}
                    <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                          Desktop Banner Image (Landscape)
                        </label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input
                            type="text"
                            className="admin-input"
                            style={{ flex: '1' }}
                            placeholder="Desktop Image URL"
                            value={activeBanner.image || ''}
                            onChange={(e) => handleUpdateBannerSlide(activeBanner.id, 'image', e.target.value)}
                          />
                          <label className="upload-btn-secondary" style={{ cursor: 'pointer', margin: 0, padding: '8px 12px', fontSize: '12px', border: '1px solid var(--color-border)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#fff', whiteSpace: 'nowrap' }}>
                            <Upload size={14} />
                            <span>Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) handleUploadBannerFile(file, activeBanner.id, 'image', 'media/hero', false);
                              }}
                            />
                          </label>
                        </div>
                        {activeBanner.image && (
                          <div style={{ marginTop: '8px', height: '100px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--color-border)', position: 'relative' }}>
                            <img src={activeBanner.image} alt="Desktop Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', bottom: '4px', left: '6px', background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '1px 6px', borderRadius: '3px', fontSize: '10px' }}>Desktop Preview</div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                          Mobile Banner Image (Optional Portrait)
                        </label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input
                            type="text"
                            className="admin-input"
                            style={{ flex: '1' }}
                            placeholder="Mobile Image URL (Optional)"
                            value={activeBanner.mobileImage || ''}
                            onChange={(e) => handleUpdateBannerSlide(activeBanner.id, 'mobileImage', e.target.value)}
                          />
                          <label className="upload-btn-secondary" style={{ cursor: 'pointer', margin: 0, padding: '8px 12px', fontSize: '12px', border: '1px solid var(--color-border)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#fff', whiteSpace: 'nowrap' }}>
                            <Upload size={14} />
                            <span>Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) handleUploadBannerFile(file, activeBanner.id, 'mobileImage', 'media/hero', false);
                              }}
                            />
                          </label>
                        </div>
                        {activeBanner.mobileImage && (
                          <div style={{ marginTop: '8px', height: '100px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--color-border)', position: 'relative' }}>
                            <img src={activeBanner.mobileImage} alt="Mobile Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', bottom: '4px', left: '6px', background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '1px 6px', borderRadius: '3px', fontSize: '10px' }}>Mobile Preview</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* ── OFFERS BANNER CAROUSEL SECTION ── */}
            <div style={{ marginBottom: '32px', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '600', margin: 0, color: 'var(--color-text-primary)' }}>Offers Banner Section (Appears after Shop by Category)</h4>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>Upload offer graphics/banners. Clicking an offer banner opens the All Products page.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddOfferBannerSlide}
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={14} />
                  <span>Add Offer Slide</span>
                </button>
              </div>

              {/* Offer Banner Tab Pills */}
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px' }}>
                {storefrontOfferBanners.map((slide, index) => {
                  const isActive = slide.id === activeOfferBannerTabId;
                  return (
                    <div
                      key={slide.id}
                      onClick={() => setActiveOfferBannerTabId(slide.id)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '24px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: isActive ? '700' : '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: isActive ? '#111111' : 'var(--color-bg-secondary)',
                        color: isActive ? '#ffffff' : 'var(--color-text-primary)',
                        border: isActive ? '2px solid #111111' : '1.5px solid var(--color-border)',
                        boxShadow: isActive ? '0 4px 12px rgba(0, 0, 0, 0.18)' : 'none',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <span style={{ color: isActive ? '#ffffff' : 'var(--color-text-primary)' }}>Offer #{index + 1}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }} onClick={(e) => e.stopPropagation()}>
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => handleMoveOfferBannerSlide(index, 'up')}
                            style={{ border: 'none', background: 'none', padding: '2px', cursor: 'pointer', color: isActive ? '#ffffff' : 'var(--color-text-primary)', opacity: 0.9 }}
                            title="Move Up"
                          >
                            <ChevronUp size={13} />
                          </button>
                        )}
                        {index < storefrontOfferBanners.length - 1 && (
                          <button
                            type="button"
                            onClick={() => handleMoveOfferBannerSlide(index, 'down')}
                            style={{ border: 'none', background: 'none', padding: '2px', cursor: 'pointer', color: isActive ? '#ffffff' : 'var(--color-text-primary)', opacity: 0.9 }}
                            title="Move Down"
                          >
                            <ChevronDown size={13} />
                          </button>
                        )}
                        {storefrontOfferBanners.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteOfferBannerSlide(slide.id)}
                            style={{ border: 'none', background: 'none', padding: '2px', cursor: 'pointer', color: isActive ? '#ff6b6b' : '#e53e3e', opacity: 0.9, marginLeft: '2px' }}
                            title="Delete Slide"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active Offer Banner Slide Form Editor */}
              {(() => {
                const activeOffer = storefrontOfferBanners.find(b => b.id === activeOfferBannerTabId) || storefrontOfferBanners[0];
                if (!activeOffer) return null;

                return (
                  <div style={{ background: 'var(--color-bg-secondary)', padding: '16px', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                          Desktop Offer Image (Landscape)
                        </label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input
                            type="text"
                            className="admin-input"
                            style={{ flex: '1' }}
                            placeholder="Desktop Offer Image URL"
                            value={activeOffer.image || ''}
                            onChange={(e) => handleUpdateOfferBannerSlide(activeOffer.id, 'image', e.target.value)}
                          />
                          <label className="upload-btn-secondary" style={{ cursor: 'pointer', margin: 0, padding: '8px 12px', fontSize: '12px', border: '1px solid var(--color-border)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#fff', whiteSpace: 'nowrap' }}>
                            <Upload size={14} />
                            <span>Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) handleUploadBannerFile(file, activeOffer.id, 'image', 'media/offers', true);
                              }}
                            />
                          </label>
                        </div>
                        {activeOffer.image && (
                          <div style={{ marginTop: '8px', height: '100px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--color-border)', position: 'relative' }}>
                            <img src={activeOffer.image} alt="Offer Desktop Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                          Mobile Offer Image (Optional Portrait)
                        </label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input
                            type="text"
                            className="admin-input"
                            style={{ flex: '1' }}
                            placeholder="Mobile Offer Image URL (Optional)"
                            value={activeOffer.mobileImage || ''}
                            onChange={(e) => handleUpdateOfferBannerSlide(activeOffer.id, 'mobileImage', e.target.value)}
                          />
                          <label className="upload-btn-secondary" style={{ cursor: 'pointer', margin: 0, padding: '8px 12px', fontSize: '12px', border: '1px solid var(--color-border)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#fff', whiteSpace: 'nowrap' }}>
                            <Upload size={14} />
                            <span>Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) handleUploadBannerFile(file, activeOffer.id, 'mobileImage', 'media/offers', true);
                              }}
                            />
                          </label>
                        </div>
                        {activeOffer.mobileImage && (
                          <div style={{ marginTop: '8px', height: '100px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--color-border)', position: 'relative' }}>
                            <img src={activeOffer.mobileImage} alt="Offer Mobile Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* ── CATEGORIES SECTION ── */}
            <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px', color: 'var(--color-text-primary)' }}>Shop by Category Icons</h4>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>These appear as circular icons below the hero banner. Each links to a shop filter.</p>

            {storefrontCategories.map((cat, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-bg-secondary)' }}>
                {cat.image && <img src={cat.image} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <input
                    type="text"
                    value={cat.name}
                    onChange={(e) => {
                      const updated = [...storefrontCategories];
                      updated[idx] = { ...updated[idx], name: e.target.value };
                      setStorefrontCategories(updated);
                    }}
                    placeholder="Category Name"
                    style={{ fontSize: '13px', padding: '4px 8px' }}
                  />
                  <input
                    type="text"
                    value={cat.image || ''}
                    onChange={(e) => {
                      const updated = [...storefrontCategories];
                      updated[idx] = { ...updated[idx], image: e.target.value };
                      setStorefrontCategories(updated);
                    }}
                    placeholder="Image URL (paste or upload)"
                    style={{ fontSize: '12px', padding: '4px 8px', color: 'var(--color-text-secondary)' }}
                  />
                  <input
                    type="text"
                    value={cat.filter || ''}
                    onChange={(e) => {
                      const updated = [...storefrontCategories];
                      updated[idx] = { ...updated[idx], filter: e.target.value };
                      setStorefrontCategories(updated);
                    }}
                    placeholder="Filter keyword (e.g. Long Kurtas)"
                    style={{ fontSize: '12px', padding: '4px 8px', color: 'var(--color-text-secondary)' }}
                  />
                </div>
                <label style={{ cursor: 'pointer', flexShrink: 0, fontSize: '11px', color: 'var(--color-accent)', textDecoration: 'underline' }}>
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) handleUploadCategoryFile(file, idx);
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setStorefrontCategories(prev => prev.filter((_, i) => i !== idx))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', flexShrink: 0 }}
                  title="Remove Category"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setStorefrontCategories(prev => [...prev, { name: '', image: '', filter: '' }])}
              className="add-btn-submit"
              style={{ marginBottom: '28px', fontSize: '12px', padding: '8px 16px' }}
            >
              <PlusCircle size={14} />
              <span>Add Category</span>
            </button>

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '0 0 20px' }} />

            {/* ── OCCASIONS SECTION ── */}
            <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px', color: 'var(--color-text-primary)' }}>Shop by Occasion Cards</h4>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>These appear as large image cards on the homepage. Each links to a filtered product search.</p>

            {storefrontOccasions.map((occ, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-bg-secondary)' }}>
                {occ.image && <img src={occ.image} alt="" style={{ width: '60px', height: '40px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <input
                    type="text"
                    value={occ.name}
                    onChange={(e) => {
                      const updated = [...storefrontOccasions];
                      updated[idx] = { ...updated[idx], name: e.target.value };
                      setStorefrontOccasions(updated);
                    }}
                    placeholder="Occasion Name (e.g. Festive Couture)"
                    style={{ fontSize: '13px', padding: '4px 8px' }}
                  />
                  <input
                    type="text"
                    value={occ.image || ''}
                    onChange={(e) => {
                      const updated = [...storefrontOccasions];
                      updated[idx] = { ...updated[idx], image: e.target.value };
                      setStorefrontOccasions(updated);
                    }}
                    placeholder="Image URL"
                    style={{ fontSize: '12px', padding: '4px 8px', color: 'var(--color-text-secondary)' }}
                  />
                  <input
                    type="text"
                    value={occ.filter || ''}
                    onChange={(e) => {
                      const updated = [...storefrontOccasions];
                      updated[idx] = { ...updated[idx], filter: e.target.value };
                      setStorefrontOccasions(updated);
                    }}
                    placeholder="Search filter keyword (e.g. anarkali)"
                    style={{ fontSize: '12px', padding: '4px 8px', color: 'var(--color-text-secondary)' }}
                  />
                </div>
                <label style={{ cursor: 'pointer', flexShrink: 0, fontSize: '11px', color: 'var(--color-accent)', textDecoration: 'underline' }}>
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) handleUploadOccasionFile(file, idx);
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setStorefrontOccasions(prev => prev.filter((_, i) => i !== idx))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', flexShrink: 0 }}
                  title="Remove Occasion"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setStorefrontOccasions(prev => [...prev, { name: '', image: '', filter: '' }])}
              className="add-btn-submit"
              style={{ marginBottom: '12px', fontSize: '12px', padding: '8px 16px' }}
            >
              <PlusCircle size={14} />
              <span>Add Occasion</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab: Footer & Policies Context Content Configurator */}
      {activeTab === 'footer' && (
        <div className="admin-content-section animate-fadeIn">
          <div className="admin-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div>
              <h3>Footer Pages & Policy Content Management</h3>
              <p>Context-edit and customize all Customer Support and Store Policy pages rendered across your boutique's footer.</p>
            </div>
            <button
              type="button"
              className="add-btn-submit"
              style={{ width: 'auto', margin: 0, padding: '10px 24px', whiteSpace: 'nowrap' }}
              onClick={handleSaveFooterPages}
            >
              <CheckCircle2 size={15} />
              <span>Save & Publish All Footer Pages</span>
            </button>
          </div>

          {footerSaveSuccessMsg && (
            <p className="success-banner" style={{ maxWidth: '850px', margin: '0 auto 16px auto' }}>
              {footerSaveSuccessMsg}
            </p>
          )}

          {/* Sub-Tab Selector for the 8 Footer Pages */}
          <div style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '10px',
            marginBottom: '24px',
            maxWidth: '850px',
            margin: '0 auto 24px auto'
          }}>
            {Object.keys(DEFAULT_FOOTER_PAGES).map(pageKey => {
              const pageObj = footerPagesConfig[pageKey] || DEFAULT_FOOTER_PAGES[pageKey];
              const isSelected = selectedFooterPageId === pageKey;
              return (
                <button
                  key={pageKey}
                  type="button"
                  onClick={() => setSelectedFooterPageId(pageKey)}
                  style={{
                    flexShrink: 0,
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: isSelected ? '2px solid #8b0000' : '1px solid var(--color-border)',
                    backgroundColor: isSelected ? '#8b0000' : 'var(--color-bg-secondary)',
                    color: isSelected ? '#ffffff' : 'var(--color-text-primary)',
                    fontWeight: isSelected ? '600' : 'normal',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 4px 10px rgba(139, 0, 0, 0.2)' : 'none'
                  }}
                >
                  {pageObj.navLabel || pageKey}
                </button>
              );
            })}
          </div>

          {/* Active Footer Page Editor Form */}
          {(() => {
            const currentPage = footerPagesConfig[selectedFooterPageId] || DEFAULT_FOOTER_PAGES[selectedFooterPageId] || {};
            return (
              <div className="admin-form-box" style={{ maxWidth: '850px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', color: '#8b0000', fontFamily: 'var(--font-display)' }}>
                    Editing: {currentPage.navLabel || selectedFooterPageId} Page
                  </h4>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    Target Page Tab: <code>{selectedFooterPageId}</code>
                  </span>
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Page Title *</label>
                  <input
                    type="text"
                    value={currentPage.title || ''}
                    onChange={(e) => handleUpdateCurrentFooterPage('title', e.target.value)}
                    placeholder="e.g. Shipping & Delivery Policy"
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label>Hero Subtitle / Tagline *</label>
                  <input
                    type="text"
                    value={currentPage.subtitle || ''}
                    onChange={(e) => handleUpdateCurrentFooterPage('subtitle', e.target.value)}
                    placeholder="e.g. Express Courier Shipping & Secure Transit Worldwide"
                  />
                </div>

                {selectedFooterPageId === 'faq' ? (
                  <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.02)', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <h5 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#8b0000' }}>
                          ❓ FAQ Question & Answer Management
                        </h5>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
                          Add, edit, delete, and reorder questions displayed on your customer FAQ page.
                        </p>
                      </div>
                      <button
                        type="button"
                        className="add-btn-submit"
                        onClick={() => {
                          const currentFaqs = currentPage.faqs || DEFAULT_FOOTER_PAGES['faq'].faqs || [];
                          const newFaq = { question: 'New Question?', answer: 'Answer details go here...' };
                          handleUpdateCurrentFooterPage('faqs', [...currentFaqs, newFaq]);
                        }}
                        style={{ padding: '8px 14px', fontSize: '12px', width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Plus size={14} /> Add New FAQ
                      </button>
                    </div>

                    {((currentPage.faqs && currentPage.faqs.length > 0) ? currentPage.faqs : (DEFAULT_FOOTER_PAGES['faq'].faqs || [])).map((faqItem, idx) => (
                      <div key={idx} style={{ backgroundColor: '#ffffff', padding: '14px', borderRadius: '8px', border: '1px solid var(--color-border)', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <strong style={{ fontSize: '13px', color: '#8b0000' }}>FAQ #{idx + 1}</strong>
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const faqsList = [...(currentPage.faqs || DEFAULT_FOOTER_PAGES['faq'].faqs)];
                                  const temp = faqsList[idx];
                                  faqsList[idx] = faqsList[idx - 1];
                                  faqsList[idx - 1] = temp;
                                  handleUpdateCurrentFooterPage('faqs', faqsList);
                                }}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px 6px', color: 'var(--color-text-primary)' }}
                                title="Move Up"
                              >
                                <ChevronUp size={14} />
                              </button>
                            )}
                            {idx < (currentPage.faqs || DEFAULT_FOOTER_PAGES['faq'].faqs).length - 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const faqsList = [...(currentPage.faqs || DEFAULT_FOOTER_PAGES['faq'].faqs)];
                                  const temp = faqsList[idx];
                                  faqsList[idx] = faqsList[idx + 1];
                                  faqsList[idx + 1] = temp;
                                  handleUpdateCurrentFooterPage('faqs', faqsList);
                                }}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px 6px', color: 'var(--color-text-primary)' }}
                                title="Move Down"
                              >
                                <ChevronDown size={14} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const faqsList = (currentPage.faqs || DEFAULT_FOOTER_PAGES['faq'].faqs).filter((_, i) => i !== idx);
                                handleUpdateCurrentFooterPage('faqs', faqsList);
                              }}
                              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', padding: '2px 6px' }}
                              title="Delete FAQ"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <div style={{ marginBottom: '10px' }}>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: 'var(--color-text-primary)' }}>Question:</label>
                          <input
                            type="text"
                            value={faqItem.question || ''}
                            onChange={(e) => {
                              const faqsList = [...(currentPage.faqs || DEFAULT_FOOTER_PAGES['faq'].faqs)];
                              faqsList[idx] = { ...faqsList[idx], question: e.target.value };
                              handleUpdateCurrentFooterPage('faqs', faqsList);
                            }}
                            style={{ width: '100%', padding: '8px 10px', fontSize: '13px', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: 'var(--color-text-primary)' }}>Answer:</label>
                          <textarea
                            rows={3}
                            value={faqItem.answer || ''}
                            onChange={(e) => {
                              const faqsList = [...(currentPage.faqs || DEFAULT_FOOTER_PAGES['faq'].faqs)];
                              faqsList[idx] = { ...faqsList[idx], answer: e.target.value };
                              handleUpdateCurrentFooterPage('faqs', faqsList);
                            }}
                            style={{ width: '100%', padding: '8px 10px', fontSize: '13px', borderRadius: '4px', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Unified Interactive Rich Text Editor for All Policy Pages */}
                    <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.02)', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--color-border)' }}>
                      <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: '#8b0000' }}>
                        📖 {currentPage.navLabel || selectedFooterPageId} Interactive Rich Text Content
                      </h5>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                        Type, format, or paste your page passage below. Native <strong>Cmd + Z (Undo)</strong>, <strong>Cmd + Shift + Z (Redo)</strong>, bulk line lists, toggling bold/headings, and image pasting are fully supported.
                      </p>

                      <RichTextEditor
                        value={(() => {
                          if (currentPage.fullDescription !== undefined) return currentPage.fullDescription;
                          const parts = [];
                          if (currentPage.section1Heading) parts.push(`## ${currentPage.section1Heading}`);
                          if (currentPage.section1Content) parts.push(currentPage.section1Content);
                          if (currentPage.section2Heading) parts.push(`## ${currentPage.section2Heading}`);
                          if (currentPage.section2Content) parts.push(currentPage.section2Content);
                          return parts.join('\n\n');
                        })()}
                        onChange={(newHtml) => {
                          handleUpdateCurrentFooterPage('fullDescription', newHtml);
                          handleUpdateCurrentFooterPage('section1Content', newHtml);
                        }}
                        onUploadImage={handleUploadRichTextImage}
                        isUploading={isRichTextImageUploading}
                      />
                    </div>

                    {/* About Us Brand Photos Showcase Gallery Manager (Only for About Us) */}
                    {selectedFooterPageId === 'about-us' && (
                      <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #cbd5e1' }}>
                        <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                          🖼️ About Us Brand & Atelier Photos Showcase
                        </h5>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '14px' }}>
                          Upload or add photo URLs to display in the About Us gallery showcase on the storefront.
                        </p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                          {(currentPage.aboutImages || []).map((imgUrl, idx) => (
                            <div key={idx} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)', height: '110px', backgroundColor: '#fff' }}>
                              <img src={imgUrl} alt={`About Photo ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (currentPage.aboutImages || []).filter((_, i) => i !== idx);
                                  handleUpdateCurrentFooterPage('aboutImages', updated);
                                }}
                                style={{
                                  position: 'absolute',
                                  top: '6px',
                                  right: '6px',
                                  backgroundColor: 'rgba(239, 68, 68, 0.9)',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '22px',
                                  height: '22px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '11px',
                                  fontWeight: 'bold'
                                }}
                                title="Remove Photo"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>

                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <label className="custom-file-upload" style={{ cursor: 'pointer', margin: 0, padding: '10px 16px', fontSize: '13px', border: '1px solid var(--color-border)', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#8b0000', color: '#fff', fontWeight: '500' }}>
                            <Upload size={16} />
                            {isAboutImageUploading ? 'Uploading to GitHub...' : 'Choose File & Upload to GitHub'}
                            <input 
                              type="file" 
                              accept="image/*" 
                              disabled={isAboutImageUploading} 
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleUploadAboutUsImage(e.target.files[0]);
                                  e.target.value = '';
                                }
                              }} 
                              style={{ display: 'none' }} 
                            />
                          </label>

                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => {
                              const url = prompt('Enter direct image URL:');
                              if (url && url.trim()) {
                                const currentList = currentPage.aboutImages || [];
                                handleUpdateCurrentFooterPage('aboutImages', [...currentList, url.trim()]);
                              }
                            }}
                            style={{ padding: '9px 16px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          >
                            ➕ Add Photo URL
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Highlight Callout Box Notice (Hidden for About Us and FAQ pages) */}
                {selectedFooterPageId !== 'about-us' && selectedFooterPageId !== 'faq' && (
                  <div style={{ backgroundColor: '#fffdfa', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #d4af37' }}>
                    <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#8b0000' }}>✨ Highlighted Notice Box (Callout Box)</h5>
                    
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label>Callout Box Title</label>
                      <input
                        type="text"
                        value={currentPage.calloutTitle || ''}
                        onChange={(e) => handleUpdateCurrentFooterPage('calloutTitle', e.target.value)}
                        placeholder="e.g. Free Express Shipping Across India"
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Callout Box Message / Description</label>
                      <textarea
                        rows={3}
                        value={currentPage.calloutText || ''}
                        onChange={(e) => handleUpdateCurrentFooterPage('calloutText', e.target.value)}
                        placeholder="Callout highlight message shown at the bottom of the page..."
                        style={{ width: '100%', fontFamily: 'sans-serif', fontSize: '13px', lineHeight: '1.5', padding: '10px' }}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  className="add-btn-submit"
                  onClick={handleSaveFooterPages}
                  style={{ width: '100%', marginTop: '10px' }}
                >
                  <CheckCircle2 size={16} />
                  <span>Save "{currentPage.navLabel || selectedFooterPageId}" Content</span>
                </button>
              </div>
            );
          })()}
        </div>
      )}

      {/* Tab 8: 2D Customizer Configurator (Garment Parts, Styles & Tailoring Prices) */}
      {activeTab === 'customizer' && (
        <div className="admin-content-section animate-fadeIn">
          <div className="admin-section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', paddingBottom: '14px', borderBottom: '1px solid var(--color-border)' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '20px', color: '#8b0000', fontFamily: 'var(--font-display)' }}>✨ 2D Couture Studio Configurator</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                Configure dynamic garment parts (Necklines, Sleeves, Zip, Lining, etc.), set tailoring prices (₹), and manage 2D SVG/PNG overlays.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Type new Garment Part name (e.g. Back Cut, Pocket)..."
                value={newPartNameInput}
                onChange={(e) => setNewPartNameInput(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--color-border)', width: '280px' }}
              />
              <button
                type="button"
                className="add-btn-submit"
                onClick={() => {
                  if (newPartNameInput && newPartNameInput.trim()) {
                    const newPart = {
                      id: newPartNameInput.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                      name: newPartNameInput.trim(),
                      required: false,
                      styles: [
                        { id: 'standard', name: 'Standard Style', price: 0 }
                      ]
                    };
                    setCustomizerPartsConfig(prev => [...prev, newPart]);
                    setNewPartNameInput('');
                  } else {
                    alert('Please type a garment part name first.');
                  }
                }}
                style={{ width: 'auto', padding: '9px 16px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={16} /> Add Garment Part
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '900px', margin: '0 auto' }}>
            {customizerPartsConfig.map((part, pIdx) => (
              <div key={pIdx} className="admin-form-box" style={{ padding: '20px', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '16px', color: '#8b0000' }}>{part.name}</h4>
                    <span style={{ fontSize: '11px', backgroundColor: 'rgba(139, 0, 0, 0.08)', color: '#8b0000', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>
                      ID: {part.id}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {customizerPartsConfig.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete part "${part.name}" and all its styles?`)) {
                            setCustomizerPartsConfig(prev => prev.filter((_, i) => i !== pIdx));
                          }
                        }}
                        style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                        title="Delete Part"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Styles List Table */}
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  <table className="insights-table" style={{ width: '100%', minWidth: '560px' }}>
                    <thead>
                      <tr>
                        <th style={{ minWidth: '150px' }}>Style Name</th>
                        <th style={{ minWidth: '220px' }}>Style Preview Photo (Upload or Paste URL)</th>
                        <th style={{ minWidth: '110px' }}>Tailoring Fee (₹)</th>
                        <th style={{ width: '70px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {part.styles.map((sItem, sIdx) => (
                        <tr key={sIdx}>
                          <td style={{ minWidth: '150px' }}>
                            <input
                              type="text"
                              value={sItem.name}
                              onChange={(e) => {
                                const updated = [...customizerPartsConfig];
                                updated[pIdx].styles[sIdx].name = e.target.value;
                                setCustomizerPartsConfig(updated);
                              }}
                              style={{ width: '100%', minWidth: '130px', padding: '6px 10px', fontSize: '13px', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                            />
                          </td>
                          <td style={{ minWidth: '220px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {sItem.image ? (
                                <img 
                                  src={sItem.image} 
                                  alt={sItem.name} 
                                  style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--color-border)' }} 
                                />
                              ) : (
                                <div style={{ width: '36px', height: '36px', borderRadius: '4px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#94a3b8', textAlign: 'center', padding: '2px' }}>
                                  No Photo
                                </div>
                              )}

                              <input
                                type="text"
                                placeholder="Paste image URL..."
                                value={sItem.image || ''}
                                onChange={(e) => {
                                  const updated = [...customizerPartsConfig];
                                  updated[pIdx].styles[sIdx].image = e.target.value;
                                  setCustomizerPartsConfig(updated);
                                }}
                                style={{ flex: 1, padding: '6px 8px', fontSize: '11px', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                              />

                              <label className="custom-file-upload" style={{ cursor: 'pointer', padding: '6px 10px', fontSize: '11px', margin: 0, backgroundColor: '#8b0000', color: '#fff', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                                <Upload size={12} />
                                <span>Upload</span>
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={async (e) => {
                                    if (e.target.files?.[0]) {
                                      try {
                                        const url = await uploadFileToGithub(e.target.files[0]);
                                        if (url) {
                                          const updated = [...customizerPartsConfig];
                                          updated[pIdx].styles[sIdx].image = url;
                                          setCustomizerPartsConfig(updated);
                                        }
                                      } catch (err) {
                                        alert('Image upload failed: ' + err.message);
                                      }
                                    }
                                  }} 
                                  style={{ display: 'none' }} 
                                />
                              </label>
                            </div>
                          </td>
                          <td style={{ width: '160px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>+₹</span>
                              <input
                                type="number"
                                min="0"
                                value={sItem.price !== undefined ? sItem.price : 0}
                                onChange={(e) => {
                                  const updated = [...customizerPartsConfig];
                                  updated[pIdx].styles[sIdx].price = Math.max(0, Number(e.target.value) || 0);
                                  setCustomizerPartsConfig(updated);
                                }}
                                style={{ width: '90px', padding: '6px 10px', fontSize: '13px', borderRadius: '4px', border: '1px solid var(--color-border)', fontWeight: '600', color: '#047857' }}
                              />
                            </div>
                          </td>
                          <td style={{ width: '100px' }}>
                            {part.styles.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...customizerPartsConfig];
                                  updated[pIdx].styles = updated[pIdx].styles.filter((_, i) => i !== sIdx);
                                  setCustomizerPartsConfig(updated);
                                }}
                                style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}
                                title="Delete Style"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}

                      {/* Inline Form Row to Add New Style (No Prompt!) */}
                      <tr style={{ backgroundColor: 'rgba(139, 0, 0, 0.02)' }}>
                        <td style={{ minWidth: '150px' }}>
                          <input
                            type="text"
                            placeholder="➕ Type Style Name..."
                            value={newStyleInputs[pIdx]?.name || ''}
                            onChange={(e) => {
                              setNewStyleInputs(prev => ({
                                ...prev,
                                [pIdx]: { ...prev[pIdx], name: e.target.value }
                              }));
                            }}
                            style={{ width: '100%', minWidth: '130px', padding: '6px 10px', fontSize: '12px', borderRadius: '4px', border: '1px dashed #8b0000' }}
                          />
                        </td>
                        <td style={{ minWidth: '220px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <input
                              type="text"
                              placeholder="Paste image URL..."
                              value={newStyleInputs[pIdx]?.image || ''}
                              onChange={(e) => {
                                setNewStyleInputs(prev => ({
                                  ...prev,
                                  [pIdx]: { ...prev[pIdx], image: e.target.value }
                                }));
                              }}
                              style={{ flex: 1, padding: '6px 8px', fontSize: '11px', borderRadius: '4px', border: '1px dashed #8b0000' }}
                            />
                            <label className="custom-file-upload" style={{ cursor: 'pointer', padding: '5px 8px', fontSize: '11px', margin: 0, backgroundColor: '#8b0000', color: '#fff', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                              <Upload size={12} />
                              <span>Upload</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={async (e) => {
                                  if (e.target.files?.[0]) {
                                    try {
                                      const url = await uploadFileToGithub(e.target.files[0]);
                                      if (url) {
                                        setNewStyleInputs(prev => ({
                                          ...prev,
                                          [pIdx]: { ...prev[pIdx], image: url }
                                        }));
                                      }
                                    } catch (err) {
                                      alert('Upload failed: ' + err.message);
                                    }
                                  }
                                }} 
                                style={{ display: 'none' }} 
                              />
                            </label>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '12px', fontWeight: '600' }}>+₹</span>
                            <input
                              type="number"
                              min="0"
                              placeholder="150"
                              value={newStyleInputs[pIdx]?.price !== undefined ? newStyleInputs[pIdx]?.price : ''}
                              onChange={(e) => {
                                setNewStyleInputs(prev => ({
                                  ...prev,
                                  [pIdx]: { ...prev[pIdx], price: e.target.value }
                                }));
                              }}
                              style={{ width: '80px', padding: '6px 8px', fontSize: '12px', borderRadius: '4px', border: '1px dashed #8b0000', fontWeight: '600', color: '#047857' }}
                            />
                          </div>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="add-btn-submit"
                            onClick={() => {
                              const inputData = newStyleInputs[pIdx];
                              if (inputData?.name && inputData.name.trim()) {
                                const newStyle = {
                                  id: inputData.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                                  name: inputData.name.trim(),
                                  price: Number(inputData.price) || 0,
                                  image: inputData.image || ''
                                };
                                const updated = [...customizerPartsConfig];
                                updated[pIdx].styles.push(newStyle);
                                setCustomizerPartsConfig(updated);
                                setNewStyleInputs(prev => ({
                                  ...prev,
                                  [pIdx]: { name: '', price: '', image: '' }
                                }));
                              } else {
                                alert('Please type a style name first.');
                              }
                            }}
                            style={{ padding: '5px 10px', fontSize: '11px', whiteSpace: 'nowrap' }}
                          >
                            <Plus size={12} /> Add Style
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="add-btn-submit"
              onClick={() => {
                const updatedSettings = {
                  ...boutiqueSettings,
                  customizerParts: JSON.stringify(customizerPartsConfig)
                };
                onSaveSettings(updatedSettings);
                alert('✅ 2D Customizer Parts, Styles & Tailoring Prices saved and updated live!');
              }}
              style={{ width: '100%', padding: '14px', fontSize: '14px', marginTop: '10px' }}
            >
              <CheckCircle2 size={18} /> Save 2D Customizer Configuration
            </button>
          </div>
        </div>
      )}

      {/* Delete Order Confirmation GUI Modal */}
      {deleteConfirmOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999, padding: '20px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '440px', width: '100%', padding: '28px', boxShadow: '0 20px 50px rgba(0,0,0,0.25)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <Trash2 size={26} />
            </div>
            
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              Delete Order #{deleteConfirmOrder.id}?
            </h3>
            
            <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
              Are you sure you want to delete order <strong>#{deleteConfirmOrder.id}</strong> (Customer: <strong>{deleteConfirmOrder.shippingDetails?.name || 'Customer'}</strong>)? This action will permanently remove it.
            </p>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setDeleteConfirmOrder(null)}
                style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', fontSize: '13.5px', fontWeight: '600', border: '1px solid var(--color-border)', backgroundColor: '#f8fafc', color: '#475569', cursor: 'pointer' }}
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={async () => {
                  if (onDeleteOrder) {
                    await onDeleteOrder(deleteConfirmOrder.id);
                  }
                  setDeleteConfirmOrder(null);
                }}
                style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', fontSize: '13.5px', fontWeight: '600', backgroundColor: '#ef4444', color: '#ffffff', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Trash2 size={16} /> Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
