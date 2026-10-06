import * as THREE from 'three';
import { MaterialManager } from './Materials';
import { PuzzleBounds } from '../engine/CameraManager';

export class EnvironmentManager {
  private scene: THREE.Scene;
  private mats = MaterialManager.getInstance();
  private platformGroup: THREE.Group;
  private platformBounds: PuzzleBounds | null = null;
  private readonly deckThickness = 0.18;
  private readonly plinthThickness = 0.22;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.platformGroup = new THREE.Group();
    this.platformGroup.name = 'podium_platform';
    this.scene.add(this.platformGroup);

    this.setupLighting();
    this.setupBackground();
  }

  private setupLighting() {
    // 1. Natural Sky-to-Ground Hemisphere Fill with warm sunset bounce
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0xfed7aa, 1.35);
    this.scene.add(hemiLight);

    // 2. Warm Golden Sun Key Light from upper right
    const keyLight = new THREE.DirectionalLight(0xffedd5, 2.6);
    keyLight.position.set(5.5, 8.5, 5.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.camera.left = -8;
    keyLight.shadow.camera.right = 8;
    keyLight.shadow.camera.top = 8;
    keyLight.shadow.camera.bottom = -8;
    keyLight.shadow.bias = -0.0003;
    keyLight.shadow.radius = 2.5;
    this.scene.add(keyLight);

    // 3. Sunset Rim Light from behind giving translucent glass and spheres edge gleam
    const rimLight = new THREE.DirectionalLight(0xfb923c, 2.6);
    rimLight.position.set(0, 3.5, -6.5);
    this.scene.add(rimLight);

    // 4. Cool Blue Skylight Fill from upper-left
    const skyFill = new THREE.DirectionalLight(0x93c5fd, 1.4);
    skyFill.position.set(-5.5, 6.5, 4.0);
    this.scene.add(skyFill);

    // 5. Soft Front Camera Fill Light
    const frontFill = new THREE.DirectionalLight(0xffffff, 0.6);
    frontFill.position.set(0, 1.5, 8.5);
    this.scene.add(frontFill);
  }

  private setupBackground() {
    // The complete uncropped default background is rendered directly on the mobile game
    // container behind the transparent WebGL canvas. This ensures 100% of the background
    // is visible with zero cropping across all mobile and desktop viewports, with no distortion
    // from 3D camera angles or zooms.
  }

  public updateBackgroundTexture(urlOrDataUri: string) {
    // Dynamically updates background URL in game store for instant uncropped display
    import('../game/gameState').then(({ useGameStore }) => {
      useGameStore.getState().setBackgroundUrl(urlOrDataUri);
    });
  }

  private setupSkyline() {
    // Omitted in favor of the complete default background art
  }

  public getPlatformBounds(bounds: PuzzleBounds): PuzzleBounds {
    return this.platformBounds ?? bounds;
  }

  public updatePlatform(
    bounds: PuzzleBounds,
    targetCount = 1,
    surfaceY = bounds.minY
  ): PuzzleBounds {
    while (this.platformGroup.children.length > 0) {
      const child = this.platformGroup.children[0];
      this.platformGroup.remove(child);
      if ((child as THREE.Mesh).geometry) {
        (child as THREE.Mesh).geometry.dispose();
      }
    }

    const centerX = (bounds.minX + bounds.maxX) / 2;
    return this.buildPlatform(bounds, targetCount, surfaceY, centerX);
  }

  private buildPlatform(
    bounds: PuzzleBounds,
    targetCount: number,
    surfaceY: number,
    centerX: number
  ): PuzzleBounds {
    const boardWidth = Math.max(0, bounds.maxX - bounds.minX);
    const targetSpan = Math.max(0, targetCount - 1) * 1.6 + 1.2;
    const platformWidth = Math.max(3.8, boardWidth + 0.8, targetSpan + 0.8);
    const platformDepth = 2.4;

    const deck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, this.deckThickness, 64),
      this.mats.platformMaterial
    );
    deck.name = 'podium_deck';
    deck.scale.set(platformWidth, 1, platformDepth);
    deck.position.set(centerX, surfaceY - this.deckThickness / 2, 0);
    deck.receiveShadow = true;
    deck.castShadow = true;
    this.platformGroup.add(deck);

    const plinthWidth = platformWidth + 0.22;
    const plinthDepth = platformDepth + 0.18;
    const plinth = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, this.plinthThickness, 64),
      this.mats.metalCollarMaterial
    );
    plinth.name = 'podium_plinth';
    plinth.scale.set(plinthWidth, 1, plinthDepth);
    plinth.position.set(
      centerX,
      surfaceY - this.deckThickness - this.plinthThickness / 2,
      0
    );
    plinth.receiveShadow = true;
    plinth.castShadow = true;
    this.platformGroup.add(plinth);

    const inlay = new THREE.Mesh(
      new THREE.TorusGeometry(1, 0.012, 8, 96),
      this.mats.metalAccentMaterial
    );
    inlay.name = 'podium_inlay';
    inlay.rotation.x = Math.PI / 2;
    inlay.scale.set(platformWidth * 0.41, platformDepth * 0.36, 1);
    inlay.position.set(centerX, surfaceY + 0.006, 0);
    this.platformGroup.add(inlay);

    this.platformBounds = {
      minX: centerX - plinthWidth / 2,
      maxX: centerX + plinthWidth / 2,
      minY: Math.min(
        bounds.minY,
        surfaceY - this.deckThickness - this.plinthThickness
      ),
      maxY: bounds.maxY,
    };
    return this.platformBounds;
  }
}
