import * as THREE from 'three';
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
    // 1. Natural Sky-to-Ground Hemisphere Fill
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0xfef08a, 1.0);
    this.scene.add(hemiLight);

    // 2. Warm Key Sun Light casting soft shadows
    const keyLight = new THREE.DirectionalLight(0xfffaf0, 1.55);
    keyLight.position.set(4.5, 9.5, 6.5);
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

    // 3. Crisp Rim Light from behind-left giving translucent pipes and canisters edge gleam
    const rimLight = new THREE.DirectionalLight(0xa5f3fc, 1.25);
    rimLight.position.set(-5.5, 4.5, -4.5);
    this.scene.add(rimLight);

    // 4. Soft Front Camera Fill Light
    const frontFill = new THREE.DirectionalLight(0xffffff, 0.45);
    frontFill.position.set(0, 1.5, 8.5);
    this.scene.add(frontFill);
  }

  private setupBackground() {
    // Canvas fallback gradient while image loads
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    const gradient = ctx.createLinearGradient(0, 0, 0, 1024);
    gradient.addColorStop(0.0, '#1d4ed8');
    gradient.addColorStop(0.2, '#38bdf8');
    gradient.addColorStop(0.48, '#818cf8');
    gradient.addColorStop(0.7, '#c084fc');
    gradient.addColorStop(0.85, '#f472b6');
    gradient.addColorStop(1.0, '#fde047');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 1024);

    const fallbackTexture = new THREE.CanvasTexture(canvas);
    fallbackTexture.generateMipmaps = false;
    fallbackTexture.minFilter = THREE.LinearFilter;

    // 9:16 Aspect plane matching mobile screen framing
    const planeHeight = 38;
    const planeWidth = planeHeight * (9 / 16); // 21.375

    const bgGeom = new THREE.PlaneGeometry(planeWidth, planeHeight);
    const bgMat = new THREE.MeshBasicMaterial({
      map: fallbackTexture,
      depthWrite: false,
    });

    this.backgroundMesh = new THREE.Mesh(bgGeom, bgMat);
    this.backgroundMesh.position.set(0, 0.5, -11);
    this.scene.add(this.backgroundMesh);

    // Load the user's default background photo from assets
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      '/assets/default_background.jpg',
      (loadedTex) => {
        loadedTex.colorSpace = THREE.SRGBColorSpace;
        loadedTex.minFilter = THREE.LinearFilter;
        loadedTex.magFilter = THREE.LinearFilter;
        bgMat.map = loadedTex;
        bgMat.needsUpdate = true;

        // Hide procedural skyline when photo asset is loaded
        if (this.skylineGroup) {
          this.skylineGroup.visible = false;
        }
      },
      undefined,
      (err) => {
        console.warn('Could not load /assets/default_background.jpg, using procedural gradient fallback', err);
      }
    );

    // Setup procedural skyline fallback
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
      // Multi-target: Elongated rounded stone dais
      const spanWidth = Math.max(3.8, bounds.maxX - bounds.minX + 1.4);
      const depth = 2.8;
      const topHeight = 0.34;

      const topGeom = new THREE.BoxGeometry(spanWidth, topHeight, depth);
      const topMesh = new THREE.Mesh(topGeom, stoneMat);
      topMesh.position.set(centerX, bottomY - topHeight / 2, 0);
      topMesh.receiveShadow = true;
      topMesh.castShadow = true;
      this.platformGroup.add(topMesh);

      // Lower base step
      const baseGeom = new THREE.BoxGeometry(spanWidth + 0.7, 0.28, depth + 0.6);
      const baseMesh = new THREE.Mesh(baseGeom, stoneMat);
      baseMesh.position.set(centerX, bottomY - topHeight - 0.14, 0);
      baseMesh.receiveShadow = true;
      this.platformGroup.add(baseMesh);
    }
  }
}
