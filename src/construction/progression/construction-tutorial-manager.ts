/**
 * Advenquo: Construction World — Interactive Construction Tutorial Manager
 *
 * Implements the 8-step guided tutorial sequence teaching players:
 * 1. Select a foundation block
 * 2. Move it into the construction area
 * 3. Place it on the building pad
 * 4. Select another block
 * 5. Stack it on the first block
 * 6. Rotate a component
 * 7. Connect two compatible components
 * 8. Remove and reposition a misplaced component
 */

import { Vector3 } from '@iwsdk/core';
import type { ComponentType } from '../core/construction-types.js';

export interface TutorialStep {
  index: number;
  title: string;
  instruction: string;
  targetComponent?: ComponentType;
  hint: string;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    index: 1,
    title: 'Select Foundation Block',
    instruction: 'Welcome to your construction workshop. Select a brick from Materials to begin.',
    targetComponent: 'foundation_block',
    hint: 'Open the Materials panel and select a Brick or Foundation Block.',
  },
  {
    index: 2,
    title: 'Move Into Construction Area',
    instruction: 'Move the selected component over the construction pad.',
    targetComponent: 'foundation_block',
    hint: 'Move cursor or hand toward the central building pad at Z = -2.5m.',
  },
  {
    index: 3,
    title: 'Place on Building Pad',
    instruction: 'Click on the construction pad to place your first block.',
    targetComponent: 'foundation_block',
    hint: 'Click when the emerald green indicator appears on the pad.',
  },
  {
    index: 4,
    title: 'Select Second Block',
    instruction: 'Great! Open Materials and select another Brick (or Block).',
    hint: 'Pick a complementary block to stack vertically.',
  },
  {
    index: 5,
    title: 'Stack on First Block',
    instruction: 'Hover over the placed block until the green snap marker appears, then click to stack it.',
    hint: 'Align with the top socket to lock the connection in the assembly graph.',
  },
  {
    index: 6,
    title: 'Rotate a Component',
    instruction: 'Select a component and press "R" (or Shift+R / rotate wrist in VR) to rotate it.',
    hint: 'Rotating allows aligning studs and matching horizontal beams with columns.',
  },
  {
    index: 7,
    title: 'Connect Compatible Components',
    instruction: 'Place and connect two compatible components side-by-side or horizontally.',
    hint: 'Bring studs and sockets into proximity until the snap guide locks in place.',
  },
  {
    index: 8,
    title: 'Remove and Reposition',
    instruction: 'Click an existing placed block to pick it up, or press "U" to undo and reposition it.',
    hint: 'You can reorganize any placed component by clicking and dragging it to a new location.',
  },
];

export class ConstructionTutorialManager {
  private static instance: ConstructionTutorialManager | null = null;
  private currentStepIndex = 1;
  private isCompleted = false;
  private listeners: Array<(step: TutorialStep, completed: boolean) => void> = [];

  public static getInstance(): ConstructionTutorialManager {
    if (!ConstructionTutorialManager.instance) {
      ConstructionTutorialManager.instance = new ConstructionTutorialManager();
    }
    return ConstructionTutorialManager.instance;
  }

  public getCurrentStep(): TutorialStep {
    return TUTORIAL_STEPS[this.currentStepIndex - 1] || TUTORIAL_STEPS[TUTORIAL_STEPS.length - 1];
  }

  public getCurrentStepIndex(): number {
    return this.currentStepIndex;
  }

  public getTotalSteps(): number {
    return TUTORIAL_STEPS.length;
  }

  public isTutorialCompleted(): boolean {
    return this.isCompleted;
  }

  public subscribe(fn: (step: TutorialStep, completed: boolean) => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify(): void {
    const step = this.getCurrentStep();
    for (const listener of this.listeners) {
      listener(step, this.isCompleted);
    }
  }

  // --- Step Event Triggers ---

  public onComponentSelected(type: ComponentType): void {
    if (this.isCompleted) return;

    if (
      this.currentStepIndex === 1 &&
      (type === 'foundation_block' ||
        type.includes('foundation') ||
        type === 'clay_brick' ||
        type === 'small_brick' ||
        type === 'concrete_block' ||
        type.includes('brick'))
    ) {
      this.advanceStep();
    } else if (this.currentStepIndex === 4) {
      this.advanceStep();
    }
  }

  public onComponentMoved(pos: Vector3): void {
    if (this.isCompleted) return;

    // In step 2, detect when component reaches the building pad area (Z < -1.0)
    if (this.currentStepIndex === 2 && pos.z < -1.0 && Math.abs(pos.x) < 2.5) {
      this.advanceStep();
    }
  }

  public onComponentPlaced(params: {
    instanceId: string;
    componentType: ComponentType;
    isStacked: boolean;
    hasConnection: boolean;
  }): void {
    if (this.isCompleted) return;

    if (this.currentStepIndex === 3) {
      this.advanceStep();
    } else if (this.currentStepIndex === 5 && params.isStacked) {
      this.advanceStep();
    } else if (this.currentStepIndex === 7 && params.hasConnection) {
      this.advanceStep();
    }
  }

  public onComponentRotated(): void {
    if (this.isCompleted) return;

    if (this.currentStepIndex === 6) {
      this.advanceStep();
    }
  }

  public onComponentRepositioned(): void {
    if (this.isCompleted) return;

    if (this.currentStepIndex === 8) {
      this.isCompleted = true;
      this.notify();
    }
  }

  public advanceStep(): void {
    if (this.currentStepIndex < TUTORIAL_STEPS.length) {
      this.currentStepIndex++;
      this.notify();
    } else {
      this.isCompleted = true;
      this.notify();
    }
  }

  public reset(): void {
    this.currentStepIndex = 1;
    this.isCompleted = false;
    this.notify();
  }
}

export const constructionTutorialManager = ConstructionTutorialManager.getInstance();
