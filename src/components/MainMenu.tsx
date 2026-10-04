import React from 'react';
import { Play, Settings, Grid3X3, Wrench, Volume2, VolumeX } from 'lucide-react';
import { useGameStore } from '../game/gameState';
import { AudioManager } from '../engine/AudioManager';
import { GameButton } from './common/GameButton';

export const MainMenu: React.FC = () => {
  const {
    loadLevel,
    currentLevelNumber,
    sfx,
    toggleSfx,
    setShowLevelSelect,
    setShowSettings,
    setShowEditor,
  } = useGameStore();

  const handlePlay = () => {
    AudioManager.playButtonClick();
    loadLevel(currentLevelNumber);
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-between p-6 pointer-events-auto bg-slate-950/40 backdrop-blur-xs select-none pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      {/* Brand Header */}
      <div className="flex flex-col items-center mt-6">
        <h1 className="text-6xl md:text-7xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-blue-500 drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)]">
          COLOR
        </h1>
        <h2 className="text-5xl md:text-6xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 -mt-2 drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)]">
          FLOW
        </h2>
        <p className="mt-2 text-white/90 font-extrabold tracking-widest uppercase text-xs md:text-sm drop-shadow-md">
          Connect • Rotate • Flow
        </p>
      </div>

      {/* Decorative centerpiece */}
      <div className="relative my-auto flex items-center justify-center">
        <div className="w-56 h-56 md:w-64 md:h-64 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/20 shadow-[0_16px_40px_rgba(0,0,0,0.5)] flex items-center justify-center p-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-blue-500/25 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-red-500/25 rounded-full blur-2xl pointer-events-none" />

          {/* Floating animated spheres */}
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-500/50 absolute top-4 left-6 animate-bounce" style={{ animationDuration: '2.4s' }} />
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/50 absolute bottom-4 right-6 animate-bounce" style={{ animationDuration: '3.1s' }} />
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-lg shadow-amber-400/50 absolute top-6 right-8 animate-bounce" style={{ animationDuration: '2.8s' }} />
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/50 absolute bottom-6 left-8 animate-bounce" style={{ animationDuration: '2.2s' }} />

            {/* Central translucent pipe emblem */}
            <div className="w-24 h-24 rounded-2xl bg-white/10 border-2 border-white/40 flex items-center justify-center shadow-inner">
              <div className="w-14 h-7 rounded-full border-4 border-white/80 bg-cyan-400/30" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Play Action & Navigation */}
      <div className="w-full max-w-sm flex flex-col items-center gap-6 mb-4">
        <button
          onClick={handlePlay}
          className="w-full py-4 px-8 rounded-full bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 active:scale-95 transition-all text-white font-black text-2xl tracking-wider shadow-[0_10px_30px_rgba(16,185,129,0.5)] border-t-2 border-white/40 flex items-center justify-center gap-3 cursor-pointer"
        >
          <Play className="w-8 h-8 fill-white" />
          PLAY
        </button>

        {/* Options Row */}
        <div className="flex items-center justify-around w-full px-2 text-white">
          <div className="flex flex-col items-center gap-1">
            <GameButton
              onClick={() => {
                AudioManager.playButtonClick();
                setShowSettings(true);
              }}
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </GameButton>
            <span className="text-[11px] font-bold text-white/80">Settings</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <GameButton
              onClick={() => {
                AudioManager.playButtonClick();
                setShowLevelSelect(true);
              }}
              title="Levels"
            >
              <Grid3X3 className="w-5 h-5" />
            </GameButton>
            <span className="text-[11px] font-bold text-white/80">Levels</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <GameButton
              onClick={() => {
                AudioManager.playButtonClick();
                setShowEditor(true);
              }}
              title="Editor"
            >
              <Wrench className="w-5 h-5" />
            </GameButton>
            <span className="text-[11px] font-bold text-white/80">Editor</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <GameButton
              onClick={() => {
                AudioManager.playButtonClick();
                toggleSfx();
              }}
              title={sfx ? 'Mute' : 'Unmute'}
            >
              {sfx ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-red-400" />}
            </GameButton>
            <span className="text-[11px] font-bold text-white/80">{sfx ? 'Sound On' : 'Muted'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
