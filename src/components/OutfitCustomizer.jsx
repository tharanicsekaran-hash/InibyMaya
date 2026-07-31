import React, { useState, useMemo } from 'react';
import { Check, ChevronDown, ChevronUp, RotateCcw, Sparkles } from 'lucide-react';
import { DEFAULT_CUSTOMIZER_PARTS } from '../utils/customizerData';

// ========================
// OPTION DATA
// ========================
const LINING_OPTIONS = ['Without Lining', 'Lining'];
const ZIP_OPTIONS    = ['No', 'Yes'];

const SLEEVES = [
  { id: 'thin-strap',       name: 'Thin Strap', price: 0 },
  { id: '1inch-strap',      name: '1 Inch Strap', price: 0 },
  { id: 'tank',             name: 'Tank', price: 0 },
  { id: 'cap',              name: 'Cap Sleeves', price: 0 },
  { id: 'short',            name: 'Short Sleeves', price: 0 },
  { id: 'short-balloon',    name: 'Short Balloon Puff', price: 200 },
  { id: 'above-elbow',      name: 'Above Elbow', price: 100 },
  { id: 'above-elbow-puff', name: 'Above Elbow With Puff', price: 200 },
  { id: 'three-quarter',    name: 'Three Quarter', price: 100 },
  { id: 'full',             name: 'Full Sleeves', price: 150 },
  { id: 'chudidaar',        name: 'Chudidaar', price: 200 },
  { id: 'bell',             name: 'Full Bell Sleeves', price: 250 },
];

const NECKS = [
  { id: 'round',          name: 'Round Neck', price: 0 },
  { id: 'v-neck',         name: 'V Neck', price: 150 },
  { id: 'scalloped-round',name: 'Scalloped Round Neck', price: 200 },
  { id: 'scalloped-v',    name: 'Scalloped V Neck', price: 200 },
  { id: 'square',         name: 'Square Neck', price: 100 },
  { id: 'rectangular',    name: 'Rectangular Neck', price: 100 },
  { id: 'sweetheart',     name: 'Sweetheart Neck', price: 200 },
  { id: 'keyhole',        name: 'Round Keyhole With Button', price: 150 },
  { id: 'round-v-cut',    name: 'Round V Cut', price: 150 },
  { id: 'paan',           name: 'Paan Neck', price: 150 },
  { id: 'masaba',         name: 'Masaba Neck', price: 150 },
  { id: 'halter',         name: 'Halter Neck', price: 200 },
  { id: 'v-overlap',      name: 'V-Overlap Collar', price: 250 },
  { id: 'chinese',        name: 'Chinese Collar', price: 250 },
  { id: 'shirt',          name: 'Shirt Collar', price: 250 },
  { id: 'kaftan',         name: 'Kaftan Neck', price: 200 },
  { id: 'boat',           name: 'Boat Neck', price: 150 },
  { id: 'sabrina',        name: 'Sabrina Neck', price: 150 },
  { id: 'glass',          name: 'Glass Neck', price: 150 },
  { id: 'diamond',        name: 'Diamond Neck', price: 200 },
];

// ========================
// SVG PATHS
// ViewBox: 0 0 300 455
// Left shoulder : (88, 100)   Right shoulder : (212, 100)
// Left armhole  : (68, 158)   Right armhole  : (232, 158)
// ========================

