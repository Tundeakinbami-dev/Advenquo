/**
 * Advenquo Global Live World Engine: Domain Types & Data Contracts
 *
 * Implements strict, validated domain models for:
 * - Source registry, source adapters, fetch runs, and source documents
 * - Real-time world events, multi-source deduplication, and versions
 * - Evidence claims, corroboration, and sensitive event handling
 * - Controlled editorial lifecycles and transparent corrections
 * - Event-to-adventure bridges and Meta Quest VR representations
 */

import type { ChallengeLevel, MissionDefinition, SkillMastery } from '../game/types.js';

// ============================================================================
// 1. TOPIC & GEOGRAPHIC TAXONOMY
// ============================================================================

export type EventTopic =
  | 'protests_civic'
  | 'politics_governance'
  | 'conflict_humanitarian'
  | 'disasters_safety'
  | 'science_technology'
  | 'economy_business'
  | 'environment_climate'
  | 'culture_society'
  | 'sport_public_events';

export interface EventLocation {
  country: string;
  countryCode: string; // ISO 3166-1 alpha-2 (e.g., 'NG', 'KE', 'SN')
  region: string;
  city?: string;
  districtId?: string; // Links to Advenquo in-game district if available (e.g., 'isale_eko', 'yaba')
  coordinates: [number, number]; // [latitude, longitude]
  locationConfidence: 'exact' | 'approximate' | 'disputed' | 'unspecified';
}

// ============================================================================
// 2. SOURCE REGISTRY & INGESTION
// ============================================================================

export type SourceType =
  | 'news_organization'
  | 'official_government'
  | 'legislative_court'
  | 'international_organization'
  | 'scientific_institution'
  | 'emergency_monitoring'
  | 'environmental_monitoring'
  | 'community_civic';

export type RetrievalMethod = 'rss_feed' | 'structured_api' | 'event_stream' | 'curated_feed';

export interface SourceRegistryEntry {
  sourceId: string;
  organizationName: string;
  sourceName: string;
  sourceType: SourceType;
  homepageUrl: string;
  feedUrl?: string;
  geographicCoverage: string[]; // Countries or 'global'
  supportedTopics: EventTopic[];
  retrievalMethod: RetrievalMethod;
  reliabilityScore: number; // 0.0 to 1.0 based on editorial history & transparency
  editorialReviewStandard: 'rigorous' | 'institutional' | 'wire_service' | 'community';
  licensingAttribution: {
    licenseType: 'open_access' | 'fair_use_citation' | 'public_domain' | 'commercial_api';
    attributionText: string;
    termsUrl?: string;
    requiresDirectLink: boolean;
  };
  pollingIntervalMinutes: number;
  rateLimitPerMinute: number;
  healthStatus: 'healthy' | 'degraded' | 'unreachable' | 'maintenance';
  consecutiveFailures: number;
  lastSuccessfulRetrievalAt?: string; // ISO 8601 UTC
  knownLimitations: string[];
}

export interface SourceFetchRun {
  runId: string;
  sourceId: string;
  startedAt: string; // ISO 8601 UTC
  completedAt?: string;
  status: 'running' | 'success' | 'partial' | 'failed';
  documentsFetched: number;
  newDocumentsCount: number;
  errorMessage?: string;
}

export interface RawSourceItem {
  guid: string;
  title: string;
  content: string;
  url: string;
  publishedAt: string; // ISO 8601 UTC or raw string from source
  author?: string;
  categories?: string[];
  language?: string;
  rawPayload?: Record<string, unknown>;
}

export interface SourceDocument {
  documentId: string;
  sourceId: string;
  fetchRunId: string;
  externalGuid: string;
  url: string;
  title: string;
  cleanText: string;
  publishedAt: string; // ISO 8601 UTC
  retrievedAt: string; // ISO 8601 UTC
  contentHash: string; // SHA-256 or digest for deduplication
  language: string;
  extractedEntities: {
    people: string[];
    organizations: string[];
    places: string[];
    dates: string[];
  };
  detectedTopics: EventTopic[];
  promptInjectionScore: number; // 0.0 = safe, 1.0 = adversarial instruction detected
  sanitized: boolean;
}

// ============================================================================
// 3. EVENT LIFECYCLE & VERIFICATION
// ============================================================================

export type EventLifecycleStatus =
  | 'DISCOVERED'
  | 'AWAITING_VALIDATION'
  | 'EDITORIAL_REVIEW'
  | 'VERIFIED'
  | 'PUBLISHED'
  | 'UPDATED'
  | 'CORRECTED'
  | 'ARCHIVED'
  | 'DISPUTED'
  | 'REJECTED';

export type ClaimCategory =
  | 'CONFIRMED_FACT'
  | 'NAMED_PARTY_CLAIM'
  | 'INDEPENDENT_REPORTING'
  | 'OFFICIAL_STATEMENT'
  | 'ANALYSIS_INTERPRETATION'
  | 'UNVERIFIED_DEVELOPING'
  | 'DISPUTED';

export interface ClaimEvidence {
  evidenceId: string;
  sourceDocumentId: string;
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  quoteSnippet: string;
  publishedAt: string;
  isPrimarySource: boolean;
}

