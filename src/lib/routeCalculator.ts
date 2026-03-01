import { prisma } from './prisma';
import type { Route, RouteStep } from '@/types';
import { getBaseSystemId } from './systemIdParser';

interface GraphNode {
  roomId: string;
  systemId: string;
  roomType: 'NORMAL' | 'BACKBONE';
}

interface GraphEdge {
  toRoomId: string;
  length: number;
  rackInfo?: string | null;
}

/**
 * Build a graph from database
 */
async function buildGraph(): Promise<Map<string, { node: GraphNode; edges: GraphEdge[] }>> {
  const rooms = await prisma.room.findMany({
    select: {
      id: true,
      systemId: true,
      type: true,
      connectionsFrom: {
        select: {
          toRoomId: true,
          lengthMeters: true,
          rackInfo: true,
        }
      },
      connectionsTo: {
        select: {
          fromRoomId: true,
          lengthMeters: true,
          rackInfo: true,
        }
      }
    }
  });

  const graph = new Map<string, { node: GraphNode; edges: GraphEdge[] }>();

  for (const room of rooms) {
    const edges: GraphEdge[] = [];

    // Add outgoing connections
    for (const conn of room.connectionsFrom) {
      edges.push({
        toRoomId: conn.toRoomId,
        length: conn.lengthMeters,
        rackInfo: conn.rackInfo,
      });
    }

    // Add incoming connections (bidirectional)
    for (const conn of room.connectionsTo) {
      edges.push({
        toRoomId: conn.fromRoomId,
        length: conn.lengthMeters,
        rackInfo: conn.rackInfo,
      });
    }

    graph.set(room.id, {
      node: {
        roomId: room.id,
        systemId: room.systemId,
        roomType: room.type,
      },
      edges,
    });
  }

  return graph;
}

/**
 * Dijkstra's shortest path algorithm
 */
function dijkstra(
  graph: Map<string, { node: GraphNode; edges: GraphEdge[] }>,
  startId: string,
  endId: string,
  excludedEdges: Set<string> = new Set()
): { path: GraphNode[]; totalLength: number } | null {
  const distances = new Map<string, number>();
  const previous = new Map<string, { roomId: string; rackInfo?: string | null }>();
  const unvisited = new Set(graph.keys());

  // Initialize
  for (const nodeId of graph.keys()) {
    distances.set(nodeId, nodeId === startId ? 0 : Infinity);
  }

  while (unvisited.size > 0) {
    // Find unvisited node with smallest distance
    let current: string | null = null;
    let smallestDistance = Infinity;
    for (const nodeId of unvisited) {
      const dist = distances.get(nodeId)!;
      if (dist < smallestDistance) {
        smallestDistance = dist;
        current = nodeId;
      }
    }

    if (current === null || smallestDistance === Infinity) {
      break; // No path found
    }

    if (current === endId) {
      // Reconstruct path
      const path: GraphNode[] = [];
      let currentNode = current;
      while (currentNode) {
        const graphData = graph.get(currentNode);
        if (graphData) {
          path.unshift(graphData.node);
        }
        const prev = previous.get(currentNode);
        if (!prev) break;
        currentNode = prev.roomId;
      }
      return { path, totalLength: distances.get(endId)! };
    }

    unvisited.delete(current);

    const currentData = graph.get(current);
    if (!currentData) continue;

    for (const edge of currentData.edges) {
      const edgeKey = `${current}-${edge.toRoomId}`;
      const reverseEdgeKey = `${edge.toRoomId}-${current}`;
      
      if (excludedEdges.has(edgeKey) || excludedEdges.has(reverseEdgeKey)) {
        continue; // Skip excluded edges
      }

      if (!unvisited.has(edge.toRoomId)) continue;

      const newDistance = distances.get(current)! + edge.length;
      if (newDistance < distances.get(edge.toRoomId)!) {
        distances.set(edge.toRoomId, newDistance);
        previous.set(edge.toRoomId, { roomId: current, rackInfo: edge.rackInfo });
      }
    }
  }

  return null; // No path found
}

/**
 * Calculate route between two system IDs
 */
export async function calculateRoute(
  startSystemId: string,
  endSystemId: string,
  includeRedundancy: boolean = false
): Promise<{ primaryRoute: Route; redundantRoute: Route | null }> {
  const baseStartId = getBaseSystemId(startSystemId);
  const baseEndId = getBaseSystemId(endSystemId);

  if (!baseStartId || !baseEndId) {
    throw new Error('Invalid system IDs');
  }

  // Find rooms by base system ID
  const startRoom = await prisma.room.findFirst({
    where: { systemId: { startsWith: baseStartId } }
  });

  const endRoom = await prisma.room.findFirst({
    where: { systemId: { startsWith: baseEndId } }
  });

  if (!startRoom || !endRoom) {
    throw new Error('Start or end room not found');
  }

  // Build graph
  const graph = await buildGraph();

  // Calculate primary route
  const primaryResult = dijkstra(graph, startRoom.id, endRoom.id);
  
  if (!primaryResult) {
    throw new Error('No route found');
  }

  const primaryRoute: Route = {
    path: primaryResult.path.map(node => ({
      systemId: node.systemId,
      roomType: node.roomType,
    })),
    totalLength: primaryResult.totalLength,
  };

  let redundantRoute: Route | null = null;

  // Calculate redundant route if requested
  if (includeRedundancy) {
    // Build excluded edges from primary route
    const excludedEdges = new Set<string>();
    for (let i = 0; i < primaryResult.path.length - 1; i++) {
      const from = primaryResult.path[i].roomId;
      const to = primaryResult.path[i + 1].roomId;
      excludedEdges.add(`${from}-${to}`);
      excludedEdges.add(`${to}-${from}`);
    }

    const redundantResult = dijkstra(graph, startRoom.id, endRoom.id, excludedEdges);

    if (redundantResult) {
      redundantRoute = {
        path: redundantResult.path.map(node => ({
          systemId: node.systemId,
          roomType: node.roomType,
        })),
        totalLength: redundantResult.totalLength,
      };
    }
  }

  return { primaryRoute, redundantRoute };
}
