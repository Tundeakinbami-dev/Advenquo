/**
 * Advenquo: Construction World — Construction State
 */

import type {
  ConstructionLevelId,
  SeatedWorkspaceConfig,
  PlacedComponentRecord,
  StructuralAssessmentResult,
  TwoHandManipulationState,
} from './construction-types.js';

export interface ConstructionSessionState {
  activeLevelId: ConstructionLevelId;
  currentStageIndex: number;
  totalStages: number;
  placedCount: number;
  placedComponents: Map<string, PlacedComponentRecord>;
  seatedWorkspace: SeatedWorkspaceConfig;
  twoHandState: TwoHandManipulationState;
  lastAssessmentResult: StructuralAssessmentResult | null;
  history: PlacedComponentRecord[][];
  canUndo: boolean;
  canRedo: boolean;
  isCalibrated: boolean;
}

export function createInitialConstructionState(): ConstructionSessionState {
  return {
    activeLevelId: 'small_house',
    currentStageIndex: 0,
    totalStages: 5,
    placedCount: 0,
    placedComponents: new Map(),
    seatedWorkspace: {
      tableHeightOffset: -0.35, // 0.35m below eye level
      tableDepthOffset: -0.55,  // 0.55m in front of chest
      turntableAngleRad: 0,
      comfortableRadiusMin: 0.35,
      comfortableRadiusMax: 0.75,
      playerSeatedAnchor: [0, 1.2, 0], // Standard seated head height ~1.2m
    },
    twoHandState: {
      isActive: false,
      targetInstanceId: null,
      primaryHand: 'right',
      secondaryHand: 'left',
      initialMidpoint: [0, 0, 0],
      initialHandDistance: 0.3,
      initialHandVector: [1, 0, 0],
      initialObjectRotation: [0, 0, 0, 1],
      initialObjectPosition: [0, 0, 0],
      scaleFactor: 1.0,
    },
    lastAssessmentResult: null,
    history: [],
    canUndo: false,
    canRedo: false,
    isCalibrated: true,
  };
}
