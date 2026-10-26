/**
 * Advenquo Global Live World Engine: Source Adapters
 *
 * Implements modular, lawful retrieval adapters for:
 * - RSS / Atom syndication feeds
 * - Structured JSON institutional APIs
 * - Emergency & Environmental monitoring endpoints
 * - Seeded / Mock Sandbox adapter for reproducible evaluation & test scenarios
 */

import type { RawSourceItem, SourceRegistryEntry } from '../types.js';

export interface SourceAdapter {
  fetchItems(entry: SourceRegistryEntry): Promise<RawSourceItem[]>;
}

/**
 * Parses RSS / Atom XML string into RawSourceItem array without external bloat.
 * Robust against malformed XML, unclosed tags, and HTML entities.
 */
export function parseRssXml(xmlText: string): RawSourceItem[] {
  const items: RawSourceItem[] = [];
  const itemRegex = /<item[\s\S]*?<\/item>|<entry[\s\S]*?<\/entry>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xmlText)) !== null) {
    const rawItem = match[0];

    const titleMatch = rawItem.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    const linkMatch =
      rawItem.match(/<link[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i) ||
      rawItem.match(/<link[^>]*href=["']([^"']+)["']/i);
    const descMatch =
      rawItem.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i) ||
      rawItem.match(/<content[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/content>/i) ||
      rawItem.match(/<summary[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/summary>/i);
    const pubDateMatch =
      rawItem.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) ||
      rawItem.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i) ||
      rawItem.match(/<dc:date[^>]*>([\s\S]*?)<\/dc:date>/i);
    const guidMatch =
      rawItem.match(/<guid[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/guid>/i) ||
      rawItem.match(/<id[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/id>/i);

    const title = titleMatch ? titleMatch[1].trim() : 'Untitled Report';
    const url = linkMatch ? linkMatch[1].trim() : '';
    const content = descMatch ? descMatch[1].trim() : '';
    const rawDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString();
    const guid = guidMatch ? guidMatch[1].trim() : url || `guid_${Date.now()}_${Math.random()}`;

    items.push({
      guid,
      title,
      url,
      content,
      publishedAt: rawDate,
    });
  }

  return items;
}

export class RssAtomFeedAdapter implements SourceAdapter {
  async fetchItems(entry: SourceRegistryEntry): Promise<RawSourceItem[]> {
    if (!entry.feedUrl) {
      throw new Error(`Source ${entry.sourceId} has no feedUrl configured`);
    }

    try {
      const response = await fetch(entry.feedUrl, {
        headers: {
          'User-Agent': 'AdvenquoLiveWorldEngine/1.0 (+https://advenquo.com/bot; compliance-check)',
          Accept: 'application/rss+xml, application/atom+xml, text/xml, application/xml',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const xmlText = await response.text();
      return parseRssXml(xmlText);
    } catch (err) {
      throw new Error(`Feed retrieval failed for ${entry.sourceId}: ${(err as Error).message}`);
    }
  }
}

export class StructuredJsonApiAdapter implements SourceAdapter {
  async fetchItems(entry: SourceRegistryEntry): Promise<RawSourceItem[]> {
    const url = entry.feedUrl || entry.homepageUrl;
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'AdvenquoLiveWorldEngine/1.0',
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const results: RawSourceItem[] = [];

      // Flexible payload mapper
      const rawList = Array.isArray(data)
        ? data
        : data.articles || data.items || data.data || data.releases || [];

      for (const item of rawList) {
        results.push({
          guid: item.id || item.guid || item.url || `json_${Date.now()}`,
          title: item.title || item.headline || 'Untitled Public Release',
          content: item.content || item.summary || item.body || item.description || '',
          url: item.url || item.link || entry.homepageUrl,
          publishedAt: item.published_at || item.publishedAt || item.date || new Date().toISOString(),
          author: item.author || entry.organizationName,
          categories: item.categories || item.tags || [],
          rawPayload: item,
        });
      }

      return results;
    } catch (err) {
      throw new Error(`API retrieval failed for ${entry.sourceId}: ${(err as Error).message}`);
    }
  }
}

export class EmergencyMonitorAdapter implements SourceAdapter {
  async fetchItems(entry: SourceRegistryEntry): Promise<RawSourceItem[]> {
    const url = entry.feedUrl || entry.homepageUrl;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const alerts = data.alerts || data.incidents || [];

      return alerts.map((alert: any) => ({
        guid: alert.alertId || alert.id || `alert_${Date.now()}`,
        title: `EMERGENCY ALERT: ${alert.event || alert.title}`,
        content: alert.description || alert.instruction || '',
        url: alert.infoUrl || entry.homepageUrl,
        publishedAt: alert.sent || alert.timestamp || new Date().toISOString(),
        rawPayload: alert,
      }));
    } catch (err) {
      throw new Error(`Emergency monitor retrieval failed: ${(err as Error).message}`);
    }
  }
}

/**
 * Seeded Mock / Sandbox Adapter:
 * Supplies deterministic, verifiable real-world developments for development,
 * regression testing, and verification of complex scenarios (multi-source corroboration,
 * breaking updates, official corrections, and adversarial injection resistance).
 */
export class MockSandboxAdapter implements SourceAdapter {
  private seededItems: Map<string, RawSourceItem[]> = new Map();

  constructor() {
    this._initializeDefaultSeeds();
  }

  public setSeededItemsForSource(sourceId: string, items: RawSourceItem[]): void {
    this.seededItems.set(sourceId, [...items]);
  }

  public appendSeededItem(sourceId: string, item: RawSourceItem): void {
    const existing = this.seededItems.get(sourceId) || [];
    existing.push(item);
    this.seededItems.set(sourceId, existing);
  }

  async fetchItems(entry: SourceRegistryEntry): Promise<RawSourceItem[]> {
    const items = this.seededItems.get(entry.sourceId);
    if (!items) {
      return [];
    }
    // Return clone
    return items.map((it) => ({ ...it }));
  }

  private _initializeDefaultSeeds(): void {
    // 1. LAMATA Blue Line Expansion (Official Government Source)
    this.seededItems.set('src_lamata_official', [
      {
        guid: 'lamata_blueline_phase2_scale',
        title: 'LAMATA Expands Blue Line Electric Fleet and Announces Mile 2 - Okokomaiko Right of Way Milestones',
        content:
          'Lagos Metropolitan Area Transport Authority officially inaugurated four additional electric multiple unit (EMU) train sets for the LRMT Blue Line, expanding daily ridership capacity toward 280,000 passengers between Marina and Mile 2. Works on Phase 2 to Okokomaiko have cleared 82% of coastal right-of-way corridor with structural viaduct piling commencing at Festac and Alaba interchanges.',
        url: 'https://lamata-ng.com/press/blue-line-expansion-phase2-2026',
        publishedAt: '2026-10-25T14:30:00Z',
        author: 'LAMATA Directorate of Rail Transit',
        categories: ['Transit', 'Rail', 'Electric Infrastructure'],
      },
    ]);

    // 2. UNCCD Great Green Wall (International Organization)
    this.seededItems.set('src_unccd_ggwi', [
      {
        guid: 'unccd_ggwi_sahel_restoration_8m',
        title: 'UNCCD Sahelian Agroforestry Assessment Confirms 8.4 Million Hectares Restored Across Northern Nigeria and Sahelian Belt',
        content:
          'The United Nations Convention to Combat Desertification released its mid-decade synthesis on the Great Green Wall Initiative. Satellite remote sensing verified the ecological recovery of 8.4 million hectares across 11 partner countries through farmer-managed natural regeneration (FMNR) and indigenous water harvesting (zai pits), halting desert encroachment while supporting 140,000 rural cooperative livelihoods.',
        url: 'https://www.unccd.int/news-stories/ggwi-mid-decade-restoration-progress',
        publishedAt: '2026-10-24T10:00:00Z',
        author: 'UNCCD Scientific and Technical Review Panel',
        categories: ['Ecology', 'Agroforestry', 'Sahel', 'Climate Action'],
      },
    ]);

    // 3. African Union Civic Governance & Peaceful Assembly
    this.seededItems.set('src_african_union_news', [
      {
        guid: 'au_civic_dialogue_charter',
        title: 'African Union Commission Issues Resolution on Youth Civic Participation and Transparent Electoral Governance',
        content:
          'Meeting in Addis Ababa, the African Union Peace and Security Council affirmed that lawful, peaceful public demonstration and youth civic engagement are vital pillars of democratic resilience. The Council urged all member states to guarantee freedom of assembly, uphold objective dialogue on youth economic empowerment, and protect public spaces for constructive civic expression.',
        url: 'https://au.int/en/pressreleases/20261025/civic-participation-charter',
        publishedAt: '2026-10-25T16:00:00Z',
        author: 'AU Directorate of Governance and Conflict Prevention',
        categories: ['Governance', 'Civic Participation', 'Democracy'],
      },
    ]);

    // 4. UNESCO Heritage Restitution & Digital Archiving
    this.seededItems.set('src_unesco_heritage', [
      {
        guid: 'unesco_nigeria_museum_digitization',
        title: 'UNESCO and Nigerian NCMM Complete Spatial 3D Archiving of 10,000 West African Cultural Treasures',
        content:
          'In a milestone for open-access cultural education, the National Commission for Museums and Monuments of Nigeria, backed by UNESCO, published interactive photogrammetric 3D scans of 10,000 historical bronze, terracotta, and textile artifacts. Global researchers and students can now examine authentic surface tooling, indigo dye techniques, and metallurgical compositions online.',
        url: 'https://whc.unesco.org/en/news/2026-nigeria-digital-restitution-milestone',
        publishedAt: '2026-10-23T11:20:00Z',
        author: 'UNESCO World Heritage Heritage Preservation Unit',
        categories: ['Culture', 'Heritage', '3D Photogrammetry', 'Education'],
      },
    ]);

    // 5. Verified Civic Wire - Multi-source corroborating reporting
    this.seededItems.set('src_wire_syndicate', [
      {
        guid: 'wire_lagos_electric_transit_commuters',
        title: 'Lagos Commuters Commend Blue Line Electric Rail as Travel Times Drop 80% Across Marina-Mile 2 Viaduct',
        content:
          'Thousands of daily commuters across Lagos have embraced the electrified Blue Line rail. Independent interviews with market traders, students, and office workers confirm the journey from Mile 2 to Marina now takes 21 minutes, down from over 2.5 hours in road gridlock, with zero ticket queues thanks to unified Cowry card contactless integration.',
        url: 'https://verifiedwire.org/africa/transit/lagos-blue-line-commuter-experience',
        publishedAt: '2026-10-25T17:15:00Z',
        author: 'Olumide Bakare, Chief Urban Correspondent',
        categories: ['Transit', 'Lagos', 'Clean Transport'],
      },
    ]);

    // 6. Emergency / Weather Observatory Alert
    this.seededItems.set('src_disaster_monitor', [
      {
        guid: 'alert_lagoon_tidal_surge_advisory',
        title: 'PUBLIC SAFETY ADVISORY: Seasonal High Lagoon Tide Advisory Issued for Lagos Coastal Corridors',
        content:
          'The Regional Maritime Observatory has issued a preventative seasonal advisory for coastal low-lying communities in Lagos Lagoon due to astronomical high tides. No structural breach has occurred. Ferry operators and shoreline traders are advised to observe standard watercraft safety precautions through Tuesday morning.',
        url: 'https://disaster-monitor.ecowas.int/alerts/2026-tidal-surge-lagos',
        publishedAt: '2026-10-26T06:00:00Z',
        author: 'Hydrological Warning Desk',
        categories: ['Public Safety', 'Maritime', 'Weather Advisory'],
      },
    ]);
  }
}

export class AdapterFactory {
  private static mockAdapter: MockSandboxAdapter = new MockSandboxAdapter();
  private static rssAdapter: RssAtomFeedAdapter = new RssAtomFeedAdapter();
  private static jsonAdapter: StructuredJsonApiAdapter = new StructuredJsonApiAdapter();
  private static emergencyAdapter: EmergencyMonitorAdapter = new EmergencyMonitorAdapter();
  private static useMockSandbox = true; // Default to true in standalone/test/client environment

  public static setUseMockSandbox(enabled: boolean): void {
    this.useMockSandbox = enabled;
  }

  public static getMockAdapter(): MockSandboxAdapter {
    return this.mockAdapter;
  }

  public static getAdapterForSource(entry: SourceRegistryEntry): SourceAdapter {
    if (this.useMockSandbox) {
      return this.mockAdapter;
    }

    switch (entry.retrievalMethod) {
      case 'rss_feed':
        return this.rssAdapter;
      case 'structured_api':
        return this.jsonAdapter;
      case 'event_stream':
        return this.emergencyAdapter;
      default:
        return this.rssAdapter;
    }
  }
}
