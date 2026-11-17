/**
 * Advenquo — Scene UI System for Construction World
 *
 * Manages:
 * - The intro panel (seated controls guide, "ENTER VR WORKSHOP" button)
 * - Real-time construction project and stage status updates
 * - The completion celebration panel ("STRUCTURE CERTIFIED! Validation Passed")
 */

import {
  createSystem,
  UIKitMLAsset,
  VisibilityState,
} from '@iwsdk/core';

import { challengeManager } from './construction/progression/challenge-manager.js';

export class SceneUISystem extends createSystem({}) {
  /** True once the completion panel has been made visible */
  private completionShown = false;
  /** Cached reference to the stage counter text element */
  private counterEl: ReturnType<UIKitMLAsset['getElementById']> | null = null;

  init(): void {
    // Hide completion panel at startup
    const completionPanel =
      this.world.getSceneObject<UIKitMLAsset>('completion-panel');
    if (completionPanel) {
      completionPanel.visible = false;
    }

    // Wire Enter/Exit XR buttons on the intro panel
    const introPanel = this.world.getSceneObject<UIKitMLAsset>('intro-panel');
    this.counterEl = introPanel?.getElementById('discovery-count') ?? null;

    const xrButton = introPanel?.getElementById('xr-enter-btn');
    const exitButton = introPanel?.getElementById('xr-exit-btn');

    if (this.world.xrEnabled && xrButton != null && exitButton != null) {
      const launchXR = (): void => {
        this.world.launchXR();
      };
      const exitXR = (): void => {
        this.world.exitXR();
      };

      xrButton.addEventListener('click', launchXR);
      exitButton.addEventListener('click', exitXR);

      this.cleanupFuncs.push(
        () => xrButton.removeEventListener('click', launchXR),
        () => exitButton.removeEventListener('click', exitXR),
        this.world.visibilityState.subscribe((state) => {
          const is2D = state === VisibilityState.NonImmersive;
          xrButton.setProperties({ display: is2D ? 'flex' : 'none' });
          exitButton.setProperties({ display: is2D ? 'none' : 'flex' });
        }),
      );
    } else {
      xrButton?.setProperties({ display: 'none' });
      exitButton?.setProperties({ display: 'none' });
    }
  }

  update(): void {
    // Update counter text with active construction stage
    const stage = challengeManager.getCurrentStageInfo();
    const blueprint = challengeManager.getBlueprint();
    this.counterEl?.setProperties({
      text: `${blueprint.title} · Stage ${stage.stageIndex}/${blueprint.stages.length}`,
    } as never);

    // Show completion panel when challenge is certified
    if (!this.completionShown && challengeManager.isChallengeCompleted()) {
      this.completionShown = true;
      const completionPanel =
        this.world.getSceneObject<UIKitMLAsset>('completion-panel');
      if (completionPanel) {
        completionPanel.visible = true;
      }
    }
  }
}
