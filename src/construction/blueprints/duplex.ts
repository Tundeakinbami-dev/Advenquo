/**
 * Advenquo: Construction World — Level 2: Duplex Villa Challenge
 *
 * Requirements:
 * - Two floors
 * - Columns
 * - Beams
 * - Floor slabs
 * - Stairs
 * - Roof
 */

import type { BlueprintDefinition } from './blueprint-types.js';

export const DUPLEX_BLUEPRINT: BlueprintDefinition = {
  id: 'duplex',
  title: 'Level 2: Modern Duplex Villa',
  description:
    'A two-story contemporary duplex structure. Requires erecting ground-floor columns, spanning precast lintel beams, placing intermediate floor slabs, assembling access stairs, and enclosing with second-story roofing.',
  estimatedBuildTimeMinutes: 25,
  foundationDimensions: [3.6, 0.2, 3.6],
  foundationPosition: [0, 0, -2.5],
  requiredQuantities: {
    concrete_block: 6,
    reinforced_column: 4,
    horizontal_beam: 4,
    floor_component: 2,
    staircase: 1,
    wall_panel: 4,
    roof_panel: 2,
  },
  stages: [
    {
      stageIndex: 1,
      title: 'Ground Perimeter Footings',
      instruction: 'Lay concrete base blocks along the structural grid.',
      criticalCheck: 'Base blocks must establish plumb bearing pads for columns.',
    },
    {
      stageIndex: 2,
      title: 'Vertical Column Grid',
      instruction: 'Erect 4 reinforced concrete columns at the grid intersections.',
      criticalCheck: 'Columns must seat securely into foundation anchors.',
    },
    {
      stageIndex: 3,
      title: 'First-Floor Lintel Beams',
      instruction: 'Span horizontal lintel beams across column heads.',
      criticalCheck: 'Beam seats must bear fully on column caps.',
    },
    {
      stageIndex: 4,
      title: 'Intermediate Floor Slabs & Stairs',
      instruction: 'Install hollow-core floor slabs and the modular staircase flight.',
      criticalCheck: 'Slabs and stairs must form a continuous horizontal deck.',
    },
    {
      stageIndex: 5,
      title: 'Upper Walls & Weather Roof',
      instruction: 'Place second-story wall panels and secure the roof panels.',
      criticalCheck: 'Upper load paths must transfer directly through lower columns.',
    },
  ],
  targets: [
    // Columns
    {
      targetId: 'col_sw',
      componentType: 'reinforced_column',
      targetPosition: [-1.2, 1.2, -1.3],
      targetRotation: [0, 0, 0, 1],
      stageIndex: 2,
      criticalLoadBearing: true,
      description: 'Ground floor southwest corner column',
    },
    {
      targetId: 'col_se',
      componentType: 'reinforced_column',
      targetPosition: [1.2, 1.2, -1.3],
      targetRotation: [0, 0, 0, 1],
      stageIndex: 2,
      criticalLoadBearing: true,
      description: 'Ground floor southeast corner column',
    },
    {
      targetId: 'col_nw',
      componentType: 'reinforced_column',
      targetPosition: [-1.2, 1.2, -3.7],
      targetRotation: [0, 0, 0, 1],
      stageIndex: 2,
      criticalLoadBearing: true,
      description: 'Ground floor northwest corner column',
    },
    {
      targetId: 'col_ne',
      componentType: 'reinforced_column',
      targetPosition: [1.2, 1.2, -3.7],
      targetRotation: [0, 0, 0, 1],
      stageIndex: 2,
      criticalLoadBearing: true,
      description: 'Ground floor northeast corner column',
    },
    // Beams
    {
      targetId: 'beam_south',
      componentType: 'horizontal_beam',
      targetPosition: [0, 2.45, -1.3],
      targetRotation: [0, 0, 0, 1],
      stageIndex: 3,
      criticalLoadBearing: true,
      description: 'First floor south perimeter transfer beam',
    },
    {
      targetId: 'beam_north',
      componentType: 'horizontal_beam',
      targetPosition: [0, 2.45, -3.7],
      targetRotation: [0, 0, 0, 1],
      stageIndex: 3,
      criticalLoadBearing: true,
      description: 'First floor north perimeter transfer beam',
    },
  ],
};

export default DUPLEX_BLUEPRINT;
