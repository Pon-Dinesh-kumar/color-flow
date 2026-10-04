import React from 'react';

interface MovesChipProps {
  movesUsed: number;
  maxMoves?: number;
}

export const MovesChip: React.FC<MovesChipProps> = ({ movesUsed, maxMoves }) => {
  return (
    <div className="py-1.5 px-5 rounded-full bg-slate-900/80 backdrop-blur-lg border border-white/15 shadow-[0_6px_16px_rgba(0,0,0,0.4)] flex items-center gap-2 select-none pointer-events-none">
      <span className="text-white/70 font-extrabold text-xs uppercase tracking-wider">
        MOVES
      </span>
      <div className="flex items-center text-white font-black text-sm">
        <span>{movesUsed}</span>
        {maxMoves && <span className="text-white/50 ml-1">/ {maxMoves}</span>}
      </div>
    </div>
  );
};
