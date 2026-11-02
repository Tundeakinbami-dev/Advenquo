/**
 * Advenquo Global Live World Engine: Intelligence Normalizer & Security Sanitizer
 *
 * Implements:
 * 1. Strict untrusted text sanitization (HTML/script removal, entity decoding)
 * 2. Prompt-injection and adversarial instruction detection
 * 3. Canonical UTC timestamp parsing and timezone standardization
 * 4. Deterministic entity, organization, topic, and geographic extraction
 * 5. Cryptographic/hashing digest generation for document deduplication
 */

import type { EventLocation, EventTopic, RawSourceItem, SourceDocument, SourceRegistryEntry } from '../types.js';

// Adversarial prompt injection signatures commonly embedded in untrusted web pages
const ADVERSARIAL_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /system\s+override[:\s]/i,
  /you\s+are\s+now\s+(in\s+)?(an?\s+)?(unrestricted|developer\s+mode|ai\s+that\s+can|jailbroken)/i,
  /<\|(?:im_start|im_end|system|user|assistant)\|>/i,
  /\[INST\][\s\S]*?\[\/INST\]/i,
  /<\s*system\s*>[\s\S]*?<\s*\/\s*system\s*>/i,
  /bypass\s+(editorial|moderation|review|safety)\s+filter/i,
  /automatically\s+(approve|publish|verify)\s+this\s+story/i,
  /send\s+(credentials|api[_\s]?keys|passwords|env)/i,
  /javascript\s*:/i,
  /data:text\/html/i,
];

// Geographic knowledge dictionary for deterministic resolution
const GEOGRAPHIC_MAPPINGS: Record<
  string,
  {
    country: string;
    countryCode: string;
    region: string;
    city?: string;
    districtId?: string;
    coordinates: [number, number];
  }
> = {
  lagos: {
    country: 'Nigeria',
    countryCode: 'NG',
    region: 'South West',
    city: 'Lagos',
    districtId: 'isale_eko',
    coordinates: [6.455, 3.394],
  },
  'isale eko': {
    country: 'Nigeria',
    countryCode: 'NG',
    region: 'Lagos Island',
    city: 'Lagos',
    districtId: 'isale_eko',
    coordinates: [6.453, 3.396],
  },
  'ìsàlẹ̀ èkó': {
    country: 'Nigeria',
    countryCode: 'NG',
    region: 'Lagos Island',
    city: 'Lagos',
    districtId: 'isale_eko',
    coordinates: [6.453, 3.396],
  },
  yaba: {
    country: 'Nigeria',
    countryCode: 'NG',
    region: 'Lagos Mainland',
    city: 'Lagos',
    districtId: 'yaba',
    coordinates: [6.514, 3.379],
  },
  marina: {
    country: 'Nigeria',
    countryCode: 'NG',
    region: 'Lagos Island',
    city: 'Lagos',
    districtId: 'isale_eko',
    coordinates: [6.451, 3.388],
  },
  'mile 2': {
    country: 'Nigeria',
    countryCode: 'NG',
    region: 'Amuwo-Odofin',
    city: 'Lagos',
    coordinates: [6.467, 3.317],
  },
  sahel: {
    country: 'Regional / Sahelian Belt',
    countryCode: 'NG',
    region: 'Northern Trans-Sahel',
    coordinates: [13.5, 8.5],
  },
  kano: {
    country: 'Nigeria',
    countryCode: 'NG',
    region: 'North West',
    city: 'Kano',
    coordinates: [12.002, 8.591],
  },
  abuja: {
    country: 'Nigeria',
    countryCode: 'NG',
    region: 'Federal Capital Territory',
    city: 'Abuja',
    coordinates: [9.076, 7.398],
  },
  nairobi: {
    country: 'Kenya',
    countryCode: 'KE',
    region: 'Nairobi County',
    city: 'Nairobi',
    coordinates: [-1.286, 36.817],
  },
  accra: {
    country: 'Ghana',
    countryCode: 'GH',
    region: 'Greater Accra',
    city: 'Accra',
    coordinates: [5.603, -0.187],
  },
  dakar: {
    country: 'Senegal',
    countryCode: 'SN',
    region: 'Dakar',
    city: 'Dakar',
    coordinates: [14.716, -17.467],
  },
};

