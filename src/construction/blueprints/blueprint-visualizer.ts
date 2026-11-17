/**
 * Advenquo: Construction World — Blueprint Visualizer & Ghost Guide
 *
 * Renders an in-world holographic translucent blueprint guide overlay:
 * - Shows target positions and orientations for all components in the active challenge
 * - Translucent holographic cyan styling with subtle edge highlights
 * - Supports toggling visibility and highlighting current stage targets
 */

import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  Object3D,
} from '@iwsdk/core';

import { getComponentSpec } from '../materials/construction-catalog.js';
import type { BlueprintDefinition } from './blueprint-types.js';

export class BlueprintVisualizer {
  private root: Object3D;
  private targetMeshes: Map<string, Mesh> = new Map();
  private blueprint: BlueprintDefinition;
  private isVisible = true;

  constructor(blueprint: BlueprintDefinition) {
    this.blueprint = blueprint;
    this.root = new Object3D();
    this.root.name = `BlueprintVisualizer_${blueprint.id}`;
    this.buildGuide();
  }

  public getRoot(): Object3D {
    return this.root;
  }

  private buildGuide(): void {
    // 1. Foundation footprint guide wireframe
    const [fw, fh, fd] = this.blueprint.foundationDimensions;
    const foundationMat = new MeshBasicMaterial({
      color: 0x00bcd4, // Holographic cyan
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const foundationBox = new Mesh(new BoxGeometry(fw, fh, fd), foundationMat);
    foundationBox.position.set(...this.blueprint.foundationPosition);
    this.root.add(foundationBox);

    // 2. Ghost meshes for each target item
    const ghostMat = new MeshBasicMaterial({
      color: 0x03a9f4, // Light blueprint blue
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });

    for (const target of this.blueprint.targets) {
      const spec = getComponentSpec(target.componentType);
      const [w, h, d] = spec.dimensions;
      const targetId = target.id || target.targetId || 'target';
      const mesh = new Mesh(new BoxGeometry(w, h, d), ghostMat.clone());
      mesh.position.set(...target.targetPosition);
      mesh.quaternion.set(...target.targetRotation);
      mesh.name = `Ghost_${targetId}`;
      this.root.add(mesh);
      this.targetMeshes.set(targetId, mesh);
    }
  }

  public setVisible(visible: boolean): void {
    this.isVisible = visible;
    this.root.visible = visible;
  }

  public getVisible(): boolean {
    return this.isVisible;
  }

  public highlightStage(stageIndex: number): void {
    for (const target of this.blueprint.targets) {
      const targetId = target.id || target.targetId || 'target';
      const mesh = this.targetMeshes.get(targetId);
      if (!mesh) continue;

      const mat = mesh.material as MeshBasicMaterial;
      if (target.stageIndex === stageIndex) {
        mat.color.setHex(0x00e676); // Emerald green for active stage
        mat.opacity = 0.6;
      } else if (target.stageIndex < stageIndex) {
        mat.color.setHex(0x78909c); // Dim grey for completed
        mat.opacity = 0.2;
      } else {
        mat.color.setHex(0x03a9f4); // Blueprint cyan for future
        mat.opacity = 0.35;
      }
    }
  }
}
