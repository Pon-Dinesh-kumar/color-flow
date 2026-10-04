import { LevelConfig } from '../../gameplay/Level';

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
    targetMoves: 3,
    maxMoves: 12,
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
      { id: 't_blue', position: { x: 0, y: 4 }, acceptDirection: 'up', color: 'blue', requiredAmount: 10, currentAmount: 0 },
      { id: 't_red', position: { x: 2, y: 4 }, acceptDirection: 'up', color: 'red', requiredAmount: 10, currentAmount: 0 },
    ],
    pipes: [
      { id: 'p1', type: 'corner', gridPosition: { x: 0, y: 1 }, rotation: 0 }, // up to right
      { id: 'p2', type: 'corner', gridPosition: { x: 2, y: 1 }, rotation: 270 }, // up to left (rot 270 is left & up)
      { id: 'cross', type: 'cross', gridPosition: { x: 1, y: 2 }, rotation: 0, locked: true },
      { id: 'p3', type: 'straight', gridPosition: { x: 0, y: 2 }, rotation: 90 },
      { id: 'p4', type: 'straight', gridPosition: { x: 2, y: 2 }, rotation: 90 },
      { id: 'p5', type: 'corner', gridPosition: { x: 0, y: 3 }, rotation: 90 }, // left/up to down
      { id: 'p6', type: 'corner', gridPosition: { x: 2, y: 3 }, rotation: 180 }, // right/up to down
    ],
    targetMoves: 4,
    maxMoves: 15,
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
    targetMoves: 4,
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
    targetMoves: 4,
    maxMoves: 16,
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
    targetMoves: 3,
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
    targetMoves: 1,
    maxMoves: 8,
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
    targetMoves: 4,
    maxMoves: 16,
  },

  // Level 14: Four Corner Switch
  {
    id: 'level_14',
    number: 14,
    title: 'The Cloverleaf',
    grid: { width: 5, height: 5 },
    sources: [
      { id: 's_red', position: { x: 1, y: 0 }, direction: 'down', color: 'red', amount: 10 },
      { id: 's_yellow', position: { x: 3, y: 0 }, direction: 'down', color: 'yellow', amount: 10 },
    ],
    targets: [
      { id: 't_yellow', position: { x: 1, y: 4 }, acceptDirection: 'up', color: 'yellow', requiredAmount: 10, currentAmount: 0 },
      { id: 't_red', position: { x: 3, y: 4 }, acceptDirection: 'up', color: 'red', requiredAmount: 10, currentAmount: 0 },
    ],
    pipes: [
      { id: 'c1', type: 'corner', gridPosition: { x: 1, y: 1 }, rotation: 0 },
      { id: 'c2', type: 'corner', gridPosition: { x: 3, y: 1 }, rotation: 270 },
      { id: 'cross', type: 'cross', gridPosition: { x: 2, y: 2 }, rotation: 0 },
      { id: 'c3', type: 'corner', gridPosition: { x: 1, y: 2 }, rotation: 180 },
      { id: 'c4', type: 'corner', gridPosition: { x: 3, y: 2 }, rotation: 90 },
      { id: 'c5', type: 'corner', gridPosition: { x: 1, y: 3 }, rotation: 90 },
      { id: 'c6', type: 'corner', gridPosition: { x: 3, y: 3 }, rotation: 180 },
    ],
    targetMoves: 5,
    maxMoves: 18,
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

  // Levels 16 to 30: Progressively Rich Puzzles
  ...generateExtendedLevels(),
];

