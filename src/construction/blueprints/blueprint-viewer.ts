/**
 * Advenquo: Interactive Architectural Blueprint Viewer
 *
 * Coordinates:
 * - 3D reference model manipulation (rotate yaw/pitch, zoom, pan)
 * - View switching: 3D Reference, Floor Plan, 4 Elevations, Exploded View
 * - 9-Layer exploded view with animated interpolation
 * - Layer visibility toggles and individual component isolation
 * - Dimensions and annotations toggling
 * - Stage filtering (all / specific construction stage)
 * - Seated VR hand tracking / ray interaction and desktop mouse/keyboard controls
 */

import {
  Group,
  Object3D,
} from '@iwsdk/core';

import type {
  AuthoritativeBuildingDesign,
  ConstructionLayerId,
} from './building-design.js';
import {
  BlueprintRenderer,
  type BlueprintDrawingOptions,
} from './blueprint-renderer.js';

export type BlueprintViewType =
  | '3d_reference'
  | 'floor_plan'
  | 'elevation_front'
  | 'elevation_rear'
  | 'elevation_left'
  | 'elevation_right'
  | 'exploded';

export interface BlueprintViewerState {
  activeView: BlueprintViewType;
  rotationYawRad: number;
  rotationPitchRad: number;
  zoomFactor: number; // 0.5 to 2.5 (1.0 = default)
  panOffset: [number, number]; // [x, y]
  explodedProgress: number; // 0.0 to 1.0
  activeLayers: Record<ConstructionLayerId, boolean>;
  isolatedComponentId: string | null;
  stageFilter: number | null; // null = all / completed building
  showDimensions: boolean;
  showAnnotations: boolean;
}

export class BlueprintViewer {
  private design: AuthoritativeBuildingDesign;
  private renderer: BlueprintRenderer;
  private state: BlueprintViewerState;

  // 3D Scene Root for the reference model
  private modelRoot: Object3D;
  private containerGroup: Group;

  constructor(design: AuthoritativeBuildingDesign) {
    this.design = design;
    this.renderer = new BlueprintRenderer(design);

    const activeLayers: Record<ConstructionLayerId, boolean> = {
      foundation: true,
      floor_slab: true,
      structural_walls: true,
      internal_partitions: true,
      openings: true,
      roof_structure: true,
      roofing_materials: true,
      doors_windows: true,
      finishing: true,
    };

    this.state = {
      activeView: '3d_reference',
      rotationYawRad: 0.35, // Slight default isometric angle
      rotationPitchRad: 0.25,
      zoomFactor: 1.0,
      panOffset: [0, 0],
      explodedProgress: 0.0,
      activeLayers,
      isolatedComponentId: null,
      stageFilter: null,
      showDimensions: true,
      showAnnotations: true,
    };

    this.containerGroup = new Group();
    this.containerGroup.name = `BlueprintViewerContainer_${design.id}`;

    this.modelRoot = this.renderer.build3DReferenceModel();
    this.containerGroup.add(this.modelRoot);

    this.update3DTransform();
  }

  public getContainerGroup(): Group {
    return this.containerGroup;
  }

  public getModelRoot(): Object3D {
    return this.modelRoot;
  }

  public getState(): BlueprintViewerState {
    return {
      ...this.state,
      activeLayers: { ...this.state.activeLayers },
      panOffset: [...this.state.panOffset],
    };
  }

  // =========================================================================
  // Navigation & Manipulation (Orbit, Zoom, Pan)
  // =========================================================================

  public rotate(deltaYawRad: number, deltaPitchRad: number): void {
    this.state.rotationYawRad += deltaYawRad;
    // Clamp pitch between -75 deg and +75 deg for seated VR comfort
    const maxPitch = (75 * Math.PI) / 180;
    this.state.rotationPitchRad = Math.max(
      -maxPitch,
      Math.min(maxPitch, this.state.rotationPitchRad + deltaPitchRad),
    );
    this.update3DTransform();
  }

  public setRotation(yawRad: number, pitchRad: number): void {
    this.state.rotationYawRad = yawRad;
    this.state.rotationPitchRad = pitchRad;
    this.update3DTransform();
  }

