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
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs select-none transition-opacity duration-300">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900/85 backdrop-blur-xl border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.7)] p-6 md:p-8 flex flex-col items-center text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Glow backdrop */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

        <span className="text-amber-400 font-black uppercase tracking-widest text-xs mb-1">
          Level {currentLevelNumber} Cleared
        </span>

        <h2 className="text-3xl md:text-4xl font-black text-white tracking-wider drop-shadow-md">
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

        <p className="text-emerald-400 font-extrabold text-sm tracking-wider uppercase mb-4">
          ✨ Perfect Flow! ✨
        </p>

        {/* Moves Summary */}
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 px-4 mb-5 flex items-center justify-around text-white">
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
        <div className="w-full flex flex-col gap-3">
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
            className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-400 hover:to-green-500 active:scale-95 transition-all text-white font-black text-lg tracking-wider shadow-[0_8px_24px_rgba(16,185,129,0.5)] border-t border-white/40 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-6 h-6 fill-white" />
            NEXT LEVEL →
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
              className="flex-1 py-3 px-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700/90 active:scale-95 transition-all text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer border border-white/15 shadow-md"
            >
              <RotateCcw className="w-4 h-4" />
              Replay
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
              className="flex-1 py-3 px-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700/90 active:scale-95 transition-all text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer border border-white/15 shadow-md"
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
