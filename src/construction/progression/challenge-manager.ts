/**
 * Advenquo: Construction World — Challenge Progression Manager
 *
 * Manages the live progression through the small-house construction challenge:
 * - Active stage tracking (1 to 6)
 * - Stage advancement and critical checks
 * - Integration with Advenquo player progression (+250 XP, journal stamp, storage)
 */

import { AssessmentEngine } from '../assessment/assessment-engine.js';
import type { ConnectionGraph } from '../assembly/connection-graph.js';
import type { BlueprintDefinition } from '../blueprints/blueprint-types.js';
import { SMALL_HOUSE_BLUEPRINT } from '../blueprints/small-house-blueprint.js';
import { getBlueprintById, BLUEPRINT_LIBRARY } from '../blueprints/blueprint-catalog.js';
import type { StructuralAssessmentResult } from '../core/construction-types.js';
import { ConstructionProgressPersistence } from '../persistence/construction-progress.js';

export class ChallengeManager {
  private static instance: ChallengeManager | null = null;
  private currentBlueprint: BlueprintDefinition = SMALL_HOUSE_BLUEPRINT;
  private currentStageIndex = 1;
  private isCompleted = false;
  private lastAssessment: StructuralAssessmentResult | null = null;

  public static getInstance(): ChallengeManager {
    if (!ChallengeManager.instance) {
      ChallengeManager.instance = new ChallengeManager();
    }
    return ChallengeManager.instance;
  }

  public getBlueprint(): BlueprintDefinition {
    return this.currentBlueprint;
  }

  public selectBlueprint(blueprintId: string): BlueprintDefinition {
    this.currentBlueprint = getBlueprintById(blueprintId);
    this.reset();
    return this.currentBlueprint;
  }

  public selectStage1Bungalow(): BlueprintDefinition {
    return this.selectBlueprint('two_bedroom_bungalow');
  }

  public setActiveChallenge(challengeId: string): BlueprintDefinition {
    return this.selectBlueprint(challengeId);
  }

  public getCurrentStageIndex(): number {
    return this.currentStageIndex;
  }

  public getCurrentStageInfo() {
    return (
      this.currentBlueprint.stages.find((s) => s.stageIndex === this.currentStageIndex) ||
      this.currentBlueprint.stages[0]
    );
  }

  public advanceStage(): number {
    if (this.currentStageIndex < this.currentBlueprint.stages.length) {
      this.currentStageIndex++;
    }
    return this.currentStageIndex;
  }

  public setStage(stageIndex: number): void {
    this.currentStageIndex = Math.max(1, Math.min(this.currentBlueprint.stages.length, stageIndex));
  }

  public evaluateProgress(graph: ConnectionGraph): StructuralAssessmentResult {
    const assessment = AssessmentEngine.assessBlueprint(this.currentBlueprint, graph);
    this.lastAssessment = assessment;

    if (assessment.passed && !this.isCompleted) {
      this.isCompleted = true;
      this.currentStageIndex = this.currentBlueprint.stages.length;

      // Award builder XP and persist progress
      try {
        const saved = ConstructionProgressPersistence.load() || {
          version: 1,
          totalXp: 0,
          unlockedLevels: ['small_house', 'duplex'],
          completedLevels: [],
          stars: {},
          achievements: [],
          lastSaved: Date.now(),
        };
        saved.totalXp += 250;
        if (!saved.completedLevels.includes(this.currentBlueprint.id as any)) {
          saved.completedLevels.push(this.currentBlueprint.id as any);
        }
        saved.lastSaved = Date.now();
        ConstructionProgressPersistence.save(saved);
      } catch (e) {
        // Safe storage fallback in unit test environments
      }
    }

    return assessment;
  }

  public getLastAssessment(): StructuralAssessmentResult | null {
    return this.lastAssessment;
  }

  public isChallengeCompleted(): boolean {
    return this.isCompleted;
  }

  public reset(): void {
    this.currentStageIndex = 1;
    this.isCompleted = false;
    this.lastAssessment = null;
  }

  public resetChallenge(): void {
    this.reset();
  }
}

export const challengeManager = ChallengeManager.getInstance();
