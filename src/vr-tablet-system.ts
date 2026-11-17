/**
 * Advenquo: Builder Tablet HUD System
 *
 * Coordinates the spatial UI tablet (`vr-nav-tablet`) inside WebXR.
 * Presents active construction project stages, instructions, engineering checks,
 * and handles in-VR actions (Validate, Undo, Reset).
 */

import {
  createSystem,
  Object3D,
  UIKitMLAsset,
} from '@iwsdk/core';

import { challengeManager } from './construction/progression/challenge-manager.js';
import { assemblySystem } from './construction/assembly/assembly-system.js';
import { blueprintManager } from './construction/blueprints/blueprint-manager.js';

export class VRTabletSystem extends createSystem({}) {
  private static instance: VRTabletSystem | null = null;
  private tablet: UIKitMLAsset | null = null;
  private tabletAnchor: Object3D | null = null;
  private lastStageIndex = -1;

  // Cached elements
  private elProjectTitle: ReturnType<UIKitMLAsset['getElementById']> | null = null;
  private elStageCounter: ReturnType<UIKitMLAsset['getElementById']> | null = null;
  private elInstruction: ReturnType<UIKitMLAsset['getElementById']> | null = null;
  private elCriticalCheck: ReturnType<UIKitMLAsset['getElementById']> | null = null;
  private elStatusText: ReturnType<UIKitMLAsset['getElementById']> | null = null;

  public static getInstance(): VRTabletSystem | null {
    return VRTabletSystem.instance;
  }

  public getTabletAnchor(): Object3D | null {
    return this.tabletAnchor;
  }

  public isTabletVisible(): boolean {
    return this.tablet ? this.tablet.visible : false;
  }

  public summonTablet(): void {
    if (this.tablet) this.tablet.visible = true;
  }

  public dismissTablet(): void {
    if (this.tablet) this.tablet.visible = false;
  }

  public toggleTablet(): void {
    if (this.tablet) {
      this.tablet.visible = !this.tablet.visible;
    }
  }

  public repositionInFrontOfPlayer(distance = 0.85): void {
    if (!this.tabletAnchor) return;

    const head = (this.player as any)?.head as Object3D | undefined;
    const yaw = head ? head.rotation.y : 0;

    const offsetX = -Math.sin(yaw) * distance;
    const offsetZ = -Math.cos(yaw) * distance;

    this.tabletAnchor.position.set(offsetX, 1.25, offsetZ);
    this.tabletAnchor.rotation.set(0, yaw, 0);
  }

