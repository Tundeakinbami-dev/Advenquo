/**
 * Advenquo — Character Animation System.
 *
 * Coordinates real-time skeletal and retargeted animation for living world characters:
 * - Listens to CharacterAnimation components
 * - Directs Three.js AnimationMixer controllers for Standing Jump and Pain Gesture FBX animations
 * - Harmonizes with NPCMovementSystem (walking) and NpcAnimationSystem (dialogue/breathing)
 * - Ensures safe recovery to idle/locomotion after one-shot animations
 * - Provides keyboard shortcuts ('J' / Space for Jump, 'P' for Pain reaction) for desktop testing
 * - Frame-budget friendly: zero memory allocations in update(delta)
 */

import {
  createSystem,
  Object3D,
  Vector3,
} from '@iwsdk/core';

import { CharacterAnimation } from './character-animation-component.js';
import { animationManager, AnimationManager } from './animation/animation-manager.js';
import type { CharacterAnimationState } from './animation/character-animation-controller.js';

export class CharacterAnimationSystem extends createSystem({
  characters: { required: [CharacterAnimation] },
}) {
  private static instance: CharacterAnimationSystem | null = null;
  public static getInstance(): CharacterAnimationSystem | null {
    return CharacterAnimationSystem.instance;
  }

  // Preallocated vectors for proximity and targeting checks
  private tempVec = new Vector3();
  private playerPos = new Vector3();

  init(): void {
    CharacterAnimationSystem.instance = this;

    // Asynchronously warm up the animation library
    void animationManager.loadAnimations().then(() => {
      for (const entity of this.queries.characters.entities) {
        this.bindEntityController(entity);
      }
    });

    // Handle new qualifying characters
    this.cleanupFuncs.push(
      this.queries.characters.subscribe('qualify', (entity) => {
        this.bindEntityController(entity);
      }),
      this.queries.characters.subscribe('disqualify', (entity) => {
        animationManager.removeController(entity.index);
      }),
    );

    // Keyboard testing listeners for desktop exploration
    const onKeyDown = (e: KeyboardEvent): void => {
      // Ignore if typing in text fields
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') {
        return;
      }

      if (e.code === 'KeyJ') {
        // Trigger Jump on primary character or nearby NPC
        this.triggerPrimaryJump();
      } else if (e.code === 'KeyP') {
        // Trigger Pain Gesture on primary character or nearby NPC
        this.triggerPrimaryPain();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    this.cleanupFuncs.push(() => {
      window.removeEventListener('keydown', onKeyDown);
      CharacterAnimationSystem.instance = null;
    });
  }

  private bindEntityController(entity: any): void {
    const root = entity.object3D as Object3D | undefined;
    if (!root) return;

    const charId = (entity.getValue(CharacterAnimation, 'characterId') as string) || `actor_${entity.index}`;
    const rigType = (entity.getValue(CharacterAnimation, 'rigType') as any) || 'auto';

    const controller = animationManager.setupController(entity.index, root, rigType);

    // Also index by characterId for gameplay lookups
    if (charId) {
      animationManager.setupController(charId, root, rigType);
    }

    // Configure completion callback to sync ECS state
    controller.onActionComplete = () => {
      if (entity.hasComponent(CharacterAnimation)) {
        entity.setValue(CharacterAnimation, 'isOneShotPlaying', false);
        entity.setValue(CharacterAnimation, 'state', controller.getCurrentState());
      }
    };

    controller.transitionTo('idle');
  }

  /**
   * Trigger Standing Jump on a character by characterId.
   */
  public triggerJump(characterId: string): boolean {
    for (const entity of this.queries.characters.entities) {
      const id = entity.getValue(CharacterAnimation, 'characterId') as string;
      if (id === characterId) {
        entity.setValue(CharacterAnimation, 'trigger', 'jump');
        return true;
      }
    }
    return animationManager.triggerJump(characterId);
  }

  /**
   * Trigger Pain Gesture on a character by characterId.
   */
  public triggerPain(characterId: string): boolean {
    for (const entity of this.queries.characters.entities) {
      const id = entity.getValue(CharacterAnimation, 'characterId') as string;
      if (id === characterId) {
        entity.setValue(CharacterAnimation, 'trigger', 'pain');
        return true;
      }
    }
    return animationManager.triggerPain(characterId);
  }

  /**
   * Set animation state on a character by characterId.
   */
  public setAnimationState(characterId: string, state: CharacterAnimationState): boolean {
    for (const entity of this.queries.characters.entities) {
      const id = entity.getValue(CharacterAnimation, 'characterId') as string;
      if (id === characterId) {
        entity.setValue(CharacterAnimation, 'state', state);
        return true;
      }
    }
    return animationManager.setState(characterId, state);
  }

  /**
   * Find nearest character entity within interaction distance.
   */
  private getNearestCharacter(): any | null {
    if (this.player?.head) {
      this.player.head.getWorldPosition(this.playerPos);
    } else if (this.world.camera) {
      this.playerPos.copy(this.world.camera.position);
    }
    let nearest: any = null;
    let minDist = Infinity;
    for (const entity of this.queries.characters.entities) {
      const root = entity.object3D as Object3D | undefined;
      if (!root || !root.visible) continue;
      root.getWorldPosition(this.tempVec);
      const dist = this.tempVec.distanceTo(this.playerPos);
      if (dist < minDist) {
        minDist = dist;
        nearest = entity;
      }
    }
    return minDist < 12 ? nearest : null;
  }

  /**
   * Find primary character (e.g. Tobi) or nearest NPC to player and trigger Jump.
   */
  private triggerPrimaryJump(): void {
    const nearest = this.getNearestCharacter();
    if (nearest) {
      nearest.setValue(CharacterAnimation, 'trigger', 'jump');
      return;
    }
    if (this.triggerJump('npc_tobi')) return;
    for (const entity of this.queries.characters.entities) {
      entity.setValue(CharacterAnimation, 'trigger', 'jump');
      break;
    }
  }

  /**
   * Find primary character (e.g. Tobi) or nearest NPC to player and trigger Pain Gesture.
   */
  private triggerPrimaryPain(): void {
    const nearest = this.getNearestCharacter();
    if (nearest) {
      nearest.setValue(CharacterAnimation, 'trigger', 'pain');
      return;
    }
    if (this.triggerPain('npc_tobi')) return;
    for (const entity of this.queries.characters.entities) {
      entity.setValue(CharacterAnimation, 'trigger', 'pain');
      break;
    }
  }

  update(delta: number): void {
    for (const entity of this.queries.characters.entities) {
      const root = entity.object3D as Object3D | undefined;
      if (!root || !root.visible) continue;

      const controller = animationManager.getController(entity.index);
      if (!controller) continue;

      const trigger = entity.getValue(CharacterAnimation, 'trigger') as string;
      const isOneShot = controller.isPlayingOneShot();

      // Handle triggers requested by game logic
      if (trigger === 'jump') {
        controller.triggerJump();
        entity.setValue(CharacterAnimation, 'trigger', '');
        entity.setValue(CharacterAnimation, 'isOneShotPlaying', true);
        entity.setValue(CharacterAnimation, 'state', 'jumping');
        entity.setValue(CharacterAnimation, 'lastAction', 'jump');
      } else if (trigger === 'pain') {
        controller.triggerPain();
        entity.setValue(CharacterAnimation, 'trigger', '');
        entity.setValue(CharacterAnimation, 'isOneShotPlaying', true);
        entity.setValue(CharacterAnimation, 'state', 'pain');
        entity.setValue(CharacterAnimation, 'lastAction', 'pain');
      } else if (!isOneShot) {
        const animState = (entity.getValue(CharacterAnimation, 'state') as CharacterAnimationState) || 'idle';
        if (controller.getCurrentState() !== animState) {
          controller.transitionTo(animState);
        }
        entity.setValue(CharacterAnimation, 'isOneShotPlaying', false);
      }
    }

    // Step all active Three.js AnimationMixers forward
    animationManager.update(delta);
  }
}
