import * as THREE from 'three';
import { MaterialManager } from './Materials';
import { PipeNode } from '../puzzle/Pipe';
import { COLOR_PALETTE, FlowColor } from '../puzzle/ColorSystem';
import { PipeTextureFactory } from './PipeTextureFactory';

export const CELL_SIZE = 1.6;
export const HALF_CELL = CELL_SIZE / 2;
export const PIPE_RADIUS = 0.28;
export const COLLAR_RADIUS = 0.35;
export const COLLAR_LENGTH = 0.16;

export class PipeMeshFactory {
  private static mats = MaterialManager.getInstance();

  /**
   * Builds the 3D Group for a pipe, centered at (0,0,0).
   */
  public static createPipeMesh(pipe: PipeNode): THREE.Group {
    const group = new THREE.Group();
    group.name = `pipe_${pipe.id}`;

    const visualGroup = new THREE.Group();
    visualGroup.name = 'visual_group';

    // If pipe is explicitly a cross or rotatable, check if it's a rotatable junction
    if (pipe.type === 'cross' && !pipe.locked) {
      this.buildRotatableJunction(visualGroup);
    } else if (pipe.locked && pipe.type !== 'blocker') {
      this.buildLockedPipe(visualGroup, pipe.type);
    } else {
      switch (pipe.type) {
        case 'straight':
          this.buildStraight(visualGroup);
          break;
        case 'corner':
          this.buildElbow(visualGroup);
          break;
        case 't_junction':
          this.buildTJunction(visualGroup);
          break;
        case 'cross':
          this.buildCross(visualGroup);
          break;
        case 'splitter':
          this.buildSplitter(visualGroup);
          break;
        case 'merger':
          this.buildMerger(visualGroup);
          break;
        case 'gate':
          this.buildGate(visualGroup, pipe.isOpen ?? true);
          break;
        case 'one_way':
          this.buildOneWay(visualGroup);
          break;
        case 'color_changer':
          this.buildColorFilter(visualGroup, pipe.targetColor);
          break;
        case 'end':
          this.buildEnd(visualGroup);
          break;
        case 'blocker':
          this.buildBlocker(visualGroup);
          break;
        default:
          this.buildStraight(visualGroup);
      }
    }

    group.add(visualGroup);

    // Apply rotation in Z (clockwise rotation in our top-down 2D grid maps to -Z rotation in Three.js)
    const rotRad = -THREE.MathUtils.degToRad(pipe.rotation);
    group.rotation.z = rotRad;

    group.userData = { pipeId: pipe.id, pipeData: pipe };

    return group;
  }

  /**
   * Creates a prominent dark gunmetal connector collar with polished chrome bevel
   * ("Metal Ring (Connector)" from reference image).
   */
  public static createCollar(x: number, y: number, angleZ: number): THREE.Group {
    const collarGroup = new THREE.Group();
    collarGroup.position.set(x, y, 0);
    collarGroup.rotation.z = angleZ;

    // 1. Main dark gunmetal metallic sleeve (high contrast against sky/clouds)
    const sleeveGeom = new THREE.CylinderGeometry(COLLAR_RADIUS, COLLAR_RADIUS, COLLAR_LENGTH, 28);
    const sleeve = new THREE.Mesh(sleeveGeom, this.mats.metalCollarMaterial);
    sleeve.castShadow = true;
    collarGroup.add(sleeve);

    // 2. Polished silver chrome beveled outer lip rim
    const outerLipGeom = new THREE.TorusGeometry(COLLAR_RADIUS * 1.03, 0.032, 16, 28);
    const outerLip = new THREE.Mesh(outerLipGeom, this.mats.metalAccentMaterial);
    outerLip.rotation.x = Math.PI / 2;
    outerLip.position.y = COLLAR_LENGTH * 0.35;
    collarGroup.add(outerLip);

    // 3. Inner gasket flange ring
    const innerLipGeom = new THREE.TorusGeometry(COLLAR_RADIUS * 0.98, 0.024, 16, 28);
    const innerLip = new THREE.Mesh(innerLipGeom, this.mats.metalAccentMaterial);
    innerLip.rotation.x = Math.PI / 2;
    innerLip.position.y = -COLLAR_LENGTH * 0.35;
    collarGroup.add(innerLip);

    return collarGroup;
  }

