import React, { useState, useMemo } from 'react';
import { Check, ChevronRight, ChevronLeft, RotateCcw, Sparkles, Shirt } from 'lucide-react';
import { DEFAULT_CUSTOMIZER_PARTS } from '../utils/customizerData';

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

  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [selectedLining, setSelectedLining] = useState('Without Lining');
  const [selectedZip, setSelectedZip] = useState('No');
  const [selectedSleeve, setSelectedSleeve] = useState(null);
  const [selectedNeck, setSelectedNeck] = useState(null);
  const [otherSelections, setOtherSelections] = useState({});
  const [customNotes, setCustomNotes] = useState('');

  // Total steps = number of activeParts + 1 (Tailoring Notes)
  const totalSteps = activeParts.length + 1;

  const necklinesPart = activeParts.find(p => p.id === 'necklines') || activeParts[0];
  const sleevesPart   = activeParts.find(p => p.id === 'sleeves') || activeParts[1];

  const NECKS   = necklinesPart?.styles || [];
  const SLEEVES = sleevesPart?.styles   || [];

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
    activeParts.forEach(part => {
      if (part.id !== 'necklines' && part.id !== 'sleeves') {
        const selectedStyleId = updatedOthers[part.id];
        const styleObj = part.styles?.find(s => s.id === selectedStyleId || s.name === selectedStyleId);
        if (styleObj?.price) {
          otherPrices += Number(styleObj.price);
        }
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

  const handleReset = () => {
    setSelectedLining('Without Lining');
    setSelectedZip('No');
    setSelectedSleeve(null);
    setSelectedNeck(null);
    setOtherSelections({});
    setCustomNotes('');
    setActiveStepIdx(0);
    notify({ lining: 'Without Lining', zip: 'No', sleeve: null, neck: null, others: {}, notes: '' });
  };

  // Compute selected label for step
  const getStepSelectedLabel = (part) => {
    if (part.id === 'necklines') {
      const found = NECKS.find(n => n.id === selectedNeck || n.name === selectedNeck);
      return found?.name || null;
    }
    if (part.id === 'sleeves') {
      const found = SLEEVES.find(s => s.id === selectedSleeve || s.name === selectedSleeve);
      return found?.name || null;
    }
    if (part.id === 'zip') {
      return selectedZip === 'Yes' ? 'Maternity Zip' : null;
    }
    if (part.id === 'lining') {
      return selectedLining === 'Lining' ? 'Cotton Lining' : null;
    }
    const foundId = otherSelections[part.id];
    const styleObj = part.styles?.find(s => s.id === foundId || s.name === foundId);
    return styleObj?.name || null;
  };

  // Calculate current total tailoring charges
  const currentTailoringCost = useMemo(() => {
    const sObj = SLEEVES.find(s => s.id === selectedSleeve || s.name === selectedSleeve);
    const nObj = NECKS.find(n => n.id === selectedNeck || n.name === selectedNeck);
    const sPrice = sObj?.price || 0;
    const nPrice = nObj?.price || 0;
    const zPrice = selectedZip === 'Yes' ? 150 : 0;
    const lPrice = selectedLining === 'Lining' ? 250 : 0;

    let otherPrices = 0;
    activeParts.forEach(part => {
      if (part.id !== 'necklines' && part.id !== 'sleeves') {
        const selectedStyleId = otherSelections[part.id];
        const styleObj = part.styles?.find(s => s.id === selectedStyleId || s.name === selectedStyleId);
        if (styleObj?.price) {
          otherPrices += Number(styleObj.price);
        }
      }
    });

    return sPrice + nPrice + zPrice + lPrice + otherPrices;
  }, [selectedSleeve, selectedNeck, selectedZip, selectedLining, otherSelections, activeParts, SLEEVES, NECKS]);

  const currentPart = activeParts[activeStepIdx];

  return (
    <div className="visual-customizer-wrapper animate-fadeIn">
      {/* Top Bar */}
      <div className="visual-customizer-header">
        <div className="visual-customizer-title-group">
          <Sparkles size={18} style={{ color: '#b58c59' }} />
          <h3 className="visual-customizer-title">CUSTOMIZE YOUR COUTURE OUTFIT</h3>
          <span className="step-badge-indicator">STEP {activeStepIdx + 1} OF {totalSteps}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {currentTailoringCost > 0 && (
            <span className="tailoring-cost-badge">
              ✨ Tailoring Add-on: +₹{currentTailoringCost}
            </span>
          )}
          <button className="studio-reset-btn" onClick={handleReset}>
            <RotateCcw size={11} /> Reset All
          </button>
        </div>
      </div>

      {/* Main 2-Column Body */}
      <div className="visual-customizer-body">
        {/* Left Step Sidebar Navigation */}
        <div className="visual-step-sidebar">
          {activeParts.map((part, idx) => {
            const isSelected = activeStepIdx === idx;
            const selLabel = getStepSelectedLabel(part);

            return (
              <button
                key={part.id}
                type="button"
                className={`step-sidebar-btn ${isSelected ? 'active' : ''}`}
                onClick={() => setActiveStepIdx(idx)}
              >
                <div className="step-sidebar-title-group">
                  <span style={{ fontWeight: '700', fontSize: '12px', opacity: 0.7 }}>{idx + 1}.</span>
                  <span>{part.name.toUpperCase()}</span>
                </div>
                {selLabel && <span className="step-selected-chip">{selLabel}</span>}
              </button>
            );
          })}

          {/* Final Step: Notes */}
          <button
            type="button"
            className={`step-sidebar-btn ${activeStepIdx === activeParts.length ? 'active' : ''}`}
            onClick={() => setActiveStepIdx(activeParts.length)}
          >
            <div className="step-sidebar-title-group">
              <span style={{ fontWeight: '700', fontSize: '12px', opacity: 0.7 }}>{activeParts.length + 1}.</span>
              <span>NOTES TO TAILOR</span>
            </div>
            {customNotes && <span className="step-selected-chip">Added</span>}
          </button>
        </div>

        {/* Right Main Option Content */}
        <div className="visual-step-main">
          {activeStepIdx < activeParts.length ? (
            <>
              <div className="visual-step-header">
                <h4 className="visual-step-heading">CHOOSE YOUR {currentPart.name}</h4>
                <p className="visual-step-sub">Click any option below to choose your custom style preference for this piece.</p>
              </div>

              {/* 4-Column Style Image Cards Grid */}
              <div className="style-image-cards-grid">
                {currentPart.styles?.map(st => {
                  let isCardActive = false;
                  if (currentPart.id === 'necklines') isCardActive = selectedNeck === st.id || selectedNeck === st.name;
                  else if (currentPart.id === 'sleeves') isCardActive = selectedSleeve === st.id || selectedSleeve === st.name;
                  else isCardActive = otherSelections[currentPart.id] === st.id || otherSelections[currentPart.id] === st.name;

                  return (
                    <div
                      key={st.id}
                      className={`style-image-card ${isCardActive ? 'active' : ''}`}
                      onClick={() => {
                        if (currentPart.id === 'necklines') {
                          const v = selectedNeck === st.id ? null : st.id;
                          setSelectedNeck(v);
                          notify({ neck: v });
                        } else if (currentPart.id === 'sleeves') {
                          const v = selectedSleeve === st.id ? null : st.id;
                          setSelectedSleeve(v);
                          notify({ sleeve: v });
                        } else {
                          const newOthers = {
                            ...otherSelections,
                            [currentPart.id]: otherSelections[currentPart.id] === st.id ? null : st.id
                          };
                          setOtherSelections(newOthers);
                          notify({ others: newOthers });
                        }
                      }}
                    >
                      <div className="card-image-box">
                        {st.image ? (
                          <img src={st.image} alt={st.name} />
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'var(--color-text-secondary)', padding: '6px', height: '100%' }}>
                            <Shirt size={24} strokeWidth={1.2} style={{ color: '#b58c59', opacity: 0.7 }} />
                            <span style={{ fontSize: '9.5px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center', color: '#666', lineHeight: '1.2' }}>{st.name}</span>
                          </div>
                        )}

                        {isCardActive && (
                          <div className="card-selected-badge">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                      </div>

                      <div className="card-label-box">
                        <span className="card-style-name">{st.name}</span>
                        <span className="card-style-price">
                          {st.price > 0 ? `+₹${st.price}` : 'Included'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Final Step: Notes to Tailor */
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="visual-step-header">
                <h4 className="visual-step-heading">SPECIAL FITTING & TAILORING INSTRUCTIONS</h4>
                <p className="visual-step-sub">Add any specific measurement notes or custom stitching requests for your tailor.</p>
              </div>

              <div style={{ marginTop: '12px', flex: 1 }}>
                <textarea
                  rows={6}
                  maxLength={300}
                  className="studio-notes-textarea"
                  placeholder="e.g. Please ensure waist fit is 32 inches, add side pockets, or keep kurta length 46 inches..."
                  value={customNotes}
                  onChange={(e) => {
                    setCustomNotes(e.target.value);
                    notify({ notes: e.target.value });
                  }}
                  style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '13.5px', lineHeight: '1.6', fontFamily: 'inherit' }}
                />
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '6px', textAlign: 'right' }}>
                  {customNotes.length}/300 characters
                </span>
              </div>
            </div>
          )}

          {/* Step Controls Footer */}
          <div className="visual-step-footer">
            <button
              type="button"
              className="btn-secondary"
              disabled={activeStepIdx === 0}
              onClick={() => setActiveStepIdx(prev => Math.max(0, prev - 1))}
              style={{ padding: '8px 16px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', opacity: activeStepIdx === 0 ? 0.5 : 1 }}
            >
              <ChevronLeft size={15} /> Previous Step
            </button>

            {activeStepIdx < totalSteps - 1 && (
              <button
                type="button"
                className="add-btn-submit"
                onClick={() => setActiveStepIdx(prev => Math.min(totalSteps - 1, prev + 1))}
                style={{ width: 'auto', padding: '8px 18px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <span>Next Step</span>
                <ChevronRight size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
