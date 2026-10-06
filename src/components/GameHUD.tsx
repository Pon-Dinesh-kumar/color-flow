import React from 'react';
import { Home, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useGameStore } from '../game/gameState';
import { AudioManager } from '../engine/AudioManager';
import { CloudTransitionManager } from '../transitions/CloudTransitionManager';
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
    setPhase,
    sfx,
    toggleSfx,
    restartLevel,
  } = useGameStore();

  const targetList = Object.values(targets);

  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-3 md:p-5 select-none pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.9rem,env(safe-area-inset-bottom))]">
      {/* Top Header Navigation Row */}
      <div className="flex w-full items-start justify-between gap-2">
        {/* Left: Home Button and Level */}
        <div className="flex items-start gap-2 pointer-events-auto">
          <GameButton
            onClick={() => {
              AudioManager.playButtonClick();
              CloudTransitionManager.transition({
                from: 'gameplay',
                to: 'home',
                direction: 'center',
                theme: 'default',
                onPageSwitch: () => setPhase('menu'),
              });
            }}
            title="Return to Menu"
          >
            <Home className="w-6 h-6" />
          </GameButton>

          <LevelPill levelNumber={currentLevelNumber} />
        </div>

        {/* Right: Sound & Retry Buttons */}
        <div className="flex items-center justify-end gap-1.5 pointer-events-auto">
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
              CloudTransitionManager.transition({
                from: 'gameplay',
                to: 'gameplay',
                direction: 'center',
                theme: 'default',
                onPageSwitch: restartLevel,
              });
            }}
            title="Retry Level"
          >
            <RotateCcw className="w-4 h-4" />
          </GameButton>

        </div>
      </div>

      {/* Bottom Floating Status Section */}
      <div className="w-full flex items-center justify-center flex-wrap gap-2 pointer-events-auto mb-1">
        <MovesChip movesUsed={movesUsed} maxMoves={currentLevel?.maxMoves} />
        <div className="flex items-center justify-center flex-wrap gap-2 max-w-full">
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
