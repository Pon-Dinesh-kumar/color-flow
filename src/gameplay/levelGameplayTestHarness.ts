import { FlowColor, getTransformedColor } from '../puzzle/ColorSystem';
import { FlowResult } from '../puzzle/FlowPath';
import { Direction, getNeighborPosition, getOppositeDirection, posKey } from '../puzzle/Grid';
import { FlowSimulator, LevelSimulationState } from '../puzzle/FlowSimulator';
import { canAcceptFlowFrom, getOutgoingPorts, PipeNode } from '../puzzle/Pipe';
import { LevelConfig } from './Level';
import { useGameStore } from '../game/gameState';

interface PipeGoal {
  rotation: number;
  isOpen?: boolean;
}

export interface CompletionRoute {
  goals: Map<string, PipeGoal>;
  moves: number;
  result: FlowResult;
}

function canSupplyTargets(level: LevelConfig, result: FlowResult): boolean {
  const sourceIds = level.sources.map((source) => source.id);
  const targets = level.targets;
  const sourceCount = sourceIds.length;
  const targetCount = targets.length;
  const sink = sourceCount + targetCount + 1;
  const capacities = Array.from({ length: sink + 1 }, () => Array<number>(sink + 1).fill(0));

  level.sources.forEach((source, sourceIndex) => {
    capacities[0][sourceIndex + 1] = source.amount;
  });
  targets.forEach((target, targetIndex) => {
    const targetNode = sourceCount + targetIndex + 1;
    capacities[targetNode][sink] = target.requiredAmount;
    level.sources.forEach((source, sourceIndex) => {
      const hasRoute = result.paths.some(
        (path) =>
          path.sourceId === source.id &&
          path.targetId === target.id &&
          path.reachesTarget &&
          path.color === target.color,
      );
      if (hasRoute) capacities[sourceIndex + 1][targetNode] = target.requiredAmount;
    });
  });

  let delivered = 0;
  while (true) {
    const parent = Array<number>(sink + 1).fill(-1);
    parent[0] = 0;
    const queue = [0];
    for (let cursor = 0; cursor < queue.length && parent[sink] === -1; cursor += 1) {
      const from = queue[cursor];
      for (let to = 0; to <= sink; to += 1) {
        if (parent[to] === -1 && capacities[from][to] > 0) {
          parent[to] = from;
          queue.push(to);
          if (to === sink) break;
        }
      }
    }
    if (parent[sink] === -1) break;

    let amount = Number.POSITIVE_INFINITY;
    for (let node = sink; node !== 0; node = parent[node]) {
      amount = Math.min(amount, capacities[parent[node]][node]);
    }
    for (let node = sink; node !== 0; node = parent[node]) {
      capacities[parent[node]][node] -= amount;
      capacities[node][parent[node]] += amount;
    }
    delivered += amount;
  }

  return delivered === targets.reduce((sum, target) => sum + target.requiredAmount, 0);
}

const MAX_PATHS_PER_TARGET = 1200;
const MAX_ROUTE_SEARCH_NODES = 50000;

function clockwiseTurns(from: number, to: number): number {
  return ((to - from + 360) % 360) / 90;
}

function simulationFor(level: LevelConfig, pipes: Record<string, PipeNode>): FlowResult {
  const byPosition = new Map<string, PipeNode>();
  for (const pipe of Object.values(pipes)) byPosition.set(posKey(pipe.gridPosition), pipe);

  const simulation: LevelSimulationState = {
    width: level.grid.width,
    height: level.grid.height,
    pipes: byPosition,
    sources: level.sources,
    targets: level.targets,
  };
  return FlowSimulator.simulate(simulation);
}

function pathConfigKey(goals: Map<string, PipeGoal>): string {
  return [...goals]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, goal]) => `${id}:${goal.rotation}:${goal.isOpen ?? ''}`)
    .join('|');
}

