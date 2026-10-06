import * as THREE from 'three';
import gsap from 'gsap';
import { PipeNode } from '../puzzle/Pipe';
import { SourceNode } from '../puzzle/Source';
import { TargetNode } from '../puzzle/Target';
import { GridPosition } from '../puzzle/Grid';
import { PipeMeshFactory, CELL_SIZE, HALF_CELL } from './PipeMeshFactory';
import { SourceCanisterMesh } from './SourceCanisterMesh';
import { TargetCanisterMesh } from './TargetCanisterMesh';
import { MaterialManager } from './Materials';
import { FlowResult, FlowWaypoint } from '../puzzle/FlowPath';
import { COLOR_PALETTE } from '../puzzle/ColorSystem';
import { PuzzleBounds } from '../engine/CameraManager';

export class BoardView {
  public scene: THREE.Scene;
  private boardGroup: THREE.Group;
  private pipeMeshes: Map<string, THREE.Group> = new Map();
  private sourceMeshes: Map<string, SourceCanisterMesh> = new Map();
  private targetMeshes: Map<string, TargetCanisterMesh> = new Map();
  private gridWidth = 3;
  private gridHeight = 3;
  private originY = 0;
  private raycaster = new THREE.Raycaster();
  private mats = MaterialManager.getInstance();

  private cachedBounds: PuzzleBounds = { minX: -1.5, maxX: 1.5, minY: -3, maxY: 3 };

