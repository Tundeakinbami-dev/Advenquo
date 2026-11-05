/**
 * Advenquo: World Geography & District Exploration Content
 *
 * Implements Layer A (Global Map) and Layer B (Local Exploration) models.
 * Prioritizes Nigeria as the inaugural playable destination with two rich,
 * distinct districts:
 * - Ìsàlẹ̀ Èkó (Historic Heritage & Arts Quarter)
 * - Yaba (Tech & Creative Transit Corridor)
 *
 * International preview destinations are clearly labeled as PREVIEW.
 */

import type { Destination } from './types.js';

export const DESTINATIONS: Destination[] = [
  {
    id: 'nigeria',
    name: 'Nigeria (Federal Republic of Nigeria)',
    countryCode: 'NG',
    regionName: 'West Africa',
    status: 'PLAYABLE',
    description:
      'A cultural, economic, and creative crossroads on the Gulf of Guinea. From ancient textile dye pits and royal palace drum circles to cutting-edge electric transit and tech corridors, explore how Nigeria blends centuries of tradition with dynamic contemporary innovation.',
    lat: 6.5244,
    lng: 3.3792,
    districts: [
      {
        id: 'isale_eko',
        destinationId: 'nigeria',
        name: 'Ìsàlẹ̀ Èkó',
        localName: 'Ìsàlẹ̀ Èkó (Historic Downtown Lagos)',
        tagline: 'Heart of Yoruba Heritage, Royal Palaces & Artisan Guilds',
        description:
          'The historical core of Lagos Island. Narrow labyrinthine avenues wind past the ancestral palace of the Oba of Lagos (Iga Idunganran), master indigo dye compounds, and vibrant drum guilds echoing with centuries of oral history.',
        theme: 'Historic Heritage & Living Traditions',
        availableMissionIds: [
          'mission_nigerian_market_discovery',
          'mission_yoruba_greetings',
          'mission_adire_drum_investigation',
        ],
        pointsOfInterest: [
          {
            id: 'poi_traditional_market_courtyard',
            name: 'Ìsàlẹ̀ Èkó Artisan Courtyard Market',
            localName: 'Ọjà Àsọ Àdìrẹ Ìsàlẹ̀ Èkó',
            type: 'market',
            coordinates: [65, 42],
            description:
              'A lively open-air market courtyard where Adire indigo fabric stalls, master drummers, and carrier guilds converge.',
            culturalSignificance:
              'Yoruba commerce operates on sacred elder greetings, artisan guild brotherhood, and the philosophy of Ọmọlúwàbí (noble character).',
            linkedMissionId: 'mission_nigerian_market_discovery',
            spatialAssetId: 'market-ground',
          },
          {
            id: 'poi_iga_idunganran',

            name: 'Iga Idunganran (Palace of the Oba)',
            localName: 'Iga Idunganran',
            type: 'heritage',
            coordinates: [28, 35],
            description:
              'The ancient ancestral palace grounds of the Oba of Lagos, founded in the 15th century. Ancient carved wooden verandas sit alongside ancestral meeting halls.',
            culturalSignificance:
              'The epicenter of traditional Lagos authority where ceremonial greetings, council deliberations, and cultural festivals begin.',
            linkedMissionId: 'mission_yoruba_greetings',
          },
          {
            id: 'poi_adire_dye_pits',
            name: 'Aboriginal Indigo Dye Guild',
            localName: 'Ilé Àsọ Àdìrẹ',
            type: 'craft',
            coordinates: [52, 45],
            description:
              'Open-air courtyards filled with circular clay fermentation vats of natural Elu (Indigofera) dye. Master women artisans hand-paint intricate cassava starch patterns onto crisp cotton cloth.',
            culturalSignificance:
              'Adire Eleko geometric patterns encode Yoruba cosmology, royal lineages, and proverbs passed down through women’s artisan guilds.',
            linkedMissionId: 'mission_adire_drum_investigation',
          },
          {
            id: 'poi_gangan_square',
            name: 'Gangan Drum Guild & Square',
            localName: 'Gbàgede Àwọn Onílù',
            type: 'heritage',
            coordinates: [40, 70],
            description:
              'A lively shaded square where royal drummers tune the hourglass tension cords of the Gangan, speaking in poetry across the quarter.',
            culturalSignificance:
              'The talking drum acts as an acoustic community broadcaster, praising visitors, signaling events, and reciting lineage genealogies.',
            linkedMissionId: 'mission_adire_drum_investigation',
          },
          {
            id: 'poi_spatial_table',
            name: 'Ancestral Cultural Table (3D Encounter)',
            localName: 'Àtẹ Àwọn Ohun Ìṣẹ̀nbáyé',
            type: 'craft',
            coordinates: [75, 60],
            description:
              'An intimate inspection room featuring a hand-carved mahogany display table with four authentic artifacts: Adire Cloth, Talking Drum, Calabash Bowl, and Kola Nut.',
            culturalSignificance:
              'Allows spatial 3D inspection and hands-first interaction in WebXR or responsive desktop 3D.',
            spatialAssetId: 'display-table',
          },
        ],
      },
      {
        id: 'yaba',
        destinationId: 'nigeria',
        name: 'Yaba & The Waterfront',
        localName: 'Yaba / Marina Corridor',
        tagline: 'Tech Innovation, Lagoon Waterways & Modern Electric Transit',
        description:
          'The pulsating creative and tech hub of Lagos. Yaba bridges tech incubators, universities, and startup labs with the sweeping waterfront of Lagos Lagoon, where the elevated electric Blue Line trains cross into Marina.',
        theme: 'Innovation, Ecology & Urban Mobility',
        availableMissionIds: ['mission_lagoon_transit', 'mission_blue_line_future'],
        pointsOfInterest: [
          {
            id: 'poi_marina_terminal',
            name: 'Marina Multi-Modal Interchange',
            localName: 'Ibi Ìdúró Marina',
            type: 'transit',
            coordinates: [32, 40],
            description:
              'A futuristic elevated transit terminal where electric trains, modern water ferries, and smart BRT buses converge along the waterfront.',
            culturalSignificance:
              'Emblematic of Africa’s modern green transit transition, connecting millions with clean electric mobility.',
            linkedMissionId: 'mission_lagoon_transit',
          },
          {
            id: 'poi_yaba_tech_hub',
            name: 'Yaba Innovation Incubator Labs',
            localName: 'Yaba Tech Corridor',
            type: 'civic',
            coordinates: [65, 30],
            description:
              'A buzzing neighborhood of software studios, digital arts collectives, and civic cartography labs charting Lagos’s environmental future.',
            culturalSignificance:
              'Known as Nigeria’s Silicon Lagoon, where youth code innovative apps for African agriculture, renewable energy, and fintech.',
            linkedMissionId: 'mission_blue_line_future',
          },
          {
            id: 'poi_lagoon_view',
            name: 'Five Cowrie Creek & Lagoon Boardwalk',
            localName: 'Ojú Omi Èkó',
            type: 'transit',
            coordinates: [50, 75],
            description:
              'Panoramic waterfront view of the Lagos Lagoon, showing the iconic Eko Bridge and electric rail viaduct crossing over the coastal waters.',
            culturalSignificance:
              'Water is the lifeblood of Lagos; its fishing communities and trade boats share the waves with high-speed commuter catamarans.',
            linkedMissionId: 'mission_lagoon_transit',
          },
        ],
      },
      {
        id: 'heritage_iga',
        destinationId: 'nigeria',
        name: 'Iga Idunganran Royal Palace',
        localName: 'Iga Idúngànrán (Oba of Lagos Citadel)',
        tagline: 'Imperial Seat of Yoruba Monarchs, Benin Bronzes & Ancestral Shrines',
        description:
          'The ancient ceremonial citadel and palace compound of the Oba of Lagos, founded in the 15th century. Majestic hand-carved iroko columns depict royal guardians, bronze leopard sculptures flank the throne dais, and sacred courtyards preserve royal rites.',
        theme: 'Sacred Royalty & Architectural Heritage',
        availableMissionIds: ['mission_royal_coronation_heritage', 'mission_yoruba_greetings'],
        pointsOfInterest: [
          {
            id: 'poi_throne_dais',
            name: 'Royal Audience Throne & Benin Bronze Leopards',
            localName: 'Àtẹ Ọba Èkó',
            type: 'heritage',
            coordinates: [45, 30],
            description:
              'The elevated crimson-velvet throne dais guarded by two authentic cast Benin bronze leopards, symbolizing royal dignity and eternal vigilance.',
            culturalSignificance:
              'The Oba exercises spiritual stewardship and communal mediation from this seat, preserving uninterrupted lineage traditions dating to King Ado.',
            spatialAssetId: 'palace-throne-dais',
          },
          {
            id: 'poi_iroko_pillars',
            name: 'Ancestral Carved Iroko Columns',
            localName: 'Òpó Igi Ìrókò Àwọn Baba Nlá',
            type: 'heritage',
            coordinates: [50, 60],
            description:
              'Towering columns of seasoned hardwood carved with genealogical reliefs of warriors, priestesses, and sacred animals supporting the palace architrave.',
            culturalSignificance:
              'Yoruba architecture acts as living historical archive; the carvings encode treaty triumphs, lineage genealogies, and sacred proverbs.',
            spatialAssetId: 'palace-pillars',
          },
        ],
      },
      {
        id: 'beach_waterfront',
        destinationId: 'nigeria',
        name: 'Tarkwa Bay Coastal Haven',
        localName: 'Etíkun Tarkwa (Atlantic Haven & Breakwater)',
        tagline: 'Atlantic Surf, Coconut Groves, Artisanal Canoes & Marine Ecology',
        description:
          'A serene, sheltered coastal island paradise at the entrance of Lagos harbour. Golden sands meet rolling Atlantic waves beneath rustling coconut palms, where artisanal fishermen pull colorful wooden canoes onto the shore and marine conservationists monitor coastal ecosystems.',
        theme: 'Coastal Culture, Marine Ecology & Traditions',
        availableMissionIds: ['mission_coastal_ecology_tarkwa', 'mission_blue_line_future'],
        pointsOfInterest: [
          {
            id: 'poi_fishing_canoes',
            name: 'Artisanal Wooden Canoe Fleet',
            localName: 'Ọkọ̀ Ojú Omi Àwọn Apẹja',
            type: 'craft',
            coordinates: [35, 45],
            description:
              'Hand-hewn timber fishing canoes painted in vibrant coastal blues and reds, fitted with traditional nets and carved wooden steering paddles.',
            culturalSignificance:
              'Generations of coastal families sustain sustainable net fishing, navigating the Atlantic swell and Lagos lagoon waterways.',
            spatialAssetId: 'fishing-canoe',
          },
          {
            id: 'poi_coconut_grove',
            name: 'Tarkwa Bay Coconut Palms & Cabanas',
            localName: 'Agbon Etí Omi',
            type: 'craft',
            coordinates: [65, 55],
            description:
              'Sheltered palm groves and bamboo-thatched cabanas overlooking the Atlantic breakwater where travellers and locals gather to rest.',
            culturalSignificance:
              'The coconut palm represents hospitality, nourishment, and environmental coastal protection against Atlantic tidal surges.',
            spatialAssetId: 'coconut-palm',
          },
        ],
      },
    ],
  },
  {
    id: 'nile_valley',
    name: 'Nile Valley (Egypt)',
    countryCode: 'EG',
    regionName: 'North Africa',
    status: 'PREVIEW',
    description:
      'Preview Destination: The cradle of ancient monumental masonry, hydraulic canal engineering, and hieroglyphic literature along the fertile floodplains of the Nile.',
    lat: 25.6872,
    lng: 32.6396,
    districts: [],
  },
  {
    id: 'kyoto_basin',
    name: 'Kyoto Cultural Basin (Japan)',
    countryCode: 'JP',
    regionName: 'East Asia',
    status: 'PREVIEW',
    description:
      'Preview Destination: Centuries of traditional timber joinery, Zen garden hydraulics, and codified tea ceremony protocols.',
    lat: 35.0116,
    lng: 135.7681,
    districts: [],
  },
  {
    id: 'andean_highlands',
    name: 'Andean Highlands (Peru)',
    countryCode: 'PE',
    regionName: 'South America',
    status: 'PREVIEW',
    description:
      'Preview Destination: High-altitude agricultural terracing, mortarless Incan stone masonry, and Quechua fiber arts.',
    lat: -13.5319,
    lng: -71.9675,
    districts: [],
  },
];
