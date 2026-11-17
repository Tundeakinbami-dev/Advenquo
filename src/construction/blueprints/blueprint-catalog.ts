/**
 * Advenquo: Construction World — Complete Blueprint Library & Project Catalog
 *
 * Implements challenges across architectural and civil engineering tiers:
 * 1. Eco-Pavilion Small House (Bungalow starter)
 * 2. Two-Story Duplex Villa
 * 3. Engineered Viaduct Bridge & Infrastructure
 * 4. Fortified Stone Manor & Towers
 * 5. Creative Construction Sandbox
 */

import type { BlueprintDefinition } from './blueprint-types.js';
import { SMALL_HOUSE_BLUEPRINT } from './small-house-blueprint.js';
import { BUNGALOW_BLUEPRINT } from './bungalow.js';

export const DUPLEX_VILLA_BLUEPRINT: BlueprintDefinition = {
  id: 'duplex_villa',
  title: 'Two-Story Duplex Villa',
  description:
    'A multi-level residential engineering challenge. Erect foundation masonry, install ground-floor load-bearing columns, place intermediate precast floor slabs, and erect upper walls and roofing.',
  estimatedBuildTimeMinutes: 25,
  foundationDimensions: [3.6, 0.15, 3.6],
  foundationPosition: [0, 0, -2.5],
  requiredQuantities: {
    concrete_block: 6,
    clay_brick: 6,
    reinforced_column: 4,
    horizontal_beam: 2,
    wall_panel: 4,
    floor_component: 2,
    roof_panel: 2,
  },
  stages: [
    {
      stageIndex: 1,
      title: 'Foundation Footing',
      instruction: 'Verify foundation levelness and perimeter dimensions.',
      criticalCheck: 'Foundation footing must support multi-story column loads.',
    },
    {
      stageIndex: 2,
      title: 'Ground-Floor Base Blocks',
      instruction: 'Lay the ground-floor perimeter masonry blocks.',
      criticalCheck: 'Blocks must align with column anchor points.',
    },
    {
      stageIndex: 3,
      title: 'Structural Column Grid',
      instruction: 'Erect the 4 vertical reinforced rebar columns at the structural corners.',
      criticalCheck: 'Columns must seat plumb on foundation block anchors.',
    },
    {
      stageIndex: 4,
      title: 'Intermediate Floor Deck',
      instruction: 'Place the precast horizontal floor slabs over the column beam seats.',
      criticalCheck: 'Floor deck must bear evenly on columns before upper wall erection.',
    },
    {
      stageIndex: 5,
      title: 'Upper Level Walls & Lintels',
      instruction: 'Erect upper wall panels and seat the horizontal lintel beams.',
      criticalCheck: 'Lintels must span the balcony and window openings.',
    },
    {
      stageIndex: 6,
      title: 'Roof Trusses & Cladding',
      instruction: 'Mount the twin corrugated roof panels over the upper beam saddles.',
      criticalCheck: 'Roof panels must anchor to the upper beams with no overhang past limits.',
    },
  ],
  targets: [
    ...SMALL_HOUSE_BLUEPRINT.targets,
    {
      id: 'target_floor_slab_mid',
      componentType: 'floor_component',
      structuralRole: 'horizontal_deck',
      targetPosition: [0, 2.45, -2.5],
      targetRotation: [0, 0, 0, 1],
      positionToleranceMeters: 0.25,
      rotationToleranceDeg: 25,
      requiredConnections: [
        {
          mySnapPointId: 'floor_bottom_anchor',
          targetItemId: 'target_column_left',
          targetSnapPointId: 'column_top_saddle',
        },
      ],
      stageIndex: 4,
      stageName: 'Intermediate Floor Deck',
    },
  ],
};

