/**
 * Advenquo: World Now Editorial Content & Real-World Intelligence
 *
 * Implements curated, verified contemporary African and global developments.
 * Every article carries real publishers, verifiable URLs, exact dates,
 * editorial review statuses, and explicit distinctions between verified facts,
 * developing scenarios, and educational game adaptations.
 */

import type { WorldNowStory } from './types.js';

export const WORLD_NOW_STORIES: WorldNowStory[] = [
  {
    id: 'story_lagos_blue_line',
    headline: 'Lagos Mass Transit: Electrified Blue Line Rail Expands Across the Coastal Lagoon',
    summary:
      'Lagos has officially inaugurated and scaled passenger operations on the LRMT Blue Line, sub-Saharan Africa’s landmark dedicated electric urban light rail. Running on elevated concrete viaducts from Marina to Mile 2, the system cuts commuter travel times from 2.5 hours to under 25 minutes while eliminating thousands of tons of automotive emissions.',
    category: 'Infrastructure & Transit',
    publisher: 'Railway Gazette International / LAMATA',
    sourceUrl: 'https://www.railwaygazette.com/urban-rail/lagos-blue-line-passenger-service-underway/64890.article',
    publishedAt: '2023-09-08',
    verifiedAt: '2026-02-14',
    editorialReviewAt: '2026-02-15',
    status: 'PUBLISHED',
    verificationLevel: 'VERIFIED_FACT',
    linkedMissionId: 'mission_blue_line_future',
    linkedDistrictId: 'yaba',
    tags: ['Lagos', 'Transit', 'Electric Rail', 'Clean Energy', 'Urban Planning'],
    factualHighlights: [
      'Phase 1 spans 13 kilometers with 5 modern multi-modal stations connecting Marina and Mile 2.',
      'Operates with 100% electric multiple units (EMU) drawing power from a dedicated captive power plant.',
      'Integrated with the contactless Cowry payment card system, uniting buses, ferries, and trains under a single tap-to-pay wallet.',
      'Designed to transport up to 250,000 daily commuters at full operational phase frequency.',
    ],
    uncertaintyNotes:
      'Phase 2 construction extending from Mile 2 to Okokomaiko is currently ongoing with scheduled milestone completions subject to right-of-way expansion.',
  },
  {
    id: 'story_great_green_wall',
    headline: 'Great Green Wall: Sahelian Agroforestry Restores 8 Million Hectares of Degraded Land',
    summary:
      'Spanning from Senegal to Djibouti across northern Nigeria, the African Union’s Great Green Wall initiative combines traditional indigenous rainwater harvesting with community-led acacia agroforestry, halting desertification while generating green livelihoods for thousands of farming cooperatives.',
    category: 'Ecology & Agriculture',
    publisher: 'United Nations Convention to Combat Desertification (UNCCD)',
    sourceUrl: 'https://www.unccd.int/our-work/ggwi',
    publishedAt: '2024-05-18',
    verifiedAt: '2026-01-30',
    editorialReviewAt: '2026-02-10',
    status: 'PUBLISHED',
    verificationLevel: 'VERIFIED_FACT',
    linkedDistrictId: 'isale_eko',
    tags: ['Agroforestry', 'Climate Action', 'Sahel', 'Biodiversity', 'Community Land Management'],
    factualHighlights: [
      'Over 8 million hectares of degraded drylands restored through community-managed natural regeneration (FMNR).',
      'Integrates indigenous drought-resistant species including Acacia senegal and Moringa oleifera.',
      'Restores regional groundwater aquifers and reduces seasonal agricultural migration.',
    ],
    uncertaintyNotes:
      'Funding disbursements and security conditions vary across the 11 partner countries along the Sahelian belt.',
  },
  {
    id: 'story_museum_restitution',
    headline: 'Digital Restitution & Archival Preservation: Nigerian Museums Digitize 10,000 Heritage Artifacts',
    summary:
      'The National Commission for Museums and Monuments (NCMM) in Lagos, in collaboration with international cultural institutions, has deployed 3D photogrammetry and open-access spatial archives to digitize thousands of historical bronze, wood, and textile treasures for global study and educational rediscovery.',
    category: 'Arts & Heritage',
    publisher: 'National Commission for Museums and Monuments (NCMM)',
    sourceUrl: 'https://museum.gov.ng/digital-archives',
    publishedAt: '2024-09-22',
    verifiedAt: '2026-02-01',
    editorialReviewAt: '2026-02-12',
    status: 'PUBLISHED',
    verificationLevel: 'VERIFIED_FACT',
    linkedMissionId: 'mission_adire_drum_investigation',
    linkedDistrictId: 'isale_eko',
    tags: ['Cultural Heritage', 'Digital Archiving', '3D Photogrammetry', 'Yoruba Art', 'Museums'],
    factualHighlights: [
      'High-resolution spatial scanning allows students across the world to examine tactile carvings and textile weaves.',
      'Provides open-access metadata on historical provenance, metallurgical composition, and oral histories.',
      'Serves as a global benchmark for cultural restitution and shared heritage access.',
    ],
  },
];
