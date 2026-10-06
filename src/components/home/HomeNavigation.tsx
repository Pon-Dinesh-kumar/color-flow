import React from 'react';
import { Settings, BarChart2, Palette } from 'lucide-react';
import { AudioManager } from '../../engine/AudioManager';

interface HomeNavigationProps {
  onOpenSettings: () => void;
  onOpenLevels: () => void;
  onOpenThemes: () => void;
}

export const HomeNavigation: React.FC<HomeNavigationProps> = ({
  onOpenSettings,
  onOpenLevels,
  onOpenThemes,
}) => {
  return (
    <div className="flex items-center justify-around w-full max-w-xs px-4 select-none pb-[max(1rem,env(safe-area-inset-bottom))]">
      {/* 1. Settings */}
      <div className="flex flex-col items-center">
        <button
          onClick={() => {
            AudioManager.playButtonClick();
            onOpenSettings();
          }}
          aria-label="Settings"
          className="relative w-11 h-11 rounded-full backdrop-blur-md border flex items-center justify-center text-white active:scale-90 transition-all cursor-pointer group"
          style={{
            background: 'linear-gradient(145deg, rgba(191,219,254,0.68), rgba(59,130,246,0.38) 52%, rgba(30,64,175,0.5))',
            borderColor: 'rgba(255,255,255,0.72)',
            boxShadow: '0 8px 24px rgba(19,53,130,0.32), inset 0 2px 5px rgba(255,255,255,0.78), inset 0 -4px 10px rgba(37,99,235,0.38)',
          }}
        >
          <Settings className="w-5 h-5 text-white group-hover:rotate-45 transition-transform duration-300 drop-shadow-md" />
          <div className="absolute top-0.5 inset-x-2 h-3 rounded-full bg-white/15 pointer-events-none" />
        </button>
        <span
          className="text-[10px] font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wider mt-1"
          style={{ fontFamily: "'Fredoka', 'Nunito', sans-serif" }}
        >
          Settings
        </span>
      </div>

      {/* 2. Levels */}
      <div className="flex flex-col items-center">
        <button
          onClick={() => {
            AudioManager.playButtonClick();
            onOpenLevels();
          }}
          aria-label="Levels"
          className="relative w-11 h-11 rounded-full backdrop-blur-md border flex items-center justify-center text-white active:scale-90 transition-all cursor-pointer group"
          style={{
            background: 'linear-gradient(145deg, rgba(191,219,254,0.68), rgba(59,130,246,0.38) 52%, rgba(30,64,175,0.5))',
            borderColor: 'rgba(255,255,255,0.72)',
            boxShadow: '0 8px 24px rgba(19,53,130,0.32), inset 0 2px 5px rgba(255,255,255,0.78), inset 0 -4px 10px rgba(37,99,235,0.38)',
          }}
        >
          <BarChart2 className="w-5 h-5 text-white group-hover:scale-110 transition-transform drop-shadow-md" />
          <div className="absolute top-0.5 inset-x-2 h-3 rounded-full bg-white/15 pointer-events-none" />
        </button>
        <span
          className="text-[10px] font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wider mt-1"
          style={{ fontFamily: "'Fredoka', 'Nunito', sans-serif" }}
        >
          Levels
        </span>
      </div>

      {/* 3. Themes */}
      <div className="flex flex-col items-center">
        <button
          onClick={() => {
            AudioManager.playButtonClick();
            onOpenThemes();
          }}
          aria-label="Themes"
          className="relative w-11 h-11 rounded-full backdrop-blur-md border flex items-center justify-center text-white active:scale-90 transition-all cursor-pointer group"
          style={{
            background: 'linear-gradient(145deg, rgba(191,219,254,0.68), rgba(59,130,246,0.38) 52%, rgba(30,64,175,0.5))',
            borderColor: 'rgba(255,255,255,0.72)',
            boxShadow: '0 8px 24px rgba(19,53,130,0.32), inset 0 2px 5px rgba(255,255,255,0.78), inset 0 -4px 10px rgba(37,99,235,0.38)',
          }}
        >
          <Palette className="w-5 h-5 text-white group-hover:scale-110 transition-transform drop-shadow-md" />
          <div className="absolute top-0.5 inset-x-2 h-3 rounded-full bg-white/15 pointer-events-none" />
        </button>
        <span
          className="text-[10px] font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wider mt-1"
          style={{ fontFamily: "'Fredoka', 'Nunito', sans-serif" }}
        >
          Themes
        </span>
      </div>
    </div>
  );
};
