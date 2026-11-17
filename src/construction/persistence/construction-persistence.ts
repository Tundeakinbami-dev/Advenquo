/**
 * Advenquo: Construction World — Assembly State Persistence
 *
 * Saves and restores modular construction state:
 * - Serializes component identities, transforms, roles, and snap connections
 * - Saves active challenge progress to localStorage
 * - Validates schema upon restore
 */

import { assemblySystem } from '../assembly/assembly-system.js';
import type { ConnectionGraph } from '../assembly/connection-graph.js';
import type { PlacedComponentRecord } from '../core/construction-types.js';

export interface ConstructionSaveData {
  version: number;
  activeChallengeId: string;
  isCompleted: boolean;
  timestamp: number;
  components: PlacedComponentRecord[];
}

const STORAGE_KEY = 'advenquo_construction_assembly_v1';
let memoryCache: ConstructionSaveData | null = null;

export class ConstructionPersistence {
  /**
   * Serializes current construction state into a JSON object.
   */
  public static createSaveSnapshot(
    activeChallengeId = 'small_house_challenge',
    isCompleted = false,
    customGraph?: ConnectionGraph,
  ): ConstructionSaveData {
    const graph = customGraph || assemblySystem.getGraph();
    return {
      version: 1,
      activeChallengeId,
      isCompleted,
      timestamp: Date.now(),
      components: graph.serialize(),
    };
  }

  /**
   * Saves assembly state to local storage with memory fallback.
   */
  public static saveToLocalStorage(data?: ConstructionSaveData): boolean {
    const snapshot = data || ConstructionPersistence.createSaveSnapshot();
    memoryCache = snapshot;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      }
      return true;
    } catch (e) {
      return true;
    }
  }

  /**
   * Loads assembly state from local storage with memory fallback.
   */
  public static loadFromLocalStorage(): ConstructionSaveData | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as ConstructionSaveData;
          if (parsed && Array.isArray(parsed.components)) {
            memoryCache = parsed;
            return parsed;
          }
        }
      }
    } catch (e) {
      // fallback to memory
    }
    return memoryCache;
  }

  /**
   * Restores an assembly state snapshot into the live assembly system.
   */
  public static restoreSnapshot(data: ConstructionSaveData, targetAssembly = assemblySystem): boolean {
    if (!data || !Array.isArray(data.components)) {
      return false;
    }

    const graph = targetAssembly.getGraph();
    graph.deserialize(data.components);

    for (const c of data.components) {
      targetAssembly.registerPlacedBlock({
        instanceId: c.instanceId,
        componentType: c.componentType,
        position: c.position,
        rotation: c.rotation,
        isGrounded: Boolean(c.isGrounded || c.structuralRole === 'foundation'),
      });
    }

    return true;
  }

  public static restoreFromSnapshot(data: ConstructionSaveData, targetAssembly = assemblySystem): number {
    const ok = this.restoreSnapshot(data, targetAssembly);
    return ok ? data.components.length : 0;
  }

  public static clearSave(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // Ignored in headless/test environments
    }
  }
}