export interface EventClaim {
  claimId: string;
  statement: string;
  category: ClaimCategory;
  attributedTo?: string; // Name of person, committee, agency making claim
  corroborationCount: number;
  evidence: ClaimEvidence[];
  confidenceScore: number; // 0.0 - 1.0
  uncertaintyNotes?: string;
}

export interface EventUpdate {
  updateId: string;
  versionNumber: number;
  timestamp: string; // ISO 8601 UTC
  headline: string;
  summary: string;
  keyChanges: string[];
  newClaims: EventClaim[];
  sourceDocumentIds: string[];
}

export interface EventCorrection {
  correctionId: string;
  appliedAt: string; // ISO 8601 UTC
  previousHeadline?: string;
  correctedHeadline?: string;
  explanation: string;
  affectedFields: string[];
  editorialSignoff: string;
}

export interface EditorialReview {
  reviewId: string;
  reviewerId: string;
  reviewedAt: string; // ISO 8601 UTC
  decision: 'approve' | 'reject' | 'request_evidence' | 'flag_sensitive';
  rationale: string;
  confidenceAssessment: 'high' | 'medium' | 'provisional_developing';
  sensitivityFlag?: 'protest' | 'casualty' | 'election' | 'disaster' | 'standard';
  ethicsChecklistPassed: boolean; // Confirms no gamification of tragedy, no partisan steer
}

export interface EventSourceCitation {
  sourceId: string;
  sourceName: string;
  publisher: string;
  url: string;
  publishedAt: string;
  retrievedAt: string;
  licenseText: string;
  isLeadSource: boolean;
}

export interface WorldEvent {
  id: string; // Stable event ID (e.g., 'evt_lagos_transit_2026')
  currentVersion: number;
  title: string;
  shortSummary: string;
  inDepthContext: string;
  topic: EventTopic;
  location: EventLocation;
  status: EventLifecycleStatus;

  // Timestamps (All stored in UTC ISO 8601)
  eventOccurredAt?: string;
  firstObservedAt: string;
  publishedAt?: string;
  lastUpdatedAt: string;
  lastEditorialReviewAt?: string;

  // Freshness & Confidence separation
  freshnessCategory: 'BREAKING' | 'DEVELOPING' | 'STABLE' | 'ARCHIVED_HISTORICAL';
  confidenceRating: 'VERIFIED_FACT' | 'ATTRIBUTED_DEVELOPING' | 'HISTORICAL_RECORD' | 'DISPUTED';

  // Sourced intelligence
  sources: EventSourceCitation[];
  claims: EventClaim[];
  updatesTimeline: EventUpdate[];
  corrections: EventCorrection[];
  unresolvedQuestions: string[];

  // Sensitive category safeguards (e.g. protests)
  civicSafeguards?: {
    isPublicDemonstration: boolean;
    statedDemandsAttributed: { demand: string; attributedTo: string }[];
    officialResponseAttributed?: { response: string; attributedTo: string };
    participationEstimates?: { estimate: string; source: string; methodologyCaveat: string }[];
    neutralityAssurance: string;
  };

  // Connected adventure & educational bridge
  linkedAdventureId?: string;
  tags: string[];
}

// ============================================================================
// 4. EVENT-TO-ADVENTURE PIPELINE
// ============================================================================

export type AdventureSceneClassification =
  | 'FACTUAL_VISUALIZATION'
  | 'HISTORICAL_RECONSTRUCTION'
  | 'ILLUSTRATIVE_RECONSTRUCTION'
  | 'FICTIONAL_CONCEPT_SCENARIO'
  | 'HYPOTHETICAL_DECISION_EXERCISE';

export interface LiveAdventure {
  adventureId: string;
  eventId: string;
  version: string;
  title: string;
  educationalObjective: string;
  learningSkills: (keyof SkillMastery)[];
  difficulty: ChallengeLevel;
  sceneClassification: AdventureSceneClassification;
  factualBasisExplanation: string;
  nonGamificationPledge: string; // Confirms suffering/harm is not gamified
  missionDefinition: MissionDefinition;
  publishedAt: string;
}

// ============================================================================
// 5. USER PREFERENCES, PRIVACY & REPORTING
// ============================================================================

export interface PlayerFollow {
  followedTopics: EventTopic[];
  followedRegions: string[]; // Country codes or region IDs
  updatedAt: string;
}

export interface NotificationPreference {
  enabled: boolean;
  notifyOnMajorDevelopmentsOnly: boolean;
  quietHoursUtc?: { startHour: number; endHour: number };
}

export interface ContentReport {
  reportId: string;
  eventId: string;
  reason: 'factual_inaccuracy' | 'outdated_info' | 'biased_framing' | 'broken_source' | 'other';
  userExplanation: string;
  submittedAt: string;
  status: 'pending' | 'reviewed' | 'dismissed';
}

export interface EditorialAuditLog {
  logId: string;
  eventId: string;
  actorId: string;
  action: 'create' | 'status_change' | 'update' | 'correct' | 'archive' | 'reject';
  previousStatus?: EventLifecycleStatus;
  newStatus?: EventLifecycleStatus;
  comment: string;
  timestamp: string;
}
