/**
 * Advenquo: Construction World — Collision Manager
 *
 * Manages compound collision representations and layer filtering:
 * - Differentiates dynamic held components from static placed assemblies.
 * - Prevents held blocks from penetrating placed walls or columns.
 * - Compound collider clustering for completed assemblies on Meta Quest 3.
 */

import { Box3, Vector3 } from '@iwsdk/core';
import type { ComponentType, PlacedComponentRecord } from '../core/construction-types.js';
import { CONSTRUCTION_CATALOG } from '../materials/construction-catalog.js';

export class CollisionManager {
  private bodyStates: Map<string, 'dynamic' | 'kinematic' | 'static'> = new Map();

  /**
   * Registers a physics body state.
   */
  public registerBody(
    id: string,
    state: 'dynamic' | 'kinematic' | 'static',
    _dimensions?: [number, number, number]
  ): void {
    this.bodyStates.set(id, state);
  }

  public getBodyState(id: string): 'dynamic' | 'kinematic' | 'static' | undefined {
    return this.bodyStates.get(id);
  }

  public setKinematic(id: string, isKinematic: boolean): void {
    if (isKinematic) {
      this.bodyStates.set(id, 'kinematic');
    }
  }

  public freezeStatic(id: string): void {
    this.bodyStates.set(id, 'static');
  }

  /**
   * Computes bounding box for a given component type at a world position.
   */
  public static getComponentBounds(
    type: ComponentType,
    position: [number, number, number]
  ): Box3 {
    const spec = CONSTRUCTION_CATALOG[type];
    const [w, h, d] = spec ? spec.dimensions : [0.4, 0.2, 0.2];
    const half = new Vector3(w / 2, h / 2, d / 2);
    const center = new Vector3(...position);
    return new Box3(center.clone().sub(half), center.clone().add(half));
  }

  /**
   * Checks if a held component collides with any placed component.
   */
  public static checkPenetration(
    heldType: ComponentType,
    heldPos: [number, number, number],
    placedComponents: Map<string, PlacedComponentRecord>,
    toleranceBuffer: number = 0.01
  ): { hasCollision: boolean; collidingInstanceId?: string } {
    const heldBounds = this.getComponentBounds(heldType, heldPos);
    heldBounds.expandByScalar(-toleranceBuffer);

    for (const [id, record] of placedComponents.entries()) {
      const placedBounds = this.getComponentBounds(record.componentType, record.position);
      if (heldBounds.intersectsBox(placedBounds)) {
        return { hasCollision: true, collidingInstanceId: id };
      }
    }

    return { hasCollision: false };
  }
}
