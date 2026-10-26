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
        availableMissionIds: ['mission_yoruba_greetings', 'mission_adire_drum_investigation'],
        pointsOfInterest: [
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
