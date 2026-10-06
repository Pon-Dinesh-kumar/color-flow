import * as THREE from 'three';
import { MaterialManager } from './Materials';
import { FlowColor } from '../puzzle/ColorSystem';
import { FlowPath } from '../puzzle/FlowPath';
import { CELL_SIZE } from './PipeMeshFactory';
import { AudioManager } from '../engine/AudioManager';

export type BallState = 'spawn' | 'move' | 'arrive';

export interface ActiveBall {
  mesh: THREE.Mesh;
  path: FlowPath;
  pathIndex: number;
  segmentT: number;
  speed: number;
  currentSpeed: number;
  targetSpeed: number;
  currentColor: FlowColor;
  points: THREE.Vector3[];
  state: BallState;
  stateTimer: number;
  totalDistance: number;
  traveledDistance: number;
  trailTimer: number;
}

export class BallPool {
  private scene: THREE.Scene;
  private mats = MaterialManager.getInstance();
  private pool: THREE.Mesh[] = [];
  private activeBalls: ActiveBall[] = [];

  // Section 3 & 13: UV Sphere (32 x 32 segments), Smooth Shading: ON, Diameter: 0.27 units (Radius: 0.135)
  private ballGeom: THREE.SphereGeometry;

  // Callbacks
  public onBallReachedTarget?: (targetId: string, color: FlowColor) => void;
  public onBallStep?: (position: THREE.Vector3, color: FlowColor) => void;

  constructor(scene: THREE.Scene, initialPoolSize = 64) {
    this.scene = scene;
    // Section 3: Sphere (UV Sphere), Segments: 32 x 32, Radius: 0.135 (Diameter: 0.27 units)
    this.ballGeom = new THREE.SphereGeometry(0.135, 32, 32);

    for (let i = 0; i < initialPoolSize; i++) {
      const mesh = new THREE.Mesh(this.ballGeom, this.mats.getBallMaterial('red'));
      mesh.visible = false;
      mesh.castShadow = true;
      this.scene.add(mesh);
      this.pool.push(mesh);
    }
  }

  private acquireMesh(color: FlowColor): THREE.Mesh {
    let mesh: THREE.Mesh;
    if (this.pool.length > 0) {
      mesh = this.pool.pop()!;
    } else {
      mesh = new THREE.Mesh(this.ballGeom, this.mats.getBallMaterial(color));
      mesh.castShadow = true;
      this.scene.add(mesh);
    }

    mesh.material = this.mats.getBallMaterial(color);
    mesh.visible = true;
    mesh.scale.set(0.01, 0.01, 0.01); // Initial spawn scale 0
    return mesh;
  }

  private releaseMesh(mesh: THREE.Mesh) {
    mesh.visible = false;
    this.pool.push(mesh);
  }

  public spawnBallOnPath(
    path: FlowPath,
    boardWidth: number,
    boardHeight: number,
    originY: number,
    speed = 3.4,
    resolvePos?: (wp: any) => THREE.Vector3
  ): boolean {
    if (!path.waypoints || path.waypoints.length < 2) return false;

    // Convert grid waypoints to 3D points
    const points: THREE.Vector3[] = path.waypoints.map((wp) => {
      if (resolvePos) {
        return resolvePos(wp);
      }
      const x = (wp.position.x - (boardWidth - 1) / 2) * CELL_SIZE;
      const y = ((boardHeight - 1) / 2 - wp.position.y) * CELL_SIZE + originY;
      return new THREE.Vector3(x, y, 0);
    });

    let totalDist = 0;
    for (let i = 0; i < points.length - 1; i++) {
      totalDist += points[i].distanceTo(points[i + 1]);
    }

    const mesh = this.acquireMesh(path.color);
    mesh.position.copy(points[0]);

    this.activeBalls.push({
      mesh,
      path,
      pathIndex: 0,
      segmentT: 0,
      speed,
      currentSpeed: speed * 0.4, // Initial acceleration phase
      targetSpeed: speed,
      currentColor: path.color,
      points,
      state: 'spawn',
      stateTimer: 0,
      totalDistance: totalDist,
      traveledDistance: 0,
      trailTimer: 0,
    });

    return true;
  }

