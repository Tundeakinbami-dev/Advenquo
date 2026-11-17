/**
 * Advenquo: Construction World — Assembly Connection Graph
 *
 * Maintains a bidirectional structural topology graph of all assembled components:
 * - Tracks connected nodes, mating snap points, and spatial coordinates
 * - Supports dynamic additions, connection breaks (removal/undo), and graph traversals
 * - Validates load-path continuity down to the foundation
 * - Serializes and restores assembly state cleanly
 */

import type {
  ComponentType,
  PlacedComponentRecord,
  StructuralRole,
} from '../core/construction-types.js';

export interface GraphConnectionEdge {
  mySnapPointId: string;
  targetInstanceId: string;
  targetSnapPointId: string;
  timestamp: number;
}

export interface GraphNode {
  instanceId: string;
  componentType: ComponentType;
  structuralRole: StructuralRole;
  position: [number, number, number];
  rotation: [number, number, number, number];
  connections: GraphConnectionEdge[];
  isGrounded: boolean;
  isStaticOptimized: boolean;
}

export class ConnectionGraph {
  private nodes: Map<string, GraphNode> = new Map();

  /**
   * Registers a new placed component into the assembly graph.
   */
  public addNode(
    instanceId: string,
    componentType: ComponentType,
    structuralRole: StructuralRole,
    position: [number, number, number],
    rotation: [number, number, number, number],
    isGrounded = false,
  ): GraphNode {
    const existing = this.nodes.get(instanceId);
    if (existing) {
      existing.position = position;
      existing.rotation = rotation;
      existing.structuralRole = structuralRole;
      existing.isGrounded = isGrounded;
      return existing;
    }

    const node: GraphNode = {
      instanceId,
      componentType,
      structuralRole,
      position,
      rotation,
      connections: [],
      isGrounded,
      isStaticOptimized: false,
    };
    this.nodes.set(instanceId, node);
    return node;
  }

  /**
   * Connects two components across a pair of mating snap sockets.
   */
  public connect(
    sourceInstanceId: string,
    sourceSnapPointId: string,
    targetInstanceId: string,
    targetSnapPointId: string,
  ): boolean {
    const sourceNode = this.nodes.get(sourceInstanceId);
    const targetNode = this.nodes.get(targetInstanceId);

    if (!sourceNode || !targetNode) {
      return false;
    }

    // Check if already connected across these exact sockets
    const alreadyConnected = sourceNode.connections.some(
      (c) =>
        c.targetInstanceId === targetInstanceId &&
        c.mySnapPointId === sourceSnapPointId &&
        c.targetSnapPointId === targetSnapPointId,
    );
    if (alreadyConnected) {
      return true;
    }

    const now = Date.now();
    sourceNode.connections.push({
      mySnapPointId: sourceSnapPointId,
      targetInstanceId,
      targetSnapPointId,
      timestamp: now,
    });

    targetNode.connections.push({
      mySnapPointId: targetSnapPointId,
      targetInstanceId: sourceInstanceId,
      targetSnapPointId: sourceSnapPointId,
      timestamp: now,
    });

    return true;
  }

  /**
   * Breaks connections between two components or disconnects a component entirely.
   */
  public disconnect(instanceIdA: string, instanceIdB?: string): void {
    const nodeA = this.nodes.get(instanceIdA);
    if (!nodeA) return;

    if (instanceIdB) {
      const nodeB = this.nodes.get(instanceIdB);
      nodeA.connections = nodeA.connections.filter((c) => c.targetInstanceId !== instanceIdB);
      if (nodeB) {
        nodeB.connections = nodeB.connections.filter((c) => c.targetInstanceId !== instanceIdA);
      }
    } else {
      // Disconnect from all neighbors
      for (const edge of nodeA.connections) {
        const neighbor = this.nodes.get(edge.targetInstanceId);
        if (neighbor) {
          neighbor.connections = neighbor.connections.filter(
            (c) => c.targetInstanceId !== instanceIdA,
          );
        }
      }
      nodeA.connections = [];
    }
  }

  /**
   * Removes a node completely from the graph.
   */
  public removeNode(instanceId: string): boolean {
    this.disconnect(instanceId);
    return this.nodes.delete(instanceId);
  }

  public getNode(instanceId: string): GraphNode | undefined {
    return this.nodes.get(instanceId);
  }

  public hasNode(instanceId: string): boolean {
    return this.nodes.has(instanceId);
  }

  public getAllNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  public getNodeCount(): number {
    return this.nodes.size;
  }

  public getNeighbors(instanceId: string): string[] {
    const node = this.nodes.get(instanceId);
    if (!node) return [];
    return node.connections.map((c) => c.targetInstanceId);
  }

  public hasConnection(instanceIdA: string, instanceIdB: string): boolean {
    const node = this.nodes.get(instanceIdA);
    if (!node) return false;
    return node.connections.some((c) => c.targetInstanceId === instanceIdB);
  }

  /**
   * Breadth-First Search to check if a component is structurally connected down to a grounded node.
   */
  public isConnectedToGround(instanceId: string): boolean {
    const startNode = this.nodes.get(instanceId);
    if (!startNode) return false;
    if (startNode.isGrounded) return true;

    const visited = new Set<string>();
    const queue: string[] = [instanceId];
    visited.add(instanceId);

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const current = this.nodes.get(currentId);
      if (!current) continue;

      if (current.isGrounded) {
        return true;
      }

      for (const edge of current.connections) {
        if (!visited.has(edge.targetInstanceId)) {
          visited.add(edge.targetInstanceId);
          queue.push(edge.targetInstanceId);
        }
      }
    }

    return false;
  }

  public clear(): void {
    this.nodes.clear();
  }

  /**
   * Serializes current assembly graph into a portable JSON array.
   */
  public serialize(): PlacedComponentRecord[] {
    return Array.from(this.nodes.values()).map((node) => ({
      instanceId: node.instanceId,
      componentType: node.componentType,
      position: [...node.position],
      rotation: [...node.rotation],
      structuralRole: node.structuralRole,
      isGrounded: node.isGrounded,
      connections: node.connections.map((c) => ({
        mySnapPointId: c.mySnapPointId,
        targetInstanceId: c.targetInstanceId,
        targetSnapPointId: c.targetSnapPointId,
      })),
      isStaticOptimized: node.isStaticOptimized,
    }));
  }

  /**
   * Restores assembly graph from records.
   */
  public deserialize(records: PlacedComponentRecord[]): void {
    this.clear();
    for (const r of records) {
      this.addNode(
        r.instanceId,
        r.componentType,
        r.structuralRole,
        [...r.position],
        [...r.rotation],
        Boolean(r.isGrounded || r.structuralRole === 'foundation'),
      );
    }

    // Re-establish edges
    for (const r of records) {
      for (const conn of r.connections) {
        this.connect(r.instanceId, conn.mySnapPointId, conn.targetInstanceId, conn.targetSnapPointId);
      }
    }
  }
}
