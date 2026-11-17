/**
 * Advenquo: Construction World — Progression Unlock Manager
 *
 * Implements strict progression gating across the 7 construction levels:
 * - Level 1: Small House (Default unlocked)
 * - Level 2: Duplex (Requires Level 1 passed)
 * - Level 3: Bungalow (Requires Level 2 passed)
 * - Level 4: Castle (Requires Level 3 passed)
 * - Level 5: Mansion (Requires Level 4 passed)
 * - Level 6: Bridge (Requires Level 5 passed)
 * - Level 7: Mega Construction (Requires Level 6 passed)
 * - Sandbox: Unlocked early for freeform experimentation
 */

import type {
  ComponentType,
  ConstructionLevelId,
} from '../core/construction-types.js';

export interface LevelUnlockStatus {
  levelId: ConstructionLevelId;
  name: string;
  isUnlocked: boolean;
  requiredLevelId?: ConstructionLevelId;
  unlockedComponents: ComponentType[];
}

export class UnlockManager {
  private unlockedLevels: Set<ConstructionLevelId> = new Set(['small_house', 'sandbox']);
  private completedLevels: Set<ConstructionLevelId> = new Set();

  private levelDefinitions: LevelUnlockStatus[] = [
    {
      levelId: 'small_house',
      name: 'Level 1: Small House',
      isUnlocked: true,
      unlockedComponents: ['clay_brick', 'concrete_block', 'reinforced_column', 'horizontal_beam', 'wall_panel', 'roof_panel'],
    },
    {
      levelId: 'duplex',
      name: 'Level 2: Duplex Villa',
      isUnlocked: false,
      requiredLevelId: 'small_house',
      unlockedComponents: ['floor_component', 'floor_slab', 'staircase'],
    },
    {
      levelId: 'bungalow',
      name: 'Level 3: Courtyard Bungalow',
      isUnlocked: false,
      requiredLevelId: 'duplex',
      unlockedComponents: ['sandcrete_block', 'door_frame', 'window_frame', 'roof_truss'],
    },
    {
      levelId: 'castle',
      name: 'Level 4: Medieval Castle',
      isUnlocked: false,
      requiredLevelId: 'bungalow',
      unlockedComponents: ['foundation_block', 'steel_connector'],
    },
    {
      levelId: 'mansion',
      name: 'Level 5: Grand Mansion',
      isUnlocked: false,
      requiredLevelId: 'castle',
      unlockedComponents: ['timber_piece', 'rebar'],
    },
    {
      levelId: 'bridge',
      name: 'Level 6: Viaduct Bridge',
      isUnlocked: false,
      requiredLevelId: 'mansion',
      unlockedComponents: ['bridge_section'],
    },
    {
      levelId: 'mega_construction',
      name: 'Level 7: Mega Construction',
      isUnlocked: false,
      requiredLevelId: 'bridge',
      unlockedComponents: [],
    },
    {
      levelId: 'sandbox',
      name: 'Free-Build Creative Sandbox',
      isUnlocked: true,
      unlockedComponents: [],
    },
  ];

  public isLevelUnlocked(levelId: ConstructionLevelId): boolean {
    return this.unlockedLevels.has(levelId);
  }

  public markLevelCompleted(levelId: ConstructionLevelId): ConstructionLevelId[] {
    this.completedLevels.add(levelId);
    const newlyUnlocked: ConstructionLevelId[] = [];

    for (const def of this.levelDefinitions) {
      if (!this.unlockedLevels.has(def.levelId) && def.requiredLevelId === levelId) {
        this.unlockedLevels.add(def.levelId);
        def.isUnlocked = true;
        newlyUnlocked.push(def.levelId);
      }
    }

    return newlyUnlocked;
  }

  public recordLevelCompletion(levelId: ConstructionLevelId, _stars?: number): ConstructionLevelId[] {
    return this.markLevelCompleted(levelId);
  }

  public getLevelStatus(levelId: ConstructionLevelId): LevelUnlockStatus | undefined {
    const def = this.levelDefinitions.find((d) => d.levelId === levelId);
    if (!def) return undefined;
    return {
      ...def,
      isUnlocked: this.unlockedLevels.has(def.levelId),
    };
  }

  public getUnlockedComponents(): Set<ComponentType> {
    const components = new Set<ComponentType>();
    for (const def of this.levelDefinitions) {
      if (this.unlockedLevels.has(def.levelId)) {
        for (const c of def.unlockedComponents) {
          components.add(c);
        }
      }
    }
    return components;
  }

  public getLevels(): LevelUnlockStatus[] {
    return this.levelDefinitions.map((d) => ({
      ...d,
      isUnlocked: this.unlockedLevels.has(d.levelId),
    }));
  }
}
