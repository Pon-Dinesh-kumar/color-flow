import React from 'react';
import { X, Volume2, VolumeX, Music, Trash2 } from 'lucide-react';
import { useGameStore } from '../game/gameState';
import { AudioManager } from '../engine/AudioManager';
import { CloudTransitionManager } from '../transitions/CloudTransitionManager';

export const SettingsModal: React.FC = () => {
  const {
    sfx,
    music,
    toggleSfx,
    toggleMusic,
    resetProgress,
    setShowSettings,
  } = useGameStore();

  const handleClose = () => {
    AudioManager.playButtonClick();
    CloudTransitionManager.transition({
      from: 'settings',
      to: 'home',
      direction: 'center',
      theme: 'default',
      onPageSwitch: () => setShowSettings(false),
    });
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all game progress?')) {
      AudioManager.playButtonClick();
      resetProgress();
      handleClose();
    }
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-sky-950/45 backdrop-blur-sm select-none animate-fade-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="w-full max-w-sm rounded-[2rem] bg-gradient-to-b from-blue-900 via-blue-950 to-indigo-950 border-2 border-sky-200/50 shadow-[0_20px_55px_rgba(4,15,48,0.65),inset_0_2px_5px_rgba(255,255,255,0.18)] p-5 sm:p-6 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-sky-100/20 mb-4">
          <h3 id="settings-title" className="text-xl font-black text-white drop-shadow-md">Settings</h3>
          <button
            onClick={handleClose}
            aria-label="Close settings"
            className="w-9 h-9 rounded-full bg-gradient-to-b from-sky-300/50 to-blue-700/70 hover:brightness-110 text-white flex items-center justify-center cursor-pointer transition-all border border-white/50 shadow-[inset_0_1px_3px_rgba(255,255,255,0.55),0_3px_8px_rgba(0,0,0,0.3)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-3">
          {/* SFX Toggle */}
          <div className="flex items-center justify-between py-3 px-3.5 rounded-2xl bg-gradient-to-r from-white/10 to-sky-300/5 border border-white/15 shadow-[inset_0_1px_3px_rgba(255,255,255,0.12)]">
            <div className="flex items-center gap-3 text-white">
              {sfx ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-red-400" />}
              <span className="font-extrabold text-sm">Sound Effects</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={sfx}
              aria-label="Sound Effects"
              onClick={() => {
                AudioManager.playButtonClick();
                toggleSfx();
              }}
              className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer border border-white/30 shadow-inner ${
                sfx ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-gradient-to-b from-white to-slate-200 border border-white shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-transform ${
                  sfx ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Music Toggle */}
          <div className="flex items-center justify-between py-3 px-3.5 rounded-2xl bg-gradient-to-r from-white/10 to-sky-300/5 border border-white/15 shadow-[inset_0_1px_3px_rgba(255,255,255,0.12)]">
            <div className="flex items-center gap-3 text-white">
              <Music className={`w-5 h-5 ${music ? 'text-indigo-400' : 'text-slate-500'}`} />
              <span className="font-extrabold text-sm">Background Music</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={music}
              aria-label="Background Music"
              onClick={() => {
                AudioManager.playButtonClick();
                toggleMusic();
              }}
              className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer border border-white/30 shadow-inner ${
                music ? 'bg-indigo-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-gradient-to-b from-white to-slate-200 border border-white shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-transform ${
                  music ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Reset progress */}
          <div className="pt-4 mt-1 border-t border-sky-100/20 flex justify-between items-center gap-3">
            <div>
              <p className="text-white font-bold text-sm">Reset Progress</p>
              <p className="text-sky-100/65 text-xs">Clear all levels and stars</p>
            </div>
            <button
              onClick={handleReset}
              className="py-2.5 px-3.5 rounded-xl bg-gradient-to-b from-rose-400 to-red-700 hover:brightness-110 text-white font-extrabold text-xs flex items-center gap-1.5 border border-white/50 shadow-[0_4px_10px_rgba(127,29,29,0.35),inset_0_1px_3px_rgba(255,255,255,0.45)] cursor-pointer active:scale-95 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
