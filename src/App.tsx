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
import { PauseModal } from './components/PauseModal';
import { LevelFailedModal } from './components/LevelFailedModal';
import { CloudTransitionOverlay } from './transitions/CloudTransitionOverlay';

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
    isPaused,
    backgroundUrl,
  } = useGameStore();

  // Initialize ColorFlowGame engine once
  useEffect(() => {
    if (!canvasRef.current) return;

    const game = new ColorFlowGame(canvasRef.current);
    gameRef.current = game;

    game.onHintPositionUpdate = (pos) => {
      setHintScreenPos(pos);
    };

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && phase === 'playing') {
        useGameStore.getState().togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase]);

  // Trigger win celebration
  useEffect(() => {
    if (phase === 'completed' && gameRef.current) {
      gameRef.current.triggerWinCelebration();
    }
  }, [phase]);

  return (
    <div className="relative w-screen h-[100dvh] overflow-hidden bg-slate-950 select-none flex items-center justify-center">
      {/* Ambient background glow for widescreen/desktop letterboxed viewports */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-30 scale-110 pointer-events-none"
        style={{ backgroundImage: `url(${backgroundUrl})` }}
        aria-hidden="true"
      />

      {/*
        Complete Mobile Game Viewport:
        Preserves the exact aspect ratio (940/1672 = ~9:16) of the mobile background image.
        Home screen keeps the complete 100% uncropped background.
        In-game screen zooms in a bit like it was earlier for an up-close immersive feel.
      */}
      <div
        className="game-frame relative h-full w-full shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col items-center justify-center overflow-hidden"
        style={{
          height: '100%',
        }}
      >
        {/* Dynamic Background Layer:
            - Home Screen ('menu'): 100% complete, uncropped framing.
            - In-Game Screen: zoomed in even more (~1.38x) focused on the dais/action area, with smooth transition.
        */}
        <div
          className={`absolute inset-0 pointer-events-none transition-transform duration-700 ease-out will-change-transform ${
            phase === 'menu'
              ? 'scale-100 origin-center'
              : 'scale-[1.48] origin-[50%_62%] blur-[5px] brightness-90'
          }`}
          style={{
            backgroundImage: `url(${backgroundUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
          aria-hidden="true"
        />

        {/* 3D WebGL Canvas */}
        <canvas
          ref={canvasRef}
          className="game-canvas absolute inset-0 w-full h-full block cursor-pointer touch-none"
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
        {phase === 'failed' && <LevelFailedModal />}
        {phase === 'playing' && isPaused && <PauseModal />}

        {/* Level Select Modal */}
        {showLevelSelect && <LevelSelectModal />}

        {/* Settings Modal */}
        {showSettings && <SettingsModal />}

        {/* Built-in Level Editor & Dev Tools */}
        {showEditor && <LevelEditorModal />}

        {/* Exact Cloud Page Transition System (Storyboard Stages 2–5) */}
        <CloudTransitionOverlay />
      </div>
    </div>
  );
}