const NECK_PATHS = {
  round:           'M 88,100 Q 150,144 212,100',
  'v-neck':        'M 88,100 L 150,174 L 212,100',
  'scalloped-round':'M 88,100 C 100,130 120,144 130,136 Q 140,150 150,144 Q 160,150 170,136 C 180,144 200,130 212,100',
  'scalloped-v':   'M 88,100 C 100,126 120,133 130,126 L 150,170 L 170,126 C 180,133 200,126 212,100',
  square:          'M 88,100 L 88,154 L 212,154 L 212,100',
  rectangular:     'M 88,100 L 88,170 L 212,170 L 212,100',
  sweetheart:      'M 88,100 C 88,150 118,170 150,157 C 182,170 212,150 212,100',
  keyhole:         'M 88,100 Q 150,140 212,100 M 150,140 L 150,168 M 146,168 Q 150,175 154,168',
  'round-v-cut':   'M 88,100 Q 112,130 128,128 L 150,164 L 172,128 Q 188,130 212,100',
  paan:            'M 88,100 C 105,120 128,130 150,127 C 172,130 195,120 212,100',
  masaba:          'M 88,100 Q 120,114 150,110 Q 180,114 212,100',
  halter:          'M 88,100 L 122,100 Q 138,84 150,78 Q 162,84 178,100 L 212,100',
  'v-overlap':     'M 88,100 L 152,178 M 212,100 L 148,178 M 144,152 L 158,152',
  chinese:         'M 88,100 Q 150,114 212,100 M 90,89 Q 150,100 210,89',
  shirt:           'M 88,100 L 122,100 L 128,86 L 136,104 L 164,104 L 172,86 L 178,100 L 212,100',
  kaftan:          'M 88,100 L 118,100 L 128,76 L 150,92 L 172,76 L 182,100 L 212,100',
  boat:            'M 74,108 Q 150,116 226,108',
  sabrina:         'M 70,106 Q 150,114 230,106',
  glass:           'M 88,100 L 112,124 L 132,119 L 150,124 L 168,119 L 188,124 L 212,100',
  diamond:         'M 88,100 L 150,76 L 212,100 L 150,164 Z',
  'off-shoulder':  'M 68,132 Q 150,140 232,132 M 68,132 L 88,100 M 232,132 L 212,100',
  'off-shoulder-neck': 'M 68,132 Q 150,140 232,132 M 68,132 L 88,100 M 232,132 L 212,100',
  'scalloped-box-neck': 'M 88,100 L 88,148 Q 120,154 150,148 Q 180,154 212,148 L 212,100',
};

function getNeckPath(neckId, neckStyleObj) {
  if (neckStyleObj?.vectorPreset && NECK_PATHS[neckStyleObj.vectorPreset]) {
    return NECK_PATHS[neckStyleObj.vectorPreset];
  }
  if (neckStyleObj?.svgPath) return neckStyleObj.svgPath;
  if (!neckId && !neckStyleObj?.name) return NECK_PATHS['round'];

  const idStr = String(neckStyleObj?.name || neckId).toLowerCase();
  if (NECK_PATHS[idStr]) return NECK_PATHS[idStr];

  const normalized = idStr.replace(/[^a-z0-9]/g, '');
  
  for (const key of Object.keys(NECK_PATHS)) {
    const keyNorm = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (keyNorm === normalized) return NECK_PATHS[key];
  }

  // Substring / keyword fuzzy matching
  if (normalized.includes('offshoulder') || normalized.includes('shoulder')) {
    return 'M 68,132 Q 150,140 232,132 M 68,132 L 88,100 M 232,132 L 212,100';
  }
  if (normalized.includes('box')) {
    return 'M 88,100 L 88,148 Q 120,154 150,148 Q 180,154 212,148 L 212,100';
  }
  if (normalized.includes('scallop')) {
    return 'M 88,100 C 100,130 120,144 130,136 Q 140,150 150,144 Q 160,150 170,136 C 180,144 200,130 212,100';
  }
  if (normalized.includes('sweetheart')) {
    return 'M 88,100 C 88,150 118,170 150,157 C 182,170 212,150 212,100';
  }
  if (normalized.includes('v')) {
    return 'M 88,100 L 150,174 L 212,100';
  }
  if (normalized.includes('square') || normalized.includes('rect')) {
    return 'M 88,100 L 88,154 L 212,154 L 212,100';
  }
  if (normalized.includes('collar') || normalized.includes('chinese') || normalized.includes('mandarin')) {
    return 'M 88,100 Q 150,114 212,100 M 90,89 Q 150,100 210,89';
  }
  if (normalized.includes('boat') || normalized.includes('sabrina')) {
    return 'M 74,108 Q 150,116 226,108';
  }

  return NECK_PATHS['round'];
}