  /**
   * Creates high-visibility glass cylinder with inner refraction shading & reflection highlight
   */
  private static createGlassCylinder(length: number): THREE.Group {
    const group = new THREE.Group();

    // 1. Outer transparent glass tube
    const tubeGeom = new THREE.CylinderGeometry(PIPE_RADIUS, PIPE_RADIUS, length, 28);
    const tube = new THREE.Mesh(tubeGeom, this.mats.pipeGlassMaterial);
    tube.castShadow = true;
    group.add(tube);

    // 2. Inner refraction back-shadow (ensures crisp visibility against any background)
    const contourGeom = new THREE.CylinderGeometry(PIPE_RADIUS * 0.96, PIPE_RADIUS * 0.96, length * 0.98, 28);
    const contour = new THREE.Mesh(contourGeom, this.mats.pipeGlassContourMaterial);
    group.add(contour);

    // 3. Dual longitudinal white glossy reflection highlight strips
    const highlightGeom = new THREE.CylinderGeometry(PIPE_RADIUS * 1.01, PIPE_RADIUS * 1.01, length * 0.92, 16, 1, true, -0.2, 0.4);
    const highlight = new THREE.Mesh(highlightGeom, this.mats.pipeGlassHighlightMaterial);
    highlight.position.z = 0.02;
    group.add(highlight);

    return group;
  }

  /**
   * 1. Straight Pipe (0° / 90°)
   */
  private static buildStraight(parent: THREE.Group) {
    const tube = this.createGlassCylinder(CELL_SIZE);
    parent.add(tube);

    // Collars at top (+Y) and bottom (-Y)
    parent.add(this.createCollar(0, HALF_CELL - COLLAR_LENGTH / 2, 0));
    parent.add(this.createCollar(0, -HALF_CELL + COLLAR_LENGTH / 2, 0));
  }

  /**
   * 2. Elbow Pipe (90°)
   * Continuous smooth 90° glass torus bend, matching reference image!
   */
  private static buildElbow(parent: THREE.Group) {
    const cornerGroup = new THREE.Group();

    // Radius of curvature for the elbow
    const bendRadius = HALF_CELL;

    // 1. Smooth 90° glass torus arc curving from (+Y) to (+X)
    const torusGeom = new THREE.TorusGeometry(bendRadius, PIPE_RADIUS, 28, 36, Math.PI / 2);
    const torusMesh = new THREE.Mesh(torusGeom, this.mats.pipeGlassMaterial);
    // Torus default is in XY plane centered at (0,0) starting from angle 0 (X axis) to PI/2 (Y axis).
    // Center at (HALF_CELL, HALF_CELL) and rotate so arc sweeps from (0, HALF_CELL) down to (HALF_CELL, 0)
    torusMesh.position.set(HALF_CELL, HALF_CELL, 0);
    torusMesh.rotation.z = Math.PI;
    torusMesh.castShadow = true;
    cornerGroup.add(torusMesh);

    // 2. Inner refraction back-shadow for the bend
    const contourTorusGeom = new THREE.TorusGeometry(bendRadius, PIPE_RADIUS * 0.95, 24, 32, Math.PI / 2);
    const contourMesh = new THREE.Mesh(contourTorusGeom, this.mats.pipeGlassContourMaterial);
    contourMesh.position.set(HALF_CELL, HALF_CELL, 0);
    contourMesh.rotation.z = Math.PI;
    cornerGroup.add(contourMesh);

    // 3. Highlight strip on outer curved rim
    const hlTorusGeom = new THREE.TorusGeometry(bendRadius, PIPE_RADIUS * 1.01, 16, 28, Math.PI / 2);
    const hlMesh = new THREE.Mesh(hlTorusGeom, this.mats.pipeGlassHighlightMaterial);
    hlMesh.position.set(HALF_CELL, HALF_CELL, 0.02);
    hlMesh.rotation.z = Math.PI;
    cornerGroup.add(hlMesh);

    parent.add(cornerGroup);

    // Collars at top (+Y) and right (+X)
    parent.add(this.createCollar(0, HALF_CELL - COLLAR_LENGTH / 2, 0));
    parent.add(this.createCollar(HALF_CELL - COLLAR_LENGTH / 2, 0, Math.PI / 2));
  }

  /**
   * 3. T Pipe (3-way)
   */
  private static buildTJunction(parent: THREE.Group) {
    // Top leg (+Y)
    const topLeg = this.createGlassCylinder(HALF_CELL);
    topLeg.position.set(0, HALF_CELL / 2, 0);
    parent.add(topLeg);

    // Horizontal full cross tube (left -X to right +X)
    const horizTube = this.createGlassCylinder(CELL_SIZE);
    horizTube.rotation.z = Math.PI / 2;
    parent.add(horizTube);

    // Center junction junction sphere
    const centerGeom = new THREE.SphereGeometry(PIPE_RADIUS * 1.04, 28, 28);
    const centerSphere = new THREE.Mesh(centerGeom, this.mats.pipeGlassMaterial);
    parent.add(centerSphere);

    // Collars on 3 open ports
    parent.add(this.createCollar(0, HALF_CELL - COLLAR_LENGTH / 2, 0));
    parent.add(this.createCollar(-HALF_CELL + COLLAR_LENGTH / 2, 0, Math.PI / 2));
    parent.add(this.createCollar(HALF_CELL - COLLAR_LENGTH / 2, 0, Math.PI / 2));
  }