  public zoom(deltaZoom: number): void {
    this.state.zoomFactor = Math.max(0.4, Math.min(2.5, this.state.zoomFactor + deltaZoom));
    this.update3DTransform();
  }

  public setZoom(zoom: number): void {
    this.state.zoomFactor = Math.max(0.4, Math.min(2.5, zoom));
    this.update3DTransform();
  }

  public pan(deltaX: number, deltaY: number): void {
    this.state.panOffset[0] += deltaX;
    this.state.panOffset[1] += deltaY;
    this.update3DTransform();
  }

  public resetView(): void {
    this.state.rotationYawRad = 0.35;
    this.state.rotationPitchRad = 0.25;
    this.state.zoomFactor = 1.0;
    this.state.panOffset = [0, 0];
    this.update3DTransform();
  }

  private update3DTransform(): void {
    this.modelRoot.rotation.set(
      this.state.rotationPitchRad,
      this.state.rotationYawRad,
      0,
      'YXZ',
    );
    const s = this.state.zoomFactor;
    this.modelRoot.scale.set(s, s, s);
    this.modelRoot.position.set(
      this.state.panOffset[0],
      this.state.panOffset[1],
      0,
    );
  }

  // =========================================================================
  // View Modes & Exploded View
  // =========================================================================

  public setViewType(viewType: BlueprintViewType): void {
    this.state.activeView = viewType;

    if (viewType === 'exploded') {
      this.setExplodedProgress(1.0);
    } else if (viewType === '3d_reference') {
      this.setExplodedProgress(0.0);
    }
  }

  public setExplodedProgress(progress: number): void {
    this.state.explodedProgress = Math.max(0, Math.min(1, progress));
    BlueprintRenderer.setExplodedProgress(this.modelRoot, this.state.explodedProgress);
  }

  // =========================================================================
  // Layer Toggles & Component Isolation
  // =========================================================================

  public toggleLayer(layerId: ConstructionLayerId, forceState?: boolean): boolean {
    const newState = forceState !== undefined ? forceState : !this.state.activeLayers[layerId];
    this.state.activeLayers[layerId] = newState;
    BlueprintRenderer.setLayerVisibility(this.modelRoot, layerId, newState);
    return newState;
  }

  public setAllLayersVisible(visible: boolean): void {
    for (const layer of this.design.layers) {
      this.toggleLayer(layer.id, visible);
    }
  }

  public isolateComponent(componentId: string | null): void {
    this.state.isolatedComponentId = componentId;
    BlueprintRenderer.isolateComponent(this.modelRoot, componentId);
  }

  public setStageFilter(stageIndex: number | null): void {
    this.state.stageFilter = stageIndex;
    if (stageIndex === null) {
      // Show all
      this.modelRoot.traverse((child) => {
        if ((child as any).isMesh) {
          const layerId = child.userData.layerId as ConstructionLayerId;
          child.visible = this.state.activeLayers[layerId] ?? true;
        }
      });
    } else {
      BlueprintRenderer.filterByStage(this.modelRoot, stageIndex);
    }
  }

  public toggleDimensions(): boolean {
    this.state.showDimensions = !this.state.showDimensions;
    return this.state.showDimensions;
  }

  public toggleAnnotations(): boolean {
    this.state.showAnnotations = !this.state.showAnnotations;
    return this.state.showAnnotations;
  }

  // =========================================================================
  // 2D Drawings Generation
  // =========================================================================

  public getFloorPlanSVG(options?: BlueprintDrawingOptions): string {
    return this.renderer.renderFloorPlanSVG({
      showDimensions: this.state.showDimensions,
      showRoomLabels: this.state.showAnnotations,
      ...options,
    });
  }

  public getElevationSVG(
    orientation: 'front' | 'rear' | 'left' | 'right',
    options?: BlueprintDrawingOptions,
  ): string {
    return this.renderer.renderElevationSVG(orientation, {
      showDimensions: this.state.showDimensions,
      ...options,
    });
  }
}