function routesForTarget(level: LevelConfig, targetId: string): Map<string, PipeGoal>[] {
  const target = level.targets.find((candidate) => candidate.id === targetId)!;
  const targetAt = posKey(target.position);
  const pipesAt = new Map(level.pipes.map((pipe) => [posKey(pipe.gridPosition), pipe]));
  const routes: Map<string, PipeGoal>[] = [];
  const seenRoutes = new Set<string>();
  const maxLength = level.grid.width * level.grid.height;

  const addRoute = (goals: Map<string, PipeGoal>) => {
    const key = pathConfigKey(goals);
    if (!seenRoutes.has(key)) {
      seenRoutes.add(key);
      routes.push(goals);
    }
  };

  for (const source of level.sources) {
    const firstPosition = getNeighborPosition(source.position, source.direction);
    const firstKey = posKey(firstPosition);
    if (firstKey === targetAt) {
      if (getOppositeDirection(source.direction) === target.acceptDirection && source.color === target.color) {
        addRoute(new Map());
      }
      continue;
    }

    const visit = (
      position: { x: number; y: number },
      enteringPort: Direction,
      color: FlowColor,
      goals: Map<string, PipeGoal>,
      visited: Set<string>,
    ) => {
      if (routes.length >= MAX_PATHS_PER_TARGET) return;
      const key = posKey(position);
      const pipe = pipesAt.get(key);
      if (!pipe || visited.has(key)) return;

      const previouslyRequired = goals.get(pipe.id);
      const rotations = previouslyRequired
        ? [previouslyRequired.rotation]
        : pipe.locked
          ? [pipe.rotation]
          : [0, 90, 180, 270].sort(
              (a, b) => clockwiseTurns(pipe.rotation, a) - clockwiseTurns(pipe.rotation, b),
            );

      for (const rotation of rotations) {
        const isOpen = pipe.type === 'gate' ? true : pipe.isOpen;
        const candidate: PipeNode = { ...pipe, rotation, isOpen };
        if (!canAcceptFlowFrom(candidate, enteringPort)) continue;

        const nextGoals = new Map(goals);
        nextGoals.set(pipe.id, { rotation, ...(pipe.type === 'gate' ? { isOpen: true } : {}) });
        const outgoingColor =
          pipe.type === 'color_changer' ? getTransformedColor(color, pipe.targetColor!) : color;
        const exits = getOutgoingPorts(candidate, enteringPort).sort((a, b) => {
          const aPosition = getNeighborPosition(position, a);
          const bPosition = getNeighborPosition(position, b);
          const aDistance = Math.abs(aPosition.x - target.position.x) + Math.abs(aPosition.y - target.position.y);
          const bDistance = Math.abs(bPosition.x - target.position.x) + Math.abs(bPosition.y - target.position.y);
          return aDistance - bDistance;
        });

        for (const exit of exits) {
          const nextPosition = getNeighborPosition(position, exit);
          const nextKey = posKey(nextPosition);
          if (nextKey === targetAt) {
            if (getOppositeDirection(exit) === target.acceptDirection && outgoingColor === target.color) {
              addRoute(nextGoals);
            }
            continue;
          }

          const nextPipe = pipesAt.get(nextKey);
          if (!nextPipe || visited.has(nextKey)) continue;
          const nextVisited = new Set(visited);
          nextVisited.add(key);
          visit(nextPosition, getOppositeDirection(exit), outgoingColor, nextGoals, nextVisited);
        }
      }
    };

    if (maxLength > 0) {
      visit(firstPosition, getOppositeDirection(source.direction), source.color, new Map(), new Set());
    }
  }

  return routes;
}

function applyGoals(level: LevelConfig, goals: Map<string, PipeGoal>): Record<string, PipeNode> {
  const pipes: Record<string, PipeNode> = {};
  for (const pipe of level.pipes) {
    const goal = goals.get(pipe.id);
    pipes[pipe.id] = goal ? { ...pipe, ...goal } : { ...pipe };
  }
  return pipes;
}