  public onPipeClick?: (pipeId: string) => void;
  public onGateClick?: (pipeId: string) => void;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.boardGroup = new THREE.Group();
    this.boardGroup.name = 'board_group';
    this.scene.add(this.boardGroup);
  }

  public setupBoard(
    width: number,
    height: number,
    pipes: PipeNode[],
    sources: SourceNode[],
    targets: TargetNode[]
  ) {
    this.clear();

    this.gridWidth = width;
    this.gridHeight = height;
    this.originY = 0;

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    // 1. Build Pipes
    for (const pipe of pipes) {
      const meshGroup = PipeMeshFactory.createPipeMesh(pipe);
      const worldPos = this.gridToWorld(pipe.gridPosition);
      meshGroup.position.copy(worldPos);

      this.boardGroup.add(meshGroup);
      this.pipeMeshes.set(pipe.id, meshGroup);

      minX = Math.min(minX, worldPos.x - HALF_CELL);
      maxX = Math.max(maxX, worldPos.x + HALF_CELL);
      minY = Math.min(minY, worldPos.y - HALF_CELL);
      maxY = Math.max(maxY, worldPos.y + HALF_CELL);
    }

    // 2. Build Sources: dock snugly into the top intake port of the adjacent pipe
    for (const source of sources) {
      const srcCanister = new SourceCanisterMesh(source);
      const worldPos = this.gridToWorld(source.position);

      // Dock flush into pipe collar below (snug coupling with 0.04 overlap)
      const targetPipeWorldY = worldPos.y - CELL_SIZE;
      const pipeTopCollarY = targetPipeWorldY + HALF_CELL;
      const dockedY = pipeTopCollarY + 0.75;

      srcCanister.group.position.set(worldPos.x, dockedY, 0);

      this.boardGroup.add(srcCanister.group);
      this.sourceMeshes.set(source.id, srcCanister);

      minX = Math.min(minX, worldPos.x - HALF_CELL);
      maxX = Math.max(maxX, worldPos.x + HALF_CELL);
      maxY = Math.max(maxY, srcCanister.getTopY());
    }

    // 3. Build Targets: dock snugly onto the bottom exit port of the adjacent pipe
    for (const target of targets) {
      const tgtCanister = new TargetCanisterMesh(target);
      const worldPos = this.gridToWorld(target.position);

      // Dock flush into pipe collar above (snug coupling with 0.04 overlap)
      const sourcePipeWorldY = worldPos.y + CELL_SIZE;
      const pipeBottomCollarY = sourcePipeWorldY - HALF_CELL;
      const dockedY = pipeBottomCollarY - 0.88;

      tgtCanister.group.position.set(worldPos.x, dockedY, 0);

      this.boardGroup.add(tgtCanister.group);
      this.targetMeshes.set(target.id, tgtCanister);

      minX = Math.min(minX, worldPos.x - HALF_CELL);
      maxX = Math.max(maxX, worldPos.x + HALF_CELL);
      minY = Math.min(minY, tgtCanister.getBottomY());
    }

    this.cachedBounds = {
      minX: Number.isFinite(minX) ? minX : -1.5,
      maxX: Number.isFinite(maxX) ? maxX : 1.5,
      minY: Number.isFinite(minY) ? minY : -3,
      maxY: Number.isFinite(maxY) ? maxY : 3,
    };
  }

  public getPuzzleBounds(): PuzzleBounds {
    return this.cachedBounds;
  }

  public getTargetCount(): number {
    return this.targetMeshes.size;
  }

  public gridToWorld(pos: GridPosition): THREE.Vector3 {
    const x = (pos.x - (this.gridWidth - 1) / 2) * CELL_SIZE;
    const y = ((this.gridHeight - 1) / 2 - pos.y) * CELL_SIZE + this.originY;
    return new THREE.Vector3(x, y, 0);
  }

  public getGridDimensions() {
    return { width: this.gridWidth, height: this.gridHeight, originY: this.originY };
  }

  public getPipeWorldPosition(pipeId: string): THREE.Vector3 | null {
    const mesh = this.pipeMeshes.get(pipeId);
    return mesh ? mesh.position.clone() : null;
  }

  public getWaypointWorldPosition(wp: FlowWaypoint): THREE.Vector3 {
    if (wp.isSource && wp.sourceId) {
      const src = this.sourceMeshes.get(wp.sourceId);
      if (src) return src.group.position.clone();
    }
    if (wp.isTarget && wp.targetId) {
      const tgt = this.targetMeshes.get(wp.targetId);
      if (tgt) return tgt.group.position.clone();
    }
    return this.gridToWorld(wp.position);
  }

  public rotatePipeMesh(pipeId: string, newRotationDeg: number) {
    const meshGroup = this.pipeMeshes.get(pipeId);
    if (!meshGroup) return;

    const targetRotRad = -THREE.MathUtils.degToRad(newRotationDeg);

    gsap.killTweensOf(meshGroup.rotation);
    gsap.killTweensOf(meshGroup.scale);

    // Spring rotation
    gsap.to(meshGroup.rotation, {
      z: targetRotRad,
      duration: 0.28,
      ease: 'back.out(2.2)',
    });

    // Tactile squish and pop
    gsap.to(meshGroup.scale, {
      x: 1.08,
      y: 1.08,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: 'power2.out',
    });
  }

  public toggleGateMesh(pipeId: string, isOpen: boolean) {
    const meshGroup = this.pipeMeshes.get(pipeId);
    if (!meshGroup) return;

    const valveWheel = meshGroup.getObjectByName('valve_wheel');
    if (valveWheel) {
      gsap.to(valveWheel.rotation, {
        z: valveWheel.rotation.z + Math.PI,
        duration: 0.3,
        ease: 'power2.inOut',
      });

      const valveRim = valveWheel.getObjectByName('valve_rim') as THREE.Mesh;
      if (valveRim && valveRim.material) {
        (valveRim.material as THREE.MeshStandardMaterial).color.setHex(isOpen ? 0x10b981 : 0xef4444);
      }
    }
  }

  public updateFlowHighlights(flowResult: FlowResult) {
    for (const [pipeId, meshGroup] of this.pipeMeshes.entries()) {
      const isActive = flowResult.activePipes.has(pipeId);
      const color = flowResult.pipeFlowColors.get(pipeId);

      meshGroup.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (
            mesh.material === this.mats.pipeGlassMaterial ||
            mesh.material === this.mats.pipeGlassActiveMaterial
          ) {
            if (isActive && color) {
              const def = COLOR_PALETTE[color];
              mesh.material = this.mats.pipeGlassActiveMaterial;
              this.mats.pipeGlassActiveMaterial.color.setHex(def.hexNumber);
              this.mats.pipeGlassActiveMaterial.emissive.setHex(def.emissive);
              this.mats.pipeGlassActiveMaterial.emissiveIntensity = 0.55;
            } else {
              mesh.material = this.mats.pipeGlassMaterial;
            }
          }
        }
      });
    }
  }

  public updateTargetFill(targetId: string, currentAmount: number, requiredAmount: number) {
    const tgt = this.targetMeshes.get(targetId);
    if (tgt) {
      tgt.updateFill(currentAmount, requiredAmount);
      tgt.playPulse();
    }
  }

  public popSourceBall(sourceId: string) {
    const src = this.sourceMeshes.get(sourceId);
    if (src) {
      src.popBall();
    }
  }

  public emptyAllSources() {
    for (const src of this.sourceMeshes.values()) {
      src.emptyAll();
    }
  }

  public playTargetWin(targetId: string) {
    const tgt = this.targetMeshes.get(targetId);
    if (tgt) {
      tgt.playCelebration();
    }
  }

  public handlePointerClick(ndcCoords: THREE.Vector2, camera: THREE.Camera) {
    this.raycaster.setFromCamera(ndcCoords, camera);

    const hitPipes: THREE.Group[] = [];
    for (const meshGroup of this.pipeMeshes.values()) {
      const intersects = this.raycaster.intersectObjects(meshGroup.children, true);
      if (intersects.length > 0) {
        hitPipes.push(meshGroup);
      }
    }

    if (hitPipes.length > 0) {
      const clickedMesh = hitPipes[0];
      const pipeId = clickedMesh.userData.pipeId;
      const pipeData: PipeNode = clickedMesh.userData.pipeData;

      if (pipeData && !pipeData.locked) {
        if (pipeData.type === 'gate') {
          this.onGateClick?.(pipeId);
        } else {
          this.onPipeClick?.(pipeId);
        }
      }
    }
  }

  public clear() {
    while (this.boardGroup.children.length > 0) {
      const child = this.boardGroup.children[0];
      this.boardGroup.remove(child);
    }
    this.pipeMeshes.clear();
    this.sourceMeshes.clear();
    this.targetMeshes.clear();
  }
}
