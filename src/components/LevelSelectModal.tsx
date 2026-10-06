import React from 'react';
import { X, Lock, Star } from 'lucide-react';
import { useGameStore } from '../game/gameState';
import { LevelLoader } from '../gameplay/LevelLoader';
import { SaveService } from '../services/SaveService';
import { AudioManager } from '../engine/AudioManager';

import { CloudTransitionManager } from '../transitions/CloudTransitionManager';

export const LevelSelectModal: React.FC = () => {
  const { loadLevel, setShowLevelSelect } = useGameStore();

  const allLevels = LevelLoader.getAllLevels();
  const unlockedLevel = SaveService.getUnlockedLevel();
  const earnedStars = allLevels.reduce(
    (total, level) => total + SaveService.getStarsForLevel(level.number),
    0
  );

  // Levels → Gameplay
  const handleSelectLevel = (levelNum: number) => {
    if (levelNum > unlockedLevel) return;
    AudioManager.playButtonClick();
    CloudTransitionManager.transition({
      from: 'levels',
      to: 'gameplay',
      direction: 'center',
      theme: 'default',
      onPageSwitch: () => {
        loadLevel(levelNum);
        setShowLevelSelect(false);
      },
    });
  };

  // Levels → Home
  const handleClose = () => {
    AudioManager.playButtonClick();
    CloudTransitionManager.transition({
      from: 'levels',
      to: 'home',
      direction: 'center',
      theme: 'default',
      onPageSwitch: () => setShowLevelSelect(false),
    });
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-3 sm:p-4 bg-sky-950/45 backdrop-blur-sm select-none animate-fade-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="levels-title"
        className="w-full max-w-md max-h-[min(86dvh,44rem)] rounded-[2rem] bg-gradient-to-b from-blue-900 via-blue-950 to-indigo-950 border-2 border-sky-200/50 shadow-[0_20px_55px_rgba(4,15,48,0.65),inset_0_2px_5px_rgba(255,255,255,0.18)] flex flex-col overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-4 px-5 sm:px-6 border-b border-sky-100/20 flex items-center justify-between gap-3">
          <div>
            <h3 id="levels-title" className="text-xl font-black text-white tracking-wide drop-shadow-md">Levels</h3>
            <p className="text-sky-100/75 text-xs font-bold mt-0.5">{unlockedLevel} of {allLevels.length} unlocked</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-100/60 bg-gradient-to-b from-amber-300 to-orange-500 px-3 py-1 text-white text-xs font-black shadow-[inset_0_1px_3px_rgba(255,255,255,0.65),0_3px_8px_rgba(0,0,0,0.25)]">
              <Star className="w-3.5 h-3.5 fill-white" />
              {earnedStars}
            </span>
          <button
            onClick={handleClose}
            aria-label="Close levels"
            className="w-9 h-9 rounded-full bg-gradient-to-b from-sky-300/50 to-blue-700/70 hover:brightness-110 text-white flex items-center justify-center cursor-pointer transition-all border border-white/50 shadow-[inset_0_1px_3px_rgba(255,255,255,0.55),0_3px_8px_rgba(0,0,0,0.3)]"
          >
            <X className="w-4 h-4" />
          </button>
          </div>
        </div>

        {/* Levels Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 gap-2.5 sm:gap-3 custom-scrollbar">
          {allLevels.map((lvl) => {
            const isUnlocked = lvl.number <= unlockedLevel;
            const stars = SaveService.getStarsForLevel(lvl.number);
            const isCurrent = lvl.number === unlockedLevel;

            return (
              <button
                key={lvl.id}
                onClick={() => handleSelectLevel(lvl.number)}
                disabled={!isUnlocked}
                aria-label={isUnlocked ? `Play level ${lvl.number}, ${stars} stars` : `Level ${lvl.number} locked`}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-1.5 transition-all relative cursor-pointer border-2 shadow-[0_4px_9px_rgba(0,0,0,0.28),inset_0_2px_3px_rgba(255,255,255,0.45)] ${
                  isUnlocked
                    ? isCurrent
                      ? 'bg-gradient-to-b from-amber-300 via-blue-500 to-blue-700 border-amber-100 shadow-[0_0_0_2px_rgba(255,255,255,0.45),0_5px_12px_rgba(14,165,233,0.35),inset_0_2px_4px_rgba(255,255,255,0.6)] hover:brightness-110 hover:-translate-y-0.5 active:scale-95'
                      : 'bg-gradient-to-b from-blue-400/90 via-blue-600 to-indigo-800 border-sky-100/55 hover:brightness-110 hover:-translate-y-0.5 active:scale-95'
                    : 'bg-gradient-to-b from-slate-700/80 to-slate-900/90 border-slate-400/25 opacity-75 cursor-not-allowed'
                }`}
              >
                {isUnlocked ? (
                  <>
                    <span className="text-white font-black text-xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.35)]">{lvl.number}</span>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${
                            s <= stars ? 'text-amber-300 fill-amber-300 drop-shadow-sm' : 'text-white/35 fill-white/10'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <Lock className="w-5 h-5 text-slate-300/75 drop-shadow-sm" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
