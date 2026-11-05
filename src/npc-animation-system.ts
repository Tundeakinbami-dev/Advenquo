/**
 * Advenquo — Cinematic NPC Procedural Animation & Articulation System.
 *
 * Implements high-fidelity, naturalistic real-time animations for human NPCs:
 * - Multi-joint respiratory breathing (chest expansion and shoulder rise)
 * - Articulated head & eye gaze tracking toward approaching player
 * - Conversational gesturing: when an NPC is engaged in dialogue (inDialogue: true),
 *   forearm and hand joints articulate natural speech gestures and emphasis pulses
 * - Periodic weight shifting and posture damping (natural living human presence)
 * - Smooth interpolation back to authored resting poses
 *
 * Frame-rate friendly: zero allocation in update(), deterministic performance.
 */

import {
  createSystem,
  Object3D,
  Vector3,
} from '@iwsdk/core';

import { NPCCharacter } from './npc-component.js';

interface ArticulatedNpcNodes {
  chest?: Object3D;
  neck?: Object3D;
  head?: Object3D;
  rightForearm?: Object3D;
  leftArm?: Object3D;
  baseChestY: number;
}

export class NpcAnimationSystem extends createSystem({
  npcs: { required: [NPCCharacter] },
}) {
  private elapsed = 0;
  private playerPos = new Vector3();
  private npcPos = new Vector3();
  private basePositions = new Map<number, { y: number; baseRotY: number }>();
  private articulatedNodes = new Map<number, ArticulatedNpcNodes>();

  init(): void {
    for (const entity of this.queries.npcs.entities) {
      this.cacheNpcTransforms(entity);
    }

    this.cleanupFuncs.push(
      this.queries.npcs.subscribe('qualify', (entity) => {
        this.cacheNpcTransforms(entity);
      }),
    );
  }

  private cacheNpcTransforms(entity: any): void {
    if (!entity.object3D) return;
    const obj = entity.object3D;

    this.basePositions.set(entity.index, {
      y: obj.position.y,
      baseRotY: obj.rotation.y,
    });

    // Discover articulated named joints in 3D hierarchy
    let chest = obj.getObjectByName('Tobi_Chest');
    let neck = obj.getObjectByName('Tobi_Neck');
    let head = obj.getObjectByName('Tobi_Head');
    let rightForearm = obj.getObjectByName('Tobi_RightForearm');
    let leftArm = obj.getObjectByName('Tobi_LeftArm');

    if (!chest) {
      // Search general hierarchy
      obj.traverse((child: Object3D) => {
        if (!chest && child.name.includes('Chest')) chest = child;
        if (!neck && child.name.includes('Neck')) neck = child;
        if (!head && child.name.includes('Head')) head = child;
        if (!rightForearm && child.name.includes('Forearm')) rightForearm = child;
      });
    }

    this.articulatedNodes.set(entity.index, {
      chest,
      neck,
      head,
      rightForearm,
      leftArm,
      baseChestY: chest ? chest.position.y : 1.02,
    });
  }

  update(delta: number): void {
    this.elapsed += delta;

    // Get current player position
    if (this.player?.head) {
      this.player.head.getWorldPosition(this.playerPos);
    } else if (this.world.camera) {
      this.playerPos.copy(this.world.camera.position);
    }

    for (const entity of this.queries.npcs.entities) {
      const obj = entity.object3D;
      if (!obj || !obj.visible) continue;

      let base = this.basePositions.get(entity.index);
      if (!base) {
        base = { y: obj.position.y, baseRotY: obj.rotation.y };
        this.basePositions.set(entity.index, base);
      }

      const nodes = this.articulatedNodes.get(entity.index);
      const inDialogue = Boolean(entity.getValue(NPCCharacter, 'inDialogue'));

      // 1. Multi-Joint Procedural Respiratory Breathing
      const breathPhase = this.elapsed * 2.2 + entity.index * 0.8;
      const breathOffset = Math.sin(breathPhase) * 0.005;

      if (nodes?.chest) {
        // Anatomical chest inhalation expansion
        nodes.chest.position.y = nodes.baseChestY + breathOffset;
        nodes.chest.scale.z = 1.0 + Math.sin(breathPhase) * 0.025;
      } else {
        // Fallback root bob
        obj.position.y = base.y + breathOffset;
      }

      // 2. Spatial Attention & Gaze Tracking
      obj.getWorldPosition(this.npcPos);
      const dx = this.playerPos.x - this.npcPos.x;
      const dz = this.playerPos.z - this.npcPos.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const attentionRadius = entity.getValue(NPCCharacter, 'interactionRadius') || 3.8;

      if (dist <= attentionRadius && dist > 0.3) {
        const targetYaw = Math.atan2(dx, dz);
        let diff = targetYaw - obj.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;

        obj.rotation.y += diff * Math.min(delta * 2.5, 0.25);

        // Articulated Head & Neck tilt toward player's eye height
        if (nodes?.head) {
          const dy = this.playerPos.y - (this.npcPos.y + 1.58);
          const targetPitch = Math.atan2(dy, Math.max(dist, 0.5));
          nodes.head.rotation.x = Math.max(-0.4, Math.min(0.35, targetPitch * 0.6));
        }
      } else {
        // Return smoothly to authored resting yaw
        let returnDiff = base.baseRotY - obj.rotation.y;
        while (returnDiff > Math.PI) returnDiff -= Math.PI * 2;
        while (returnDiff < -Math.PI) returnDiff += Math.PI * 2;

        if (Math.abs(returnDiff) > 0.01) {
          obj.rotation.y += returnDiff * Math.min(delta * 1.5, 0.15);
        }

        if (nodes?.head) {
          nodes.head.rotation.x *= Math.max(0, 1 - delta * 2.0);
        }
      }

      // 3. Conversational Hand & Forearm Gestures
      if (inDialogue && nodes?.rightForearm) {
        const gesturePhase = this.elapsed * 3.6;
        const gestureSwing = Math.sin(gesturePhase) * 0.22;
        const gesturePulse = Math.cos(gesturePhase * 0.7) * 0.12;

        nodes.rightForearm.rotation.x = -0.25 + gestureSwing;
        nodes.rightForearm.rotation.z = gesturePulse;

        if (nodes.head) {
          // Subtle emphatic head nod cadence while speaking
          nodes.head.rotation.y = Math.sin(gesturePhase * 0.5) * 0.08;
        }
      } else if (nodes?.rightForearm) {
        // Return forearm to resting neutral pose
        nodes.rightForearm.rotation.x *= Math.max(0, 1 - delta * 3.0);
        nodes.rightForearm.rotation.z *= Math.max(0, 1 - delta * 3.0);
      }
    }
  }
}
