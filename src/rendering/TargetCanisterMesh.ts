import * as THREE from 'three';
import { TargetNode } from '../puzzle/Target';
import { MaterialManager } from './Materials';
import gsap from 'gsap';

export class TargetCanisterMesh {
  public group: THREE.Group;
  public target: TargetNode;
  private mats = MaterialManager.getInstance();
  private fillMesh: THREE.Mesh;
  private glowRingMesh: THREE.Mesh;
  private maxFillHeight = 0.95;
  private canisterRadius = 0.46;

  constructor(target: TargetNode) {
    this.target = target;
    this.group = new THREE.Group();
    this.group.name = `target_${target.id}`;

    // Fill level mesh inside canister
    const fillGeom = new THREE.CylinderGeometry(
      this.canisterRadius * 0.92,
      this.canisterRadius * 0.92,
      this.maxFillHeight,
      28
    );
    // Shift geometry origin so scaling in Y grows upwards from the bottom
    fillGeom.translate(0, this.maxFillHeight / 2, 0);

    const fluidMat = this.mats.getFluidMaterial(target.color);
    this.fillMesh = new THREE.Mesh(fillGeom, fluidMat);
    this.fillMesh.position.y = -0.42;
    this.fillMesh.scale.y = Math.max(0.04, target.currentAmount / Math.max(1, target.requiredAmount));

    // Glowing base ring
    const ringGeom = new THREE.TorusGeometry(0.52, 0.05, 16, 32);
    const ringMat = this.mats.getBallMaterial(this.target.color);
    this.glowRingMesh = new THREE.Mesh(ringGeom, ringMat);
    this.glowRingMesh.rotation.x = Math.PI / 2;
    this.glowRingMesh.position.y = -0.42;

    this.build();
  }

  private build() {
    const canisterHeight = 1.05;

    // Solid pedestal mount with beveled edge
    const pedestalGeom = new THREE.CylinderGeometry(0.56, 0.64, 0.32, 28);
    const pedestal = new THREE.Mesh(pedestalGeom, this.mats.metalCollarMaterial);
    pedestal.position.y = -0.58;
    pedestal.castShadow = true;
    pedestal.receiveShadow = true;
    this.group.add(pedestal);

    // Glowing base ring indicating the required target color
    this.group.add(this.glowRingMesh);

    // Translucent glass beaker/collection canister
    const glassGeom = new THREE.CylinderGeometry(this.canisterRadius, this.canisterRadius, canisterHeight, 28);
    const glassMesh = new THREE.Mesh(glassGeom, this.mats.pipeGlassMaterial);
    glassMesh.position.y = 0.1;
    this.group.add(glassMesh);

    // Chrome intake collar at top (y = 0.68) meeting the bottom collar of the pipe above (y = 0.8)
    const intakeCollarGeom = new THREE.CylinderGeometry(0.3, this.canisterRadius * 1.04, 0.24, 28);
    const intakeCollar = new THREE.Mesh(intakeCollarGeom, this.mats.metalCollarMaterial);
    intakeCollar.position.y = 0.68;
    intakeCollar.castShadow = true;
    this.group.add(intakeCollar);

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
    gsap.to(this.group.scale, {
      x: 1.12,
      y: 1.12,
      z: 1.12,
      duration: 0.12,
      yoyo: true,
      repeat: 1,
      ease: 'power2.out',
    });
  }

  public playCelebration() {
    // Joyous bounce and ring flare
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