// ========================
// GARMENT SVG COMPONENT
// ========================
function GarmentSVG({ sleeveId, neckId, neckStyleObj, lining, zip, fillColor }) {
  const S  = '#1a1a1a';      // stroke colour
  const F  = fillColor || '#f5f0e8'; // garment fill
  const AC = '#b8935a';      // accent / gold
  const SW = 1.8;            // stroke width
  const FO = 0.45;           // fill opacity

  const neckPath = getNeckPath(neckId, neckStyleObj);

  const renderSleeves = () => {
    const noSleeve = (
      <>
        <line x1="88"  y1="100" x2="68"  y2="158" stroke={S} strokeWidth={SW} />
        <line x1="212" y1="100" x2="232" y2="158" stroke={S} strokeWidth={SW} />
      </>
    );

    const fp = { fill: F, stroke: S, strokeWidth: SW, fillOpacity: 0.62 };

    switch (sleeveId) {
      case 'thin-strap':
        return (
          <>
            <path d="M 84,100 L 80,60 L 93,60 L 96,100" {...fp} />
            <path d="M 204,100 L 207,60 L 220,60 L 216,100" {...fp} />
            <line x1="84"  y1="100" x2="68"  y2="158" stroke={S} strokeWidth={SW} />
            <line x1="216" y1="100" x2="232" y2="158" stroke={S} strokeWidth={SW} />
          </>
        );
      case '1inch-strap':
        return (
          <>
            <path d="M 82,100 L 77,58 L 96,58 L 98,100" {...fp} />
            <path d="M 202,100 L 204,58 L 223,58 L 218,100" {...fp} />
            <line x1="82"  y1="100" x2="68"  y2="158" stroke={S} strokeWidth={SW} />
            <line x1="218" y1="100" x2="232" y2="158" stroke={S} strokeWidth={SW} />
          </>
        );
      case 'tank':
        return (
          <>
            <path d="M 76,100 L 70,58 L 104,58 L 100,100" {...fp} />
            <path d="M 200,100 L 196,58 L 230,58 L 224,100" {...fp} />
            <line x1="76"  y1="100" x2="68"  y2="158" stroke={S} strokeWidth={SW} />
            <line x1="224" y1="100" x2="232" y2="158" stroke={S} strokeWidth={SW} />
          </>
        );
      case 'cap':
        return (
          <>
            <path d="M 88,100 Q 50,96 54,142 L 68,158 L 82,130 Z" {...fp} />
            <path d="M 212,100 Q 250,96 246,142 L 232,158 L 218,130 Z" {...fp} />
          </>
        );
      case 'short':
        return (
          <>
            <path d="M 88,100 L 48,110 L 42,155 L 68,158 Z" {...fp} />
            <path d="M 212,100 L 252,110 L 258,155 L 232,158 Z" {...fp} />
          </>
        );
      case 'short-balloon':
        return (
          <>
            <path d="M 88,100 Q 36,110 38,150 Q 38,165 68,158 Z" {...fp} />
            <path d="M 212,100 Q 264,110 262,150 Q 262,165 232,158 Z" {...fp} />
          </>
        );
      case 'above-elbow':
        return (
          <>
            <path d="M 88,100 L 44,114 L 30,202 L 54,208 L 68,158 Z" {...fp} />
            <path d="M 212,100 L 256,114 L 270,202 L 246,208 L 232,158 Z" {...fp} />
          </>
        );
      case 'above-elbow-puff':
        return (
          <>
            <path d="M 88,100 Q 34,114 34,162 Q 34,196 54,204 L 64,162 Z" {...fp} />
            <path d="M 212,100 Q 266,114 266,162 Q 266,196 246,204 L 236,162 Z" {...fp} />
          </>
        );
      case 'three-quarter':
        return (
          <>
            <path d="M 88,100 L 43,116 L 22,260 L 48,267 L 68,158 Z" {...fp} />
            <path d="M 212,100 L 257,116 L 278,260 L 252,267 L 232,158 Z" {...fp} />
          </>
        );
      case 'full':
        return (
          <>
            <path d="M 88,100 L 43,116 L 20,330 L 48,338 L 68,158 Z" {...fp} />
            <path d="M 212,100 L 257,116 L 280,330 L 252,338 L 232,158 Z" {...fp} />
          </>
        );
      case 'chudidaar':
        return (
          <>
            <path d="M 88,100 L 43,116 L 18,328 L 32,338 L 46,330 L 68,158 Z" {...fp} />
            <path d="M 20,328 Q 32,346 46,330" fill="none" stroke={S} strokeWidth="1" strokeDasharray="2,2" />
            <path d="M 212,100 L 257,116 L 282,328 L 268,338 L 254,330 L 232,158 Z" {...fp} />
            <path d="M 280,328 Q 268,346 254,330" fill="none" stroke={S} strokeWidth="1" strokeDasharray="2,2" />
          </>
        );
      case 'bell':
        return (
          <>
            <path d="M 88,100 L 50,118 L 10,305 L 48,344 L 68,158 Z" {...fp} />
            <path d="M 212,100 L 250,118 L 290,305 L 252,344 L 232,158 Z" {...fp} />
          </>
        );
      default:
        return noSleeve;
    }
  };

  return (
    <svg viewBox="0 0 300 455" xmlns="http://www.w3.org/2000/svg" className="garment-svg">
      <defs>
        <pattern id="lining-hatch" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="5" stroke={S} strokeWidth="0.4" />
        </pattern>
        <filter id="garment-shadow" x="-10%" y="-5%" width="120%" height="115%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000" floodOpacity="0.08" />
        </filter>
      </defs>

      {/* Base body fill */}
      <path
        d="M 68,158 L 62,238 L 40,332 L 16,450 L 150,455 L 284,450 L 260,332 L 238,238 L 232,158 L 212,100 L 88,100 Z"
        fill={F} fillOpacity={FO} stroke="none"
        filter="url(#garment-shadow)"
      />

      {/* Lining texture overlay */}
      {lining === 'Lining' && (
        <path
          d="M 68,158 L 62,238 L 40,332 L 16,450 L 150,455 L 284,450 L 260,332 L 238,238 L 232,158 L 212,100 L 88,100 Z"
          fill="url(#lining-hatch)" opacity="0.2"
        />
      )}

      {/* Sleeves */}
      {renderSleeves()}

      {/* Body sides + hem strokes */}
      <path d="M 68,158 L 62,238 L 40,332 L 16,450" fill="none" stroke={S} strokeWidth="2" strokeLinecap="round" />
      <path d="M 232,158 L 238,238 L 260,332 L 284,450" fill="none" stroke={S} strokeWidth="2" strokeLinecap="round" />
      <path d="M 16,450 Q 150,458 284,450" fill="none" stroke={S} strokeWidth="2" strokeLinecap="round" />

      {/* Neckline */}
      <path
        d={neckPath}
        fill="none" stroke={S} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
      />

      {/* Maternity zip indicator */}
      {zip === 'Yes' && (
        <>
          <line x1="150" y1="160" x2="150" y2="238" stroke={AC} strokeWidth="2.5" strokeDasharray="5,3" />
          {[168, 180, 192, 204, 216, 228].map(y => (
            <line key={y} x1="145" y1={y} x2="155" y2={y} stroke={AC} strokeWidth="1.2" opacity="0.7" />
          ))}
          <circle cx="150" cy="238" r="5.5" fill={AC} opacity="0.9" />
          <circle cx="150" cy="238" r="2.5" fill="white" opacity="0.8" />
        </>
      )}

      {/* Centre seam (decorative) */}
      <line x1="150" y1="158" x2="150" y2="450" stroke={S} strokeWidth="0.5" strokeDasharray="5,6" opacity="0.18" />

      {/* Decorative yoke embroidery motif */}
      <circle cx="150" cy="212" r="3"   fill={AC} opacity="0.55" />
      <circle cx="138" cy="224" r="2"   fill={AC} opacity="0.4" />
      <circle cx="162" cy="224" r="2"   fill={AC} opacity="0.4" />
      <circle cx="128" cy="238" r="1.5" fill={AC} opacity="0.28" />
      <circle cx="172" cy="238" r="1.5" fill={AC} opacity="0.28" />
      <circle cx="150" cy="236" r="1.5" fill={AC} opacity="0.28" />
    </svg>
  );
}

