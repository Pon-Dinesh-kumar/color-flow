import React from 'react';
import { X, Check } from 'lucide-react';
import { AudioManager } from '../engine/AudioManager';

interface ThemesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemesModal: React.FC<ThemesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const themes = [
    { id: 'city_sunset', name: 'Golden Skyline', desc: 'Sunny metropolis at sunset (Default)', active: true, color: 'from-amber-400 to-rose-500' },
    { id: 'neon_cyber', name: 'Cyber Neon', desc: 'Deep violet neon glow', active: false, color: 'from-cyan-400 to-indigo-600' },
    { id: 'pastel_candy', name: 'Candy Valley', desc: 'Soft pastel bubblegum realm', active: false, color: 'from-pink-400 to-purple-400' },
  ];

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md select-none animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-white/20 shadow-2xl p-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <h3 className="text-xl font-black text-white" style={{ fontFamily: "'Fredoka', sans-serif" }}>
            Themes
          </h3>
          <button
            onClick={() => {
              AudioManager.playButtonClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Theme List */}
        <div className="flex flex-col gap-3">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                theme.active
                  ? 'bg-white/15 border-emerald-400/80 shadow-md'
                  : 'bg-white/5 border-white/10 opacity-75'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${theme.color} shadow-inner flex items-center justify-center text-white text-xs font-black`}>
                  🎨
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">{theme.name}</h4>
                  <p className="text-white/60 text-xs">{theme.desc}</p>
                </div>
              </div>

              {theme.active && (
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
