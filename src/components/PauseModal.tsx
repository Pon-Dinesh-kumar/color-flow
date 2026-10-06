import React from 'react';
import { Home, Music, Play, RotateCcw, Volume2, VolumeX, X } from 'lucide-react';
import { AudioManager } from '../engine/AudioManager';
import { useGameStore } from '../game/gameState';
import { CloudTransitionManager } from '../transitions/CloudTransitionManager';

export const PauseModal: React.FC = () => {
  const {
    sfx,
    music,
    toggleSfx,
    toggleMusic,
    togglePause,
    restartLevel,
    setPhase,
    setShowLevelSelect,
  } = useGameStore();

  const handleResume = () => {
    AudioManager.playButtonClick();
    togglePause();
  };

  const handleRestart = () => {
    AudioManager.playButtonClick();
    CloudTransitionManager.transition({
      from: 'paused',
      to: 'gameplay',
      direction: 'center',
      theme: 'default',
      onPageSwitch: restartLevel,
    });
  };

  const handleLevelSelect = () => {
    AudioManager.playButtonClick();
    CloudTransitionManager.transition({
      from: 'paused',
      to: 'levels',
      direction: 'center',
      theme: 'default',
      onPageSwitch: () => {
        togglePause();
        setPhase('menu');
        setShowLevelSelect(true);
      },
    });
  };

  const handleMenu = () => {
    AudioManager.playButtonClick();
    CloudTransitionManager.transition({
      from: 'paused',
      to: 'home',
      direction: 'center',
      theme: 'default',
      onPageSwitch: () => {
        togglePause();
        setPhase('menu');
      },
    });
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-sky-950/55 backdrop-blur-sm select-none animate-fade-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pause-title"
        className="relative w-full max-w-xs overflow-hidden rounded-[2rem] border-2 border-sky-100/55 bg-gradient-to-b from-blue-900 via-blue-950 to-indigo-950 p-5 shadow-[0_20px_55px_rgba(4,15,48,0.7),inset_0_2px_5px_rgba(255,255,255,0.2)]"
      >
        <div className="mb-4 flex items-center justify-between border-b border-sky-100/20 pb-3">
          <h2 id="pause-title" className="text-xl font-black uppercase tracking-wider text-white drop-shadow-md">
            Paused
          </h2>
          <button
            type="button"
            onClick={handleResume}
            aria-label="Resume game"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/50 bg-gradient-to-b from-sky-300/50 to-blue-700/70 text-white shadow-[inset_0_1px_3px_rgba(255,255,255,0.55),0_3px_8px_rgba(0,0,0,0.3)] transition hover:brightness-110 active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4 flex flex-col gap-2">
          <button
            type="button"
            role="switch"
            aria-checked={sfx}
            onClick={() => {
              AudioManager.playButtonClick();
              toggleSfx();
            }}
            className="flex items-center justify-between rounded-2xl border border-white/15 bg-gradient-to-r from-white/10 to-sky-300/5 px-3.5 py-2.5 text-sm font-extrabold text-white"
          >
            <span className="flex items-center gap-2.5">
              {sfx ? <Volume2 className="h-4 w-4 text-emerald-300" /> : <VolumeX className="h-4 w-4 text-rose-300" />}
              Sound Effects
            </span>
            <span className={`h-5 w-9 rounded-full p-0.5 ${sfx ? 'bg-emerald-500' : 'bg-slate-600'}`}>
              <span className={`block h-4 w-4 rounded-full bg-white shadow transition-transform ${sfx ? 'translate-x-4' : ''}`} />
            </span>
          </button>
          <button
            type="button"
            role="switch"
            aria-checked={music}
            onClick={() => {
              AudioManager.playButtonClick();
              toggleMusic();
            }}
            className="flex items-center justify-between rounded-2xl border border-white/15 bg-gradient-to-r from-white/10 to-sky-300/5 px-3.5 py-2.5 text-sm font-extrabold text-white"
          >
            <span className="flex items-center gap-2.5">
              <Music className={`h-4 w-4 ${music ? 'text-violet-300' : 'text-slate-400'}`} />
              Music
            </span>
            <span className={`h-5 w-9 rounded-full p-0.5 ${music ? 'bg-violet-500' : 'bg-slate-600'}`}>
              <span className={`block h-4 w-4 rounded-full bg-white shadow transition-transform ${music ? 'translate-x-4' : ''}`} />
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleResume}
          className="mb-2.5 flex w-full items-center justify-center gap-2 rounded-full border-2 border-white/75 bg-gradient-to-b from-lime-300 via-emerald-400 to-green-600 px-4 py-3 text-sm font-black uppercase tracking-wide text-white shadow-[0_5px_14px_rgba(16,185,129,0.4),inset_0_2px_4px_rgba(255,255,255,0.65)] transition hover:brightness-110 active:scale-95"
        >
          <Play className="h-4 w-4 fill-white" />
          Resume
        </button>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleRestart}
            className="flex items-center justify-center gap-1.5 rounded-2xl border-2 border-white/65 bg-gradient-to-b from-sky-400 via-blue-500 to-blue-700 px-2 py-2.5 text-xs font-extrabold text-white shadow-[0_4px_10px_rgba(16,57,133,0.4),inset_0_2px_4px_rgba(255,255,255,0.5)] transition hover:brightness-110 active:scale-95"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restart
          </button>
          <button
            type="button"
            onClick={handleLevelSelect}
            className="flex items-center justify-center gap-1.5 rounded-2xl border-2 border-white/65 bg-gradient-to-b from-violet-400 via-purple-500 to-purple-700 px-2 py-2.5 text-xs font-extrabold text-white shadow-[0_4px_10px_rgba(76,29,149,0.4),inset_0_2px_4px_rgba(255,255,255,0.5)] transition hover:brightness-110 active:scale-95"
          >
            <span aria-hidden="true">▦</span>
            Levels
          </button>
        </div>
        <button
          type="button"
          onClick={handleMenu}
          className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 py-2 text-xs font-bold text-sky-100 transition hover:bg-white/15 active:scale-95"
        >
          <Home className="h-3.5 w-3.5" />
          Main Menu
        </button>
      </div>
    </div>
  );
};
