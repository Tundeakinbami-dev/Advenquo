/**
 * Advenquo: Seated VR Construction & Building Game — Core Type Definitions
 *
 * Defines domain types for:
 * - 17 Modular construction components (individual blocks & larger preassembled elements)
 * - Seated two-handed XR interaction & reach optimization
 * - Snap sockets and assembly graph topology
 * - Physical material properties and structural roles
 * - Blueprint verification, educational structural simulation, scoring, and progression
 */

export type ComponentType =
  // Individual components
  | 'clay_brick'
  | 'sandcrete_block'
  | 'concrete_block'
  | 'foundation_block'
  | 'timber_piece'
  | 'rebar'
  | 'steel_connector'
  // Larger components
  | 'reinforced_column'
  | 'column'
  | 'horizontal_beam'
  | 'beam'
  | 'wall_panel'
  | 'floor_component'
  | 'floor_slab'
  | 'staircase'
  | 'door_frame'
  | 'window_frame'
  | 'roof_truss'
  | 'roof_panel'
  | 'bridge_section';

export type StructuralRole =
  | 'foundation'
  | 'compressive_masonry'
  | 'load_bearing_column'
  | 'load_transfer_beam'
  | 'horizontal_deck'
  | 'wall_partition'
  | 'stair_circulation'
  | 'portal_frame'
  | 'truss_support'
  | 'weather_enclosure'
  | 'span_deck';

export type SnapSocketRole = 'male' | 'female' | 'neutral';

export type SnapSocketType =
  | 'stud_socket'
  | 'column_anchor'
  | 'beam_seat'
  | 'panel_edge'
  | 'stair_mount'
  | 'frame_slot'
  | 'truss_ridge'
  | 'roof_ridge'
  | 'pier_cap'
  | 'rebar_tie';

export interface SnapPoint {
  id: string;
  type: SnapSocketType;
  role: SnapSocketRole;
  localPosition: [number, number, number];
  localNormal: [number, number, number];
  compatibleTypes: ComponentType[];
  occupiedByEntityId?: string;
  occupiedSnapPointId?: string;
}

export interface MaterialPhysicalProperties {
  name: string;
  densityKgM3: number;
  compressiveStrengthMpa: number;
  tensileStrengthMpa: number;
  friction: number;
  restitution: number;
  colorHex: number;
  roughness: number;
  metalness: number;
}

export interface ComponentSpecification {
  type: ComponentType;
  name: string;
  description: string;
  dimensions: [number, number, number]; // width (X), height (Y), depth (Z) in meters
  massKg: number;
  structuralRole: StructuralRole;
  material: MaterialPhysicalProperties;
  snapPoints: SnapPoint[];
  requiresTwoHands: boolean;
}

export interface PlacedComponentRecord {
  instanceId: string;
  componentType: ComponentType;
  position: [number, number, number];
  rotation: [number, number, number, number]; // Quaternion [x, y, z, w]
  structuralRole: StructuralRole;
  isGrounded?: boolean;
  connections: Array<{
    mySnapPointId: string;
    targetInstanceId: string;
    targetSnapPointId: string;
  }>;
  isStaticOptimized: boolean;
}

export interface SnapConnection {
  sourceInstanceId: string;
  sourceSnapPointId: string;
  targetInstanceId: string;
  targetSnapPointId: string;
  worldPosition: [number, number, number];
  isValid: boolean;
}

// ---------------------------------------------------------------------------
// Seated Two-Hand Interaction Types
// ---------------------------------------------------------------------------

export type Handedness = 'left' | 'right';

export interface HandPoseData {
  handedness: Handedness;
  isTracked: boolean;
  pinchStrength: number; // 0 (open) to 1 (tight pinch)
  isPinching: boolean;
  wristPosition: [number, number, number];
  wristOrientation: [number, number, number, number]; // Quaternion [x, y, z, w]
  indexTipPosition: [number, number, number];
  pointerRayDirection: [number, number, number];
}

export interface TwoHandManipulationState {
  isActive: boolean;
  targetInstanceId: string | null;
  primaryHand: Handedness;
  secondaryHand: Handedness;
  initialMidpoint: [number, number, number];
  initialHandDistance: number;
  initialHandVector: [number, number, number];
  initialObjectRotation: [number, number, number, number]; // Quaternion
  initialObjectPosition: [number, number, number];
  scaleFactor: number;
}

export interface SeatedWorkspaceConfig {
  /** Offset from player eye origin along Y (default -0.35m down to virtual table) */
  tableHeightOffset: number;
  /** Distance from player chest along Z (default -0.55m in front) */
  tableDepthOffset: number;
  /** Turntable rotation in radians so seated player can reach all sides without twisting */
  turntableAngleRad: number;
  /** Minimum comfortable arm reach radius in meters */
  comfortableRadiusMin: number;
  /** Maximum comfortable arm reach radius in meters */
  comfortableRadiusMax: number;
  /** Player eye/center anchor [x, y, z] */
  playerSeatedAnchor: [number, number, number];
}

// ---------------------------------------------------------------------------
// Assessment, Scoring & Progression Types
// ---------------------------------------------------------------------------

export type StarRating = 0 | 1 | 2 | 3;

export interface ConstructionScoreBreakdown {
  blueprintAccuracy: number; // 0 - 40
  structuralStability: number; // 0 - 30
  materialSuitability: number; // 0 - 15
  sequenceEfficiency: number; // 0 - 15
  totalScore: number; // 0 - 100
  starRating: StarRating;
  grade?: string;
}

export interface StructuralAssessmentResult {
  passed: boolean;
  score: number; // 0 to 100
  scoreBreakdown?: ConstructionScoreBreakdown;
  totalComponentsRequired: number;
  totalComponentsPlaced: number;
  missingComponents: Array<{ type: ComponentType; count: number }>;
  placementErrors: string[];
  connectionErrors: string[];
  stabilityErrors: string[];
  feedbackNotes: string[];
  disclaimer: string;
}

export type ConstructionLevelId =
  | 'small_house'
  | 'duplex'
  | 'bungalow'
  | 'castle'
  | 'mansion'
  | 'bridge'
  | 'mega_construction'
  | 'sandbox';

export interface BuilderAchievement {
  id: string;
  title: string;
  description: string;
  unlockedAt?: number; // timestamp
  icon: string;
}
