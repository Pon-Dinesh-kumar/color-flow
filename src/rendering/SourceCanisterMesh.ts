import * as THREE from 'three';
import { SourceNode } from '../puzzle/Source';
import { MaterialManager } from './Materials';
import gsap from 'gsap';

const BALL_STACK_OFFSETS = [
  { x: 0, y: -0.22, z: 0 },
  { x: -0.14, y: -0.02, z: 0.08 },
  { x: 0.14, y: -0.02, z: -0.08 },
  { x: 0, y: 0.18, z: 0.06 },
  { x: -0.1, y: 0.35, z: -0.06 },
];

export class SourceCanisterMesh {
  public group: THREE.Group;
  public source: SourceNode;
  private mats = MaterialManager.getInstance();
  private ballsGroup: THREE.Group;
  private ballMeshes: THREE.Mesh[] = [];

  constructor(source: SourceNode) {
    this.source = source;
    this.group = new THREE.Group();
    this.group.name = `source_${source.id}`;
    this.ballsGroup = new THREE.Group();
    this.group.add(this.ballsGroup);

    this.build();
    this.spawnBalls();
  }

  private build() {
    const canisterRadius = 0.44;
    const bodyHeight = 0.88;

    // 1. Transparent toy acrylic cylinder hopper
    const glassGeom = new THREE.CylinderGeometry(canisterRadius, canisterRadius, bodyHeight, 28);
    const glassMesh = new THREE.Mesh(glassGeom, this.mats.pipeGlassMaterial);
    glassMesh.position.y = 0.05;
    this.group.add(glassMesh);

    // Soft contour for visibility against background
    const contourGeom = new THREE.CylinderGeometry(canisterRadius * 0.96, canisterRadius * 0.96, bodyHeight * 0.98, 28);
    const contourMesh = new THREE.Mesh(contourGeom, this.mats.pipeGlassContourMaterial);
    contourMesh.position.y = 0.05;
    this.group.add(contourMesh);

    // Longitudinal reflection highlight
    const hlGeom = new THREE.CylinderGeometry(canisterRadius * 1.01, canisterRadius * 1.01, bodyHeight * 0.95, 16, 1, true, -0.2, 0.4);
    const hlMesh = new THREE.Mesh(hlGeom, this.mats.pipeGlassHighlightMaterial);
    hlMesh.position.set(0, 0.05, 0.02);
    this.group.add(hlMesh);

    // 2. Playful Candy-Colored Top Cap
    const topCapGeom = new THREE.CylinderGeometry(canisterRadius * 1.08, canisterRadius * 1.08, 0.14, 28);
    const capMat = this.mats.getToyColorMaterial(this.source.color);
    const topCap = new THREE.Mesh(topCapGeom, capMat);
    topCap.position.y = 0.05 + bodyHeight / 2 + 0.07;
    topCap.castShadow = true;
    this.group.add(topCap);

    // Chrome bevel rim for top cap
    const topRimGeom = new THREE.TorusGeometry(canisterRadius * 1.08, 0.03, 16, 28);
    const topRim = new THREE.Mesh(topRimGeom, this.mats.metalAccentMaterial);
    topRim.rotation.x = Math.PI / 2;
    topRim.position.y = topCap.position.y + 0.06;
    this.group.add(topRim);

    // Dome handle on top (glossy white/chrome toy sphere)
    const handleGeom = new THREE.SphereGeometry(0.12, 16, 16);
    const handle = new THREE.Mesh(handleGeom, this.mats.metalAccentMaterial);
    handle.position.y = topCap.position.y + 0.12;
    this.group.add(handle);

    // 3. Bottom Funnel (Candy-colored inverted conical funnel)
    const funnelGeom = new THREE.CylinderGeometry(canisterRadius * 1.05, 0.28, 0.44, 28);
    const funnel = new THREE.Mesh(funnelGeom, capMat);
    funnel.position.y = -0.56;
    funnel.castShadow = true;
    this.group.add(funnel);

    // White toy enamel connector collar at funnel tip docking into pipe below
    const funnelCollarGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.14, 28);
    const funnelCollar = new THREE.Mesh(funnelCollarGeom, this.mats.metalCollarMaterial);
    funnelCollar.position.y = -0.74;
    this.group.add(funnelCollar);

    const funnelRimGeom = new THREE.TorusGeometry(0.35, 0.025, 16, 28);
    const funnelRim = new THREE.Mesh(funnelRimGeom, this.mats.metalAccentMaterial);
    funnelRim.rotation.x = Math.PI / 2;
    funnelRim.position.y = -0.74;
    this.group.add(funnelRim);
  }

  public spawnBalls() {
    this.clearAllImmediate();

    const ballMat = this.mats.getBallMaterial(this.source.color);
    const ballGeom = new THREE.SphereGeometry(0.135, 32, 32);

    const count = Math.min(BALL_STACK_OFFSETS.length, Math.max(1, this.source.amount || 5));

    for (let i = 0; i < count; i++) {
      const off = BALL_STACK_OFFSETS[i];
      const b = new THREE.Mesh(ballGeom, ballMat);
      b.position.set(off.x, off.y, off.z);
      b.castShadow = true;
      this.ballsGroup.add(b);
      this.ballMeshes.push(b);
    }
  }

  /**
   * Drops one ball down into the funnel/pipe and shifts remaining balls down
   */
  public popBall(): boolean {
    if (this.ballMeshes.length === 0) return false;

    // Pop the bottom-most ball in the stack
    const popped = this.ballMeshes.shift()!;

    // Animate popped ball dropping into funnel and scaling down
    gsap.to(popped.position, {
      y: -0.60,
      duration: 0.16,
      ease: 'power2.in',
    });
    gsap.to(popped.scale, {
      x: 0.1,
      y: 0.1,
      z: 0.1,
      duration: 0.16,
      onComplete: () => {
        this.ballsGroup.remove(popped);
      },
    });

    // Animate remaining balls dropping down by one position
    this.ballMeshes.forEach((mesh, index) => {
      const targetOffset = BALL_STACK_OFFSETS[index];
      gsap.to(mesh.position, {
        x: targetOffset.x,
        y: targetOffset.y,
        z: targetOffset.z,
        duration: 0.22,
        ease: 'bounce.out',
      });
    });

    return true;
  }

  /**
   * Completely empties the top canister once won or when requested
   */
  public emptyAll() {
    while (this.ballMeshes.length > 0) {
      const b = this.ballMeshes.pop()!;
      gsap.to(b.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.22,
        onComplete: () => {
          this.ballsGroup.remove(b);
        },
      });
    }
  }

  public clearAllImmediate() {
    while (this.ballMeshes.length > 0) {
      const b = this.ballMeshes.pop()!;
      this.ballsGroup.remove(b);
    }
  }

  public getTopY(): number {
    return this.group.position.y + 0.75;
  }
}