// ========================
// MAIN COMPONENT
// ========================
export default function OutfitCustomizer({ selectedColor, boutiqueSettings, onCustomizationChange }) {
  const activeParts = useMemo(() => {
    if (boutiqueSettings?.customizerParts) {
      try {
        const parsed = JSON.parse(boutiqueSettings.customizerParts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing customizerParts:', e);
      }
    }
    return DEFAULT_CUSTOMIZER_PARTS;
  }, [boutiqueSettings?.customizerParts]);

  const necklinesPart = activeParts.find(p => p.id === 'necklines') || activeParts[0];
  const sleevesPart   = activeParts.find(p => p.id === 'sleeves') || activeParts[1];

  const NECKS   = necklinesPart?.styles || [];
  const SLEEVES = sleevesPart?.styles   || [];
  const OTHER_PARTS = activeParts.filter(p => p.id !== 'necklines' && p.id !== 'sleeves');

  const [selectedLining, setSelectedLining] = useState('Without Lining');
  const [selectedZip,    setSelectedZip]    = useState('No');
  const [selectedSleeve, setSelectedSleeve] = useState(null);
  const [selectedNeck,   setSelectedNeck]   = useState(null);
  const [otherSelections, setOtherSelections] = useState({});
  const [customNotes,    setCustomNotes]    = useState('');
  const [openSection,    setOpenSection]    = useState('sleeves');

  const notify = (overrides) => {
    const updatedSleeve = 'sleeve' in overrides ? overrides.sleeve : selectedSleeve;
    const updatedNeck = 'neck' in overrides ? overrides.neck : selectedNeck;
    const updatedZip = 'zip' in overrides ? overrides.zip : selectedZip;
    const updatedLining = 'lining' in overrides ? overrides.lining : selectedLining;
    const updatedNotes = 'notes' in overrides ? overrides.notes : customNotes;
    const updatedOthers = 'others' in overrides ? overrides.others : otherSelections;

    const sObj = SLEEVES.find(s => s.id === updatedSleeve || s.name === updatedSleeve);
    const nObj = NECKS.find(n => n.id === updatedNeck || n.name === updatedNeck);
    
    const sPrice = sObj?.price || 0;
    const nPrice = nObj?.price || 0;
    const zPrice = updatedZip === 'Yes' ? 150 : 0;
    const lPrice = updatedLining === 'Lining' ? 250 : 0;

    let otherPrices = 0;
    Object.keys(updatedOthers).forEach(partId => {
      const selectedStyleId = updatedOthers[partId];
      const partObj = OTHER_PARTS.find(p => p.id === partId);
      const styleObj = partObj?.styles?.find(s => s.id === selectedStyleId);
      if (styleObj?.price) {
        otherPrices += Number(styleObj.price);
      }
    });

    const cost = sPrice + nPrice + zPrice + lPrice + otherPrices;

    onCustomizationChange?.({
      lining: updatedLining,
      zip: updatedZip,
      sleeve: updatedSleeve,
      neck: updatedNeck,
      others: updatedOthers,
      notes: updatedNotes,
      tailoringCost: cost
    });
  };

  const pickLining = (v) => { setSelectedLining(v); notify({ lining: v }); };
  const pickZip    = (v) => { setSelectedZip(v);    notify({ zip: v });    };
  const pickSleeve = (id) => {
    const v = selectedSleeve === id ? null : id;
    setSelectedSleeve(v); notify({ sleeve: v });
  };
  const pickNeck   = (id) => {
    const v = selectedNeck === id ? null : id;
    setSelectedNeck(v); notify({ neck: v });
  };
  const handleReset = () => {
    setSelectedLining('Without Lining');
    setSelectedZip('No');
    setSelectedSleeve(null);
    setSelectedNeck(null);
    setOtherSelections({});
    setCustomNotes('');
    notify({ lining: 'Without Lining', zip: 'No', sleeve: null, neck: null, others: {}, notes: '' });
  };

  const sleeveLabel = SLEEVES.find(s => s.id === selectedSleeve || s.name === selectedSleeve)?.name;
  const neckLabel   = NECKS.find(n => n.id === selectedNeck || n.name === selectedNeck)?.name;
  const hasSelections = sleeveLabel || neckLabel || selectedLining === 'Lining' || selectedZip === 'Yes' || Object.keys(otherSelections).length > 0;

  return (
    <div className="outfit-customizer-studio">

      {/* Studio Header */}
      <div className="studio-header-bar">
        <div className="studio-header-left">
          <Sparkles size={15} className="studio-sparkle-icon" />
          <span className="studio-header-title">Style Studio</span>
          <span className="studio-header-sub">Visualize your customizations</span>
        </div>
        <button className="studio-reset-btn" onClick={handleReset}>
          <RotateCcw size={11} />
          Reset All
        </button>
      </div>

      <div className="studio-layout">

        {/* ─── LEFT: Live SVG Preview ─────────────────────────── */}
        <div className="studio-preview-col">
          <p className="preview-eyebrow">Live Preview</p>

          <div className="garment-preview-card">
            <GarmentSVG
              sleeveId={selectedSleeve}
              neckId={selectedNeck}
              neckStyleObj={NECKS.find(n => n.id === selectedNeck || n.name === selectedNeck)}
              lining={selectedLining}
              zip={selectedZip}
              fillColor={selectedColor?.hex}
            />
          </div>

          {/* Selection summary */}
          <div className="selection-summary">
            {hasSelections ? (
              <>
                {sleeveLabel && (
                  <span className="sel-tag">
                    <span className="sel-dot" />
                    {sleeveLabel}
                  </span>
                )}
                {neckLabel && (
                  <span className="sel-tag">
                    <span className="sel-dot" />
                    {neckLabel}
                  </span>
                )}
                {selectedLining === 'Lining' && (
                  <span className="sel-tag"><span className="sel-dot" />Lined</span>
                )}
                {selectedZip === 'Yes' && (
                  <span className="sel-tag"><span className="sel-dot" />Maternity Zip</span>
                )}
              </>
            ) : (
              <p className="preview-hint-text">← Select options to preview your garment</p>
            )}
          </div>
        </div>

        {/* ─── RIGHT: Options Panel ───────────────────────────── */}
        <div className="studio-options-col">

          {/* LINING */}
          <div className="studio-field-group">
            <span className="studio-field-label">Lining</span>
            <div className="studio-toggle-row">
              {LINING_OPTIONS.map(opt => (
                <button
                  key={opt}
                  className={`studio-toggle-btn ${selectedLining === opt ? 'active' : ''}`}
                  onClick={() => pickLining(opt)}
                >
                  {selectedLining === opt && <Check size={11} strokeWidth={3} />}
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* MATERNITY ZIP */}
          <div className="studio-field-group">
            <span className="studio-field-label">Maternity Zip</span>
            <div className="studio-toggle-row">
              {ZIP_OPTIONS.map(opt => (
                <button
                  key={opt}
                  className={`studio-toggle-btn ${selectedZip === opt ? 'active' : ''}`}
                  onClick={() => pickZip(opt)}
                >
                  {selectedZip === opt && <Check size={11} strokeWidth={3} />}
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* SLEEVES ACCORDION */}
          <div className="studio-accordion-block">
            <button
              className={`studio-acc-trigger ${openSection === 'sleeves' ? 'open' : ''}`}
              onClick={() => setOpenSection(p => p === 'sleeves' ? '' : 'sleeves')}
            >
              <span>
                Sleeves
                {sleeveLabel && <em className="acc-chip">{sleeveLabel}</em>}
              </span>
              {openSection === 'sleeves' ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
            {openSection === 'sleeves' && (
              <div className="studio-acc-body animate-slideDown">
                <div className="style-chips-grid">
                  {SLEEVES.map(s => (
                    <button
                      key={s.id}
                      className={`style-chip ${selectedSleeve === s.id ? 'active' : ''}`}
                      onClick={() => pickSleeve(s.id)}
                    >
                      {selectedSleeve === s.id && (
                        <span className="chip-check"><Check size={9} strokeWidth={3} /></span>
                      )}
                      {s.name} {s.price > 0 ? `(+₹${s.price})` : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* NECK ACCORDION */}
          <div className="studio-accordion-block">
            <button
              className={`studio-acc-trigger ${openSection === 'neck' ? 'open' : ''}`}
              onClick={() => setOpenSection(p => p === 'neck' ? '' : 'neck')}
            >
              <span>
                {necklinesPart?.name || 'Neck Style'}
                {neckLabel && <em className="acc-chip">{neckLabel}</em>}
              </span>
              {openSection === 'neck' ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
            {openSection === 'neck' && (
              <div className="studio-acc-body animate-slideDown">
                <div className="style-chips-grid">
                  {NECKS.map(n => (
                    <button
                      key={n.id}
                      className={`style-chip ${selectedNeck === n.id ? 'active' : ''}`}
                      onClick={() => pickNeck(n.id)}
                    >
                      {selectedNeck === n.id && (
                        <span className="chip-check"><Check size={9} strokeWidth={3} /></span>
                      )}
                      {n.name} {n.price > 0 ? `(+₹${n.price})` : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* DYNAMIC OTHER PARTS ACCORDIONS */}
          {OTHER_PARTS.map(part => {
            const selectedStyleId = otherSelections[part.id];
            const selectedStyle = part.styles?.find(s => s.id === selectedStyleId);
            const isOpen = openSection === part.id;

            return (
              <div key={part.id} className="studio-accordion-block">
                <button
                  className={`studio-acc-trigger ${isOpen ? 'open' : ''}`}
                  onClick={() => setOpenSection(p => p === part.id ? '' : part.id)}
                >
                  <span>
                    {part.name}
                    {selectedStyle && <em className="acc-chip">{selectedStyle.name}</em>}
                  </span>
                  {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>

                {isOpen && (
                  <div className="studio-acc-body animate-slideDown">
                    <div className="style-chips-grid">
                      {part.styles?.map(st => (
                        <button
                          key={st.id}
                          className={`style-chip ${otherSelections[part.id] === st.id ? 'active' : ''}`}
                          onClick={() => {
                            const newOthers = {
                              ...otherSelections,
                              [part.id]: otherSelections[part.id] === st.id ? null : st.id
                            };
                            setOtherSelections(newOthers);
                            notify({ others: newOthers });
                          }}
                        >
                          {otherSelections[part.id] === st.id && (
                            <span className="chip-check"><Check size={9} strokeWidth={3} /></span>
                          )}
                          {st.name} {st.price > 0 ? `(+₹${st.price})` : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* CUSTOM NOTES */}
          <div className="studio-field-group" style={{ borderBottom: 'none', paddingBottom: 4 }}>
            <span className="studio-field-label">Add Customizations</span>
            <div className="notes-field-wrap">
              <textarea
                className="studio-notes-textarea"
                rows={3}
                maxLength={300}
                placeholder="e.g., M size but waist 32 inches, side pocket, extra embroidery on sleeves…"
                value={customNotes}
                onChange={e => { setCustomNotes(e.target.value); notify({ notes: e.target.value }); }}
              />
              <span className="notes-char-count">{customNotes.length}/300</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
