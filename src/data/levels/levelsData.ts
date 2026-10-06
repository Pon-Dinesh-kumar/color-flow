import { LevelConfig } from '../../gameplay/Level';
import { Direction, GridPosition, getOppositeDirection, rotateDirection } from '../../puzzle/Grid';
import { FlowColor } from '../../puzzle/ColorSystem';
import { getBaseConnections, PipeType } from '../../puzzle/Pipe';

export const LEVELS: LevelConfig[] = [
  // Level 1: Tutorial - First connection
  {
    id: 'level_1',
    number: 1,
    title: 'First Flow',
    tutorialText: 'Tap the highlighted pipe to rotate it and connect the flow!',
    hintPipePosition: { x: 1, y: 2 },
    grid: { width: 3, height: 4 },
    sources: [
      { id: 's_red', position: { x: 1, y: 0 }, direction: 'down', color: 'red', amount: 10 },
    ],
    targets: [
      { id: 't_red', position: { x: 1, y: 3 }, acceptDirection: 'up', color: 'red', requiredAmount: 10, currentAmount: 0 },
    ],
    pipes: [
      { id: 'p1', type: 'straight', gridPosition: { x: 1, y: 1 }, rotation: 0, locked: true },
      { id: 'p2', type: 'straight', gridPosition: { x: 1, y: 2 }, rotation: 90 }, // needs 1 rotation to align
    ],
    targetMoves: 1,
    maxMoves: 10,
  },

  // Level 2: Corner bend
  {
    id: 'level_2',
    number: 2,
    title: 'The Bend',
    tutorialText: 'Rotate the elbow pipes to route the liquid!',
    hintPipePosition: { x: 0, y: 1 },
    grid: { width: 3, height: 4 },
    sources: [
      { id: 's_red', position: { x: 0, y: 0 }, direction: 'down', color: 'red', amount: 10 },
    ],
    targets: [
      { id: 't_red', position: { x: 2, y: 3 }, acceptDirection: 'up', color: 'red', requiredAmount: 10, currentAmount: 0 },
    ],
    pipes: [
      // Needs: enter from top, turn right -> rot 0 is up & right
      { id: 'p1', type: 'corner', gridPosition: { x: 0, y: 1 }, rotation: 90 },
      { id: 'p2', type: 'straight', gridPosition: { x: 1, y: 1 }, rotation: 90, locked: true },
      // Needs: enter from left, turn down -> rot 180 is down & left
      { id: 'p3', type: 'corner', gridPosition: { x: 2, y: 1 }, rotation: 0 },
      { id: 'p4', type: 'straight', gridPosition: { x: 2, y: 2 }, rotation: 0, locked: true },
    ],
    targetMoves: 5,
    maxMoves: 13,
  },

  // Level 3: Dual Color
  {
    id: 'level_3',
    number: 3,
    title: 'Dual Stream',
    tutorialText: 'Route each color into its matching canister!',
    grid: { width: 3, height: 4 },
    sources: [
      { id: 's_red', position: { x: 0, y: 0 }, direction: 'down', color: 'red', amount: 10 },
      { id: 's_blue', position: { x: 2, y: 0 }, direction: 'down', color: 'blue', amount: 10 },
    ],
    targets: [
      { id: 't_red', position: { x: 0, y: 3 }, acceptDirection: 'up', color: 'red', requiredAmount: 10, currentAmount: 0 },
      { id: 't_blue', position: { x: 2, y: 3 }, acceptDirection: 'up', color: 'blue', requiredAmount: 10, currentAmount: 0 },
    ],
    pipes: [
      { id: 'p_r1', type: 'straight', gridPosition: { x: 0, y: 1 }, rotation: 90 },
      { id: 'p_r2', type: 'straight', gridPosition: { x: 0, y: 2 }, rotation: 0, locked: true },
      { id: 'p_b1', type: 'straight', gridPosition: { x: 2, y: 1 }, rotation: 0, locked: true },
      { id: 'p_b2', type: 'straight', gridPosition: { x: 2, y: 2 }, rotation: 90 },
    ],
    targetMoves: 2,
    maxMoves: 12,
  },

  // Level 4: Crossing Paths
  {
    id: 'level_4',
    number: 4,
    title: 'Crossroad',
    tutorialText: 'Cross pipes allow two flows to pass without mixing!',
    grid: { width: 3, height: 5 },
    sources: [
      { id: 's_red', position: { x: 0, y: 0 }, direction: 'down', color: 'red', amount: 10 },
      { id: 's_blue', position: { x: 2, y: 0 }, direction: 'down', color: 'blue', amount: 10 },
    ],
    targets: [
      { id: 't_red', position: { x: 0, y: 4 }, acceptDirection: 'up', color: 'red', requiredAmount: 10, currentAmount: 0 },
      { id: 't_blue', position: { x: 2, y: 4 }, acceptDirection: 'up', color: 'blue', requiredAmount: 10, currentAmount: 0 },
    ],
    pipes: [
      { id: 'p_red1', type: 'straight', gridPosition: { x: 0, y: 1 }, rotation: 90 },
      { id: 'p_red2', type: 'cross', gridPosition: { x: 0, y: 2 }, rotation: 0 },
      { id: 'p_red3', type: 'straight', gridPosition: { x: 0, y: 3 }, rotation: 0, locked: true },
      { id: 'p_blue1', type: 'straight', gridPosition: { x: 2, y: 1 }, rotation: 0, locked: true },
      { id: 'p_blue2', type: 'straight', gridPosition: { x: 2, y: 2 }, rotation: 0, locked: true },
      { id: 'p_blue3', type: 'straight', gridPosition: { x: 2, y: 3 }, rotation: 0, locked: true },
    ],
    targetMoves: 1,
    maxMoves: 10,
  },

  // Level 5: T-Junction Switch
  {
    id: 'level_5',
    number: 5,
    title: 'T-Junction',
    tutorialText: 'Align the 3-way pipe to complete the circuit!',
    grid: { width: 4, height: 4 },
    sources: [
      { id: 's_yellow', position: { x: 1, y: 0 }, direction: 'down', color: 'yellow', amount: 10 },
    ],
    targets: [
      { id: 't_yellow', position: { x: 3, y: 3 }, acceptDirection: 'up', color: 'yellow', requiredAmount: 10, currentAmount: 0 },
    ],
    pipes: [
      { id: 'p1', type: 'straight', gridPosition: { x: 1, y: 1 }, rotation: 0 },
      { id: 'p2', type: 't_junction', gridPosition: { x: 1, y: 2 }, rotation: 90 },
      { id: 'p3', type: 'straight', gridPosition: { x: 2, y: 2 }, rotation: 90 },
      { id: 'p4', type: 'corner', gridPosition: { x: 3, y: 2 }, rotation: 270 },
    ],
    targetMoves: 3,
    maxMoves: 14,
  },

  // Level 6: Trio Harmony
  {
    id: 'level_6',
    number: 6,
    title: 'Trio Harmony',
    tutorialText: 'Red, Blue, and Yellow flows running parallel!',
    grid: { width: 5, height: 5 },
    sources: [
      { id: 's_red', position: { x: 0, y: 0 }, direction: 'down', color: 'red', amount: 10 },
      { id: 's_blue', position: { x: 2, y: 0 }, direction: 'down', color: 'blue', amount: 10 },
      { id: 's_yellow', position: { x: 4, y: 0 }, direction: 'down', color: 'yellow', amount: 10 },
    ],
    targets: [
      { id: 't_red', position: { x: 0, y: 4 }, acceptDirection: 'up', color: 'red', requiredAmount: 10, currentAmount: 0 },
      { id: 't_blue', position: { x: 2, y: 4 }, acceptDirection: 'up', color: 'blue', requiredAmount: 10, currentAmount: 0 },
      { id: 't_yellow', position: { x: 4, y: 4 }, acceptDirection: 'up', color: 'yellow', requiredAmount: 10, currentAmount: 0 },
    ],
    pipes: [
      { id: 'p1', type: 'straight', gridPosition: { x: 0, y: 1 }, rotation: 90 },
      { id: 'p2', type: 'straight', gridPosition: { x: 0, y: 2 }, rotation: 0 },
      { id: 'p3', type: 'straight', gridPosition: { x: 0, y: 3 }, rotation: 90 },
      { id: 'p4', type: 'straight', gridPosition: { x: 2, y: 1 }, rotation: 0 },
      { id: 'p5', type: 'straight', gridPosition: { x: 2, y: 2 }, rotation: 90 },
      { id: 'p6', type: 'straight', gridPosition: { x: 2, y: 3 }, rotation: 0 },
      { id: 'p7', type: 'straight', gridPosition: { x: 4, y: 1 }, rotation: 90 },
      { id: 'p8', type: 'straight', gridPosition: { x: 4, y: 2 }, rotation: 90 },
      { id: 'p9', type: 'straight', gridPosition: { x: 4, y: 3 }, rotation: 0 },
    ],
    targetMoves: 5,
    maxMoves: 18,
  },

  // Level 7: Split the Stream
  {
    id: 'level_7',
    number: 7,
    title: 'The Splitter',
    tutorialText: 'The Splitter pipe divides one stream into two!',
    grid: { width: 4, height: 4 },
    sources: [
      { id: 's_red', position: { x: 1, y: 0 }, direction: 'down', color: 'red', amount: 10 },
    ],
    targets: [
      { id: 't_red1', position: { x: 0, y: 3 }, acceptDirection: 'up', color: 'red', requiredAmount: 5, currentAmount: 0 },
      { id: 't_red2', position: { x: 2, y: 3 }, acceptDirection: 'up', color: 'red', requiredAmount: 5, currentAmount: 0 },
    ],
    pipes: [
      // Splitter at (1, 1): takes flow from top, splits to left and right at rot 0
      { id: 'spl', type: 'splitter', gridPosition: { x: 1, y: 1 }, rotation: 90 }, // needs 3 rotations or 1 back to 0
      // Left branch: enters from right, exits down -> rot 180 is down & left
      { id: 'c_left', type: 'corner', gridPosition: { x: 0, y: 1 }, rotation: 90 },
      { id: 's_left', type: 'straight', gridPosition: { x: 0, y: 2 }, rotation: 0, locked: true },
      // Right branch: enters from left, exits down -> rot 90 is right & down
      { id: 'c_right', type: 'corner', gridPosition: { x: 2, y: 1 }, rotation: 0 },
      { id: 's_right', type: 'straight', gridPosition: { x: 2, y: 2 }, rotation: 0, locked: true },
    ],
    targetMoves: 5,
    maxMoves: 16,
  },

  // Level 8: Splitter & Dual Color
  {
    id: 'level_8',
    number: 8,
    title: 'Twin Streams',
    grid: { width: 5, height: 4 },
    sources: [
      { id: 's_blue', position: { x: 1, y: 0 }, direction: 'down', color: 'blue', amount: 10 },
      { id: 's_yellow', position: { x: 3, y: 0 }, direction: 'down', color: 'yellow', amount: 10 },
    ],
    targets: [
      { id: 't_blue1', position: { x: 0, y: 3 }, acceptDirection: 'up', color: 'blue', requiredAmount: 5, currentAmount: 0 },
      { id: 't_blue2', position: { x: 2, y: 3 }, acceptDirection: 'up', color: 'blue', requiredAmount: 5, currentAmount: 0 },
      { id: 't_yellow', position: { x: 4, y: 3 }, acceptDirection: 'up', color: 'yellow', requiredAmount: 10, currentAmount: 0 },
    ],
    pipes: [
      { id: 'spl_b', type: 'splitter', gridPosition: { x: 1, y: 1 }, rotation: 0 },
      { id: 'c_l', type: 'corner', gridPosition: { x: 0, y: 1 }, rotation: 180 },
      { id: 's_l', type: 'straight', gridPosition: { x: 0, y: 2 }, rotation: 0 },
      { id: 'c_r', type: 'corner', gridPosition: { x: 2, y: 1 }, rotation: 90 },
      { id: 's_r', type: 'straight', gridPosition: { x: 2, y: 2 }, rotation: 90 },
      { id: 's_y1', type: 'straight', gridPosition: { x: 3, y: 1 }, rotation: 0 },
      { id: 'c_y1', type: 'corner', gridPosition: { x: 3, y: 2 }, rotation: 90 }, // down to right
      { id: 'c_y2', type: 'corner', gridPosition: { x: 4, y: 2 }, rotation: 180 }, // left to down
    ],
    targetMoves: 8,
    maxMoves: 18,
  },

  // Level 9: The Merger
  {
    id: 'level_9',
    number: 9,
    title: 'The Merger',
    tutorialText: 'Merger pipes combine two separate streams into one output!',
    grid: { width: 4, height: 4 },
    sources: [
      { id: 's_red1', position: { x: 0, y: 0 }, direction: 'down', color: 'red', amount: 5 },
      { id: 's_red2', position: { x: 2, y: 0 }, direction: 'down', color: 'red', amount: 5 },
    ],
    targets: [
      { id: 't_red', position: { x: 1, y: 3 }, acceptDirection: 'up', color: 'red', requiredAmount: 10, currentAmount: 0 },
    ],
    pipes: [
      { id: 'c1', type: 'corner', gridPosition: { x: 0, y: 1 }, rotation: 0 }, // down into right
      { id: 'c2', type: 'corner', gridPosition: { x: 2, y: 1 }, rotation: 270 }, // down into left
      // Merger at (1, 1): takes input from left & right, outputs to down at rot 0
      { id: 'mrg', type: 'merger', gridPosition: { x: 1, y: 1 }, rotation: 180 }, // scrambled
      { id: 's_out', type: 'straight', gridPosition: { x: 1, y: 2 }, rotation: 0, locked: true },
    ],
    targetMoves: 3,
    maxMoves: 12,
  },

  // Level 10: The Gate Valve
  {
    id: 'level_10',
    number: 10,
    title: 'The Gate Valve',
    tutorialText: 'Tap on a Gate to open or close the valve!',
    grid: { width: 4, height: 4 },
    sources: [
      { id: 's_green', position: { x: 1, y: 0 }, direction: 'down', color: 'green', amount: 10 },
    ],
    targets: [
      { id: 't_green', position: { x: 1, y: 3 }, acceptDirection: 'up', color: 'green', requiredAmount: 10, currentAmount: 0 },
    ],
    pipes: [
      { id: 's1', type: 'straight', gridPosition: { x: 1, y: 1 }, rotation: 0, locked: true },
      // Gate starts closed
      { id: 'g1', type: 'gate', gridPosition: { x: 1, y: 2 }, rotation: 0, isOpen: false },
    ],
    targetMoves: 1,
    maxMoves: 8,
  },

  // Level 11: One-Way Check Valve
  {
    id: 'level_11',
    number: 11,
    title: 'One-Way Valve',
    tutorialText: 'One-Way pipes only permit flow in the direction of the arrow!',
    grid: { width: 4, height: 5 },
    sources: [
      { id: 's_blue', position: { x: 1, y: 0 }, direction: 'down', color: 'blue', amount: 10 },
    ],
    targets: [
      { id: 't_blue', position: { x: 2, y: 4 }, acceptDirection: 'up', color: 'blue', requiredAmount: 10, currentAmount: 0 },
    ],
    pipes: [
      { id: 'ow1', type: 'one_way', gridPosition: { x: 1, y: 1 }, rotation: 180 }, // pointing wrong way, needs 2 rotations
      { id: 'c1', type: 'corner', gridPosition: { x: 1, y: 2 }, rotation: 90 },
      { id: 'c2', type: 'corner', gridPosition: { x: 2, y: 2 }, rotation: 180 },
      { id: 's2', type: 'straight', gridPosition: { x: 2, y: 3 }, rotation: 0, locked: true },
    ],
    targetMoves: 5,
    maxMoves: 14,
  },

  // Level 12: Color Changer Prism
  {
    id: 'level_12',
    number: 12,
    title: 'Prism Alchemy',
    tutorialText: 'Color Changers transform liquid into new vibrant shades!',
    grid: { width: 4, height: 5 },
    sources: [
      { id: 's_blue', position: { x: 1, y: 0 }, direction: 'down', color: 'blue', amount: 10 },
    ],
    targets: [
      { id: 't_purple', position: { x: 1, y: 4 }, acceptDirection: 'up', color: 'purple', requiredAmount: 10, currentAmount: 0 },
    ],
    pipes: [
      { id: 's1', type: 'straight', gridPosition: { x: 1, y: 1 }, rotation: 0, locked: true },
      { id: 'cc', type: 'color_changer', gridPosition: { x: 1, y: 2 }, rotation: 90, targetColor: 'purple' }, // scrambled rot
      { id: 's2', type: 'straight', gridPosition: { x: 1, y: 3 }, rotation: 0, locked: true },
    ],
    targetMoves: 3,
    maxMoves: 11,
  },

  // Level 13: Splitter with Color Chamber
  {
    id: 'level_13',
    number: 13,
    title: 'Dual Spectrum',
    grid: { width: 5, height: 5 },
    sources: [
      { id: 's_blue', position: { x: 2, y: 0 }, direction: 'down', color: 'blue', amount: 10 },
    ],
    targets: [
      { id: 't_blue', position: { x: 1, y: 4 }, acceptDirection: 'up', color: 'blue', requiredAmount: 5, currentAmount: 0 },
      { id: 't_purple', position: { x: 3, y: 4 }, acceptDirection: 'up', color: 'purple', requiredAmount: 5, currentAmount: 0 },
    ],
    pipes: [
      { id: 's_top', type: 'straight', gridPosition: { x: 2, y: 1 }, rotation: 0 },
      { id: 'spl', type: 'splitter', gridPosition: { x: 2, y: 2 }, rotation: 0 },
      // Left branch: stay blue
      { id: 'c_l', type: 'corner', gridPosition: { x: 1, y: 2 }, rotation: 180 },
      { id: 's_l', type: 'straight', gridPosition: { x: 1, y: 3 }, rotation: 0 },
      // Right branch: through purple color changer
      { id: 'c_r', type: 'corner', gridPosition: { x: 3, y: 2 }, rotation: 90 },
      { id: 'cc', type: 'color_changer', gridPosition: { x: 3, y: 3 }, rotation: 90, targetColor: 'purple' },
    ],
    targetMoves: 7,
    maxMoves: 16,
  },

  // Level 14: Four Corner Switch
  {
    id: 'level_14',
    number: 14,
    title: 'The Cloverleaf',
    tutorialText: 'Guide each color around its own set of bright bends!',
    grid: { width: 5, height: 5 },
    sources: [
      { id: 's_red', position: { x: 1, y: 0 }, direction: 'down', color: 'red', amount: 10 },
      { id: 's_yellow', position: { x: 3, y: 0 }, direction: 'down', color: 'yellow', amount: 10 },
    ],
    targets: [
      { id: 't_red', position: { x: 2, y: 4 }, acceptDirection: 'up', color: 'red', requiredAmount: 10, currentAmount: 0 },
      { id: 't_yellow', position: { x: 4, y: 4 }, acceptDirection: 'up', color: 'yellow', requiredAmount: 10, currentAmount: 0 },
    ],
    pipes: [
      { id: 'c1', type: 'cross', gridPosition: { x: 1, y: 1 }, rotation: 0 },
      { id: 'c2', type: 'corner', gridPosition: { x: 1, y: 2 }, rotation: 270 },
      { id: 'c3', type: 'corner', gridPosition: { x: 2, y: 2 }, rotation: 90 },
      { id: 'c4', type: 'straight', gridPosition: { x: 2, y: 3 }, rotation: 0, locked: true },
      { id: 'c5', type: 'straight', gridPosition: { x: 3, y: 1 }, rotation: 0, locked: true },
      { id: 'c6', type: 'corner', gridPosition: { x: 3, y: 2 }, rotation: 270 },
      { id: 'c7', type: 'corner', gridPosition: { x: 4, y: 2 }, rotation: 90 },
      { id: 'c8', type: 'straight', gridPosition: { x: 4, y: 3 }, rotation: 0, locked: true },
    ],
    targetMoves: 4,
    maxMoves: 12,
  },

  // Level 15: Dual Gate Filter
  {
    id: 'level_15',
    number: 15,
    title: 'Valve Sluice',
    grid: { width: 5, height: 5 },
    sources: [
      { id: 's_orange', position: { x: 2, y: 0 }, direction: 'down', color: 'orange', amount: 10 },
    ],
    targets: [
      { id: 't_orange', position: { x: 2, y: 4 }, acceptDirection: 'up', color: 'orange', requiredAmount: 10, currentAmount: 0 },
    ],
    pipes: [
      { id: 's1', type: 'straight', gridPosition: { x: 2, y: 1 }, rotation: 90 },
      { id: 'g1', type: 'gate', gridPosition: { x: 2, y: 2 }, rotation: 0, isOpen: false },
      { id: 's2', type: 'straight', gridPosition: { x: 2, y: 3 }, rotation: 90 },
    ],
    targetMoves: 3,
    maxMoves: 12,
  },

  // Levels 16 to 30: hand-authored route layouts with a rising modifier mix.
  ...generateExtendedLevels(),
];

