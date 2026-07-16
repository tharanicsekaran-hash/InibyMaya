// Mock Product Catalog for InibyMaya
export const products = [
  {
    id: 'im-001',
    title: 'Indigo Chikankari Cotton Long Kurta',
    category: 'Long Kurtas',
    price: 2499,
    rating: 4.8,
    reviewsCount: 34,
    description: 'Elevate your ethnic wardrobe with this handcrafted Indigo Chikankari Cotton Long Kurta. Made with premium, lightweight cotton, it features delicate floral hand embroidery across the front, back, and sleeves. Perfect for casual outings and festive gathers alike.',
    details: [
      '100% Breathable Premium Cotton',
      'Intricate Handcrafted Chikankari work',
      'Flattering long, straight silhouette',
      'Side slits for comfort and ease of movement',
      'Hand wash separately in cold water'
    ],
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600&h=800',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600&h=800'
    ],
    variants: {
      colors: [
        { name: 'Indigo Blue', hex: '#1a365d' },
        { name: 'Teal Green', hex: '#234e52' }
      ],
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    },
    customizable: true,
    bestSeller: true,
    occasion: 'Daily Elegance',
    highlights: {
      fit: 'Straight Regular Fit',
      fabric: '100% Breathable Cotton',
      neck: 'Mandarin Neck',
      sleeve: '3/4 Sleeves',
      length: '44 Inches',
      technique: 'Intricate Handcrafted Chikankari'
    }
  },
  {
    id: 'im-002',
    title: 'Pastel Pink Muslin Straight Kurti',
    category: 'Straight Kurtas',
    price: 1899,
    rating: 4.7,
    reviewsCount: 22,
    description: 'A beautiful pastel pink kurta in luxurious muslin silk fabric. Adorned with delicate sequin embellishments on the neckline and a soft floral print. This piece feels weightless and radiates feminine grace.',
    details: [
      'Luxurious Muslin Silk Blend',
      'Hand-sewn sequin embroidery',
      'Comfortable 3/4 sleeves',
      'Includes premium lining for comfort',
      'Dry clean recommended'
    ],
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600&h=800',
      'https://images.unsplash.com/photo-1595959183075-c1d09e519826?auto=format&fit=crop&q=80&w=600&h=800'
    ],
    variants: {
      colors: [
        { name: 'Pastel Pink', hex: '#fbcfe8' },
        { name: 'Lilac Lavender', hex: '#e9d5ff' }
      ],
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    },
    customizable: true,
    bestSeller: false,
    occasion: 'Formal Grace',
    highlights: {
      fit: 'Straight Relaxed Fit',
      fabric: 'Luxurious Muslin Silk Blend',
      neck: 'Frill Round Neck',
      sleeve: '3/4 Sleeve with Frills',
      length: '42 Inches',
      technique: 'Hand-sewn sequin embroidery'
    }
  },
  {
    id: 'im-003',
    title: 'Ivory Chikankari Embroidered Anarkali',
    category: 'Anarkali Suits',
    price: 4599,
    rating: 4.9,
    reviewsCount: 48,
    description: 'An absolute masterpiece of craftsmanship. Our Ivory Chikankari Anarkali features full flared kalis with extensive georgette embroidery, creating a gorgeous royal silhouette. Perfect for bridal events, festivals, or high-end celebrations.',
    details: [
      'Premium Georgette with fine embroidery',
      '28-kali flared royal silhouette',
      'Matching silk slip included',
      'Elegant round neck with back tassel tie',
      'Dry clean only'
    ],
    images: [
      'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&q=80&w=600&h=800',
      'https://images.unsplash.com/photo-1566207274740-0f8cf6b7d5a5?auto=format&fit=crop&q=80&w=600&h=800'
    ],
    variants: {
      colors: [
        { name: 'Ivory White', hex: '#fefefa' },
        { name: 'Cream Beige', hex: '#f5f5dc' }
      ],
      sizes: ['S', 'M', 'L', 'XL', 'XXL']
    },
    customizable: true,
    bestSeller: true,
    occasion: 'Festive Couture',
    highlights: {
      fit: 'Flared Royal Anarkali (28-kali)',
      fabric: 'Premium Georgette Silk',
      neck: 'Elegant Round Neck',
      sleeve: 'Full Length Sleeves',
      length: '52 Inches',
      technique: 'Extensive Chikankari & Zardozi'
    }
  },
  {
    id: 'im-004',
    title: 'Emerald Green Silk Kurta & Pant Set',
    category: 'Co-ord Sets',
    price: 3299,
    rating: 4.6,
    reviewsCount: 15,
    description: 'Get ready for compliments in this Emerald Green Silk Kurta Set. Comes with straight trousers featuring an elasticated waistband and pocket. Designed for modern luxury, comfort, and versatile styling.',
    details: [
      'Raw Silk blend with rich sheen',
      'Minimalist zari work detailing on cuffs',
      'Functional pockets in trousers',
      'Medium weight, ideal for all seasons',
      'Dry clean only'
    ],
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=600&h=800',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600&h=800'
    ],
    variants: {
      colors: [
        { name: 'Emerald Green', hex: '#064e3b' },
        { name: 'Ruby Red', hex: '#7f1d1d' }
      ],
      sizes: ['S', 'M', 'L', 'XL']
    },
    customizable: false,
    bestSeller: false,
    occasion: 'Celebrations',
    highlights: {
      fit: 'Regular Kurta & Straight Pant Set',
      fabric: 'Raw Silk Blend with rich sheen',
      neck: 'Mandarin Collar Neck',
      sleeve: 'Full Sleeves',
      length: '43 Inches',
      technique: 'Minimalist zari work detailing'
    }
  },
  {
    id: 'im-005',
    title: 'Mustard Floral Linen Kurti',
    category: 'Straight Kurtas',
    price: 1599,
    rating: 4.5,
    reviewsCount: 19,
    description: 'Breathable linen-cotton blend kurti in bright mustard yellow. Highlighted with lovely block-print floral designs. Ideal for summer workwear or daytime errands.',
    details: [
      'Linen and organic Cotton blend',
      'Breathable, moisture-wicking weave',
      'Mandarin collar with wooden button placket',
      'Machine wash cold, gentle cycle'
    ],
    images: [
      'https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&q=80&w=600&h=800',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600&h=800'
    ],
    variants: {
      colors: [
        { name: 'Mustard Yellow', hex: '#d97706' },
        { name: 'Olive Green', hex: '#65a30d' }
      ],
      sizes: ['XS', 'S', 'M', 'L', 'XL']
    },
    customizable: true,
    bestSeller: false,
    occasion: 'Daily Elegance',
    highlights: {
      fit: 'Straight Daily Fit',
      fabric: 'Organic Linen-Cotton Blend',
      neck: 'Mandarin Collar Placket',
      sleeve: '3/4 Sleeves',
      length: '40 Inches',
      technique: 'Block-print floral patterns'
    }
  },
  {
    id: 'im-006',
    title: 'Crimson Velvet Zardozi A-Line Kurta',
    category: 'A-Line Kurtas',
    price: 4999,
    rating: 4.9,
    reviewsCount: 28,
    description: 'Crafted from premium silk velvet, this Crimson A-line Kurta features brilliant metallic zardozi embroidery on the V-neckline. Plush, warm, and exceptionally elegant for winters and grand wedding events.',
    details: [
      'Ultra-soft premium silk velvet',
      'Genuine hand-stitched Zardozi work',
      'A-line cut with broad flare',
      'Fully lined with soft satin crepe',
      'Dry clean only'
    ],
    images: [
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=600&h=800',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=600&h=800'
    ],
    variants: {
      colors: [
        { name: 'Crimson Red', hex: '#991b1b' },
        { name: 'Midnight Navy', hex: '#1e3a8a' }
      ],
      sizes: ['S', 'M', 'L', 'XL', 'XXL']
    },
    customizable: true,
    bestSeller: true,
    occasion: 'Festive Couture',
    highlights: {
      fit: 'A-Line Flared Fit',
      fabric: 'Ultra-soft Premium Silk Velvet',
      neck: 'V-Neckline',
      sleeve: '3/4 Sleeves',
      length: '46 Inches',
      technique: 'Genuine hand-stitched Zardozi'
    }
  }
];