  /**
   * 4. Cross Pipe (4-way)
   */
  private static buildCross(parent: THREE.Group) {
    const vertTube = this.createGlassCylinder(CELL_SIZE);
    parent.add(vertTube);

    const horizTube = this.createGlassCylinder(CELL_SIZE);
    horizTube.rotation.z = Math.PI / 2;
    parent.add(horizTube);

    const centerGeom = new THREE.SphereGeometry(PIPE_RADIUS * 1.06, 28, 28);
    parent.add(new THREE.Mesh(centerGeom, this.mats.pipeGlassMaterial));

    // Collars on all 4 open ports
    parent.add(this.createCollar(0, HALF_CELL - COLLAR_LENGTH / 2, 0));
    parent.add(this.createCollar(0, -HALF_CELL + COLLAR_LENGTH / 2, 0));
    parent.add(this.createCollar(-HALF_CELL + COLLAR_LENGTH / 2, 0, Math.PI / 2));
    parent.add(this.createCollar(HALF_CELL - COLLAR_LENGTH / 2, 0, Math.PI / 2));
  }

  /**
   * 5. Rotatable Junction (Manual Rotate)
   * Cobalt blue cube with circular white rotation badge (↻) and 4 pipe ports
   * exactly matching the reference image!
   */
  public static buildRotatableJunction(parent: THREE.Group) {
    const junctionGroup = new THREE.Group();
    junctionGroup.name = 'rotatable_junction';

    // 1. Short connecting glass stubs for each of the 4 directions
    const stubLen = (CELL_SIZE - 0.72) / 2;
    const topStub = this.createGlassCylinder(stubLen);
    topStub.position.y = HALF_CELL - stubLen / 2;
    junctionGroup.add(topStub);

    const botStub = this.createGlassCylinder(stubLen);
    botStub.position.y = -HALF_CELL + stubLen / 2;
    junctionGroup.add(botStub);

    const leftStub = this.createGlassCylinder(stubLen);
    leftStub.rotation.z = Math.PI / 2;
    leftStub.position.x = -HALF_CELL + stubLen / 2;
    junctionGroup.add(leftStub);

    const rightStub = this.createGlassCylinder(stubLen);
    rightStub.rotation.z = Math.PI / 2;
    rightStub.position.x = HALF_CELL - stubLen / 2;
    junctionGroup.add(rightStub);

    // 2. Dark charcoal metal connector collars on all 4 open ports
    junctionGroup.add(this.createCollar(0, HALF_CELL - COLLAR_LENGTH / 2, 0));
    junctionGroup.add(this.createCollar(0, -HALF_CELL + COLLAR_LENGTH / 2, 0));
    junctionGroup.add(this.createCollar(-HALF_CELL + COLLAR_LENGTH / 2, 0, Math.PI / 2));
    junctionGroup.add(this.createCollar(HALF_CELL - COLLAR_LENGTH / 2, 0, Math.PI / 2));

    // 3. Central Cobalt Blue Cube (0.72 x 0.72 x 0.68)
    const cubeGeom = new THREE.BoxGeometry(0.72, 0.72, 0.64);
    const cubeMesh = new THREE.Mesh(cubeGeom, this.mats.junctionBlueMaterial);
    cubeMesh.castShadow = true;
    junctionGroup.add(cubeMesh);

    // 4. Dark graphite outer bezel frame around the cube
    const bezelGeom = new THREE.BoxGeometry(0.76, 0.76, 0.58);
    const bezelMesh = new THREE.Mesh(bezelGeom, this.mats.junctionDarkMaterial);
    bezelMesh.position.z = -0.02;
    junctionGroup.add(bezelMesh);

    // 5. Polished chrome corner rivets / accents
    const rivetGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.04, 16);
    const rivetMat = this.mats.metalAccentMaterial;
    [
      [-0.28, 0.28],
      [0.28, 0.28],
      [-0.28, -0.28],
      [0.28, -0.28],
    ].forEach(([rx, ry]) => {
      const rivet = new THREE.Mesh(rivetGeom, rivetMat);
      rivet.rotation.x = Math.PI / 2;
      rivet.position.set(rx, ry, 0.33);
      junctionGroup.add(rivet);
    });

