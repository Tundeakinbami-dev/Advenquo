/**
 * Advenquo: Blueprint Mode & Workspace Manager
 *
 * Coordinates:
 * - Blueprint lifecycle: 'study' (pre-construction architectural review) ->
 *   'construction_pinned' (ergonomic spatial panel in seated VR workspace) -> 'hidden'
 * - Active AuthoritativeBuildingDesign (Stage 1 Two-Bedroom Bungalow by default)
 * - Interactive BlueprintViewer, ConstructionGuide, and BlueprintAssistance
 * - Bidirectional component linking between blueprint and physical construction workspace
 * - Seated VR ergonomics: left/right pinning, workspace calibration, reach limits
 */

import { Object3D, Vector3 } from '@iwsdk/core';
import type {
  AuthoritativeBuildingDesign,
  DesignComponent,
} from './building-design.js';
import { TWO_BEDROOM_BUNGALOW_DESIGN } from './two-bedroom-bungalow-design.js';
import { BlueprintViewer } from './blueprint-viewer.js';
import { ConstructionGuide } from '../progression/construction-guide.js';
import { BlueprintAssistance } from './blueprint-assistance.js';
import { challengeManager } from '../progression/challenge-manager.js';

export type BlueprintModeState = 'study' | 'construction_pinned' | 'hidden';
export type PinPlacement = 'left' | 'right' | 'front_top';

export class BlueprintManager {
  private static instance: BlueprintManager | null = null;

  private design: AuthoritativeBuildingDesign;
  private viewer: BlueprintViewer;
  private guide: ConstructionGuide;
  private assistance: BlueprintAssistance;

  private modeState: BlueprintModeState = 'hidden';
  private pinPlacement: PinPlacement = 'left';
  private selectedComponentId: string | null = null;

  // Workspace Anchor for spatial positioning in seated VR
  private workspaceAnchor: Object3D;

  public static getInstance(): BlueprintManager {
    if (!BlueprintManager.instance) {
      BlueprintManager.instance = new BlueprintManager();
    }
    return BlueprintManager.instance;
  }

  constructor(design: AuthoritativeBuildingDesign = TWO_BEDROOM_BUNGALOW_DESIGN) {
    this.design = design;
    this.viewer = new BlueprintViewer(design);
    this.guide = new ConstructionGuide(design);
    this.assistance = new BlueprintAssistance(design);

    this.workspaceAnchor = new Object3D();
    this.workspaceAnchor.name = 'BlueprintWorkspaceAnchor';
    this.workspaceAnchor.add(this.viewer.getContainerGroup());
    this.workspaceAnchor.visible = false; // Hidden by default so construction area is clear

    this.updateWorkspaceTransform();
  }

  public getDesign(): AuthoritativeBuildingDesign {
    return this.design;
  }

  public getViewer(): BlueprintViewer {
    return this.viewer;
  }

  public getGuide(): ConstructionGuide {
    return this.guide;
  }

  public getAssistance(): BlueprintAssistance {
    return this.assistance;
  }

  public getWorkspaceAnchor(): Object3D {
    return this.workspaceAnchor;
  }

  public getModeState(): BlueprintModeState {
    return this.modeState;
  }

  public setDesign(design: AuthoritativeBuildingDesign): void {
    this.design = design;
    this.viewer = new BlueprintViewer(design);
    this.guide = new ConstructionGuide(design);
    this.assistance = new BlueprintAssistance(design);

    this.workspaceAnchor.clear();
    this.workspaceAnchor.add(this.viewer.getContainerGroup());
    this.updateWorkspaceTransform();
  }

  // =========================================================================
  // Lifecycle & Workspace Transitions
  // =========================================================================

  /**
   * Enter pre-construction study mode: full presentation of 3D reference model,
   * floor plan, elevations, dimensions, and construction stages.
   */
  public enterStudyMode(): void {
    this.modeState = 'study';
    this.workspaceAnchor.visible = true;
    this.viewer.resetView();
    this.viewer.setViewType('3d_reference');
    this.updateWorkspaceTransform();
  }

  /**
   * Transition from study mode to active construction with pinned mini-blueprint.
   */
  public startConstruction(): void {
    this.modeState = 'construction_pinned';
    this.workspaceAnchor.visible = true;

    // Scale down slightly for comfortable seated workspace pinning
    this.updateWorkspaceTransform();

    // Sync challenge manager stage
    challengeManager.setStage(this.guide.getCurrentPhaseIndex());
  }

  /**
   * Toggle blueprint visibility between pinned and hidden during construction.
   */
  public toggleVisibility(): boolean {
    if (this.modeState === 'hidden') {
      this.modeState = 'construction_pinned';
      this.workspaceAnchor.visible = true;
    } else {
      this.modeState = 'hidden';
      this.workspaceAnchor.visible = false;
    }
    return this.workspaceAnchor.visible;
  }

  public setPinPlacement(placement: PinPlacement): void {
    this.pinPlacement = placement;
    this.updateWorkspaceTransform();
  }

  public getPinPlacement(): PinPlacement {
    return this.pinPlacement;
  }

  /**
   * Repositions the blueprint panel to stay comfortably within seated arm's reach
   * without blocking the central construction pad.
   */
  private updateWorkspaceTransform(): void {
    if (this.modeState === 'study') {
      // In study mode before construction, positioned directly in front of seated player
      this.workspaceAnchor.position.set(0, 1.35, -1.5);
      this.workspaceAnchor.rotation.set(0, 0, 0);
      this.workspaceAnchor.scale.set(0.25, 0.25, 0.25);
    } else if (this.modeState === 'construction_pinned') {
      // Pinned beside the construction pad in seated reach
      if (this.pinPlacement === 'left') {
        this.workspaceAnchor.position.set(-1.15, 1.2, -1.1);
        this.workspaceAnchor.rotation.set(0, (25 * Math.PI) / 180, 0);
      } else if (this.pinPlacement === 'right') {
        this.workspaceAnchor.position.set(1.15, 1.2, -1.1);
        this.workspaceAnchor.rotation.set(0, (-25 * Math.PI) / 180, 0);
      } else {
        // Front-top banner above table interaction zone
        this.workspaceAnchor.position.set(0, 2.1, -2.2);
        this.workspaceAnchor.rotation.set((-20 * Math.PI) / 180, 0, 0);
      }
      this.workspaceAnchor.scale.set(0.18, 0.18, 0.18);
    }
  }

  // =========================================================================
  // Bidirectional Component Linking
  // =========================================================================

  /**
   * Selects a component in the blueprint:
   * - Highlights it in the 3D reference viewer
   * - Identifies its counterpart target in the construction workspace
   */
  public selectComponent(componentId: string | null): DesignComponent | null {
    this.selectedComponentId = componentId;
    this.viewer.isolateComponent(componentId);

    if (!componentId) return null;
    return this.design.components.find((c) => c.id === componentId) || null;
  }

  public getSelectedComponent(): DesignComponent | null {
    if (!this.selectedComponentId) return null;
    return this.design.components.find((c) => c.id === this.selectedComponentId) || null;
  }

  /**
   * Highlights the targets for the active construction phase.
   */
  public highlightCurrentPhase(): void {
    const currentPhase = this.guide.getCurrentPhase();
    this.viewer.setStageFilter(currentPhase.phaseIndex);
  }

  /**
   * Advances construction to the next phase.
   */
  public advancePhase(): number {
    const nextPhase = this.guide.advancePhase();
    challengeManager.setStage(nextPhase);
    this.highlightCurrentPhase();
    return nextPhase;
  }
}

export const blueprintManager = BlueprintManager.getInstance();
