import React from 'react';
import { X, Volume2, VolumeX, Music, Trash2 } from 'lucide-react';
import { useGameStore } from '../game/gameState';
import { AudioManager } from '../engine/AudioManager';

export const SettingsModal: React.FC = () => {
  const {
    sfx,
    music,
    toggleSfx,
    toggleMusic,
    resetProgress,
    setShowSettings,
  } = useGameStore();

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all game progress?')) {
      AudioManager.playButtonClick();
      resetProgress();
      setShowSettings(false);
    }
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md select-none animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-white/20 shadow-2xl p-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <h3 className="text-xl font-black text-white">Settings</h3>
          <button
            onClick={() => {
              AudioManager.playButtonClick();
              setShowSettings(false);
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-4">
          {/* SFX Toggle */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3 text-white">
              {sfx ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-red-400" />}
              <span className="font-bold text-sm">Sound Effects</span>
            </div>
            <button
              onClick={() => {
                AudioManager.playButtonClick();
                toggleSfx();
              }}
              className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer ${
                sfx ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white transition-transform ${
                  sfx ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Music Toggle */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3 text-white">
              <Music className={`w-5 h-5 ${music ? 'text-indigo-400' : 'text-slate-500'}`} />
              <span className="font-bold text-sm">Background Music</span>
            </div>
            <button
              onClick={() => {
                AudioManager.playButtonClick();
                toggleMusic();
              }}
              className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer ${
                music ? 'bg-indigo-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white transition-transform ${
                  music ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Reset progress */}
          <div className="pt-3 border-t border-white/10 flex justify-between items-center">
            <div>
              <p className="text-white font-bold text-sm">Reset Progress</p>
              <p className="text-white/50 text-xs">Clear all levels and stars</p>
            </div>
            <button
              onClick={handleReset}
              className="py-2 px-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold text-xs flex items-center gap-1.5 border border-red-500/30 cursor-pointer active:scale-95 transition-all"
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
