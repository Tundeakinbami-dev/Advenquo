/**
 * Advenquo: Construction World — Builder Achievement Manager
 */

import type { BuilderAchievement } from '../core/construction-types.js';

export class AchievementManager {
  private achievements: Map<string, BuilderAchievement> = new Map();

  constructor() {
    this.register({
      id: 'FIRST_STONE',
      title: 'First Stone Placed',
      description: 'Placed your first modular construction block in the workshop.',
      icon: '🧱',
    });
    this.register({
      id: 'TWO_HANDED_CRAFTSMAN',
      title: 'Two-Handed Craftsman',
      description: 'Successfully picked up and positioned a heavy beam or slab using both hands.',
      icon: '🙌',
    });
    this.register({
      id: 'STRUCTURAL_ENGINEER',
      title: 'Certified Structural Engineer',
      description: 'Successfully verified a complete vertical load path down to the foundation pad.',
      icon: '📐',
    });
    this.register({
      id: 'THREE_STAR_BUILDER',
      title: 'Master Architect',
      description: 'Earned a perfect 3-star rating on a construction challenge.',
      icon: '⭐',
    });
    this.register({
      id: 'VIADUCT_PIONEER',
      title: 'Infrastructure Pioneer',
      description: 'Successfully erected the Viaduct Bridge and passed the live load test.',
      icon: '🌉',
    });
    this.register({
      id: 'first_structure_certified',
      title: 'Foundation Master',
      description: 'Completed your first certified construction challenge.',
      icon: '🏗️',
    });
  }

  public register(ach: BuilderAchievement): void {
    this.achievements.set(ach.id, ach);
  }

  public checkMilestone(milestoneId: string): BuilderAchievement | null {
    const ach = this.achievements.get(milestoneId);
    if (ach) {
      this.unlock(milestoneId);
      return ach;
    }
    return null;
  }

  public unlock(id: string): BuilderAchievement | null {
    const ach = this.achievements.get(id);
    if (ach && !ach.unlockedAt) {
      ach.unlockedAt = Date.now();
      return ach;
    }
    return null;
  }

  public isUnlocked(id: string): boolean {
    const ach = this.achievements.get(id);
    return ach ? !!ach.unlockedAt : false;
  }

  public getAllAchievements(): BuilderAchievement[] {
    return Array.from(this.achievements.values());
  }
}
