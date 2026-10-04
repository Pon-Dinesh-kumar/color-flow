import * as THREE from 'three';
import { SourceNode } from '../puzzle/Source';
import { MaterialManager } from './Materials';
import { COLOR_PALETTE } from '../puzzle/ColorSystem';

export class SourceCanisterMesh {
  public group: THREE.Group;
  public source: SourceNode;
  private mats = MaterialManager.getInstance();
  private ballsGroup: THREE.Group;

  constructor(source: SourceNode) {
    this.source = source;
    this.group = new THREE.Group();
    this.group.name = `source_${source.id}`;
    this.ballsGroup = new THREE.Group();

    this.build();
  }

  private build() {
    const canisterRadius = 0.44;
    const bodyHeight = 0.9;
    const colorDef = COLOR_PALETTE[this.source.color];

    // Translucent glass hopper cylinder
    const glassGeom = new THREE.CylinderGeometry(canisterRadius, canisterRadius, bodyHeight, 28);
    const glassMesh = new THREE.Mesh(glassGeom, this.mats.pipeGlassMaterial);
    glassMesh.position.y = 0.05;
    this.group.add(glassMesh);

    // Polished metallic top cap with beveled rim
    const topCapGeom = new THREE.CylinderGeometry(canisterRadius * 1.08, canisterRadius * 1.08, 0.14, 28);
    const topCap = new THREE.Mesh(topCapGeom, this.mats.metalCollarMaterial);
    topCap.position.y = 0.05 + bodyHeight / 2 + 0.07;
    topCap.castShadow = true;
    this.group.add(topCap);

    // Dome handle on top
    const handleGeom = new THREE.SphereGeometry(0.12, 16, 16);
    const handle = new THREE.Mesh(handleGeom, this.mats.metalAccentMaterial);
    handle.position.y = topCap.position.y + 0.1;
    this.group.add(handle);

    // Glowing color identification ring under top cap
    const glowRingGeom = new THREE.TorusGeometry(canisterRadius * 1.02, 0.035, 16, 28);
    const glowRingMat = this.mats.getBallMaterial(this.source.color);
    const glowRing = new THREE.Mesh(glowRingGeom, glowRingMat);
    glowRing.rotation.x = Math.PI / 2;
    glowRing.position.y = topCap.position.y - 0.07;
    this.group.add(glowRing);

    // Bottom feed funnel docking cleanly into the top collar of the pipe below (y = -0.8)
    const funnelGeom = new THREE.CylinderGeometry(canisterRadius * 1.04, 0.28, 0.42, 28);
    const funnel = new THREE.Mesh(funnelGeom, this.mats.metalCollarMaterial);
    funnel.position.y = -0.58;
    funnel.castShadow = true;
    this.group.add(funnel);

    // Stacked preview balls inside the glass hopper
    const ballMat = this.mats.getBallMaterial(this.source.color);
    const ballGeom = new THREE.SphereGeometry(0.14, 20, 20);

    const ballOffsets = [
      { x: 0, y: -0.22, z: 0 },
      { x: -0.14, y: -0.02, z: 0.08 },
      { x: 0.14, y: -0.02, z: -0.08 },
      { x: 0, y: 0.18, z: 0.06 },
      { x: -0.1, y: 0.35, z: -0.06 },
    ];

    ballOffsets.forEach((off) => {
      const b = new THREE.Mesh(ballGeom, ballMat);
      b.position.set(off.x, off.y, off.z);
      b.castShadow = true;
      this.ballsGroup.add(b);
    });

    this.group.add(this.ballsGroup);
  }

  public getTopY(): number {
    return this.group.position.y + 0.75;
  }
}
