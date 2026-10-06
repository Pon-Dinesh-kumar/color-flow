import React from 'react';
import { ArrowLeft, Home, RotateCcw, X } from 'lucide-react';
import { AudioManager } from '../engine/AudioManager';
import { useGameStore } from '../game/gameState';
import { CloudTransitionManager } from '../transitions/CloudTransitionManager';

export const LevelFailedModal: React.FC = () => {
  const {
    currentLevelNumber,
    currentLevel,
    movesUsed,
    restartLevel,
    setPhase,
    setShowLevelSelect,
  } = useGameStore();

  const handleRetry = () => {
    AudioManager.playButtonClick();
    CloudTransitionManager.transition({
      from: 'failed',
      to: 'gameplay',
      direction: 'center',
      theme: 'default',
      onPageSwitch: restartLevel,
    });
  };

  const handleLevelSelect = () => {
    AudioManager.playButtonClick();
    CloudTransitionManager.transition({
      from: 'failed',
      to: 'levels',
      direction: 'center',
      theme: 'default',
      onPageSwitch: () => {
        setPhase('menu');
        setShowLevelSelect(true);
      },
    });
  };

  const handleMenu = () => {
    AudioManager.playButtonClick();
    CloudTransitionManager.transition({
      from: 'failed',
      to: 'home',
      direction: 'center',
      theme: 'default',
      onPageSwitch: () => setPhase('menu'),
    });
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-blue-950/35 backdrop-blur-[2px] select-none animate-fade-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="failed-title"
        className="relative w-full max-w-xs overflow-hidden rounded-[2rem] border-[3px] border-rose-100/75 bg-gradient-to-b from-sky-500 via-blue-700 to-indigo-900 p-5 text-center shadow-[0_20px_55px_rgba(4,15,48,0.58),inset_0_3px_6px_rgba(255,255,255,0.4)]"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-rose-500/20 blur-2xl" />
        <div className="relative mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/80 bg-gradient-to-b from-rose-400 to-red-700 text-white shadow-[0_6px_16px_rgba(220,38,38,0.45),inset_0_2px_4px_rgba(255,255,255,0.55)]">
          <X className="h-7 w-7" strokeWidth={3} />
        </div>
        <p className="mx-auto w-fit rounded-full border border-white/50 bg-white/15 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-rose-50">
          Level {currentLevelNumber}
        </p>
        <h2 id="failed-title" className="mt-1 text-2xl font-black uppercase tracking-wide text-white drop-shadow-md">
          Level Failed
        </h2>
        <p className="mt-1 text-sm font-bold text-amber-100">Out of moves</p>

        <div className="my-4 flex items-center justify-center gap-2 rounded-2xl border border-white/35 bg-gradient-to-r from-white/20 to-sky-200/10 px-4 py-2.5 text-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.18)]">
          <span className="text-xs font-extrabold uppercase tracking-wide text-sky-100/75">Moves</span>
          <span className="text-base font-black">{movesUsed} / {currentLevel?.maxMoves ?? '—'}</span>
        </div>

        <button
          type="button"
          onClick={handleRetry}
          className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-white/75 bg-gradient-to-b from-lime-300 via-emerald-400 to-green-600 px-4 py-3 text-sm font-black uppercase tracking-wide text-white shadow-[0_5px_14px_rgba(16,185,129,0.4),inset_0_2px_4px_rgba(255,255,255,0.65)] transition hover:brightness-110 active:scale-95"
        >
          <RotateCcw className="h-4 w-4" />
          Retry
        </button>
        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleLevelSelect}
            className="flex items-center justify-center gap-1.5 rounded-2xl border-2 border-white/65 bg-gradient-to-b from-sky-400 via-blue-500 to-blue-700 px-2 py-2.5 text-xs font-extrabold text-white shadow-[0_4px_10px_rgba(16,57,133,0.4),inset_0_2px_4px_rgba(255,255,255,0.5)] transition hover:brightness-110 active:scale-95"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Levels
          </button>
          <button
            type="button"
            onClick={handleMenu}
            className="flex items-center justify-center gap-1.5 rounded-2xl border-2 border-white/65 bg-gradient-to-b from-violet-400 via-purple-500 to-purple-700 px-2 py-2.5 text-xs font-extrabold text-white shadow-[0_4px_10px_rgba(76,29,149,0.4),inset_0_2px_4px_rgba(255,255,255,0.5)] transition hover:brightness-110 active:scale-95"
          >
            <Home className="h-3.5 w-3.5" />
            Menu
          </button>
        </div>
      </div>
    </div>
  );
};
