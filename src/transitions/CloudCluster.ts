import * as THREE from 'three';
import { CloudLobe } from './CloudLobe';
import { CloudThemeColors } from './CloudTheme';

export type CloudType = 'large' | 'medium' | 'small' | 'topCanopy' | 'puff';

export interface CloudClusterConfig {
  type: CloudType;
  position: THREE.Vector3;
  targetPosition: THREE.Vector3;
  entryOffset: THREE.Vector3;
  exitOffset: THREE.Vector3;
  scale: THREE.Vector3;
  rotation: THREE.Euler;
  speedParallax: number;
}

// Custom volumetric soft-lit cloud shader
export function createCloudShaderMaterial(theme: CloudThemeColors): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uCloudColor: { value: new THREE.Color(theme.primary) },
      uShadowColor: { value: new THREE.Color(theme.shadow) },
      uSkyColor: { value: new THREE.Color(theme.secondary) },
      uHighlightColor: { value: new THREE.Color(theme.warmHighlight) },
      uLightDirection: { value: new THREE.Vector3(0.2, 1.0, 0.8).normalize() },
      uOpacity: { value: 1.0 },
      uTime: { value: 0 },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vWorldPosition;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uCloudColor;
      uniform vec3 uShadowColor;
      uniform vec3 uSkyColor;
      uniform vec3 uHighlightColor;
      uniform vec3 uLightDirection;
      uniform float uOpacity;
      uniform float uTime;

      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vWorldPosition;

      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);
        vec3 lightDir = normalize(uLightDirection);

        // Soft wrap-around volumetric diffuse lighting (light scattering through cotton)
        float NdotL = dot(normal, lightDir);
        float diffuse = smoothstep(-0.40, 0.65, NdotL);

        // Subtle ambient sky bounce matching our app background
        float skyBounce = max(0.0, normal.y * 0.5 + 0.5) * (1.0 - diffuse * 0.7);

        // Soft luminous Fresnel rim
        float fresnel = 1.0 - max(0.0, dot(normal, viewDir));
        float rim = pow(fresnel, 2.2);

        // Subtle warm sun bounce from key light
        float sunSpec = pow(max(0.0, dot(reflect(-lightDir, normal), -viewDir)), 3.5);

        // Blend from rich shadow into app background sky tint and soft cloud fleece
        vec3 shadowWithSky = mix(uShadowColor, uSkyColor, skyBounce * 0.55);
        vec3 color = mix(shadowWithSky, uCloudColor, diffuse);
        color = mix(color, uHighlightColor, rim * 0.38 + sunSpec * 0.28);

        gl_FragColor = vec4(color, uOpacity);
      }
    `,
    transparent: true,
    depthWrite: true,
  });
}

export class CloudCluster {
  public group: THREE.Group;
  public lobes: CloudLobe[] = [];
  public config: CloudClusterConfig;
  public material: THREE.ShaderMaterial;

  constructor(
    sharedGeometry: THREE.BufferGeometry,
    material: THREE.ShaderMaterial,
    config: CloudClusterConfig
  ) {
    this.group = new THREE.Group();
    this.config = config;
    this.material = material;

    this.buildLobes(sharedGeometry);
    this.group.scale.copy(config.scale);
    this.group.rotation.copy(config.rotation);
  }

  private buildLobes(sharedGeom: THREE.BufferGeometry) {
    // Generate organic arrangement of overlapping lobes based on cloud type
    const lobeConfigs: { offset: THREE.Vector3; scale: THREE.Vector3; radius: number }[] = [];

    if (this.config.type === 'topCanopy') {
      // Wide sweeping bank of 20 overlapping billows hanging downwards (finer lobes)
      const count = 20;
      for (let i = 0; i < count; i++) {
        const x = (i - (count - 1) / 2) * 0.26 + (Math.sin(i * 1.7) * 0.06);
        const y = -0.12 - Math.sin((i / (count - 1)) * Math.PI) * 0.18;
        const z = (Math.cos(i * 2.3) * 0.10);
        const s = 0.28 + Math.sin((i / (count - 1)) * Math.PI) * 0.11;
        lobeConfigs.push({
          offset: new THREE.Vector3(x, y, z),
          scale: new THREE.Vector3(s, s * 0.95, s),
          radius: s,
        });
      }
    } else if (this.config.type === 'large') {
      // 20 overlapping organic rounded volumes forming a finely detailed cumulus cloud
      const offsets = [
        // Base foundation (periwinkle shadow underside)
        [-0.50, -0.12, 0.0, 0.28],
        [0.50, -0.12, 0.0, 0.28],
        [-0.32, -0.14, 0.06, 0.32],
        [0.32, -0.14, -0.06, 0.32],
        [-0.12, -0.16, 0.04, 0.34],
        [0.12, -0.16, -0.04, 0.34],
        // Mid-tier billows
        [-0.40, 0.04, 0.04, 0.32],
        [0.40, 0.04, -0.04, 0.32],
        [-0.20, 0.08, 0.08, 0.35],
        [0.20, 0.08, -0.08, 0.35],
        [0.0, 0.10, 0.06, 0.36],
        // Top crowning sunlit billows
        [0.0, 0.24, 0.0, 0.36],
        [-0.18, 0.20, 0.05, 0.30],
        [0.18, 0.20, -0.05, 0.30],
        [-0.35, 0.16, 0.02, 0.26],
        [0.35, 0.16, -0.02, 0.26],
        [-0.55, 0.0, 0.0, 0.24],
        [0.55, 0.0, 0.0, 0.24],
        [-0.10, -0.02, 0.12, 0.30],
        [0.10, -0.02, 0.12, 0.30],
      ];

      for (const [x, y, z, s] of offsets) {
        lobeConfigs.push({
          offset: new THREE.Vector3(x, y, z),
          scale: new THREE.Vector3(s, s * 0.96, s),
          radius: s,
        });
      }
    } else if (this.config.type === 'medium') {
      // 12 overlapping lobes (smaller, finer)
      const offsets = [
        [-0.32, -0.08, 0, 0.24],
        [0.32, -0.08, 0, 0.24],
        [-0.12, -0.10, 0.03, 0.27],
        [0.12, -0.10, -0.03, 0.27],
        [-0.20, 0.06, 0.04, 0.26],
        [0.20, 0.06, -0.04, 0.26],
        [0.0, 0.15, 0, 0.29],
        [-0.12, 0.14, 0.03, 0.24],
        [0.12, 0.14, -0.03, 0.24],
        [-0.36, 0.0, 0, 0.20],
        [0.36, 0.0, 0, 0.20],
        [0.0, 0.0, 0.08, 0.26],
      ];
      for (const [x, y, z, s] of offsets) {
        lobeConfigs.push({
          offset: new THREE.Vector3(x, y, z),
          scale: new THREE.Vector3(s, s * 0.95, s),
          radius: s,
        });
      }
    } else {
      // Small / Puff: 4–6 smaller lobes
      const offsets = [
        [-0.12, -0.04, 0, 0.18],
        [0.12, -0.04, 0, 0.18],
        [0.0, 0.06, 0, 0.22],
        [0.0, -0.02, 0.04, 0.18],
      ];
      for (const [x, y, z, s] of offsets) {
        lobeConfigs.push({
          offset: new THREE.Vector3(x, y, z),
          scale: new THREE.Vector3(s, s, s),
          radius: s,
        });
      }
    }

    for (const conf of lobeConfigs) {
      const lobe = new CloudLobe(sharedGeom, this.material, conf);
      this.lobes.push(lobe);
      this.group.add(lobe.mesh);
    }
  }

  public updateTransform(
    entryProgress: number,
    exitProgress: number,
    flyProgress: number
  ) {
    const startPos = this.config.targetPosition.clone().add(this.config.entryOffset);
    const targetPos = this.config.targetPosition.clone();
    const endPos = this.config.targetPosition.clone().add(this.config.exitOffset);

    // Current interpolated position
    const currentPos = new THREE.Vector3();
    currentPos.lerpVectors(startPos, targetPos, entryProgress);

    if (exitProgress > 0) {
      currentPos.lerpVectors(targetPos, endPos, exitProgress);
    }

    // Parallax depth motion during fly-through
    if (flyProgress > 0 && exitProgress === 0) {
      currentPos.z += flyProgress * 0.45 * this.config.speedParallax;
      currentPos.y += flyProgress * 0.15 * this.config.speedParallax;
      currentPos.x += (this.config.targetPosition.x) * flyProgress * 0.2 * this.config.speedParallax;
    }

    this.group.position.copy(currentPos);

    // Scale calculation
    const currentScale = this.config.scale.clone();
    const scaleFactor = 0.92 + 0.08 * entryProgress + (flyProgress > 0 ? flyProgress * 0.05 : 0);
    this.group.scale.copy(currentScale.multiplyScalar(scaleFactor));
  }

  public setOpacity(opacity: number) {
    this.material.uniforms.uOpacity.value = opacity;
  }
}
