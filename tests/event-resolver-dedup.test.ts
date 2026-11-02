/**
 * Advenquo Global Live World Engine: Event Resolver & Deduplication Tests
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateJaccardSimilarity,
  EventResolver,
  extractKeywords,
  locationsMatch,
} from '../src/live-world/intelligence/event-resolver.js';
import type { EventLocation, SourceDocument } from '../src/live-world/types.js';

describe('Event Resolver & Deduplication Pipeline', () => {
  let resolver: EventResolver;

  beforeEach(() => {
    resolver = new EventResolver();
  });

  it('correctly calculates keyword stem tokens and Jaccard similarity', () => {
    const textA = 'Lagos Electric Blue Line passenger rail expansion in Marina';
    const textB = 'Electric rail expansion for Blue Line commuters in Marina Lagos';
    const textC = 'Desertification agroforestry planting across northern Senegal';

    const tokensA = extractKeywords(textA);
    const tokensB = extractKeywords(textB);
    const tokensC = extractKeywords(textC);

    const simAB = calculateJaccardSimilarity(tokensA, tokensB);
    const simAC = calculateJaccardSimilarity(tokensA, tokensC);

    assert.ok(simAB > 0.6, `Expected high similarity between related transit reports, got ${simAB}`);
    assert.ok(simAC < 0.1, `Expected low similarity between transit and forestry, got ${simAC}`);
  });

  it('enforces geographic matching boundaries to prevent false merges across cities', () => {
    const lagosLoc: EventLocation = {
      country: 'Nigeria',
      countryCode: 'NG',
      region: 'South West',
      city: 'Lagos',
      coordinates: [6.455, 3.394],
      locationConfidence: 'exact',
    };

    const nairobiLoc: EventLocation = {
      country: 'Kenya',
      countryCode: 'KE',
      region: 'Nairobi County',
      city: 'Nairobi',
      coordinates: [-1.286, 36.817],
      locationConfidence: 'exact',
    };

    const lagosMarinaLoc: EventLocation = {
      country: 'Nigeria',
      countryCode: 'NG',
      region: 'Lagos Island',
      city: 'Lagos',
      coordinates: [6.451, 3.388],
      locationConfidence: 'exact',
    };

    assert.strictEqual(locationsMatch(lagosLoc, lagosMarinaLoc), true, 'Same city locations must match');
    assert.strictEqual(locationsMatch(lagosLoc, nairobiLoc), false, 'Different countries must not match');
  });

  it('groups multiple reports about the same event into one WorldEvent with multi-source attribution', () => {
    const doc1: SourceDocument = {
      documentId: 'doc_1',
      sourceId: 'src_lamata_official',
      fetchRunId: 'run_1',
      externalGuid: 'guid_1',
      url: 'https://lamata-ng.com/release-1',
      title: 'LAMATA Deploys Four Electric Train Sets on Blue Line Viaduct',
      cleanText:
        'Lagos Metropolitan Area Transport Authority officially deployed four new electric multiple units on the Blue Line rail between Marina and Mile 2.',
      publishedAt: '2026-10-25T10:00:00Z',
      retrievedAt: '2026-10-25T10:05:00Z',
      contentHash: 'hash_1',
      language: 'en',
      extractedEntities: { people: [], organizations: ['LAMATA'], places: ['Lagos', 'Marina'], dates: [] },
      detectedTopics: ['economy_business', 'environment_climate'],
      promptInjectionScore: 0.0,
      sanitized: true,
    };

    const doc2: SourceDocument = {
      documentId: 'doc_2',
      sourceId: 'src_wire_syndicate',
      fetchRunId: 'run_2',
      externalGuid: 'guid_2',
      url: 'https://verifiedwire.org/lagos-trains',
      title: 'Electric Train Fleet Scaled on Lagos Blue Line Viaduct Between Marina and Mile 2',
      cleanText:
        'Commuters in Lagos welcomed the addition of four electric trains on the elevated Blue Line rail corridor today, cutting wait times at Marina.',
      publishedAt: '2026-10-25T11:00:00Z',
      retrievedAt: '2026-10-25T11:05:00Z',
      contentHash: 'hash_2',
      language: 'en',
      extractedEntities: { people: [], organizations: [], places: ['Lagos', 'Marina'], dates: [] },
      detectedTopics: ['economy_business'],
      promptInjectionScore: 0.0,
      sanitized: true,
    };

    const res1 = resolver.resolveDocument(doc1);
    assert.strictEqual(res1.isNewEvent, true, 'First report should create new event');
    assert.strictEqual(resolver.getAllEvents().length, 1);

    const res2 = resolver.resolveDocument(doc2);
    assert.strictEqual(res2.isNewEvent, false, 'Second report on same event must be merged');
    assert.strictEqual(resolver.getAllEvents().length, 1, 'Total event count must remain 1');

    const event = res2.event;
    assert.strictEqual(event.sources.length, 2, 'Event must retain both source citations');
    assert.ok(event.sources.some((s) => s.sourceId === 'src_lamata_official'));
    assert.ok(event.sources.some((s) => s.sourceId === 'src_wire_syndicate'));
  });

  it('separates genuinely distinct events that share similar keywords in different cities', () => {
    const docLagos: SourceDocument = {
      documentId: 'doc_lagos',
      sourceId: 'src_wire_syndicate',
      fetchRunId: 'run_lagos',
      externalGuid: 'guid_lagos',
      url: 'https://verifiedwire.org/lagos-buses',
      title: 'Lagos Rolls Out 50 Electric Commuter Buses Across Mainland Corridors',
      cleanText:
        'The state transit authority in Lagos announced 50 zero-emission electric buses for suburban commuters.',
      publishedAt: '2026-10-24T09:00:00Z',
      retrievedAt: '2026-10-24T09:05:00Z',
      contentHash: 'hash_lagos',
      language: 'en',
      extractedEntities: { people: [], organizations: [], places: ['Lagos'], dates: [] },
      detectedTopics: ['economy_business'],
      promptInjectionScore: 0.0,
      sanitized: true,
    };

    const docNairobi: SourceDocument = {
      documentId: 'doc_nairobi',
      sourceId: 'src_wire_syndicate',
      fetchRunId: 'run_nairobi',
      externalGuid: 'guid_nairobi',
      url: 'https://verifiedwire.org/nairobi-buses',
      title: 'Nairobi Rolls Out 50 Electric Commuter Buses Across Mainland Corridors',
      cleanText:
        'The metropolitan transport authority in Nairobi announced 50 zero-emission electric buses for suburban commuters in Kenya.',
      publishedAt: '2026-10-24T09:00:00Z',
      retrievedAt: '2026-10-24T09:05:00Z',
      contentHash: 'hash_nairobi',
      language: 'en',
      extractedEntities: { people: [], organizations: [], places: ['Nairobi, Kenya'], dates: [] },
      detectedTopics: ['economy_business'],
      promptInjectionScore: 0.0,
      sanitized: true,
    };

    const res1 = resolver.resolveDocument(docLagos);
    const res2 = resolver.resolveDocument(docNairobi);

    assert.strictEqual(res1.isNewEvent, true);
    assert.strictEqual(res2.isNewEvent, true, 'Nairobi bus event must not merge with Lagos bus event');
    assert.strictEqual(resolver.getAllEvents().length, 2, 'Must maintain 2 separate events');
  });

  it('detects materially new updates and increments event version while logging update timeline', () => {
    const docInitial: SourceDocument = {
      documentId: 'doc_init',
      sourceId: 'src_lamata_official',
      fetchRunId: 'run_init',
      externalGuid: 'guid_init',
      url: 'https://lamata-ng.com/study',
      title: 'Feasibility Study Initiated on Lagoon Maritime Ferry Interchanges',
      cleanText: 'Preliminary engineering studies have begun on Marina ferry terminals.',
      publishedAt: '2026-10-20T08:00:00Z',
      retrievedAt: '2026-10-20T08:05:00Z',
      contentHash: 'hash_init',
      language: 'en',
      extractedEntities: { people: [], organizations: [], places: ['Lagos', 'Marina'], dates: [] },
      detectedTopics: ['economy_business'],
      promptInjectionScore: 0.0,
      sanitized: true,
    };

    const docUpdate: SourceDocument = {
      documentId: 'doc_upd',
      sourceId: 'src_lamata_official',
      fetchRunId: 'run_upd',
      externalGuid: 'guid_upd',
      url: 'https://lamata-ng.com/breakground',
      title: 'UPDATE: Construction Contract Formally Awarded for Marina Ferry Terminal Viaduct',
      cleanText:
        'Substantial new construction milestone reached: formal engineering tender awarded to consortium with steel foundation piling beginning next Monday at Marina.',
      publishedAt: '2026-10-22T14:00:00Z',
      retrievedAt: '2026-10-22T14:05:00Z',
      contentHash: 'hash_upd',
      language: 'en',
      extractedEntities: { people: [], organizations: [], places: ['Lagos', 'Marina'], dates: [] },
      detectedTopics: ['economy_business'],
      promptInjectionScore: 0.0,
      sanitized: true,
    };

    const res1 = resolver.resolveDocument(docInitial);
    assert.strictEqual(res1.event.currentVersion, 1);

    const res2 = resolver.resolveDocument(docUpdate);
    assert.strictEqual(res2.isMaterialUpdate, true, 'Must detect material new update');
    assert.strictEqual(res2.event.currentVersion, 2, 'Version must increment to 2');
    assert.ok(res2.event.updatesTimeline.length >= 2, 'Must record new timeline entry');
  });
});