function moveCost(level: LevelConfig, goals: Map<string, PipeGoal>): number {
  let cost = 0;
  for (const [pipeId, goal] of goals) {
    const pipe = level.pipes.find((candidate) => candidate.id === pipeId)!;
    if (pipe.locked && goal.rotation !== pipe.rotation) return Number.POSITIVE_INFINITY;
    cost += clockwiseTurns(pipe.rotation, goal.rotation);
    if (pipe.type === 'gate' && goal.isOpen === true && pipe.isOpen === false) cost += 1;
  }
  return cost;
}

export function findCompletionRoute(level: LevelConfig): CompletionRoute | null {
  const targetOptions = level.targets.map((target) => ({
    id: target.id,
    routes: routesForTarget(level, target.id).sort((a, b) => moveCost(level, a) - moveCost(level, b)),
  }));
  if (targetOptions.some(({ routes }) => routes.length === 0)) return null;

  targetOptions.sort((a, b) => a.routes.length - b.routes.length);
  let best: CompletionRoute | null = null;
  let explored = 0;

  const search = (index: number, goals: Map<string, PipeGoal>) => {
    if (explored++ >= MAX_ROUTE_SEARCH_NODES) return;
    const cost = moveCost(level, goals);
    if (cost > (level.maxMoves ?? 12) || (best && cost >= best.moves)) return;

    if (index === targetOptions.length) {
      const completedPipes = applyGoals(level, goals);
      const result = simulationFor(level, completedPipes);
      if (
        level.targets.every((target) => result.connectedTargetIds.includes(target.id)) &&
        canSupplyTargets(level, result)
      ) {
        const requiredGoals = new Map(goals);
        for (const path of result.paths) {
          if (!path.reachesTarget || !path.targetId) continue;
          for (const waypoint of path.waypoints) {
            if (!waypoint.pipeId) continue;
            const pipe = completedPipes[waypoint.pipeId];
            requiredGoals.set(pipe.id, {
              rotation: pipe.rotation,
              ...(pipe.type === 'gate' ? { isOpen: pipe.isOpen ?? true } : {}),
            });
          }
        }
        const finalCost = moveCost(level, requiredGoals);
        if (finalCost <= (level.maxMoves ?? 12) && (!best || finalCost < best.moves)) {
          best = { goals: requiredGoals, moves: finalCost, result };
        }
      }
      return;
    }

    for (const route of targetOptions[index].routes) {
      let compatible = true;
      const combined = new Map(goals);
      for (const [pipeId, goal] of route) {
        const existing = combined.get(pipeId);
        if (
          existing &&
          (existing.rotation !== goal.rotation ||
            (existing.isOpen !== undefined && goal.isOpen !== undefined && existing.isOpen !== goal.isOpen))
        ) {
          compatible = false;
          break;
        }
        combined.set(pipeId, goal);
      }
      if (compatible) search(index + 1, combined);
    }
  };

  search(0, new Map());
  return best;
}

export function movesForStars(level: LevelConfig, route: CompletionRoute, stars: 1 | 2 | 3): number | null {
  const targetMoves = level.targetMoves ?? 6;
  const maxMoves = level.maxMoves ?? Number.POSITIVE_INFINITY;
  const [minimum, maximum] =
    stars === 3
      ? [route.moves, targetMoves]
      : stars === 2
        ? [targetMoves + 1, Math.min(targetMoves + 4, maxMoves)]
        : [targetMoves + 5, maxMoves];
  if (minimum > maximum || (stars === 3 && route.moves > targetMoves)) return null;

  const hasFreeRotatablePipe = level.pipes.some(
    (pipe) => !pipe.locked && pipe.type !== 'gate' && !route.goals.has(pipe.id),
  );
  const hasRoutePipe = [...route.goals.keys()].some((id) => {
    const pipe = level.pipes.find((candidate) => candidate.id === id)!;
    return !pipe.locked && pipe.type !== 'gate';
  });
  const hasRouteGate = [...route.goals.keys()].some(
    (id) => level.pipes.find((candidate) => candidate.id === id)?.type === 'gate',
  );

  for (let moves = minimum; moves <= maximum; moves += 1) {
    const padding = moves - route.moves;
    if (padding < 0) continue;
    if (
      hasFreeRotatablePipe ||
      padding === 0 ||
      (hasRoutePipe && padding % 4 === 0) ||
      (!hasRoutePipe && hasRouteGate && padding % 2 === 0)
    ) {
      return moves;
    }
  }
  return null;
}

