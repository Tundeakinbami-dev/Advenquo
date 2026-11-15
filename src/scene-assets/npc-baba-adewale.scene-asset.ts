/**
 * Advenquo — Baba Adéwálé (Elder of the Courtyard) Cinematic Realistic 3D NPC.
 *
 * Represents an esteemed community elder holding audience on the veranda of Iga Idunganran.
 * - Wearing ceremonial Yoruba Agbada robe (deep crimson/terracotta with gold embroidery)
 * - Matching Fila (traditional cap) tilted to the side in the dignified elder style
 * - Coral beads (Ìlẹ̀kẹ̀ Iyun) representing chieftaincy and ancestral lineage
 * - Sculpted elder facial anatomy: cranium, cheekbones, grey-flecked beard and mustache,
 *   arched brow, realistic eyes with sclera/pupils, sculpted nose, and wise, dignified expression
 * - Articulated skeletal hierarchy with named joints:
 *   Baba_Chest, Baba_Neck, Baba_Head, Baba_RightArm, Baba_RightForearm, Baba_LeftArm
 *   enabling real-time breathing, head gaze tracking, and elder dialogue gestures
 *
 * Evaluated in two realms (runtime + editor) — deterministic and side-effect free.
 */

import {
  BoxGeometry,
  Color,
  CylinderGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  SphereGeometry,
  TorusGeometry,
} from '@iwsdk/core';

import { pbrMaterialSystem } from '../systems/pbr-material-system.js';

