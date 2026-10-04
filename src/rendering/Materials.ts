import * as THREE from 'three';
import { COLOR_PALETTE, FlowColor } from '../puzzle/ColorSystem';

export class MaterialManager {
  private static instance: MaterialManager;

  // Premium glossy glass pipe materials
  public pipeGlassMaterial: THREE.MeshPhysicalMaterial;
  public pipeGlassActiveMaterial: THREE.MeshPhysicalMaterial;

  // Polished chrome & dark titanium connector flanges
  public metalCollarMaterial: THREE.MeshStandardMaterial;
  public metalAccentMaterial: THREE.MeshStandardMaterial;

  // Platform & ground materials
  public platformMaterial: THREE.MeshStandardMaterial;

  // Pre-cached glossy ball materials
  public ballMaterials: Map<FlowColor, THREE.MeshStandardMaterial> = new Map();
  // Pre-cached target fluid materials
  public fluidMaterials: Map<FlowColor, THREE.MeshPhysicalMaterial> = new Map();

  private constructor() {
    // Ultra-glossy translucent crystal glass for pipes
    this.pipeGlassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.88,
      transmission: 0.82,
      roughness: 0.1,
      metalness: 0.05,
      ior: 1.45,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      depthWrite: false,
    });

    this.pipeGlassActiveMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.94,
      transmission: 0.78,
      roughness: 0.08,
      metalness: 0.05,
      ior: 1.48,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      depthWrite: false,
    });

    // Sleek chrome/titanium metallic collar couplings
    this.metalCollarMaterial = new THREE.MeshStandardMaterial({
      color: 0xb0c4de,
      metalness: 0.88,
      roughness: 0.22,
    });

    this.metalAccentMaterial = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.92,
      roughness: 0.28,
    });

    // Warm beveled stone podium pedestal
    this.platformMaterial = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.55,
      metalness: 0.12,
    });

    // Create high-gloss candy-like spheres for each color
    (Object.keys(COLOR_PALETTE) as FlowColor[]).forEach((color) => {
      const def = COLOR_PALETTE[color];
      this.ballMaterials.set(
        color,
        new THREE.MeshStandardMaterial({
          color: def.hexNumber,
          roughness: 0.14,
          metalness: 0.18,
          emissive: def.emissive,
          emissiveIntensity: 0.45,
        })
      );

      this.fluidMaterials.set(
        color,
        new THREE.MeshPhysicalMaterial({
          color: def.hexNumber,
          transparent: true,
          opacity: 0.92,
          transmission: 0.4,
          roughness: 0.15,
          emissive: def.emissive,
          emissiveIntensity: 0.35,
        })
      );
    });
  }

  public static getInstance(): MaterialManager {
    if (!MaterialManager.instance) {
      MaterialManager.instance = new MaterialManager();
    }
    return MaterialManager.instance;
  }

  public getBallMaterial(color: FlowColor): THREE.MeshStandardMaterial {
    return this.ballMaterials.get(color) || this.ballMaterials.get('red')!;
  }

  public getFluidMaterial(color: FlowColor): THREE.MeshPhysicalMaterial {
    return this.fluidMaterials.get(color) || this.fluidMaterials.get('red')!;
  }
}