// Topic classification keywords
const TOPIC_KEYWORDS: Record<EventTopic, string[]> = {
  protests_civic: [
    'protest',
    'demonstration',
    'rally',
    'march',
    'activist',
    'civic assembly',
    'demands',
    'picket',
    'civil society',
  ],
  politics_governance: [
    'election',
    'parliament',
    'senate',
    'ministry',
    'president',
    'governor',
    'legislation',
    'policy',
    'treaty',
    'charter',
  ],
  conflict_humanitarian: [
    'humanitarian',
    'refugee',
    'ceasefire',
    'peacekeeping',
    'displaced',
    'aid convoy',
    'red cross',
  ],
  disasters_safety: [
    'disaster',
    'emergency',
    'flood',
    'earthquake',
    'tidal surge',
    'evacuation',
    'hazard',
    'warning',
    'alert',
  ],
  science_technology: [
    'science',
    'technology',
    'satellite',
    'digital',
    'photogrammetry',
    'solar',
    'electric',
    'research',
    'laboratory',
    'biotechnology',
  ],
  economy_business: [
    'economy',
    'trade',
    'market',
    'currency',
    'infrastructure',
    'transit',
    'rail',
    'commuter',
    'port',
    'cooperative',
  ],
  environment_climate: [
    'climate',
    'ecology',
    'agroforestry',
    'desertification',
    'reforestation',
    'biodiversity',
    'aquifer',
    'conservation',
  ],
  culture_society: [
    'culture',
    'heritage',
    'museum',
    'artisan',
    'adire',
    'textile',
    'drum',
    'tradition',
    'language',
    'festival',
    'restitution',
    'terracotta',
    'archeolog',
    'ancient',
    'monument',
    'historical',
    'kiln',
    'excavation',
  ],
  sport_public_events: [
    'sport',
    'stadium',
    'tournament',
    'championship',
    'marathon',
    'games',
    'olympic',
  ],
};

/**
 * Strips HTML tags, script elements, styles, comments, and dangerous entities.
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';

  return (
    input
      // Remove scripts, styles, objects, applets, iframes
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      // Strip all remaining HTML tags
      .replace(/<\/?[a-z][a-z0-9]*[^<>]*>/gi, ' ')
      // Decode common HTML entities
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      // Collapse whitespace
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * Evaluates untrusted text for adversarial prompt injection attempts.
 * Returns score from 0.0 (clean) to 1.0 (malicious instruction detected).
 */
export function evaluatePromptInjection(text: string): { score: number; flaggedPatterns: string[] } {
  const flagged: string[] = [];

  for (const pattern of ADVERSARIAL_INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      flagged.push(pattern.source);
    }
  }

  // Calculate normalized threat score
  const score = flagged.length > 0 ? Math.min(1.0, 0.4 + flagged.length * 0.3) : 0.0;
  return { score, flaggedPatterns: flagged };
}

/**
 * Standardizes raw date strings into canonical UTC ISO 8601 strings.
 * Falls back to current UTC timestamp when input is missing or unparseable.
 */
export function parseCanonicalDate(rawDateStr?: string): string {
  if (!rawDateStr) return new Date().toISOString();

  const timestamp = Date.parse(rawDateStr);
  if (isNaN(timestamp)) {
    return new Date().toISOString();
  }

  return new Date(timestamp).toISOString();
}

/**
 * Deterministic fast 64-bit non-cryptographic hash for text content fingerprinting.
 */
export function computeContentHash(content: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < content.length; i++) {
    const ch = content.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
}

/**
 * Resolves geographic location from document text using knowledge dictionary.
 */
export function extractGeographicLocation(
  text: string,
  sourceCoverage: string[],
): EventLocation {
  const lower = text.toLowerCase();

  for (const [key, loc] of Object.entries(GEOGRAPHIC_MAPPINGS)) {
    if (lower.includes(key)) {
      return {
        country: loc.country,
        countryCode: loc.countryCode,
        region: loc.region,
        city: loc.city,
        districtId: loc.districtId,
        coordinates: loc.coordinates,
        locationConfidence: 'exact',
      };
    }
  }

  // Fallback to source registry coverage defaults
  const defaultCountryCode = sourceCoverage[0] === 'global' ? 'NG' : sourceCoverage[0] || 'NG';
  return {
    country: defaultCountryCode === 'NG' ? 'Nigeria' : 'Regional / West Africa',
    countryCode: defaultCountryCode,
    region: 'General',
    coordinates: [9.082, 8.675],
    locationConfidence: 'approximate',
  };
}

