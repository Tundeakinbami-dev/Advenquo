/**
 * Advenquo — Amara Eze (Marine Ecologist & Coastal Conservationist) procedural 3D NPC.
 *
 * Coastal conservationist at Tarkwa Bay:
 * - Practical sun hat and breathable field shirt
 * - Marine field notebook and binoculars strapped across chest
 * - Cargo field shorts and deck sandals
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

export function buildNpcAmaraMarine(): Object3D {
  const root = new Object3D();
  root.name = 'NpcAmaraMarine';

  // Materials
  const skinMat = new MeshStandardMaterial({
    color: 0x5d4037,
    roughness: 0.8,
  });

  const shirtMat = new MeshStandardMaterial({
    color: 0x00897b, // Coastal teal field shirt
    roughness: 0.7,
  });

  const shortsMat = new MeshStandardMaterial({
    color: 0xd7ccc8, // Sand khaki cargo shorts
    roughness: 0.75,
  });

  const hatMat = new MeshStandardMaterial({
    color: 0xefebe9, // Wide-brim sun hat
    roughness: 0.6,
  });

  const binoMat = new MeshStandardMaterial({
    color: 0x212121,
    metalness: 0.8,
    roughness: 0.3,
  });

  // 1. Deck Sandals
  const sandalGeo = new BoxGeometry(0.11, 0.04, 0.24);
  const leftSandal = new Mesh(sandalGeo, shortsMat);
  leftSandal.position.set(-0.13, 0.02, 0);
  root.add(leftSandal);

  const rightSandal = new Mesh(sandalGeo, shortsMat);
  rightSandal.position.set(0.13, 0.02, 0);
  root.add(rightSandal);

  // 2. Legs / Khaki Shorts
  const legGeo = new CylinderGeometry(0.065, 0.06, 0.45, 8);
  const leftLeg = new Mesh(legGeo, skinMat);
  leftLeg.position.set(-0.13, 0.28, 0);
  root.add(leftLeg);

  const rightLeg = new Mesh(legGeo, skinMat);
  rightLeg.position.set(0.13, 0.28, 0);
  root.add(rightLeg);

  const shortsGeo = new BoxGeometry(0.42, 0.35, 0.26);
  const shorts = new Mesh(shortsGeo, shortsMat);
  shorts.position.set(0, 0.65, 0);
  root.add(shorts);

  // 3. Torso / Teal Field Shirt
  const torsoGeo = new BoxGeometry(0.42, 0.55, 0.24);
  const torso = new Mesh(torsoGeo, shirtMat);
  torso.position.set(0, 1.08, 0);
  root.add(torso);

  // Binoculars across chest
  const binoGeo = new BoxGeometry(0.16, 0.09, 0.1);
  const bino = new Mesh(binoGeo, binoMat);
  bino.position.set(0, 1.15, 0.15);
  root.add(bino);

  // 4. Arms
  const armGeo = new CylinderGeometry(0.05, 0.045, 0.55, 8);
  const leftArm = new Mesh(armGeo, shirtMat);
  leftArm.position.set(-0.26, 1.05, 0);
  root.add(leftArm);

  const rightArm = new Mesh(armGeo, shirtMat);
  rightArm.position.set(0.26, 1.05, 0);
  root.add(rightArm);

  // 5. Head and Wide-Brim Sun Hat
  const headGeo = new SphereGeometry(0.12, 14, 14);
  const head = new Mesh(headGeo, skinMat);
  head.position.set(0, 1.52, 0);
  root.add(head);

  // Sun Hat Brim & Crown
  const brimGeo = new CylinderGeometry(0.26, 0.26, 0.02, 16);
  const brim = new Mesh(brimGeo, hatMat);
  brim.position.set(0, 1.6, 0);
  root.add(brim);

  const crownGeo = new CylinderGeometry(0.14, 0.14, 0.1, 14);
  const crown = new Mesh(crownGeo, hatMat);
  crown.position.set(0, 1.66, 0);
  root.add(crown);

  return root;
}
