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
        className="group relative w-full max-w-[210px] h-[60px] rounded-full flex items-center justify-center gap-2.5 cursor-pointer select-none active:scale-95 transition-transform duration-150 animate-[playBreathe_3.2s_ease-in-out_infinite] border-2 border-white/80"
        style={{
          background: 'linear-gradient(180deg, #6bff83 0%, #18eb4b 45%, #00bd38 100%)',
          boxShadow:
            '0 0 28px rgba(0, 255, 73, 0.6), 0 7px 18px rgba(0, 0, 0, 0.42), inset 0 3px 6px rgba(255, 255, 255, 0.9), inset 0 -4px 7px rgba(0, 128, 44, 0.62)',
          borderTop: '2px solid rgba(255, 255, 255, 0.85)',
        }}
      >
        {/* Play Icon */}
        <Play
          className="w-6 h-6 text-white fill-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] group-hover:scale-110 transition-transform"
        />

        {/* Play Text */}
        <span
          className="text-white font-black text-2xl sm:text-3xl tracking-wider drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
          style={{ fontFamily: "'Fredoka', 'Nunito', sans-serif" }}
        >
          PLAY
        </span>

        {/* Top Gloss Highlight Sweep */}
        <div className="absolute top-1 left-4 right-4 h-[22px] rounded-full bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
      </button>
    </div>
  );
};