  public update(delta: number) {
    for (let i = this.activeBalls.length - 1; i >= 0; i--) {
      const ball = this.activeBalls[i];
      ball.stateTimer += delta;

      // --- SECTION 5: ANIMATION CYCLE ---
      // 1. Spawn Phase (0.1s): Scale up from 0 to 1 with bouncy spring
      if (ball.state === 'spawn') {
        const spawnDuration = 0.1;
        const progress = Math.min(1.0, ball.stateTimer / spawnDuration);
        // Spring scale overshoot to 1.15 then settle to 1.0
        const scale = progress < 0.7 ? (progress / 0.7) * 1.12 : 1.12 - ((progress - 0.7) / 0.3) * 0.12;
        ball.mesh.scale.set(scale, scale, scale);

        if (progress >= 1.0) {
          ball.state = 'move';
          ball.stateTimer = 0;
          ball.mesh.scale.set(1, 1, 1);
        }
      }

      // 2. Accelerate / Constant Movement Phase (Section 5, 6, 7)
      if (ball.state === 'move') {
        // Accelerate smoothly to target speed over 0.2s
        if (ball.currentSpeed < ball.targetSpeed) {
          ball.currentSpeed = Math.min(ball.targetSpeed, ball.currentSpeed + (ball.targetSpeed / 0.2) * delta);
        }

        const p1 = ball.points[ball.pathIndex];
        const p2 = ball.points[ball.pathIndex + 1];

        if (!p1 || !p2) {
          this.releaseMesh(ball.mesh);
          this.activeBalls.splice(i, 1);
          continue;
        }

        const segmentDist = p1.distanceTo(p2);
        const effectiveSpeed = ball.currentSpeed;
        const step = (effectiveSpeed * delta) / Math.max(0.05, segmentDist);
        ball.segmentT += step;
        ball.traveledDistance += effectiveSpeed * delta;

        // Waypoint color modification (e.g. ColorChanger)
        const currentWaypoint = ball.path.waypoints[ball.pathIndex];
        if (currentWaypoint && currentWaypoint.color !== ball.currentColor) {
          ball.currentColor = currentWaypoint.color;
          ball.mesh.material = this.mats.getBallMaterial(ball.currentColor);
        }

        // Section 6: Smooth linear movement in pipe
        ball.mesh.position.lerpVectors(p1, p2, Math.min(1.0, ball.segmentT));

        // Section 10: Subtle Trail Effect (emitted behind ball every 0.04s)
        ball.trailTimer += delta;
        if (ball.trailTimer >= 0.04) {
          ball.trailTimer = 0;
          this.onBallStep?.(ball.mesh.position, ball.currentColor);
        }

        // Section 6: Slight motion stretch along travel direction
        const moveDir = p2.clone().sub(p1).normalize();
        if (Math.abs(moveDir.y) > 0.75) {
          ball.mesh.scale.set(0.92, 1.08, 0.92);
        } else if (Math.abs(moveDir.x) > 0.75) {
          ball.mesh.scale.set(1.08, 0.92, 0.92);
        } else {
          ball.mesh.scale.set(1, 1, 1);
        }

        // Advance to next segment
        if (ball.segmentT >= 1.0) {
          ball.pathIndex++;
          ball.segmentT = 0;

          // Check if reached destination
          if (ball.pathIndex >= ball.points.length - 1) {
            // Reached target container!
            ball.state = 'arrive';
            ball.stateTimer = 0;

            const lastWaypoint = ball.path.waypoints[ball.path.waypoints.length - 1];
            if (lastWaypoint.isTarget && lastWaypoint.targetId && ball.path.reachesTarget) {
              // Section 11 SFX: Play Enter Container & soft bounce sounds
              AudioManager.playBallEnterContainer();
              AudioManager.playBallBounce();
              this.onBallReachedTarget?.(lastWaypoint.targetId, ball.currentColor);
            }
          }
        }
      }

      // 3. Arrive / Container Bounce Phase (Section 5 & 9)
      if (ball.state === 'arrive') {
        const arriveDuration = 0.12; // 0.12s arrival bounce
        const progress = Math.min(1.0, ball.stateTimer / arriveDuration);

        // Soft squish on landing into container (Section 9: Stacking/settling bounce)
        const squishX = 1.0 + Math.sin(progress * Math.PI) * 0.22;
        const squishY = 1.0 - Math.sin(progress * Math.PI) * 0.25;
        ball.mesh.scale.set(squishX, squishY, squishX);

        // Drops slightly downward into liquid
        ball.mesh.position.y -= delta * 0.8;

        if (progress >= 1.0) {
          this.releaseMesh(ball.mesh);
          this.activeBalls.splice(i, 1);
        }
      }
    }
  }

  public clearAll() {
    for (const ball of this.activeBalls) {
      this.releaseMesh(ball.mesh);
    }
    this.activeBalls = [];
  }
}

