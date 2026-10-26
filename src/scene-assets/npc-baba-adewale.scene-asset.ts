/**
 * Advenquo — Baba Adéwálé (Elder of the Courtyard) procedural 3D NPC asset.
 *
 * Represents an esteemed elder holding audience on the veranda of Iga Idunganran.
 * - Wearing ceremonial Yoruba Agbada robe (deep crimson/terracotta with gold embroidery)
 * - Matching Fila (traditional cap) tilted to the side in the dignified elder style
 * - Coral beads (Ìlẹ̀kẹ̀) representing chieftaincy / lineage heritage
 * - Natural seated posture with resting hands
 *
 * Evaluated in two realms (runtime + editor) — deterministic and side-effect free.
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

export function buildNpcBabaAdewale(): Object3D {
  const root = new Object3D();
  root.name = 'NpcBabaAdewale';

  // Materials
  const agbadaMat = new MeshStandardMaterial({
    color: 0x880e4f, // Rich deep maroon / royal crimson
    roughness: 0.85,
    metalness: 0.05,
  });

  const goldAccentMat = new MeshStandardMaterial({
    color: 0xfbc02d, // Gold embroidery on neck and chest
    roughness: 0.5,
    metalness: 0.3,
  });

  const skinMat = new MeshStandardMaterial({
    color: 0x4a2c11, // Rich deep brown skin tone
    roughness: 0.75,
    metalness: 0.0,
  });

  const coralMat = new MeshStandardMaterial({
    color: 0xd84315, // Polished red-orange coral beads
    roughness: 0.4,
    metalness: 0.1,
  });

  const filaMat = new MeshStandardMaterial({
    color: 0x880e4f,
    roughness: 0.85,
  });

  // Base seated height adjustment (sitting at y = 0.45m on the stool)
  const seatY = 0.45;

  // 1. Lower Robes / Seated Legs
  const lowerRobeGeo = new CylinderGeometry(0.38, 0.45, 0.55, 14);
  const lowerRobe = new Mesh(lowerRobeGeo, agbadaMat);
  lowerRobe.position.set(0, seatY + 0.22, 0.05);
  root.add(lowerRobe);

  // 2. Torso & Flowing Agbada Robe
  const torsoGeo = new CylinderGeometry(0.36, 0.34, 0.65, 12);
  const torso = new Mesh(torsoGeo, agbadaMat);
  torso.position.set(0, seatY + 0.68, 0);
  torso.scale.set(1.15, 1, 0.85); // Wider shoulders
  root.add(torso);

  // Broad draped Agbada shoulder folds
  const shoulderFoldsGeo = new BoxGeometry(0.85, 0.4, 0.45);
  const shoulderFolds = new Mesh(shoulderFoldsGeo, agbadaMat);
  shoulderFolds.position.set(0, seatY + 0.75, 0);
  root.add(shoulderFolds);

  // Gold Embroidered Neckline
  const neckEmbroideryGeo = new TorusGeometry(0.16, 0.03, 8, 16);
  const neckEmbroidery = new Mesh(neckEmbroideryGeo, goldAccentMat);
  neckEmbroidery.position.set(0, seatY + 0.88, 0.08);
  neckEmbroidery.rotation.x = Math.PI / 3;
  root.add(neckEmbroidery);

  // Coral Beads (Ìlẹ̀kẹ̀)
  const beadsGeo = new TorusGeometry(0.19, 0.02, 8, 20);
  const beads = new Mesh(beadsGeo, coralMat);
  beads.position.set(0, seatY + 0.83, 0.11);
  beads.rotation.x = Math.PI / 3.2;
  root.add(beads);

  // 3. Neck & Head
  const neckGeo = new CylinderGeometry(0.09, 0.1, 0.14, 10);
  const neck = new Mesh(neckGeo, skinMat);
  neck.position.set(0, seatY + 0.94, 0);
  root.add(neck);

  const headGeo = new SphereGeometry(0.14, 16, 14);
  const head = new Mesh(headGeo, skinMat);
  head.position.set(0, seatY + 1.08, 0);
  head.scale.set(0.95, 1.1, 1);
  root.add(head);

  // 4. Traditional Fila (Cap)
  const filaGeo = new CylinderGeometry(0.145, 0.14, 0.16, 16);
  const fila = new Mesh(filaGeo, filaMat);
  fila.position.set(0.02, seatY + 1.18, -0.01);
  fila.rotation.z = -0.15; // Dignified elder slant to the side
  root.add(fila);

  // 5. Forearms and Hands resting on knees
  const armGeo = new CylinderGeometry(0.055, 0.05, 0.35, 8);
  const handGeo = new SphereGeometry(0.06, 10, 8);

  // Left Arm & Hand
  const leftArm = new Mesh(armGeo, agbadaMat);
  leftArm.position.set(-0.28, seatY + 0.58, 0.22);
  leftArm.rotation.set(Math.PI / 3, 0, -0.2);
  root.add(leftArm);

  const leftHand = new Mesh(handGeo, skinMat);
  leftHand.position.set(-0.22, seatY + 0.44, 0.36);
  root.add(leftHand);

  // Right Arm & Hand
  const rightArm = new Mesh(armGeo, agbadaMat);
  rightArm.position.set(0.28, seatY + 0.58, 0.22);
  rightArm.rotation.set(Math.PI / 3, 0, 0.2);
  root.add(rightArm);

  const rightHand = new Mesh(handGeo, skinMat);
  rightHand.position.set(0.22, seatY + 0.44, 0.36);
  root.add(rightHand);

  return root;
}
