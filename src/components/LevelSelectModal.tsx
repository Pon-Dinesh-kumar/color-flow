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
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md select-none animate-fade-in">
      <div className="w-full max-w-md max-h-[85vh] rounded-3xl bg-slate-900 border-2 border-white/20 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-xl font-black text-white tracking-wide">Select Level</h3>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Levels Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-5 gap-3.5 custom-scrollbar">
          {allLevels.map((lvl) => {
            const isUnlocked = lvl.number <= unlockedLevel;
            const stars = SaveService.getStarsForLevel(lvl.number);

            return (
              <button
                key={lvl.id}
                onClick={() => handleSelectLevel(lvl.number)}
                disabled={!isUnlocked}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-1.5 transition-all relative cursor-pointer border ${
                  isUnlocked
                    ? 'bg-gradient-to-b from-slate-700 to-slate-800 border-white/20 hover:border-amber-400 hover:scale-105 active:scale-95 shadow-md shadow-black/40'
                    : 'bg-slate-900/60 border-white/5 opacity-50 cursor-not-allowed'
                }`}
              >
                {isUnlocked ? (
                  <>
                    <span className="text-white font-black text-lg">{lvl.number}</span>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`w-2.5 h-2.5 ${
                            s <= stars ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <Lock className="w-5 h-5 text-slate-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
