/**
 * Advenquo: Construction World — Level 5: Grand Estate Mansion Challenge
 *
 * Requirements:
 * - Multiple building wings (East wing, West wing, Central pavilion)
 * - Multi-floor elevation
 * - Interior partitions & exterior facades
 * - Architectural balconies and loggias
 */

import type { BlueprintDefinition } from './blueprint-types.js';

export const MANSION_BLUEPRINT: BlueprintDefinition = {
  id: 'mansion',
  title: 'Level 5: Grand Colonial Estate Mansion',
  description:
    'An expansive multi-wing luxury estate featuring grand dual staircases, colonnaded loggia porticos, double-height foyer, floor slabs, and panoramic roof terraces.',
  estimatedBuildTimeMinutes: 60,
  foundationDimensions: [6.0, 0.3, 5.0],
  foundationPosition: [0, 0, -2.5],
  requiredQuantities: {
    foundation_block: 10,
    reinforced_column: 8,
    horizontal_beam: 8,
    floor_component: 4,
    staircase: 2,
    wall_panel: 10,
    roof_panel: 4,
  },
  stages: [
    {
      stageIndex: 1,
      title: 'Tri-Wing Estate Foundation',
      instruction: 'Lay the expansive foundation footprint across central and lateral wings.',
      criticalCheck: 'Ground footings must support high-aspect column loads.',
    },
    {
      stageIndex: 2,
      title: 'Colonnade Grand Entrance',
      instruction: 'Erect the 8-column colonnade across the front facade.',
      criticalCheck: 'Columns must maintain uniform spacing and plumb elevation.',
    },
    {
      stageIndex: 3,
      title: 'Upper Floor Slabs & Grand Foyer',
      instruction: 'Span heavy precast beams and place the second-floor slabs.',
      criticalCheck: 'Slabs must form a continuous horizontal diaphragm.',
    },
    {
      stageIndex: 4,
      title: 'Dual Floating Staircases',
      instruction: 'Install mirrored grand staircases connecting ground to upper mezzanine.',
      criticalCheck: 'Upper landings must bear solidly on floor slab seats.',
    },
    {
      stageIndex: 5,
      title: 'Enclosed Suites & Crown Cornice',
      instruction: 'Enclose private suites with wall panels and install the crown roof panels.',
      criticalCheck: 'Roof overhang must shed rain away from facade colonnade.',
    },
  ],
  targets: [
    {
      targetId: 'mansion_col_1',
      componentType: 'reinforced_column',
      targetPosition: [-2.0, 1.2, -1.2],
      targetRotation: [0, 0, 0, 1],
      stageIndex: 2,
      criticalLoadBearing: true,
      description: 'West portico colonnade column',
    },
    {
      targetId: 'mansion_col_2',
      componentType: 'reinforced_column',
      targetPosition: [2.0, 1.2, -1.2],
      targetRotation: [0, 0, 0, 1],
      stageIndex: 2,
      criticalLoadBearing: true,
      description: 'East portico colonnade column',
    },
  ],
};

export default MANSION_BLUEPRINT;
