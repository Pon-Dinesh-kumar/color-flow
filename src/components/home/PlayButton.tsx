import React from 'react';
import { Play } from 'lucide-react';
import { AudioManager } from '../../engine/AudioManager';

interface PlayButtonProps {
  onPlay: () => void;
}

export const PlayButton: React.FC<PlayButtonProps> = ({ onPlay }) => {
  const handleClick = () => {
    AudioManager.playButtonClick();
    onPlay();
  };

  return (
    <div className="flex items-center justify-center w-full px-6">
      <button
        onClick={handleClick}
        aria-label="Play Game"
        className="group relative w-full max-w-[240px] h-[64px] rounded-full flex items-center justify-center gap-3 cursor-pointer select-none active:scale-95 transition-transform duration-150 animate-[playBreathe_3.2s_ease-in-out_infinite]"
        style={{
          background: 'linear-gradient(180deg, #4ade80 0%, #22c55e 45%, #16a34a 100%)',
          boxShadow:
            '0 0 25px rgba(34, 197, 94, 0.55), 0 8px 25px rgba(0, 0, 0, 0.55), inset 0 2px 4px rgba(255, 255, 255, 0.75), inset 0 -3px 6px rgba(21, 128, 61, 0.8)',
          borderTop: '2px solid rgba(255, 255, 255, 0.65)',
        }}
      >
        {/* Play Icon */}
        <Play
          className="w-7 h-7 text-white fill-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] group-hover:scale-110 transition-transform"
        />

        {/* Play Text */}
        <span
          className="text-white font-black text-3xl sm:text-4xl tracking-wider drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
          style={{ fontFamily: "'Fredoka', 'Nunito', sans-serif" }}
        >
          PLAY
        </span>

        {/* Top Gloss Highlight Sweep */}
        <div className="absolute top-1 left-4 right-4 h-[24px] rounded-full bg-gradient-to-b from-white/35 to-transparent pointer-events-none" />
      </button>
    </div>
  );
};
