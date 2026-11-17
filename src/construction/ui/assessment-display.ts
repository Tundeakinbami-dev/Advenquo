/**
 * Advenquo: Construction World — Assessment Display
 */

import type { StructuralAssessmentResult } from '../core/construction-types.js';

export class AssessmentDisplay {
  public static format(result: StructuralAssessmentResult): {
    header: string;
    summaryText: string;
    scoreText: string;
    starBadge: string;
    errorList: string[];
    feedbackList: string[];
    disclaimer: string;
  } {
    const stars = result.scoreBreakdown ? result.scoreBreakdown.starRating : (result.passed ? 1 : 0);
    const starBadge = '★'.repeat(stars) + '☆'.repeat(3 - stars);

    const allErrors = [
      ...result.placementErrors,
      ...result.connectionErrors,
      ...result.stabilityErrors,
    ];

    return {
      header: result.passed ? 'STRUCTURE CERTIFIED!' : 'ASSESSMENT REJECTED',
      summaryText: result.passed
        ? 'All blueprint connections verified with continuous load-path continuity to the foundation pad.'
        : 'Critical structural or placement flaws detected. Review the engineering feedback below.',
      scoreText: `Structural Score: ${result.score}/100`,
      starBadge,
      errorList: allErrors,
      feedbackList: result.feedbackNotes,
      disclaimer: result.disclaimer,
    };
  }
}