export const ARCHED_BRIDGE_BLUEPRINT: BlueprintDefinition = {
  id: 'arched_bridge',
  title: 'Engineered Viaduct Bridge',
  description:
    'Civil engineering infrastructure challenge. Erect heavy pier columns, seat longitudinal transfer beams across the span, and install deck slabs.',
  estimatedBuildTimeMinutes: 30,
  foundationDimensions: [4.8, 0.2, 2.0],
  foundationPosition: [0, 0, -2.5],
  requiredQuantities: {
    concrete_block: 4,
    clay_brick: 4,
    reinforced_column: 4,
    horizontal_beam: 2,
    wall_panel: 2,
    floor_component: 4,
    roof_panel: 0,
  },
  stages: [
    {
      stageIndex: 1,
      title: 'Abutment Footing',
      instruction: 'Inspect the dual pier abutments across the simulated waterway.',
      criticalCheck: 'Abutment pads must align with the road deck axis.',
    },
    {
      stageIndex: 2,
      title: 'Pier Masonry Courses',
      instruction: 'Erect pier base courses on both sides of the crossing.',
      criticalCheck: 'Base blocks must lock into the ground footing.',
    },
    {
      stageIndex: 3,
      title: 'Vertical Bridge Columns',
      instruction: 'Install the heavy structural pier columns.',
      criticalCheck: 'Pier columns must handle bending and compressive span loads.',
    },
    {
      stageIndex: 4,
      title: 'Longitudinal Beam Spans',
      instruction: 'Seat the horizontal prestressed concrete beams spanning the piers.',
      criticalCheck: 'Beams must have full bearing contact at both abutment ends.',
    },
    {
      stageIndex: 5,
      title: 'Roadway Deck Slabs',
      instruction: 'Lay the interlocking precast road deck slabs across the beam flanges.',
      criticalCheck: 'Deck slabs must lock together with zero unanchored cantilevers.',
    },
    {
      stageIndex: 6,
      title: 'Guard Parapets & Inspection',
      instruction: 'Install safety wall parapets along the bridge edges.',
      criticalCheck: 'Bridge span must pass static deflection check.',
    },
  ],
  targets: [
    {
      id: 'target_pier_col_1',
      componentType: 'reinforced_column',
      structuralRole: 'load_bearing_column',
      targetPosition: [-1.2, 1.2, -2.5],
      targetRotation: [0, 0, 0, 1],
      positionToleranceMeters: 0.2,
      rotationToleranceDeg: 25,
      requiredConnections: [
        {
          mySnapPointId: 'column_base_socket',
          targetItemId: 'foundation_slab',
          targetSnapPointId: 'floor_top_deck',
        },
      ],
      stageIndex: 3,
      stageName: 'Vertical Bridge Columns',
    },
    {
      id: 'target_pier_col_2',
      componentType: 'reinforced_column',
      structuralRole: 'load_bearing_column',
      targetPosition: [1.2, 1.2, -2.5],
      targetRotation: [0, 0, 0, 1],
      positionToleranceMeters: 0.2,
      rotationToleranceDeg: 25,
      requiredConnections: [
        {
          mySnapPointId: 'column_base_socket',
          targetItemId: 'foundation_slab',
          targetSnapPointId: 'floor_top_deck',
        },
      ],
      stageIndex: 3,
      stageName: 'Vertical Bridge Columns',
    },
    {
      id: 'target_bridge_beam',
      componentType: 'horizontal_beam',
      structuralRole: 'load_transfer_beam',
      targetPosition: [0, 2.45, -2.5],
      targetRotation: [0, 0, 0, 1],
      positionToleranceMeters: 0.2,
      rotationToleranceDeg: 25,
      requiredConnections: [
        {
          mySnapPointId: 'beam_seat_left',
          targetItemId: 'target_pier_col_1',
          targetSnapPointId: 'column_top_saddle',
        },
        {
          mySnapPointId: 'beam_seat_right',
          targetItemId: 'target_pier_col_2',
          targetSnapPointId: 'column_top_saddle',
        },
      ],
      stageIndex: 4,
      stageName: 'Longitudinal Beam Spans',
    },
  ],
};

