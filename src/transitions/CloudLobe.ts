import * as THREE from 'three';

export interface CloudLobeConfig {
  offset: THREE.Vector3;
  scale: THREE.Vector3;
  radius: number;
}

export class CloudLobe {
  public mesh: THREE.Mesh;
  public baseOffset: THREE.Vector3;
  public baseScale: THREE.Vector3;

  constructor(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    config: CloudLobeConfig
  ) {
    this.baseOffset = config.offset.clone();
    this.baseScale = config.scale.clone();

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.baseOffset);
    this.mesh.scale.copy(this.baseScale);
  }
}
