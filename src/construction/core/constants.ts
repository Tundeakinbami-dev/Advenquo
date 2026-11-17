/**
 * Advenquo: Construction World — Constants & Tolerances
 *
 * Defines engineering tolerances, grid increments, physics presets,
 * and Meta Quest 3 comfort boundaries for modular construction.
 */

export const CONSTRUCTION_CONSTANTS = {
  // Snap tolerances
  SNAP_DISTANCE_TOLERANCE: 0.16, // meters: maximum distance to snap point to qualify for snap
  SNAP_DISTANCE_TOLERANCE_M: 0.18,
  SNAP_ORIENTATION_TOLERANCE_DEG: 35, // degrees: maximum allowable angular misalignment
  SNAP_ANGLE_TOLERANCE_RAD: (35 * Math.PI) / 180, // ~0.61 rad
  SNAP_NORMAL_ALIGNMENT_DOT: -0.7, // dot product threshold for opposing normals (near -1)

  // Hand interaction parameters
  ONE_HAND_GRAB_DISTANCE: 0.25, // meters: near-hand pinch grab radius
  TWO_HAND_GRAB_MIN_MASS: 25.0, // kg: components weighing more than this require or benefit from two hands
  TWO_HAND_SEPARATION_MIN: 0.15, // meters: distance between hands for two-hand manipulation
  WRIST_ROTATION_SMOOTHING: 0.2, // lerp factor for smooth wrist orientation

  // Physical material densities (kg/m^3)
  DENSITY_CLAY_BRICK: 1920,
  DENSITY_CONCRETE_BLOCK: 1400, // hollow-core density
  DENSITY_REINFORCED_CONCRETE: 2450,
  DENSITY_STEEL_REBAR: 7850,
  DENSITY_WEATHERED_ZINC_PANEL: 7200,

  // Structural engineering assessment thresholds
  MAX_ALLOWABLE_CANTILEVER_RATIO: 0.33, // Max unsupported overhang as fraction of component length
  MIN_REQUIRED_SUPPORT_POINTS: 1, // Minimum grounded or anchored connections required
  MIN_FOUNDATION_BEARING_POINTS: 4, // Minimum contact points for stability

  // Safety & Educational Disclaimer
  DISCLAIMER:
    'Educational engineering simulation only. Uses simplified rigid-body and statics approximations. Not certified for real-world architectural or structural engineering construction.',
} as const;
