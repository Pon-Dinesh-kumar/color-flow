import * as THREE from 'three';
import { TargetNode } from '../puzzle/Target';
import { MaterialManager } from './Materials';
import { COLOR_PALETTE } from '../puzzle/ColorSystem';
import gsap from 'gsap';

export class TargetCanisterMesh {
  public group: THREE.Group;
  public target: TargetNode;
  private mats = MaterialManager.getInstance();
  private fillMesh: THREE.Mesh;
  private glowRingMesh: THREE.Mesh;
  private maxFillHeight = 0.78;
  private canisterRadius = 0.46;

  constructor(target: TargetNode) {
    this.target = target;
    this.group = new THREE.Group();
    this.group.name = `target_${target.id}`;

    // Fill level mesh inside canister
    const fillGeom = new THREE.CylinderGeometry(
      this.canisterRadius * 0.86,
      this.canisterRadius * 0.86,
      this.maxFillHeight,
      28
    );
    fillGeom.translate(0, this.maxFillHeight / 2, 0);

    const fluidMat = this.mats.getFluidMaterial(target.color);
    this.fillMesh = new THREE.Mesh(fillGeom, fluidMat);
    this.fillMesh.position.y = -0.28;
    this.fillMesh.scale.y = Math.max(0.04, target.currentAmount / Math.max(1, target.requiredAmount));

    // Glowing base ring
    const ringGeom = new THREE.TorusGeometry(0.52, 0.04, 16, 32);
    const ringMat = this.mats.getBallMaterial(this.target.color);
    this.glowRingMesh = new THREE.Mesh(ringGeom, ringMat);
    this.glowRingMesh.rotation.x = Math.PI / 2;
    this.glowRingMesh.position.y = -0.42;

    this.build();
  }

  private build() {
    const canisterHeight = 1.05;
    const colorDef = COLOR_PALETTE[this.target.color] || COLOR_PALETTE.red;

    // 1. Playful Candy-Colored Base Container (clean toy look)
    const baseCylinderGeom = new THREE.CylinderGeometry(0.52, 0.54, 0.38, 28);
    const baseMat = this.mats.getToyColorMaterial(this.target.color);
    const baseCylinder = new THREE.Mesh(baseCylinderGeom, baseMat);
    baseCylinder.position.y = -0.52;
    baseCylinder.castShadow = true;
    baseCylinder.receiveShadow = true;
    this.group.add(baseCylinder);

    // Clean glossy white toy bottom rim resting on the stone dais
    const bottomRimGeom = new THREE.CylinderGeometry(0.56, 0.60, 0.14, 28);
    const bottomRim = new THREE.Mesh(bottomRimGeom, this.mats.metalCollarMaterial);
    bottomRim.position.y = -0.66;
    bottomRim.castShadow = true;
    this.group.add(bottomRim);

    // Chrome lip ring between base and glass
    const baseLipGeom = new THREE.TorusGeometry(0.53, 0.03, 16, 28);
    const baseLip = new THREE.Mesh(baseLipGeom, this.mats.metalAccentMaterial);
    baseLip.rotation.x = Math.PI / 2;
    baseLip.position.y = -0.34;
    this.group.add(baseLip);

    // Glowing base ring
    this.group.add(this.glowRingMesh);

    // 2. Crystal Toy Acrylic Glass Beaker
    const glassGeom = new THREE.LatheGeometry(
      [
        new THREE.Vector2(0, -0.46),
        new THREE.Vector2(this.canisterRadius * 0.35, -0.46),
        new THREE.Vector2(this.canisterRadius * 0.72, -0.43),
        new THREE.Vector2(this.canisterRadius * 0.94, -0.35),
        new THREE.Vector2(this.canisterRadius, -0.23),
        new THREE.Vector2(this.canisterRadius, canisterHeight - 0.46),
        new THREE.Vector2(this.canisterRadius * 0.97, canisterHeight - 0.42),
      ],
      32
    );
    const glassMesh = new THREE.Mesh(glassGeom, this.mats.pipeGlassMaterial);
    this.group.add(glassMesh);

    const hlGeom = new THREE.CylinderGeometry(this.canisterRadius * 1.01, this.canisterRadius * 1.01, canisterHeight * 0.78, 16, 1, true, -0.2, 0.4);
    const hlMesh = new THREE.Mesh(hlGeom, this.mats.pipeGlassHighlightMaterial);
    hlMesh.position.set(0, canisterHeight * 0.33, 0.02);
    this.group.add(hlMesh);

    // Raised mouth bead gives the open beaker a finished glass edge without coupling it to the pipe.
    const mouthLipGeom = new THREE.TorusGeometry(this.canisterRadius * 0.98, 0.035, 16, 32);
    const mouthLip = new THREE.Mesh(mouthLipGeom, this.mats.metalAccentMaterial);
    mouthLip.rotation.x = Math.PI / 2;
    mouthLip.position.y = canisterHeight - 0.43;
    this.group.add(mouthLip);

    // Add fill mesh inside glass
    this.group.add(this.fillMesh);
  }

  public updateFill(current: number, required: number) {
    const progress = Math.min(1.0, current / Math.max(1, required));
    gsap.to(this.fillMesh.scale, {
      y: Math.max(0.04, progress),
      duration: 0.35,
      ease: 'back.out(1.6)',
    });
  }

  public playPulse() {
    gsap.killTweensOf(this.group.scale);
    gsap.killTweensOf(this.glowRingMesh.scale);
    gsap.to(this.group.scale, {
      x: 1.08,
      y: 1.08,
      z: 1.08,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: 'power2.out',
    });

    gsap.to(this.glowRingMesh.scale, {
      x: 1.25,
      y: 1.25,
      z: 1.25,
      duration: 0.14,
      yoyo: true,
      repeat: 1,
      ease: 'power2.out',
    });
  }

  public playCelebration() {
    gsap.to(this.group.position, {
      y: this.group.position.y + 0.3,
      duration: 0.22,
      yoyo: true,
      repeat: 3,
      ease: 'sine.inOut',
    });

    gsap.to(this.glowRingMesh.scale, {
      x: 1.4,
      y: 1.4,
      z: 1.4,
      duration: 0.3,
      yoyo: true,
      repeat: 2,
    });
  }

  public getBottomY(): number {
    return this.group.position.y - 0.74;
  }
}
