/**
 * Advenquo: Construction World — Desktop Mouse & Keyboard Interaction Controller
 *
 * Implements professional, responsive desktop building controls:
 * - Left-click material palette item to select/spawn placeable component
 * - Cursor raycasting into construction area with real-time placement preview (green/red/blue)
 * - Left-click and hold existing placed component to pick up and reposition
 * - Release left-click to place and snap into assembly
 * - Right-click and drag to orbit camera around construction pad
 * - Middle-click and drag to pan camera
 * - Mouse wheel to zoom camera
 * - R / Shift+R: Rotate selected component yaw (90° steps)
 * - Delete / Backspace: Remove selected component
 * - Ctrl + D / Cmd + D: Duplicate selected component
 * - Escape: Cancel current placement
 * - Arrow keys: Fine-position component by ±0.05m
 * - U key: Undo last placement
 */

import {
  Camera,
  OneHandGrabbable,
  PerspectiveCamera,
  Plane,
  Quaternion,
  Raycaster,
  RayInteractable,
  TwoHandsGrabbable,
  Vector2,
  Vector3,
  VisibilityState,
  type World,
} from '@iwsdk/core';

import { assemblySystem } from '../assembly/assembly-system.js';
import type { SnapCandidate } from '../assembly/snap-point.js';
import { ConstructionBlock } from '../core/construction-components.js';
import type { ComponentType } from '../core/construction-types.js';
import { createComponentMesh } from '../materials/component-factory.js';
import { CONSTRUCTION_CATALOG, getComponentSpec } from '../materials/construction-catalog.js';
import { constructionPhysicsManager } from '../physics/construction-physics-manager.js';
import { challengeManager } from '../progression/challenge-manager.js';
import { constructionTutorialManager } from '../progression/construction-tutorial-manager.js';
import { PlacementPreview } from './placement-preview.js';

export interface DesktopHeldItem {
  instanceId: string;
  componentType: ComponentType;
  position: Vector3;
  rotation: Quaternion;
}

export class DesktopConstructionController {
  private static instance: DesktopConstructionController | null = null;
  private preview: PlacementPreview = new PlacementPreview();
  private heldItem: DesktopHeldItem | null = null;
  private activeCandidate: SnapCandidate | null = null;
  private placementHistory: string[] = [];

  // World and rendering context
  private world: World | null = null;
  private sceneContainer: HTMLElement | null = null;
  private isVRActive = false;

  // Camera Orbit / Pan / Zoom state
  private isOrbiting = false;
  private isPanning = false;
  private lastMouseX = 0;
  private lastMouseY = 0;
  private orbitTarget = new Vector3(0, 0.5, -2.5); // Center of construction pad
  private cameraDistance = 2.4;
  private cameraYaw = 0;
  private cameraPitch = 0.25; // Looking downward

  // Raycasting & interaction helpers
  private raycaster = new Raycaster();
  private mouseVec = new Vector2();
  private groundPlane = new Plane(new Vector3(0, 1, 0), -0.05); // Building pad top height
  private placedMeshesMap: Map<string, { mesh: any; entity: any; type: ComponentType }> = new Map();

  // Scratch math objects (zero per-frame allocations)
  private tempVec = new Vector3();
  private tempQuat = new Quaternion();
  private rayHitPos = new Vector3();

  public static getInstance(): DesktopConstructionController {
    if (!DesktopConstructionController.instance) {
      DesktopConstructionController.instance = new DesktopConstructionController();
    }
    return DesktopConstructionController.instance;
  }

  public getPreview(): PlacementPreview {
    return this.preview;
  }

  public getHeldItem(): DesktopHeldItem | null {
    return this.heldItem;
  }

  public isHoldingBlock(): boolean {
    return this.heldItem !== null;
  }

  public isHoldingComponent(): boolean {
    return this.heldItem !== null;
  }

  public getHeldComponentType(): ComponentType | null {
    return this.heldItem ? this.heldItem.componentType : null;
  }

  public getHeldRotation(): [number, number, number, number] {
    if (!this.heldItem) return [0, 0, 0, 1];
    const q = this.heldItem.rotation;
    return [q.x, q.y, q.z, q.w];
  }

