import React, { useState } from 'react';
import { FDAAllergen } from '../types';
import { FDA_ALLERGENS, getAllergenInfo } from '../data/allergens';
import { ShieldAlert, Info, X } from 'lucide-react';

interface AllergenMicroDotsProps {
  allergens?: FDAAllergen[];
  showLabels?: boolean;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const AllergenMicroDots: React.FC<AllergenMicroDotsProps> = ({
  allergens,
  showLabels = false,
  size = 'sm',
  className = ''
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!allergens || allergens.length === 0) return null;

  const validAllergens = allergens
    .map(id => getAllergenInfo(id))
    .filter((a): a is NonNullable<typeof a> => !!a);

  if (validAllergens.length === 0) return null;

  const dotSizeClass = 
    size === 'xs' ? 'w-1.5 h-1.5' : 
    size === 'md' ? 'w-2.5 h-2.5' : 'w-2 h-2';

  const textSizeClass =
    size === 'xs' ? 'text-[9px]' :
    size === 'md' ? 'text-xs' : 'text-[10px]';

  return (
    <div 
      className={`relative inline-flex items-center gap-1 cursor-help select-none ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={(e) => {
        e.stopPropagation();
        setShowTooltip(prev => !prev);
      }}
      title={`Contains FDA Allergens: ${validAllergens.map(a => a.label).join(', ')}`}
    >
      {/* Micro Colored Dots / Micro Icons Container */}
      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-zinc-900/90 border border-zinc-700/60 shadow-sm backdrop-blur-xs">
        {validAllergens.map(a => (
          <span
            key={a.id}
            className={`${dotSizeClass} rounded-full ${a.dotColor} shadow-xs ring-1 ring-black/40`}
            title={`${a.label} (${a.shortCode})`}
          />
        ))}

        {showLabels && (
          <span className={`${textSizeClass} font-mono font-bold tracking-tight text-zinc-300 ml-0.5`}>
            {validAllergens.map(a => a.shortCode).join('·')}
          </span>
        )}
      </div>

      {/* Floating Tooltip On Hover/Tap */}
      {showTooltip && (
        <div 
          className="absolute bottom-full left-0 mb-2 z-50 p-2.5 rounded-xl bg-zinc-950 border border-zinc-700 shadow-2xl min-w-[190px] max-w-[240px] pointer-events-none animate-in fade-in zoom-in-95 duration-100"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-zinc-800 text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>FDA Allergens ({validAllergens.length})</span>
          </div>
          <div className="space-y-1">
            {validAllergens.map(a => (
              <div key={a.id} className="flex items-center gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full ${a.dotColor} shrink-0`} />
                <span className="font-semibold text-zinc-100">{a.label}</span>
                <span className="text-[10px] text-zinc-400 font-mono ml-auto">[{a.shortCode}]</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface AllergenLegendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AllergenLegendModal: React.FC<AllergenLegendModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-[#141418] rounded-2xl border border-zinc-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-[#101014]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/30 text-amber-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">FDA Major Food Allergens Guide</h2>
              <p className="text-xs text-zinc-400 mt-0.5">U.S. FDA FALCPA & FASTER Act Recognized Allergens</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of 9 FDA Allergens */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 divide-y divide-zinc-800/60 flex-1">
          {FDA_ALLERGENS.map(allergen => (
            <div key={allergen.id} className="pt-2.5 first:pt-0 flex items-start gap-3">
              <div className="flex items-center gap-1.5 mt-0.5 shrink-0">
                <span className={`w-3.5 h-3.5 rounded-full ${allergen.dotColor} shadow-sm ring-1 ring-black/40`} />
                <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                  {allergen.shortCode}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{allergen.label}</span>
                  <span className="text-xs text-zinc-500 font-mono">({allergen.fdaCategoryName})</span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{allergen.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-[#101014] flex items-center justify-between">
          <span className="text-[11px] text-zinc-500 font-mono">
            Color dots shown on product cards & guest checks
          </span>
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};

interface AllergenSelectorProps {
  selectedAllergens: FDAAllergen[];
  onChange: (allergens: FDAAllergen[]) => void;
}

export const AllergenSelector: React.FC<AllergenSelectorProps> = ({
  selectedAllergens,
  onChange
}) => {
  const toggleAllergen = (id: FDAAllergen) => {
    if (selectedAllergens.includes(id)) {
      onChange(selectedAllergens.filter(a => a !== id));
    } else {
      onChange([...selectedAllergens, id]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>FDA Food Allergens</span>
        </label>
        <span className="text-[10px] font-mono text-zinc-500">
          {selectedAllergens.length > 0 ? `${selectedAllergens.length} selected` : 'None'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {FDA_ALLERGENS.map(allergen => {
          const isSelected = selectedAllergens.includes(allergen.id);
          return (
            <button
              key={allergen.id}
              type="button"
              onClick={() => toggleAllergen(allergen.id)}
              className={`h-9 px-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer select-none ${
                isSelected
                  ? `${allergen.badgeBg} ${allergen.badgeBorder} ${allergen.badgeText} shadow-xs font-bold ring-1 ring-amber-400/30`
                  : 'bg-zinc-900/80 hover:bg-zinc-800 border-zinc-700/60 text-zinc-400'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${allergen.dotColor} shrink-0`} />
              <span className="truncate">{allergen.label.split(' / ')[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
