/**
 * Advenquo — 3D Adventure Player Controller & World Navigation System.
 *
 * Provides real-time first-person movement, natural viewpoint rotation,
 * collision boundaries, and objective navigation across:
 * - Desktop browsers: WASD / Arrow keys + Mouse drag / look
 * - Mobile browsers: Touch virtual joystick + Touch swipe look
 * - Meta Quest WebXR: LocomotionSystem thumbstick + Headset tracking
 *
 * Deterministic and frame-budget friendly: allocates vectors once in init().
 */

import {
  createSystem,
  PerspectiveCamera,
  Vector3,
  VisibilityState,
} from '@iwsdk/core';

import { CinematicCameraSystem } from './systems/cinematic-camera-system.js';

export interface ObjectiveTarget {
  name: string;
  position: Vector3;
  radius: number;
}

export class PlayerControllerSystem extends createSystem({}) {
  // Navigation & viewpoint vectors
  private moveVelocity = new Vector3();
  private forwardVec = new Vector3();
  private rightVec = new Vector3();
  private targetVec = new Vector3();

  // Position & Orientation
  private currentYaw = 0; // Radians
  private currentPitch = 0; // Radians (clamped -60° to +60°)
  private playerHeight = 1.6; // Meters
  private walkSpeed = 3.6; // Meters/sec

  // Boundary limits (Ìsàlẹ̀ Èkó courtyard)
  private minX = -6.8;
  private maxX = 6.8;
  private minZ = -6.4;
  private maxZ = 6.4;

  // Input states
  private keysDown: Record<string, boolean> = {};
  private isPointerDragging = false;
  private lastPointerX = 0;
  private lastPointerY = 0;

  // Touch virtual controls
  private touchMoveActive = false;
  private touchMoveStartX = 0;
  private touchMoveStartY = 0;
  private touchMoveDeltaX = 0;
  private touchMoveDeltaY = 0;

  private touchLookActive = false;
  private touchLookStartX = 0;
  private touchLookStartY = 0;

  // State flags
  private isImmersiveXR = false;
  private isExplorationMode = true;

  // Active Objective target for distance and compass navigation
  private activeTarget: ObjectiveTarget | null = null;
  private currentDistanceToTarget = 0;
  private currentBearingToTarget = 0; // Degrees (-180 to 180)

  // Singleton accessor for UI HUD
  private static instance: PlayerControllerSystem | null = null;
  public static getInstance(): PlayerControllerSystem | null {
    return PlayerControllerSystem.instance;
  }

