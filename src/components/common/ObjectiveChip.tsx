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
      className={`relative overflow-hidden min-w-[88px] md:min-w-[106px] py-1.5 px-2.5 rounded-full backdrop-blur-xl border-2 flex items-center justify-between gap-2 shadow-[0_4px_12px_rgba(4,24,69,0.45),inset_0_2px_4px_rgba(255,255,255,0.28)] transition-all duration-300 select-none ${
        isComplete
          ? 'border-emerald-100'
          : 'border-sky-100/80'
      }`}
      style={{
        background: isComplete
          ? 'linear-gradient(180deg, rgba(16,185,129,0.96), rgba(4,120,87,0.96))'
          : 'linear-gradient(180deg, rgba(30,64,128,0.96), rgba(8,24,65,0.98))',
      }}
    >
      <span className="absolute inset-x-3 top-0.5 h-1/2 rounded-full bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />
      {/* Glowing Orb */}
      <div className="relative flex items-center justify-center">
        <div
          className="w-4 h-4 rounded-full shadow-inner ring-2 ring-white/80"
          style={{
            backgroundColor: colorDef.hex,
            boxShadow: `0 0 12px ${colorDef.hex}`,
          }}
        />
      </div>

      {/* Counter */}
      <div className="relative flex items-center text-white font-black text-sm tracking-wider drop-shadow-sm">
        <span>{current}</span>
        <span className="text-white/40 mx-1">/</span>
        <span className="text-white/80">{required}</span>
      </div>

      {/* Completion check badge */}
      <div className="relative w-4 flex items-center justify-center">
        {isComplete ? (
          <CheckCircle2 className="w-4 h-4 text-white drop-shadow-sm animate-bounce" />
        ) : (
          <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
        )}
      </div>
    </div>
  );
};
