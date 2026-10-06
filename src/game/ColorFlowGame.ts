import * as THREE from 'three';
import { CameraManager, PuzzleBounds } from '../engine/CameraManager';
import { EnvironmentManager } from '../rendering/Environment';
import { BoardView } from '../rendering/BoardView';
import { BallPool } from '../rendering/BallPool';
import { ParticleSystem } from '../rendering/Particles';
import { LevelConfig } from '../gameplay/Level';
import { PipeNode } from '../puzzle/Pipe';
import { FlowSimulator } from '../puzzle/FlowSimulator';
import { posKey } from '../puzzle/Grid';
import { FlowResult } from '../puzzle/FlowPath';
import { useGameStore } from './gameState';
import { RemoteConfigService } from '../services/RemoteConfigService';
import { HeroShowcaseManager } from '../rendering/HeroShowcaseManager';
import { AudioManager } from '../engine/AudioManager';

export class ColorFlowGame {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private cameraManager: CameraManager;
  private environment: EnvironmentManager;
  private boardView: BoardView;
  private ballPool: BallPool;
  private particleSystem: ParticleSystem;
  private heroShowcase: HeroShowcaseManager | null = null;

  private isRunning = false;
  private lastFrameTime = 0;
  private spawnTimer = 0;
  private currentFlowResult: FlowResult | null = null;
  private currentLevelConfig: LevelConfig | null = null;

  // Pointer tracking for tactile tap vs drag
  private pointerDownPos = new THREE.Vector2();
  private pointerDownTime = 0;
  private resizeObserver: ResizeObserver | null = null;

  // Callback to inform UI of tutorial screen coordinates
  public onHintPositionUpdate?: (pos: { x: number; y: number } | null) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    // Create high-performance WebGL Renderer with alpha transparency so uncropped background shines through
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;

    // Scene & systems
    this.scene = new THREE.Scene();
    this.cameraManager = new CameraManager(window.innerWidth / window.innerHeight);
    this.environment = new EnvironmentManager(this.scene);
    this.boardView = new BoardView(this.scene);
    this.ballPool = new BallPool(this.scene);
    this.particleSystem = new ParticleSystem(this.scene);

    // Callbacks
    this.boardView.onPipeClick = (pipeId) => {
      useGameStore.getState().rotatePipe(pipeId);
    };

    this.boardView.onGateClick = (pipeId) => {
      useGameStore.getState().toggleGate(pipeId);
    };

    this.ballPool.onBallReachedTarget = (targetId, color) => {
      useGameStore.getState().deliverBall(targetId, color);

      const tgtMesh = this.scene.getObjectByName(`target_${targetId}`);
      if (tgtMesh) {
        this.particleSystem.burst(tgtMesh.position, color, 14, 2.4);
      }
    };

    // Section 10: Trail Effect (Subtle) behind moving balls
    this.ballPool.onBallStep = (pos, color) => {
      this.particleSystem.emitTrail(pos, color);
    };

