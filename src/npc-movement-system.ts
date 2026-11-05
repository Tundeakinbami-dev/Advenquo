/**
 * Deterministic, scene-authored waypoint movement for lightweight world actors.
 * Routes are local to the actor's authored scene region and deliberately avoid
 * obstacles; this is a first bounded pedestrian loop, not a general NavMesh.
 */
import { createSystem, Object3D } from '@iwsdk/core';
import { NPCMovement } from './npc-movement-component.js';

interface WalkRig {
  leftLeg?: Object3D;
  rightLeg?: Object3D;
  leftArm?: Object3D;
  rightArm?: Object3D;
}

export class NPCMovementSystem extends createSystem({
  actors: { required: [NPCMovement] },
}) {
  private elapsed = 0;
  private walkRigs = new Map<number, WalkRig>();

  init(): void {
    for (const actor of this.queries.actors.entities) this.cacheWalkRig(actor);
    this.cleanupFuncs.push(
      this.queries.actors.subscribe('qualify', (actor) => this.cacheWalkRig(actor)),
      this.queries.actors.subscribe('disqualify', (actor) => this.walkRigs.delete(actor.index)),
    );
  }

  private cacheWalkRig(actor: any): void {
    const root = actor.object3D as Object3D | undefined;
    if (!root) return;
    this.walkRigs.set(actor.index, {
      leftLeg: root.getObjectByName('WalkLeftLeg'),
      rightLeg: root.getObjectByName('WalkRightLeg'),
      leftArm: root.getObjectByName('WalkLeftArm'),
      rightArm: root.getObjectByName('WalkRightArm'),
    });
  }

  update(delta: number): void {
    this.elapsed += delta;

    for (const actor of this.queries.actors.entities) {
      const root = actor.object3D as Object3D | undefined;
      if (!root || !root.visible || !actor.getValue(NPCMovement, 'enabled')) continue;

      const state = actor.getValue(NPCMovement, 'state') as string;
      if (state !== 'walking') {
        this.animateWalkRig(this.walkRigs.get(actor.index), 0, delta);
        continue;
      }

      const startX = actor.getValue(NPCMovement, 'startX') as number;
      const startZ = actor.getValue(NPCMovement, 'startZ') as number;
      const endX = actor.getValue(NPCMovement, 'endX') as number;
      const endZ = actor.getValue(NPCMovement, 'endZ') as number;
      const dx = endX - startX;
      const dz = endZ - startZ;
      const routeLength = Math.hypot(dx, dz);
      if (routeLength < 0.05) {
        actor.setValue(NPCMovement, 'state', 'idle');
        this.animateWalkRig(this.walkRigs.get(actor.index), 0, delta);
        continue;
      }

      const speed = Math.max(0, actor.getValue(NPCMovement, 'speed') as number);
      const wasMovingForward = Boolean(actor.getValue(NPCMovement, 'movingForward'));
      let progress = actor.getValue(NPCMovement, 'progress') as number;
      progress += (wasMovingForward ? 1 : -1) * speed * Math.min(delta, 0.1) / routeLength;

      let movingForward = wasMovingForward;
      if (progress >= 1) {
        progress = 1;
        movingForward = false;
      } else if (progress <= 0) {
        progress = 0;
        movingForward = true;
      }

      actor.setValue(NPCMovement, 'progress', progress);
      if (movingForward !== wasMovingForward) {
        actor.setValue(NPCMovement, 'movingForward', movingForward);
        actor.setValue(NPCMovement, 'destinationX', movingForward ? endX : startX);
        actor.setValue(NPCMovement, 'destinationZ', movingForward ? endZ : startZ);
      }

      root.position.x = startX + dx * progress;
      root.position.z = startZ + dz * progress;

      const direction = movingForward ? 1 : -1;
      const targetYaw = Math.atan2(dx * direction, dz * direction);
      let yawDifference = targetYaw - root.rotation.y;
      while (yawDifference > Math.PI) yawDifference -= Math.PI * 2;
      while (yawDifference < -Math.PI) yawDifference += Math.PI * 2;
      root.rotation.y += yawDifference * Math.min(1, delta * 6);

      const phase = this.elapsed * Math.max(3, speed * 8) + actor.index;
      this.animateWalkRig(this.walkRigs.get(actor.index), phase, delta);
    }
  }

  private animateWalkRig(rig: WalkRig | undefined, phase: number, delta: number): void {
    if (!rig) return;
    if (phase === 0) {
      const recovery = Math.max(0, 1 - delta * 6);
      if (rig.leftLeg) rig.leftLeg.rotation.x *= recovery;
      if (rig.rightLeg) rig.rightLeg.rotation.x *= recovery;
      if (rig.leftArm) rig.leftArm.rotation.x *= recovery;
      if (rig.rightArm) rig.rightArm.rotation.x *= recovery;
      return;
    }

    const stride = Math.sin(phase) * 0.34;
    if (rig.leftLeg) rig.leftLeg.rotation.x = stride;
    if (rig.rightLeg) rig.rightLeg.rotation.x = -stride;
    if (rig.leftArm) rig.leftArm.rotation.x = -stride * 0.65;
    if (rig.rightArm) rig.rightArm.rotation.x = stride * 0.65;
  }
}
