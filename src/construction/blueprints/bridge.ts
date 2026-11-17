/**
 * Advenquo: Construction World — Level 6: Viaduct Infrastructure Bridge Challenge
 *
 * Requirements:
 * - Foundations
 * - Piers
 * - Beams
 * - Bridge decks
 * - Supports
 * - Structural connections
 * - Load challenges
 */

import type { BlueprintDefinition } from './blueprint-types.js';

export const BRIDGE_BLUEPRINT: BlueprintDefinition = {
  id: 'bridge',
  title: 'Level 6: Coastal Viaduct Infrastructure Bridge',
  description:
    'A multi-span precast box girder bridge crossing a deep tidal channel. Requires setting underwater foundation caissons, raising twin concrete piers, anchoring bearing seats, and lifting heavy bridge deck spans with two-handed coordination.',
  estimatedBuildTimeMinutes: 50,
  foundationDimensions: [8.0, 0.4, 2.5],
  foundationPosition: [0, 0, -2.5],
  requiredQuantities: {
    foundation_block: 6,
    reinforced_column: 4,
    horizontal_beam: 4,
    bridge_section: 3,
  },
  stages: [
    {
      stageIndex: 1,
      title: 'Abutment & Channel Caissons',
      instruction: 'Seat foundation caisson blocks on south, channel, and north banks.',
      criticalCheck: 'Caissons must reach solid bedrock bearing layer.',
    },
    {
      stageIndex: 2,
      title: 'Channel Piers & Bearing Caps',
      instruction: 'Erect vertical structural columns to form the viaduct piers.',
      criticalCheck: 'Piers must resist lateral wave action and eccentric dead load.',
    },
    {
      stageIndex: 3,
      title: 'Pier Cross-Beams',
      instruction: 'Span horizontal lintel beams across pier pairs to form bearing tables.',
      criticalCheck: 'Bearing seats must provide anti-seismic restrainer sockets.',
    },
    {
      stageIndex: 4,
      title: 'Box Girder Span Deck Placement',
      instruction: 'Use two-handed manipulation to lift and place the 3-meter bridge spans.',
      criticalCheck: 'Bridge deck joints must lock and maintain span continuity.',
    },
    {
      stageIndex: 5,
      title: 'Live Load Test Certification',
      instruction: 'Subject the completed bridge to live vehicle load validation.',
      criticalCheck: 'Mid-span deflection must remain below 1/800 of span length.',
    },
  ],
  targets: [
    {
      targetId: 'bridge_pier_1',
      componentType: 'reinforced_column',
      targetPosition: [-1.5, 1.2, -2.5],
      targetRotation: [0, 0, 0, 1],
      stageIndex: 2,
      criticalLoadBearing: true,
      description: 'South channel support pier',
    },
    {
      targetId: 'bridge_pier_2',
      componentType: 'reinforced_column',
      targetPosition: [1.5, 1.2, -2.5],
      targetRotation: [0, 0, 0, 1],
      stageIndex: 2,
      criticalLoadBearing: true,
      description: 'North channel support pier',
    },
    {
      targetId: 'bridge_deck_mid',
      componentType: 'bridge_section',
      targetPosition: [0, 2.7, -2.5],
      targetRotation: [0, 0, 0, 1],
      stageIndex: 4,
      criticalLoadBearing: true,
      description: 'Central navigation channel box girder deck',
    },
  ],
};

export default BRIDGE_BLUEPRINT;
