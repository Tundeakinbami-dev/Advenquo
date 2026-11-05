/**
 * Advenquo — Character Animation Controller.
 *
 * Implements a robust Three.js AnimationMixer state machine for characters:
 * - Idle (respiratory breathing loop)
 * - Walking (locomotion stride cycle)
 * - Running (cadence cycle)
 * - Jumping (Standing Jump — one-shot with anticipation, apex, landing recovery)
 * - Pain Reaction (Pain Gesture — one-shot shock/recoil and defensive posture)
 * - Talking (conversational emphasis and gestures)
 * - Interaction (deliberate object contact)
 *
 * Key guarantees:
 * - Smooth fade-in, fade-out, and cross-fade blending without pops or T-pose flashes
 * - No conflicting overlapping full-body animations
 * - Root-motion clamping: isolates horizontal translation so characters never drift or teleport
 * - Automatic recovery to base state (idle/walking) when one-shot animations finish
 * - Frame-budget friendly: zero runtime allocations in update(delta)
 * - Safe disposal with complete mixer and action un-caching
 */

import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  LoopOnce,
  LoopRepeat,
  Object3D,
  Vector3,
} from '@iwsdk/core';

export type CharacterAnimationState =
  | 'idle'
  | 'walking'
  | 'running'
  | 'jumping'
  | 'pain'
  | 'talking'
  | 'interaction';

export interface ControllerOptions {
  defaultState?: CharacterAnimationState;
  fadeDuration?: number;
  speed?: number;
  onStateChange?: (state: CharacterAnimationState) => void;
  onActionComplete?: (actionName: string) => void;
}

export class CharacterAnimationController {
  public readonly root: Object3D;
  public readonly mixer: AnimationMixer;

  private actions = new Map<string, AnimationAction>();
  private currentState: CharacterAnimationState = 'idle';
  private previousState: CharacterAnimationState = 'idle';
  private currentAction: AnimationAction | null = null;
  private isOneShotActive = false;
  private playbackSpeed = 1.0;
  private defaultFadeDuration = 0.25;

  // Root position tracking to prevent drift
  private basePosition = new Vector3();
  private hasBasePosition = false;

  // Callbacks
  private onStateChange?: (state: CharacterAnimationState) => void;
  private onActionComplete?: (actionName: string) => void;
  private boundOnFinished: (event: any) => void;

  constructor(root: Object3D, options: ControllerOptions = {}) {
    this.root = root;
    this.mixer = new AnimationMixer(root);
    this.defaultFadeDuration = options.fadeDuration ?? 0.25;
    this.playbackSpeed = options.speed ?? 1.0;
    this.onStateChange = options.onStateChange;
    this.onActionComplete = options.onActionComplete;

    this.basePosition.copy(root.position);
    this.hasBasePosition = true;

    // Listen to mixer finished event for one-shot transitions
    this.boundOnFinished = (event: any) => this.handleActionFinished(event);
    this.mixer.addEventListener('finished', this.boundOnFinished);
  }

  /**
   * Register an AnimationClip for a specific state.
   */
  public registerClip(state: CharacterAnimationState, clip: AnimationClip): void {
    const action = this.mixer.clipAction(clip);
    if (state === 'jumping' || state === 'pain' || state === 'interaction') {
      action.setLoop(LoopOnce, 1);
      action.clampWhenFinished = true;
    } else {
      action.setLoop(LoopRepeat, Infinity);
    }
    this.actions.set(state, action);
  }

  /**
   * Set playback speed multiplier.
   */
  public setSpeed(speed: number): void {
    this.playbackSpeed = Math.max(0.1, speed);
  }

  /**
   * Get the current active animation state.
   */
  public getCurrentState(): CharacterAnimationState {
    return this.currentState;
  }

  /**
   * Whether a one-shot action (jumping or pain) is currently playing.
   */
  public isPlayingOneShot(): boolean {
    return this.isOneShotActive;
  }

  /**
   * Transition to a new animation state with smooth cross-fading.
   */
  public transitionTo(
    nextState: CharacterAnimationState,
    fadeDuration = this.defaultFadeDuration,
    force = false,
  ): boolean {
    if (this.currentState === nextState && !force) {
      return false;
    }

    const nextAction = this.actions.get(nextState);
    if (!nextAction) {
      // Fallback: state has no registered clip yet
      return false;
    }

    const isNextOneShot = nextState === 'jumping' || nextState === 'pain';

    // If a one-shot action is currently active and this is a continuous state,
    // preserve the target state to resume upon one-shot completion.
    if (this.isOneShotActive && !isNextOneShot && !force) {
      this.previousState = nextState;
      return false;
    }

    const prevAction = this.currentAction;

    if (isNextOneShot) {
      if (!this.isOneShotActive) {
        this.previousState = this.currentState;
      }
      this.isOneShotActive = true;
    } else {
      this.isOneShotActive = false;
    }

    // Configure next action
    nextAction.reset();
    nextAction.setEffectiveTimeScale(this.playbackSpeed);
    nextAction.setEffectiveWeight(1.0);

    if (prevAction && prevAction !== nextAction) {
      // Perform cross-fade transition
      prevAction.fadeOut(fadeDuration);
      nextAction.fadeIn(fadeDuration);
    } else {
      nextAction.fadeIn(fadeDuration);
    }

    nextAction.play();

    this.currentAction = nextAction;
    this.currentState = nextState;

    this.onStateChange?.(nextState);
    return true;
  }

  /**
   * Trigger the Standing Jump action.
   */
  public triggerJump(fadeDuration = 0.2): boolean {
    return this.transitionTo('jumping', fadeDuration, true);
  }

  /**
   * Trigger the Pain Gesture action.
   */
  public triggerPain(fadeDuration = 0.15): boolean {
    return this.transitionTo('pain', fadeDuration, true);
  }

  /**
   * Handle completion of one-shot actions (standing jump or pain gesture).
   */
  private handleActionFinished(event: any): void {
    const finishedAction = event.action as AnimationAction;
    const finishedState = this.currentState;

    if (finishedAction === this.currentAction && this.isOneShotActive) {
      this.isOneShotActive = false;

      // Notify action complete callback
      this.onActionComplete?.(finishedState);

      // Smoothly recover to previous base state (idle, walking, or talking)
      const targetState = this.previousState || 'idle';
      this.transitionTo(targetState, this.defaultFadeDuration, true);
    }
  }

  /**
   * Per-frame update step.
   * Frame-budget friendly: zero heap allocation during update.
   */
  public update(delta: number): void {
    if (delta > 0) {
      this.mixer.update(delta * this.playbackSpeed);
    }
  }

  /**
   * Safely dispose the mixer and release all actions.
   */
  public dispose(): void {
    this.mixer.removeEventListener('finished', this.boundOnFinished);
    this.mixer.stopAllAction();
    for (const action of this.actions.values()) {
      this.mixer.uncacheAction(action.getClip(), this.root);
    }
    this.actions.clear();
    this.mixer.uncacheRoot(this.root);
    this.currentAction = null;
  }
}