export const CASTLE_MANOR_BLUEPRINT: BlueprintDefinition = {
  id: 'castle_manor',
  title: 'Fortified Stone Manor & Towers',
  description:
    'Master Builder challenge. Massive stone architecture with perimeter bastions, arched lintel entries, central courtyard colonnade, and battlement parapets.',
  estimatedBuildTimeMinutes: 45,
  foundationDimensions: [4.0, 0.2, 4.0],
  foundationPosition: [0, 0, -2.5],
  requiredQuantities: {
    concrete_block: 8,
    clay_brick: 8,
    reinforced_column: 4,
    horizontal_beam: 2,
    wall_panel: 4,
    floor_component: 2,
    roof_panel: 2,
  },
  stages: [
    {
      stageIndex: 1,
      title: 'Fortress Footing Pad',
      instruction: 'Inspect the reinforced foundation pad for the manor courtyard.',
      criticalCheck: 'Footing must support high compressive loads of heavy stone towers.',
    },
    {
      stageIndex: 2,
      title: 'Corner Bastion Foundations',
      instruction: 'Lay the interlocking masonry blocks at the 4 corner bastions.',
      criticalCheck: 'Blocks must establish square corner geometry.',
    },
    {
      stageIndex: 3,
      title: 'Curtain Wall Panels',
      instruction: 'Erect the heavy infill curtain walls enclosing the inner courtyard.',
      criticalCheck: 'Curtain walls must lock into corner bastions.',
    },
    {
      stageIndex: 4,
      title: 'Archway Entrance Openings',
      instruction: 'Frame the grand entrance gate and leave defensive arrow slits.',
      criticalCheck: 'Entrance opening must be spanned with load-transfer lintels.',
    },
    {
      stageIndex: 5,
      title: 'Tower Colonnade Columns',
      instruction: 'Install the vertical load-bearing columns supporting the upper battlements.',
      criticalCheck: 'Columns must seat plumb on footing pads.',
    },
    {
      stageIndex: 6,
      title: 'Roof Battlement Trusses',
      instruction: 'Mount the upper roof panels and parapet battlements.',
      criticalCheck: 'All roofs must be anchored into lintels and tower plates.',
    },
  ],
  targets: [...SMALL_HOUSE_BLUEPRINT.targets],
};

export const CREATIVE_SANDBOX_BLUEPRINT: BlueprintDefinition = {
  id: 'creative_sandbox',
  title: 'Creative Construction Sandbox',
  description:
    'Free-form architectural sandbox with no blueprint restrictions. Build freely using all 7 modular materials with live physics and structural validation.',
  estimatedBuildTimeMinutes: 999,
  foundationDimensions: [6.0, 0.15, 6.0],
  foundationPosition: [0, 0, -2.5],
  requiredQuantities: {
    concrete_block: 0,
    clay_brick: 0,
    reinforced_column: 0,
    horizontal_beam: 0,
    wall_panel: 0,
    floor_component: 0,
    roof_panel: 0,
  },
  stages: [
    {
      stageIndex: 1,
      title: 'Free Construction Sandbox',
      instruction: 'Use your hands or desktop controls to place, rotate, and connect any components freely.',
      criticalCheck: 'Test structural stability anytime using the Validate tool.',
    },
  ],
  targets: [],
};

export const BLUEPRINT_LIBRARY: Record<string, BlueprintDefinition> = {
  bungalow: BUNGALOW_BLUEPRINT,
  two_bedroom_bungalow: BUNGALOW_BLUEPRINT,
  small_house_challenge: SMALL_HOUSE_BLUEPRINT,
  small_house: SMALL_HOUSE_BLUEPRINT,
  duplex_villa: DUPLEX_VILLA_BLUEPRINT,
  duplex: DUPLEX_VILLA_BLUEPRINT,
  arched_bridge: ARCHED_BRIDGE_BLUEPRINT,
  bridge: ARCHED_BRIDGE_BLUEPRINT,
  castle_manor: CASTLE_MANOR_BLUEPRINT,
  castle: CASTLE_MANOR_BLUEPRINT,
  creative_sandbox: CREATIVE_SANDBOX_BLUEPRINT,
  sandbox: CREATIVE_SANDBOX_BLUEPRINT,
};

export function getBlueprintById(id: string): BlueprintDefinition {
  return BLUEPRINT_LIBRARY[id] || SMALL_HOUSE_BLUEPRINT;
}
