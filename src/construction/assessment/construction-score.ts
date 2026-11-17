/**
 * Advenquo: Construction World — Construction Scoring Engine
 *
 * Computes:
 * - Blueprint Accuracy (0 - 40 pts)
 * - Structural Stability & Load Paths (0 - 30 pts)
 * - Material Suitability (0 - 15 pts)
 * - Construction Sequence & Resource Efficiency (0 - 15 pts)
 * - Star Rating:
 *   - 3 Stars: Score >= 95%
 *   - 2 Stars: Score >= 85%
 *   - 1 Star:  Score >= 70%
 *   - 0 Stars: Critical structural failure or Score < 70%
 */

import type {
  ConstructionScoreBreakdown,
  StarRating,
} from '../core/construction-types.js';

export type BuilderGrade =
  | 'Master Builder'
  | 'Journeyman Builder'
  | 'Apprentice Builder'
  | 'Uncertified';

export interface ScoreInput {
  blueprintAccuracy?: number; // 0 to 40
  structuralStability?: number; // 0 to 30
  materialSuitability?: number; // 0 to 15
  sequenceEfficiency?: number; // 0 to 15
  hasCriticalStructuralFailure?: boolean;
  accuracyScore?: number;
  connectionScore?: number;
  stabilityScore?: number;
  bonusPoints?: number;
}

export class ConstructionScore {
  public static calculate(input: ScoreInput): ConstructionScoreBreakdown {
    let totalScore = 0;
    let starRating: StarRating = 0;
    let grade: BuilderGrade = 'Uncertified';

    if (input.accuracyScore !== undefined) {
      const acc = input.accuracyScore ?? 0;
      const conn = input.connectionScore ?? 0;
      const stab = input.stabilityScore ?? 0;
      const bonus = input.bonusPoints ?? 0;
      totalScore = Math.max(0, Math.min(100, Math.round(acc * 0.4 + conn * 0.3 + stab * 0.3 + bonus * 0.5)));

      if (totalScore >= 90) {
        starRating = 3;
        grade = 'Master Builder';
      } else if (totalScore >= 75) {
        starRating = 2;
        grade = 'Journeyman Builder';
      } else if (totalScore >= 50) {
        starRating = 1;
        grade = 'Apprentice Builder';
      } else {
        starRating = 0;
        grade = 'Uncertified';
      }
    } else {
      const rawTotal =
        (input.blueprintAccuracy ?? 0) +
        (input.structuralStability ?? 0) +
        (input.materialSuitability ?? 0) +
        (input.sequenceEfficiency ?? 0);

      totalScore = Math.max(0, Math.min(100, Math.round(rawTotal)));

      if (input.hasCriticalStructuralFailure) {
        totalScore = Math.min(45, totalScore);
        starRating = 0;
        grade = 'Uncertified';
      } else {
        if (totalScore >= 95) {
          starRating = 3;
          grade = 'Master Builder';
        } else if (totalScore >= 85) {
          starRating = 2;
          grade = 'Journeyman Builder';
        } else if (totalScore >= 70) {
          starRating = 1;
          grade = 'Apprentice Builder';
        } else {
          starRating = 0;
          grade = 'Uncertified';
        }
      }
    }

    return {
      blueprintAccuracy: input.blueprintAccuracy ?? (input.accuracyScore ? Math.round(input.accuracyScore * 0.4) : 0),
      structuralStability: input.structuralStability ?? (input.stabilityScore ? Math.round(input.stabilityScore * 0.3) : 0),
      materialSuitability: input.materialSuitability ?? 0,
      sequenceEfficiency: input.sequenceEfficiency ?? 0,
      totalScore,
      starRating,
      grade,
    };
  }
}