export function buildNpcBabaAdewale(): Object3D {
  const root = new Object3D();
  root.name = 'NpcBabaAdewale';

  // Realistic PBR Materials
  const agbadaMat = new MeshStandardMaterial({
    color: 0x7b113a, // Deep royal crimson maroon
    roughness: 0.82,
    metalness: 0.06,
  });

  const goldAccentMat = new MeshStandardMaterial({
    color: 0xf5b027, // Gold embroidery on neckline and sleeves
    roughness: 0.38,
    metalness: 0.7,
  });

  const skinMat = pbrMaterialSystem.getMaterial('human_skin_dark');

  const beardMat = new MeshStandardMaterial({
    color: 0xd6d6d6, // Dignified grey-flecked elder beard
    roughness: 0.95,
  });

  const coralMat = new MeshStandardMaterial({
    color: 0xd94420, // Polished royal coral beads
    roughness: 0.32,
    metalness: 0.1,
  });

  const filaMat = new MeshStandardMaterial({
    color: 0x7b113a, // Matching crimson Fila cap
    roughness: 0.78,
  });

  const eyeWhiteMat = new MeshStandardMaterial({
    color: 0xf4f4f4,
    roughness: 0.2,
  });

  const eyeIrisMat = new MeshStandardMaterial({
    color: 0x22120a,
    roughness: 0.1,
  });

  const lipMat = new MeshStandardMaterial({
    color: 0x4a241b,
    roughness: 0.5,
  });

  // Base seated height adjustment (sitting at y = 0.45m on the veranda bench)
  const seatY = 0.45;

  // 1. Lower Robes / Seated Legs
  const lowerRobeGeo = new CylinderGeometry(0.38, 0.46, 0.55, 16);
  const lowerRobe = new Mesh(lowerRobeGeo, agbadaMat);
  lowerRobe.position.set(0, seatY + 0.22, 0.05);
  lowerRobe.castShadow = true;
  root.add(lowerRobe);

  // 2. Articulated Torso & Chest Joint (Baba_Chest)
  const chestJoint = new Object3D();
  chestJoint.name = 'Baba_Chest';
  chestJoint.position.set(0, seatY + 0.55, 0);
  root.add(chestJoint);

  // Torso / Flowing Agbada Robe
  const torsoGeo = new CylinderGeometry(0.36, 0.34, 0.55, 14);
  const torso = new Mesh(torsoGeo, agbadaMat);
  torso.position.set(0, 0.26, 0);
  torso.scale.set(1.18, 1, 0.88);
  torso.castShadow = true;
  chestJoint.add(torso);

  // Broad draped Agbada shoulder folds
  const shoulderFolds = new Mesh(new BoxGeometry(0.88, 0.38, 0.46), agbadaMat);
  shoulderFolds.position.set(0, 0.32, 0);
  shoulderFolds.castShadow = true;
  chestJoint.add(shoulderFolds);

  // Gold Embroidered Neckline
  const neckEmbroidery = new Mesh(new TorusGeometry(0.16, 0.03, 8, 18), goldAccentMat);
  neckEmbroidery.position.set(0, 0.44, 0.08);
  neckEmbroidery.rotation.x = Math.PI / 3;
  chestJoint.add(neckEmbroidery);

  // Coral Beads (Ìlẹ̀kẹ̀ Iyun)
  const beads = new Mesh(new TorusGeometry(0.19, 0.022, 8, 22), coralMat);
  beads.position.set(0, 0.38, 0.11);
  beads.rotation.x = Math.PI / 3.2;
  chestJoint.add(beads);

  // 3. Articulated Neck Joint (Baba_Neck)
  const neckJoint = new Object3D();
  neckJoint.name = 'Baba_Neck';
  neckJoint.position.set(0, 0.48, 0);
  chestJoint.add(neckJoint);

  const neckMesh = new Mesh(new CylinderGeometry(0.085, 0.095, 0.12, 10), skinMat);
  neckMesh.position.set(0, 0.06, 0);
  neckJoint.add(neckMesh);

  // 4. Articulated Head Joint (Baba_Head)
  const headJoint = new Object3D();
  headJoint.name = 'Baba_Head';
  headJoint.position.set(0, 0.12, 0);
  neckJoint.add(headJoint);

  // Cranium
  const cranium = new Mesh(new SphereGeometry(0.13, 16, 16), skinMat);
  cranium.position.set(0, 0.07, -0.01);
  cranium.scale.set(0.95, 1.08, 1);
  cranium.castShadow = true;
  headJoint.add(cranium);

  // Sculpted Jaw and Elder Chin
  const jaw = new Mesh(new BoxGeometry(0.14, 0.11, 0.14), skinMat);
  jaw.position.set(0, 0.01, 0.02);
  headJoint.add(jaw);

  // Dignified Grey-Flecked Beard & Mustache
  const beard = new Mesh(new SphereGeometry(0.075, 10, 8), beardMat);
  beard.position.set(0, -0.035, 0.065);
  beard.scale.set(1.1, 1.4, 0.9);
  headJoint.add(beard);

  const mustache = new Mesh(new BoxGeometry(0.08, 0.025, 0.035), beardMat);
  mustache.position.set(0, 0.015, 0.115);
  headJoint.add(mustache);

  // Brow Ridge
  const brow = new Mesh(new BoxGeometry(0.15, 0.025, 0.04), skinMat);
  brow.position.set(0, 0.085, 0.095);
  headJoint.add(brow);

  // Eyes with Sclera & Pupils
  const eyeScleraGeo = new SphereGeometry(0.018, 8, 8);
  const eyeIrisGeo = new SphereGeometry(0.009, 8, 8);

  // Left Eye
  const leftSclera = new Mesh(eyeScleraGeo, eyeWhiteMat);
  leftSclera.position.set(-0.045, 0.075, 0.105);
  leftSclera.scale.set(1.2, 0.8, 0.7);
  headJoint.add(leftSclera);

  const leftIris = new Mesh(eyeIrisGeo, eyeIrisMat);
  leftIris.position.set(-0.045, 0.075, 0.117);
  headJoint.add(leftIris);

  // Right Eye
  const rightSclera = new Mesh(eyeScleraGeo, eyeWhiteMat);
  rightSclera.position.set(0.045, 0.075, 0.105);
  rightSclera.scale.set(1.2, 0.8, 0.7);
  headJoint.add(rightSclera);

  const rightIris = new Mesh(eyeIrisGeo, eyeIrisMat);
  rightIris.position.set(0.045, 0.075, 0.117);
  headJoint.add(rightIris);

  // Sculpted Nose
  const nose = new Mesh(new BoxGeometry(0.032, 0.048, 0.038), skinMat);
  nose.position.set(0, 0.05, 0.118);
  headJoint.add(nose);

  // Lips
  const lips = new Mesh(new BoxGeometry(0.052, 0.018, 0.02), lipMat);
  lips.position.set(0, 0.008, 0.112);
  headJoint.add(lips);

  // Traditional Fila (Cap tilted in elder style)
  const filaGeo = new CylinderGeometry(0.145, 0.14, 0.16, 16);
  const fila = new Mesh(filaGeo, filaMat);
  fila.position.set(0.02, 0.16, -0.01);
  fila.rotation.z = -0.15;
  fila.castShadow = true;
  headJoint.add(fila);

  // 5. Articulated Left Arm (resting dignified on knee)
  const leftArmJoint = new Object3D();
  leftArmJoint.name = 'Baba_LeftArm';
  leftArmJoint.position.set(-0.3, 0.28, 0.1);
  chestJoint.add(leftArmJoint);

  const armGeo = new CylinderGeometry(0.055, 0.048, 0.35, 8);
  const handGeo = new SphereGeometry(0.055, 8, 8);

  const leftArmMesh = new Mesh(armGeo, agbadaMat);
  leftArmMesh.position.set(0, -0.12, 0.1);
  leftArmMesh.rotation.set(Math.PI / 3, 0, -0.2);
  leftArmJoint.add(leftArmMesh);

  const leftHand = new Mesh(handGeo, skinMat);
  leftHand.position.set(0.04, -0.24, 0.22);
  leftArmJoint.add(leftHand);

  // 6. Articulated Right Arm & Forearm (Baba_RightArm -> Baba_RightForearm for elder gestures)
  const rightArmJoint = new Object3D();
  rightArmJoint.name = 'Baba_RightArm';
  rightArmJoint.position.set(0.3, 0.28, 0.1);
  chestJoint.add(rightArmJoint);

  const rightUpperArm = new Mesh(armGeo, agbadaMat);
  rightUpperArm.position.set(0, -0.1, 0.05);
  rightUpperArm.rotation.set(0.4, 0, 0.2);
  rightArmJoint.add(rightUpperArm);

  const rightForearmJoint = new Object3D();
  rightForearmJoint.name = 'Baba_RightForearm';
  rightForearmJoint.position.set(0, -0.22, 0.1);
  rightArmJoint.add(rightForearmJoint);

  const rightForearmMesh = new Mesh(new CylinderGeometry(0.048, 0.042, 0.28, 8), skinMat);
  rightForearmMesh.position.set(0, -0.1, 0.08);
  rightForearmMesh.rotation.set(0.6, 0, 0);
  rightForearmJoint.add(rightForearmMesh);

  // Coral bangle on right wrist
  const rightBangle = new Mesh(new TorusGeometry(0.05, 0.012, 6, 14), coralMat);
  rightBangle.position.set(0, -0.2, 0.14);
  rightForearmJoint.add(rightBangle);

  const rightHand = new Mesh(handGeo, skinMat);
  rightHand.position.set(0, -0.23, 0.17);
  rightForearmJoint.add(rightHand);

  return root;
}
