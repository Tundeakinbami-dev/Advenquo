/**
 * Advenquo Global Live World Engine: Unified API & Service Layer
 *
 * Exposes clean RESTful / service boundaries for:
 * - Public feed discovery with multi-faceted filtering & pagination
 * - Map visualization endpoints with coordinate projections
 * - Event detail, updates timeline, source evidence, and corrections
 * - Interactive adventure linkages
 * - Privacy-respecting player follows & notifications
 * - Role-protected editorial approval and correction controls
 */

import type {
  ContentReport,
  EventTopic,
  NotificationPreference,
  PlayerFollow,
  WorldEvent,
} from '../types.js';
import { eventResolver } from '../intelligence/event-resolver.js';
import { editorialWorkflow } from '../editorial/editorial-workflow.js';
import type { UserRole } from '../editorial/editorial-workflow.js';
import { adventureGenerator } from '../editorial/adventure-generator.js';

export interface WorldNowFeedQuery {
  topic?: EventTopic | 'all';
  countryCode?: string;
  freshness?: 'all' | 'BREAKING' | 'DEVELOPING' | 'STABLE' | 'ARCHIVED_HISTORICAL';
  searchQuery?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface MapMarker {
  eventId: string;
  title: string;
  topic: EventTopic;
  coordinates: [number, number];
  country: string;
  city?: string;
  confidenceRating: string;
  status: string;
  hasAdventure: boolean;
}

export class WorldEngineApi {
  private reports: ContentReport[] = [];
  private playerFollows: PlayerFollow = {
    followedTopics: ['environment_climate', 'economy_business', 'science_technology', 'culture_society'],
    followedRegions: ['NG', 'KE', 'GH', 'SN'],
    updatedAt: new Date().toISOString(),
  };
  private notificationPrefs: NotificationPreference = {
    enabled: true,
    notifyOnMajorDevelopmentsOnly: true,
  };

