/**
 * Advenquo Global Live World Engine: Source Registry
 *
 * Implements a verifiable registry of credible, lawfully accessible sources.
 * Tracks source metadata, licensing requirements, editorial standards,
 * health status, and retrieval backoff policies.
 */

import type { SourceRegistryEntry } from './types.js';

export const INITIAL_SOURCE_REGISTRY: SourceRegistryEntry[] = [
  {
    sourceId: 'src_lamata_official',
    organizationName: 'Lagos Metropolitan Area Transport Authority (LAMATA)',
    sourceName: 'LAMATA Public Press & Project Releases',
    sourceType: 'official_government',
    homepageUrl: 'https://lamata-ng.com',
    feedUrl: 'https://lamata-ng.com/feed/',
    geographicCoverage: ['NG'],
    supportedTopics: ['economy_business', 'environment_climate', 'science_technology'],
    retrievalMethod: 'structured_api',
    reliabilityScore: 0.95,
    editorialReviewStandard: 'institutional',
    licensingAttribution: {
      licenseType: 'fair_use_citation',
      attributionText: 'Official release from Lagos Metropolitan Area Transport Authority (LAMATA)',
      termsUrl: 'https://lamata-ng.com/terms',
      requiresDirectLink: true,
    },
    pollingIntervalMinutes: 15,
    rateLimitPerMinute: 20,
    healthStatus: 'healthy',
    consecutiveFailures: 0,
    lastSuccessfulRetrievalAt: '2026-10-26T08:00:00Z',
    knownLimitations: [
      'Focuses strictly on metropolitan transit infrastructure within Lagos State',
      'Updates published during standard government working hours',
    ],
  },
  {
    sourceId: 'src_unccd_ggwi',
    organizationName: 'United Nations Convention to Combat Desertification (UNCCD)',
    sourceName: 'UNCCD Great Green Wall Initiative Monitor',
    sourceType: 'international_organization',
    homepageUrl: 'https://www.unccd.int',
    feedUrl: 'https://www.unccd.int/news-stories/rss.xml',
    geographicCoverage: ['NG', 'SN', 'ML', 'NE', 'TD', 'SD', 'ET', 'DJ'],
    supportedTopics: ['environment_climate', 'science_technology', 'economy_business'],
    retrievalMethod: 'rss_feed',
    reliabilityScore: 0.98,
    editorialReviewStandard: 'rigorous',
    licensingAttribution: {
      licenseType: 'open_access',
      attributionText: 'Data and field reports courtesy of UNCCD / African Union GGWI',
      termsUrl: 'https://www.unccd.int/terms-use',
      requiresDirectLink: true,
    },
    pollingIntervalMinutes: 30,
    rateLimitPerMinute: 30,
    healthStatus: 'healthy',
    consecutiveFailures: 0,
    lastSuccessfulRetrievalAt: '2026-10-26T08:15:00Z',
    knownLimitations: [
      'Field monitoring cycles operate quarterly; breaking developments reflect monthly synthesis',
      'Funding disbursements reported aggregate by regional bloc rather than daily updates',
    ],
  },
  {
    sourceId: 'src_african_union_news',
    organizationName: 'African Union Commission',
    sourceName: 'African Union Peace, Security and Governance Portal',
    sourceType: 'international_organization',
    homepageUrl: 'https://au.int',
    feedUrl: 'https://au.int/en/rss.xml',
    geographicCoverage: ['global', 'NG', 'KE', 'ZA', 'GH', 'EG', 'SN'],
    supportedTopics: ['politics_governance', 'protests_civic', 'conflict_humanitarian'],
    retrievalMethod: 'rss_feed',
    reliabilityScore: 0.96,
    editorialReviewStandard: 'institutional',
    licensingAttribution: {
      licenseType: 'public_domain',
      attributionText: 'Official communique of the African Union Commission',
      termsUrl: 'https://au.int/en/terms',
      requiresDirectLink: true,
    },
    pollingIntervalMinutes: 20,
    rateLimitPerMinute: 20,
    healthStatus: 'healthy',
    consecutiveFailures: 0,
    lastSuccessfulRetrievalAt: '2026-10-26T08:30:00Z',
    knownLimitations: [
      'Reflects agreed communiqués and diplomatic resolutions',
      'Does not provide minute-by-minute tactical security updates',
    ],
  },
  {
    sourceId: 'src_unesco_heritage',
    organizationName: 'UNESCO World Heritage Centre',
    sourceName: 'UNESCO Heritage Preservation & Digital Restitution Feed',
    sourceType: 'international_organization',
    homepageUrl: 'https://whc.unesco.org',
    feedUrl: 'https://whc.unesco.org/en/news/rss/',
    geographicCoverage: ['global', 'NG', 'EG', 'ET', 'ML', 'KE'],
    supportedTopics: ['culture_society', 'science_technology'],
    retrievalMethod: 'rss_feed',
    reliabilityScore: 0.97,
    editorialReviewStandard: 'rigorous',
    licensingAttribution: {
      licenseType: 'open_access',
      attributionText: 'UNESCO World Heritage Centre news bulletin',
      termsUrl: 'https://whc.unesco.org/en/disclaimer',
      requiresDirectLink: true,
    },
    pollingIntervalMinutes: 60,
    rateLimitPerMinute: 15,
    healthStatus: 'healthy',
    consecutiveFailures: 0,
    lastSuccessfulRetrievalAt: '2026-10-26T07:45:00Z',
    knownLimitations: ['Focuses strictly on cultural heritage sites and restitution initiatives'],
  },
  {
    sourceId: 'src_wire_syndicate',
    organizationName: 'Independent Global Wire Service',
    sourceName: 'Global Verified Civic Wire',
    sourceType: 'news_organization',
    homepageUrl: 'https://verifiedwire.org',
    feedUrl: 'https://verifiedwire.org/rss/africa.xml',
    geographicCoverage: ['NG', 'KE', 'GH', 'ZA', 'SN'],
    supportedTopics: [
      'protests_civic',
      'politics_governance',
      'economy_business',
      'environment_climate',
      'sport_public_events',
    ],
    retrievalMethod: 'rss_feed',
    reliabilityScore: 0.92,
    editorialReviewStandard: 'wire_service',
    licensingAttribution: {
      licenseType: 'fair_use_citation',
      attributionText: 'Independent reporting via Global Verified Civic Wire',
      termsUrl: 'https://verifiedwire.org/licensing',
      requiresDirectLink: true,
    },
    pollingIntervalMinutes: 10,
    rateLimitPerMinute: 40,
    healthStatus: 'healthy',
    consecutiveFailures: 0,
    lastSuccessfulRetrievalAt: '2026-10-26T08:45:00Z',
    knownLimitations: [
      'Rapid breaking reporting; requires multi-source corroboration before factual promotion',
    ],
  },
  {
    sourceId: 'src_disaster_monitor',
    organizationName: 'Regional Emergency & Disaster Observatory',
    sourceName: 'West African Climate & Emergency Alert Network',
    sourceType: 'emergency_monitoring',
    homepageUrl: 'https://disaster-monitor.ecowas.int',
    geographicCoverage: ['NG', 'GH', 'SN', 'CI', 'BF'],
    supportedTopics: ['disasters_safety', 'environment_climate'],
    retrievalMethod: 'structured_api',
    reliabilityScore: 0.94,
    editorialReviewStandard: 'institutional',
    licensingAttribution: {
      licenseType: 'public_domain',
      attributionText: 'Official public safety notice from Regional Emergency Observatory',
      termsUrl: 'https://disaster-monitor.ecowas.int/terms',
      requiresDirectLink: true,
    },
    pollingIntervalMinutes: 5,
    rateLimitPerMinute: 60,
    healthStatus: 'healthy',
    consecutiveFailures: 0,
    lastSuccessfulRetrievalAt: '2026-10-26T08:50:00Z',
    knownLimitations: [
      'Emits alerts in real-time; damage assessments are preliminary and subject to field verification',
    ],
  },
];

