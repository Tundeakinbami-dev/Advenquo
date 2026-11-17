/**
 * Advenquo: Construction World — Construction Component Catalog
 *
 * Authoritative registry of all 17 modular construction components:
 * Individual components:
 * 1. Clay Brick (clay_brick)
 * 2. Sandcrete Block (sandcrete_block)
 * 3. Concrete Block (concrete_block)
 * 4. Small Foundation Block (foundation_block)
 * 5. Timber Piece (timber_piece)
 * 6. Reinforcement Bar (rebar)
 * 7. Steel Connector (steel_connector)
 *
 * Larger components (seated two-handed manipulation supported):
 * 8. Reinforced Column (reinforced_column / column)
 * 9. Horizontal Beam (horizontal_beam / beam)
 * 10. Wall Panel (wall_panel)
 * 11. Floor Slab (floor_component / floor_slab)
 * 12. Staircase (staircase)
 * 13. Door Frame (door_frame)
 * 14. Window Frame (window_frame)
 * 15. Roof Truss (roof_truss)
 * 16. Roof Panel (roof_panel)
 * 17. Bridge Section (bridge_section)
 */

import type { ComponentSpecification, ComponentType } from '../core/construction-types.js';
import { MATERIAL_SPECS } from './material-specs.js';

export function getComponentSpec(type: ComponentType): ComponentSpecification {
  const spec = CONSTRUCTION_CATALOG[type];
  if (!spec) {
    throw new Error(`Unknown component type: ${type}`);
  }
  return spec;
}