  public init(world: World): void {
    this.world = world;

    const sceneObj = (world as any).scene || (world as any).sceneEntity?.object3D;
    if (sceneObj) {
      sceneObj.add(this.preview.getRoot());
    }

    if (world.visibilityState) {
      world.visibilityState.subscribe((state) => {
        this.isVRActive = state === VisibilityState.Visible;
        if (this.isVRActive) {
          this.preview.hide();
          this.heldItem = null;
        }
      });
    }

    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      this.sceneContainer = document.getElementById('scene-container');
      this._attachEventListeners();
    }
  }

  private _attachEventListeners(): void {
    if (!this.sceneContainer) return;

    // Mouse Listeners
    this.sceneContainer.addEventListener('mousedown', (e) => this._onMouseDown(e));
    window.addEventListener('mousemove', (e) => this._onMouseMove(e));
    window.addEventListener('mouseup', (e) => this._onMouseUp(e));
    this.sceneContainer.addEventListener('wheel', (e) => this._onWheel(e), { passive: false });
    this.sceneContainer.addEventListener('contextmenu', (e) => e.preventDefault());

    // Keyboard Listeners
    window.addEventListener('keydown', (e) => this._onKeyDown(e));
  }

  private _onMouseDown(e: MouseEvent): void {
    if (this.isVRActive) return;

    // Button 0: Left Click
    if (e.button === 0) {
      if (this.heldItem) {
        // Place currently held item
        this.releaseAndPlace();
      } else {
        // Try to pick up a placed block from the 3D scene
        this._updateMouseCoordinates(e);
        const hit = this._raycastPlacedBlocks();
        if (hit) {
          this.pickUpComponent(hit.instanceId);
        }
      }
    }
    // Button 2: Right Click (Orbit Camera)
    else if (e.button === 2) {
      this.isOrbiting = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    }
    // Button 1: Middle Click (Pan Camera)
    else if (e.button === 1) {
      this.isPanning = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    }
  }

  private _onMouseMove(e: MouseEvent): void {
    if (this.isVRActive) return;

    // 1. Camera Orbit
    if (this.isOrbiting && this.world?.camera) {
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;

      this.cameraYaw -= dx * 0.006;
      this.cameraPitch = Math.max(0.05, Math.min(1.4, this.cameraPitch + dy * 0.006));
      this._updateCameraFromOrbit();
      return;
    }

    // 2. Camera Pan
    if (this.isPanning && this.world?.camera) {
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;

      const panSpeed = 0.003;
      this.orbitTarget.x -= dx * panSpeed;
      this.orbitTarget.z -= dy * panSpeed;
      this._updateCameraFromOrbit();
      return;
    }

    // 3. Move Held Item / Update Placement Preview
    if (this.heldItem) {
      this._updateMouseCoordinates(e);
      const hitWorldPos = this._computeRaycastIntersection();
      if (hitWorldPos) {
        this.moveHeldComponent(hitWorldPos);
        constructionTutorialManager.onComponentMoved(hitWorldPos);
      }
    }
  }

  private _onMouseUp(e: MouseEvent): void {
    if (e.button === 2) {
      this.isOrbiting = false;
    } else if (e.button === 1) {
      this.isPanning = false;
    }
  }

  private _onWheel(e: WheelEvent): void {
    if (this.isVRActive || !this.world?.camera) return;
    e.preventDefault();

    // Zoom camera in/out
    const zoomDelta = e.deltaY * 0.002;
    this.cameraDistance = Math.max(0.8, Math.min(6.5, this.cameraDistance + zoomDelta));
    this._updateCameraFromOrbit();
  }

  private _onKeyDown(e: KeyboardEvent): void {
    if (this.isVRActive) return;
    if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

    // R: Rotate selected component
    if (e.key === 'r' || e.key === 'R') {
      const angle = e.shiftKey ? -Math.PI / 2 : Math.PI / 2;
      this.rotateHeldComponentYaw(angle);
      constructionTutorialManager.onComponentRotated();
    }
    // Delete / Backspace: Remove selected component
    else if (e.key === 'Delete' || e.key === 'Backspace') {
      this.deleteSelectedComponent();
    }
    // Ctrl+D / Cmd+D: Duplicate selected component
    else if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
      e.preventDefault();
      this.duplicateSelectedComponent();
    }
    // Escape: Cancel current placement
    else if (e.key === 'Escape') {
      this.cancelPlacement();
    }
    // Arrow keys: Fine positioning
    else if (e.key === 'ArrowLeft') {
      this.fineAdjustPosition(-0.05, 0);
    } else if (e.key === 'ArrowRight') {
      this.fineAdjustPosition(0.05, 0);
    } else if (e.key === 'ArrowUp') {
      this.fineAdjustPosition(0, -0.05);
    } else if (e.key === 'ArrowDown') {
      this.fineAdjustPosition(0, 0.05);
    }
    // U: Undo last placement
    else if (e.key === 'u' || e.key === 'U') {
      this.undoLastPlacement();
    }
  }

  private _updateMouseCoordinates(e: MouseEvent): void {
    if (!this.sceneContainer) return;
    const rect = this.sceneContainer.getBoundingClientRect();
    this.mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  private _computeRaycastIntersection(): Vector3 | null {
    const camera = this.world?.camera;
    if (!(camera instanceof Camera)) return null;

    this.raycaster.setFromCamera(this.mouseVec, camera);

    // 1. Test against placed meshes for vertical stacking
    const meshes = Array.from(this.placedMeshesMap.values()).map((v) => v.mesh);
    if (meshes.length > 0) {
      const intersects = this.raycaster.intersectObjects(meshes, true);
      if (intersects.length > 0) {
        const hit = intersects[0];
        // Stack on top of hit point
        this.rayHitPos.copy(hit.point);
        return this.rayHitPos;
      }
    }

    // 2. Fall back to ground / building pad plane
    const planeHit = this.raycaster.ray.intersectPlane(this.groundPlane, this.rayHitPos);
    return planeHit;
  }

  private _raycastPlacedBlocks(): { instanceId: string } | null {
    const camera = this.world?.camera;
    if (!(camera instanceof Camera)) return null;

    this.raycaster.setFromCamera(this.mouseVec, camera);
    const meshes = Array.from(this.placedMeshesMap.values()).map((v) => v.mesh);
    const intersects = this.raycaster.intersectObjects(meshes, true);

    if (intersects.length > 0) {
      let topObj = intersects[0].object;
      while (topObj.parent && topObj.parent.name.startsWith('PlacedBlock_')) {
        topObj = topObj.parent;
      }
      for (const [id, val] of this.placedMeshesMap.entries()) {
        if (val.mesh === topObj || val.mesh.children.includes(topObj)) {
          return { instanceId: id };
        }
      }
    }
    return null;
  }

  private _updateCameraFromOrbit(): void {
    const camera = this.world?.camera;
    if (!(camera instanceof PerspectiveCamera)) return;

    const x = this.orbitTarget.x + this.cameraDistance * Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch);
    const y = this.orbitTarget.y + this.cameraDistance * Math.sin(this.cameraPitch);
    const z = this.orbitTarget.z + this.cameraDistance * Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch);

    camera.position.set(x, y, z);
    camera.lookAt(this.orbitTarget);
    camera.updateProjectionMatrix();
  }

  // =========================================================================
  // Component Selection, Drag & Placement API
  // =========================================================================

  public selectComponent(
    instanceIdOrType: string,
    componentType?: ComponentType,
    initialPos: Vector3 = new Vector3(0, 0.5, -2.5),
    initialRot: Quaternion = new Quaternion(),
  ): void {
    let instanceId = instanceIdOrType;
    let type = componentType;

    if (!type) {
      if (instanceIdOrType in CONSTRUCTION_CATALOG) {
        type = instanceIdOrType as ComponentType;
        instanceId = `spawned_${type}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      } else {
        type = 'clay_brick';
      }
    }

    this.heldItem = {
      instanceId,
      componentType: type,
      position: initialPos.clone(),
      rotation: initialRot.clone(),
    };

    constructionPhysicsManager.activateComponentForGrab(instanceId);
    assemblySystem.unregisterBlock(instanceId);
    constructionTutorialManager.onComponentSelected(type);

    this.moveHeldComponent(initialPos);
  }

  public pickUpComponent(instanceId: string): boolean {
    const entry = this.placedMeshesMap.get(instanceId);
    if (!entry) return false;

    const mesh = entry.mesh;
    this.heldItem = {
      instanceId,
      componentType: entry.type,
      position: mesh.position.clone(),
      rotation: mesh.quaternion.clone(),
    };

    // Remove entity from scene while dragging
    if (entry.entity?.dispose) {
      entry.entity.dispose();
    } else if (mesh.parent) {
      mesh.parent.remove(mesh);
    }
    this.placedMeshesMap.delete(instanceId);
    assemblySystem.unregisterBlock(instanceId);
    constructionPhysicsManager.activateComponentForGrab(instanceId);

    this.moveHeldComponent(this.heldItem.position);
    constructionTutorialManager.onComponentRepositioned();
    return true;
  }

  public moveHeldComponent(targetPosition: Vector3): void {
    if (!this.heldItem) return;

    this.heldItem.position.copy(targetPosition);

    // Evaluate snap candidate
    this.activeCandidate = assemblySystem.findBestSnapCandidate(
      this.heldItem.instanceId,
      this.heldItem.componentType,
      this.heldItem.position,
      this.heldItem.rotation,
    );

    this.preview.updatePreview(
      this.heldItem.componentType,
      this.activeCandidate,
      this.heldItem.position,
      this.heldItem.rotation,
    );
  }

  public rotateHeldComponentYaw(angleDeltaRadians: number): void {
    if (!this.heldItem) return;

    this.tempQuat.setFromAxisAngle(new Vector3(0, 1, 0), angleDeltaRadians);
    this.heldItem.rotation.multiply(this.tempQuat).normalize();

    this.moveHeldComponent(this.heldItem.position);
  }

  public rotateYaw(angleDeltaRadians: number): void {
    this.rotateHeldComponentYaw(angleDeltaRadians);
  }

  public rotateHeldComponentPitch(angleDeltaRadians: number): void {
    if (!this.heldItem) return;

    this.tempQuat.setFromAxisAngle(new Vector3(1, 0, 0), angleDeltaRadians);
    this.heldItem.rotation.multiply(this.tempQuat).normalize();

    this.moveHeldComponent(this.heldItem.position);
  }

  public rotatePitch(angleDeltaRadians: number): void {
    this.rotateHeldComponentPitch(angleDeltaRadians);
  }

  public place(): boolean {
    const res = this.releaseAndPlace();
    return res.success;
  }

  public fineAdjustPosition(dx: number, dz: number): void {
    if (!this.heldItem) return;
    this.heldItem.position.x += dx;
    this.heldItem.position.z += dz;
    this.moveHeldComponent(this.heldItem.position);
  }

  public deleteSelectedComponent(): boolean {
    if (!this.heldItem) return false;
    const instanceId = this.heldItem.instanceId;
    this.cancelPlacement();
    assemblySystem.unregisterBlock(instanceId);
    return true;
  }

  public duplicateSelectedComponent(): string | null {
    if (!this.heldItem) return null;
    const newId = `dup_${this.heldItem.componentType}_${Date.now().toString(36)}`;
    const clonedPos = this.heldItem.position.clone().add(new Vector3(0.2, 0, 0));
    const clonedRot = this.heldItem.rotation.clone();
    const type = this.heldItem.componentType;

    // Place current, then select new
    this.releaseAndPlace();
    this.selectComponent(newId, type, clonedPos, clonedRot);
    return newId;
  }

  public cancelPlacement(): void {
    if (!this.heldItem) return;
    this.heldItem = null;
    this.activeCandidate = null;
    this.preview.hide();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('advenquo-placement-cancelled'));
    }
  }

  public releaseAndPlace(): { success: boolean; instanceId?: string; type?: ComponentType } {
    if (!this.heldItem) return { success: false };

    const instanceId = this.heldItem.instanceId;
    const componentType = this.heldItem.componentType;
    let placePos = this.heldItem.position.clone();
    let placeRot = this.heldItem.rotation.clone();
    let isStacked = false;
    let hasConnection = false;

    if (this.activeCandidate && this.activeCandidate.isValid) {
      const commit = assemblySystem.commitSnapPlacement(
        instanceId,
        componentType,
        this.activeCandidate,
      );

      if (commit.success) {
        placePos.copy(commit.snappedPosition);
        placeRot.copy(commit.snappedRotation);
        isStacked = placePos.y > 0.15;
        hasConnection = true;
        constructionPhysicsManager.optimizePlacedComponent(instanceId);
        this.placementHistory.push(instanceId);
      }
    } else {
      // Place directly on building pad
      assemblySystem.registerPlacedBlock({
        instanceId,
        componentType,
        position: placePos,
        rotation: placeRot,
        isGrounded: placePos.y <= 0.2,
      });
      constructionPhysicsManager.optimizePlacedComponent(instanceId);
      this.placementHistory.push(instanceId);
    }

    // Spawn real visual 3D mesh in the scene
    this._spawnPlacedMeshEntity(instanceId, componentType, placePos, placeRot);

    // Notify tutorial manager
    constructionTutorialManager.onComponentPlaced({
      instanceId,
      componentType,
      isStacked,
      hasConnection,
    });

    // Evaluate progression
    challengeManager.evaluateProgress(assemblySystem.getGraph());

    this.heldItem = null;
    this.activeCandidate = null;
    this.preview.hide();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('advenquo-component-placed', {
          detail: {
            instanceId,
            componentType,
            isStacked,
            hasConnection,
          },
        }),
      );
    }

    return { success: true, instanceId, type: componentType };
  }

  private _spawnPlacedMeshEntity(
    instanceId: string,
    componentType: ComponentType,
    position: Vector3,
    rotation: Quaternion,
  ): void {
    const spec = getComponentSpec(componentType);
    const mesh = createComponentMesh(componentType);
    mesh.name = `PlacedBlock_${instanceId}`;
    mesh.position.copy(position);
    mesh.quaternion.copy(rotation);

    let entity: any = null;
    if (this.world) {
      entity = this.world.createTransformEntity(mesh, { parent: this.world.sceneEntity });
      entity.addComponent(ConstructionBlock, {
        instanceId,
        componentType,
        structuralRole: spec.structuralRole,
        isPlaced: true,
        isHeld: false,
        isStaticOptimized: true,
      });

      if (spec.requiresTwoHands) {
        entity.addComponent(TwoHandsGrabbable, {});
      } else {
        entity.addComponent(OneHandGrabbable, {});
      }
      entity.addComponent(RayInteractable, {});
    }

    this.placedMeshesMap.set(instanceId, { mesh, entity, type: componentType });
  }

  public undoLastPlacement(): string | null {
    const lastId = this.placementHistory.pop();
    if (!lastId) return null;

    assemblySystem.unregisterBlock(lastId);
    constructionPhysicsManager.activateComponentForGrab(lastId);

    const entry = this.placedMeshesMap.get(lastId);
    if (entry) {
      if (entry.entity?.dispose) {
        entry.entity.dispose();
      } else if (entry.mesh?.parent) {
        entry.mesh.parent.remove(entry.mesh);
      }
      this.placedMeshesMap.delete(lastId);
    }

    constructionTutorialManager.onComponentRepositioned();
    return lastId;
  }

  public reset(): void {
    this.heldItem = null;
    this.activeCandidate = null;
    this.placementHistory = [];
    this.preview.hide();

    for (const [, val] of this.placedMeshesMap.entries()) {
      if (val.entity?.dispose) {
        val.entity.dispose();
      } else if (val.mesh?.parent) {
        val.mesh.parent.remove(val.mesh);
      }
    }
    this.placedMeshesMap.clear();
  }
}

export const desktopConstructionController = DesktopConstructionController.getInstance();