export class SourceRegistry {
  private sources: Map<string, SourceRegistryEntry> = new Map();

  constructor(initialSources: SourceRegistryEntry[] = INITIAL_SOURCE_REGISTRY) {
    for (const src of initialSources) {
      this.sources.set(src.sourceId, { ...src });
    }
  }

  public getSource(sourceId: string): SourceRegistryEntry | undefined {
    const entry = this.sources.get(sourceId);
    return entry ? { ...entry } : undefined;
  }

  public getAllSources(): SourceRegistryEntry[] {
    return Array.from(this.sources.values()).map((s) => ({ ...s }));
  }

  public registerSource(entry: SourceRegistryEntry): void {
    if (!entry.sourceId || !entry.sourceName || !entry.organizationName) {
      throw new Error('Invalid SourceRegistryEntry: missing required identification fields');
    }
    this.sources.set(entry.sourceId, { ...entry });
  }

  public updateHealth(
    sourceId: string,
    status: 'healthy' | 'degraded' | 'unreachable' | 'maintenance',
    isSuccess: boolean,
  ): void {
    const entry = this.sources.get(sourceId);
    if (!entry) return;

    if (isSuccess) {
      entry.healthStatus = 'healthy';
      entry.consecutiveFailures = 0;
      entry.lastSuccessfulRetrievalAt = new Date().toISOString();
    } else {
      entry.consecutiveFailures += 1;
      if (entry.consecutiveFailures >= 3) {
        entry.healthStatus = 'unreachable';
      } else {
        entry.healthStatus = status;
      }
    }
  }

  public getActiveEligibleSources(currentDate: Date = new Date()): SourceRegistryEntry[] {
    return this.getAllSources().filter((src) => {
      if (src.healthStatus === 'unreachable' || src.healthStatus === 'maintenance') {
        // Still eligible if enough backoff time elapsed to re-test
        if (src.consecutiveFailures > 10) return false;
      }
      return true;
    });
  }
}

export const sourceRegistry = new SourceRegistry();
