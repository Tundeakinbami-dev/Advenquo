/**
 * Advenquo — Kunle Badmus (Lead Site Contractor) procedural 3D NPC.
 *
 * 44-year-old seasoned Lagos building contractor:
 * - Sturdy build with dark work-hardened skin tone
 * - Fluorescent orange high-vis construction vest with reflective silver bands
 * - White LASPPPA safety hard hat
 * - Heavy-duty khaki work jeans and steel-toed work boots
 * - Holds site clipboard with supplier delivery slips and material manifests
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

export function buildNpcKunleContractor(): Object3D {
  const root = new Object3D();
  root.name = 'NpcKunleContractor';

  // Realistic PBR Materials
  const skinMat = pbrMaterialSystem.getMaterial('human_skin_dark');

  const hardHatMat = new MeshStandardMaterial({
    color: 0xffffff, // White safety helmet
    roughness: 0.3,
  });

  const vestOrangeMat = new MeshStandardMaterial({
    color: 0xff6d00, // Safety orange
    roughness: 0.6,
  });

  const reflectiveMat = new MeshStandardMaterial({
    color: 0xe0e0e0,
    metalness: 0.5,
    roughness: 0.2,
  });

  const workJeansMat = new MeshStandardMaterial({
    color: 0x37474f, // Heavy dark denim
    roughness: 0.85,
  });

  const bootMat = pbrMaterialSystem.getMaterial('african_iroko', {
    color: 0x4e342e, // Heavy work boots
    roughness: 0.65,
  });

  const clipboardMat = new MeshStandardMaterial({
    color: 0x212121,
    roughness: 0.5,
  });

  // 1. Heavy Work Boots
  const bootGeo = new BoxGeometry(0.14, 0.1, 0.28);
  const leftBoot = new Mesh(bootGeo, bootMat);
  leftBoot.position.set(-0.15, 0.05, 0.02);
  leftBoot.castShadow = true;
  root.add(leftBoot);

  const rightBoot = new Mesh(bootGeo, bootMat);
  rightBoot.position.set(0.15, 0.05, 0.02);
  rightBoot.castShadow = true;
  root.add(rightBoot);

  // 2. Legs / Work Jeans
  const legGeo = new CylinderGeometry(0.09, 0.08, 0.8);
  const leftLeg = new Mesh(legGeo, workJeansMat);
  leftLeg.position.set(-0.15, 0.45, 0);
  leftLeg.castShadow = true;
  root.add(leftLeg);

  const rightLeg = new Mesh(legGeo, workJeansMat);
  rightLeg.position.set(0.15, 0.45, 0);
  rightLeg.castShadow = true;
  root.add(rightLeg);

  // 3. Torso (Orange Safety Vest)
  const torso = new Mesh(new BoxGeometry(0.44, 0.58, 0.28), vestOrangeMat);
  torso.position.set(0, 1.12, 0);
  torso.castShadow = true;
  root.add(torso);

  // Reflective Silver Vest Bands
  const bandGeoH = new BoxGeometry(0.45, 0.05, 0.29);
  const band1 = new Mesh(bandGeoH, reflectiveMat);
  band1.position.set(0, 1.02, 0);
  root.add(band1);

  const band2 = new Mesh(bandGeoH, reflectiveMat);
  band2.position.set(0, 1.22, 0);
  root.add(band2);

  // 4. Arms
  const armR = new Mesh(new CylinderGeometry(0.055, 0.05, 0.58), skinMat);
  armR.position.set(0.28, 1.08, 0);
  armR.castShadow = true;
  root.add(armR);

  const handR = new Mesh(new SphereGeometry(0.055, 8, 8), skinMat);
  handR.position.set(0.28, 0.74, 0);
  handR.castShadow = true;
  root.add(handR);

  const armL = new Mesh(new CylinderGeometry(0.055, 0.05, 0.58), skinMat);
  armL.position.set(-0.28, 1.1, 0.08);
  armL.rotation.x = -0.5;
  armL.castShadow = true;
  root.add(armL);

  const handL = new Mesh(new SphereGeometry(0.055, 8, 8), skinMat);
  handL.position.set(-0.28, 0.88, 0.25);
  handL.castShadow = true;
  root.add(handL);

  // Contractor Clipboard
  const clipboard = new Mesh(new BoxGeometry(0.24, 0.32, 0.02), clipboardMat);
  clipboard.position.set(-0.24, 0.96, 0.22);
  clipboard.rotation.x = -0.4;
  clipboard.castShadow = true;
  root.add(clipboard);

  // 5. Head & Safety Hard Hat
  const neck = new Mesh(new CylinderGeometry(0.06, 0.07, 0.12), skinMat);
  neck.position.set(0, 1.45, 0);
  root.add(neck);

  const head = new Mesh(new SphereGeometry(0.14, 16, 16), skinMat);
  head.position.set(0, 1.6, 0);
  head.castShadow = true;
  root.add(head);

  // Hard Hat Dome & Brim
  const hatDome = new Mesh(new SphereGeometry(0.155, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), hardHatMat);
  hatDome.position.set(0, 1.65, 0);
  hatDome.castShadow = true;
  root.add(hatDome);

  const hatBrim = new Mesh(new CylinderGeometry(0.19, 0.19, 0.03, 16), hardHatMat);
  hatBrim.position.set(0, 1.64, 0.02);
  hatBrim.castShadow = true;
  root.add(hatBrim);

  return root;
}
