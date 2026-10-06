import React, { useEffect, useState } from 'react';
import { Star, Play, RotateCcw, Home } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGameStore } from '../game/gameState';
import { AudioManager } from '../engine/AudioManager';
import { CloudTransitionManager } from '../transitions/CloudTransitionManager';

export const LevelCompleteModal: React.FC = () => {
  const {
    currentLevelNumber,
    movesUsed,
    starsEarned,
    nextLevel,
    restartLevel,
    setPhase,
  } = useGameStore();

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 500ms delay to let the player admire the 3D board celebration & particle burst first!
    const timer = setTimeout(() => {
      setVisible(true);

      // Fire celebratory confetti bursts
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#a855f7'],
      });
    }, 550);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-blue-950/30 backdrop-blur-[2px] select-none transition-opacity duration-300">
      <div className="w-full max-w-sm rounded-[2rem] bg-gradient-to-b from-sky-500/95 via-blue-700/95 to-indigo-900/95 backdrop-blur-xl border-[3px] border-amber-100/85 shadow-[0_18px_48px_rgba(5,20,70,0.55),inset_0_3px_6px_rgba(255,255,255,0.45)] p-5 md:p-7 flex flex-col items-center text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Glow backdrop */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

        <span className="rounded-full border border-amber-100/60 bg-gradient-to-b from-amber-300 to-orange-500 px-3 py-1 text-white font-black uppercase tracking-widest text-xs mb-2 shadow-[inset_0_1px_3px_rgba(255,255,255,0.65),0_3px_8px_rgba(0,0,0,0.2)]">
          Level {currentLevelNumber} Cleared
        </span>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-[0.02em] leading-tight drop-shadow-md">
          LEVEL COMPLETE
        </h2>

        {/* 3 Stars Container */}
        <div className="flex items-center justify-center gap-3 my-4">
          {[1, 2, 3].map((starIdx) => {
            const isEarned = starIdx <= (starsEarned || 3);
            return (
              <div
                key={starIdx}
                className={`transform transition-all duration-300 ${
                  isEarned
                    ? 'text-amber-400 scale-110 drop-shadow-[0_0_14px_rgba(245,158,11,0.85)] animate-bounce'
                    : 'text-slate-600 scale-95'
                }`}
                style={{ animationDelay: `${starIdx * 120}ms`, animationDuration: '1.2s' }}
              >
                <Star
                  className={`w-12 h-12 ${isEarned ? 'fill-amber-400' : 'fill-slate-700/50'}`}
                />
              </div>
            );
          })}
        </div>

        <p className="text-lime-200 font-extrabold text-sm tracking-wider uppercase mb-4 drop-shadow-[0_2px_5px_rgba(0,0,0,0.45)]">
          ✨ Perfect Flow! ✨
        </p>

        {/* Moves Summary */}
        <div className="w-full bg-gradient-to-r from-white/15 to-sky-200/10 border border-white/30 rounded-2xl py-2.5 px-4 mb-5 flex items-center justify-around text-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.14)]">
          <div className="flex flex-col items-center">
            <span className="text-xs text-white/60 font-semibold uppercase">Total Moves</span>
            <span className="text-xl font-black text-white">{movesUsed}</span>
          </div>
          <div className="w-px h-7 bg-white/15" />
          <div className="flex flex-col items-center">
            <span className="text-xs text-white/60 font-semibold uppercase">Performance</span>
            <span className="text-xl font-black text-amber-400">
              {starsEarned === 3 ? '3 Stars' : starsEarned === 2 ? '2 Stars' : '1 Star'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={() => {
              AudioManager.playButtonClick();
              CloudTransitionManager.transition({
                from: 'completed',
                to: 'gameplay',
                direction: 'center',
                theme: 'default',
                onPageSwitch: () => nextLevel(),
              });
            }}
            className="w-full py-3 px-5 rounded-full bg-gradient-to-b from-lime-300 via-emerald-400 to-green-600 hover:brightness-110 active:scale-95 transition-all text-white font-black text-base tracking-wider shadow-[0_6px_16px_rgba(16,185,129,0.45),inset_0_2px_4px_rgba(255,255,255,0.65),inset_0_-3px_5px_rgba(21,128,61,0.45)] border-2 border-white/70 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-6 h-6 fill-white" />
            NEXT LEVEL
          </button>

          <div className="flex items-center gap-3 w-full">
            <button
              onClick={() => {
                AudioManager.playButtonClick();
                CloudTransitionManager.transition({
                  from: 'completed',
                  to: 'gameplay',
                  direction: 'center',
                  theme: 'default',
                  onPageSwitch: () => restartLevel(),
                });
              }}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-b from-sky-400 via-blue-500 to-blue-700 hover:brightness-110 active:scale-95 transition-all text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer border-2 border-white/70 shadow-[0_4px_10px_rgba(16,57,133,0.4),inset_0_2px_4px_rgba(255,255,255,0.55)]"
            >
              <RotateCcw className="w-4 h-4" />
              Retry
            </button>

            <button
              onClick={() => {
                AudioManager.playButtonClick();
                CloudTransitionManager.transition({
                  from: 'completed',
                  to: 'home',
                  direction: 'center',
                  theme: 'default',
                  onPageSwitch: () => setPhase('menu'),
                });
              }}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-b from-violet-400 via-purple-500 to-purple-700 hover:brightness-110 active:scale-95 transition-all text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer border-2 border-white/70 shadow-[0_4px_10px_rgba(76,29,149,0.4),inset_0_2px_4px_rgba(255,255,255,0.55)]"
            >
              <Home className="w-4 h-4" />
              Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
