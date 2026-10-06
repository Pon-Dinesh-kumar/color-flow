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
    const bodyHeight = 0.88;
    const colorDef = COLOR_PALETTE[this.source.color];

    // 1. Transparent glass cylinder hopper (high visibility with contour)
    const glassGeom = new THREE.CylinderGeometry(canisterRadius, canisterRadius, bodyHeight, 28);
    const glassMesh = new THREE.Mesh(glassGeom, this.mats.pipeGlassMaterial);
    glassMesh.position.y = 0.05;
    this.group.add(glassMesh);

    // Inner contour for glass hopper visibility against sky
    const contourGeom = new THREE.CylinderGeometry(canisterRadius * 0.96, canisterRadius * 0.96, bodyHeight * 0.98, 28);
    const contourMesh = new THREE.Mesh(contourGeom, this.mats.pipeGlassContourMaterial);
    contourMesh.position.y = 0.05;
    this.group.add(contourMesh);

    // Longitudinal reflection highlight
    const hlGeom = new THREE.CylinderGeometry(canisterRadius * 1.01, canisterRadius * 1.01, bodyHeight * 0.95, 16, 1, true, -0.2, 0.4);
    const hlMesh = new THREE.Mesh(hlGeom, this.mats.pipeGlassHighlightMaterial);
    hlMesh.position.set(0, 0.05, 0.02);
    this.group.add(hlMesh);

    // 2. Top Cap (Metal/Plastic from reference diagram)
    const topCapGeom = new THREE.CylinderGeometry(canisterRadius * 1.08, canisterRadius * 1.08, 0.14, 28);
    const topCap = new THREE.Mesh(topCapGeom, this.mats.metalCollarMaterial);
    topCap.position.y = 0.05 + bodyHeight / 2 + 0.07;
    topCap.castShadow = true;
    this.group.add(topCap);

    // Chrome bevel rim for top cap
    const topRimGeom = new THREE.TorusGeometry(canisterRadius * 1.08, 0.03, 16, 28);
    const topRim = new THREE.Mesh(topRimGeom, this.mats.metalAccentMaterial);
    topRim.rotation.x = Math.PI / 2;
    topRim.position.y = topCap.position.y + 0.06;
    this.group.add(topRim);

    // Dome handle on top
    const handleGeom = new THREE.SphereGeometry(0.12, 16, 16);
    const handle = new THREE.Mesh(handleGeom, this.mats.metalAccentMaterial);
    handle.position.y = topCap.position.y + 0.12;
    this.group.add(handle);

    // Color identification ring under top cap
    const glowRingGeom = new THREE.TorusGeometry(canisterRadius * 1.02, 0.035, 16, 28);
    const glowRingMat = this.mats.getBallMaterial(this.source.color);
    const glowRing = new THREE.Mesh(glowRingGeom, glowRingMat);
    glowRing.rotation.x = Math.PI / 2;
    glowRing.position.y = topCap.position.y - 0.08;
    this.group.add(glowRing);

    // 3. Bottom Funnel (To Pipe) - Inverted conical funnel tapering into pipe connector
    const funnelGeom = new THREE.CylinderGeometry(canisterRadius * 1.05, 0.28, 0.44, 28);
    const funnel = new THREE.Mesh(funnelGeom, this.mats.metalCollarMaterial);
    funnel.position.y = -0.56;
    funnel.castShadow = true;
    this.group.add(funnel);

    // Metal ring connector at funnel tip
    const funnelRimGeom = new THREE.TorusGeometry(canisterRadius * 1.06, 0.03, 16, 28);
    const funnelRim = new THREE.Mesh(funnelRimGeom, this.mats.metalAccentMaterial);
    funRimPosition: funnelRim.rotation.x = Math.PI / 2;
    funnelRim.position.y = -0.36;
    this.group.add(funnelRim);

    // 4. Stacked preview balls inside the hopper (High-specular glossy PBR spheres)
    const ballMat = this.mats.getBallMaterial(this.source.color);
    const ballGeom = new THREE.SphereGeometry(0.135, 32, 32);

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
