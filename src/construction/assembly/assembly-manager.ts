/**
 * Advenquo: Construction World — Assembly Manager
 *
 * High-level coordinator for:
 * - ConnectionGraph maintenance
 * - Snap placement commitment
 * - Undo & safe repositioning
 * - Foundation anchor tracking
 */

import type {
  ComponentType,
  PlacedComponentRecord,
} from '../core/construction-types.js';
import { ConnectionGraph } from './connection-graph.js';
import { CONSTRUCTION_CATALOG } from '../materials/construction-catalog.js';

export class AssemblyManager {
  private graph: ConnectionGraph;
  private history: PlacedComponentRecord[][] = [];
  private historyIndex: number = -1;

  constructor(graph?: ConnectionGraph) {
    this.graph = graph || new ConnectionGraph();
  }

  public getGraph(): ConnectionGraph {
    return this.graph;
  }

  public registerPlacedBlock(
    instanceId: string,
    componentType: ComponentType,
    position: [number, number, number],
    rotation: [number, number, number, number],
    isGrounded: boolean = false
  ): PlacedComponentRecord {
    const spec = CONSTRUCTION_CATALOG[componentType];
    const role = spec ? spec.structuralRole : 'compressive_masonry';

    const record: PlacedComponentRecord = {
      instanceId,
      componentType,
      position,
      rotation,
      structuralRole: role,
      isGrounded,
      connections: [],
      isStaticOptimized: false,
    };

    this.graph.addNode(
      record.instanceId,
      record.componentType,
      record.structuralRole,
      record.position,
      record.rotation,
      record.isGrounded
    );
    this.pushHistory();
    return record;
  }

  public connectBlocks(
    sourceId: string,
    sourceSnapId: string,
    targetId: string,
    targetSnapId: string
  ): boolean {
    const connected = this.graph.connect(sourceId, sourceSnapId, targetId, targetSnapId);
    if (connected) {
      this.pushHistory();
    }
    return connected;
  }

  public undo(): PlacedComponentRecord | null {
    if (this.history.length === 0) return null;
    const records = this.graph.getAllNodes();
    if (records.length === 0) return null;

    const lastRecord = records[records.length - 1];
    this.graph.removeNode(lastRecord.instanceId);
    return lastRecord as any;
  }

  public reset(): void {
    this.graph.clear();
    this.history = [];
    this.historyIndex = -1;
  }

  private pushHistory(): void {
    const snapshot = this.graph.getAllNodes().map((r) => ({
      instanceId: r.instanceId,
      componentType: r.componentType,
      structuralRole: r.structuralRole,
      position: [...r.position] as [number, number, number],
      rotation: [...r.rotation] as [number, number, number, number],
      connections: r.connections.map((c) => ({ ...c })),
      isGrounded: r.isGrounded,
      isStaticOptimized: false,
    }));
    this.history.push(snapshot);
  }
}