    this.bindEvents();
    this.handleResize();
    this.startLoop();
  }

  private bindEvents() {
    window.addEventListener('resize', this.handleResize);

    if (this.canvas.parentElement && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.handleResize();
      });
      this.resizeObserver.observe(this.canvas.parentElement);
    }

    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    this.canvas.addEventListener('pointerup', this.onPointerUp);
  }

  public unbindEvents() {
    window.removeEventListener('resize', this.handleResize);

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);
  }

  private handleResize = () => {
    const width = this.canvas.parentElement ? this.canvas.parentElement.clientWidth : window.innerWidth;
    const height = this.canvas.parentElement ? this.canvas.parentElement.clientHeight : window.innerHeight;

    if (width === 0 || height === 0) return;

    this.renderer.setSize(width, height, false);

    if (this.currentLevelConfig) {
      const aspect = width / height;
      this.cameraManager.framePuzzle(this.getLevelFrameBounds(), aspect, false);
      this.updateHintScreenPosition();
    } else if (this.heroShowcase) {
      const aspect = width / height;
      const bounds = this.heroShowcase.getBounds();
      this.cameraManager.framePuzzle(bounds, aspect, false);
    }
  };

  private getLevelFrameBounds(): PuzzleBounds {
    const bounds = this.boardView.getPuzzleBounds();
    return {
      ...bounds,
      minY: bounds.minY - 0.65,
      maxY: bounds.maxY + 0.15,
    };
  }

  private onPointerDown = (e: PointerEvent) => {
    this.pointerDownPos.set(e.clientX, e.clientY);
    this.pointerDownTime = performance.now();
  };

  private onPointerUp = (e: PointerEvent) => {
    const dist = Math.hypot(e.clientX - this.pointerDownPos.x, e.clientY - this.pointerDownPos.y);
    const duration = performance.now() - this.pointerDownTime;

    if (dist < 15 && duration < 400) {
      const rect = this.canvas.getBoundingClientRect();
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      this.boardView.handlePointerClick(new THREE.Vector2(ndcX, ndcY), this.cameraManager.camera);
    }
  };

  public loadHomeScreen() {
    this.boardView.clear();
    this.ballPool.clearAll();
    this.particleSystem.clear();
    this.currentLevelConfig = null;
    this.currentFlowResult = null;

    if (this.heroShowcase) {
      this.scene.remove(this.heroShowcase.group);
      this.heroShowcase.dispose();
      this.heroShowcase = null;
    }

    this.heroShowcase = new HeroShowcaseManager();
    this.scene.add(this.heroShowcase.group);

    const bounds = this.heroShowcase.getBounds();
    this.environment.updatePlatform(bounds, 2);

    const aspect = this.canvas.clientWidth / Math.max(1, this.canvas.clientHeight);
    this.cameraManager.framePuzzle(bounds, aspect, false);
  }

  public loadLevel(level: LevelConfig, currentPipes: Record<string, PipeNode>) {
    if (this.heroShowcase) {
      this.scene.remove(this.heroShowcase.group);
      this.heroShowcase.dispose();
      this.heroShowcase = null;
    }

    this.currentLevelConfig = level;
    this.ballPool.clearAll();
    this.particleSystem.clear();

    const pipesList = Object.values(currentPipes);
    this.boardView.setupBoard(level.grid.width, level.grid.height, pipesList, level.sources, level.targets);

    const bounds = this.boardView.getPuzzleBounds();
    this.environment.updatePlatform(bounds, this.boardView.getTargetCount());

    const aspect = this.canvas.clientWidth / Math.max(1, this.canvas.clientHeight);
    this.cameraManager.framePuzzle(this.getLevelFrameBounds(), aspect, true);

    this.recomputeFlow(currentPipes);
    this.updateHintScreenPosition();
  }

  public onPipesUpdated(pipes: Record<string, PipeNode>) {
    for (const pipe of Object.values(pipes)) {
      this.boardView.rotatePipeMesh(pipe.id, pipe.rotation);
      if (pipe.type === 'gate') {
        this.boardView.toggleGateMesh(pipe.id, pipe.isOpen ?? true);
      }
    }
    this.recomputeFlow(pipes);
    this.updateHintScreenPosition();
  }

  public updateTargetFill(targetId: string, current: number, required: number) {
    this.boardView.updateTargetFill(targetId, current, required);
  }

  private recomputeFlow(pipes: Record<string, PipeNode>) {
    if (!this.currentLevelConfig) return;

    const pipeMap = new Map<string, PipeNode>();
    for (const p of Object.values(pipes)) {
      pipeMap.set(posKey(p.gridPosition), p);
    }

    this.currentFlowResult = FlowSimulator.simulate({
      width: this.currentLevelConfig.grid.width,
      height: this.currentLevelConfig.grid.height,
      pipes: pipeMap,
      sources: this.currentLevelConfig.sources,
      targets: this.currentLevelConfig.targets,
    });

    this.boardView.updateFlowHighlights(this.currentFlowResult);
  }

  public updateHintScreenPosition() {
    if (!this.currentLevelConfig || !this.currentLevelConfig.hintPipePosition) {
      this.onHintPositionUpdate?.(null);
      return;
    }

    const state = useGameStore.getState();
    // If player has already made a move, dismiss hint
    if (state.movesUsed > 0) {
      this.onHintPositionUpdate?.(null);
      return;
    }

    const worldPos = this.boardView.gridToWorld(this.currentLevelConfig.hintPipePosition);
    const screenPos = this.cameraManager.projectToScreen(
      worldPos,
      this.canvas.clientWidth,
      this.canvas.clientHeight
    );
    this.onHintPositionUpdate?.(screenPos);
  }

  public updateBackground(urlOrDataUri: string) {
    this.environment.updateBackgroundTexture(urlOrDataUri);
  }

  public triggerWinCelebration() {
    this.cameraManager.playWinZoom();
    AudioManager.playBallComplete();
    this.boardView.emptyAllSources();
    if (this.currentLevelConfig) {
      for (const tgt of this.currentLevelConfig.targets) {
        this.boardView.playTargetWin(tgt.id);
        const tgtMesh = this.scene.getObjectByName(`target_${tgt.id}`);
        if (tgtMesh) {
          // Section 10: Completion Burst
          this.particleSystem.burstCompletion(tgtMesh.position, tgt.color);
        }
      }
    }
  }

  private startLoop() {
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    requestAnimationFrame(this.renderLoop);
  }

  private renderLoop = (time: number) => {
    if (!this.isRunning) return;

    const delta = Math.min((time - this.lastFrameTime) / 1000, 0.1);
    this.lastFrameTime = time;

    // Ball flow spawning
    const state = useGameStore.getState();
    if (state.phase === 'playing' && !state.isPaused && this.currentFlowResult && this.currentLevelConfig) {
      const config = RemoteConfigService.getConfig();
      this.spawnTimer += delta * 1000;

      if (this.spawnTimer >= config.ballSpawnInterval) {
        this.spawnTimer = 0;

        const dims = this.boardView.getGridDimensions();
        for (const path of this.currentFlowResult.paths) {
          if (path.reachesTarget && path.targetId) {
            const tgtState = state.targets[path.targetId];
            if (tgtState && !tgtState.isComplete) {
              const spawned = this.ballPool.spawnBallOnPath(
                path,
                dims.width,
                dims.height,
                dims.originY,
                config.ballSpeed,
                (wp) => this.boardView.getWaypointWorldPosition(wp)
              );
              if (spawned && path.sourceId) {
                this.boardView.popSourceBall(path.sourceId);
              }
            }
          }
        }
      }
    }

    // Update hero showcase if active on Home screen
    if (this.heroShowcase) {
      this.heroShowcase.update(delta);
    }

    if (!state.isPaused) {
      this.ballPool.update(delta);
      this.particleSystem.update(delta);
    }

    this.renderer.render(this.scene, this.cameraManager.camera);

    requestAnimationFrame(this.renderLoop);
  };

  public dispose() {
    this.isRunning = false;
    this.unbindEvents();
    if (this.heroShowcase) {
      this.heroShowcase.dispose();
      this.heroShowcase = null;
    }
    this.boardView.clear();
    this.ballPool.clearAll();
    this.particleSystem.clear();
    this.renderer.dispose();
  }
}
