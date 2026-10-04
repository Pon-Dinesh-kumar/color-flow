import * as THREE from 'three';
import defaultBackground from '../assets/images/default_bg_1791135886423.png';
import { MaterialManager } from './Materials';
import { PuzzleBounds } from '../engine/CameraManager';

export class EnvironmentManager {
  private scene: THREE.Scene;
  private mats = MaterialManager.getInstance();
  private backgroundMesh: THREE.Mesh | null = null;
  private platformGroup: THREE.Group;
  private skylineGroup: THREE.Group | null = null;

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
    const planeHeight = 38;
    const planeWidth = planeHeight * (9 / 16);

    const bgMat = new THREE.MeshBasicMaterial({
      map: null,
      depthWrite: false,
    });

    const bgGeom = new THREE.PlaneGeometry(planeWidth, planeHeight);
    this.backgroundMesh = new THREE.Mesh(bgGeom, bgMat);
    this.backgroundMesh.position.set(0, 0.5, -11);
    this.scene.add(this.backgroundMesh);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      defaultBackground,
      (loadedTex) => {
        loadedTex.colorSpace = THREE.SRGBColorSpace;
        loadedTex.minFilter = THREE.LinearFilter;
        loadedTex.magFilter = THREE.LinearFilter;
        bgMat.map = loadedTex;
        bgMat.needsUpdate = true;

        if (this.skylineGroup) {
          this.skylineGroup.visible = false;
        }
      },
      undefined,
      (err) => {
        console.warn('Could not load default background image:', err);
      }
    );

    this.setupSkyline();
  }

  public updateBackgroundTexture(urlOrDataUri: string) {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      urlOrDataUri,
      (loadedTex) => {
        loadedTex.colorSpace = THREE.SRGBColorSpace;
        loadedTex.minFilter = THREE.LinearFilter;
        loadedTex.magFilter = THREE.LinearFilter;
        if (this.backgroundMesh) {
          (this.backgroundMesh.material as THREE.MeshBasicMaterial).map = loadedTex;
          (this.backgroundMesh.material as THREE.MeshBasicMaterial).needsUpdate = true;
        }
        if (this.skylineGroup) {
          this.skylineGroup.visible = false;
        }
      },
      undefined,
      (err) => {
        console.warn('Failed to update background texture:', err);
      }
    );
  }

  private setupSkyline() {
    this.skylineGroup = new THREE.Group();
    this.skylineGroup.position.set(0, -5, -9);

    const bldgMat = new THREE.MeshBasicMaterial({
      color: 0xfbcfe8,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
    });

    const heights = [4.2, 5.8, 4.6, 7.0, 5.2, 8.2, 6.4, 4.8, 7.2, 4.4, 6.0, 5.0];
    const spacing = 2.0;
    const startX = -((heights.length - 1) * spacing) / 2;

    heights.forEach((h, i) => {
      const w = 1.2 + (i % 3) * 0.35;
      const geom = new THREE.BoxGeometry(w, h, 0.8);
      const mesh = new THREE.Mesh(geom, bldgMat);
      mesh.position.set(startX + i * spacing, h / 2, 0);
      this.skylineGroup!.add(mesh);
    });

    this.scene.add(this.skylineGroup);
  }

  /**
   * Builds the cohesive stone podium/platform beneath the puzzle
   * so target canisters rest firmly on a solid stone stage.
   */
  public updatePlatform(bounds: PuzzleBounds, targetCount = 1) {
    while (this.platformGroup.children.length > 0) {
      const child = this.platformGroup.children[0];
      this.platformGroup.remove(child);
      if ((child as THREE.Mesh).geometry) {
        (child as THREE.Mesh).geometry.dispose();
      }
    }

    const centerX = (bounds.minX + bounds.maxX) / 2;
    const bottomY = bounds.minY; // exact bottom of the target canister pedestals

    const stoneMat = this.mats.platformMaterial;
    const accentMat = this.mats.metalCollarMaterial;

    if (targetCount <= 1) {
      // Single Target: Elegant circular stone podium
      const topRadius = 1.45;
      const topHeight = 0.32;

      // Top stone disc
      const topGeom = new THREE.CylinderGeometry(topRadius, topRadius * 1.04, topHeight, 36);
      const topMesh = new THREE.Mesh(topGeom, stoneMat);
      topMesh.position.set(centerX, bottomY - topHeight / 2, 0);
      topMesh.receiveShadow = true;
      topMesh.castShadow = true;
      this.platformGroup.add(topMesh);

      // Beveled stone rim ring at top surface
      const rimGeom = new THREE.TorusGeometry(topRadius, 0.04, 16, 36);
      const rimMesh = new THREE.Mesh(rimGeom, accentMat);
      rimMesh.rotation.x = Math.PI / 2;
      rimMesh.position.set(centerX, bottomY, 0);
      this.platformGroup.add(rimMesh);

      // Lower stepped stone base plinth
      const baseRadius = 1.85;
      const baseHeight = 0.28;
      const baseGeom = new THREE.CylinderGeometry(baseRadius, baseRadius * 1.06, baseHeight, 36);
      const baseMesh = new THREE.Mesh(baseGeom, stoneMat);
      baseMesh.position.set(centerX, bottomY - topHeight - baseHeight / 2, 0);
      baseMesh.receiveShadow = true;
      this.platformGroup.add(baseMesh);

      // Concentric stone groove detail on top
      const grooveGeom = new THREE.TorusGeometry(topRadius * 0.72, 0.02, 8, 32);
      const groove = new THREE.Mesh(grooveGeom, accentMat);
      groove.rotation.x = Math.PI / 2;
      groove.position.set(centerX, bottomY + 0.005, 0);
      this.platformGroup.add(groove);
    } else {
      // Multi-target / Home Screen: Subtle soft contact shadow discs under each target base
      // allowing the background circular stone dais to be seen with natural grounding!
      const shadowMat = new THREE.ShadowMaterial({ opacity: 0.35 });

      // Subtle shadow catcher plane at bottom
      const shadowPlaneGeom = new THREE.PlaneGeometry(6, 4);
      const shadowPlane = new THREE.Mesh(shadowPlaneGeom, shadowMat);
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.position.set(centerX, bottomY + 0.01, 0);
      shadowPlane.receiveShadow = true;
      this.platformGroup.add(shadowPlane);
    }
  }
}
