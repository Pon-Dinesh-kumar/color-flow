import * as THREE from 'three';
import { MaterialManager } from './Materials';
import { PipeNode } from '../puzzle/Pipe';
import { COLOR_PALETTE, FlowColor } from '../puzzle/ColorSystem';

export const CELL_SIZE = 1.6;
export const HALF_CELL = CELL_SIZE / 2;
const PIPE_RADIUS = 0.25;
const COLLAR_RADIUS = 0.29;
const COLLAR_LENGTH = 0.14;

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

    switch (pipe.type) {
      case 'straight':
        this.buildStraight(visualGroup);
        break;
      case 'corner':
        this.buildCorner(visualGroup);
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
        this.buildColorChanger(visualGroup, pipe.targetColor);
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

    group.add(visualGroup);

    // Apply rotation in Z (clockwise rotation in our top-down 2D grid maps to -Z rotation in Three.js)
    const rotRad = -THREE.MathUtils.degToRad(pipe.rotation);
    group.rotation.z = rotRad;

    group.userData = { pipeId: pipe.id, pipeData: pipe };

    return group;
  }

  /**
   * Creates a multi-ring metallic flange collar with beveled lip
   */
  private static createCollar(x: number, y: number, angleZ: number): THREE.Group {
    const collarGroup = new THREE.Group();
    collarGroup.position.set(x, y, 0);
    collarGroup.rotation.z = angleZ;

    // Main metallic sleeve
    const sleeveGeom = new THREE.CylinderGeometry(COLLAR_RADIUS, COLLAR_RADIUS, COLLAR_LENGTH, 24);
    const sleeve = new THREE.Mesh(sleeveGeom, this.mats.metalCollarMaterial);
    sleeve.castShadow = true;
    collarGroup.add(sleeve);

    // Outer beveled lip rim
    const lipGeom = new THREE.TorusGeometry(COLLAR_RADIUS * 1.02, 0.03, 16, 24);
    const lip = new THREE.Mesh(lipGeom, this.mats.metalAccentMaterial);
    lip.rotation.x = Math.PI / 2;
    collarGroup.add(lip);

    return collarGroup;
  }

  private static buildStraight(parent: THREE.Group) {
    // Outer translucent crystal tube
    const tubeGeom = new THREE.CylinderGeometry(PIPE_RADIUS, PIPE_RADIUS, CELL_SIZE, 24);
    const tube = new THREE.Mesh(tubeGeom, this.mats.pipeGlassMaterial);
    tube.castShadow = true;
    parent.add(tube);

    // Collars at top (+Y) and bottom (-Y)
    parent.add(this.createCollar(0, HALF_CELL - COLLAR_LENGTH / 2, 0));
    parent.add(this.createCollar(0, -HALF_CELL + COLLAR_LENGTH / 2, 0));
  }

  private static buildCorner(parent: THREE.Group) {
    // Connects up (+Y) and right (+X) at rotation 0
    // Vertical leg
    const vertGeom = new THREE.CylinderGeometry(PIPE_RADIUS, PIPE_RADIUS, HALF_CELL, 24);
    const vert = new THREE.Mesh(vertGeom, this.mats.pipeGlassMaterial);
    vert.position.set(0, HALF_CELL / 2, 0);
    vert.castShadow = true;
    parent.add(vert);

    // Horizontal leg
    const horizGeom = new THREE.CylinderGeometry(PIPE_RADIUS, PIPE_RADIUS, HALF_CELL, 24);
    const horiz = new THREE.Mesh(horizGeom, this.mats.pipeGlassMaterial);
    horiz.position.set(HALF_CELL / 2, 0, 0);
    horiz.rotation.z = Math.PI / 2;
    horiz.castShadow = true;
    parent.add(horiz);

    // Smooth elbow corner sphere at junction
    const elbowGeom = new THREE.SphereGeometry(PIPE_RADIUS * 1.02, 24, 24);
    const elbow = new THREE.Mesh(elbowGeom, this.mats.pipeGlassMaterial);
    elbow.castShadow = true;
    parent.add(elbow);

    // Collars at top (+Y) and right (+X)
    parent.add(this.createCollar(0, HALF_CELL - COLLAR_LENGTH / 2, 0));
    parent.add(this.createCollar(HALF_CELL - COLLAR_LENGTH / 2, 0, Math.PI / 2));
  }

  private static buildTJunction(parent: THREE.Group) {
    // Connects up (+Y), left (-X), right (+X) at rotation 0
    const topGeom = new THREE.CylinderGeometry(PIPE_RADIUS, PIPE_RADIUS, HALF_CELL, 24);
    const top = new THREE.Mesh(topGeom, this.mats.pipeGlassMaterial);
    top.position.set(0, HALF_CELL / 2, 0);
    top.castShadow = true;
    parent.add(top);

    const horizGeom = new THREE.CylinderGeometry(PIPE_RADIUS, PIPE_RADIUS, CELL_SIZE, 24);
    const horiz = new THREE.Mesh(horizGeom, this.mats.pipeGlassMaterial);
    horiz.rotation.z = Math.PI / 2;
    horiz.castShadow = true;
    parent.add(horiz);

    const centerGeom = new THREE.SphereGeometry(PIPE_RADIUS * 1.02, 24, 24);
    parent.add(new THREE.Mesh(centerGeom, this.mats.pipeGlassMaterial));

    parent.add(this.createCollar(0, HALF_CELL - COLLAR_LENGTH / 2, 0));
    parent.add(this.createCollar(-HALF_CELL + COLLAR_LENGTH / 2, 0, Math.PI / 2));
    parent.add(this.createCollar(HALF_CELL - COLLAR_LENGTH / 2, 0, Math.PI / 2));
  }

  private static buildCross(parent: THREE.Group) {
    const vertGeom = new THREE.CylinderGeometry(PIPE_RADIUS, PIPE_RADIUS, CELL_SIZE, 24);
    const vert = new THREE.Mesh(vertGeom, this.mats.pipeGlassMaterial);
    vert.castShadow = true;
    parent.add(vert);

    const horizGeom = new THREE.CylinderGeometry(PIPE_RADIUS, PIPE_RADIUS, CELL_SIZE, 24);
    const horiz = new THREE.Mesh(horizGeom, this.mats.pipeGlassMaterial);
    horiz.rotation.z = Math.PI / 2;
    horiz.castShadow = true;
    parent.add(horiz);

    const centerGeom = new THREE.SphereGeometry(PIPE_RADIUS * 1.06, 24, 24);
    parent.add(new THREE.Mesh(centerGeom, this.mats.pipeGlassMaterial));

    parent.add(this.createCollar(0, HALF_CELL - COLLAR_LENGTH / 2, 0));
    parent.add(this.createCollar(0, -HALF_CELL + COLLAR_LENGTH / 2, 0));
    parent.add(this.createCollar(-HALF_CELL + COLLAR_LENGTH / 2, 0, Math.PI / 2));
    parent.add(this.createCollar(HALF_CELL - COLLAR_LENGTH / 2, 0, Math.PI / 2));
  }

  private static buildSplitter(parent: THREE.Group) {
    this.buildTJunction(parent);

    // Glowing splitter icon badge in center (matches reference photo!)
    const hubGeom = new THREE.CylinderGeometry(0.34, 0.34, 0.08, 32);
    const hubMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      metalness: 0.85,
      roughness: 0.2,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.4,
    });
    const hub = new THREE.Mesh(hubGeom, hubMat);
    hub.rotation.x = Math.PI / 2;
    hub.position.z = 0.22;
    parent.add(hub);

    // Split arrow indicator ring
    const ringGeom = new THREE.TorusGeometry(0.2, 0.035, 16, 32);
    const ring = new THREE.Mesh(ringGeom, this.mats.metalCollarMaterial);
    ring.position.z = 0.28;
    parent.add(ring);
  }

  private static buildMerger(parent: THREE.Group) {
    const horizGeom = new THREE.CylinderGeometry(PIPE_RADIUS, PIPE_RADIUS, CELL_SIZE, 24);
    const horiz = new THREE.Mesh(horizGeom, this.mats.pipeGlassMaterial);
    horiz.rotation.z = Math.PI / 2;
    parent.add(horiz);

    const botGeom = new THREE.CylinderGeometry(PIPE_RADIUS, PIPE_RADIUS, HALF_CELL, 24);
    const bot = new THREE.Mesh(botGeom, this.mats.pipeGlassMaterial);
    bot.position.set(0, -HALF_CELL / 2, 0);
    parent.add(bot);

    const hubGeom = new THREE.CylinderGeometry(0.34, 0.34, 0.08, 32);
    const hubMat = new THREE.MeshStandardMaterial({
      color: 0x9333ea,
      metalness: 0.85,
      roughness: 0.2,
      emissive: 0x7e22ce,
      emissiveIntensity: 0.4,
    });
    const hub = new THREE.Mesh(hubGeom, hubMat);
    hub.rotation.x = Math.PI / 2;
    hub.position.z = 0.22;
    parent.add(hub);

    parent.add(this.createCollar(-HALF_CELL + COLLAR_LENGTH / 2, 0, Math.PI / 2));
    parent.add(this.createCollar(HALF_CELL - COLLAR_LENGTH / 2, 0, Math.PI / 2));
    parent.add(this.createCollar(0, -HALF_CELL + COLLAR_LENGTH / 2, 0));
  }

  private static buildGate(parent: THREE.Group, isOpen: boolean) {
    this.buildStraight(parent);

    const mountGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.2, 16);
    const mount = new THREE.Mesh(mountGeom, this.mats.metalAccentMaterial);
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
    });
    const rim = new THREE.Mesh(rimGeom, rimMat);
    rim.name = 'valve_rim';
    wheelGroup.add(rim);

    const spoke1Geom = new THREE.CylinderGeometry(0.02, 0.02, 0.44, 8);
    const spoke1 = new THREE.Mesh(spoke1Geom, this.mats.metalCollarMaterial);
    wheelGroup.add(spoke1);

    const spoke2 = spoke1.clone();
    spoke2.rotation.z = Math.PI / 2;
    wheelGroup.add(spoke2);

    parent.add(wheelGroup);
  }

  private static buildOneWay(parent: THREE.Group) {
    this.buildStraight(parent);

    const arrowMat = new THREE.MeshStandardMaterial({
      color: 0x60a5fa,
      emissive: 0x2563eb,
      emissiveIntensity: 0.9,
      metalness: 0.5,
      roughness: 0.2,
    });

    [-0.2, 0.2].forEach((yPos) => {
      const coneGeom = new THREE.ConeGeometry(0.12, 0.18, 16);
      const cone = new THREE.Mesh(coneGeom, arrowMat);
      cone.rotation.z = Math.PI; // pointing down
      cone.position.set(0, yPos, 0.05);
      parent.add(cone);
    });
  }

  private static buildColorChanger(parent: THREE.Group, targetColor: FlowColor = 'purple') {
    this.buildStraight(parent);

    const colorDef = COLOR_PALETTE[targetColor] || COLOR_PALETTE.purple;

    const boxGeom = new THREE.BoxGeometry(0.48, 0.48, 0.48);
    const boxMat = new THREE.MeshPhysicalMaterial({
      color: colorDef.hexNumber,
      transparent: true,
      opacity: 0.85,
      transmission: 0.75,
      roughness: 0.08,
      metalness: 0.1,
      emissive: colorDef.emissive,
      emissiveIntensity: 0.7,
    });
    const prism = new THREE.Mesh(boxGeom, boxMat);
    prism.position.z = 0.08;
    parent.add(prism);

    const frameGeom = new THREE.BoxGeometry(0.52, 0.52, 0.1);
    const wireMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.9,
      roughness: 0.2,
      wireframe: true,
    });
    const frame = new THREE.Mesh(frameGeom, wireMat);
    frame.position.z = 0.08;
    parent.add(frame);
  }

  private static buildEnd(parent: THREE.Group) {
    const tubeGeom = new THREE.CylinderGeometry(PIPE_RADIUS, PIPE_RADIUS, HALF_CELL, 24);
    const tube = new THREE.Mesh(tubeGeom, this.mats.pipeGlassMaterial);
    tube.position.set(0, HALF_CELL / 2, 0);
    parent.add(tube);

    const capGeom = new THREE.SphereGeometry(PIPE_RADIUS, 24, 24);
    parent.add(new THREE.Mesh(capGeom, this.mats.metalAccentMaterial));
    parent.add(this.createCollar(0, HALF_CELL - COLLAR_LENGTH / 2, 0));
  }

  private static buildBlocker(parent: THREE.Group) {
    const baseGeom = new THREE.BoxGeometry(CELL_SIZE * 0.85, CELL_SIZE * 0.85, 0.3);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.7,
      metalness: 0.3,
    });
    const base = new THREE.Mesh(baseGeom, baseMat);
    parent.add(base);

    const lockGeom = new THREE.TorusGeometry(0.2, 0.04, 16, 24);
    const lock = new THREE.Mesh(lockGeom, this.mats.metalCollarMaterial);
    lock.position.z = 0.2;
    parent.add(lock);
  }
}
