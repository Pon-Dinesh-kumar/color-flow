import React from 'react';

interface LevelPillProps {
  levelNumber: number;
  title?: string;
}

export const LevelPill: React.FC<LevelPillProps> = ({ levelNumber, title }) => {
  return (
    <div className="flex flex-col items-center select-none pointer-events-none">
      <div className="min-w-[150px] md:min-w-[180px] py-2 px-6 rounded-full bg-slate-900/85 backdrop-blur-xl border border-white/20 shadow-[0_8px_24px_rgba(0,0,0,0.5)] flex items-center justify-center">
        <span className="text-white font-black text-lg md:text-xl tracking-wider drop-shadow-md">
          LEVEL {levelNumber}
        </span>
      </div>
      {title && (
        <span className="text-white/80 font-bold text-xs mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wide">
          {title}
        </span>
      )}
    </div>
  );
};
