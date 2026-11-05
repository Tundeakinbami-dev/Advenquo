/**
 * Advenquo — Moving Urban Pedestrian & Commuter procedural 3D NPC.
 *
 * Living world resident walking through neighbourhoods:
 * - Casual student / commuter outfit (denim jacket, backpack, sneakers)
 * - Walk cycle pivot points for procedural locomotion
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

export function buildMovingPedestrian(): Object3D {
  const root = new Object3D();
  root.name = 'MovingPedestrian';

  // Realistic PBR Materials
  const skinMat = pbrMaterialSystem.getMaterial('human_skin_dark');

  const jacketMat = new MeshStandardMaterial({
    color: 0x1e88e5, // Vibrant denim blue
    roughness: 0.65,
  });

  const pantsMat = new MeshStandardMaterial({
    color: 0x37474f,
    roughness: 0.75,
  });

  const shoeMat = new MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.3,
  });

  const bagMat = new MeshStandardMaterial({
    color: 0xf57c00, // Orange commuter backpack
    roughness: 0.7,
  });

  // 1. Legs with semantic pivots for the deterministic walking cycle
  const shoeGeo = new BoxGeometry(0.1, 0.06, 0.22);
  const legGeo = new CylinderGeometry(0.06, 0.05, 0.75, 8);
  const leftLegPivot = new Object3D();
  leftLegPivot.name = 'WalkLeftLeg';
  leftLegPivot.position.set(-0.12, 0.8, 0);
  root.add(leftLegPivot);
  const leftLeg = new Mesh(legGeo, pantsMat);
  leftLeg.name = 'LeftLegMesh';
  leftLeg.position.y = -0.38;
  leftLeg.castShadow = true;
  leftLegPivot.add(leftLeg);
  const leftShoe = new Mesh(shoeGeo, shoeMat);
  leftShoe.name = 'LeftShoeMesh';
  leftShoe.position.set(0, -0.77, 0.02);
  leftLegPivot.add(leftShoe);

  const rightLegPivot = new Object3D();
  rightLegPivot.name = 'WalkRightLeg';
  rightLegPivot.position.set(0.12, 0.8, 0);
  root.add(rightLegPivot);
  const rightLeg = new Mesh(legGeo, pantsMat);
  rightLeg.name = 'RightLegMesh';
  rightLeg.position.y = -0.38;
  rightLeg.castShadow = true;
  rightLegPivot.add(rightLeg);
  const rightShoe = new Mesh(shoeGeo, shoeMat);
  rightShoe.name = 'RightShoeMesh';
  rightShoe.position.set(0, -0.77, 0.02);
  rightLegPivot.add(rightShoe);

  // 3. Torso & Jacket
  const torsoGeo = new BoxGeometry(0.38, 0.58, 0.22);
  const torso = new Mesh(torsoGeo, jacketMat);
  torso.name = 'Torso';
  torso.position.set(0, 1.08, 0);
  torso.castShadow = true;
  root.add(torso);

  // Backpack on back
  const bagGeo = new BoxGeometry(0.32, 0.42, 0.16);
  const bag = new Mesh(bagGeo, bagMat);
  bag.name = 'Backpack';
  bag.position.set(0, 1.12, -0.16);
  bag.castShadow = true;
  root.add(bag);

  // 4. Arms with shoulder pivots for the counter-swing gait
  const armGeo = new CylinderGeometry(0.05, 0.045, 0.55, 8);
  const leftArmPivot = new Object3D();
  leftArmPivot.name = 'WalkLeftArm';
  leftArmPivot.position.set(-0.24, 1.32, 0);
  root.add(leftArmPivot);
  const leftArm = new Mesh(armGeo, jacketMat);
  leftArm.name = 'LeftArmMesh';
  leftArm.position.y = -0.27;
  leftArm.castShadow = true;
  leftArmPivot.add(leftArm);

  const rightArmPivot = new Object3D();
  rightArmPivot.name = 'WalkRightArm';
  rightArmPivot.position.set(0.24, 1.32, 0);
  root.add(rightArmPivot);
  const rightArm = new Mesh(armGeo, jacketMat);
  rightArm.name = 'RightArmMesh';
  rightArm.position.y = -0.27;
  rightArm.castShadow = true;
  rightArmPivot.add(rightArm);

  // 5. Head
  const headGeo = new SphereGeometry(0.11, 14, 14);
  const head = new Mesh(headGeo, skinMat);
  head.name = 'Head';
  head.position.set(0, 1.54, 0);
  head.castShadow = true;
  root.add(head);

  return root;
}
