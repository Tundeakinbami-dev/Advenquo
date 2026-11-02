/**
 * Advenquo Global Live World Engine: Ingestion & Source Registry Unit Tests
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { sourceRegistry, SourceRegistry } from '../src/live-world/source-registry.js';
import { ingestionService } from '../src/live-world/ingestion/ingestion-service.js';
import {
  computeContentHash,
  parseCanonicalDate,
  sanitizeHtml,
} from '../src/live-world/intelligence/normalizer.js';

describe('Source Registry & Ingestion Pipeline', () => {
  it('initializes with credible, lawful sources across international, government, and emergency sectors', () => {
    const sources = sourceRegistry.getAllSources();
    assert.ok(sources.length >= 5, 'Must contain at least 5 registered sources');

    for (const src of sources) {
      assert.ok(src.sourceId, 'Source must have an ID');
      assert.ok(src.organizationName, 'Must declare organization name');
      assert.ok(src.reliabilityScore >= 0.8, 'Credible sources must have reliability score >= 0.8');
      assert.ok(src.licensingAttribution.attributionText.length > 5, 'Must provide attribution text');
      assert.ok(src.rateLimitPerMinute > 0, 'Rate limit must be configured');
      assert.strictEqual(src.healthStatus, 'healthy', 'Initial health status should be healthy');
    }
  });

  it('updates source health status and tracks consecutive failure backoff', () => {
    const customRegistry = new SourceRegistry();
    const testSourceId = 'src_lamata_official';

    // Simulate 1 failure
    customRegistry.updateHealth(testSourceId, 'degraded', false);
    let src = customRegistry.getSource(testSourceId);
    assert.strictEqual(src?.consecutiveFailures, 1);
    assert.strictEqual(src?.healthStatus, 'degraded');

    // Simulate 3 failures -> becomes unreachable
    customRegistry.updateHealth(testSourceId, 'degraded', false);
    customRegistry.updateHealth(testSourceId, 'degraded', false);
    src = customRegistry.getSource(testSourceId);
    assert.strictEqual(src?.consecutiveFailures, 3);
    assert.strictEqual(src?.healthStatus, 'unreachable');

    // Recovery
    customRegistry.updateHealth(testSourceId, 'healthy', true);
    src = customRegistry.getSource(testSourceId);
    assert.strictEqual(src?.consecutiveFailures, 0);
    assert.strictEqual(src?.healthStatus, 'healthy');
  });

  it('executes ingestion run, logs provenance, and deduplicates identical items by content hash', async () => {
    ingestionService.resetStores();

    const result = await ingestionService.ingestSource('src_lamata_official');
    assert.strictEqual(result.run.status, 'success');
    assert.ok(result.run.documentsFetched > 0, 'Must have fetched documents');
    assert.strictEqual(result.run.newDocumentsCount, result.newDocuments.length);

    // Re-running ingestion on identical items should produce 0 new documents due to content hash deduplication
    const repeatResult = await ingestionService.ingestSource('src_lamata_official');
    assert.strictEqual(repeatResult.run.status, 'success');
    assert.strictEqual(repeatResult.newDocuments.length, 0, 'Duplicate content must not be ingested twice');
  });

  it('sanitizes untrusted text and strips dangerous HTML, iframes, and scripts', () => {
    const maliciousInput =
      '<h3>Headline</h3><script>alert("hack")</script><iframe src="evil.com"></iframe>Clean summary &amp; context.';
    const sanitized = sanitizeHtml(maliciousInput);
    assert.strictEqual(sanitized, 'Headline Clean summary & context.');
  });

  it('standardizes diverse date formats into canonical UTC ISO 8601 strings', () => {
    const rfcDate = 'Mon, 25 Oct 2026 14:30:00 GMT';
    const canonical = parseCanonicalDate(rfcDate);
    assert.match(canonical, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

    const isoDate = '2026-10-25T14:30:00Z';
    assert.strictEqual(parseCanonicalDate(isoDate), '2026-10-25T14:30:00.000Z');
  });

  it('generates consistent content hashes for deterministic deduplication', () => {
    const textA = 'Lagos Electric Blue Line Transit Expansion 2026';
    const textB = 'Lagos Electric Blue Line Transit Expansion 2026';
    const textC = 'Different text entirely';

    assert.strictEqual(computeContentHash(textA), computeContentHash(textB));
    assert.notStrictEqual(computeContentHash(textA), computeContentHash(textC));
  });
});
