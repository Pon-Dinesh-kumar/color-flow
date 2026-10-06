import React from 'react';
import { X, Check } from 'lucide-react';
import { AudioManager } from '../engine/AudioManager';
import { CloudTransitionManager } from '../transitions/CloudTransitionManager';
import { useGameStore } from '../game/gameState';

interface ThemesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemesModal: React.FC<ThemesModalProps> = ({ isOpen, onClose }) => {
  const backgroundUrl = useGameStore((state) => state.backgroundUrl);
  if (!isOpen) return null;

  const handleClose = () => {
    AudioManager.playButtonClick();
    CloudTransitionManager.transition({
      from: 'themes',
      to: 'home',
      direction: 'center',
      theme: 'default',
      onPageSwitch: onClose,
    });
  };

  const themes = [
    { id: 'city_sunset', name: 'Default', desc: 'Color Flow City', active: true, available: true, color: 'from-sky-400 to-amber-300', tint: 'rgba(8,29,73,0.08)' },
    { id: 'golden_sunset', name: 'Sunset', desc: 'Coming soon', active: false, available: false, color: 'from-orange-400 to-rose-500', tint: 'rgba(249,115,22,0.28)' },
    { id: 'neon_night', name: 'Night', desc: 'Coming soon', active: false, available: false, color: 'from-violet-500 to-indigo-950', tint: 'rgba(76,29,149,0.42)' },
    { id: 'forest', name: 'Forest', desc: 'Coming soon', active: false, available: false, color: 'from-emerald-400 to-teal-800', tint: 'rgba(5,150,105,0.34)' },
  ];

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-3 sm:p-4 bg-sky-950/45 backdrop-blur-sm select-none animate-fade-in pointer-events-auto">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="themes-title"
        className="w-full max-w-sm rounded-[2rem] bg-gradient-to-b from-blue-900 via-blue-950 to-indigo-950 border-2 border-sky-200/50 shadow-[0_20px_55px_rgba(4,15,48,0.65),inset_0_2px_5px_rgba(255,255,255,0.18)] p-5 sm:p-6 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-sky-100/20 mb-4">
          <div>
            <h3 id="themes-title" className="text-xl font-black text-white drop-shadow-md" style={{ fontFamily: "'Fredoka', sans-serif" }}>
            Themes
            </h3>
            <p className="text-sky-100/70 text-xs font-bold mt-0.5">Pick your play world</p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close themes"
            className="w-9 h-9 rounded-full bg-gradient-to-b from-sky-300/50 to-blue-700/70 hover:brightness-110 text-white flex items-center justify-center cursor-pointer transition-all border border-white/50 shadow-[inset_0_1px_3px_rgba(255,255,255,0.55),0_3px_8px_rgba(0,0,0,0.3)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Theme List */}
        <div className="grid grid-cols-2 gap-3">
          {themes.map((theme) => (
            <div
              key={theme.id}
              aria-label={`${theme.name} theme${theme.available ? ', selected' : ', coming soon'}`}
              className={`min-w-0 overflow-hidden rounded-2xl border-2 text-left transition-all relative ${
                theme.active
                  ? 'border-emerald-200 shadow-[0_4px_14px_rgba(16,185,129,0.28)]'
                  : 'border-white/20 opacity-75'
              }`}
            >
              <div
                className={`relative h-24 w-full bg-gradient-to-br ${theme.color}`}
                style={{
                  backgroundImage: `linear-gradient(180deg, ${theme.tint}, ${theme.tint}), url(${backgroundUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center 52%',
                }}
              >
                {theme.active ? (
                  <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border border-white/80 bg-emerald-500 text-white shadow-md">
                    <Check className="h-4 w-4" />
                  </span>
                ) : (
                  <span className="absolute right-2 top-2 rounded-full border border-white/40 bg-indigo-950/65 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-white">
                    Soon
                  </span>
                )}
                <span className="absolute inset-x-2 top-1 h-1/3 rounded-full bg-gradient-to-b from-white/35 to-transparent" />
              </div>
              <div className="flex items-center justify-between gap-1 bg-gradient-to-b from-blue-800 to-indigo-950 px-3 py-2.5">
                <div className="min-w-0">
                  <h4 className="truncate text-white font-extrabold text-sm">{theme.name}</h4>
                  <p className="truncate text-sky-100/65 text-[10px] font-semibold">{theme.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
