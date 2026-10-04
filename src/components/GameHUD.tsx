import React from 'react';
import { RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';
import { useGameStore } from '../game/gameState';
import { AudioManager } from '../engine/AudioManager';
import { GameButton } from './common/GameButton';
import { LevelPill } from './common/LevelPill';
import { MovesChip } from './common/MovesChip';
import { ObjectiveChip } from './common/ObjectiveChip';

export const GameHUD: React.FC = () => {
  const {
    currentLevelNumber,
    currentLevel,
    targets,
    movesUsed,
    restartLevel,
    setPhase,
    sfx,
    toggleSfx,
  } = useGameStore();

  const targetList = Object.values(targets);

  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-4 md:p-6 select-none pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.2rem,env(safe-area-inset-bottom))]">
      {/* Top Header Navigation Row */}
      <div className="w-full flex items-center justify-between">
        {/* Left: Home Button */}
        <div className="pointer-events-auto">
          <GameButton
            onClick={() => {
              AudioManager.playButtonClick();
              setPhase('menu');
            }}
            title="Return to Menu"
          >
            <Home className="w-6 h-6" />
          </GameButton>
        </div>

        {/* Center: Large Floating Level Pill */}
        <LevelPill
          levelNumber={currentLevelNumber}
          title={currentLevel?.title}
        />

        {/* Right: Sound & Restart Buttons */}
        <div className="flex items-center gap-2.5 pointer-events-auto">
          <GameButton
            onClick={() => {
              AudioManager.playButtonClick();
              toggleSfx();
            }}
            title="Toggle Sound"
          >
            {sfx ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-red-400" />}
          </GameButton>

          <GameButton
            onClick={() => {
              AudioManager.playButtonClick();
              restartLevel();
            }}
            title="Restart Level"
          >
            <RotateCcw className="w-5 h-5" />
          </GameButton>
        </div>
      </div>

      {/* Bottom Floating Status Section */}
      <div className="w-full flex flex-col items-center gap-2.5 pointer-events-auto mb-2">
        {/* Moves Indicator */}
        <MovesChip movesUsed={movesUsed} maxMoves={currentLevel?.maxMoves} />

        {/* Color Objectives Row */}
        <div className="flex items-center justify-center flex-wrap gap-3 max-w-lg">
          {targetList.map((target) => (
            <ObjectiveChip
              key={target.id}
              color={target.color}
              current={target.current}
              required={target.required}
              isComplete={target.isComplete}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
