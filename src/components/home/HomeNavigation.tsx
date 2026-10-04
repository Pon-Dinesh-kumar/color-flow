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
          className="relative w-14 h-14 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/30 shadow-[0_6px_20px_rgba(0,0,0,0.5)] flex items-center justify-center text-white active:scale-90 hover:bg-slate-800/80 hover:border-white/50 transition-all cursor-pointer group"
          style={{
            boxShadow: '0 6px 18px rgba(0,0,0,0.45), inset 0 1px 2px rgba(255,255,255,0.4)',
          }}
        >
          <Settings className="w-6 h-6 text-white group-hover:rotate-45 transition-transform duration-300 drop-shadow-md" />
          <div className="absolute top-0.5 inset-x-2 h-4 rounded-full bg-white/15 pointer-events-none" />
        </button>
        <span
          className="text-xs font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wider mt-1.5"
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
          className="relative w-14 h-14 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/30 shadow-[0_6px_20px_rgba(0,0,0,0.5)] flex items-center justify-center text-white active:scale-90 hover:bg-slate-800/80 hover:border-white/50 transition-all cursor-pointer group"
          style={{
            boxShadow: '0 6px 18px rgba(0,0,0,0.45), inset 0 1px 2px rgba(255,255,255,0.4)',
          }}
        >
          <BarChart2 className="w-6 h-6 text-white group-hover:scale-110 transition-transform drop-shadow-md" />
          <div className="absolute top-0.5 inset-x-2 h-4 rounded-full bg-white/15 pointer-events-none" />
        </button>
        <span
          className="text-xs font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wider mt-1.5"
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
          className="relative w-14 h-14 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/30 shadow-[0_6px_20px_rgba(0,0,0,0.5)] flex items-center justify-center text-white active:scale-90 hover:bg-slate-800/80 hover:border-white/50 transition-all cursor-pointer group"
          style={{
            boxShadow: '0 6px 18px rgba(0,0,0,0.45), inset 0 1px 2px rgba(255,255,255,0.4)',
          }}
        >
          <Palette className="w-6 h-6 text-white group-hover:scale-110 transition-transform drop-shadow-md" />
          <div className="absolute top-0.5 inset-x-2 h-4 rounded-full bg-white/15 pointer-events-none" />
        </button>
        <span
          className="text-xs font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wider mt-1.5"
          style={{ fontFamily: "'Fredoka', 'Nunito', sans-serif" }}
        >
          Themes
        </span>
      </div>
    </div>
  );
};
