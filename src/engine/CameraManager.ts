import * as THREE from 'three';
import gsap from 'gsap';

export interface PuzzleBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export class CameraManager {
  public camera: THREE.PerspectiveCamera;
  private currentTargetZ: number = 8.5;
  private currentTargetY: number = 0;
  private currentTargetX: number = 0;
  private currentLookAtY: number = 0;

  // Elevation angle in radians (~11.5 degrees for elevated 3/4 perspective)
  private readonly elevationAngle = THREE.MathUtils.degToRad(11.5);

  constructor(aspect = 1) {
    // 42 deg FOV provides an orthographic-like clean readability while preserving subtle 3D depth
    this.camera = new THREE.PerspectiveCamera(42, aspect, 0.1, 100);
    this.camera.position.set(0, 1.5, 8.5);
    this.camera.lookAt(0, 0, 0);
  }

  /**
   * Dynamically frames the complete puzzle machine (SOURCE -> PIPE NETWORK -> TARGET)
   * as one cohesive, unified composition occupying 65-75% of the screen.
   */
  public framePuzzle(bounds: PuzzleBounds, aspect: number, animated = true) {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();

    // Puzzle machine dimensions
    const puzzleWidth = Math.max(2.2, bounds.maxX - bounds.minX);
    const puzzleHeight = Math.max(3.2, bounds.maxY - bounds.minY);

    const centerX = (bounds.minX + bounds.maxX) / 2;
    // Visual center of the puzzle apparatus
    const puzzleCenterY = (bounds.minY + bounds.maxY) / 2;

    const fovRad = THREE.MathUtils.degToRad(this.camera.fov);

    // Leave room for the top HUD and bottom objectives around the full puzzle and podium.
    const targetHeightFraction = 0.68;
    const requiredVisibleHeight = puzzleHeight / targetHeightFraction;
    const distY = requiredVisibleHeight / (2 * Math.tan(fovRad / 2));

    // Width framing: puzzle occupies ~88% of screen width
    const targetWidthFraction = 0.88;
    const requiredVisibleWidth = puzzleWidth / targetWidthFraction;
    const distX = requiredVisibleWidth / (2 * Math.tan(fovRad / 2) * aspect);

    // Optimal distance to fit both width and height
    const baseDistance = Math.max(distX, distY);

    // 3/4 Elevated Perspective positioning
    // Camera is elevated by baseDistance * sin(elevationAngle) and pulled back along Z
    const cameraZ = baseDistance * Math.cos(this.elevationAngle);

    // Center shift: on mobile screens, bottom HUD is slightly taller than top HUD,
    // so shifting lookAt downward by ~0.15 units places the puzzle visually centered.
    const lookAtY = puzzleCenterY - 0.15;
    const cameraY = lookAtY + baseDistance * Math.sin(this.elevationAngle);

    this.currentTargetX = centerX;
    this.currentTargetY = cameraY;
    this.currentTargetZ = cameraZ;
    this.currentLookAtY = lookAtY;

    if (animated) {
      gsap.to(this.camera.position, {
        x: centerX,
        y: cameraY,
        z: cameraZ,
        duration: 0.65,
        ease: 'power2.out',
        onUpdate: () => {
          this.camera.lookAt(centerX, lookAtY, 0);
        },
      });
    } else {
      this.camera.position.set(centerX, cameraY, cameraZ);
      this.camera.lookAt(centerX, lookAtY, 0);
    }
  }

  public playWinZoom() {
    gsap.to(this.camera.position, {
      z: this.currentTargetZ * 0.93,
      duration: 0.75,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1,
      onUpdate: () => {
        this.camera.lookAt(this.currentTargetX, this.currentLookAtY, 0);
      },
    });
  }

  public resetPosition() {
    gsap.to(this.camera.position, {
      x: this.currentTargetX,
      y: this.currentTargetY,
      z: this.currentTargetZ,
      duration: 0.4,
      ease: 'power2.out',
      onUpdate: () => {
        this.camera.lookAt(this.currentTargetX, this.currentLookAtY, 0);
      },
    });
  }

  /**
   * Projects 3D world coordinate into 2D screen pixels for UI hint alignment
   */
  public projectToScreen(
    worldPos: THREE.Vector3,
    screenWidth: number,
    screenHeight: number
  ): { x: number; y: number } {
    const v = worldPos.clone().project(this.camera);
    return {
      x: ((v.x + 1) / 2) * screenWidth,
      y: ((-v.y + 1) / 2) * screenHeight,
    };
  }
}
