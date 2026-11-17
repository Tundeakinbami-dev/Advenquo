/**
 * Advenquo: Construction World — Builder Progress Persistence
 *
 * Saves and loads:
 * - Total builder XP
 * - Star ratings per level
 * - Unlocked levels
 * - Unlocked builder achievements
 */

import type { ConstructionLevelId, StarRating } from '../core/construction-types.js';

export interface BuilderProgressData {
  version: number;
  totalXp: number;
  unlockedLevels: ConstructionLevelId[];
  completedLevels: ConstructionLevelId[];
  stars: Record<string, StarRating>;
  achievements: string[];
  lastSaved: number;
}

const PROGRESS_STORAGE_KEY = 'advenquo_builder_progress_v1';

export class ConstructionProgressPersistence {
  public static save(data: BuilderProgressData): boolean {
    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  }

  public static load(): BuilderProgressData | null {
    try {
      const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}
