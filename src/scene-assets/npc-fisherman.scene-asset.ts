/**
 * Advenquo — Captain Femi (Tarkwa Bay Maritime Ferryman & Fisherman) procedural 3D NPC.
 *
 * Coastal guide and boatman at Tarkwa Bay:
 * - Woven wide-brim straw sun hat
 * - Maritime teal-blue vest and light cotton shirt
 * - Rolled beach utility trousers
 * - Hemp rope coil slung on shoulder
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
  TorusGeometry,
} from '@iwsdk/core';

export function buildNpcFisherman(): Object3D {
  const root = new Object3D();
  root.name = 'NpcFisherman';

  // Materials
  const skinMat = new MeshStandardMaterial({
    color: 0x4a2c11, // Deep weathered maritime brown skin tone
    roughness: 0.8,
  });

  const vestMat = new MeshStandardMaterial({
    color: 0x00838f, // Maritime deep teal utility vest
    roughness: 0.7,
  });

  const shirtMat = new MeshStandardMaterial({
    color: 0xeeeeee, // White cotton undershirt
    roughness: 0.8,
  });

  const pantsMat = new MeshStandardMaterial({
    color: 0x795548, // Rolled brown canvas utility shorts
    roughness: 0.85,
  });

  const strawMat = new MeshStandardMaterial({
    color: 0xd7ccc8, // Woven palm straw hat
    roughness: 0.9,
  });

  const ropeMat = new MeshStandardMaterial({
    color: 0xa1887f, // Coiled hemp mooring cord
    roughness: 0.95,
  });

  // 1. Legs (Standing barefoot on sand)
  const legGeo = new CylinderGeometry(0.09, 0.08, 0.8, 8);
  const leftLeg = new Mesh(legGeo, pantsMat);
  leftLeg.position.set(-0.16, 0.4, 0);
  root.add(leftLeg);

  const rightLeg = new Mesh(legGeo, pantsMat);
  rightLeg.position.set(0.16, 0.4, 0);
  root.add(rightLeg);

  // 2. Torso (Vest over shirt)
  const torsoGeo = new BoxGeometry(0.46, 0.58, 0.3);
  const torso = new Mesh(torsoGeo, vestMat);
  torso.position.set(0, 1.1, 0);
  root.add(torso);

  // 3. Head & Face
  const headGeo = new SphereGeometry(0.14, 12, 12);
  const head = new Mesh(headGeo, skinMat);
  head.position.set(0, 1.55, 0);
  root.add(head);

  // 4. Wide-Brim Straw Hat
  const hatCrownGeo = new CylinderGeometry(0.14, 0.16, 0.1, 12);
  const hatCrown = new Mesh(hatCrownGeo, strawMat);
  hatCrown.position.set(0, 1.68, 0);
  root.add(hatCrown);

  const hatBrimGeo = new CylinderGeometry(0.32, 0.32, 0.02, 16);
  const hatBrim = new Mesh(hatBrimGeo, strawMat);
  hatBrim.position.set(0, 1.63, 0);
  root.add(hatBrim);

  // 5. Coiled Mooring Rope slung on shoulder
  const ropeTorusGeo = new TorusGeometry(0.18, 0.035, 8, 16);
  const rope = new Mesh(ropeTorusGeo, ropeMat);
  rope.position.set(-0.25, 1.15, 0.05);
  rope.rotation.y = 0.4;
  root.add(rope);

  // 6. Arms
  const armGeo = new CylinderGeometry(0.065, 0.06, 0.6, 8);

  const leftArm = new Mesh(armGeo, skinMat);
  leftArm.position.set(-0.29, 1.05, 0);
  leftArm.rotation.z = 0.15;
  root.add(leftArm);

  const rightArm = new Mesh(armGeo, skinMat);
  rightArm.position.set(0.29, 1.05, 0.08);
  rightArm.rotation.x = -0.3; // Pointing towards the lagoon / canoe
  root.add(rightArm);

  return root;
}
