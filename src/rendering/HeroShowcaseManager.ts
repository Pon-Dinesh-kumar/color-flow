import * as THREE from 'three';
import gsap from 'gsap';
import { MaterialManager } from './Materials';
import { SourceCanisterMesh } from './SourceCanisterMesh';
import { TargetCanisterMesh } from './TargetCanisterMesh';

export class HeroShowcaseManager {
  public group: THREE.Group;
  private mats = MaterialManager.getInstance();

  private redSource: SourceCanisterMesh | null = null;
  private blueSource: SourceCanisterMesh | null = null;
  private redTarget: TargetCanisterMesh | null = null;
  private yellowTarget: TargetCanisterMesh | null = null;
  private valveGroup: THREE.Group | null = null;

  private upperLeftCurve!: THREE.CatmullRomCurve3;
  private upperRightCurve!: THREE.CatmullRomCurve3;
  private lowerLeftCurve!: THREE.CatmullRomCurve3;
  private lowerRightCurve!: THREE.CatmullRomCurve3;

  private redBallsUpper: THREE.Mesh[] = [];
  private blueBallsUpper: THREE.Mesh[] = [];
  private redBallsLower: THREE.Mesh[] = [];
  private yellowBallsLower: THREE.Mesh[] = [];

  private animTimer = 0;
  private valvePulseTween: gsap.core.Tween | null = null;

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

    // Blue rounded background
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.roundRect(16, 16, 224, 224, 36);
    ctx.fill();

    // Subtle radial highlight
    const radGrad = ctx.createRadialGradient(128, 128, 10, 128, 128, 110);
    radGrad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
    radGrad.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.roundRect(16, 16, 224, 224, 36);
    ctx.fill();

    // Outer border
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.roundRect(16, 16, 224, 224, 36);
    ctx.stroke();

    // Draw circular rotating arrows (matching the reference 🔄)
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';

    const cx = 128;
    const cy = 128;
    const r = 58;

