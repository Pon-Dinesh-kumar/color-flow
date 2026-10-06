import React from 'react';

export const GameLogo: React.FC = () => {
  return (
    <div className="flex flex-col items-center select-none pt-[max(0.75rem,env(safe-area-inset-top))] px-4 pointer-events-none">
      {/* 3D Chunky Toy Letters: C O L O R */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2.5">
        {/* C - Red */}
        <span
          className="font-black text-5xl sm:text-7xl md:text-8xl text-[#ff2a4b] tracking-tight transform hover:scale-105 transition-transform"
          style={{
            fontFamily: "'Fredoka', 'Nunito', sans-serif",
            textShadow:
              '0 1px 0 #f43f5e, 0 2px 0 #e11d48, 0 3px 0 #be123c, 0 4px 0 #9f1239, 0 5px 0 #881337, 0 8px 16px rgba(0,0,0,0.5)',
            filter: 'drop-shadow(0 4px 10px rgba(244,63,94,0.45))',
          }}
        >
          C
        </span>

        {/* O - Yellow */}
        <span
          className="font-black text-5xl sm:text-7xl md:text-8xl text-[#facc15] tracking-tight transform hover:scale-105 transition-transform"
          style={{
            fontFamily: "'Fredoka', 'Nunito', sans-serif",
            textShadow:
              '0 1px 0 #eab308, 0 2px 0 #ca8a04, 0 3px 0 #a16207, 0 4px 0 #854d0e, 0 5px 0 #713f12, 0 8px 16px rgba(0,0,0,0.5)',
            filter: 'drop-shadow(0 4px 10px rgba(250,204,21,0.45))',
          }}
        >
          O
        </span>

        {/* L - Green */}
        <span
          className="font-black text-5xl sm:text-7xl md:text-8xl text-[#22c55e] tracking-tight transform hover:scale-105 transition-transform"
          style={{
            fontFamily: "'Fredoka', 'Nunito', sans-serif",
            textShadow:
              '0 1px 0 #16a34a, 0 2px 0 #15803d, 0 3px 0 #166534, 0 4px 0 #14532d, 0 5px 0 #052e16, 0 8px 16px rgba(0,0,0,0.5)',
            filter: 'drop-shadow(0 4px 10px rgba(34,197,94,0.45))',
          }}
        >
          L
        </span>

        {/* O - Cyan/Blue */}
        <span
          className="font-black text-5xl sm:text-7xl md:text-8xl text-[#06b6d4] tracking-tight transform hover:scale-105 transition-transform"
          style={{
            fontFamily: "'Fredoka', 'Nunito', sans-serif",
            textShadow:
              '0 1px 0 #0891b2, 0 2px 0 #0e7490, 0 3px 0 #155e75, 0 4px 0 #164e63, 0 5px 0 #083344, 0 8px 16px rgba(0,0,0,0.5)',
            filter: 'drop-shadow(0 4px 10px rgba(6,182,212,0.45))',
          }}
        >
          O
        </span>

        {/* R - Purple */}
        <span
          className="font-black text-5xl sm:text-7xl md:text-8xl text-[#a855f7] tracking-tight transform hover:scale-105 transition-transform"
          style={{
            fontFamily: "'Fredoka', 'Nunito', sans-serif",
            textShadow:
              '0 1px 0 #9333ea, 0 2px 0 #7e22ce, 0 3px 0 #6b21a8, 0 4px 0 #581c87, 0 5px 0 #3b0764, 0 8px 16px rgba(0,0,0,0.5)',
            filter: 'drop-shadow(0 4px 10px rgba(168,85,247,0.45))',
          }}
        >
          R
        </span>
      </div>

      {/* 3D Puffy Cloud Letters: FLOW */}
      <h1
        className="font-black text-6xl sm:text-7xl md:text-8xl text-white tracking-widest -mt-1 sm:-mt-2 uppercase"
        style={{
          fontFamily: "'Fredoka', 'Nunito', sans-serif",
          textShadow:
            '0 1px 0 #e0f2fe, 0 2px 0 #bae6fd, 0 3px 0 #7dd3fc, 0 4px 0 #38bdf8, 0 5px 0 #0284c7, 0 7px 0 #0369a1, 0 9px 0 #075985, 0 12px 24px rgba(2,132,199,0.6)',
          filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.55))',
        }}
      >
        FLOW
      </h1>

      {/* Subtitle Tagline */}
      <p className="mt-1 text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
        Connect • Rotate • Flow
      </p>
    </div>
  );
};
