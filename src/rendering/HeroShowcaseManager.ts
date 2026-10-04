import * as THREE from 'three';
import gsap from 'gsap';
import { MaterialManager } from './Materials';

export class HeroShowcaseManager {
  public group: THREE.Group;
  private mats = MaterialManager.getInstance();

  // Containers
  private redSourceGroup: THREE.Group | null = null;
  private blueSourceGroup: THREE.Group | null = null;
  private redTargetGroup: THREE.Group | null = null;
  private blueTargetGroup: THREE.Group | null = null;
  private valveGroup: THREE.Group | null = null;

  // Fluid scale meshes for celebration pulse
  private redFluidMesh: THREE.Mesh | null = null;
  private blueFluidMesh: THREE.Mesh | null = null;

  // Path Splines
  private redUpperCurve!: THREE.CatmullRomCurve3;
  private blueUpperCurve!: THREE.CatmullRomCurve3;
  private redLowerCurve!: THREE.CatmullRomCurve3;
  private blueLowerCurve!: THREE.CatmullRomCurve3;

  // Candy-gloss flow spheres
  private redBallsUpper: THREE.Mesh[] = [];
  private redBallsLower: THREE.Mesh[] = [];
  private blueBallsUpper: THREE.Mesh[] = [];
  private blueBallsLower: THREE.Mesh[] = [];