  init(): void {
    VRTabletSystem.instance = this;
    this.tablet = this.world.getSceneObject<UIKitMLAsset>('vr-nav-tablet') ?? null;
    if (!this.tablet) return;

    if (this.player) {
      this.tabletAnchor = new Object3D();
      this.tabletAnchor.name = 'TabletAnchor';
      this.tabletAnchor.position.set(0, 1.25, -0.85);
      this.player.add(this.tabletAnchor);
      this.tablet.parent?.remove(this.tablet);
      this.tabletAnchor.add(this.tablet);
    }

    if (this.world && (this.world as any).scene) {
      (this.world as any).scene.add(blueprintManager.getWorkspaceAnchor());
    }

    this.elProjectTitle = this.tablet.getElementById('tablet-project-title');
    this.elStageCounter = this.tablet.getElementById('tablet-stage-counter');
    this.elInstruction = this.tablet.getElementById('tablet-instruction-text');
    this.elCriticalCheck = this.tablet.getElementById('tablet-critical-check');
    this.elStatusText = this.tablet.getElementById('tablet-status-text');

    const btnValidate = this.tablet.getElementById('btn-tablet-validate');
    const btnUndo = this.tablet.getElementById('btn-tablet-undo');
    const btnReset = this.tablet.getElementById('btn-tablet-reset');
    const btnBlueprint = this.tablet.getElementById('btn-tablet-blueprint');
    const btnPin = this.tablet.getElementById('btn-tablet-pin');
    const btnHint = this.tablet.getElementById('btn-tablet-hint');

    const onBlueprint = (): void => {
      const visible = blueprintManager.toggleVisibility();
      if (this.elStatusText) {
        this.elStatusText.setProperties({
          text: visible ? 'Blueprint Mode Pinned in Workspace' : 'Blueprint Mode Hidden',
        });
      }
    };

    const onPin = (): void => {
      const current = blueprintManager.getPinPlacement();
      const next = current === 'left' ? 'right' : 'left';
      blueprintManager.setPinPlacement(next);
      if (this.elStatusText) {
        this.elStatusText.setProperties({
          text: `Blueprint Pinned ${next === 'left' ? 'Left' : 'Right'} of Workstation`,
        });
      }
    };

    const onHint = (): void => {
      const hint = blueprintManager.getAssistance().getVisualHint(
        challengeManager.getCurrentStageIndex(),
        assemblySystem.getGraph().getAllNodes() as any,
      );
      if (this.elStatusText && hint) {
        this.elStatusText.setProperties({
          text: `Hint: Next ${hint.description} at [${hint.targetPosition.map((n) => n.toFixed(1)).join(', ')}]`,
        });
      }
    };

    const onValidate = (): void => {
      const assessment = challengeManager.evaluateProgress(assemblySystem.getGraph());
      if (this.elStatusText) {
        if (assessment.passed) {
          const stars = assessment.scoreBreakdown?.starRating ?? 3;
          this.elStatusText.setProperties({
            text: `Validation Passed! Score: ${assessment.score} / 100 (${stars} Stars)`,
          });
        } else {
          const firstErr =
            assessment.stabilityErrors[0] ||
            assessment.placementErrors[0] ||
            assessment.connectionErrors[0] ||
            'Assembly incomplete';
          this.elStatusText.setProperties({
            text: `Validation Alert: ${firstErr}`,
          });
        }
      }
    };

    const onUndo = (): void => {
      const graph = assemblySystem.getGraph();
      const nodes = graph.getAllNodes().filter((n) => !n.isGrounded && n.structuralRole !== 'foundation');
      if (nodes.length > 0) {
        const lastNode = nodes[nodes.length - 1];
        assemblySystem.unregisterBlock(lastNode.instanceId);
        if (this.elStatusText) {
          this.elStatusText.setProperties({ text: `Removed ${lastNode.instanceId}` });
        }
      }
    };

    const onReset = (): void => {
      challengeManager.setActiveChallenge('small_house_challenge');
      this.lastStageIndex = -1;
      if (this.elStatusText) {
        this.elStatusText.setProperties({ text: 'Challenge reset. Ready to build.' });
      }
    };

    if (btnValidate) btnValidate.addEventListener('click', onValidate);
    if (btnUndo) btnUndo.addEventListener('click', onUndo);
    if (btnReset) btnReset.addEventListener('click', onReset);
    if (btnBlueprint) btnBlueprint.addEventListener('click', onBlueprint);
    if (btnPin) btnPin.addEventListener('click', onPin);
    if (btnHint) btnHint.addEventListener('click', onHint);

    this.cleanupFuncs.push(() => {
      if (btnValidate) btnValidate.removeEventListener('click', onValidate);
      if (btnUndo) btnUndo.removeEventListener('click', onUndo);
      if (btnReset) btnReset.removeEventListener('click', onReset);
      if (btnBlueprint) btnBlueprint.removeEventListener('click', onBlueprint);
      if (btnPin) btnPin.removeEventListener('click', onPin);
      if (btnHint) btnHint.removeEventListener('click', onHint);
    });
  }

  update(): void {
    if (!this.tablet) return;

    const stage = challengeManager.getCurrentStageInfo();
    if (stage && stage.stageIndex !== this.lastStageIndex) {
      this.lastStageIndex = stage.stageIndex;
      const bp = challengeManager.getBlueprint();

      if (this.elProjectTitle && bp) {
        this.elProjectTitle.setProperties({ text: bp.title });
      }
      if (this.elStageCounter) {
        this.elStageCounter.setProperties({ text: `Stage ${stage.stageIndex} / 6: ${stage.title}` });
      }
      if (this.elInstruction) {
        this.elInstruction.setProperties({ text: stage.instruction });
      }
      if (this.elCriticalCheck) {
        this.elCriticalCheck.setProperties({ text: `Critical: ${stage.criticalCheck}` });
      }
    }
  }
}
