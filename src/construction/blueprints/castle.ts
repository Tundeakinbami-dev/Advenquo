/**
 * Advenquo: Construction World — Level 4: Castle Challenge
 *
 * Requirements:
 * - Towers
 * - Arches / lintels
 * - Complex walls
 * - Staircases
 * - Decorative structural features
 */

import type { BlueprintDefinition } from './blueprint-types.js';

export const CASTLE_BLUEPRINT: BlueprintDefinition = {
  id: 'castle',
  title: 'Level 4: Medieval Citadel Fortress',
  description:
    'A majestic stone citadel featuring dual corner watchtowers, arched portal gateways, fortified curtain walls, spiral access stairs, and battlements.',
  estimatedBuildTimeMinutes: 45,
  foundationDimensions: [5.0, 0.3, 5.0],
  foundationPosition: [0, 0, -2.5],
  requiredQuantities: {
    foundation_block: 8,
    concrete_block: 12,
    clay_brick: 16,
    reinforced_column: 4,
    horizontal_beam: 4,
    staircase: 2,
    wall_panel: 8,
  },
  stages: [
    {
      stageIndex: 1,
      title: 'Citadel Foundation & Moat Pad',
      instruction: 'Seat high-density foundation footing blocks.',
      criticalCheck: 'Footing blocks must form a rigid square bastion footprint.',
    },
    {
      stageIndex: 2,
      title: 'Flanking Watchtower Shafts',
      instruction: 'Stack masonry blocks to raise the southwest and southeast watchtowers.',
      criticalCheck: 'Tower vertical courses must maintain true verticality.',
    },
    {
      stageIndex: 3,
      title: 'Curtain Walls & Ramparts',
      instruction: 'Erect thick stone curtain wall sections between watchtowers.',
      criticalCheck: 'Curtain walls must lock firmly into tower pilasters.',
    },
    {
      stageIndex: 4,
      title: 'Arched Gatehouse Portal',
      instruction: 'Span heavy lintel beams over the central portcullis entry.',
      criticalCheck: 'Gate lintel must transfer overhead parapet loads.',
    },
    {
      stageIndex: 5,
      title: 'Spiral Staircases & Battlements',
      instruction: 'Install access stairs leading up to the crenellated upper walk.',
      criticalCheck: 'Stairs must anchor securely to tower interior walls.',
    },
  ],
  targets: [
    {
      targetId: 'tower_sw',
      componentType: 'reinforced_column',
      targetPosition: [-1.8, 1.2, -1.0],
      targetRotation: [0, 0, 0, 1],
      stageIndex: 2,
      criticalLoadBearing: true,
      description: 'Southwest defensive watchtower core',
    },
    {
      targetId: 'tower_se',
      componentType: 'reinforced_column',
      targetPosition: [1.8, 1.2, -1.0],
      targetRotation: [0, 0, 0, 1],
      stageIndex: 2,
      criticalLoadBearing: true,
      description: 'Southeast defensive watchtower core',
    },
    {
      targetId: 'gate_arch',
      componentType: 'horizontal_beam',
      targetPosition: [0, 2.45, -1.0],
      targetRotation: [0, 0, 0, 1],
      stageIndex: 4,
      criticalLoadBearing: true,
      description: 'Arched gatehouse lintel beam',
    },
  ],
};

export default CASTLE_BLUEPRINT;
