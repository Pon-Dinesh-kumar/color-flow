import * as THREE from 'three';
import { COLOR_PALETTE, FlowColor } from '../puzzle/ColorSystem';

export class MaterialManager {
  private static instance: MaterialManager;

  // Ultra-clear crystal glass pipe materials
  public pipeGlassMaterial: THREE.MeshPhysicalMaterial;
  public pipeGlassActiveMaterial: THREE.MeshPhysicalMaterial;

  // Polished silver chrome & metal connector flanges
  public metalCollarMaterial: THREE.MeshStandardMaterial;
  public metalAccentMaterial: THREE.MeshStandardMaterial;

  // Platform & ground materials
  public platformMaterial: THREE.MeshStandardMaterial;

  // Pre-cached candy-gloss ball materials
  public ballMaterials: Map<FlowColor, THREE.MeshStandardMaterial> = new Map();
  // Pre-cached target fluid materials
  public fluidMaterials: Map<FlowColor, THREE.MeshPhysicalMaterial> = new Map();

  private constructor() {
    // Crystal-clear translucent glass for pipes (so internal colored balls shine through!)
    this.pipeGlassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      transparent: true,
      opacity: 0.58,
      transmission: 0.90,
      roughness: 0.04,
      metalness: 0.02,
      ior: 1.46,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      depthWrite: false,
    });

    this.pipeGlassActiveMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.65,
      transmission: 0.88,
      roughness: 0.03,
      metalness: 0.02,
      ior: 1.48,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      depthWrite: false,
    });

    // Bright polished silver chrome couplings
    this.metalCollarMaterial = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.92,
      roughness: 0.14,
    });

    // Dark sleek titanium accent for base pedestals
    this.metalAccentMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.88,
      roughness: 0.22,
    });

    // Warm beveled stone podium pedestal
    this.platformMaterial = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.45,
      metalness: 0.15,
    });

    // Create high-gloss, juicy candy-like spheres for each color
    (Object.keys(COLOR_PALETTE) as FlowColor[]).forEach((color) => {
      const def = COLOR_PALETTE[color];
      this.ballMaterials.set(
        color,
        new THREE.MeshStandardMaterial({
          color: def.hexNumber,
          roughness: 0.06,
          metalness: 0.08,
          emissive: def.emissive,
          emissiveIntensity: 0.55,
        })
      );

      this.fluidMaterials.set(
        color,
        new THREE.MeshPhysicalMaterial({
          color: def.hexNumber,
          transparent: true,
          opacity: 0.94,
          transmission: 0.25,
          roughness: 0.08,
          emissive: def.emissive,
          emissiveIntensity: 0.6,
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
