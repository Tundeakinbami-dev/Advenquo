/**
 * Advenquo: Construction World — Placement Preview & Snap Visual Feedback
 *
 * Implements:
 * - Ghost mesh preview positioned at candidate snap pose
 * - Real-time visual feedback: Emerald Green (valid) vs Crimson (invalid)
 * - Snap-point socket highlighting markers
 */

import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  SphereGeometry,
  Vector3,
} from '@iwsdk/core';

import type { SnapCandidate } from '../assembly/snap-point.js';
import type { ComponentType } from '../core/construction-types.js';
import { getComponentSpec } from '../materials/construction-catalog.js';

export class PlacementPreview {
  private root: Object3D;
  private previewMesh: Mesh | null = null;
  private currentPreviewType: ComponentType | null = null;
  private snapMarker: Mesh;
  private previewMaterial: MeshBasicMaterial;
  private markerMaterial: MeshBasicMaterial;

  constructor() {
    this.root = new Object3D();
    this.root.name = 'PlacementPreviewRoot';
    this.root.visible = false;

    this.previewMaterial = new MeshBasicMaterial({
      color: 0x00e676, // Emerald green for valid snap
      transparent: true,
      opacity: 0.45,
      wireframe: false,
    });

    this.markerMaterial = new MeshBasicMaterial({
      color: 0x00e676,
      transparent: true,
      opacity: 0.8,
    });

    // Snap target indicator sphere
    this.snapMarker = new Mesh(new SphereGeometry(0.045, 12, 12), this.markerMaterial);
    this.root.add(this.snapMarker);
  }

  public getRoot(): Object3D {
    return this.root;
  }

  public updatePreview(
    heldType: ComponentType,
    candidate: SnapCandidate | null,
    fallbackWorldPos: Vector3,
  ): void {
    if (!candidate) {
      this.root.visible = false;
      return;
    }

    this.root.visible = true;

    // Ensure mesh matches component type
    if (this.currentPreviewType !== heldType || !this.previewMesh) {
      if (this.previewMesh) {
        this.root.remove(this.previewMesh);
      }
      const spec = getComponentSpec(heldType);
      const [w, h, d] = spec.dimensions;
      this.previewMesh = new Mesh(new BoxGeometry(w, h, d), this.previewMaterial);
      this.root.add(this.previewMesh);
      this.currentPreviewType = heldType;
    }

    if (candidate.isValid) {
      // Valid placement: snap ghost to candidate target transform
      this.previewMaterial.color.setHex(0x00e676); // Emerald Green
      this.markerMaterial.color.setHex(0x00e676);
      this.previewMesh.position.copy(candidate.snappedPosition);
      this.previewMesh.quaternion.copy(candidate.snappedRotation);
      this.snapMarker.position.copy(candidate.targetSnapPoint.worldPosition);
    } else {
      // Invalid placement: show red warning at target socket
      this.previewMaterial.color.setHex(0xff5252); // Coral / Crimson
      this.markerMaterial.color.setHex(0xff5252);
      this.previewMesh.position.copy(candidate.snappedPosition);
      this.previewMesh.quaternion.copy(candidate.snappedRotation);
      this.snapMarker.position.copy(candidate.targetSnapPoint.worldPosition);
    }
  }

  public hide(): void {
    this.root.visible = false;
  }
}