    // Top arc (clockwise)
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI * 0.8, -Math.PI * 0.1);
    ctx.stroke();

    // Top arrow head
    const topX = cx + r * Math.cos(-Math.PI * 0.1);
    const topY = cy + r * Math.sin(-Math.PI * 0.1);
    ctx.beginPath();
    ctx.moveTo(topX - 6, topY - 18);
    ctx.lineTo(topX + 16, topY);
    ctx.lineTo(topX - 6, topY + 16);
    ctx.closePath();
    ctx.fill();

    // Bottom arc (clockwise)
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI * 0.2, Math.PI * 0.9);
    ctx.stroke();

    // Bottom arrow head
    const botX = cx + r * Math.cos(Math.PI * 0.9);
    const botY = cy + r * Math.sin(Math.PI * 0.9);
    ctx.beginPath();
    ctx.moveTo(botX + 6, botY + 18);
    ctx.lineTo(botX - 16, botY);
    ctx.lineTo(botX + 6, botY - 16);
    ctx.closePath();
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  private buildShowcase() {
    // 1. Source Canisters (Elevated Left & Right)
    this.redSource = new SourceCanisterMesh({
      id: 'hero_src_red',
      position: { x: 0, y: 0 },
      direction: 'down',
      color: 'red',
      amount: 10,
    });
    this.redSource.group.position.set(-1.35, 1.45, 0);
    this.group.add(this.redSource.group);

    this.blueSource = new SourceCanisterMesh({
      id: 'hero_src_blue',
      position: { x: 0, y: 0 },
      direction: 'down',
      color: 'blue',
      amount: 10,
    });
    this.blueSource.group.position.set(1.35, 1.45, 0);
    this.group.add(this.blueSource.group);

    // 2. Target Canisters (Bottom Left & Right, resting on stone podium)
    this.redTarget = new TargetCanisterMesh({
      id: 'hero_tgt_red',
      position: { x: 0, y: 0 },
      acceptDirection: 'up',
      color: 'red',
      requiredAmount: 10,
      currentAmount: 8,
    });
    this.redTarget.group.position.set(-1.35, -0.72, 0);
    this.redTarget.updateFill(8, 10);
    this.group.add(this.redTarget.group);

    this.yellowTarget = new TargetCanisterMesh({
      id: 'hero_tgt_yellow',
      position: { x: 0, y: 0 },
      acceptDirection: 'up',
      color: 'yellow',
      requiredAmount: 10,
      currentAmount: 8,
    });
    this.yellowTarget.group.position.set(1.35, -0.72, 0);
    this.yellowTarget.updateFill(8, 10);
    this.group.add(this.yellowTarget.group);

    // 3. Central Rotating Valve (Hero Cube with Rotation Emblem)
    this.buildValve();

    // 4. Translucent Glass Pipes Connecting Containers & Valve
    this.buildPipes();

    // 5. Glossy Colored Balls inside the Pipes
    this.buildFlowBalls();
  }

  private buildValve() {
    this.valveGroup = new THREE.Group();
    this.valveGroup.position.set(0, 0.35, 0);

    // Valve casing: glossy rich blue rounded cube
    const cubeGeom = new THREE.BoxGeometry(0.82, 0.82, 0.82);
    const cubeMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.35,
      roughness: 0.15,
      emissive: 0x0369a1,
      emissiveIntensity: 0.25,
    });
    const cubeMesh = new THREE.Mesh(cubeGeom, cubeMat);
    cubeMesh.castShadow = true;
    cubeMesh.receiveShadow = true;
    this.valveGroup.add(cubeMesh);

    // Front icon plate
    const iconTex = this.createRotationIconTexture();
    const plateGeom = new THREE.PlaneGeometry(0.72, 0.72);
    const plateMat = new THREE.MeshBasicMaterial({
      map: iconTex,
      transparent: true,
    });
    const plateMesh = new THREE.Mesh(plateGeom, plateMat);
    plateMesh.position.set(0, 0, 0.415);
    this.valveGroup.add(plateMesh);

    // Metallic corner bevel trim
    const trimMat = this.mats.metalCollarMaterial;

    // Metallic collars on 4 connection ports (top-left, top-right, bottom-left, bottom-right)
    const collarGeom = new THREE.CylinderGeometry(0.28, 0.28, 0.14, 24);

    // Top port collar
    const topCollar = new THREE.Mesh(collarGeom, trimMat);
    topCollar.position.set(0, 0.44, 0);
    this.valveGroup.add(topCollar);

    // Left port collar
    const leftCollar = new THREE.Mesh(collarGeom, trimMat);
    leftCollar.rotation.z = Math.PI / 2;
    leftCollar.position.set(-0.44, 0, 0);
    this.valveGroup.add(leftCollar);

    // Right port collar
    const rightCollar = new THREE.Mesh(collarGeom, trimMat);
    rightCollar.rotation.z = Math.PI / 2;
    rightCollar.position.set(0.44, 0, 0);
    this.valveGroup.add(rightCollar);

    // Bottom port collar
    const botCollar = new THREE.Mesh(collarGeom, trimMat);
    botCollar.position.set(0, -0.44, 0);
    this.valveGroup.add(botCollar);

    // Subtle top hub knob
    const knobGeom = new THREE.CylinderGeometry(0.12, 0.14, 0.16, 20);
    const knob = new THREE.Mesh(knobGeom, trimMat);
    knob.position.set(0, 0.52, 0);
    this.valveGroup.add(knob);

    this.group.add(this.valveGroup);

    // Idle subtle pulse
    this.valvePulseTween = gsap.to(this.valveGroup.scale, {
      x: 1.04,
      y: 1.04,
      z: 1.04,
      duration: 1.8,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });
  }

  private buildPipes() {
    const pipeRadius = 0.24;
    const glassMat = this.mats.pipeGlassMaterial;
    const collarMat = this.mats.metalCollarMaterial;

    // 1. Upper Left Path: From Red Source (-1.35, 0.65) -> Valve (-0.42, 0.35)
    this.upperLeftCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.35, 0.68, 0),
      new THREE.Vector3(-1.35, 0.42, 0),
      new THREE.Vector3(-1.15, 0.35, 0),
      new THREE.Vector3(-0.42, 0.35, 0),
    ]);

    // 2. Upper Right Path: From Blue Source (1.35, 0.65) -> Valve (0.42, 0.35)
    this.upperRightCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.35, 0.68, 0),
      new THREE.Vector3(1.35, 0.42, 0),
      new THREE.Vector3(1.15, 0.35, 0),
      new THREE.Vector3(0.42, 0.35, 0),
    ]);

    // 3. Lower Left Path: From Valve (-0.42, 0.35) -> Red Target (-1.35, 0.08)
    this.lowerLeftCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.42, 0.35, 0),
      new THREE.Vector3(-0.85, 0.35, 0),
      new THREE.Vector3(-1.35, 0.25, 0),
      new THREE.Vector3(-1.35, 0.08, 0),
    ]);

    // 4. Lower Right Path: From Valve (0.42, 0.35) -> Yellow Target (1.35, 0.08)
    this.lowerRightCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.42, 0.35, 0),
      new THREE.Vector3(0.85, 0.35, 0),
      new THREE.Vector3(1.35, 0.25, 0),
      new THREE.Vector3(1.35, 0.08, 0),
    ]);

    const curves = [
      this.upperLeftCurve,
      this.upperRightCurve,
      this.lowerLeftCurve,
      this.lowerRightCurve,
    ];

    curves.forEach((curve) => {
      const geom = new THREE.TubeGeometry(curve, 32, pipeRadius, 18, false);
      const tubeMesh = new THREE.Mesh(geom, glassMat);
      this.group.add(tubeMesh);

      // Add connection collar rings at curve endpoints
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

  private buildFlowBalls() {
    const ballRadius = 0.17;
    const ballGeom = new THREE.SphereGeometry(ballRadius, 20, 20);

    const redMat = this.mats.getBallMaterial('red');
    const blueMat = this.mats.getBallMaterial('blue');
    const yellowMat = this.mats.getBallMaterial('yellow');

    const BALLS_PER_STREAM = 5;

    // Red Balls (Upper Left)
    for (let i = 0; i < BALLS_PER_STREAM; i++) {
      const ball = new THREE.Mesh(ballGeom, redMat);
      ball.castShadow = true;
      this.group.add(ball);
      this.redBallsUpper.push(ball);
    }

    // Blue Balls (Upper Right)
    for (let i = 0; i < BALLS_PER_STREAM; i++) {
      const ball = new THREE.Mesh(ballGeom, blueMat);
      ball.castShadow = true;
      this.group.add(ball);
      this.blueBallsUpper.push(ball);
    }

    // Red Balls (Lower Left)
    for (let i = 0; i < BALLS_PER_STREAM; i++) {
      const ball = new THREE.Mesh(ballGeom, redMat);
      ball.castShadow = true;
      this.group.add(ball);
      this.redBallsLower.push(ball);
    }

    // Yellow Balls (Lower Right)
    for (let i = 0; i < BALLS_PER_STREAM; i++) {
      const ball = new THREE.Mesh(ballGeom, yellowMat);
      ball.castShadow = true;
      this.group.add(ball);
      this.yellowBallsLower.push(ball);
    }
  }

  public update(delta: number) {
    this.animTimer += delta * 0.38; // speed of smooth flow

    const BALLS_COUNT = 5;
    const spacing = 0.16;

    // Animate Red Upper Balls
    for (let i = 0; i < BALLS_COUNT; i++) {
      const t = (this.animTimer + i * spacing) % 1.0;
      const pt = this.upperLeftCurve.getPoint(t);
      this.redBallsUpper[i].position.copy(pt);
      // Soft scale fade in/out at ends
      const scale = Math.sin(t * Math.PI) * 0.2 + 0.85;
      this.redBallsUpper[i].scale.setScalar(scale);
    }

    // Animate Blue Upper Balls
    for (let i = 0; i < BALLS_COUNT; i++) {
      const t = (this.animTimer + i * spacing) % 1.0;
      const pt = this.upperRightCurve.getPoint(t);
      this.blueBallsUpper[i].position.copy(pt);
      const scale = Math.sin(t * Math.PI) * 0.2 + 0.85;
      this.blueBallsUpper[i].scale.setScalar(scale);
    }

    // Animate Red Lower Balls
    for (let i = 0; i < BALLS_COUNT; i++) {
      const t = (this.animTimer + i * spacing) % 1.0;
      const pt = this.lowerLeftCurve.getPoint(t);
      this.redBallsLower[i].position.copy(pt);
      const scale = Math.sin(t * Math.PI) * 0.2 + 0.85;
      this.redBallsLower[i].scale.setScalar(scale);

      // Trigger target celebration pulse periodically when ball arrives
      if (t > 0.92 && t < 0.95 && i === 0) {
        this.redTarget?.playPulse();
      }
    }

    // Animate Yellow Lower Balls
    for (let i = 0; i < BALLS_COUNT; i++) {
      const t = (this.animTimer + i * spacing) % 1.0;
      const pt = this.lowerRightCurve.getPoint(t);
      this.yellowBallsLower[i].position.copy(pt);
      const scale = Math.sin(t * Math.PI) * 0.2 + 0.85;
      this.yellowBallsLower[i].scale.setScalar(scale);

      if (t > 0.92 && t < 0.95 && i === 0) {
        this.yellowTarget?.playPulse();
      }
    }
  }

  public getBounds() {
    return {
      minX: -2.0,
      maxX: 2.0,
      minY: -1.75,
      maxY: 2.45,
    };
  }

  public dispose() {
    if (this.valvePulseTween) {
      this.valvePulseTween.kill();
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
