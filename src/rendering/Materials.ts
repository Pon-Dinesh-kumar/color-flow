import * as THREE from 'three';
import { COLOR_PALETTE, FlowColor } from '../puzzle/ColorSystem';

export class MaterialManager {
  private static instance: MaterialManager;

  // Ultra-clear high-visibility crystal glass pipe materials
  public pipeGlassMaterial: THREE.MeshPhysicalMaterial;
  public pipeGlassActiveMaterial: THREE.MeshPhysicalMaterial;
  public pipeGlassContourMaterial: THREE.MeshStandardMaterial;
  public pipeGlassHighlightMaterial: THREE.MeshBasicMaterial;

  // Dark gunmetal connector rings & polished silver chrome flanges
  public metalCollarMaterial: THREE.MeshStandardMaterial;
  public metalAccentMaterial: THREE.MeshStandardMaterial;

  // Cobalt blue junction box material
  public junctionBlueMaterial: THREE.MeshPhysicalMaterial;
  public junctionDarkMaterial: THREE.MeshStandardMaterial;

  // Platform & ground materials
  public platformMaterial: THREE.MeshStandardMaterial;

  // Pre-cached high-quality PBR glossy ball materials (from Ball Model Guide)
  public ballMaterials: Map<FlowColor, THREE.MeshPhysicalMaterial> = new Map();
  // Pre-cached target fluid materials
  public fluidMaterials: Map<FlowColor, THREE.MeshPhysicalMaterial> = new Map();

  private constructor() {
    // 1. Transparent Glass with clear silhouette & refraction
    // Tuned so internal colored balls pop while the glass cylinder remains distinctly visible against any background
    this.pipeGlassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.52,
      transmission: 0.52, // Balanced transmission ensures glass is visible even over bright clouds
      roughness: 0.05,
      metalness: 0.02,
      ior: 1.52,
      thickness: 0.65,
      attenuationColor: new THREE.Color(0x94a3b8),
      attenuationDistance: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      depthWrite: false,
    });

    this.pipeGlassActiveMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.68,
      transmission: 0.45,
      roughness: 0.04,
      metalness: 0.02,
      ior: 1.52,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      depthWrite: false,
    });

    // 2. Subtle glass contour / inner refraction back-silhouette (guarantees pipe visibility over bright sky/clouds)
    this.pipeGlassContourMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.18,
      side: THREE.BackSide,
      roughness: 0.2,
      depthWrite: false,
    });

    // 3. Crisp white longitudinal glass reflection highlight strip
    this.pipeGlassHighlightMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    // 4. Dark charcoal / gunmetal connector rings (Metal Ring / Connector from reference image)
    this.metalCollarMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.88,
      roughness: 0.22,
    });

    // 5. Polished silver chrome beveled rim flange
    this.metalAccentMaterial = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.10,
    });

    // 6. Cobalt blue glossy cube for Rotatable Junction
    this.junctionBlueMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      metalness: 0.12,
      roughness: 0.18,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      emissive: 0x0369a1,
      emissiveIntensity: 0.35,
    });

    // 7. Dark rubberized bezel trim for junction
    this.junctionDarkMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.82,
      roughness: 0.35,
    });

    // 8. Stone podium pedestal
    this.platformMaterial = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.45,
      metalness: 0.15,
    });

    // 9. High-gloss, high-specular spheres with subtle glow (Ball Model in reference)
    (Object.keys(COLOR_PALETTE) as FlowColor[]).forEach((color) => {
      const def = COLOR_PALETTE[color];
      this.ballMaterials.set(
        color,
        new THREE.MeshPhysicalMaterial({
          color: def.hexNumber,
          metalness: 0.04,
          roughness: 0.12,
          clearcoat: 1.0,
          clearcoatRoughness: 0.08,
          transmission: 0.0,
          emissive: def.hexNumber,
          emissiveIntensity: 0.28,
          reflectivity: 0.85,
        })
      );

      this.fluidMaterials.set(
        color,
        new THREE.MeshPhysicalMaterial({
          color: def.hexNumber,
          transparent: true,
          opacity: 0.95,
          transmission: 0.22,
          roughness: 0.08,
          emissive: def.hexNumber,
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

  public getBallMaterial(color: FlowColor): THREE.MeshPhysicalMaterial {
    return this.ballMaterials.get(color) || this.ballMaterials.get('red')!;
  }

  public getFluidMaterial(color: FlowColor): THREE.MeshPhysicalMaterial {
    return this.fluidMaterials.get(color) || this.fluidMaterials.get('red')!;
  }
}
