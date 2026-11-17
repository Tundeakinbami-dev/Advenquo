/**
 * Advenquo: Architectural Blueprint System — Authoritative Building Design
 *
 * Single source of truth for:
 * - 3D reference geometry
 * - Top-down floor plans
 * - 4 Architectural elevations (Front, Rear, Left, Right)
 * - Exploded construction layers
 * - Construction component targets & snap points
 * - Dimensions, room zoning, and validation requirements
 *
 * All representations derive deterministically from this specification.
 */

import type { ComponentType, StructuralRole } from '../core/construction-types.js';

export type ConstructionLayerId =
  | 'foundation'
  | 'floor_slab'
  | 'structural_walls'
  | 'internal_partitions'
  | 'openings'
  | 'roof_structure'
  | 'roofing_materials'
  | 'doors_windows'
  | 'finishing';

export interface ConstructionLayerDefinition {
  id: ConstructionLayerId;
  name: string;
  order: number;
  description: string;
  explodedOffset: [number, number, number]; // Offset vector when fully exploded
  colorHex: number;
}

export interface RoomZone {
  id: string;
  name: string;
  bounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
  areaM2: number;
}

export interface BuildingDimension {
  id: string;
  label: string;
  valueMeters: number;
  startPoint: [number, number, number];
  endPoint: [number, number, number];
  view: 'plan' | 'elevation_front' | 'elevation_rear' | 'elevation_left' | 'elevation_right' | 'all';
}

export interface BuildingElevationDatum {
  id: string;
  name: string;
  elevationM: number; // Y height in meters above datum 0.00
}

export interface ArchitecturalDoorOpening {
  id: string;
  roomId: string;
  position: [number, number, number];
  widthM: number;
  heightM: number;
  swingAngleDeg: number;
  isExterior: boolean;
}

export interface ArchitecturalWindowOpening {
  id: string;
  roomId: string;
  position: [number, number, number];
  widthM: number;
  heightM: number;
  sillHeightM: number;
}

export interface DesignComponent {
  id: string;
  componentType: ComponentType;
  structuralRole: StructuralRole;
  layerId: ConstructionLayerId;
  stageIndex: number; // 1 to 7
  position: [number, number, number];
  rotation: [number, number, number, number]; // Quaternion [x, y, z, w]
  dimensions: [number, number, number]; // width (X), height (Y), depth (Z)
  description: string;
  criticalLoadBearing?: boolean;
  positionToleranceM?: number;
  rotationToleranceDeg?: number;
}

export interface AuthoritativeBuildingDesign {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  overallDimensions: {
    width: number; // X in meters
    height: number; // Y in meters
    depth: number; // Z in meters
  };
  foundationOrigin: [number, number, number];
  layers: ConstructionLayerDefinition[];
  rooms: RoomZone[];
  elevationDatums: BuildingElevationDatum[];
  dimensions: BuildingDimension[];
  doorOpenings: ArchitecturalDoorOpening[];
  windowOpenings: ArchitecturalWindowOpening[];
  components: DesignComponent[];
  totalAreaM2: number;
}

export const CONSTRUCTION_LAYERS: ConstructionLayerDefinition[] = [
  {
    id: 'foundation',
    name: '1. Site Layout & Foundation',
    order: 1,
    description: 'Compacted base footing and reinforced perimeter foundation masonry',
    explodedOffset: [0, -0.6, 0],
    colorHex: 0x78909c,
  },
  {
    id: 'floor_slab',
    name: '2. Floor Slab',
    order: 2,
    description: 'Reinforced ground floor slab and moisture barrier deck',
    explodedOffset: [0, -0.2, 0],
    colorHex: 0x90a4ae,
  },
  {
    id: 'structural_walls',
    name: '3. Structural Walls',
    order: 3,
    description: 'Exterior load-bearing perimeter masonry walls and lintel beams',
    explodedOffset: [0, 0.4, 0],
    colorHex: 0xb0bec5,
  },
  {
    id: 'internal_partitions',
    name: '4. Internal Partitions',
    order: 4,
    description: 'Interior room dividers creating bedrooms, living room, and bathroom',
    explodedOffset: [0, 0.8, 0],
    colorHex: 0xcfd8dc,
  },
  {
    id: 'openings',
    name: '5. Openings & Lintels',
    order: 5,
    description: 'Structural framing and load-transfer beams over doors and windows',
    explodedOffset: [0, 1.2, 0],
    colorHex: 0x81d4fa,
  },
  {
    id: 'roof_structure',
    name: '6. Roof Structure',
    order: 6,
    description: 'Engineered timber roof trusses and ridge beam framing',
    explodedOffset: [0, 1.8, 0],
    colorHex: 0xffb74d,
  },
  {
    id: 'roofing_materials',
    name: '7. Roofing Materials',
    order: 7,
    description: 'Weatherproof corrugated roofing panels and ridge caps',
    explodedOffset: [0, 2.4, 0],
    colorHex: 0x4fc3f7,
  },
  {
    id: 'doors_windows',
    name: '8. Doors & Windows',
    order: 8,
    description: 'Exterior and interior portal doors, glazing, and window casements',
    explodedOffset: [0, 1.0, 0.4],
    colorHex: 0x80cbc4,
  },
  {
    id: 'finishing',
    name: '9. Finishing Elements',
    order: 9,
    description: 'Fascia boards, corner trims, and architectural fixtures',
    explodedOffset: [0, 2.8, 0],
    colorHex: 0xaed581,
  },
];

export const ELEVATION_DATUMS: BuildingElevationDatum[] = [
  { id: 'datum_ground', name: 'Ground Level ±0.00', elevationM: 0.0 },
  { id: 'datum_slab', name: 'Finished Floor Level +0.20', elevationM: 0.2 },
  { id: 'datum_sill', name: 'Window Sill Level +1.00', elevationM: 1.0 },
  { id: 'datum_lintel', name: 'Lintel / Wall Head +2.60', elevationM: 2.6 },
  { id: 'datum_ridge', name: 'Roof Ridge Apex +3.80', elevationM: 3.8 },
];