  /**
   * GET /api/v1/world-now
   */
  public getFeed(query: WorldNowFeedQuery = {}): {
    total: number;
    events: WorldEvent[];
  } {
    let list = eventResolver.getAllEvents();

    // Default to publicly visible statuses unless specifically querying drafts/reviews
    if (!query.status) {
      list = list.filter(
        (e) =>
          e.status === 'PUBLISHED' ||
          e.status === 'UPDATED' ||
          e.status === 'CORRECTED' ||
          e.status === 'DISPUTED',
      );
    } else if (query.status !== 'all') {
      list = list.filter((e) => e.status === query.status);
    }

    // Filter by topic
    if (query.topic && query.topic !== 'all') {
      list = list.filter((e) => e.topic === query.topic);
    }

    // Filter by country code
    if (query.countryCode && query.countryCode !== 'all') {
      list = list.filter((e) => e.location.countryCode.toUpperCase() === query.countryCode?.toUpperCase());
    }

    // Filter by freshness
    if (query.freshness && query.freshness !== 'all') {
      list = list.filter((e) => e.freshnessCategory === query.freshness);
    }

    // Search query keyword filter
    if (query.searchQuery) {
      const q = query.searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.shortSummary.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    // Sort by most recent update first
    list.sort((a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime());

    const total = list.length;
    const offset = query.offset || 0;
    const limit = query.limit || 50;
    const paginated = list.slice(offset, offset + limit);

    return { total, events: paginated };
  }

  /**
   * GET /api/v1/world-now/map
   */
  public getMapMarkers(): MapMarker[] {
    const { events } = this.getFeed();
    return events.map((e) => ({
      eventId: e.id,
      title: e.title,
      topic: e.topic,
      coordinates: e.location.coordinates,
      country: e.location.country,
      city: e.location.city,
      confidenceRating: e.confidenceRating,
      status: e.status,
      hasAdventure: Boolean(e.linkedAdventureId),
    }));
  }

  /**
   * GET /api/v1/world-now/topics
   */
  public getTopicStats(): Record<EventTopic, number> {
    const { events } = this.getFeed({ status: 'all' });
    const stats: Record<string, number> = {
      protests_civic: 0,
      politics_governance: 0,
      conflict_humanitarian: 0,
      disasters_safety: 0,
      science_technology: 0,
      economy_business: 0,
      environment_climate: 0,
      culture_society: 0,
      sport_public_events: 0,
    };

    for (const e of events) {
      if (stats[e.topic] !== undefined) {
        stats[e.topic]++;
      }
    }

    return stats as Record<EventTopic, number>;
  }

  /**
   * GET /api/v1/world-now/:eventId
   */
  public getEventById(eventId: string): WorldEvent | undefined {
    return eventResolver.getEvent(eventId);
  }

  /**
   * GET /api/v1/world-now/:eventId/timeline
   */
  public getEventTimeline(eventId: string) {
    const event = eventResolver.getEvent(eventId);
    if (!event) return undefined;
    return {
      eventId: event.id,
      title: event.title,
      timeline: event.updatesTimeline,
      corrections: event.corrections,
    };
  }

  /**
   * GET /api/v1/world-now/:eventId/sources
   */
  public getEventSources(eventId: string) {
    const event = eventResolver.getEvent(eventId);
    if (!event) return undefined;
    return {
      eventId: event.id,
      sources: event.sources,
      claims: event.claims,
    };
  }

  /**
   * GET /api/v1/world-now/:eventId/adventures
   */
  public getEventAdventures(eventId: string) {
    return adventureGenerator.getAdventureForEvent(eventId);
  }

  /**
   * POST /api/v1/world-now/:eventId/report
   */
  public submitReport(
    eventId: string,
    reason: ContentReport['reason'],
    explanation: string,
  ): ContentReport {
    const report: ContentReport = {
      reportId: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      eventId,
      reason,
      userExplanation: explanation,
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };
    this.reports.push(report);
    return report;
  }

  public getReports(): ContentReport[] {
    return [...this.reports];
  }

  /**
   * User Follows & Privacy
   */
  public getPlayerFollows(): PlayerFollow {
    return { ...this.playerFollows };
  }

  public updatePlayerFollows(updates: Partial<PlayerFollow>): PlayerFollow {
    this.playerFollows = {
      ...this.playerFollows,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return { ...this.playerFollows };
  }

  public getNotificationPreferences(): NotificationPreference {
    return { ...this.notificationPrefs };
  }

  public updateNotificationPreferences(
    updates: Partial<NotificationPreference>,
  ): NotificationPreference {
    this.notificationPrefs = { ...this.notificationPrefs, ...updates };
    return { ...this.notificationPrefs };
  }

  /**
   * Editorial Service Operations (Role-Protected)
   */
  public reviewAndPublishEvent(
    eventId: string,
    reviewDecision: {
      reviewerId: string;
      decision: 'approve' | 'reject';
      rationale: string;
      confidenceAssessment: 'high' | 'medium' | 'provisional_developing';
      ethicsChecklistPassed: boolean;
    },
    role: UserRole,
  ) {
    const event = eventResolver.getEvent(eventId);
    if (!event) throw new Error(`Event '${eventId}' not found`);

    if (reviewDecision.decision === 'approve') {
      return editorialWorkflow.approveAndPublish(event, reviewDecision, role);
    } else {
      editorialWorkflow.archiveEvent(event, reviewDecision.reviewerId, reviewDecision.rationale, role);
      return { status: 'rejected' };
    }
  }

  public correctEvent(
    eventId: string,
    correction: {
      explanation: string;
      affectedFields: string[];
      correctedHeadline?: string;
      correctedSummary?: string;
      editorialSignoff: string;
    },
    role: UserRole,
  ) {
    const event = eventResolver.getEvent(eventId);
    if (!event) throw new Error(`Event '${eventId}' not found`);
    return editorialWorkflow.issueCorrection(event, correction, role);
  }
}

export const worldEngineApi = new WorldEngineApi();
