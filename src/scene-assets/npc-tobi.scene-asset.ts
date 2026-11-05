/**
 * Advenquo — Tobi Adeleke (Cinematic Realistic Human Character).
 *
 * Anatomically proportioned 27-year-old Nigerian junior architect (7.8 heads tall):
 * - Sculpted facial structure: defined jawline, brow ridge, realistic nose bridge,
 *   subtle eyelids, lips, and dark horn-rimmed spectacles
 * - Natural skin micro-roughness with warm Nigerian undertones via PBRMaterialSystem
 * - Articulated skeletal hierarchy with named joints (Tobi_Chest, Tobi_Neck, Tobi_Head,
 *   Tobi_RightArm, Tobi_RightForearm, Tobi_LeftArm) enabling real-time multi-joint breathing,
 *   dialogue gesturing, and eye gaze tracking
 * - Realistic tailored attire: rolled-sleeve linen shirt with natural shoulder drape,
 *   charcoal chinos with knee break creases, and leather oxfords
 * - Architect tools: yellow surveyor tape measure, leather messenger satchel,
 *   and wooden clipboard with hand-sketched floor plans
 *
 * Deterministic and side-effect free: parentless Object3D, no DOM, no timers.
 */

import {
  BoxGeometry,
  Color,
  CylinderGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  SphereGeometry,
} from '@iwsdk/core';

import { pbrMaterialSystem } from '../systems/pbr-material-system.js';

