/**
 * Advenquo Global Live World Engine: Editorial Workflow & Correction Management
 *
 * Implements strict state machine rules for the event lifecycle:
 * DISCOVERED → AWAITING_VALIDATION → EDITORIAL_REVIEW → VERIFIED → PUBLISHED → UPDATED → CORRECTED → ARCHIVED
 *
 * Enforces role-based approvals, audit trails, and transparent public corrections.
 */

import type {
  EditorialAuditLog,
  EditorialReview,
  EventCorrection,
  EventLifecycleStatus,
  WorldEvent,
} from '../types.js';
import { verificationPipeline } from '../intelligence/verification-pipeline.js';

export type UserRole = 'reader' | 'editor' | 'admin' | 'automated_system';

export class EditorialWorkflow {
  private auditLogs: EditorialAuditLog[] = [];
  private reviews: Map<string, EditorialReview> = new Map();

  /**
   * Submits a discovered event to validation.
   */
  public submitForValidation(event: WorldEvent, actorId = 'system'): void {
    if (event.status !== 'DISCOVERED') {
      throw new Error(`Cannot submit for validation from state '${event.status}'`);
    }

    const previousStatus = event.status;
    event.status = 'AWAITING_VALIDATION';
    this._logAction(event.id, actorId, 'status_change', previousStatus, event.status, 'Automated intake complete');
  }

  /**
   * Moves event into active editorial review.
   */
  public assignToEditorialReview(event: WorldEvent, reviewerId: string, role: UserRole): void {
    if (role !== 'editor' && role !== 'admin') {
      throw new Error('Only editors or administrators can conduct editorial reviews');
    }

    const previousStatus = event.status;
    event.status = 'EDITORIAL_REVIEW';
    event.lastEditorialReviewAt = new Date().toISOString();
    this._logAction(event.id, reviewerId, 'status_change', previousStatus, event.status, 'Assigned to human editor');
  }

  /**
   * Approves and publishes an event following rigorous editorial review.
   */
  public approveAndPublish(
    event: WorldEvent,
    review: Omit<EditorialReview, 'reviewId' | 'reviewedAt'>,
    role: UserRole,
  ): EditorialReview {
    if (role !== 'editor' && role !== 'admin') {
      throw new Error('Unauthorized: only an editor or administrator can publish an event');
    }

    const assessment = verificationPipeline.evaluateEvent(event);
    if (assessment.isSensitive && !review.ethicsChecklistPassed) {
      throw new Error('Publication rejected: sensitive event failed ethics & non-gamification checklist');
    }

    const reviewId = `rev_${event.id}_${Date.now()}`;
    const fullReview: EditorialReview = {
      ...review,
      reviewId,
      reviewedAt: new Date().toISOString(),
    };
    this.reviews.set(reviewId, fullReview);

    const previousStatus = event.status;
    event.status = 'PUBLISHED';
    event.publishedAt = new Date().toISOString();
    event.lastUpdatedAt = event.publishedAt;
    event.lastEditorialReviewAt = event.publishedAt;
    event.confidenceRating = assessment.overallConfidence;

    this._logAction(
      event.id,
      review.reviewerId,
      'status_change',
      previousStatus,
      event.status,
      `Published with review: ${review.rationale}`,
    );

    return fullReview;
  }

  /**
   * Issues a formal, transparent correction on a published event.
   */
  public issueCorrection(
    event: WorldEvent,
    correction: {
      explanation: string;
      affectedFields: string[];
      correctedHeadline?: string;
      correctedSummary?: string;
      editorialSignoff: string;
    },
    role: UserRole,
  ): EventCorrection {
    if (role !== 'editor' && role !== 'admin') {
      throw new Error('Unauthorized: only an editor or admin can issue corrections');
    }

    const correctionId = `corr_${event.id}_${Date.now()}`;
    const record: EventCorrection = {
      correctionId,
      appliedAt: new Date().toISOString(),
      previousHeadline: event.title,
      correctedHeadline: correction.correctedHeadline,
      explanation: correction.explanation,
      affectedFields: correction.affectedFields,
      editorialSignoff: correction.editorialSignoff,
    };

    if (correction.correctedHeadline) {
      event.title = correction.correctedHeadline;
    }
    if (correction.correctedSummary) {
      event.shortSummary = correction.correctedSummary;
    }

    event.corrections.push(record);
    event.currentVersion += 1;
    event.lastUpdatedAt = record.appliedAt;
    const previousStatus = event.status;
    event.status = 'CORRECTED';

    this._logAction(
      event.id,
      correction.editorialSignoff,
      'correct',
      previousStatus,
      event.status,
      `Correction issued: ${correction.explanation}`,
    );

    return record;
  }

  /**
   * Archives or retires an event when superseded or stale.
   */
  public archiveEvent(event: WorldEvent, actorId: string, rationale: string, role: UserRole): void {
    if (role !== 'editor' && role !== 'admin') {
      throw new Error('Unauthorized to archive events');
    }

    const previousStatus = event.status;
    event.status = 'ARCHIVED';
    event.freshnessCategory = 'ARCHIVED_HISTORICAL';
    event.lastUpdatedAt = new Date().toISOString();

    this._logAction(event.id, actorId, 'archive', previousStatus, event.status, rationale);
  }

  public getAuditLogsForEvent(eventId: string): EditorialAuditLog[] {
    return this.auditLogs.filter((log) => log.eventId === eventId);
  }

  public getAllAuditLogs(): EditorialAuditLog[] {
    return [...this.auditLogs];
  }

  private _logAction(
    eventId: string,
    actorId: string,
    action: EditorialAuditLog['action'],
    previousStatus: EventLifecycleStatus | undefined,
    newStatus: EventLifecycleStatus | undefined,
    comment: string,
  ): void {
    this.auditLogs.push({
      logId: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      eventId,
      actorId,
      action,
      previousStatus,
      newStatus,
      comment,
      timestamp: new Date().toISOString(),
    });
  }
}

export const editorialWorkflow = new EditorialWorkflow();
