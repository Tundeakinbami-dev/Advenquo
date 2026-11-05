/**
 * Advenquo — Scene UI system.
 *
 * Manages the intro panel (shown at start), per-object fact panels (shown when
 * a CulturalObject is discovered), and the completion celebration panel (shown
 * when all objects are discovered).
 *
 * How discovery detection works:
 *   DiscoverySystem sets CulturalObject.discovered = true when the player
 *   presses an object. This system polls discovered flags in update() and
 *   reacts the first time each flag transitions from false → true.
 *
 * Terminology reminder:
 *   - XR (eXtended Reality): an immersive VR/AR session in a headset.
 *   - IWER: the browser-based XR emulator used for desktop testing.
 */

import {
  createSystem,
  UIKitMLAsset,
  VisibilityState,
} from '@iwsdk/core';

import { CulturalObject } from './cultural-object-component.js';

/** How long (seconds) a fact panel stays visible before auto-hiding */
const FACT_PANEL_DURATION = 8;

/** Maps factId (on CulturalObject) to the scene node id of its fact panel */
const FACT_PANEL_MAP: Record<string, string> = {
  'adire-cloth': 'fact-panel-adire',
  'talking-drum': 'fact-panel-drum',
  calabash: 'fact-panel-calabash',
  'kola-nut': 'fact-panel-kola',
};

export class SceneUISystem extends createSystem({
  cultural: { required: [CulturalObject] },
}) {
  /** Per-panel countdown: panelNodeId → seconds remaining */
  private factTimers = new Map<string, number>();
  /** Entity indices we have already reacted to, so we show each fact panel once */
  private reactedEntityIndices = new Set<number>();
  /** Snapshot of discovered count from last frame to detect total completion */
  private prevDiscoveredCount = -1;
  /** True once the completion panel has been made visible */
  private completionShown = false;
  /** Cached reference to the discovery counter text element */
  private counterEl: ReturnType<UIKitMLAsset['getElementById']> | null = null;

  init(): void {
    // Hide all fact panels at startup
    for (const panelNodeId of Object.values(FACT_PANEL_MAP)) {
      const panel = this.world.getSceneObject<UIKitMLAsset>(panelNodeId);
      if (panel) {
        panel.visible = false;
      }
    }

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

  update(delta: number): void {
    // Tick down active fact panel timers
    for (const [panelId, remaining] of this.factTimers.entries()) {
      const next = remaining - delta;
      if (next <= 0) {
        this.factTimers.delete(panelId);
        const panel = this.world.getSceneObject<UIKitMLAsset>(panelId);
        if (panel) {
          panel.visible = false;
        }
      } else {
        this.factTimers.set(panelId, next);
      }
    }

    // Scan for newly-discovered objects
    let discoveredCount = 0;
    for (const entity of this.queries.cultural.entities) {
      const discovered = entity.getValue(CulturalObject, 'discovered');
      if (!discovered) continue;

      discoveredCount++;

      // React exactly once per entity when it transitions to discovered
      if (!this.reactedEntityIndices.has(entity.index)) {
        this.reactedEntityIndices.add(entity.index);
        const factId = entity.getValue(CulturalObject, 'factId');
        if (factId) this._showFactPanel(factId);
      }
    }

    // Update counter text when it changes
    if (discoveredCount !== this.prevDiscoveredCount) {
      this.prevDiscoveredCount = discoveredCount;
      const total = this.queries.cultural.entities.size;
      this.counterEl?.setProperties({
        text: `${discoveredCount} / ${total} discovered`,
      } as never);
      void import('./game/game-shell.js').then(({ gameShell }) => gameShell.updateSpatialDiscovery(discoveredCount));
    }

    // Show completion panel the first time all objects are discovered
    const total = this.queries.cultural.entities.size;
    if (!this.completionShown && total > 0 && discoveredCount === total) {
      this.completionShown = true;
      const completionPanel =
        this.world.getSceneObject<UIKitMLAsset>('completion-panel');
      if (completionPanel) {
        completionPanel.visible = true;
      }
    }
  }

  private _showFactPanel(factId: string): void {
    const panelNodeId = FACT_PANEL_MAP[factId];
    if (!panelNodeId) return;
    const panel = this.world.getSceneObject<UIKitMLAsset>(panelNodeId);
    if (!panel) return;
    panel.visible = true;
    this.factTimers.set(panelNodeId, FACT_PANEL_DURATION);
  }
}
