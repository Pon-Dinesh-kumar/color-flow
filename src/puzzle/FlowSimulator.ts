import { Direction, GridPosition, getNeighborPosition, getOppositeDirection, posKey } from './Grid';
import { FlowColor, getTransformedColor } from './ColorSystem';
import { PipeNode, canAcceptFlowFrom, getOutgoingPorts } from './Pipe';
import { SourceNode } from './Source';
import { TargetNode } from './Target';
import { FlowPath, FlowResult, FlowWaypoint } from './FlowPath';

export interface LevelSimulationState {
  width: number;
  height: number;
  pipes: Map<string, PipeNode>; // keyed by posKey(pos)
  sources: SourceNode[];
  targets: TargetNode[];
}

export class FlowSimulator {
  public static simulate(state: LevelSimulationState): FlowResult {
    const paths: FlowPath[] = [];
    const connectedTargetIds: string[] = [];
    const mismatchedTargetIds: string[] = [];
    const activePipes = new Set<string>();
    const pipeFlowColors = new Map<string, FlowColor>();

    // Index targets by posKey
    const targetMap = new Map<string, TargetNode>();
    for (const t of state.targets) {
      targetMap.set(posKey(t.position), t);
    }

    let pathCounter = 0;

    for (const source of state.sources) {
      const initialWaypoint: FlowWaypoint = {
        position: { ...source.position },
        color: source.color,
        outDirection: source.direction,
        sourceId: source.id,
        isSource: true,
      };

      // Branch tracing helper
      const traceBranch = (
        currentPos: GridPosition,
        inDirection: Direction,
        currentColor: FlowColor,
        currentWaypoints: FlowWaypoint[],
        visitedSegments: Set<string>
      ) => {
        // Look up pipe at currentPos
        const pipe = state.pipes.get(posKey(currentPos));
        if (!pipe) {
          // No pipe here
          return;
        }

        // Can pipe accept flow?
        if (!canAcceptFlowFrom(pipe, inDirection)) {
          return;
        }

        // Mark pipe as active
        activePipes.add(pipe.id);
        pipeFlowColors.set(pipe.id, currentColor);

        // Does this pipe change the color?
        let outgoingColor = currentColor;
        if (pipe.type === 'color_changer') {
          outgoingColor = getTransformedColor(currentColor, pipe.targetColor);
        }

        // Get outgoing ports
        const outPorts = getOutgoingPorts(pipe, inDirection);
        if (outPorts.length === 0) {
          // Dead end inside pipe
          const endWp: FlowWaypoint = {
            position: { ...currentPos },
            color: outgoingColor,
            inDirection,
            pipeId: pipe.id,
          };
          paths.push({
            id: `path_${pathCounter++}`,
            sourceId: source.id,
            color: currentColor,
            waypoints: [...currentWaypoints, endWp],
            reachesTarget: false,
          });
          return;
        }

        // For each outgoing port, propagate
        for (const outPort of outPorts) {
          const segmentKey = `${posKey(currentPos)}_${outPort}`;
          if (visitedSegments.has(segmentKey)) {
            // Cycle detected, prevent infinite loop
            continue;
          }
          const nextVisited = new Set(visitedSegments);
          nextVisited.add(segmentKey);

          const wp: FlowWaypoint = {
            position: { ...currentPos },
            color: outgoingColor,
            inDirection,
            outDirection: outPort,
            pipeId: pipe.id,
          };
          const newWaypoints = [...currentWaypoints, wp];

          const nextPos = getNeighborPosition(currentPos, outPort);
          const nextInDirection = getOppositeDirection(outPort);

          // Check if nextPos has a target
          const target = targetMap.get(posKey(nextPos));
          if (target && target.acceptDirection === nextInDirection) {
            // Reached target!
            const targetWp: FlowWaypoint = {
              position: { ...nextPos },
              color: outgoingColor,
              inDirection: nextInDirection,
              targetId: target.id,
              isTarget: true,
            };
            const isMatch = target.color === outgoingColor;
            if (isMatch) {
              if (!connectedTargetIds.includes(target.id)) {
                connectedTargetIds.push(target.id);
              }
            } else {
              if (!mismatchedTargetIds.includes(target.id)) {
                mismatchedTargetIds.push(target.id);
              }
            }

            paths.push({
              id: `path_${pathCounter++}`,
              sourceId: source.id,
              color: outgoingColor,
              waypoints: [...newWaypoints, targetWp],
              reachesTarget: isMatch,
              targetId: target.id,
              mismatchedColor: !isMatch,
            });
            continue;
          }

          // Otherwise check if nextPos has a pipe
          const nextPipe = state.pipes.get(posKey(nextPos));
          if (nextPipe && canAcceptFlowFrom(nextPipe, nextInDirection)) {
            traceBranch(nextPos, nextInDirection, outgoingColor, newWaypoints, nextVisited);
          } else {
            // Path stops at boundary / disconnected
            paths.push({
              id: `path_${pathCounter++}`,
              sourceId: source.id,
              color: outgoingColor,
              waypoints: newWaypoints,
              reachesTarget: false,
            });
          }
        }
      };

      // Start flow from source into its neighbor
      const firstPos = getNeighborPosition(source.position, source.direction);
      const firstInDirection = getOppositeDirection(source.direction);

      // Check if target is immediately adjacent to source
      const directTarget = targetMap.get(posKey(firstPos));
      if (directTarget && directTarget.acceptDirection === firstInDirection) {
        const targetWp: FlowWaypoint = {
          position: { ...firstPos },
          color: source.color,
          inDirection: firstInDirection,
          targetId: directTarget.id,
          isTarget: true,
        };
        const isMatch = directTarget.color === source.color;
        if (isMatch) connectedTargetIds.push(directTarget.id);
        else mismatchedTargetIds.push(directTarget.id);

        paths.push({
          id: `path_${pathCounter++}`,
          sourceId: source.id,
          color: source.color,
          waypoints: [initialWaypoint, targetWp],
          reachesTarget: isMatch,
          targetId: directTarget.id,
          mismatchedColor: !isMatch,
        });
      } else {
        traceBranch(firstPos, firstInDirection, source.color, [initialWaypoint], new Set());
      }
    }

    return {
      paths,
      connectedTargetIds,
      mismatchedTargetIds,
      activePipes,
      pipeFlowColors,
    };
  }
}
