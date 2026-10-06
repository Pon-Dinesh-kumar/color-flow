import * as THREE from 'three';
import { TargetNode } from '../puzzle/Target';
import { MaterialManager } from './Materials';
import { COLOR_PALETTE } from '../puzzle/ColorSystem';
import { PipeTextureFactory } from './PipeTextureFactory';
import gsap from 'gsap';

export class TargetCanisterMesh {
  public group: THREE.Group;
  public target: TargetNode;
  private mats = MaterialManager.getInstance();
  private fillMesh: THREE.Mesh;
  private glowRingMesh: THREE.Mesh;
  private lockBadgeMesh: THREE.Mesh;
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
    fillGeom.translate(0, this.maxFillHeight / 2, 0);

    const fluidMat = this.mats.getFluidMaterial(target.color);
    this.fillMesh = new THREE.Mesh(fillGeom, fluidMat);
    this.fillMesh.position.y = -0.40;
    this.fillMesh.scale.y = Math.max(0.04, target.currentAmount / Math.max(1, target.requiredAmount));

    // Glowing base ring
    const ringGeom = new THREE.TorusGeometry(0.52, 0.04, 16, 32);
    const ringMat = this.mats.getBallMaterial(this.target.color);
    this.glowRingMesh = new THREE.Mesh(ringGeom, ringMat);
    this.glowRingMesh.rotation.x = Math.PI / 2;
    this.glowRingMesh.position.y = -0.42;

    // Victory Lock Badge ("Locked When Correct" from reference image)
    const lockBadgeGeom = new THREE.PlaneGeometry(0.38, 0.38);
    const lockBadgeMat = new THREE.MeshBasicMaterial({
      map: PipeTextureFactory.getLockTexture(),
      transparent: true,
      depthWrite: false,
    });
    this.lockBadgeMesh = new THREE.Mesh(lockBadgeGeom, lockBadgeMat);
    this.lockBadgeMesh.position.set(0, 0.15, 0.48);
    this.lockBadgeMesh.visible = target.currentAmount >= target.requiredAmount;

    this.build();
  }

  private build() {
    const canisterHeight = 1.05;
    const colorDef = COLOR_PALETTE[this.target.color] || COLOR_PALETTE.red;

    // 1. Base Container (With Color Fill) from reference image
    const baseCylinderGeom = new THREE.CylinderGeometry(0.52, 0.54, 0.38, 28);
    const baseMat = new THREE.MeshStandardMaterial({
      color: colorDef.hexNumber,
      roughness: 0.25,
      metalness: 0.1,
      emissive: colorDef.emissive,
      emissiveIntensity: 0.35,
    });
    const baseCylinder = new THREE.Mesh(baseCylinderGeom, baseMat);
    baseCylinder.position.y = -0.52;
    baseCylinder.castShadow = true;
    baseCylinder.receiveShadow = true;
    this.group.add(baseCylinder);

    // Dark charcoal bottom rim collar resting on stone dais
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

    // 2. Transparent Glass Beaker (high visibility with contour)
    const glassGeom = new THREE.CylinderGeometry(this.canisterRadius, this.canisterRadius, canisterHeight, 28);
    const glassMesh = new THREE.Mesh(glassGeom, this.mats.pipeGlassMaterial);
    glassMesh.position.y = 0.1;
    this.group.add(glassMesh);

    const contourGeom = new THREE.CylinderGeometry(this.canisterRadius * 0.96, this.canisterRadius * 0.96, canisterHeight * 0.98, 28);
    const contourMesh = new THREE.Mesh(contourGeom, this.mats.pipeGlassContourMaterial);
    contourMesh.position.y = 0.1;
    this.group.add(contourMesh);

    const hlGeom = new THREE.CylinderGeometry(this.canisterRadius * 1.01, this.canisterRadius * 1.01, canisterHeight * 0.94, 16, 1, true, -0.2, 0.4);
    const hlMesh = new THREE.Mesh(hlGeom, this.mats.pipeGlassHighlightMaterial);
    hlMesh.position.set(0, 0.1, 0.02);
    this.group.add(hlMesh);

    // 3. Chrome intake collar at top (meeting pipe above)
    const intakeCollarGeom = new THREE.CylinderGeometry(0.32, this.canisterRadius * 1.04, 0.24, 28);
    const intakeCollar = new THREE.Mesh(intakeCollarGeom, this.mats.metalCollarMaterial);
    intakeCollar.position.y = 0.68;
    intakeCollar.castShadow = true;
    this.group.add(intakeCollar);

    const intakeLipGeom = new THREE.TorusGeometry(0.33, 0.03, 16, 28);
    const intakeLip = new THREE.Mesh(intakeLipGeom, this.mats.metalAccentMaterial);
    intakeLip.rotation.x = Math.PI / 2;
    intakeLip.position.y = 0.78;
    this.group.add(intakeLip);

    // Add fill mesh inside glass
    this.group.add(this.fillMesh);

    // Add lock badge mesh
    this.group.add(this.lockBadgeMesh);
  }

  public updateFill(current: number, required: number) {
    const progress = Math.min(1.0, current / Math.max(1, required));
    gsap.to(this.fillMesh.scale, {
      y: Math.max(0.04, progress),
      duration: 0.35,
      ease: 'back.out(1.6)',
    });

    if (current >= required) {
      this.lockBadgeMesh.visible = true;
      gsap.fromTo(
        this.lockBadgeMesh.scale,
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 1, z: 1, duration: 0.4, ease: 'elastic.out(1, 0.5)' }
      );
    } else {
      this.lockBadgeMesh.visible = false;
    }
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