  private animTimer = 0;
  private valveTween: gsap.core.Tween | null = null;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'hero_showcase_group';
    this.buildShowcase();
  }

  private createRotationIconTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Rich glossy blue rounded square background
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.roundRect(16, 16, 224, 224, 38);
    ctx.fill();

    // Subtle radial light reflection
    const radGrad = ctx.createRadialGradient(128, 128, 10, 128, 128, 115);
    radGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    radGrad.addColorStop(1, 'rgba(2, 132, 199, 0.1)');
    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.roundRect(16, 16, 224, 224, 38);
    ctx.fill();

    // Polished white/cyan border rim
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.roundRect(16, 16, 224, 224, 38);
    ctx.stroke();

    // Circular rotation arrows (matching reference 🔄)
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 15;
    ctx.lineCap = 'round';

    const cx = 128;
    const cy = 128;
    const r = 56;

    // Top arc
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI * 0.82, -Math.PI * 0.1);
    ctx.stroke();

    // Top arrow head
    const topX = cx + r * Math.cos(-Math.PI * 0.1);
    const topY = cy + r * Math.sin(-Math.PI * 0.1);
    ctx.beginPath();
    ctx.moveTo(topX - 6, topY - 18);
    ctx.lineTo(topX + 17, topY);
    ctx.lineTo(topX - 6, topY + 17);
    ctx.closePath();
    ctx.fill();

    // Bottom arc
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI * 0.18, Math.PI * 0.9);
    ctx.stroke();

    // Bottom arrow head
    const botX = cx + r * Math.cos(Math.PI * 0.9);
    const botY = cy + r * Math.sin(Math.PI * 0.9);
    ctx.beginPath();
    ctx.moveTo(botX + 6, botY + 18);
    ctx.lineTo(botX - 17, botY);
    ctx.lineTo(botX + 6, botY - 17);
    ctx.closePath();
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  private buildShowcase() {
    // 1. Source Containers (Elevated Top-Left & Top-Right)
    this.buildSources();

    // 2. Target Containers (Resting on Platform Bottom-Left & Bottom-Right)
    this.buildTargets();

    // 3. Compact Central Valve (25% smaller, glossy blue with 🔄 symbol)
    this.buildValve();

    // 4. Crystal-Clear Translucent Glass Pipes
    this.buildPipes();

    // 5. Candy-Gloss Flow Balls
    this.buildFlowBalls();
  }

  /**
   * Builds bright, friendly, non-industrial source canisters with clear glass,
   * glossy colored balls inside, and polished chrome trim.
   */
  private buildSources() {
    const canisterRadius = 0.42;
    const canisterHeight = 0.85;

    // --- RED SOURCE (Left: x = -1.35, y = 1.48) ---
    this.redSourceGroup = new THREE.Group();
    this.redSourceGroup.position.set(-1.35, 1.48, 0);

    // Clear glass cylinder
    const glassGeom = new THREE.CylinderGeometry(canisterRadius, canisterRadius, canisterHeight, 32);
    const glassMeshRed = new THREE.Mesh(glassGeom, this.mats.pipeGlassMaterial);
    glassMeshRed.castShadow = true;
    this.redSourceGroup.add(glassMeshRed);

    // Polished chrome top cap
    const topCapGeom = new THREE.CylinderGeometry(canisterRadius * 1.06, canisterRadius * 1.06, 0.12, 32);
    const topCapRed = new THREE.Mesh(topCapGeom, this.mats.metalCollarMaterial);
    topCapRed.position.y = canisterHeight / 2 + 0.06;
    topCapRed.castShadow = true;
    this.redSourceGroup.add(topCapRed);

    // Glossy Red accent rim ring
    const redAccentGeom = new THREE.TorusGeometry(canisterRadius * 1.04, 0.04, 16, 32);
    const redAccentMesh = new THREE.Mesh(redAccentGeom, this.mats.getBallMaterial('red'));
    redAccentMesh.rotation.x = Math.PI / 2;
    redAccentMesh.position.y = topCapRed.position.y - 0.05;
    this.redSourceGroup.add(redAccentMesh);

    // Compact polished chrome bottom collar (connecting directly into pipe)
    const botCollarGeom = new THREE.CylinderGeometry(canisterRadius * 1.04, 0.25, 0.16, 32);
    const botCollarRed = new THREE.Mesh(botCollarGeom, this.mats.metalCollarMaterial);
    botCollarRed.position.y = -canisterHeight / 2 - 0.08;
    botCollarRed.castShadow = true;
    this.redSourceGroup.add(botCollarRed);

    // 5 Glossy Red candy spheres inside source
    const ballGeom = new THREE.SphereGeometry(0.165, 20, 20);
    const redMat = this.mats.getBallMaterial('red');
    const redSourceOffsets = [
      [0, -0.15, 0],
      [-0.14, 0.08, 0.08],
      [0.14, 0.08, -0.06],
      [-0.08, 0.26, -0.08],
      [0.09, 0.28, 0.07],
    ];
    redSourceOffsets.forEach(([ox, oy, oz]) => {
      const b = new THREE.Mesh(ballGeom, redMat);
      b.position.set(ox, oy, oz);
      b.castShadow = true;
      this.redSourceGroup!.add(b);
    });

    this.group.add(this.redSourceGroup);

    // --- BLUE SOURCE (Right: x = 1.35, y = 1.48) ---
    this.blueSourceGroup = new THREE.Group();
    this.blueSourceGroup.position.set(1.35, 1.48, 0);

    const glassMeshBlue = new THREE.Mesh(glassGeom, this.mats.pipeGlassMaterial);
    glassMeshBlue.castShadow = true;
    this.blueSourceGroup.add(glassMeshBlue);

    const topCapBlue = new THREE.Mesh(topCapGeom, this.mats.metalCollarMaterial);
    topCapBlue.position.y = canisterHeight / 2 + 0.06;
    topCapBlue.castShadow = true;
    this.blueSourceGroup.add(topCapBlue);

    // Glossy Blue accent rim ring
    const blueAccentGeom = new THREE.TorusGeometry(canisterRadius * 1.04, 0.04, 16, 32);
    const blueAccentMesh = new THREE.Mesh(blueAccentGeom, this.mats.getBallMaterial('blue'));
    blueAccentMesh.rotation.x = Math.PI / 2;
    blueAccentMesh.position.y = topCapBlue.position.y - 0.05;
    this.blueSourceGroup.add(blueAccentMesh);

    const botCollarBlue = new THREE.Mesh(botCollarGeom, this.mats.metalCollarMaterial);
    botCollarBlue.position.y = -canisterHeight / 2 - 0.08;
    botCollarBlue.castShadow = true;
    this.blueSourceGroup.add(botCollarBlue);

    // 5 Glossy Blue candy spheres inside source
    const blueMat = this.mats.getBallMaterial('blue');
    const blueSourceOffsets = [
      [0, -0.15, 0],
      [-0.14, 0.08, -0.07],
      [0.14, 0.08, 0.08],
      [-0.08, 0.26, 0.08],
      [0.09, 0.28, -0.07],
    ];
    blueSourceOffsets.forEach(([ox, oy, oz]) => {
      const b = new THREE.Mesh(ballGeom, blueMat);
      b.position.set(ox, oy, oz);
      b.castShadow = true;
      this.blueSourceGroup!.add(b);
    });

    this.group.add(this.blueSourceGroup);
  }

  /**
   * Builds bright, friendly target canisters (Red on left, Blue on right)
   * filled ~85% with glowing liquid, sitting on the platform with soft contact shadows.
   */
  private buildTargets() {
    const targetRadius = 0.44;
    const targetHeight = 0.68;

    // --- RED TARGET (Left: x = -1.35, y = -0.72) ---
    this.redTargetGroup = new THREE.Group();
    this.redTargetGroup.position.set(-1.35, -0.72, 0);

    // Outer glass beaker cylinder
    const glassGeom = new THREE.CylinderGeometry(targetRadius, targetRadius, targetHeight, 32);
    const glassMesh = new THREE.Mesh(glassGeom, this.mats.pipeGlassMaterial);
    glassMesh.castShadow = true;
    this.redTargetGroup.add(glassMesh);

    // Glowing vibrant Red liquid inside (~85% full)
    const fluidGeom = new THREE.CylinderGeometry(targetRadius * 0.94, targetRadius * 0.94, targetHeight * 0.85, 32);
    const redFluidMat = this.mats.getFluidMaterial('red');
    this.redFluidMesh = new THREE.Mesh(fluidGeom, redFluidMat);
    this.redFluidMesh.position.y = -targetHeight * 0.07;
    this.redTargetGroup.add(this.redFluidMesh);

    // Juicy Red rim ring at top
    const redRimGeom = new THREE.TorusGeometry(targetRadius * 1.02, 0.045, 16, 32);
    const redRimMesh = new THREE.Mesh(redRimGeom, this.mats.getBallMaterial('red'));
    redRimMesh.rotation.x = Math.PI / 2;
    redRimMesh.position.y = targetHeight / 2;
    this.redTargetGroup.add(redRimMesh);

    // Polished chrome collar beneath the rim
    const topCollarGeom = new THREE.CylinderGeometry(targetRadius * 1.04, targetRadius * 1.04, 0.06, 32);
    const topCollarMesh = new THREE.Mesh(topCollarGeom, this.mats.metalCollarMaterial);
    topCollarMesh.position.y = targetHeight / 2 - 0.04;
    this.redTargetGroup.add(topCollarMesh);

    // Stepped dark metallic pedestal base
    const baseGeom = new THREE.CylinderGeometry(targetRadius * 1.08, targetRadius * 1.18, 0.16, 32);
    const baseMesh = new THREE.Mesh(baseGeom, this.mats.metalAccentMaterial);
    baseMesh.position.y = -targetHeight / 2 - 0.08;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    this.redTargetGroup.add(baseMesh);

    this.group.add(this.redTargetGroup);

    // --- BLUE TARGET (Right: x = 1.35, y = -0.72) ---
    this.blueTargetGroup = new THREE.Group();
    this.blueTargetGroup.position.set(1.35, -0.72, 0);

    const glassMeshBlue = new THREE.Mesh(glassGeom, this.mats.pipeGlassMaterial);
    glassMeshBlue.castShadow = true;
    this.blueTargetGroup.add(glassMeshBlue);

    // Glowing vibrant Blue liquid inside (~85% full)
    const blueFluidMat = this.mats.getFluidMaterial('blue');
    this.blueFluidMesh = new THREE.Mesh(fluidGeom, blueFluidMat);
    this.blueFluidMesh.position.y = -targetHeight * 0.07;
    this.blueTargetGroup.add(this.blueFluidMesh);

    // Juicy Blue rim ring at top
    const blueRimGeom = new THREE.TorusGeometry(targetRadius * 1.02, 0.045, 16, 32);
    const blueRimMesh = new THREE.Mesh(blueRimGeom, this.mats.getBallMaterial('blue'));
    blueRimMesh.rotation.x = Math.PI / 2;
    blueRimMesh.position.y = targetHeight / 2;
    this.blueTargetGroup.add(blueRimMesh);

    const topCollarMeshBlue = new THREE.Mesh(topCollarGeom, this.mats.metalCollarMaterial);
    topCollarMeshBlue.position.y = targetHeight / 2 - 0.04;
    this.blueTargetGroup.add(topCollarMeshBlue);

    const baseMeshBlue = new THREE.Mesh(baseGeom, this.mats.metalAccentMaterial);
    baseMeshBlue.position.y = -targetHeight / 2 - 0.08;
    baseMeshBlue.castShadow = true;
    baseMeshBlue.receiveShadow = true;
    this.blueTargetGroup.add(baseMeshBlue);

    this.group.add(this.blueTargetGroup);
  }

  /**
   * Central Rotating Valve: Reduced by ~28% (compact 0.58 cube), glossy bright blue,
   * chrome corner trim, white rotation arrows emblem (🔄), gentle idle sway/pulse.
   */
  private buildValve() {
    this.valveGroup = new THREE.Group();
    this.valveGroup.position.set(0, 0.38, 0);

    const valveSize = 0.58;

    // Rounded glossy blue cube
    const cubeGeom = new THREE.BoxGeometry(valveSize, valveSize, valveSize);
    const cubeMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.28,
      roughness: 0.12,
      emissive: 0x0369a1,
      emissiveIntensity: 0.32,
    });
    const cubeMesh = new THREE.Mesh(cubeGeom, cubeMat);
    cubeMesh.castShadow = true;
    cubeMesh.receiveShadow = true;
    this.valveGroup.add(cubeMesh);

    // Front icon plate with 🔄 symbol
    const iconTex = this.createRotationIconTexture();
    const plateGeom = new THREE.PlaneGeometry(valveSize * 0.88, valveSize * 0.88);
    const plateMat = new THREE.MeshBasicMaterial({
      map: iconTex,
      transparent: true,
    });
    const plateMesh = new THREE.Mesh(plateGeom, plateMat);
    plateMesh.position.set(0, 0, valveSize / 2 + 0.005);
    this.valveGroup.add(plateMesh);

    // Polished chrome collar rings on 4 ports (left, right, bottom-left, bottom-right)
    const collarGeom = new THREE.CylinderGeometry(0.24, 0.24, 0.08, 24);
    const trimMat = this.mats.metalCollarMaterial;

    // Left port
    const leftCollar = new THREE.Mesh(collarGeom, trimMat);
    leftCollar.rotation.z = Math.PI / 2;
    leftCollar.position.set(-valveSize / 2 - 0.04, 0.08, 0);
    this.valveGroup.add(leftCollar);

    // Right port
    const rightCollar = new THREE.Mesh(collarGeom, trimMat);
    rightCollar.rotation.z = Math.PI / 2;
    rightCollar.position.set(valveSize / 2 + 0.04, 0.08, 0);
    this.valveGroup.add(rightCollar);

    // Bottom-left port
    const botLeftCollar = new THREE.Mesh(collarGeom, trimMat);
    botLeftCollar.position.set(-0.16, -valveSize / 2 - 0.04, 0);
    this.valveGroup.add(botLeftCollar);

    // Bottom-right port
    const botRightCollar = new THREE.Mesh(collarGeom, trimMat);
    botRightCollar.position.set(0.16, -valveSize / 2 - 0.04, 0);
    this.valveGroup.add(botRightCollar);

    // Top valve hub cap
    const hubGeom = new THREE.CylinderGeometry(0.10, 0.12, 0.12, 20);
    const hub = new THREE.Mesh(hubGeom, trimMat);
    hub.position.set(0, valveSize / 2 + 0.06, 0);
    this.valveGroup.add(hub);

    this.group.add(this.valveGroup);

    // Subtle gentle breathing pulse and slow rotation sway
    this.valveTween = gsap.to(this.valveGroup.scale, {
      x: 1.035,
      y: 1.035,
      z: 1.035,
      duration: 2.2,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });
  }

  /**
   * Builds crystal-clear glass tubes with polished chrome collar rings at connection joints.
   */
  private buildPipes() {
    const pipeRadius = 0.23;
    const glassMat = this.mats.pipeGlassMaterial;
    const collarMat = this.mats.metalCollarMaterial;

    // 1. Red Upper Path: From Red Source (-1.35, 0.95) -> Central Valve (-0.33, 0.46)
    this.redUpperCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.35, 0.98, 0),
      new THREE.Vector3(-1.35, 0.65, 0),
      new THREE.Vector3(-1.12, 0.46, 0),
      new THREE.Vector3(-0.33, 0.46, 0),
    ]);

    // 2. Blue Upper Path: From Blue Source (1.35, 0.95) -> Central Valve (0.33, 0.46)
    this.blueUpperCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.35, 0.98, 0),
      new THREE.Vector3(1.35, 0.65, 0),
      new THREE.Vector3(1.12, 0.46, 0),
      new THREE.Vector3(0.33, 0.46, 0),
    ]);

    // 3. Red Lower Path: From Central Valve (-0.16, 0.06) -> Red Target (-1.35, -0.34)
    this.redLowerCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.16, 0.06, 0),
      new THREE.Vector3(-0.55, -0.06, 0),
      new THREE.Vector3(-1.35, -0.06, 0),
      new THREE.Vector3(-1.35, -0.34, 0),
    ]);

    // 4. Blue Lower Path: From Central Valve (0.16, 0.06) -> Blue Target (1.35, -0.34)
    this.blueLowerCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.16, 0.06, 0),
      new THREE.Vector3(0.55, -0.06, 0),
      new THREE.Vector3(1.35, -0.06, 0),
      new THREE.Vector3(1.35, -0.34, 0),
    ]);

    const curves = [
      this.redUpperCurve,
      this.blueUpperCurve,
      this.redLowerCurve,
      this.blueLowerCurve,
    ];

    curves.forEach((curve) => {
      const geom = new THREE.TubeGeometry(curve, 36, pipeRadius, 20, false);
      const tubeMesh = new THREE.Mesh(geom, glassMat);
      this.group.add(tubeMesh);

      // Add chrome collar rings at connection joints
      const startPt = curve.getPoint(0);
      const endPt = curve.getPoint(1);

      const collar1 = new THREE.Mesh(new THREE.TorusGeometry(pipeRadius + 0.02, 0.035, 12, 24), collarMat);
      collar1.position.copy(startPt);
      this.group.add(collar1);

      const collar2 = new THREE.Mesh(new THREE.TorusGeometry(pipeRadius + 0.02, 0.035, 12, 24), collarMat);
      collar2.position.copy(endPt);
      this.group.add(collar2);
    });
  }

  /**
   * Creates juicy candy-like spheres for both flow streams (Red on left, Blue on right).
   */
  private buildFlowBalls() {
    const ballRadius = 0.165;
    const ballGeom = new THREE.SphereGeometry(ballRadius, 22, 22);

    const redMat = this.mats.getBallMaterial('red');
    const blueMat = this.mats.getBallMaterial('blue');

    const BALLS_PER_STREAM = 5;

    // Red Upper Stream
    for (let i = 0; i < BALLS_PER_STREAM; i++) {
      const b = new THREE.Mesh(ballGeom, redMat);
      b.castShadow = true;
      this.group.add(b);
      this.redBallsUpper.push(b);
    }

    // Red Lower Stream
    for (let i = 0; i < BALLS_PER_STREAM; i++) {
      const b = new THREE.Mesh(ballGeom, redMat);
      b.castShadow = true;
      this.group.add(b);
      this.redBallsLower.push(b);
    }

    // Blue Upper Stream
    for (let i = 0; i < BALLS_PER_STREAM; i++) {
      const b = new THREE.Mesh(ballGeom, blueMat);
      b.castShadow = true;
      this.group.add(b);
      this.blueBallsUpper.push(b);
    }

    // Blue Lower Stream
    for (let i = 0; i < BALLS_PER_STREAM; i++) {
      const b = new THREE.Mesh(ballGeom, blueMat);
      b.castShadow = true;
      this.group.add(b);
      this.blueBallsLower.push(b);
    }
  }

  public update(delta: number) {
    this.animTimer += delta * 0.36; // smooth, satisfying flow speed

    const count = 5;
    const spacing = 0.17;

    // 1. Red Upper Balls
    for (let i = 0; i < count; i++) {
      const t = (this.animTimer + i * spacing) % 1.0;
      const pt = this.redUpperCurve.getPoint(t);
      this.redBallsUpper[i].position.copy(pt);
      const s = Math.sin(t * Math.PI) * 0.18 + 0.86;
      this.redBallsUpper[i].scale.setScalar(s);
    }

    // 2. Red Lower Balls
    for (let i = 0; i < count; i++) {
      const t = (this.animTimer + i * spacing) % 1.0;
      const pt = this.redLowerCurve.getPoint(t);
      this.redBallsLower[i].position.copy(pt);
      const s = Math.sin(t * Math.PI) * 0.18 + 0.86;
      this.redBallsLower[i].scale.setScalar(s);

      // Fluid celebration pulse when ball arrives at target
      if (t > 0.90 && t < 0.94 && i === 0 && this.redFluidMesh) {
        gsap.killTweensOf(this.redFluidMesh.scale);
        gsap.to(this.redFluidMesh.scale, {
          x: 1.08,
          z: 1.08,
          duration: 0.14,
          yoyo: true,
          repeat: 1,
          ease: 'power2.out',
        });
      }
    }

    // 3. Blue Upper Balls
    for (let i = 0; i < count; i++) {
      const t = (this.animTimer + i * spacing) % 1.0;
      const pt = this.blueUpperCurve.getPoint(t);
      this.blueBallsUpper[i].position.copy(pt);
      const s = Math.sin(t * Math.PI) * 0.18 + 0.86;
      this.blueBallsUpper[i].scale.setScalar(s);
    }

    // 4. Blue Lower Balls
    for (let i = 0; i < count; i++) {
      const t = (this.animTimer + i * spacing) % 1.0;
      const pt = this.blueLowerCurve.getPoint(t);
      this.blueBallsLower[i].position.copy(pt);
      const s = Math.sin(t * Math.PI) * 0.18 + 0.86;
      this.blueBallsLower[i].scale.setScalar(s);

      // Fluid celebration pulse when ball arrives at target
      if (t > 0.90 && t < 0.94 && i === 0 && this.blueFluidMesh) {
        gsap.killTweensOf(this.blueFluidMesh.scale);
        gsap.to(this.blueFluidMesh.scale, {
          x: 1.08,
          z: 1.08,
          duration: 0.14,
          yoyo: true,
          repeat: 1,
          ease: 'power2.out',
        });
      }
    }
  }

  public getBounds() {
    return {
      minX: -2.05,
      maxX: 2.05,
      minY: -1.75,
      maxY: 2.40,
    };
  }

  public dispose() {
    if (this.valveTween) {
      this.valveTween.kill();
    }
    while (this.group.children.length > 0) {
      const child = this.group.children[0];
      this.group.remove(child);
      if ((child as THREE.Mesh).geometry) {
        (child as THREE.Mesh).geometry.dispose();
      }
    }
  }
}