function generateExtendedLevels(): LevelConfig[] {
  type Modifier = {
    type: 'gate' | 'one_way' | 'color_changer';
    y: number;
    targetColor?: FlowColor;
  };
  type Lane = {
    color: FlowColor;
    targetColor?: FlowColor;
    bend?: boolean;
    modifiers?: Modifier[];
  };
  type Blueprint = {
    title: string;
    height: number;
    lanes: Lane[];
    scrambleCount: number;
  };

  const blueprints: Blueprint[] = [
    { title: 'Prism Path', height: 5, lanes: [{ color: 'blue', targetColor: 'purple', modifiers: [{ type: 'color_changer', y: 2, targetColor: 'purple' }] }], scrambleCount: 0 },
    { title: 'Valve Duo', height: 5, lanes: [{ color: 'red', modifiers: [{ type: 'gate', y: 2 }] }, { color: 'blue', modifiers: [{ type: 'one_way', y: 2 }] }], scrambleCount: 0 },
    { title: 'Twin Bends', height: 6, lanes: [{ color: 'yellow', targetColor: 'green', bend: true, modifiers: [{ type: 'color_changer', y: 4, targetColor: 'green' }] }, { color: 'purple', bend: true, modifiers: [{ type: 'gate', y: 4 }] }], scrambleCount: 1 },
    { title: 'Triple Valve', height: 6, lanes: [{ color: 'red', bend: true, modifiers: [{ type: 'one_way', y: 4 }] }, { color: 'blue', modifiers: [{ type: 'gate', y: 2 }] }, { color: 'yellow', targetColor: 'orange', bend: true, modifiers: [{ type: 'color_changer', y: 4, targetColor: 'orange' }] }], scrambleCount: 1 },
    { title: 'Corner Circuit', height: 6, lanes: [{ color: 'green', bend: true }, { color: 'orange', bend: true }], scrambleCount: 2 },
    { title: 'Crossed Currents', height: 6, lanes: [{ color: 'red', bend: true, modifiers: [{ type: 'gate', y: 4 }] }, { color: 'blue' }, { color: 'yellow', bend: true, modifiers: [{ type: 'one_way', y: 4 }] }], scrambleCount: 2 },
    { title: 'Prism Switchback', height: 6, lanes: [{ color: 'blue', targetColor: 'orange', bend: true, modifiers: [{ type: 'color_changer', y: 4, targetColor: 'orange' }] }, { color: 'green', bend: true, modifiers: [{ type: 'gate', y: 4 }] }], scrambleCount: 2 },
    { title: 'One-Way Pair', height: 6, lanes: [{ color: 'purple', bend: true, modifiers: [{ type: 'one_way', y: 4 }] }, { color: 'yellow', bend: true, modifiers: [{ type: 'one_way', y: 4 }] }], scrambleCount: 2 },
    { title: 'Spectrum Gates', height: 6, lanes: [{ color: 'red', bend: true, modifiers: [{ type: 'gate', y: 4 }] }, { color: 'blue', modifiers: [{ type: 'one_way', y: 3 }] }, { color: 'green', targetColor: 'yellow', bend: true, modifiers: [{ type: 'color_changer', y: 4, targetColor: 'yellow' }] }], scrambleCount: 2 },
    { title: 'Three-Way Prism', height: 7, lanes: [{ color: 'blue', targetColor: 'purple', bend: true, modifiers: [{ type: 'color_changer', y: 5, targetColor: 'purple' }] }, { color: 'red', modifiers: [{ type: 'gate', y: 3 }] }, { color: 'yellow', bend: true, modifiers: [{ type: 'one_way', y: 5 }] }], scrambleCount: 3 },
    { title: 'Double Detour', height: 7, lanes: [{ color: 'orange', bend: true, modifiers: [{ type: 'gate', y: 5 }] }, { color: 'green', bend: true, modifiers: [{ type: 'one_way', y: 5 }] }], scrambleCount: 3 },
    { title: 'Prism Valves', height: 7, lanes: [{ color: 'red', targetColor: 'orange', bend: true, modifiers: [{ type: 'color_changer', y: 5, targetColor: 'orange' }] }, { color: 'blue', targetColor: 'purple', bend: true, modifiers: [{ type: 'color_changer', y: 5, targetColor: 'purple' }] }, { color: 'yellow', modifiers: [{ type: 'gate', y: 3 }] }], scrambleCount: 3 },
    { title: 'One-Way Maze', height: 7, lanes: [{ color: 'blue', bend: true, modifiers: [{ type: 'one_way', y: 5 }] }, { color: 'purple', modifiers: [{ type: 'gate', y: 3 }] }, { color: 'orange', bend: true, modifiers: [{ type: 'one_way', y: 5 }] }], scrambleCount: 4 },
    { title: 'Triple Switchback', height: 7, lanes: [{ color: 'green', bend: true, modifiers: [{ type: 'gate', y: 5 }] }, { color: 'red', targetColor: 'orange', bend: true, modifiers: [{ type: 'color_changer', y: 3, targetColor: 'orange' }] }, { color: 'blue', bend: true, modifiers: [{ type: 'one_way', y: 5 }] }], scrambleCount: 4 },
    { title: 'Master Flow', height: 7, lanes: [{ color: 'red', targetColor: 'orange', bend: true, modifiers: [{ type: 'color_changer', y: 5, targetColor: 'orange' }, { type: 'gate', y: 1 }] }, { color: 'blue', targetColor: 'purple', bend: true, modifiers: [{ type: 'color_changer', y: 5, targetColor: 'purple' }, { type: 'one_way', y: 1 }] }, { color: 'yellow', bend: true, modifiers: [{ type: 'gate', y: 5 }] }], scrambleCount: 5 },
  ];

  const levels = blueprints.map((blueprint, index): LevelConfig => {
    const number = 16 + index;
    const height = blueprint.height;
    const width = 7;
    const laneStarts = blueprint.lanes.length === 1
      ? [3]
      : blueprint.lanes.length === 2
        ? [1, 5]
        : [1, 3, 5];
    const occupied = new Map<string, LevelConfig['pipes'][number]>();
    const routePieces: LevelConfig['pipes'] = [];
    const sources: LevelConfig['sources'] = [];
    const targets: LevelConfig['targets'] = [];
    let solutionMoves = 0;
    let pieceIndex = 0;

    blueprint.lanes.forEach((lane, laneIndex) => {
      const startX = laneStarts[laneIndex];
      const bendY = Math.floor(height / 2);
      const shift = laneIndex === 0 ? 1 : -1;
      const hasBend = lane.bend && !(blueprint.lanes.length === 3 && laneIndex === 1);
      const endX = hasBend ? startX + shift : startX;
      const path: GridPosition[] = [];

      for (let y = 1; y <= height - 2; y += 1) {
        if (hasBend && y > bendY) {
          path.push({ x: endX, y });
        } else {
          path.push({ x: startX, y });
        }
        if (hasBend && y === bendY) {
          path.push({ x: endX, y });
        }
      }

      sources.push({
        id: `s_${number}_${laneIndex}`,
        position: { x: startX, y: 0 },
        direction: 'down',
        color: lane.color,
        amount: 10,
      });
      targets.push({
        id: `t_${number}_${laneIndex}`,
        position: { x: endX, y: height - 1 },
        acceptDirection: 'up',
        color: lane.targetColor ?? lane.color,
        requiredAmount: 10,
        currentAmount: 0,
      });

      for (let pathIndex = 0; pathIndex < path.length; pathIndex += 1) {
        const position = path[pathIndex];
        const previous = pathIndex === 0 ? sources[laneIndex].position : path[pathIndex - 1];
        const next = pathIndex === path.length - 1 ? targets[laneIndex].position : path[pathIndex + 1];
        const entering = directionBetween(position, previous);
        const exiting = directionBetween(position, next);
        const isStraight = getOppositeDirection(entering) === exiting;
        const special = lane.modifiers?.find((modifier) => modifier.y === position.y);
        const type: PipeType = special?.type ?? (isStraight ? 'straight' : 'corner');
        const solutionRotation = type === 'straight' || type === 'gate' || type === 'color_changer' || type === 'one_way'
          ? rotationForPorts(type === 'one_way' ? 'straight' : type, entering, exiting)
          : rotationForPorts(type, entering, exiting);
        let rotation = solutionRotation;
        let isOpen = true;

        if (special?.type === 'gate') {
          isOpen = false;
          solutionMoves += 1;
        } else if (special?.type === 'one_way') {
          rotation = (solutionRotation + 180) % 360;
          solutionMoves += 2;
        } else if (special?.type === 'color_changer') {
          rotation = (solutionRotation + 270) % 360;
          solutionMoves += 1;
        }

        const pipe = {
          id: `p_${number}_${pieceIndex++}`,
          type,
          gridPosition: position,
          rotation,
          ...(special?.type === 'gate' ? { isOpen } : {}),
          ...(special?.type === 'color_changer' ? { targetColor: special.targetColor } : {}),
        };
        occupied.set(`${position.x},${position.y}`, pipe);
        routePieces.push(pipe);
      }
    });

    const candidates = routePieces.filter((pipe) =>
      pipe.type === 'straight' && !blueprint.lanes.some((lane, laneIndex) =>
        lane.modifiers?.some((modifier) => modifier.y === pipe.gridPosition.y && laneStarts[laneIndex] === pipe.gridPosition.x)
      )
    );
    const crossPiece = candidates[0];
    if (crossPiece) crossPiece.type = 'cross';

    let remainingScramble = blueprint.scrambleCount;
    for (const pipe of routePieces) {
      if (remainingScramble === 0 || pipe.type === 'gate' || pipe.type === 'one_way' || pipe.type === 'color_changer' || pipe.type === 'cross') continue;
      pipe.rotation = (pipe.rotation + 270) % 360;
      solutionMoves += 1;
      remainingScramble -= 1;
    }

    return {
      id: `level_${number}`,
      number,
      title: blueprint.title,
      tutorialText: `Connect each color through the ${blueprint.lanes.some((lane) => lane.modifiers?.length) ? 'special pipes' : 'curving pipe route'}!`,
      hintPipePosition: routePieces[0]?.gridPosition,
      grid: { width, height },
      sources,
      targets,
      pipes: [...occupied.values()],
      targetMoves: Math.max(1, solutionMoves),
      maxMoves: Math.max(12, solutionMoves + 8),
    };
  });

  return levels;
}

function directionBetween(from: GridPosition, to: GridPosition): Direction {
  if (to.x > from.x) return 'right';
  if (to.x < from.x) return 'left';
  if (to.y > from.y) return 'down';
  return 'up';
}

function rotationForPorts(type: PipeType, entering: Direction, exiting: Direction): number {
  for (const rotation of [0, 90, 180, 270]) {
    const ports = getBaseConnections(type).map((port) => rotateDirection(port, rotation));
    if (ports.includes(entering) && ports.includes(exiting)) return rotation;
  }
  return 0;
}