function generateExtendedLevels(): LevelConfig[] {
  const levels: LevelConfig[] = [];

  const themes: Array<{
    title: string;
    colors: Array<'red' | 'blue' | 'yellow' | 'green' | 'purple' | 'orange'>;
    grid: { width: number; height: number };
    special: 'splitter' | 'merger' | 'gate' | 'one_way' | 'color_changer' | 'mixed';
  }> = [
    { title: 'Emerald Cascade', colors: ['green', 'yellow'], grid: { width: 5, height: 5 }, special: 'color_changer' },
    { title: 'Hydraulic Web', colors: ['red', 'blue'], grid: { width: 5, height: 5 }, special: 'splitter' },
    { title: 'The Bifurcation', colors: ['yellow', 'purple'], grid: { width: 6, height: 5 }, special: 'merger' },
    { title: 'Spectrum Highway', colors: ['red', 'blue', 'yellow'], grid: { width: 6, height: 6 }, special: 'mixed' },
    { title: 'Valve Chamber', colors: ['green', 'orange'], grid: { width: 5, height: 5 }, special: 'gate' },
    { title: 'One-Way Canyon', colors: ['blue', 'red'], grid: { width: 6, height: 6 }, special: 'one_way' },
    { title: 'Prism Refinery', colors: ['yellow', 'green', 'blue'], grid: { width: 6, height: 6 }, special: 'color_changer' },
    { title: 'Double Bypass', colors: ['orange', 'purple'], grid: { width: 6, height: 6 }, special: 'splitter' },
    { title: 'Grand Junction', colors: ['red', 'blue', 'green'], grid: { width: 6, height: 6 }, special: 'mixed' },
    { title: 'The Labyrinth', colors: ['yellow', 'orange', 'purple'], grid: { width: 6, height: 6 }, special: 'mixed' },
    { title: 'Quantum Pipe', colors: ['red', 'green', 'blue'], grid: { width: 7, height: 6 }, special: 'color_changer' },
    { title: 'Hexa Flow', colors: ['blue', 'yellow', 'red', 'green'], grid: { width: 7, height: 6 }, special: 'mixed' },
    { title: 'Pressure Control', colors: ['purple', 'orange', 'yellow'], grid: { width: 6, height: 6 }, special: 'gate' },
    { title: 'Master Refinery', colors: ['red', 'blue', 'green', 'yellow'], grid: { width: 7, height: 7 }, special: 'mixed' },
    { title: 'Color Flow Apex', colors: ['red', 'blue', 'yellow', 'green', 'purple'], grid: { width: 7, height: 7 }, special: 'mixed' },
  ];

  themes.forEach((item, index) => {
    const levelNumber = 16 + index;
    const { width, height } = item.grid;
    const cCount = item.colors.length;

    // Pick positions along top for sources and bottom for targets
    const sources = item.colors.map((c, i) => {
      const col = Math.min(width - 1, 1 + i * Math.floor((width - 2) / Math.max(1, cCount - 1)));
      return {
        id: `s_${c}_${levelNumber}`,
        position: { x: col, y: 0 },
        direction: 'down' as const,
        color: c,
        amount: 10,
      };
    });

    const targets = item.colors.map((c, i) => {
      const col = Math.min(width - 1, 1 + i * Math.floor((width - 2) / Math.max(1, cCount - 1)));
      return {
        id: `t_${c}_${levelNumber}`,
        position: { x: col, y: height - 1 },
        acceptDirection: 'up' as const,
        color: c,
        requiredAmount: 10,
        currentAmount: 0,
      };
    });

    // Populate interior with a puzzle grid of straight, corners, cross, and special piece
    const pipes: any[] = [];
    let pipeId = 1;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 0; x < width; x++) {
        // Place pipe if along stream columns or connecting paths
        const isStreamCol = sources.some((s) => s.position.x === x);
        const isHorizontalConnector = y === Math.floor(height / 2);

        if (isStreamCol || isHorizontalConnector || (x > 0 && x < width - 1)) {
          let type: any = 'straight';
          let rot = 0;

          if (isStreamCol && !isHorizontalConnector) {
            type = 'straight';
            rot = (pipeId % 2 === 0) ? 90 : 0; // scramble some rotations
          } else if (isHorizontalConnector && isStreamCol) {
            type = 'cross';
            rot = 0;
          } else if (isHorizontalConnector) {
            type = 'straight';
            rot = 90;
          } else {
            type = 'corner';
            rot = (pipeId * 90) % 360;
          }

          // Special piece placement in the center
          if (x === Math.floor(width / 2) && y === Math.floor(height / 2)) {
            if (item.special === 'splitter') {
              type = 'splitter';
              rot = 0;
            } else if (item.special === 'gate') {
              type = 'gate';
              rot = 0;
            } else if (item.special === 'one_way') {
              type = 'one_way';
              rot = 0;
            } else if (item.special === 'color_changer') {
              type = 'color_changer';
              rot = 0;
            }
          }

          pipes.push({
            id: `p_${levelNumber}_${pipeId++}`,
            type,
            gridPosition: { x, y },
            rotation: rot,
          });
        }
      }
    }

    levels.push({
      id: `level_${levelNumber}`,
      number: levelNumber,
      title: item.title,
      grid: { width, height },
      sources,
      targets,
      pipes,
      targetMoves: Math.max(4, 6 + Math.floor(index * 0.8)),
      maxMoves: Math.max(12, 14 + index),
    });
  });

  return levels;
}
