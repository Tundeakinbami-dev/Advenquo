/**
 * Advenquo — Tunde Bakare (Tech Innovator & Lead Engineer) procedural 3D NPC.
 *
 * Resident tech lead in Yaba Innovation Corridor:
 * - Smart casual polo shirt and dark trousers
 * - Digital smartwatch on wrist, lanyard badge around neck
 * - Welcoming pose with tablet computer in hand
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

export function buildNpcTundeBakare(): Object3D {
  const root = new Object3D();
  root.name = 'NpcTundeBakare';

  // Materials
  const skinMat = new MeshStandardMaterial({
    color: 0x5d4037, // Rich Nigerian skin tone
    roughness: 0.8,
  });

  const shirtMat = new MeshStandardMaterial({
    color: 0x0288d1, // Clean modern blue tech polo
    roughness: 0.7,
  });

  const pantsMat = new MeshStandardMaterial({
    color: 0x263238, // Charcoal trousers
    roughness: 0.8,
  });

  const shoeMat = new MeshStandardMaterial({
    color: 0x212121,
    roughness: 0.5,
  });

  const tabletMat = new MeshStandardMaterial({
    color: 0x111111,
    metalness: 0.8,
    roughness: 0.2,
  });

  const lanyardMat = new MeshStandardMaterial({
    color: 0xff6d00, // Vibrant orange CcHUB lanyard
  });

  // 1. Shoes
  const shoeGeo = new BoxGeometry(0.12, 0.08, 0.26);
  const leftShoe = new Mesh(shoeGeo, shoeMat);
  leftShoe.position.set(-0.14, 0.04, 0.02);
  root.add(leftShoe);

  const rightShoe = new Mesh(shoeGeo, shoeMat);
  rightShoe.position.set(0.14, 0.04, 0.02);
  root.add(rightShoe);

  // 2. Legs / Trousers
  const legGeo = new CylinderGeometry(0.08, 0.07, 0.76, 10);
  const leftLeg = new Mesh(legGeo, pantsMat);
  leftLeg.position.set(-0.14, 0.44, 0);
  root.add(leftLeg);

  const rightLeg = new Mesh(legGeo, pantsMat);
  rightLeg.position.set(0.14, 0.44, 0);
  root.add(rightLeg);

  // 3. Torso / Blue Polo
  const torsoGeo = new BoxGeometry(0.44, 0.62, 0.26);
  const torso = new Mesh(torsoGeo, shirtMat);
  torso.position.set(0, 1.1, 0);
  root.add(torso);

  // Lanyard badge around neck
  const lanyardGeo = new CylinderGeometry(0.01, 0.01, 0.35, 6);
  const lanyard = new Mesh(lanyardGeo, lanyardMat);
  lanyard.position.set(0, 1.25, 0.14);
  root.add(lanyard);

  // 4. Arms
  const armGeo = new CylinderGeometry(0.06, 0.05, 0.58, 8);
  const leftArm = new Mesh(armGeo, shirtMat);
  leftArm.position.set(-0.28, 1.08, 0);
  root.add(leftArm);

  const rightArm = new Mesh(armGeo, shirtMat);
  rightArm.rotation.x = -Math.PI / 4;
  rightArm.position.set(0.28, 1.08, 0.15);
  root.add(rightArm);

  // 5. Tablet in right hand
  const tabletGeo = new BoxGeometry(0.18, 0.015, 0.26);
  const tablet = new Mesh(tabletGeo, tabletMat);
  tablet.position.set(0.28, 0.95, 0.35);
  root.add(tablet);

  // 6. Head and Neck
  const neckGeo = new CylinderGeometry(0.05, 0.06, 0.1, 8);
  const neck = new Mesh(neckGeo, skinMat);
  neck.position.set(0, 1.45, 0);
  root.add(neck);

  const headGeo = new SphereGeometry(0.13, 16, 16);
  const head = new Mesh(headGeo, skinMat);
  head.position.set(0, 1.6, 0);
  root.add(head);

  return root;
}
