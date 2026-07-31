/**
 * Dynamic 2D Couture Customizer Options Schema & Defaults — Ini by Maya
 * Fully configurable from the Admin Console "2D Customizer Config" tab.
 */

export const DEFAULT_CUSTOMIZER_PARTS = [
  {
    id: 'necklines',
    name: 'Neckline Cut',
    required: true,
    styles: [
      { id: 'round', name: 'Round Neck', price: 0, svgPath: 'M 88,100 Q 150,144 212,100' },
      { id: 'v-neck', name: 'V Neck', price: 150, svgPath: 'M 88,100 L 150,174 L 212,100' },
      { id: 'scalloped-round', name: 'Scalloped Round Neck', price: 200, svgPath: 'M 88,100 C 100,130 120,144 130,136 Q 140,150 150,144 Q 160,150 170,136 C 180,144 200,130 212,100' },
      { id: 'scalloped-v', name: 'Scalloped V Neck', price: 200, svgPath: 'M 88,100 C 100,126 120,133 130,126 L 150,170 L 170,126 C 180,133 200,126 212,100' },
      { id: 'square', name: 'Square Neck', price: 100, svgPath: 'M 88,100 L 88,154 L 212,154 L 212,100' },
      { id: 'sweetheart', name: 'Sweetheart Neck', price: 200, svgPath: 'M 88,100 C 88,150 118,170 150,157 C 182,170 212,150 212,100' },
      { id: 'chinese', name: 'Chinese Collar', price: 250, svgPath: 'M 88,100 Q 150,114 212,100 M 90,89 Q 150,100 210,89' },
      { id: 'boat', name: 'Boat Neck', price: 150, svgPath: 'M 74,108 Q 150,116 226,108' }
    ]
  },
  {
    id: 'sleeves',
    name: 'Sleeve Length & Cut',
    required: true,
    styles: [
      { id: 'cap', name: 'Cap Sleeves', price: 0 },
      { id: 'short', name: 'Short Sleeves', price: 0 },
      { id: 'short-balloon', name: 'Short Balloon Puff', price: 200 },
      { id: 'three-quarter', name: 'Three Quarter Sleeves', price: 100 },
      { id: 'full', name: 'Full Sleeves', price: 150 },
      { id: 'bell', name: 'Full Bell Sleeves', price: 250 }
    ]
  },
  {
    id: 'zip',
    name: 'Zip & Side Fasteners',
    required: false,
    styles: [
      { id: 'no-zip', name: 'Standard Pull-Over (No Zip)', price: 0 },
      { id: 'concealed-zip', name: 'Concealed Side YKK Zip', price: 150 }
    ]
  },
  {
    id: 'lining',
    name: 'Inner Lining Attachment',
    required: false,
    styles: [
      { id: 'no-lining', name: 'Without Inner Lining', price: 0 },
      { id: 'cotton-lining', name: 'Pure Soft Cotton Lining', price: 250 }
    ]
  }
];
