/**
 * Advenquo Global Live World Engine: Verification & Editorial Workflow Tests
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { editorialWorkflow } from '../src/live-world/editorial/editorial-workflow.js';
import { verificationPipeline } from '../src/live-world/intelligence/verification-pipeline.js';
import type { WorldEvent } from '../src/live-world/types.js';

function createStubEvent(overrides: Partial<WorldEvent> = {}): WorldEvent {
  return {
    id: `evt_test_${Date.now()}`,
    currentVersion: 1,
    title: 'Lagos Mass Transit Blue Line Operational Fleet Expansion',
    shortSummary: 'Electric rail trains deployed on elevated coastal viaduct.',
    inDepthContext: 'Detailed engineering records confirm zero direct emissions and independent captive power.',
    topic: 'economy_business',
    location: {
      country: 'Nigeria',
      countryCode: 'NG',
      region: 'South West',
      city: 'Lagos',
      coordinates: [6.455, 3.394],
      locationConfidence: 'exact',
    },
    status: 'DISCOVERED',
    firstObservedAt: '2026-10-25T10:00:00Z',
    lastUpdatedAt: '2026-10-25T10:00:00Z',
    freshnessCategory: 'BREAKING',
    confidenceRating: 'ATTRIBUTED_DEVELOPING',
    sources: [
      {
        sourceId: 'src_lamata_official',
        sourceName: 'LAMATA Official Wire',
        publisher: 'Lagos Metropolitan Area Transport Authority',
        url: 'https://lamata-ng.com/press-1',
        publishedAt: '2026-10-25T10:00:00Z',
        retrievedAt: '2026-10-25T10:05:00Z',
        licenseText: 'Official Government Citation',
        isLeadSource: true,
      },
    ],
    claims: [
      {
        claimId: 'claim_1',
        statement: 'Four new electric train sets deployed to Blue Line corridor',
        category: 'OFFICIAL_STATEMENT',
        attributedTo: 'LAMATA Managing Director',
        corroborationCount: 1,
        evidence: [
          {
            evidenceId: 'evi_1',
            sourceDocumentId: 'doc_1',
            sourceId: 'src_lamata_official',
            sourceName: 'LAMATA Official Wire',
            sourceUrl: 'https://lamata-ng.com/press-1',
            quoteSnippet: 'Four electric train sets deployed',
            publishedAt: '2026-10-25T10:00:00Z',
            isPrimarySource: true,
          },
        ],
        confidenceScore: 0.95,
      },
    ],
    updatesTimeline: [],
    corrections: [],
    unresolvedQuestions: [],
    tags: ['transit', 'lagos', 'clean energy'],
    ...overrides,
  };
}

describe('Verification & Editorial Lifecycle Workflow', () => {
  it('enforces sequential status transitions: DISCOVERED -> AWAITING_VALIDATION -> EDITORIAL_REVIEW -> PUBLISHED', () => {
    const event = createStubEvent();
    assert.strictEqual(event.status, 'DISCOVERED');

    // Step 1: Submit for validation
    editorialWorkflow.submitForValidation(event, 'system');
    assert.strictEqual(event.status, 'AWAITING_VALIDATION');

    // Step 2: Assign to human reviewer
    editorialWorkflow.assignToEditorialReview(event, 'editor_ada', 'editor');
    assert.strictEqual(event.status, 'EDITORIAL_REVIEW');
    assert.ok(event.lastEditorialReviewAt);

    // Step 3: Approve and publish
    const review = editorialWorkflow.approveAndPublish(
      event,
      {
        reviewerId: 'editor_ada',
        decision: 'approve',
        rationale: 'Primary official release corroborates fleet delivery specifications.',
        confidenceAssessment: 'high',
        ethicsChecklistPassed: true,
      },
      'editor',
    );

    assert.strictEqual(event.status, 'PUBLISHED');
    assert.strictEqual(event.confidenceRating, 'VERIFIED_FACT');
    assert.ok(event.publishedAt);
    assert.strictEqual(review.decision, 'approve');

    // Audit logs recorded
    const logs = editorialWorkflow.getAuditLogsForEvent(event.id);
    assert.ok(logs.length >= 3, 'Must record audit log for each state transition');
  });

  it('prohibits unauthorized roles from approving or publishing content', () => {
    const event = createStubEvent({ status: 'EDITORIAL_REVIEW' });

    assert.throws(
      () => {
        editorialWorkflow.approveAndPublish(
          event,
          {
            reviewerId: 'unauthorized_reader',
            decision: 'approve',
            rationale: 'Looks good to me',
            confidenceAssessment: 'medium',
            ethicsChecklistPassed: true,
          },
          'reader', // Unauthorized role
        );
      },
      /Unauthorized/,
      'Reader role must not be permitted to publish events',
    );
  });

  it('detects sensitive categories (protests, public demonstration) and enforces ethics checklist', () => {
    const protestEvent = createStubEvent({
      topic: 'protests_civic',
      title: 'Clean Water Civic Demonstration Held at Municipal Headquarters',
      status: 'EDITORIAL_REVIEW',
    });

    const assessment = verificationPipeline.evaluateEvent(protestEvent);
    assert.strictEqual(assessment.isSensitive, true);
    assert.strictEqual(assessment.requiresHumanReview, true);

    // Attempting publication without ethics checklist passed must throw
    assert.throws(
      () => {
        editorialWorkflow.approveAndPublish(
          protestEvent,
          {
            reviewerId: 'editor_ada',
            decision: 'approve',
            rationale: 'Sensitive protest report',
            confidenceAssessment: 'high',
            ethicsChecklistPassed: false, // Failed ethics checklist
          },
          'editor',
        );
      },
      /ethics & non-gamification checklist/,
      'Must reject publication if ethics checklist fails on sensitive story',
    );
  });

  it('issues transparent corrections, updates headline, increments version, and logs audit record', () => {
    const event = createStubEvent({
      status: 'PUBLISHED',
      title: 'Preliminary Report Claims Temporary Ferry Route Closure',
      currentVersion: 1,
    });

    const correction = editorialWorkflow.issueCorrection(
      event,
      {
        correctedHeadline: 'CORRECTION: LASWA Confirms Ferry Services Operating on Normal Schedule',
        explanation: 'Initial reports erroneously cited unscheduled maintenance; LASWA official release confirmed full catamaran service.',
        affectedFields: ['title', 'shortSummary'],
        editorialSignoff: 'Editor-in-Chief K. Adeleke',
      },
      'editor',
    );

    assert.strictEqual(event.status, 'CORRECTED');
    assert.strictEqual(event.currentVersion, 2, 'Version must increment on correction');
    assert.strictEqual(event.title, 'CORRECTION: LASWA Confirms Ferry Services Operating on Normal Schedule');
    assert.strictEqual(event.corrections.length, 1);
    assert.strictEqual(event.corrections[0].correctionId, correction.correctionId);

    const auditLogs = editorialWorkflow.getAuditLogsForEvent(event.id);
    assert.ok(auditLogs.some((l) => l.action === 'correct'));
  });
});
