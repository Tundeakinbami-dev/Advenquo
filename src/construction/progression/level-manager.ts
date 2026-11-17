/**
 * Advenquo: Construction World — Level Progression Manager
 *
 * Coordinates:
 * - Active challenge selection and stage advancement
 * - Level unlocking prerequisites (Levels 1 through 7)
 * - Stars and XP accumulation
 * - Builder achievement dispatch
 */

import type {
  ConstructionLevelId,
  StarRating,
} from '../core/construction-types.js';
import { UnlockManager } from './unlock-manager.js';
import { AchievementManager } from './achievement-manager.js';
import { BlueprintLoader } from '../blueprints/blueprint-loader.js';
import type { BlueprintDefinition } from '../blueprints/blueprint-types.js';

export class LevelManager {
  private unlockManager: UnlockManager;
  private achievementManager: AchievementManager;
  private currentLevelId: ConstructionLevelId = 'small_house';
  private currentStageIndex: number = 1;
  private levelStars: Map<ConstructionLevelId, StarRating> = new Map();
  private totalBuilderXp: number = 0;

  constructor(
    unlockManager?: UnlockManager,
    achievementManager?: AchievementManager
  ) {
    this.unlockManager = unlockManager || new UnlockManager();
    this.achievementManager = achievementManager || new AchievementManager();
  }

  public getUnlockManager(): UnlockManager {
    return this.unlockManager;
  }

  public getAchievementManager(): AchievementManager {
    return this.achievementManager;
  }

  public getAllLevels(): Array<{ id: ConstructionLevelId; name: string }> {
    return [
      { id: 'small_house', name: 'Level 1: Small House' },
      { id: 'duplex', name: 'Level 2: Duplex Villa' },
      { id: 'bungalow', name: 'Level 3: Courtyard Bungalow' },
      { id: 'castle', name: 'Level 4: Medieval Castle' },
      { id: 'mansion', name: 'Level 5: Grand Mansion' },
      { id: 'bridge', name: 'Level 6: Viaduct Bridge' },
      { id: 'sandbox', name: 'Free-Build Creative Sandbox' },
    ];
  }

  public getCurrentLevelId(): ConstructionLevelId {
    return this.currentLevelId;
  }

  public getCurrentBlueprint(): BlueprintDefinition | undefined {
    return BlueprintLoader.load(this.currentLevelId);
  }

  public getCurrentStageIndex(): number {
    return this.currentStageIndex;
  }

  public getTotalBuilderXp(): number {
    return this.totalBuilderXp;
  }

  public setLevel(levelId: ConstructionLevelId): boolean {
    if (!this.unlockManager.isLevelUnlocked(levelId)) {
      return false;
    }
    this.currentLevelId = levelId;
    this.currentStageIndex = 1;
    return true;
  }

  public advanceStage(): number {
    const bp = this.getCurrentBlueprint();
    const maxStages = bp ? bp.stages.length : 5;
    if (this.currentStageIndex < maxStages) {
      this.currentStageIndex++;
    }
    return this.currentStageIndex;
  }

  public completeCurrentLevel(stars: StarRating, score: number): {
    newlyUnlocked: ConstructionLevelId[];
    xpEarned: number;
  } {
    // Record stars (keep best)
    const existingStars = this.levelStars.get(this.currentLevelId) || 0;
    if (stars > existingStars) {
      this.levelStars.set(this.currentLevelId, stars);
    }

    const xpEarned = score * 5 + stars * 50;
    this.totalBuilderXp += xpEarned;

    const newlyUnlocked = this.unlockManager.markLevelCompleted(this.currentLevelId);

    // Achievements
    if (stars === 3) {
      this.achievementManager.unlock('THREE_STAR_BUILDER');
    }
    if (this.currentLevelId === 'bridge') {
      this.achievementManager.unlock('VIADUCT_PIONEER');
    }

    return {
      newlyUnlocked,
      xpEarned,
    };
  }
}