    // 6. Front Circular White Rotation Badge (↻) with cyan glow
    const badgeGeom = new THREE.PlaneGeometry(0.48, 0.48);
    const badgeMat = new THREE.MeshBasicMaterial({
      map: PipeTextureFactory.getRotationBadgeTexture(),
      transparent: true,
      depthWrite: false,
    });
    const badgeMesh = new THREE.Mesh(badgeGeom, badgeMat);
    badgeMesh.position.z = 0.33;
    junctionGroup.add(badgeMesh);

    parent.add(junctionGroup);
  }

  /**
   * 6. Locked Pipe ("Unlocks Later" from reference image)
   */
  private static buildLockedPipe(parent: THREE.Group, baseType: string) {
    if (baseType === 'corner') {
      this.buildElbow(parent);
    } else {
      this.buildStraight(parent);
    }

    // Padlock block in center
    const lockGeom = new THREE.PlaneGeometry(0.48, 0.48);
    const lockMat = new THREE.MeshBasicMaterial({
      map: PipeTextureFactory.getLockTexture(),
      transparent: true,
      depthWrite: false,
    });
    const lockMesh = new THREE.Mesh(lockGeom, lockMat);
    lockMesh.position.z = 0.22;
    parent.add(lockMesh);
  }

  /**
   * 7. One Way Pipe ("Flow in One Direction" from reference image)
   */
  private static buildOneWay(parent: THREE.Group) {
    this.buildStraight(parent);

    // Glowing neon arrow pointing down in direction of flow
    const arrowGroup = new THREE.Group();
    arrowGroup.position.z = 0.02;

    const arrowMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.95,
    });

    [-0.22, 0.12].forEach((yPos) => {
      const shaftGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.18, 16);
      const shaft = new THREE.Mesh(shaftGeom, arrowMat);
      shaft.position.set(0, yPos + 0.08, 0);
      arrowGroup.add(shaft);

      const headGeom = new THREE.ConeGeometry(0.12, 0.16, 16);
      const head = new THREE.Mesh(headGeom, arrowMat);
      head.rotation.z = Math.PI; // Pointing down
      head.position.set(0, yPos - 0.06, 0);
      arrowGroup.add(head);
    });

    parent.add(arrowGroup);
  }

  /**
   * 8. Color Filter ("Only Allow Specific Color" from reference image)
   */
  private static buildColorFilter(parent: THREE.Group, targetColor: FlowColor = 'yellow') {
    this.buildStraight(parent);

    const colorDef = COLOR_PALETTE[targetColor] || COLOR_PALETTE.yellow;

    // Glowing colored optical ring band in center
    const filterBandGeom = new THREE.CylinderGeometry(COLLAR_RADIUS * 1.08, COLLAR_RADIUS * 1.08, 0.36, 28);
    const filterBandMat = new THREE.MeshStandardMaterial({
      color: colorDef.hexNumber,
      emissive: colorDef.emissive,
      emissiveIntensity: 0.8,
      metalness: 0.7,
      roughness: 0.2,
    });
    const filterBand = new THREE.Mesh(filterBandGeom, filterBandMat);
    filterBand.castShadow = true;
    parent.add(filterBand);

    // Chrome collar rims sandwiching the filter band
    const rimGeom = new THREE.TorusGeometry(COLLAR_RADIUS * 1.1, 0.03, 16, 28);
    const topRim = new THREE.Mesh(rimGeom, this.mats.metalAccentMaterial);
    topRim.rotation.x = Math.PI / 2;
    topRim.position.y = 0.18;
    parent.add(topRim);

    const botRim = topRim.clone();
    botRim.position.y = -0.18;
    parent.add(botRim);

    // Glowing internal color crystal
    const crystalGeom = new THREE.SphereGeometry(0.18, 24, 24);
    const crystalMat = this.mats.getBallMaterial(targetColor);
    const crystal = new THREE.Mesh(crystalGeom, crystalMat);
    crystal.position.z = 0.04;
    parent.add(crystal);
  }

  /**
   * 9. Blocker ("Stops Flow" from reference image)
   */
  private static buildBlocker(parent: THREE.Group) {
    const baseGeom = new THREE.BoxGeometry(CELL_SIZE * 0.82, CELL_SIZE * 0.82, 0.28);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.35,
    });
    const base = new THREE.Mesh(baseGeom, baseMat);
    base.castShadow = true;
    parent.add(base);

    // Red square with white X badge
    const badgeGeom = new THREE.PlaneGeometry(0.55, 0.55);
    const badgeMat = new THREE.MeshBasicMaterial({
      map: PipeTextureFactory.getBlockerTexture(),
      transparent: true,
      depthWrite: false,
    });
    const badge = new THREE.Mesh(badgeGeom, badgeMat);
    badge.position.z = 0.16;
    parent.add(badge);
  }

  /**
   * 10. Splitter ("Divides Flow" from reference image)
   */
  private static buildSplitter(parent: THREE.Group) {
    this.buildTJunction(parent);

    // Violet glowing splitter hub badge in center
    const hubGeom = new THREE.CylinderGeometry(0.36, 0.36, 0.08, 32);
    const hubMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      metalness: 0.85,
      roughness: 0.2,
      emissive: 0x6d28d9,
      emissiveIntensity: 0.5,
    });
    const hub = new THREE.Mesh(hubGeom, hubMat);
    hub.rotation.x = Math.PI / 2;
    hub.position.z = 0.22;
    parent.add(hub);

    // Split arrow indicator ring
    const ringGeom = new THREE.TorusGeometry(0.22, 0.035, 16, 32);
    const ring = new THREE.Mesh(ringGeom, this.mats.metalAccentMaterial);
    ring.position.z = 0.28;
    parent.add(ring);
  }

  /**
   * 11. Merger ("Combines Flow" from reference image)
   */
  private static buildMerger(parent: THREE.Group) {
    const horizTube = this.createGlassCylinder(CELL_SIZE);
    horizTube.rotation.z = Math.PI / 2;
    parent.add(horizTube);

    const botLeg = this.createGlassCylinder(HALF_CELL);
    botLeg.position.set(0, -HALF_CELL / 2, 0);
    parent.add(botLeg);

    const hubGeom = new THREE.CylinderGeometry(0.36, 0.36, 0.08, 32);
    const hubMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.85,
      roughness: 0.2,
      emissive: 0x0369a1,
      emissiveIntensity: 0.5,
    });
    const hub = new THREE.Mesh(hubGeom, hubMat);
    hub.rotation.x = Math.PI / 2;
    hub.position.z = 0.22;
    parent.add(hub);

    parent.add(this.createCollar(-HALF_CELL + COLLAR_LENGTH / 2, 0, Math.PI / 2));
    parent.add(this.createCollar(HALF_CELL - COLLAR_LENGTH / 2, 0, Math.PI / 2));
    parent.add(this.createCollar(0, -HALF_CELL + COLLAR_LENGTH / 2, 0));
  }

  /**
   * 12. Gate Valve
   */
  private static buildGate(parent: THREE.Group, isOpen: boolean) {
    this.buildStraight(parent);

    const mountGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.2, 16);
    const mount = new THREE.Mesh(mountGeom, this.mats.metalCollarMaterial);
    mount.rotation.x = Math.PI / 2;
    mount.position.z = 0.16;
    parent.add(mount);

    const wheelGroup = new THREE.Group();
    wheelGroup.name = 'valve_wheel';
    wheelGroup.position.z = 0.32;

    const rimGeom = new THREE.TorusGeometry(0.24, 0.038, 16, 28);
    const rimMat = new THREE.MeshStandardMaterial({
      color: isOpen ? 0x10b981 : 0xef4444,
      metalness: 0.75,
      roughness: 0.2,
      emissive: isOpen ? 0x059669 : 0xdc2626,
      emissiveIntensity: 0.3,
    });
    const rim = new THREE.Mesh(rimGeom, rimMat);
    wheelGroup.add(rim);

    const spoke1Geom = new THREE.CylinderGeometry(0.02, 0.02, 0.44, 8);
    const spoke1 = new THREE.Mesh(spoke1Geom, this.mats.metalAccentMaterial);
    wheelGroup.add(spoke1);

    const spoke2 = spoke1.clone();
    spoke2.rotation.z = Math.PI / 2;
    wheelGroup.add(spoke2);

    parent.add(wheelGroup);
  }

  /**
   * 13. End Cap
   */
  private static buildEnd(parent: THREE.Group) {
    const tube = this.createGlassCylinder(HALF_CELL);
    tube.position.set(0, HALF_CELL / 2, 0);
    parent.add(tube);

    const capGeom = new THREE.SphereGeometry(PIPE_RADIUS, 24, 24);
    parent.add(new THREE.Mesh(capGeom, this.mats.metalCollarMaterial));
    parent.add(this.createCollar(0, HALF_CELL - COLLAR_LENGTH / 2, 0));
  }
}
