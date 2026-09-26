import React from 'react';
import { SubtitleStyle } from '../types.js';
import { CheckCircle2, Type, Sparkles } from 'lucide-react';

interface StyleSelectorProps {
  selectedStyle: SubtitleStyle;
  onSelectStyle: (style: SubtitleStyle) => void;
  disabled?: boolean;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  selectedStyle,
  onSelectStyle,
  disabled = false,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-zinc-200 flex items-center gap-1.5">
          <Type className="w-4 h-4 text-amber-400" />
          Subtitle Style Selector
        </label>
        <span className="text-xs text-zinc-400">Choose 1 of 2 styles</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Style 1: Classic */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelectStyle('classic')}
          className={`relative text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
            selectedStyle === 'classic'
              ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/30'
              : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Style 1
              </span>
              <h4 className="text-sm font-semibold text-white">Classic</h4>
            </div>
            {selectedStyle === 'classic' && (
              <CheckCircle2 className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            )}
          </div>

          <p className="text-xs text-zinc-400 mb-3">
            White text • Subtle black shadow • Centered bottom • Clean sans-serif
          </p>

          {/* Visual Mini Preview */}
          <div className="h-16 rounded-lg bg-black border border-zinc-800 relative flex items-end justify-center pb-2 px-2 overflow-hidden shadow-inner">
            <span className="text-[11px] font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] text-center line-clamp-1">
              Save businesses time and repetitive tasks
            </span>
          </div>
        </button>

        {/* Style 2: Highlight */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelectStyle('highlight')}
          className={`relative text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
            selectedStyle === 'highlight'
              ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/30'
              : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-yellow-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-400" />
                Style 2
              </span>
              <h4 className="text-sm font-semibold text-white">Highlight</h4>
            </div>
            {selectedStyle === 'highlight' && (
              <CheckCircle2 className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            )}
          </div>

          <p className="text-xs text-zinc-400 mb-3">
            50% larger • Vibrant electric yellow • Dark backing pill box • Elevated position
          </p>

          {/* Visual Mini Preview */}
          <div className="h-16 rounded-lg bg-black border border-zinc-800 relative flex items-center justify-center px-2 overflow-hidden shadow-inner">
            <span className="text-[12px] font-black uppercase text-yellow-400 bg-zinc-900/90 border border-yellow-400/30 px-2 py-0.5 rounded shadow-lg text-center tracking-wide">
              BUSINESS AUTOMATION
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
