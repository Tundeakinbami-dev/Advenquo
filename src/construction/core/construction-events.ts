/**
 * Advenquo: Construction World — Construction Event Definitions & Bus
 */

import type {
  ComponentType,
  Handedness,
  PlacedComponentRecord,
  StructuralAssessmentResult,
  StarRating,
} from './construction-types.js';

export type ConstructionEventType =
  | 'COMPONENT_GRABBED'
  | 'COMPONENT_RELEASED'
  | 'COMPONENT_PLACED'
  | 'COMPONENT_DISASSEMBLED'
  | 'TWO_HAND_ENGAGED'
  | 'TWO_HAND_RELEASED'
  | 'WORKSPACE_RECALIBRATED'
  | 'WORKSPACE_TABLE_ADJUSTED'
  | 'TURNTABLE_ROTATED'
  | 'STRUCTURAL_VALIDATION_COMPLETED'
  | 'CHALLENGE_STAGE_ADVANCED'
  | 'CHALLENGE_COMPLETED'
  | 'ACHIEVEMENT_UNLOCKED';

export interface ConstructionEventPayloads {
  COMPONENT_GRABBED: {
    instanceId: string;
    componentType: ComponentType;
    hand: Handedness;
    isTwoHanded: boolean;
  };
  COMPONENT_RELEASED: {
    instanceId: string;
    hand: Handedness;
    placedSuccessfully: boolean;
  };
  COMPONENT_PLACED: {
    record: PlacedComponentRecord;
  };
  COMPONENT_DISASSEMBLED: {
    instanceId: string;
    componentType: ComponentType;
  };
  TWO_HAND_ENGAGED: {
    instanceId: string;
    primaryHand: Handedness;
    secondaryHand: Handedness;
  };
  TWO_HAND_RELEASED: {
    instanceId: string;
    remainingHand?: Handedness;
  };
  WORKSPACE_RECALIBRATED: {
    newAnchor: [number, number, number];
  };
  WORKSPACE_TABLE_ADJUSTED: {
    heightOffset: number;
    depthOffset: number;
  };
  TURNTABLE_ROTATED: {
    angleRad: number;
  };
  STRUCTURAL_VALIDATION_COMPLETED: {
    result: StructuralAssessmentResult;
  };
  CHALLENGE_STAGE_ADVANCED: {
    challengeId: string;
    stageIndex: number;
    totalStages: number;
  };
  CHALLENGE_COMPLETED: {
    challengeId: string;
    score: number;
    stars: StarRating;
  };
  ACHIEVEMENT_UNLOCKED: {
    achievementId: string;
    title: string;
  };
}

export type ConstructionEventListener<T extends ConstructionEventType> = (
  payload: ConstructionEventPayloads[T]
) => void;

export class ConstructionEventBus {
  private static instance: ConstructionEventBus;
  private listeners: Map<ConstructionEventType, Set<ConstructionEventListener<any>>> =
    new Map();

  public static getInstance(): ConstructionEventBus {
    if (!ConstructionEventBus.instance) {
      ConstructionEventBus.instance = new ConstructionEventBus();
    }
    return ConstructionEventBus.instance;
  }

  public on<T extends ConstructionEventType>(
    type: T,
    listener: ConstructionEventListener<T>
  ): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);
    return () => this.off(type, listener);
  }

  public off<T extends ConstructionEventType>(
    type: T,
    listener: ConstructionEventListener<T>
  ): void {
    this.listeners.get(type)?.delete(listener);
  }

  public emit<T extends ConstructionEventType>(
    type: T,
    payload: ConstructionEventPayloads[T]
  ): void {
    const list = this.listeners.get(type);
    if (list) {
      for (const listener of list) {
        try {
          listener(payload);
        } catch (err) {
          console.error(`Error in construction event listener for ${type}:`, err);
        }
      }
    }
  }

  public clear(): void {
    this.listeners.clear();
  }
}
