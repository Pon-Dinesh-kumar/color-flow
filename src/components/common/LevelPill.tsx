import React from 'react';

interface LevelPillProps {
  levelNumber: number;
}

export const LevelPill: React.FC<LevelPillProps> = ({ levelNumber }) => {
  return (
    <div className="flex items-start justify-center select-none pointer-events-none">
      <div className="relative mt-0.5 overflow-hidden min-w-[100px] md:min-w-[120px] py-1.5 px-3 rounded-full bg-gradient-to-b from-sky-300 via-blue-500 to-blue-700 border-2 border-white/85 shadow-[0_5px_14px_rgba(16,57,133,0.4),inset_0_2px_4px_rgba(255,255,255,0.75)] flex items-center justify-center">
        <span className="absolute inset-x-4 top-0.5 h-1/2 rounded-full bg-gradient-to-b from-white/40 to-transparent" />
        <span className="relative text-white font-black text-sm md:text-base tracking-wider drop-shadow-md">
          LEVEL {levelNumber}
        </span>
      </div>
    </div>
  );
};