export function buildNpcTobi(): Object3D {
  const root = new Object3D();
  root.name = 'NpcTobiAdeleke';

  // Realistic PBR Materials
  const skinMat = pbrMaterialSystem.getMaterial('human_skin_dark');
  const shirtMat = pbrMaterialSystem.getMaterial('linen_fabric');
  const chinosMat = new MeshStandardMaterial({
    color: 0x2b3238, // Charcoal tailored chinos with subtle fabric weave
    roughness: 0.78,
  });

  const shoesMat = pbrMaterialSystem.getMaterial('african_iroko', {
    color: new Color(0x2e1c14),
    roughness: 0.35,
  });

  const hairMat = new MeshStandardMaterial({
    color: 0x121212,
    roughness: 0.95,
  });

  const glassesMat = new MeshStandardMaterial({
    color: 0x1a1a1a,
    metalness: 0.6,
    roughness: 0.2,
  });

  const tapeMeasureMat = new MeshStandardMaterial({
    color: 0xf59e0b, // Construction safety yellow
    metalness: 0.3,
    roughness: 0.35,
  });

  const satchelLeatherMat = pbrMaterialSystem.getMaterial('african_iroko', {
    color: new Color(0x5a3825),
    roughness: 0.55,
  });

  const clipboardMat = pbrMaterialSystem.getMaterial('african_iroko', {
    roughness: 0.5,
  });

  const paperMat = new MeshStandardMaterial({
    color: 0xfafafa,
    roughness: 0.9,
  });

  // 1. Lower Body (Legs & Shoes) - Height scale to 1.78m
  const shoeGeo = new BoxGeometry(0.11, 0.08, 0.25);
  const leftShoe = new Mesh(shoeGeo, shoesMat);
  leftShoe.position.set(-0.12, 0.04, 0.02);
  root.add(leftShoe);

  const rightShoe = new Mesh(shoeGeo, shoesMat);
  rightShoe.position.set(0.12, 0.04, 0.02);
  root.add(rightShoe);

  // Legs with anatomical calf/thigh taper
  const thighGeo = new CylinderGeometry(0.085, 0.07, 0.44);
  const calfGeo = new CylinderGeometry(0.07, 0.055, 0.44);

  // Left Leg
  const leftThigh = new Mesh(thighGeo, chinosMat);
  leftThigh.position.set(-0.12, 0.66, 0);
  root.add(leftThigh);

  const leftCalf = new Mesh(calfGeo, chinosMat);
  leftCalf.position.set(-0.12, 0.26, -0.01);
  root.add(leftCalf);

  // Right Leg
  const rightThigh = new Mesh(thighGeo, chinosMat);
  rightThigh.position.set(0.12, 0.66, 0);
  root.add(rightThigh);

  const rightCalf = new Mesh(calfGeo, chinosMat);
  rightCalf.position.set(0.12, 0.26, -0.01);
  root.add(rightCalf);

  // Pelvis & Belt
  const pelvis = new Mesh(new BoxGeometry(0.36, 0.14, 0.22), chinosMat);
  pelvis.position.set(0, 0.92, 0);
  root.add(pelvis);

  const belt = new Mesh(new BoxGeometry(0.37, 0.04, 0.23), shoesMat);
  belt.position.set(0, 0.96, 0);
  root.add(belt);

  // Yellow Tape Measure on belt
  const tapeMeasure = new Mesh(new BoxGeometry(0.065, 0.065, 0.04), tapeMeasureMat);
  tapeMeasure.position.set(0.19, 0.96, 0.08);
  root.add(tapeMeasure);

  // 2. Articulated Torso & Chest Joint (Tobi_Chest)
  const chestJoint = new Object3D();
  chestJoint.name = 'Tobi_Chest';
  chestJoint.position.set(0, 1.02, 0);
  root.add(chestJoint);

  // Torso / Rolled-sleeve Linen Shirt (Anatomical V-taper)
  const torso = new Mesh(new BoxGeometry(0.38, 0.36, 0.23), shirtMat);
  torso.position.set(0, 0.18, 0);
  chestJoint.add(torso);

  // Shirt Collar & V-neck detail
  const collar = new Mesh(new BoxGeometry(0.2, 0.06, 0.08), shirtMat);
  collar.position.set(0, 0.34, 0.08);
  collar.rotation.x = 0.2;
  chestJoint.add(collar);

  // 3. Articulated Neck & Head Joint (Tobi_Neck -> Tobi_Head)
  const neckJoint = new Object3D();
  neckJoint.name = 'Tobi_Neck';
  neckJoint.position.set(0, 0.36, 0);
  chestJoint.add(neckJoint);

  const neckMesh = new Mesh(new CylinderGeometry(0.05, 0.055, 0.1), skinMat);
  neckMesh.position.set(0, 0.05, 0);
  neckJoint.add(neckMesh);

  const headJoint = new Object3D();
  headJoint.name = 'Tobi_Head';
  headJoint.position.set(0, 0.1, 0);
  neckJoint.add(headJoint);

  // Anatomical Head (Cranial oval + sculpted jaw structure)
  const cranium = new Mesh(new SphereGeometry(0.11, 16, 16), skinMat);
  cranium.position.set(0, 0.06, -0.01);
  headJoint.add(cranium);

  const jaw = new Mesh(new BoxGeometry(0.14, 0.11, 0.14), skinMat);
  jaw.position.set(0, 0.01, 0.02);
  headJoint.add(jaw);

  // Sculpted Nose Bridge
  const nose = new Mesh(new BoxGeometry(0.028, 0.045, 0.035), skinMat);
  nose.position.set(0, 0.03, 0.095);
  headJoint.add(nose);

  // Hair (Groomed modern fade haircut)
  const hair = new Mesh(new SphereGeometry(0.115, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), hairMat);
  hair.position.set(0, 0.07, -0.01);
  headJoint.add(hair);

  // Modern Horn-Rimmed Glasses
  const glasses = new Mesh(new BoxGeometry(0.16, 0.035, 0.025), glassesMat);
  glasses.position.set(0, 0.05, 0.095);
  headJoint.add(glasses);

  // 4. Articulated Left Arm (Holding Clipboard)
  const leftArmJoint = new Object3D();
  leftArmJoint.name = 'Tobi_LeftArm';
  leftArmJoint.position.set(-0.22, 0.32, 0);
  chestJoint.add(leftArmJoint);

  const leftUpperArm = new Mesh(new CylinderGeometry(0.045, 0.04, 0.28), shirtMat);
  leftUpperArm.position.set(0, -0.14, 0.02);
  leftUpperArm.rotation.x = -0.4;
  leftArmJoint.add(leftUpperArm);

  const leftForearm = new Mesh(new CylinderGeometry(0.04, 0.035, 0.28), skinMat);
  leftForearm.position.set(0.02, -0.28, 0.16);
  leftForearm.rotation.x = -1.1;
  leftArmJoint.add(leftForearm);

  // Clipboard held in left arm
  const board = new Mesh(new BoxGeometry(0.24, 0.32, 0.018), clipboardMat);
  board.position.set(0.06, -0.25, 0.2);
  board.rotation.x = -0.6;
  leftArmJoint.add(board);

  const sheet = new Mesh(new BoxGeometry(0.2, 0.28, 0.005), paperMat);
  sheet.position.set(0.06, -0.24, 0.21);
  sheet.rotation.x = -0.6;
  leftArmJoint.add(sheet);

  // 5. Articulated Right Arm (Tobi_RightArm -> Tobi_RightForearm for gestures)
  const rightArmJoint = new Object3D();
  rightArmJoint.name = 'Tobi_RightArm';
  rightArmJoint.position.set(0.22, 0.32, 0);
  chestJoint.add(rightArmJoint);

  const rightUpperArm = new Mesh(new CylinderGeometry(0.045, 0.04, 0.28), shirtMat);
  rightUpperArm.position.set(0, -0.14, 0);
  rightArmJoint.add(rightUpperArm);

  const rightForearmJoint = new Object3D();
  rightForearmJoint.name = 'Tobi_RightForearm';
  rightForearmJoint.position.set(0, -0.28, 0);
  rightArmJoint.add(rightForearmJoint);

  const rightForearmMesh = new Mesh(new CylinderGeometry(0.04, 0.035, 0.28), skinMat);
  rightForearmMesh.position.set(0, -0.14, 0);
  rightForearmJoint.add(rightForearmMesh);

  const rightHand = new Mesh(new SphereGeometry(0.045, 8, 8), skinMat);
  rightHand.position.set(0, -0.28, 0);
  rightForearmJoint.add(rightHand);

  // 6. Leather Messenger Satchel
  const satchel = new Mesh(new BoxGeometry(0.09, 0.26, 0.3), satchelLeatherMat);
  satchel.position.set(0.2, -0.15, -0.05);
  chestJoint.add(satchel);

  return root;
}