/**
 * Classifies document topics based on keyword density.
 */
export function extractTopics(text: string, sourceTopics: EventTopic[]): EventTopic[] {
  const lower = text.toLowerCase();
  const matchedTopics: EventTopic[] = [];

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS) as [EventTopic, string[]][]) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        if (!matchedTopics.includes(topic)) {
          matchedTopics.push(topic);
        }
        break;
      }
    }
  }

  // Guarantee at least one topic, respecting source specialization
  if (matchedTopics.length === 0) {
    return sourceTopics.length > 0 ? [sourceTopics[0]] : ['culture_society'];
  }

  // Sort so that topics aligned with source specialization take precedence
  matchedTopics.sort((a, b) => {
    const aInSource = sourceTopics.includes(a) ? 1 : 0;
    const bInSource = sourceTopics.includes(b) ? 1 : 0;
    return bInSource - aInSource;
  });

  return matchedTopics;
}

/**
 * Deterministically extracts people and organizations from text.
 */
export function extractEntities(text: string): {
  people: string[];
  organizations: string[];
  places: string[];
  dates: string[];
} {
  const people: string[] = [];
  const organizations: string[] = [];
  const places: string[] = [];
  const dates: string[] = [];

  // Common organizational identifiers
  const orgPatterns = [
    /\b(LAMATA|UNCCD|UNESCO|African Union|NCMM|Lagos State Government|Federal Ministry of [A-Z][a-z]+)\b/g,
  ];

  for (const pat of orgPatterns) {
    const matches = text.match(pat);
    if (matches) {
      for (const m of matches) {
        if (!organizations.includes(m)) organizations.push(m);
      }
    }
  }

  // Location matches
  for (const [key, loc] of Object.entries(GEOGRAPHIC_MAPPINGS)) {
    if (text.toLowerCase().includes(key)) {
      const placeName = loc.city ? `${loc.city}, ${loc.country}` : loc.country;
      if (!places.includes(placeName)) places.push(placeName);
    }
  }

  return { people, organizations, places, dates };
}

/**
 * Full Normalization Pipeline: converts a RawSourceItem into a verified SourceDocument.
 */
export function normalizeSourceItem(
  raw: RawSourceItem,
  source: SourceRegistryEntry,
  fetchRunId: string,
): SourceDocument {
  // 1. Sanitize text
  const cleanTitle = sanitizeHtml(raw.title);
  const cleanBody = sanitizeHtml(raw.content);
  const combinedText = `${cleanTitle} ${cleanBody}`;

  // 2. Prompt injection evaluation
  const injection = evaluatePromptInjection(combinedText);

  // If injection detected, neutralize the text by replacing malicious commands with safety notice
  let safeText = cleanBody;
  if (injection.score > 0.3) {
    safeText = `[POTENTIAL ADVERSARIAL INJECTION FILTERED] ${cleanBody.replace(
      /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/gi,
      '[REDACTED INSTRUCTION]',
    )}`;
  }

  // 3. Timestamp standardization
  const publishedAt = parseCanonicalDate(raw.publishedAt);
  const retrievedAt = new Date().toISOString();

  // 4. Content fingerprint
  const contentHash = computeContentHash(`${cleanTitle}::${safeText}`);

  // 5. Entities and topics
  const extractedEntities = extractEntities(combinedText);
  const detectedTopics = extractTopics(combinedText, source.supportedTopics);

  return {
    documentId: `doc_${source.sourceId}_${contentHash.substring(0, 10)}`,
    sourceId: source.sourceId,
    fetchRunId,
    externalGuid: raw.guid,
    url: raw.url || source.homepageUrl,
    title: cleanTitle,
    cleanText: safeText,
    publishedAt,
    retrievedAt,
    contentHash,
    language: raw.language || 'en',
    extractedEntities,
    detectedTopics,
    promptInjectionScore: injection.score,
    sanitized: true,
  };
}
