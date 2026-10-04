import * as THREE from 'three';
import { MaterialManager } from './Materials';
import { FlowColor } from '../puzzle/ColorSystem';
import { FlowPath } from '../puzzle/FlowPath';
import { CELL_SIZE } from './PipeMeshFactory';

export interface ActiveBall {
  mesh: THREE.Mesh;
  path: FlowPath;
  pathIndex: number;
  segmentT: number;
  speed: number;
  currentColor: FlowColor;
  points: THREE.Vector3[];
}

export class BallPool {
  private scene: THREE.Scene;
  private mats = MaterialManager.getInstance();
  private pool: THREE.Mesh[] = [];
  private activeBalls: ActiveBall[] = [];
  private ballGeom: THREE.SphereGeometry;

  // Callbacks
  public onBallReachedTarget?: (targetId: string, color: FlowColor) => void;
  public onBallStep?: (position: THREE.Vector3, color: FlowColor) => void;

  constructor(scene: THREE.Scene, initialPoolSize = 60) {
    this.scene = scene;
    // Juicy sphere radius
    this.ballGeom = new THREE.SphereGeometry(0.18, 20, 20);

    for (let i = 0; i < initialPoolSize; i++) {
      const mesh = new THREE.Mesh(this.ballGeom, this.mats.getBallMaterial('red'));
      mesh.visible = false;
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
      this.scene.add(mesh);
    }

    mesh.material = this.mats.getBallMaterial(color);
    mesh.visible = true;
    mesh.scale.set(1, 1, 1);
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
    speed = 5.2,
    resolvePos?: (wp: any) => THREE.Vector3
  ): boolean {
    if (!path.waypoints || path.waypoints.length < 2) return false;

    // Convert grid waypoints to 3D positions
    const points: THREE.Vector3[] = path.waypoints.map((wp) => {
      if (resolvePos) {
        return resolvePos(wp);
      }
      const x = (wp.position.x - (boardWidth - 1) / 2) * CELL_SIZE;
      const y = ((boardHeight - 1) / 2 - wp.position.y) * CELL_SIZE + originY;
      return new THREE.Vector3(x, y, 0);
    });

    const mesh = this.acquireMesh(path.color);
    mesh.position.copy(points[0]);

    this.activeBalls.push({
      mesh,
      path,
      pathIndex: 0,
      segmentT: 0,
      speed,
      currentColor: path.color,
      points,
    });

    return true;
  }

  public update(delta: number) {
    for (let i = this.activeBalls.length - 1; i >= 0; i--) {
      const ball = this.activeBalls[i];
      const p1 = ball.points[ball.pathIndex];
      const p2 = ball.points[ball.pathIndex + 1];

      if (!p1 || !p2) {
        this.releaseMesh(ball.mesh);
        this.activeBalls.splice(i, 1);
        continue;
      }

      const segmentDist = p1.distanceTo(p2);
      const step = (ball.speed * delta) / Math.max(0.1, segmentDist);
      ball.segmentT += step;

      // Update color if current waypoint modified color (e.g. ColorChanger)
      const currentWaypoint = ball.path.waypoints[ball.pathIndex];
      if (currentWaypoint && currentWaypoint.color !== ball.currentColor) {
        ball.currentColor = currentWaypoint.color;
        ball.mesh.material = this.mats.getBallMaterial(ball.currentColor);
      }

      // Smooth position interpolation
      ball.mesh.position.lerpVectors(p1, p2, Math.min(1.0, ball.segmentT));

      // Subtle squash & stretch along movement direction
      const moveDir = p2.clone().sub(p1).normalize();
      if (Math.abs(moveDir.y) > 0.8) {
        // Moving vertically
        ball.mesh.scale.set(0.9, 1.14, 0.9);
      } else if (Math.abs(moveDir.x) > 0.8) {
        // Moving horizontally
        ball.mesh.scale.set(1.14, 0.9, 0.9);
      } else {
        ball.mesh.scale.set(1, 1, 1);
      }

      if (ball.segmentT >= 1.0) {
        ball.pathIndex++;
        ball.segmentT = 0;

        if (ball.pathIndex >= ball.points.length - 1) {
          // Reached end of path!
          const lastWaypoint = ball.path.waypoints[ball.path.waypoints.length - 1];
          if (lastWaypoint.isTarget && lastWaypoint.targetId && ball.path.reachesTarget) {
            this.onBallReachedTarget?.(lastWaypoint.targetId, ball.currentColor);
          }

          this.releaseMesh(ball.mesh);
          this.activeBalls.splice(i, 1);
          continue;
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
