import * as THREE from 'three';
import { COLOR_PALETTE, FlowColor } from '../puzzle/ColorSystem';

export class MaterialManager {
  private static instance: MaterialManager;

  // Friendly crystal-clear toy acrylic pipe materials
  public pipeGlassMaterial: THREE.MeshPhysicalMaterial;
  public pipeGlassActiveMaterial: THREE.MeshPhysicalMaterial;
  public pipeGlassContourMaterial: THREE.MeshStandardMaterial;
  public pipeGlassHighlightMaterial: THREE.MeshBasicMaterial;

  // Playful toy collar materials (clean glossy white enamel & polished chrome lips)
  public metalCollarMaterial: THREE.MeshStandardMaterial;
  public metalAccentMaterial: THREE.MeshStandardMaterial;

  // Candy toy colored materials for canister caps, funnels & accents
  public toyColorMaterials: Map<FlowColor, THREE.MeshStandardMaterial> = new Map();

  // Candy blue rotatable junction box material
  public junctionBlueMaterial: THREE.MeshPhysicalMaterial;
  public junctionWhiteMaterial: THREE.MeshStandardMaterial;

  // Platform & ground materials
  public platformMaterial: THREE.MeshStandardMaterial;

  // High-specular juicy candy ball materials (Kids game candy-gloss feel)
  public ballMaterials: Map<FlowColor, THREE.MeshPhysicalMaterial> = new Map();
  // Target fluid materials
  public fluidMaterials: Map<FlowColor, THREE.MeshPhysicalMaterial> = new Map();

  private constructor() {
    // 1. Crystal-clear friendly toy acrylic for pipes
    this.pipeGlassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.42,
      transmission: 0.65,
      roughness: 0.02,
      metalness: 0.01,
      ior: 1.50,
      thickness: 0.5,
      attenuationColor: new THREE.Color(0xa5b4fc),
      attenuationDistance: 1.4,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      depthWrite: false,
    });

    this.pipeGlassActiveMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.65,
      transmission: 0.45,
      roughness: 0.03,
      metalness: 0.02,
      ior: 1.50,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      depthWrite: false,
    });

    // 2. Soft glass contour for background separation (playful lavender-sky tint instead of gloomy dark grey)
    this.pipeGlassContourMaterial = new THREE.MeshStandardMaterial({
      color: 0xc7e7ff,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      roughness: 0.18,
      metalness: 0.08,
      depthWrite: false,
    });

    // 3. Crisp white longitudinal glass reflection highlight strip
    this.pipeGlassHighlightMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.70,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    // 4. Clean, glossy white porcelain / toy enamel collar cuffs (kids game friendly!)
    this.metalCollarMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.12,
      metalness: 0.10,
    });

    // 5. Cheerful polished chrome bevel lip
    this.metalAccentMaterial = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.08,
    });

    // 6. Vibrant candy-blue cube for Rotatable Junction
    this.junctionBlueMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0ea5e9,
      metalness: 0.08,
      roughness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      emissive: 0x0284c7,
      emissiveIntensity: 0.28,
    });

    // Molded 3D white button dial
    this.junctionWhiteMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.15,
      metalness: 0.05,
    });

    // 7. Stone podium pedestal
    this.platformMaterial = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.45,
      metalness: 0.15,
    });

    // 8. Juicy, vibrant candy ball & toy fixture materials
    (Object.keys(COLOR_PALETTE) as FlowColor[]).forEach((color) => {
      const def = COLOR_PALETTE[color];

      // Toy plastic for caps & funnels
      this.toyColorMaterials.set(
        color,
        new THREE.MeshStandardMaterial({
          color: def.hexNumber,
          roughness: 0.18,
          metalness: 0.05,
          emissive: def.hexNumber,
          emissiveIntensity: 0.20,
        })
      );

      // Juicy candy spheres with high specular shine and warm inner glow
      this.ballMaterials.set(
        color,
        new THREE.MeshPhysicalMaterial({
          color: def.hexNumber,
          metalness: 0.02,
          roughness: 0.08,
          clearcoat: 1.0,
          clearcoatRoughness: 0.04,
          transmission: 0.0,
          emissive: def.hexNumber,
          emissiveIntensity: 0.32,
          reflectivity: 0.90,
        })
      );

      // Target fluid
      this.fluidMaterials.set(
        color,
        new THREE.MeshPhysicalMaterial({
          color: def.hexNumber,
          transparent: true,
          opacity: 0.94,
          transmission: 0.20,
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

  public getToyColorMaterial(color: FlowColor): THREE.MeshStandardMaterial {
    return this.toyColorMaterials.get(color) || this.toyColorMaterials.get('red')!;
  }
}
