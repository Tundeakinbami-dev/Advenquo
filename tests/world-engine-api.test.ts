/**
 * Advenquo Global Live World Engine: API & Service Boundaries Unit Tests
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';

import { worldEngineApi } from '../src/live-world/service/world-engine-api.js';
import { bootstrapLiveWorldEngine } from '../src/live-world/bootstrap.js';

describe('World Engine API & Service Boundaries', () => {
  before(async () => {
    await bootstrapLiveWorldEngine();
  });

  it('GET /api/v1/world-now returns active published events with pagination', () => {
    const response = worldEngineApi.getFeed({ limit: 10, offset: 0 });
    assert.ok(response.total > 0, 'Feed must return events');
    assert.ok(response.events.length <= 10, 'Must respect limit pagination');

    for (const event of response.events) {
      assert.ok(event.id);
      assert.ok(event.title.length > 5);
      assert.ok(event.sources.length >= 1, 'Must have at least one sourced citation');
      assert.ok(['PUBLISHED', 'UPDATED', 'CORRECTED', 'DISPUTED'].includes(event.status));
    }
  });

  it('GET /api/v1/world-now filters accurately by topic', () => {
    const transitResponse = worldEngineApi.getFeed({ topic: 'economy_business' });
    for (const e of transitResponse.events) {
      assert.strictEqual(e.topic, 'economy_business');
    }
  });

  it('GET /api/v1/world-now filters accurately by keyword search', () => {
    const searchResponse = worldEngineApi.getFeed({ searchQuery: 'Blue Line' });
    assert.ok(searchResponse.events.length >= 1, 'Must find Blue Line event');
    assert.ok(
      searchResponse.events[0].title.includes('Blue Line') ||
        searchResponse.events[0].shortSummary.includes('Blue Line'),
    );
  });

  it('GET /api/v1/world-now/map returns geographic markers with exact coordinates and topic metadata', () => {
    const markers = worldEngineApi.getMapMarkers();
    assert.ok(markers.length >= 1, 'Must return map markers');

    for (const m of markers) {
      assert.ok(m.eventId);
      assert.ok(m.title);
      assert.ok(Array.isArray(m.coordinates) && m.coordinates.length === 2);
      assert.ok(typeof m.coordinates[0] === 'number' && typeof m.coordinates[1] === 'number');
      assert.ok(m.country);
    }
  });

  it('GET /api/v1/world-now/topics returns counts for each active category', () => {
    const stats = worldEngineApi.getTopicStats();
    assert.ok(typeof stats.economy_business === 'number');
    assert.ok(typeof stats.environment_climate === 'number');
    assert.ok(typeof stats.protests_civic === 'number');
  });

  it('POST /api/v1/world-now/:eventId/report records player feedback without collecting personal PII', () => {
    const feed = worldEngineApi.getFeed();
    const eventId = feed.events[0].id;

    const report = worldEngineApi.submitReport(
      eventId,
      'factual_inaccuracy',
      'The train timetable was updated last night.',
    );

    assert.ok(report.reportId);
    assert.strictEqual(report.eventId, eventId);
    assert.strictEqual(report.status, 'pending');

    const reports = worldEngineApi.getReports();
    assert.ok(reports.some((r) => r.reportId === report.reportId));
  });

  it('manages player followed topics and notification preferences locally and privately', () => {
    const follows = worldEngineApi.getPlayerFollows();
    assert.ok(Array.isArray(follows.followedTopics));

    const updated = worldEngineApi.updatePlayerFollows({
      followedTopics: ['environment_climate', 'science_technology'],
      followedRegions: ['NG', 'KE'],
    });

    assert.deepStrictEqual(updated.followedTopics, ['environment_climate', 'science_technology']);
    assert.deepStrictEqual(updated.followedRegions, ['NG', 'KE']);

    const prefs = worldEngineApi.updateNotificationPreferences({
      enabled: false,
    });
    assert.strictEqual(prefs.enabled, false);
  });
});
