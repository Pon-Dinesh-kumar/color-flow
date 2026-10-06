import React from 'react';

interface MovesChipProps {
  movesUsed: number;
  maxMoves?: number;
}

export const MovesChip: React.FC<MovesChipProps> = ({ movesUsed, maxMoves }) => {
  return (
    <div className="relative overflow-hidden py-1.5 px-3.5 rounded-full bg-gradient-to-b from-blue-700/95 via-blue-950/95 to-indigo-950/95 backdrop-blur-lg border-2 border-sky-100/85 shadow-[0_4px_12px_rgba(4,24,69,0.45),inset_0_2px_4px_rgba(255,255,255,0.35)] flex items-center gap-1.5 select-none pointer-events-none">
      <span className="absolute inset-x-3 top-0.5 h-1/2 rounded-full bg-gradient-to-b from-white/30 to-transparent" />
      <span className="relative text-sky-50 font-extrabold text-[10px] uppercase tracking-wider drop-shadow-sm">
        MOVES
      </span>
      <div className="relative flex items-center text-white font-black text-xs drop-shadow-sm">
        <span>{movesUsed}</span>
        {maxMoves && <span className="text-sky-100/65 ml-1">/ {maxMoves}</span>}
      </div>
    </div>
  );
};
