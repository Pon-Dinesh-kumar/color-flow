import * as THREE from 'three';
import { MaterialManager } from './Materials';
import { PipeNode } from '../puzzle/Pipe';
import { COLOR_PALETTE, FlowColor } from '../puzzle/ColorSystem';

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
   * Creates playful, friendly toy collar cuffs (glossy white enamel with chrome lips)
   */
  public static createCollar(x: number, y: number, angleZ: number): THREE.Group {
    const collarGroup = new THREE.Group();
    collarGroup.position.set(x, y, 0);
    collarGroup.rotation.z = angleZ;

    // 1. Glossy white toy enamel sleeve (clean, friendly, bright)
    const sleeveGeom = new THREE.CylinderGeometry(COLLAR_RADIUS, COLLAR_RADIUS, COLLAR_LENGTH, 28);
    const sleeve = new THREE.Mesh(sleeveGeom, this.mats.metalCollarMaterial);
    sleeve.castShadow = true;
    collarGroup.add(sleeve);

    // 2. Cheerful polished chrome outer lip rim
    const outerLipGeom = new THREE.TorusGeometry(COLLAR_RADIUS * 1.03, 0.03, 16, 28);
    const outerLip = new THREE.Mesh(outerLipGeom, this.mats.metalAccentMaterial);
    outerLip.rotation.x = Math.PI / 2;
    outerLip.position.y = COLLAR_LENGTH * 0.35;
    collarGroup.add(outerLip);

    // 3. Inner flange rim
    const innerLipGeom = new THREE.TorusGeometry(COLLAR_RADIUS * 0.98, 0.024, 16, 28);
    const innerLip = new THREE.Mesh(innerLipGeom, this.mats.metalAccentMaterial);
    innerLip.rotation.x = Math.PI / 2;
    innerLip.position.y = -COLLAR_LENGTH * 0.35;
    collarGroup.add(innerLip);

    return collarGroup;
  }

  /**
   * Creates friendly, crystal-clear toy acrylic pipe with playful reflection highlight
   */
  private static createGlassCylinder(length: number): THREE.Group {
    const group = new THREE.Group();

    // 1. Crystal toy acrylic tube
    const tubeGeom = new THREE.CylinderGeometry(PIPE_RADIUS, PIPE_RADIUS, length, 28);
    const tube = new THREE.Mesh(tubeGeom, this.mats.pipeGlassMaterial);
    tube.castShadow = true;
    group.add(tube);

    // 2. Soft sky/lavender contour for separation against bright backgrounds
    const contourGeom = new THREE.CylinderGeometry(PIPE_RADIUS * 0.96, PIPE_RADIUS * 0.96, length * 0.98, 28);
    const contour = new THREE.Mesh(contourGeom, this.mats.pipeGlassContourMaterial);
    group.add(contour);

    // 3. Crisp white longitudinal glass reflection highlight strip
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
   * Continuous smooth 90° glass torus bend matching kids toy marble run!
   */
  private static buildElbow(parent: THREE.Group) {
    const cornerGroup = new THREE.Group();
    const bendRadius = HALF_CELL;

    // 1. Smooth 90° glass torus arc curving from (+Y) to (+X)
    const torusGeom = new THREE.TorusGeometry(bendRadius, PIPE_RADIUS, 28, 36, Math.PI / 2);
    const torusMesh = new THREE.Mesh(torusGeom, this.mats.pipeGlassMaterial);
    torusMesh.position.set(HALF_CELL, HALF_CELL, 0);
    torusMesh.rotation.z = Math.PI;
    torusMesh.castShadow = true;
    cornerGroup.add(torusMesh);

    // 2. Soft contour
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
    const topLeg = this.createGlassCylinder(HALF_CELL);
    topLeg.position.set(0, HALF_CELL / 2, 0);
    parent.add(topLeg);

    const horizTube = this.createGlassCylinder(CELL_SIZE);
    horizTube.rotation.z = Math.PI / 2;
    parent.add(horizTube);

    const centerGeom = new THREE.SphereGeometry(PIPE_RADIUS * 1.04, 28, 28);
    const centerSphere = new THREE.Mesh(centerGeom, this.mats.pipeGlassMaterial);
    parent.add(centerSphere);

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

    parent.add(this.createCollar(0, HALF_CELL - COLLAR_LENGTH / 2, 0));
    parent.add(this.createCollar(0, -HALF_CELL + COLLAR_LENGTH / 2, 0));
    parent.add(this.createCollar(-HALF_CELL + COLLAR_LENGTH / 2, 0, Math.PI / 2));
    parent.add(this.createCollar(HALF_CELL - COLLAR_LENGTH / 2, 0, Math.PI / 2));
  }

  /**
   * 5. Rotatable Junction (Manual Rotate)
   * 100% 3D molded candy-blue toy cube with 3D embossed white button dial (NO flat stickers!)
   */
  public static buildRotatableJunction(parent: THREE.Group) {
    const junctionGroup = new THREE.Group();
    junctionGroup.name = 'rotatable_junction';

    // 1. Connecting glass stubs for each of the 4 directions
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

    // 2. Playful white collar cuffs on all 4 open ports
    junctionGroup.add(this.createCollar(0, HALF_CELL - COLLAR_LENGTH / 2, 0));
    junctionGroup.add(this.createCollar(0, -HALF_CELL + COLLAR_LENGTH / 2, 0));
    junctionGroup.add(this.createCollar(-HALF_CELL + COLLAR_LENGTH / 2, 0, Math.PI / 2));
    junctionGroup.add(this.createCollar(HALF_CELL - COLLAR_LENGTH / 2, 0, Math.PI / 2));

    // 3. Central Glossy Candy-Blue Cube (0.72 x 0.72 x 0.64)
    const cubeGeom = new THREE.BoxGeometry(0.72, 0.72, 0.64);
    const cubeMesh = new THREE.Mesh(cubeGeom, this.mats.junctionBlueMaterial);
    cubeMesh.castShadow = true;
    junctionGroup.add(cubeMesh);

    // 4. Cheerful chrome corner rivets
    const rivetGeom = new THREE.SphereGeometry(0.045, 16, 16);
    const rivetMat = this.mats.metalAccentMaterial;
    [
      [-0.26, 0.26],
      [0.26, 0.26],
      [-0.26, -0.26],
      [0.26, -0.26],
    ].forEach(([rx, ry]) => {
      const rivet = new THREE.Mesh(rivetGeom, rivetMat);
      rivet.position.set(rx, ry, 0.33);
      junctionGroup.add(rivet);
    });

    // 5. 3D Molded White Central Button Dial (Clean 3D geometry - NO flat stickers!)
    const dialBaseGeom = new THREE.CylinderGeometry(0.22, 0.24, 0.08, 32);
    const dialBase = new THREE.Mesh(dialBaseGeom, this.mats.junctionWhiteMaterial);
    dialBase.rotation.x = Math.PI / 2;
    dialBase.position.z = 0.34;
    junctionGroup.add(dialBase);

    // Outer embossed chrome ring on dial
    const dialRimGeom = new THREE.TorusGeometry(0.21, 0.024, 16, 32);
    const dialRim = new THREE.Mesh(dialRimGeom, this.mats.metalAccentMaterial);
    dialRim.position.z = 0.38;
    junctionGroup.add(dialRim);

    // 3D molded inner rotating core sphere
    const coreGeom = new THREE.SphereGeometry(0.10, 24, 24);
    const coreMat = this.mats.getBallMaterial('blue');
    const core = new THREE.Mesh(coreGeom, coreMat);
    core.position.z = 0.38;
    junctionGroup.add(core);

    parent.add(junctionGroup);
  }

  /**
   * 6. Locked Pipe ("Unlocks Later") - 3D Molded Clasp, NO stickers
   */
  private static buildLockedPipe(parent: THREE.Group, baseType: string) {
    if (baseType === 'corner') {
      this.buildElbow(parent);
    } else {
      this.buildStraight(parent);
    }

    // 3D Molded Golden Toy Clasp wrapping around the pipe
    const claspGeom = new THREE.CylinderGeometry(COLLAR_RADIUS * 1.08, COLLAR_RADIUS * 1.08, 0.36, 28);
    const claspMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.85,
      roughness: 0.2,
      emissive: 0xd97706,
      emissiveIntensity: 0.3,
    });
    const clasp = new THREE.Mesh(claspGeom, claspMat);
    clasp.castShadow = true;
    parent.add(clasp);

    // 3D Shackle arch
    const shackleGeom = new THREE.TorusGeometry(0.16, 0.035, 16, 24, Math.PI);
    const shackle = new THREE.Mesh(shackleGeom, this.mats.metalAccentMaterial);
    shackle.position.set(0, 0.18, 0.32);
    parent.add(shackle);
  }

  /**
   * 7. One Way Pipe - 3D Neon Arrow inside tube
   */
  private static buildOneWay(parent: THREE.Group) {
    this.buildStraight(parent);

    const arrowGroup = new THREE.Group();
    arrowGroup.position.z = 0.02;

    const arrowMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.2,
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
   * 8. Color Filter - 3D Optical Ring Band
   */
  private static buildColorFilter(parent: THREE.Group, targetColor: FlowColor = 'yellow') {
    this.buildStraight(parent);

    const colorDef = COLOR_PALETTE[targetColor] || COLOR_PALETTE.yellow;

    const filterBandGeom = new THREE.CylinderGeometry(COLLAR_RADIUS * 1.08, COLLAR_RADIUS * 1.08, 0.36, 28);
    const filterBandMat = new THREE.MeshStandardMaterial({
      color: colorDef.hexNumber,
      emissive: colorDef.emissive,
      emissiveIntensity: 0.8,
      metalness: 0.5,
      roughness: 0.15,
    });
    const filterBand = new THREE.Mesh(filterBandGeom, filterBandMat);
    filterBand.castShadow = true;
    parent.add(filterBand);

    const rimGeom = new THREE.TorusGeometry(COLLAR_RADIUS * 1.1, 0.03, 16, 28);
    const topRim = new THREE.Mesh(rimGeom, this.mats.metalAccentMaterial);
    topRim.rotation.x = Math.PI / 2;
    topRim.position.y = 0.18;
    parent.add(topRim);

    const botRim = topRim.clone();
    botRim.position.y = -0.18;
    parent.add(botRim);

    const crystalGeom = new THREE.SphereGeometry(0.18, 24, 24);
    const crystalMat = this.mats.getBallMaterial(targetColor);
    const crystal = new THREE.Mesh(crystalGeom, crystalMat);
    crystal.position.z = 0.04;
    parent.add(crystal);
  }

  /**
   * 9. Blocker - 3D Molded Red Stop Block, NO flat stickers
   */
  private static buildBlocker(parent: THREE.Group) {
    const baseGeom = new THREE.BoxGeometry(CELL_SIZE * 0.82, CELL_SIZE * 0.82, 0.28);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.2,
      emissive: 0xb91c1c,
      emissiveIntensity: 0.35,
    });
    const base = new THREE.Mesh(baseGeom, baseMat);
    base.castShadow = true;
    parent.add(base);

    // 3D Embossed White X Crossbeams
    const barGeom = new THREE.BoxGeometry(0.68, 0.12, 0.08);
    const bar1 = new THREE.Mesh(barGeom, this.mats.junctionWhiteMaterial);
    bar1.rotation.z = Math.PI / 4;
    bar1.position.z = 0.16;
    parent.add(bar1);

    const bar2 = new THREE.Mesh(barGeom, this.mats.junctionWhiteMaterial);
    bar2.rotation.z = -Math.PI / 4;
    bar2.position.z = 0.16;
    parent.add(bar2);
  }

  /**
   * 10. Splitter
   */
  private static buildSplitter(parent: THREE.Group) {
    this.buildTJunction(parent);

    const hubGeom = new THREE.CylinderGeometry(0.36, 0.36, 0.08, 32);
    const hubMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      roughness: 0.2,
      emissive: 0x9333ea,
      emissiveIntensity: 0.5,
    });
    const hub = new THREE.Mesh(hubGeom, hubMat);
    hub.rotation.x = Math.PI / 2;
    hub.position.z = 0.22;
    parent.add(hub);

    const ringGeom = new THREE.TorusGeometry(0.22, 0.035, 16, 32);
    const ring = new THREE.Mesh(ringGeom, this.mats.metalAccentMaterial);
    ring.position.z = 0.28;
    parent.add(ring);
  }

  /**
   * 11. Merger
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
      color: 0x0ea5e9,
      roughness: 0.2,
      emissive: 0x0284c7,
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
      color: isOpen ? 0x22c55e : 0xef4444,
      roughness: 0.2,
      emissive: isOpen ? 0x16a34a : 0xdc2626,
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
