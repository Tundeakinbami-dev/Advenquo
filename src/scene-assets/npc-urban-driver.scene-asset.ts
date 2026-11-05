/**
 * Advenquo — Driver Kehinde (Lagos Danfo Commercial Transit Driver) procedural 3D NPC.
 *
 * Represents an iconic Lagos commercial driver in the Yaba Tech & Transit Corridor:
 * - Commercial transit polo shirt (canary yellow with green collar trim)
 * - Peaked driver visor cap
 * - Coin belt bag / conductor pouch
 * - Natural standing posture with welcoming gesture
 *
 * Deterministic and side-effect free: parentless Object3D, no DOM, no timers.
 */

import {
  BoxGeometry,
  CylinderGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  SphereGeometry,
} from '@iwsdk/core';

import { pbrMaterialSystem } from '../systems/pbr-material-system.js';

export function buildNpcUrbanDriver(): Object3D {
  const root = new Object3D();
  root.name = 'NpcUrbanDriver';

  // Realistic PBR Materials
  const skinMat = pbrMaterialSystem.getMaterial('human_skin_dark');

  const shirtMat = new MeshStandardMaterial({
    color: 0xfbc02d, // Bright transit amber-yellow
    roughness: 0.65,
  });

  const pantsMat = new MeshStandardMaterial({
    color: 0x263238, // Dark navy work trousers
    roughness: 0.8,
  });

  const capMat = new MeshStandardMaterial({
    color: 0x1565c0, // Blue driver cap
    roughness: 0.6,
  });

  const bagMat = pbrMaterialSystem.getMaterial('african_iroko', {
    color: 0x5d4037, // Leather waist pouch
    roughness: 0.55,
  });

  // 1. Legs / Trousers (standing)
  const legGeo = new CylinderGeometry(0.1, 0.09, 0.85, 8);
  const leftLeg = new Mesh(legGeo, pantsMat);
  leftLeg.position.set(-0.16, 0.42, 0);
  leftLeg.castShadow = true;
  root.add(leftLeg);

  const rightLeg = new Mesh(legGeo, pantsMat);
  rightLeg.position.set(0.16, 0.42, 0);
  rightLeg.castShadow = true;
  root.add(rightLeg);

  // 2. Torso (Yellow transit polo)
  const torsoGeo = new BoxGeometry(0.48, 0.6, 0.32);
  const torso = new Mesh(torsoGeo, shirtMat);
  torso.position.set(0, 1.15, 0);
  torso.castShadow = true;
  root.add(torso);

  // Waist belt & coin pouch
  const pouchGeo = new BoxGeometry(0.24, 0.16, 0.12);
  const pouch = new Mesh(pouchGeo, bagMat);
  pouch.position.set(0.12, 0.88, 0.18);
  pouch.castShadow = true;
  root.add(pouch);

  // 3. Head & Face
  const headGeo = new SphereGeometry(0.14, 12, 12);
  const head = new Mesh(headGeo, skinMat);
  head.position.set(0, 1.6, 0);
  head.castShadow = true;
  root.add(head);

  // 4. Peaked Driver Cap
  const capDomeGeo = new CylinderGeometry(0.15, 0.16, 0.09, 12);
  const capDome = new Mesh(capDomeGeo, capMat);
  capDome.position.set(0, 1.72, 0);
  capDome.castShadow = true;
  root.add(capDome);

  const visorGeo = new BoxGeometry(0.22, 0.02, 0.14);
  const visor = new Mesh(visorGeo, capMat);
  visor.position.set(0, 1.68, 0.14);
  visor.rotation.x = -0.15;
  visor.castShadow = true;
  root.add(visor);

  // 5. Arms
  const armGeo = new CylinderGeometry(0.065, 0.06, 0.62, 8);

  const leftArm = new Mesh(armGeo, shirtMat);
  leftArm.position.set(-0.31, 1.12, 0);
  leftArm.rotation.z = 0.15;
  root.add(leftArm);

  const rightArm = new Mesh(armGeo, shirtMat);
  rightArm.position.set(0.31, 1.12, 0.08);
  rightArm.rotation.x = -0.35; // Slight forward welcoming gesture
  root.add(rightArm);

  return root;
}