  init(): void {
    PlayerControllerSystem.instance = this;

    // Track VR session state
    this.cleanupFuncs.push(
      this.world.visibilityState.subscribe((state) => {
        this.isImmersiveXR = state === VisibilityState.Visible;
      }),
    );

    // Initial desktop camera position
    const camera = this.world.camera;
    if (camera instanceof PerspectiveCamera) {
      camera.position.set(0, this.playerHeight, 1.2);
      this.currentYaw = 0;
      this.currentPitch = 0;
    }

    // Attach Keyboard Listeners
    const onKeyDown = (e: KeyboardEvent): void => {
      // Ignore if typing in text input
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      this.keysDown[e.code] = true;
      this.keysDown[e.key.toLowerCase()] = true;
    };

    const onKeyUp = (e: KeyboardEvent): void => {
      this.keysDown[e.code] = false;
      this.keysDown[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    this.cleanupFuncs.push(() => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    });

    // Attach Mouse Look Drag Listeners to Scene Container
    const sceneContainer = document.getElementById('scene-container');
    if (sceneContainer) {
      const onMouseDown = (e: MouseEvent): void => {
        // Left click drag or right click drag to look around
        if (e.button === 0 || e.button === 2) {
          this.isPointerDragging = true;
          this.lastPointerX = e.clientX;
          this.lastPointerY = e.clientY;
        }
      };

      const onMouseMove = (e: MouseEvent): void => {
        if (!this.isPointerDragging || this.isImmersiveXR) return;
        const dx = e.clientX - this.lastPointerX;
        const dy = e.clientY - this.lastPointerY;
        this.lastPointerX = e.clientX;
        this.lastPointerY = e.clientY;

        const sensitivity = 0.0032;
        this.currentYaw -= dx * sensitivity;
        this.currentPitch -= dy * sensitivity;

        // Clamp pitch to [-1.0, 1.0] rad (~ -57° to +57°)
        const pitchLimit = 1.0;
        this.currentPitch = Math.max(-pitchLimit, Math.min(pitchLimit, this.currentPitch));
      };

      const onMouseUp = (): void => {
        this.isPointerDragging = false;
      };

      sceneContainer.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);

      this.cleanupFuncs.push(() => {
        sceneContainer.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      });

      // Touch controls for Mobile Exploration
      const onTouchStart = (e: TouchEvent): void => {
        if (this.isImmersiveXR) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (t.clientX < window.innerWidth * 0.45) {
            // Left side touch: virtual move joystick
            this.touchMoveActive = true;
            this.touchMoveStartX = t.clientX;
            this.touchMoveStartY = t.clientY;
            this.touchMoveDeltaX = 0;
            this.touchMoveDeltaY = 0;
          } else {
            // Right side touch: view look
            this.touchLookActive = true;
            this.touchLookStartX = t.clientX;
            this.touchLookStartY = t.clientY;
          }
        }
      };

      const onTouchMove = (e: TouchEvent): void => {
        if (this.isImmersiveXR) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (this.touchMoveActive && t.clientX < window.innerWidth * 0.55) {
            const dx = t.clientX - this.touchMoveStartX;
            const dy = t.clientY - this.touchMoveStartY;
            const maxRadius = 48;
            this.touchMoveDeltaX = Math.max(-1, Math.min(1, dx / maxRadius));
            this.touchMoveDeltaY = Math.max(-1, Math.min(1, dy / maxRadius));
          } else if (this.touchLookActive) {
            const dx = t.clientX - this.touchLookStartX;
            const dy = t.clientY - this.touchLookStartY;
            this.touchLookStartX = t.clientX;
            this.touchLookStartY = t.clientY;

            const touchSens = 0.005;
            this.currentYaw -= dx * touchSens;
            this.currentPitch = Math.max(-1.0, Math.min(1.0, this.currentPitch - dy * touchSens));
          }
        }
      };

