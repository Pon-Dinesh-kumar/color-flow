import * as THREE from 'three';
import { COLOR_PALETTE, FlowColor } from '../puzzle/ColorSystem';

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: THREE.Color;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export class ParticleSystem {
  private scene: THREE.Scene;
  private maxParticles = 400;
  private particles: Particle[] = [];
  private instancedMesh: THREE.InstancedMesh;
  private dummy = new THREE.Object3D();
  private colorBuffer: Float32Array;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    const geom = new THREE.SphereGeometry(0.06, 8, 8);
    const mat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });

    this.instancedMesh = new THREE.InstancedMesh(geom, mat, this.maxParticles);
    this.instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.colorBuffer = new Float32Array(this.maxParticles * 3);
    this.instancedMesh.instanceColor = new THREE.InstancedBufferAttribute(this.colorBuffer, 3);
    this.instancedMesh.count = 0;

    this.scene.add(this.instancedMesh);
  }

  public burst(position: THREE.Vector3, color: FlowColor, count = 16, speed = 2.5) {
    const colorDef = COLOR_PALETTE[color] || COLOR_PALETTE.red;
    const baseColor = new THREE.Color(colorDef.hexNumber);

    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;

      const angle = Math.random() * Math.PI * 2;
      const elevation = (Math.random() - 0.5) * Math.PI * 0.6;
      const mag = speed * (0.6 + Math.random() * 0.8);

      const vel = new THREE.Vector3(
        Math.cos(angle) * Math.cos(elevation) * mag,
        Math.sin(angle) * Math.cos(elevation) * mag,
        Math.sin(elevation) * mag + 0.5
      );

      this.particles.push({
        position: position.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1, 0)),
        velocity: vel,
        color: baseColor.clone().offsetHSL((Math.random() - 0.5) * 0.1, 0, 0),
        size: 0.05 + Math.random() * 0.08,
        alpha: 1.0,
        life: 0,
        maxLife: 0.5 + Math.random() * 0.4,
      });
    }
  }

  // Section 10: Subtle Trail Effect behind moving balls
  public emitTrail(position: THREE.Vector3, color: FlowColor) {
    if (this.particles.length >= this.maxParticles - 30) return;
    const colorDef = COLOR_PALETTE[color] || COLOR_PALETTE.red;
    const baseColor = new THREE.Color(colorDef.hexNumber);

    this.particles.push({
      position: position.clone().add(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.03,
          (Math.random() - 0.5) * 0.03,
          (Math.random() - 0.5) * 0.02
        )
      ),
      velocity: new THREE.Vector3((Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1, 0),
      color: baseColor,
      size: 0.045,
      alpha: 0.65,
      life: 0,
      maxLife: 0.16,
    });
  }

  // Section 10: Completion Burst with colorful droplets and star sparks
  public burstCompletion(position: THREE.Vector3, color: FlowColor) {
    this.burst(position, color, 30, 3.4);

    const starColor = new THREE.Color(0xffffff);
    for (let i = 0; i < 14; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = (i / 14) * Math.PI * 2;
      const speed = 3.6 + Math.random() * 0.8;
      this.particles.push({
        position: position.clone(),
        velocity: new THREE.Vector3(Math.cos(angle) * speed, Math.sin(angle) * speed, 0.3),
        color: starColor,
        size: 0.075,
        alpha: 1.0,
        life: 0,
        maxLife: 0.48,
      });
    }
  }

  public update(delta: number) {
    const gravity = new THREE.Vector3(0, -5.5, 0);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += delta;

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      p.velocity.addScaledVector(gravity, delta);
      p.position.addScaledVector(p.velocity, delta);
      p.alpha = 1 - p.life / p.maxLife;
    }

    const activeCount = Math.min(this.particles.length, this.maxParticles);
    this.instancedMesh.count = activeCount;

    for (let i = 0; i < activeCount; i++) {
      const p = this.particles[i];
      this.dummy.position.copy(p.position);
      const scale = p.size * (1 - p.life / p.maxLife);
      this.dummy.scale.set(scale, scale, scale);
      this.dummy.updateMatrix();

      this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
      this.instancedMesh.setColorAt(i, p.color);
    }

    if (activeCount > 0) {
      this.instancedMesh.instanceMatrix.needsUpdate = true;
      if (this.instancedMesh.instanceColor) {
        this.instancedMesh.instanceColor.needsUpdate = true;
      }
    }
  }

  public clear() {
    this.particles = [];
    this.instancedMesh.count = 0;
  }
}
