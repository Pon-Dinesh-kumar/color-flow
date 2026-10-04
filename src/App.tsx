import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from './game/gameState';
import { ColorFlowGame } from './game/ColorFlowGame';
import { HomeScreen } from './components/home/HomeScreen';
import { GameHUD } from './components/GameHUD';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { SettingsModal } from './components/SettingsModal';
import { LevelEditorModal } from './components/LevelEditorModal';
import { TutorialHint } from './components/TutorialHint';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<ColorFlowGame | null>(null);

  const [hintScreenPos, setHintScreenPos] = useState<{ x: number; y: number } | null>(null);

  const {
    phase,
    currentLevel,
    pipes,
    targets,
    movesUsed,
    showLevelSelect,
    showSettings,
    showEditor,
    loadLevel,
    currentLevelNumber,
  } = useGameStore();

  // Initialize ColorFlowGame engine once
  useEffect(() => {
    if (!canvasRef.current) return;

    const game = new ColorFlowGame(canvasRef.current);
    gameRef.current = game;

    game.onHintPositionUpdate = (pos) => {
      setHintScreenPos(pos);
    };

    // Load initial level into store
    loadLevel(currentLevelNumber);

    return () => {
      game.dispose();
      gameRef.current = null;
    };
  }, []);

  // Update level geometry when level changes or phase changes
  useEffect(() => {
    if (!gameRef.current) return;
    if (phase === 'menu') {
      gameRef.current.loadHomeScreen();
    } else if (phase === 'playing' && currentLevel) {
      gameRef.current.loadLevel(currentLevel, pipes);
    }
  }, [phase, currentLevel]);

  // Update pipe rotations & gates when player rotates a piece
  useEffect(() => {
    if (gameRef.current && currentLevel) {
      gameRef.current.onPipesUpdated(pipes);
    }
  }, [pipes]);

  // Sync target fill levels
  useEffect(() => {
    if (gameRef.current) {
      for (const tgt of Object.values(targets)) {
        gameRef.current.updateTargetFill(tgt.id, tgt.current, tgt.required);
      }
    }
  }, [targets]);

  // Trigger win celebration
  useEffect(() => {
    if (phase === 'completed' && gameRef.current) {
      gameRef.current.triggerWinCelebration();
    }
  }, [phase]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="game-canvas w-full h-full block cursor-pointer touch-none"
      />

      {/* Non-intrusive Contextual Tutorial Hint over the pipe */}
      <TutorialHint
        screenPos={hintScreenPos}
        visible={phase === 'playing' && movesUsed === 0 && Boolean(currentLevel?.hintPipePosition)}
      />

      {/* Home / Landing Screen */}
      {phase === 'menu' && <HomeScreen />}

      {/* In-Game HUD (70-80% screen space dedicated to gameplay) */}
      {phase === 'playing' && <GameHUD />}

      {/* Level Complete Celebration Modal (floating non-intrusive) */}
      {phase === 'completed' && <LevelCompleteModal />}

      {/* Level Select Modal */}
      {showLevelSelect && <LevelSelectModal />}

      {/* Settings Modal */}
      {showSettings && <SettingsModal />}

      {/* Built-in Level Editor & Dev Tools */}
      {showEditor && <LevelEditorModal />}
    </div>
  );
}
