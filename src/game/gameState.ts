import { create } from 'zustand';
import { LevelConfig } from '../gameplay/Level';
import { PipeNode } from '../puzzle/Pipe';
import { FlowColor } from '../puzzle/ColorSystem';
import { LevelLoader } from '../gameplay/LevelLoader';
import { FlowSimulator } from '../puzzle/FlowSimulator';
import { posKey } from '../puzzle/Grid';
import { SaveService } from '../services/SaveService';
import { AudioManager } from '../engine/AudioManager';
import { AnalyticsService } from '../services/AnalyticsService';

export type GamePhase = 'menu' | 'playing' | 'completed' | 'failed' | 'editor';

export interface TargetProgress {
  id: string;
  color: FlowColor;
  current: number;
  required: number;
  isComplete: boolean;
}

export interface GameState {
  // Navigation & phase
  phase: GamePhase;
  currentLevelNumber: number;
  currentLevel: LevelConfig | null;
  isPaused: boolean;

  // Level runtime state
  pipes: Record<string, PipeNode>;
  targets: Record<string, TargetProgress>;
  movesUsed: number;
  starsEarned: number;
  activeTargetIds: string[];

  // Settings & overlays
  sfx: boolean;
  music: boolean;
  showLevelSelect: boolean;
  showSettings: boolean;
  showEditor: boolean;

  // Actions
  loadLevel: (levelNum: number) => void;
  rotatePipe: (pipeId: string) => void;
  toggleGate: (pipeId: string) => void;
  deliverBall: (targetId: string, color: FlowColor) => void;
  restartLevel: () => void;
  nextLevel: () => void;
  setPhase: (phase: GamePhase) => void;
  togglePause: () => void;
  toggleSfx: () => void;
  toggleMusic: () => void;
  setShowLevelSelect: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setShowEditor: (show: boolean) => void;
  resetProgress: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'menu',
  currentLevelNumber: 1,
  currentLevel: null,
  isPaused: false,

  pipes: {},
  targets: {},
  movesUsed: 0,
  starsEarned: 0,
  activeTargetIds: [],

  sfx: SaveService.getProgress().sfx,
  music: SaveService.getProgress().music,
  showLevelSelect: false,
  showSettings: false,
  showEditor: false,

  loadLevel: (levelNum: number) => {
    const level = LevelLoader.getLevelByNumber(levelNum) || LevelLoader.getLevelByNumber(1)!;

    const initialPipes: Record<string, PipeNode> = {};
    for (const p of level.pipes) {
      initialPipes[p.id] = { ...p };
    }

    const initialTargets: Record<string, TargetProgress> = {};
    for (const t of level.targets) {
      initialTargets[t.id] = {
        id: t.id,
        color: t.color,
        current: 0,
        required: t.requiredAmount,
        isComplete: false,
      };
    }

    AnalyticsService.track('level_started', { levelNumber: level.number, levelId: level.id });

    set({
      phase: 'playing',
      currentLevelNumber: level.number,
      currentLevel: level,
      pipes: initialPipes,
      targets: initialTargets,
      movesUsed: 0,
      starsEarned: 0,
      isPaused: false,
      showLevelSelect: false,
      activeTargetIds: [],
    });
  },

  rotatePipe: (pipeId: string) => {
    const state = get();
    if (state.phase !== 'playing' || state.isPaused) return;

    const pipe = state.pipes[pipeId];
    if (!pipe || pipe.locked) return;

    const newRot = (pipe.rotation + 90) % 360;
    const updatedPipe = { ...pipe, rotation: newRot };

    const newPipes = { ...state.pipes, [pipeId]: updatedPipe };
    const newMoves = state.movesUsed + 1;

    AudioManager.playRotate();
    AnalyticsService.track('pipe_rotated', { pipeId, newRotation: newRot });

    set({
      pipes: newPipes,
      movesUsed: newMoves,
    });
  },

  toggleGate: (pipeId: string) => {
    const state = get();
    if (state.phase !== 'playing' || state.isPaused) return;

    const pipe = state.pipes[pipeId];
    if (!pipe || pipe.type !== 'gate') return;

    const newIsOpen = !(pipe.isOpen ?? true);
    const updatedPipe = { ...pipe, isOpen: newIsOpen };

    AudioManager.playGateToggle();

    set({
      pipes: { ...state.pipes, [pipeId]: updatedPipe },
      movesUsed: state.movesUsed + 1,
    });
  },

  deliverBall: (targetId: string, color: FlowColor) => {
    const state = get();
    if (state.phase !== 'playing') return;

    const tgt = state.targets[targetId];
    if (!tgt || tgt.isComplete) return;

    // Check if color matches
    if (tgt.color !== color) return;

    const newCurrent = tgt.current + 1;
    const isNowComplete = newCurrent >= tgt.required;

    const updatedTargets = {
      ...state.targets,
      [targetId]: {
        ...tgt,
        current: newCurrent,
        isComplete: isNowComplete,
      },
    };

    if (isNowComplete) {
      AudioManager.playTargetComplete();
    } else {
      AudioManager.playBallDrop(1.0 + (newCurrent / tgt.required) * 0.4);
    }

    // Check overall win condition
    const allCompleted = Object.values(updatedTargets).every((t) => t.isComplete);

    if (allCompleted) {
      const level = state.currentLevel!;
      // Calculate stars: 3 stars if within targetMoves, 2 stars if <= targetMoves + 4, else 1 star
      let stars = 3;
      const targetMoves = level.targetMoves || 6;
      if (state.movesUsed > targetMoves + 4) {
        stars = 1;
      } else if (state.movesUsed > targetMoves) {
        stars = 2;
      }

      const score = stars * 1000 + Math.max(0, 500 - state.movesUsed * 25);
      SaveService.completeLevel(level.number, stars, score);
      AnalyticsService.track('level_completed', {
        levelNumber: level.number,
        movesUsed: state.movesUsed,
        stars,
        score,
      });

      AudioManager.playLevelWin();

      set({
        targets: updatedTargets,
        phase: 'completed',
        starsEarned: stars,
      });
    } else {
      set({ targets: updatedTargets });
    }
  },

  restartLevel: () => {
    const levelNum = get().currentLevelNumber;
    AnalyticsService.track('level_restarted', { levelNumber: levelNum });
    get().loadLevel(levelNum);
  },

  nextLevel: () => {
    const nextNum = get().currentLevelNumber + 1;
    const total = LevelLoader.getLevelCount();
    if (nextNum <= total) {
      get().loadLevel(nextNum);
    } else {
      set({ phase: 'menu' });
    }
  },

  setPhase: (phase: GamePhase) => set({ phase }),

  togglePause: () => set((s) => ({ isPaused: !s.isPaused })),

  toggleSfx: () => {
    const newSfx = !get().sfx;
    AudioManager.setSfxEnabled(newSfx);
    SaveService.saveSettings(newSfx, get().music);
    set({ sfx: newSfx });
  },

  toggleMusic: () => {
    const newMusic = !get().music;
    AudioManager.setMusicEnabled(newMusic);
    SaveService.saveSettings(get().sfx, newMusic);
    set({ music: newMusic });
  },

  setShowLevelSelect: (show: boolean) => set({ showLevelSelect: show }),
  setShowSettings: (show: boolean) => set({ showSettings: show }),
  setShowEditor: (show: boolean) => set({ showEditor: show }),

  resetProgress: () => {
    SaveService.resetProgress();
    set({ currentLevelNumber: 1 });
    get().loadLevel(1);
  },
}));
