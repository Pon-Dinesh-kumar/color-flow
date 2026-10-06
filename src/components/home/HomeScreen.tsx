import React, { useState } from 'react';
import { useGameStore } from '../../game/gameState';
import { GameLogo } from './GameLogo';
import { PlayButton } from './PlayButton';
import { HomeNavigation } from './HomeNavigation';
import { ThemesModal } from '../ThemesModal';
import { CloudTransitionManager } from '../../transitions/CloudTransitionManager';

export const HomeScreen: React.FC = () => {
  const {
    loadLevel,
    currentLevelNumber,
    setShowLevelSelect,
    setShowSettings,
  } = useGameStore();

  const [showThemes, setShowThemes] = useState(false);

  // Home → Gameplay
  const handlePlay = () => {
    CloudTransitionManager.transition({
      from: 'home',
      to: 'gameplay',
      direction: 'center',
      theme: 'default',
      onPageSwitch: () => loadLevel(currentLevelNumber),
    });
  };

  // Home → Levels
  const handleOpenLevels = () => {
    CloudTransitionManager.transition({
      from: 'home',
      to: 'levels',
      direction: 'center',
      theme: 'default',
      onPageSwitch: () => setShowLevelSelect(true),
    });
  };

  // Home → Settings
  const handleOpenSettings = () => {
    CloudTransitionManager.transition({
      from: 'home',
      to: 'settings',
      direction: 'center',
      theme: 'default',
      onPageSwitch: () => setShowSettings(true),
    });
  };

  // Home → Themes
  const handleOpenThemes = () => {
    CloudTransitionManager.transition({
      from: 'home',
      to: 'themes',
      direction: 'center',
      theme: 'default',
      onPageSwitch: () => setShowThemes(true),
    });
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-between select-none pointer-events-none animate-fade-in">
      {/* 1. Top Section: COLOR FLOW Logo & Tagline */}
      <div className="w-full flex justify-center pt-2 sm:pt-4">
        <GameLogo />
      </div>

      {/* 2. Middle Section: Transparent viewport for the 3D Hero Puzzle Showcase */}
      <div className="flex-1 w-full" aria-hidden="true" />

      {/* 3. Bottom Section: PLAY CTA & Secondary Navigation */}
      <div className="w-full flex flex-col items-center gap-4 sm:gap-6 mb-2 pointer-events-auto">
        {/* Candy-gloss PLAY button */}
        <PlayButton onPlay={handlePlay} />

        {/* 3 Glass Bottom Actions: Settings, Levels, Themes */}
        <HomeNavigation
          onOpenSettings={handleOpenSettings}
          onOpenLevels={handleOpenLevels}
          onOpenThemes={handleOpenThemes}
        />
      </div>

      {/* Themes Modal */}
      <ThemesModal isOpen={showThemes} onClose={() => setShowThemes(false)} />
    </div>
  );
};
