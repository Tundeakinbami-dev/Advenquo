/**
 * Advenquo: Construction World — Assembly Manager & Snap Coordinator
 *
 * Coordinates:
 * - World snap socket registry
 * - Nearest compatible snap candidate discovery
 * - Assembly commits upon component release
 * - Undo and component removal
 * - Dynamic-to-Static physics transitions to safeguard Meta Quest 3 frame times
 */

import { Quaternion, Vector3 } from '@iwsdk/core';

import type { ComponentType, SnapPoint } from '../core/construction-types.js';
import { getComponentSpec } from '../materials/construction-catalog.js';
import { ConnectionGraph, type GraphNode } from './connection-graph.js';
import {
  computeWorldSnapPoint,
  evaluateSnapCandidate,
  type SnapCandidate,
  type WorldSnapPoint,
} from './snap-point.js';

export interface PlacedBlockEntity {
  instanceId: string;
  componentType: ComponentType;
  position: Vector3 | [number, number, number];
  rotation: Quaternion | [number, number, number, number];
  isGrounded?: boolean;
}

export class AssemblySystem {
  private static instance: AssemblySystem | null = null;
  private graph = new ConnectionGraph();
  private registeredBlocks: Map<string, PlacedBlockEntity> = new Map();

  public static getInstance(): AssemblySystem {
    if (!AssemblySystem.instance) {
      AssemblySystem.instance = new AssemblySystem();
    }
    return AssemblySystem.instance;
  }

  public getGraph(): ConnectionGraph {
    return this.graph;
  }

  /**
   * Registers a placed block or foundation in the assembly world.
   */
  public registerPlacedBlock(block: PlacedBlockEntity): void {
    const posVec = block.position instanceof Vector3 ? block.position : new Vector3(...block.position);
    const rotQuat = block.rotation instanceof Quaternion ? block.rotation : new Quaternion(...block.rotation);

    const normalizedBlock: PlacedBlockEntity = {
      ...block,
      position: posVec,
      rotation: rotQuat,
    };

    this.registeredBlocks.set(block.instanceId, normalizedBlock);
    const spec = getComponentSpec(block.componentType);
    this.graph.addNode(
      block.instanceId,
      block.componentType,
      spec.structuralRole,
      [posVec.x, posVec.y, posVec.z],
      [rotQuat.x, rotQuat.y, rotQuat.z, rotQuat.w],
      Boolean(block.isGrounded),
    );
  }

  /**
   * Unregisters a block when picked up or removed.
   */
  public unregisterBlock(instanceId: string): void {
    this.registeredBlocks.delete(instanceId);
    this.graph.removeNode(instanceId);
  }

  /**
   * Collects all active world snap points from all currently registered placed blocks.
   */
  public getAvailableWorldSnapPoints(): WorldSnapPoint[] {
    const list: WorldSnapPoint[] = [];

    for (const [instanceId, block] of this.registeredBlocks.entries()) {
      const spec = getComponentSpec(block.componentType);
      const node = this.graph.getNode(instanceId);
      const occupiedSocketIds = new Set(node?.connections.map((c) => c.mySnapPointId) ?? []);

      for (const p of spec.snapPoints) {
        const pos = Array.isArray(block.position)
          ? new Vector3(...block.position)
          : block.position;
        const rot = Array.isArray(block.rotation)
          ? new Quaternion(...block.rotation)
          : block.rotation;
        const wsp = computeWorldSnapPoint(
          instanceId,
          block.componentType,
          p,
          pos,
          rot,
        );
        wsp.isOccupied = occupiedSocketIds.has(p.id);
        list.push(wsp);
      }
    }

    return list;
  }

  /**
   * Finds the best valid snap candidate for a held component at its current hand transform.
   */
  public findBestSnapCandidate(
    heldInstanceId: string,
    heldType: ComponentType,
    heldPosition: Vector3,
    heldRotation: Quaternion,
  ): SnapCandidate | null {
    const heldSpec = getComponentSpec(heldType);
    const worldTargets = this.getAvailableWorldSnapPoints();

    // Compute held entity's snap points in world coordinates
    const heldWorldPoints = heldSpec.snapPoints.map((p: SnapPoint) =>
      computeWorldSnapPoint(heldInstanceId, heldType, p, heldPosition, heldRotation),
    );

    let bestCandidate: SnapCandidate | null = null;
    let minDistance = Infinity;

    for (const sourcePoint of heldWorldPoints) {
      for (const targetPoint of worldTargets) {
        if (targetPoint.sourceInstanceId === heldInstanceId) continue;
        if (targetPoint.isOccupied) continue;

        const candidate = evaluateSnapCandidate(sourcePoint, targetPoint, heldRotation);

        if (candidate.isValid && candidate.distance < minDistance) {
          minDistance = candidate.distance;
          bestCandidate = candidate;
        }
      }
    }

    return bestCandidate;
  }

  /**
   * Commits a snap placement when user releases the component.
   */
  public commitSnapPlacement(
    heldInstanceId: string,
    heldType: ComponentType,
    candidate: SnapCandidate,
  ): { success: boolean; snappedPosition: Vector3; snappedRotation: Quaternion } {
    if (!candidate.isValid) {
      return {
        success: false,
        snappedPosition: candidate.snappedPosition,
        snappedRotation: candidate.snappedRotation,
      };
    }

    const { sourceSnapPoint, targetSnapPoint, snappedPosition, snappedRotation } = candidate;

    // 1. Register new placed block
    this.registerPlacedBlock({
      instanceId: heldInstanceId,
      componentType: heldType,
      position: snappedPosition.clone(),
      rotation: snappedRotation.clone(),
      isGrounded: targetSnapPoint.sourceInstanceId === 'foundation_slab',
    });

    // 2. Connect in assembly graph
    this.graph.connect(
      heldInstanceId,
      sourceSnapPoint.id,
      targetSnapPoint.sourceInstanceId,
      targetSnapPoint.id,
    );

    return {
      success: true,
      snappedPosition,
      snappedRotation,
    };
  }

  public reset(): void {
    this.registeredBlocks.clear();
    this.graph.clear();
  }
}

export const assemblySystem = AssemblySystem.getInstance();