function allTargetsConnected(level: LevelConfig, result: FlowResult): boolean {
  return (
    level.targets.every((target) => result.connectedTargetIds.includes(target.id)) &&
    canSupplyTargets(level, result)
  );
}

export function playCompletionRoute(level: LevelConfig, route: CompletionRoute, targetMoves: number): FlowResult {
  useGameStore.getState().loadLevel(level.number);

  for (const pipe of level.pipes) {
    const goal = route.goals.get(pipe.id);
    if (!goal) continue;
    if (pipe.type === 'gate' && goal.isOpen === true && !useGameStore.getState().pipes[pipe.id].isOpen) {
      useGameStore.getState().toggleGate(pipe.id);
    }
    const current = useGameStore.getState().pipes[pipe.id];
    const turns = clockwiseTurns(current.rotation, goal.rotation);
    for (let turn = 0; turn < turns; turn += 1) useGameStore.getState().rotatePipe(pipe.id);
  }

  const initialRoute = simulationFor(level, useGameStore.getState().pipes);
  if (!allTargetsConnected(level, initialRoute)) {
    throw new Error(`Level ${level.number}: route actions did not establish all FlowSimulator connections`);
  }

  const padding = targetMoves - useGameStore.getState().movesUsed;
  if (padding < 0) {
    throw new Error(`Level ${level.number}: route needs more than the requested ${targetMoves} moves`);
  }
  if (padding > 0) {
    const state = useGameStore.getState();
    const freePipe = level.pipes.find(
      (pipe) => !pipe.locked && pipe.type !== 'gate' && !route.goals.has(pipe.id),
    );
    const routePipe = [...route.goals.keys()]
      .map((id) => level.pipes.find((pipe) => pipe.id === id)!)
      .find((pipe) => !pipe.locked && pipe.type !== 'gate');
    const routeGate = [...route.goals.keys()]
      .map((id) => level.pipes.find((pipe) => pipe.id === id)!)
      .find((pipe) => pipe.type === 'gate');

    if (freePipe) {
      for (let move = 0; move < padding; move += 1) useGameStore.getState().rotatePipe(freePipe.id);
    } else if (routePipe && padding % 4 === 0) {
      for (let move = 0; move < padding; move += 1) useGameStore.getState().rotatePipe(routePipe.id);
    } else if (routeGate && padding % 2 === 0) {
      for (let move = 0; move < padding; move += 1) useGameStore.getState().toggleGate(routeGate.id);
    } else {
      throw new Error(`Level ${level.number}: cannot legally add ${padding} moves without changing its route`);
    }
  }

  const finalState = useGameStore.getState();
  if (finalState.movesUsed !== targetMoves) {
    throw new Error(`Level ${level.number}: expected ${targetMoves} moves, got ${finalState.movesUsed}`);
  }
  return simulationFor(level, finalState.pipes);
}

export function deliveryPlan(level: LevelConfig, result: FlowResult): Array<{ targetId: string; color: FlowColor }> {
  if (!canSupplyTargets(level, result)) {
    throw new Error(`Level ${level.number}: connected routes cannot supply every target's required amount`);
  }
  const plan: Array<{ targetId: string; color: FlowColor }> = [];

  for (const target of level.targets) {
    for (let ball = 0; ball < target.requiredAmount; ball += 1) {
      plan.push({ targetId: target.id, color: target.color });
    }
  }

  return plan;
}

export function rotatePipeAction(pipe: PipeNode): boolean {
  return !pipe.locked && pipe.type !== 'gate';
}

export function toggleGateAction(pipe: PipeNode): boolean {
  return pipe.type === 'gate';
}
