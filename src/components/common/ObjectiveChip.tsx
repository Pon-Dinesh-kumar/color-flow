import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { COLOR_PALETTE, FlowColor } from '../../puzzle/ColorSystem';

interface ObjectiveChipProps {
  color: FlowColor;
  current: number;
  required: number;
  isComplete: boolean;
}

export const ObjectiveChip: React.FC<ObjectiveChipProps> = ({
  color,
  current,
  required,
  isComplete,
}) => {
  const colorDef = COLOR_PALETTE[color];

  return (
    <div
      className={`min-w-[130px] md:min-w-[150px] py-2 px-4 rounded-full backdrop-blur-xl border flex items-center justify-between gap-3 shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-all duration-300 select-none ${
        isComplete
          ? 'bg-slate-900/90 border-emerald-400/80 shadow-emerald-500/20'
          : 'bg-slate-900/80 border-white/20'
      }`}
    >
      {/* Glowing Orb */}
      <div className="relative flex items-center justify-center">
        <div
          className="w-5 h-5 rounded-full shadow-inner ring-2 ring-white/50"
          style={{
            backgroundColor: colorDef.hex,
            boxShadow: `0 0 12px ${colorDef.hex}`,
          }}
        />
      </div>

      {/* Counter */}
      <div className="flex items-center text-white font-black text-base md:text-lg tracking-wider">
        <span>{current}</span>
        <span className="text-white/40 mx-1">/</span>
        <span className="text-white/80">{required}</span>
      </div>

      {/* Completion check badge */}
      <div className="w-5 flex items-center justify-center">
        {isComplete ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-bounce" />
        ) : (
          <div className="w-2 h-2 rounded-full bg-white/20" />
        )}
      </div>
    </div>
  );
};