export const CONSTRUCTION_CATALOG: Record<ComponentType, ComponentSpecification> = {
  // 1. Clay Brick
  clay_brick: {
    type: 'clay_brick',
    name: 'Modular Clay Brick',
    description: 'High-density kiln-fired terracotta brick with interlock studs for masonry walls.',
    dimensions: [0.24, 0.08, 0.12],
    massKg: 4.4,
    structuralRole: 'compressive_masonry',
    material: MATERIAL_SPECS.terracotta_clay,
    requiresTwoHands: false,
    snapPoints: [
      {
        id: 'brick_top_stud',
        type: 'stud_socket',
        role: 'male',
        localPosition: [0, 0.04, 0],
        localNormal: [0, 1, 0],
        compatibleTypes: ['clay_brick', 'horizontal_beam', 'beam', 'roof_panel'],
      },
      {
        id: 'brick_bottom_socket',
        type: 'stud_socket',
        role: 'female',
        localPosition: [0, -0.04, 0],
        localNormal: [0, -1, 0],
        compatibleTypes: ['clay_brick', 'concrete_block', 'foundation_block'],
      },
      {
        id: 'brick_left_joint',
        type: 'stud_socket',
        role: 'neutral',
        localPosition: [-0.12, 0, 0],
        localNormal: [-1, 0, 0],
        compatibleTypes: ['clay_brick'],
      },
      {
        id: 'brick_right_joint',
        type: 'stud_socket',
        role: 'neutral',
        localPosition: [0.12, 0, 0],
        localNormal: [1, 0, 0],
        compatibleTypes: ['clay_brick'],
      },
    ],
  },

  // 2. Sandcrete Block
  sandcrete_block: {
    type: 'sandcrete_block',
    name: 'Hollow Sandcrete Block',
    description: 'Vibrated sand-cement construction unit common in residential tropical architecture.',
    dimensions: [0.45, 0.22, 0.15],
    massKg: 14.2,
    structuralRole: 'compressive_masonry',
    material: MATERIAL_SPECS.sandcrete,
    requiresTwoHands: false,
    snapPoints: [
      {
        id: 'sandcrete_top_stud',
        type: 'stud_socket',
        role: 'male',
        localPosition: [0, 0.11, 0],
        localNormal: [0, 1, 0],
        compatibleTypes: ['sandcrete_block', 'horizontal_beam', 'beam', 'door_frame', 'window_frame'],
      },
      {
        id: 'sandcrete_bottom_socket',
        type: 'stud_socket',
        role: 'female',
        localPosition: [0, -0.11, 0],
        localNormal: [0, -1, 0],
        compatibleTypes: ['sandcrete_block', 'foundation_block', 'concrete_block'],
      },
      {
        id: 'sandcrete_left',
        type: 'stud_socket',
        role: 'neutral',
        localPosition: [-0.225, 0, 0],
        localNormal: [-1, 0, 0],
        compatibleTypes: ['sandcrete_block'],
      },
      {
        id: 'sandcrete_right',
        type: 'stud_socket',
        role: 'neutral',
        localPosition: [0.225, 0, 0],
        localNormal: [1, 0, 0],
        compatibleTypes: ['sandcrete_block'],
      },
    ],
  },

  // 3. Concrete Block
  concrete_block: {
    type: 'concrete_block',
    name: 'Hollow-Core Concrete Block',
    description: 'Standard aggregate concrete masonry unit (CMU) for foundation courses and heavy walls.',
    dimensions: [0.4, 0.2, 0.2],
    massKg: 16.0,
    structuralRole: 'compressive_masonry',
    material: MATERIAL_SPECS.aggregate_concrete_block,
    requiresTwoHands: false,
    snapPoints: [
      {
        id: 'block_top_stud',
        type: 'stud_socket',
        role: 'male',
        localPosition: [0, 0.1, 0],
        localNormal: [0, 1, 0],
        compatibleTypes: ['concrete_block', 'clay_brick', 'horizontal_beam', 'beam', 'reinforced_column', 'column', 'wall_panel'],
      },
      {
        id: 'block_bottom_socket',
        type: 'stud_socket',
        role: 'female',
        localPosition: [0, -0.1, 0],
        localNormal: [0, -1, 0],
        compatibleTypes: ['concrete_block', 'floor_component', 'floor_slab', 'foundation_block'],
      },
      {
        id: 'block_left_joint',
        type: 'stud_socket',
        role: 'neutral',
        localPosition: [-0.2, 0, 0],
        localNormal: [-1, 0, 0],
        compatibleTypes: ['concrete_block'],
      },
      {
        id: 'block_right_joint',
        type: 'stud_socket',
        role: 'neutral',
        localPosition: [0.2, 0, 0],
        localNormal: [1, 0, 0],
        compatibleTypes: ['concrete_block'],
      },
    ],
  },

  // 4. Small Foundation Block
  foundation_block: {
    type: 'foundation_block',
    name: 'Foundation Footing Block',
    description: 'High-density reinforced concrete footing pad providing ground anchor points.',
    dimensions: [0.6, 0.3, 0.6],
    massKg: 135.0,
    structuralRole: 'foundation',
    material: MATERIAL_SPECS.foundation_heavy_concrete,
    requiresTwoHands: false,
    snapPoints: [
      {
        id: 'ftg_top_anchor',
        type: 'column_anchor',
        role: 'female',
        localPosition: [0, 0.15, 0],
        localNormal: [0, 1, 0],
        compatibleTypes: ['reinforced_column', 'column', 'concrete_block', 'sandcrete_block', 'steel_connector'],
      },
      {
        id: 'ftg_bottom_ground',
        type: 'column_anchor',
        role: 'neutral',
        localPosition: [0, -0.15, 0],
        localNormal: [0, -1, 0],
        compatibleTypes: [],
      },
    ],
  },

  // 5. Timber Piece
  timber_piece: {
    type: 'timber_piece',
    name: 'Structural Hardwood Batten',
    description: 'Kiln-dried Iroko timber member for ceiling joists, purlins, and wall framing.',
    dimensions: [0.1, 0.05, 1.2],
    massKg: 4.5,
    structuralRole: 'truss_support',
    material: MATERIAL_SPECS.hardwood_timber,
    requiresTwoHands: false,
    snapPoints: [
      {
        id: 'timber_end_a',
        type: 'truss_ridge',
        role: 'neutral',
        localPosition: [0, 0, -0.6],
        localNormal: [0, 0, -1],
        compatibleTypes: ['timber_piece', 'roof_truss', 'horizontal_beam'],
      },
      {
        id: 'timber_end_b',
        type: 'truss_ridge',
        role: 'neutral',
        localPosition: [0, 0, 0.6],
        localNormal: [0, 0, 1],
        compatibleTypes: ['timber_piece', 'roof_truss', 'roof_panel'],
      },
    ],
  },

  // 6. Reinforcement Bar
  rebar: {
    type: 'rebar',
    name: 'High-Yield Ribbed Rebar Cage',
    description: 'Grade 500 ribbed steel reinforcement rod for tensile column and beam core tying.',
    dimensions: [0.08, 1.8, 0.08],
    massKg: 8.2,
    structuralRole: 'foundation',
    material: MATERIAL_SPECS.structural_steel,
    requiresTwoHands: false,
    snapPoints: [
      {
        id: 'rebar_top',
        type: 'rebar_tie',
        role: 'male',
        localPosition: [0, 0.9, 0],
        localNormal: [0, 1, 0],
        compatibleTypes: ['reinforced_column', 'column', 'steel_connector'],
      },
      {
        id: 'rebar_bottom',
        type: 'rebar_tie',
        role: 'female',
        localPosition: [0, -0.9, 0],
        localNormal: [0, -1, 0],
        compatibleTypes: ['foundation_block'],
      },
    ],
  },

  // 7. Steel Connector
  steel_connector: {
    type: 'steel_connector',
    name: 'Galvanized Steel Gusset Joint',
    description: 'Heavy gauge steel bracket for moment-resisting beam-to-column and truss connections.',
    dimensions: [0.2, 0.2, 0.2],
    massKg: 6.8,
    structuralRole: 'portal_frame',
    material: MATERIAL_SPECS.structural_steel,
    requiresTwoHands: false,
    snapPoints: [
      {
        id: 'connector_center',
        type: 'column_anchor',
        role: 'neutral',
        localPosition: [0, 0, 0],
        localNormal: [0, 1, 0],
        compatibleTypes: ['reinforced_column', 'column', 'horizontal_beam', 'beam', 'roof_truss'],
      },
    ],
  },

  // 8. Reinforced Column
  reinforced_column: {
    type: 'reinforced_column',
    name: 'Reinforced Concrete Structural Column',
    description: 'Vertical load-bearing column with 4 rebar ties for multi-story load paths.',
    dimensions: [0.3, 2.4, 0.3],
    massKg: 520.0,
    structuralRole: 'load_bearing_column',
    material: MATERIAL_SPECS.reinforced_structural_concrete,
    requiresTwoHands: true,
    snapPoints: [
      {
        id: 'column_base_socket',
        type: 'column_anchor',
        role: 'female',
        localPosition: [0, -1.2, 0],
        localNormal: [0, -1, 0],
        compatibleTypes: ['concrete_block', 'foundation_block', 'floor_component', 'floor_slab'],
      },
      {
        id: 'column_cap_stud',
        type: 'column_anchor',
        role: 'male',
        localPosition: [0, 1.2, 0],
        localNormal: [0, 1, 0],
        compatibleTypes: ['horizontal_beam', 'beam', 'reinforced_column', 'column', 'steel_connector'],
      },
      {
        id: 'column_north_tie',
        type: 'beam_seat',
        role: 'neutral',
        localPosition: [0, 1.0, 0.15],
        localNormal: [0, 0, 1],
        compatibleTypes: ['horizontal_beam', 'beam', 'wall_panel'],
      },
      {
        id: 'column_south_tie',
        type: 'beam_seat',
        role: 'neutral',
        localPosition: [0, 1.0, -0.15],
        localNormal: [0, 0, -1],
        compatibleTypes: ['horizontal_beam', 'beam', 'wall_panel'],
      },
    ],
  },

  // Alias: column -> reinforced_column
  column: {
    type: 'column',
    name: 'Reinforced Concrete Structural Column',
    description: 'Vertical load-bearing column with 4 rebar ties for multi-story load paths.',
    dimensions: [0.3, 2.4, 0.3],
    massKg: 520.0,
    structuralRole: 'load_bearing_column',
    material: MATERIAL_SPECS.reinforced_structural_concrete,
    requiresTwoHands: true,
    snapPoints: [
      {
        id: 'column_base_socket',
        type: 'column_anchor',
        role: 'female',
        localPosition: [0, -1.2, 0],
        localNormal: [0, -1, 0],
        compatibleTypes: ['concrete_block', 'foundation_block', 'floor_component', 'floor_slab'],
      },
      {
        id: 'column_cap_stud',
        type: 'column_anchor',
        role: 'male',
        localPosition: [0, 1.2, 0],
        localNormal: [0, 1, 0],
        compatibleTypes: ['horizontal_beam', 'beam', 'reinforced_column', 'column', 'steel_connector'],
      },
    ],
  },

  // 9. Horizontal Beam
  horizontal_beam: {
    type: 'horizontal_beam',
    name: 'Precast Horizontal Lintel Beam',
    description: 'Transfers vertical floor and wall loads across window/door openings to columns.',
    dimensions: [2.0, 0.25, 0.25],
    massKg: 300.0,
    structuralRole: 'load_transfer_beam',
    material: MATERIAL_SPECS.reinforced_structural_concrete,
    requiresTwoHands: true,
    snapPoints: [
      {
        id: 'beam_seat_left',
        type: 'beam_seat',
        role: 'female',
        localPosition: [-0.9, -0.125, 0],
        localNormal: [0, -1, 0],
        compatibleTypes: ['reinforced_column', 'column', 'concrete_block', 'clay_brick'],
      },
      {
        id: 'beam_seat_right',
        type: 'beam_seat',
        role: 'female',
        localPosition: [0.9, -0.125, 0],
        localNormal: [0, -1, 0],
        compatibleTypes: ['reinforced_column', 'column', 'concrete_block', 'clay_brick'],
      },
      {
        id: 'beam_top_flange',
        type: 'beam_seat',
        role: 'male',
        localPosition: [0, 0.125, 0],
        localNormal: [0, 1, 0],
        compatibleTypes: ['floor_component', 'floor_slab', 'wall_panel', 'roof_panel', 'roof_truss'],
      },
    ],
  },

  // Alias: beam -> horizontal_beam
  beam: {
    type: 'beam',
    name: 'Precast Horizontal Lintel Beam',
    description: 'Transfers vertical floor and wall loads across window/door openings to columns.',
    dimensions: [2.0, 0.25, 0.25],
    massKg: 300.0,
    structuralRole: 'load_transfer_beam',
    material: MATERIAL_SPECS.reinforced_structural_concrete,
    requiresTwoHands: true,
    snapPoints: [
      {
        id: 'beam_seat_left',
        type: 'beam_seat',
        role: 'female',
        localPosition: [-0.9, -0.125, 0],
        localNormal: [0, -1, 0],
        compatibleTypes: ['reinforced_column', 'column', 'concrete_block', 'clay_brick'],
      },
      {
        id: 'beam_seat_right',
        type: 'beam_seat',
        role: 'female',
        localPosition: [0.9, -0.125, 0],
        localNormal: [0, -1, 0],
        compatibleTypes: ['reinforced_column', 'column', 'concrete_block', 'clay_brick'],
      },
      {
        id: 'beam_top_flange',
        type: 'beam_seat',
        role: 'male',
        localPosition: [0, 0.125, 0],
        localNormal: [0, 1, 0],
        compatibleTypes: ['floor_component', 'floor_slab', 'wall_panel', 'roof_panel', 'roof_truss'],
      },
    ],
  },

  // 10. Wall Panel
  wall_panel: {
    type: 'wall_panel',
    name: 'Pre-insulated Modular Wall Panel',
    description: 'Full-height modular wall section with window/door framing recesses.',
    dimensions: [1.2, 2.4, 0.2],
    massKg: 1150.0,
    structuralRole: 'wall_partition',
    material: MATERIAL_SPECS.reinforced_structural_concrete,
    requiresTwoHands: true,
    snapPoints: [
      {
        id: 'panel_bottom_track',
        type: 'panel_edge',
        role: 'female',
        localPosition: [0, -1.2, 0],
        localNormal: [0, -1, 0],
        compatibleTypes: ['floor_component', 'floor_slab', 'concrete_block'],
      },
      {
        id: 'panel_top_track',
        type: 'panel_edge',
        role: 'male',
        localPosition: [0, 1.2, 0],
        localNormal: [0, 1, 0],
        compatibleTypes: ['horizontal_beam', 'beam', 'roof_panel', 'floor_component', 'floor_slab'],
      },
      {
        id: 'panel_left_edge',
        type: 'panel_edge',
        role: 'neutral',
        localPosition: [-0.6, 0, 0],
        localNormal: [-1, 0, 0],
        compatibleTypes: ['wall_panel', 'reinforced_column', 'column'],
      },
      {
        id: 'panel_right_edge',
        type: 'panel_edge',
        role: 'neutral',
        localPosition: [0.6, 0, 0],
        localNormal: [1, 0, 0],
        compatibleTypes: ['wall_panel', 'reinforced_column', 'column'],
      },
    ],
  },

  // 11. Floor Slab / Component
  floor_component: {
    type: 'floor_component',
    name: 'Hollow-Core Precast Floor Slab',
    description: 'Prestressed horizontal floor slab engineered for spans up to 6 meters.',
    dimensions: [2.4, 0.15, 1.2],
    massKg: 1030.0,
    structuralRole: 'horizontal_deck',
    material: MATERIAL_SPECS.precast_deck_concrete,
    requiresTwoHands: true,
    snapPoints: [
      {
        id: 'slab_seat_left',
        type: 'beam_seat',
        role: 'female',
        localPosition: [-1.1, -0.075, 0],
        localNormal: [0, -1, 0],
        compatibleTypes: ['horizontal_beam', 'beam', 'concrete_block'],
      },
      {
        id: 'slab_seat_right',
        type: 'beam_seat',
        role: 'female',
        localPosition: [1.1, -0.075, 0],
        localNormal: [0, -1, 0],
        compatibleTypes: ['horizontal_beam', 'beam', 'concrete_block'],
      },
      {
        id: 'slab_top_surface',
        type: 'stud_socket',
        role: 'male',
        localPosition: [0, 0.075, 0],
        localNormal: [0, 1, 0],
        compatibleTypes: ['reinforced_column', 'column', 'wall_panel', 'staircase', 'concrete_block'],
      },
    ],
  },

  // Alias: floor_slab -> floor_component
  floor_slab: {
    type: 'floor_slab',
    name: 'Hollow-Core Precast Floor Slab',
    description: 'Prestressed horizontal floor slab engineered for spans up to 6 meters.',
    dimensions: [2.4, 0.15, 1.2],
    massKg: 1030.0,
    structuralRole: 'horizontal_deck',
    material: MATERIAL_SPECS.precast_deck_concrete,
    requiresTwoHands: true,
    snapPoints: [
      {
        id: 'slab_seat_left',
        type: 'beam_seat',
        role: 'female',
        localPosition: [-1.1, -0.075, 0],
        localNormal: [0, -1, 0],
        compatibleTypes: ['horizontal_beam', 'beam', 'concrete_block'],
      },
      {
        id: 'slab_seat_right',
        type: 'beam_seat',
        role: 'female',
        localPosition: [1.1, -0.075, 0],
        localNormal: [0, -1, 0],
        compatibleTypes: ['horizontal_beam', 'beam', 'concrete_block'],
      },
      {
        id: 'slab_top_surface',
        type: 'stud_socket',
        role: 'male',
        localPosition: [0, 0.075, 0],
        localNormal: [0, 1, 0],
        compatibleTypes: ['reinforced_column', 'column', 'wall_panel', 'staircase', 'concrete_block'],
      },
    ],
  },

  // 12. Staircase
  staircase: {
    type: 'staircase',
    name: 'Precast Modular Stair Flight',
    description: 'Concrete monolithic stair flight with 12 steps and integral landing connections.',
    dimensions: [1.0, 2.4, 2.4],
    massKg: 850.0,
    structuralRole: 'stair_circulation',
    material: MATERIAL_SPECS.precast_deck_concrete,
    requiresTwoHands: true,
    snapPoints: [
      {
        id: 'stair_bottom_mount',
        type: 'stair_mount',
        role: 'female',
        localPosition: [0, -1.2, 1.2],
        localNormal: [0, -1, 0],
        compatibleTypes: ['floor_component', 'floor_slab', 'foundation_block'],
      },
      {
        id: 'stair_top_landing',
        type: 'stair_mount',
        role: 'male',
        localPosition: [0, 1.2, -1.2],
        localNormal: [0, 1, 0],
        compatibleTypes: ['floor_component', 'floor_slab', 'horizontal_beam', 'beam'],
      },
    ],
  },

  // 13. Door Frame
  door_frame: {
    type: 'door_frame',
    name: 'Heavy Architectural Door Jamb Frame',
    description: 'Reinforced portal frame fitting standard 0.9m x 2.1m pedestrian openings.',
    dimensions: [1.0, 2.1, 0.2],
    massKg: 35.0,
    structuralRole: 'portal_frame',
    material: MATERIAL_SPECS.architectural_glazing_frame,
    requiresTwoHands: false,
    snapPoints: [
      {
        id: 'door_bottom_threshold',
        type: 'frame_slot',
        role: 'female',
        localPosition: [0, -1.05, 0],
        localNormal: [0, -1, 0],
        compatibleTypes: ['floor_component', 'floor_slab', 'concrete_block', 'sandcrete_block'],
      },
      {
        id: 'door_top_lintel',
        type: 'frame_slot',
        role: 'neutral',
        localPosition: [0, 1.05, 0],
        localNormal: [0, 1, 0],
        compatibleTypes: ['horizontal_beam', 'beam', 'clay_brick', 'concrete_block'],
      },
    ],
  },

  // 14. Window Frame
  window_frame: {
    type: 'window_frame',
    name: 'Powder-Coated Double Casement Window Frame',
    description: 'Thermally broken aluminum frame with pre-installed safety glazing.',
    dimensions: [1.2, 1.2, 0.15],
    massKg: 28.0,
    structuralRole: 'portal_frame',
    material: MATERIAL_SPECS.architectural_glazing_frame,
    requiresTwoHands: false,
    snapPoints: [
      {
        id: 'window_sill',
        type: 'frame_slot',
        role: 'female',
        localPosition: [0, -0.6, 0],
        localNormal: [0, -1, 0],
        compatibleTypes: ['clay_brick', 'concrete_block', 'sandcrete_block'],
      },
      {
        id: 'window_head',
        type: 'frame_slot',
        role: 'neutral',
        localPosition: [0, 0.6, 0],
        localNormal: [0, 1, 0],
        compatibleTypes: ['horizontal_beam', 'beam', 'clay_brick'],
      },
    ],
  },

  // 15. Roof Truss
  roof_truss: {
    type: 'roof_truss',
    name: 'Engineered Hardwood King-Post Truss',
    description: 'Triangulated timber truss engineered for 4m to 6m spans with galvanized gusset plates.',
    dimensions: [4.0, 1.2, 0.15],
    massKg: 85.0,
    structuralRole: 'truss_support',
    material: MATERIAL_SPECS.hardwood_timber,
    requiresTwoHands: true,
    snapPoints: [
      {
        id: 'truss_seat_left',
        type: 'beam_seat',
        role: 'female',
        localPosition: [-1.9, -0.6, 0],
        localNormal: [0, -1, 0],
        compatibleTypes: ['horizontal_beam', 'beam', 'reinforced_column', 'column'],
      },
      {
        id: 'truss_seat_right',
        type: 'beam_seat',
        role: 'female',
        localPosition: [1.9, -0.6, 0],
        localNormal: [0, -1, 0],
        compatibleTypes: ['horizontal_beam', 'beam', 'reinforced_column', 'column'],
      },
      {
        id: 'truss_apex',
        type: 'truss_ridge',
        role: 'male',
        localPosition: [0, 0.6, 0],
        localNormal: [0, 1, 0],
        compatibleTypes: ['roof_panel', 'timber_piece'],
      },
    ],
  },

  // 16. Roof Panel
  roof_panel: {
    type: 'roof_panel',
    name: 'Corrugated Zinc Over-Rafter Roof Panel',
    description: 'Tropical weather-resistant roofing sheet with 15-degree water shedding pitch.',
    dimensions: [2.6, 0.08, 1.4],
    massKg: 360.0,
    structuralRole: 'weather_enclosure',
    material: MATERIAL_SPECS.corrugated_zinc_roofing,
    requiresTwoHands: true,
    snapPoints: [
      {
        id: 'roof_bearing_left',
        type: 'roof_ridge',
        role: 'female',
        localPosition: [-1.2, -0.04, 0],
        localNormal: [0, -1, 0],
        compatibleTypes: ['horizontal_beam', 'beam', 'wall_panel', 'roof_truss'],
      },
      {
        id: 'roof_bearing_right',
        type: 'roof_ridge',
        role: 'female',
        localPosition: [1.2, -0.04, 0],
        localNormal: [0, -1, 0],
        compatibleTypes: ['horizontal_beam', 'beam', 'wall_panel', 'roof_truss'],
      },
    ],
  },

  // 17. Bridge Section
  bridge_section: {
    type: 'bridge_section',
    name: 'Precast Segmental Box Girder Deck',
    description: 'Heavy infrastructure box girder bridge span with integrated deck and guardrails.',
    dimensions: [3.0, 0.6, 2.0],
    massKg: 2800.0,
    structuralRole: 'span_deck',
    material: MATERIAL_SPECS.reinforced_structural_concrete,
    requiresTwoHands: true,
    snapPoints: [
      {
        id: 'bridge_pier_bearing_a',
        type: 'pier_cap',
        role: 'female',
        localPosition: [0, -0.3, -1.4],
        localNormal: [0, -1, 0],
        compatibleTypes: ['reinforced_column', 'column', 'foundation_block'],
      },
      {
        id: 'bridge_pier_bearing_b',
        type: 'pier_cap',
        role: 'female',
        localPosition: [0, -0.3, 1.4],
        localNormal: [0, -1, 0],
        compatibleTypes: ['reinforced_column', 'column', 'foundation_block'],
      },
      {
        id: 'bridge_joint_north',
        type: 'pier_cap',
        role: 'neutral',
        localPosition: [0, 0, 1.5],
        localNormal: [0, 0, 1],
        compatibleTypes: ['bridge_section'],
      },
    ],
  },
};