      const onTouchEnd = (e: TouchEvent): void => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (t.clientX < window.innerWidth * 0.55) {
            this.touchMoveActive = false;
            this.touchMoveDeltaX = 0;
            this.touchMoveDeltaY = 0;
          } else {
            this.touchLookActive = false;
          }
        }
      };

      sceneContainer.addEventListener('touchstart', onTouchStart, { passive: true });
      sceneContainer.addEventListener('touchmove', onTouchMove, { passive: true });
      sceneContainer.addEventListener('touchend', onTouchEnd, { passive: true });

      this.cleanupFuncs.push(() => {
        sceneContainer.removeEventListener('touchstart', onTouchStart);
        sceneContainer.removeEventListener('touchmove', onTouchMove);
        sceneContainer.removeEventListener('touchend', onTouchEnd);
      });
    }
  }

  public setActiveTarget(target: ObjectiveTarget | null): void {
    this.activeTarget = target;
  }

  public getActiveTarget(): ObjectiveTarget | null {
    return this.activeTarget;
  }

  public getDistanceToTarget(): number {
    return this.currentDistanceToTarget;
  }

  public getBearingToTarget(): number {
    return this.currentBearingToTarget;
  }

  public setBoundaryLimits(minX: number, maxX: number, minZ: number, maxZ: number): void {
    this.minX = minX;
    this.maxX = maxX;
    this.minZ = minZ;
    this.maxZ = maxZ;
  }

  public teleportTo(x: number, z: number, yaw = 0): void {
    const camera = this.world.camera;
    if (camera) {
      camera.position.set(x, this.playerHeight, z);
      this.currentYaw = yaw;
      this.currentPitch = 0;
    }
    if (this.player) {
      this.player.position.set(x, 0, z);
    }
  }

  update(delta: number): void {
    const camera = this.world.camera;
    if (!camera) return;

    // In desktop / mobile 2D exploration mode:
    if (!this.isImmersiveXR && this.isExplorationMode) {
      // 1. Calculate Forward & Right vectors from current yaw
      this.forwardVec.set(-Math.sin(this.currentYaw), 0, -Math.cos(this.currentYaw)).normalize();
      this.rightVec.set(Math.cos(this.currentYaw), 0, -Math.sin(this.currentYaw)).normalize();

      // 2. Aggregate movement input from keyboard & touch
      let moveZ = 0; // +1 forward, -1 backward
      let moveX = 0; // +1 right, -1 left

      if (this.keysDown['KeyW'] || this.keysDown['ArrowUp'] || this.keysDown['w']) moveZ += 1;
      if (this.keysDown['KeyS'] || this.keysDown['ArrowDown'] || this.keysDown['s']) moveZ -= 1;
      if (this.keysDown['KeyD'] || this.keysDown['ArrowRight'] || this.keysDown['d']) moveX += 1;
      if (this.keysDown['KeyA'] || this.keysDown['ArrowLeft'] || this.keysDown['a']) moveX -= 1;

      // Add touch input
      if (this.touchMoveActive) {
        moveZ -= this.touchMoveDeltaY;
        moveX += this.touchMoveDeltaX;
      }

      // 3. Apply translation with collision & boundaries
      const isPlayerMoving = Math.abs(moveX) > 0.01 || Math.abs(moveZ) > 0.01;
      const cinematicCam = CinematicCameraSystem.getInstance();
      if (cinematicCam) {
        cinematicCam.setMoving(isPlayerMoving);
      }

      if (isPlayerMoving) {
        const isRunning = Boolean(
          this.keysDown['ShiftLeft'] ||
          this.keysDown['ShiftRight'] ||
          this.keysDown['shift'] ||
          this.keysDown['Shift'],
        );
        const activeSpeed = isRunning ? this.walkSpeed * 1.8 : this.walkSpeed;

        this.moveVelocity.set(0, 0, 0);
        this.moveVelocity.addScaledVector(this.forwardVec, moveZ);
        this.moveVelocity.addScaledVector(this.rightVec, moveX);
        this.moveVelocity.normalize().multiplyScalar(activeSpeed * Math.min(delta, 0.1));

        let newX = camera.position.x + this.moveVelocity.x;
        let newZ = camera.position.z + this.moveVelocity.z;

        // Dynamic perimeter clamp
        newX = Math.max(this.minX, Math.min(this.maxX, newX));
        newZ = Math.max(this.minZ, Math.min(this.maxZ, newZ));

        // Prevent walking through market veranda back wall (z < -4.1) when in market boundaries
        if (this.minX >= -7 && this.maxX <= 7 && newZ < -4.1) {
          newZ = -4.1;
        }

        camera.position.x = newX;
        camera.position.z = newZ;
        camera.position.y = this.playerHeight;
      }

      // 4. Update camera rotation from yaw & pitch (unless cinematic camera is active)
      if (!cinematicCam || cinematicCam.getMode() === 'exploration') {
        camera.rotation.order = 'YXZ';
        camera.rotation.y = this.currentYaw;
        camera.rotation.x = this.currentPitch;
        camera.rotation.z = 0;
      }

      // Keep this.player.position synchronized for proximity systems
      if (this.player) {
        this.player.position.set(camera.position.x, 0, camera.position.z);
      }
    }

    // 5. Update distance and bearing to active objective target
    if (this.activeTarget) {
      const currentPos = this.isImmersiveXR && this.player?.head
        ? this.player.head.position
        : camera.position;

      const dx = this.activeTarget.position.x - currentPos.x;
      const dz = this.activeTarget.position.z - currentPos.z;
      this.currentDistanceToTarget = Math.sqrt(dx * dx + dz * dz);

      // Angle from player forward vector to target
      const targetAngle = Math.atan2(dx, -dz); // 0 = forward, +PI/2 = right
      let diff = targetAngle - this.currentYaw;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.currentBearingToTarget = (diff * 180) / Math.PI;

      // Real-time HUD distance label update
      const distEl = document.getElementById('adventure-distance-label');
      if (distEl) {
        const roundedDist = Math.round(this.currentDistanceToTarget * 10) / 10;
        let compassArrow = '⬆️';
        if (this.currentBearingToTarget > 45 && this.currentBearingToTarget < 135) compassArrow = '➡️';
        else if (this.currentBearingToTarget >= 135 || this.currentBearingToTarget <= -135) compassArrow = '⬇️';
        else if (this.currentBearingToTarget < -45 && this.currentBearingToTarget > -135) compassArrow = '⬅️';
        distEl.textContent = `${compassArrow} ${roundedDist > 0 ? `${roundedDist}m away` : 'At location'}`;
      }
    }
  }
}

