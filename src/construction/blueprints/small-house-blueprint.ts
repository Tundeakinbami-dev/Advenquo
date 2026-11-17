/**
 * Advenquo: Construction World — Small-House Blueprint Challenge
 *
 * Implements the full 6-stage engineering construction challenge:
 * 1. Identify Foundation
 * 2. Place First Row of Blocks (Foundation Course)
 * 3. Construct Walls
 * 4. Leave Openings for Doors & Windows
 * 5. Install Supporting Components (Columns & Lintel Beam)
 * 6. Add Roof Panels
 */

import type { BlueprintDefinition } from './blueprint-types.js';

export const SMALL_HOUSE_BLUEPRINT: BlueprintDefinition = {
  id: 'small_house_challenge',
  title: 'Modular Eco-Pavilion Small House',
  description:
    'A sustainable tropical modular house challenge designed with Studio Kán. Features passive ventilation door/window openings, reinforced lintel load transfer, and weathered zinc thermal roofing.',
  estimatedBuildTimeMinutes: 15,
  foundationDimensions: [2.8, 0.15, 2.8],
  foundationPosition: [0, 0, -2.5],
  requiredQuantities: {
    concrete_block: 4,
    clay_brick: 4,
    reinforced_column: 2,
    horizontal_beam: 1,
    wall_panel: 2,
    roof_panel: 2,
  },
  stages: [
    {
      stageIndex: 1,
      title: 'Foundation Inspection',
      instruction:
        'Inspect the reinforced concrete foundation slab footing at the center of the workshop.',
      criticalCheck: 'Foundation footing must be level and free of structural cracks.',
    },
    {
      stageIndex: 2,
      title: 'First Row of Blocks (Foundation Course)',
      instruction:
        'Place concrete blocks along the foundation perimeter to establish compressive base corners.',
      criticalCheck: 'Blocks must align with foundation snap sockets and sit flush.',
    },
    {
      stageIndex: 3,
      title: 'Construct the Walls',
      instruction:
        'Erect the rear and side masonry wall panels onto the interlocking base blocks.',
      criticalCheck: 'Wall components must be plumb and interlocked.',
    },
    {
      stageIndex: 4,
      title: 'Door and Window Openings',
      instruction:
        'Leave a 1.2m front opening for the entrance door and a lateral ventilation gap.',
      criticalCheck: 'Openings must remain clear of unbonded free-floating blocks.',
    },
    {
      stageIndex: 5,
      title: 'Install Supporting Components',
      instruction:
        'Position the reinforced structural columns at the front opening and seat the horizontal lintel beam across them.',
      criticalCheck: 'Lintel beam must span both columns with full bearing contact before roof installation.',
    },
    {
      stageIndex: 6,
      title: 'Add the Roof',
      instruction:
        'Mount the sloped corrugated zinc roof panels across the lintel beam and rear wall plate.',
      criticalCheck: 'Roof panels must anchor to the load-bearing beam and wall plates.',
    },
  ],
  targets: [
    // Stage 2: First row of blocks (Foundation course)
    {
      id: 'target_base_block_fl',
      componentType: 'concrete_block',
      structuralRole: 'compressive_masonry',
      targetPosition: [-1.0, 0.1, -1.5],
      targetRotation: [0, 0, 0, 1],
      positionToleranceMeters: 0.18,
      rotationToleranceDeg: 30,
      requiredConnections: [
        {
          mySnapPointId: 'block_bottom_socket',
          targetItemId: 'foundation_slab',
          targetSnapPointId: 'floor_top_deck',
        },
      ],
      stageIndex: 2,
      stageName: 'First Row of Blocks',
    },
    {
      id: 'target_base_block_fr',
      componentType: 'concrete_block',
      structuralRole: 'compressive_masonry',
      targetPosition: [1.0, 0.1, -1.5],
      targetRotation: [0, 0, 0, 1],
      positionToleranceMeters: 0.18,
      rotationToleranceDeg: 30,
      requiredConnections: [
        {
          mySnapPointId: 'block_bottom_socket',
          targetItemId: 'foundation_slab',
          targetSnapPointId: 'floor_top_deck',
        },
      ],
      stageIndex: 2,
      stageName: 'First Row of Blocks',
    },
    {
      id: 'target_base_block_bl',
      componentType: 'concrete_block',
      structuralRole: 'compressive_masonry',
      targetPosition: [-1.0, 0.1, -3.5],
      targetRotation: [0, 0, 0, 1],
      positionToleranceMeters: 0.18,
      rotationToleranceDeg: 30,
      requiredConnections: [
        {
          mySnapPointId: 'block_bottom_socket',
          targetItemId: 'foundation_slab',
          targetSnapPointId: 'floor_top_deck',
        },
      ],
      stageIndex: 2,
      stageName: 'First Row of Blocks',
    },
    {
      id: 'target_base_block_br',
      componentType: 'concrete_block',
      structuralRole: 'compressive_masonry',
      targetPosition: [1.0, 0.1, -3.5],
      targetRotation: [0, 0, 0, 1],
      positionToleranceMeters: 0.18,
      rotationToleranceDeg: 30,
      requiredConnections: [
        {
          mySnapPointId: 'block_bottom_socket',
          targetItemId: 'foundation_slab',
          targetSnapPointId: 'floor_top_deck',
        },
      ],
      stageIndex: 2,
      stageName: 'First Row of Blocks',
    },

    // Stage 3 & 4: Walls with openings
    {
      id: 'target_wall_back',
      componentType: 'wall_panel',
      structuralRole: 'wall_partition',
      targetPosition: [0, 1.4, -3.5],
      targetRotation: [0, 0, 0, 1],
      positionToleranceMeters: 0.2,
      rotationToleranceDeg: 30,
      requiredConnections: [
        {
          mySnapPointId: 'wall_bottom_sill',
          targetItemId: 'target_base_block_bl',
          targetSnapPointId: 'block_top_stud',
        },
      ],
      stageIndex: 3,
      stageName: 'Construct Walls',
    },
    {
      id: 'target_wall_side_left',
      componentType: 'wall_panel',
      structuralRole: 'wall_partition',
      targetPosition: [-1.0, 1.4, -2.5],
      targetRotation: [0, 0.7071, 0, 0.7071], // 90 degrees rotated
      positionToleranceMeters: 0.2,
      rotationToleranceDeg: 30,
      requiredConnections: [
        {
          mySnapPointId: 'wall_bottom_sill',
          targetItemId: 'target_base_block_fl',
          targetSnapPointId: 'block_top_stud',
        },
      ],
      stageIndex: 3,
      stageName: 'Construct Walls',
    },
    {
      id: 'target_sill_brick_1',
      componentType: 'clay_brick',
      structuralRole: 'compressive_masonry',
      targetPosition: [-1.0, 0.25, -2.2],
      targetRotation: [0, 0, 0, 1],
      positionToleranceMeters: 0.18,
      rotationToleranceDeg: 30,
      requiredConnections: [
        {
          mySnapPointId: 'brick_bottom_socket',
          targetItemId: 'target_base_block_fl',
          targetSnapPointId: 'block_top_stud',
        },
      ],
      stageIndex: 4,
      stageName: 'Door and Window Openings',
    },
    {
      id: 'target_sill_brick_2',
      componentType: 'clay_brick',
      structuralRole: 'compressive_masonry',
      targetPosition: [-1.0, 0.25, -2.8],
      targetRotation: [0, 0, 0, 1],
      positionToleranceMeters: 0.18,
      rotationToleranceDeg: 30,
      requiredConnections: [
        {
          mySnapPointId: 'brick_bottom_socket',
          targetItemId: 'target_base_block_bl',
          targetSnapPointId: 'block_top_stud',
        },
      ],
      stageIndex: 4,
      stageName: 'Door and Window Openings',
    },
    {
      id: 'target_door_jamb_brick_1',
      componentType: 'clay_brick',
      structuralRole: 'compressive_masonry',
      targetPosition: [-0.65, 0.25, -1.5],
      targetRotation: [0, 0, 0, 1],
      positionToleranceMeters: 0.18,
      rotationToleranceDeg: 30,
      requiredConnections: [
        {
          mySnapPointId: 'brick_bottom_socket',
          targetItemId: 'target_base_block_fl',
          targetSnapPointId: 'block_top_stud',
        },
      ],
      stageIndex: 4,
      stageName: 'Door and Window Openings',
    },
    {
      id: 'target_door_jamb_brick_2',
      componentType: 'clay_brick',
      structuralRole: 'compressive_masonry',
      targetPosition: [0.65, 0.25, -1.5],
      targetRotation: [0, 0, 0, 1],
      positionToleranceMeters: 0.18,
      rotationToleranceDeg: 30,
      requiredConnections: [
        {
          mySnapPointId: 'brick_bottom_socket',
          targetItemId: 'target_base_block_fr',
          targetSnapPointId: 'block_top_stud',
        },
      ],
      stageIndex: 4,
      stageName: 'Door and Window Openings',
    },

    // Stage 5: Supporting components (Columns and horizontal lintel beam over the opening)
    {
      id: 'target_column_left',
      componentType: 'reinforced_column',
      structuralRole: 'load_bearing_column',
      targetPosition: [-0.65, 1.4, -1.5],
      targetRotation: [0, 0, 0, 1],
      positionToleranceMeters: 0.18,
      rotationToleranceDeg: 25,
      requiredConnections: [
        {
          mySnapPointId: 'column_base_socket',
          targetItemId: 'target_base_block_fl',
          targetSnapPointId: 'block_top_stud',
        },
      ],
      stageIndex: 5,
      stageName: 'Install Supporting Components',
    },
    {
      id: 'target_column_right',
      componentType: 'reinforced_column',
      structuralRole: 'load_bearing_column',
      targetPosition: [0.65, 1.4, -1.5],
      targetRotation: [0, 0, 0, 1],
      positionToleranceMeters: 0.18,
      rotationToleranceDeg: 25,
      requiredConnections: [
        {
          mySnapPointId: 'column_base_socket',
          targetItemId: 'target_base_block_fr',
          targetSnapPointId: 'block_top_stud',
        },
      ],
      stageIndex: 5,
      stageName: 'Install Supporting Components',
    },
    {
      id: 'target_lintel_beam',
      componentType: 'horizontal_beam',
      structuralRole: 'load_transfer_beam',
      targetPosition: [0, 2.75, -1.5],
      targetRotation: [0, 0, 0, 1],
      positionToleranceMeters: 0.2,
      rotationToleranceDeg: 25,
      requiredConnections: [
        {
          mySnapPointId: 'beam_seat_left',
          targetItemId: 'target_column_left',
          targetSnapPointId: 'column_top_saddle',
        },
        {
          mySnapPointId: 'beam_seat_right',
          targetItemId: 'target_column_right',
          targetSnapPointId: 'column_top_saddle',
        },
      ],
      stageIndex: 5,
      stageName: 'Install Supporting Components',
    },

    // Stage 6: Roof Panels
    {
      id: 'target_roof_panel_left',
      componentType: 'roof_panel',
      structuralRole: 'weather_enclosure',
      targetPosition: [-0.6, 2.95, -2.5],
      targetRotation: [0, 0, 0, 1],
      positionToleranceMeters: 0.25,
      rotationToleranceDeg: 30,
      requiredConnections: [
        {
          mySnapPointId: 'roof_seat_left',
          targetItemId: 'target_lintel_beam',
          targetSnapPointId: 'beam_top_deck_left',
        },
      ],
      stageIndex: 6,
      stageName: 'Add the Roof',
    },
    {
      id: 'target_roof_panel_right',
      componentType: 'roof_panel',
      structuralRole: 'weather_enclosure',
      targetPosition: [0.6, 2.95, -2.5],
      targetRotation: [0, 0, 0, 1],
      positionToleranceMeters: 0.25,
      rotationToleranceDeg: 30,
      requiredConnections: [
        {
          mySnapPointId: 'roof_seat_right',
          targetItemId: 'target_lintel_beam',
          targetSnapPointId: 'beam_top_deck_right',
        },
      ],
      stageIndex: 6,
      stageName: 'Add the Roof',
    },
  ],
};
