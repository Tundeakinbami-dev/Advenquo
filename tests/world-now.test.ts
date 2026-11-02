/**
 * Advenquo: World Now Editorial Integrity Unit Tests
 *
 * Verifies that all contemporary stories have authentic source citations,
 * dated editorial approvals, verified publication statuses, and valid mission bindings.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { WORLD_NOW_STORIES } from '../src/game/world-now-data.js';
import { MISSIONS } from '../src/game/missions-data.js';

describe('World Now Editorial System', () => {
  it('contains verified contemporary stories', () => {
    assert.ok(WORLD_NOW_STORIES.length >= 3, 'Must contain at least 3 curated stories');
  });

  it('enforces verified metadata and publication statuses on every story', () => {
    for (const story of WORLD_NOW_STORIES) {
      assert.ok(story.id, 'Story must have an ID');
      assert.ok(story.headline.length > 10, 'Story headline must be substantive');
      assert.ok(story.summary.length > 30, 'Story summary must be substantive');
      assert.strictEqual(story.status, 'PUBLISHED', 'Published stories must have PUBLISHED status');
      assert.strictEqual(story.verificationLevel, 'VERIFIED_FACT', 'Fact stories must have VERIFIED_FACT level');

      // Check dates
      assert.match(story.publishedAt, /^\d{4}-\d{2}-\d{2}$/, 'publishedAt must be YYYY-MM-DD');
      assert.match(story.verifiedAt, /^\d{4}-\d{2}-\d{2}$/, 'verifiedAt must be YYYY-MM-DD');
      assert.match(story.editorialReviewAt, /^\d{4}-\d{2}-\d{2}$/, 'editorialReviewAt must be YYYY-MM-DD');

      // Check source citation
      assert.ok(story.publisher.length > 2, 'Publisher must be declared');
      assert.ok(story.sourceUrl.startsWith('https://'), 'Source URL must be valid HTTPS');

      // Check factual highlights
      assert.ok(story.factualHighlights.length >= 2, 'Must have at least 2 factual highlights');
    }
  });

  it('validates that story-linked missions connect to real, authored missions', () => {
    const validMissionIds = new Set(MISSIONS.map((m) => m.id));

    for (const story of WORLD_NOW_STORIES) {
      if (story.linkedMissionId) {
        assert.ok(
          validMissionIds.has(story.linkedMissionId),
          `Story ${story.id} linked mission ${story.linkedMissionId} must exist in MISSIONS`,
        );
      }
    }
  });
});
