/**
 * Advenquo — Folake Coker (Senior Partner Architect) procedural 3D NPC.
 *
 * 52-year-old renowned Nigerian architect & senior partner at Studio Kán:
 * - Distinguished, poised posture with dark skin tone and elegant braided updo
 * - Tailored navy architectural blazer with gold lapel pin and cream trousers
 * - Vibrant silk Adire-patterned scarf drape
 * - Sleek titanium tablet computer held in hands
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

export function buildNpcFolakeMentor(): Object3D {
  const root = new Object3D();
  root.name = 'NpcFolakeMentor';

  // Realistic PBR Materials
  const skinMat = pbrMaterialSystem.getMaterial('human_skin_dark');

  const blazerNavyMat = pbrMaterialSystem.getMaterial('linen_fabric', {
    color: 0x1a237e, // Deep navy executive blazer
    roughness: 0.65,
  });

  const scarfMat = pbrMaterialSystem.getMaterial('indigo_adire', {
    color: 0xc2185b, // Vibrant magenta silk scarf
    roughness: 0.5,
  });

  const trousersCreamMat = pbrMaterialSystem.getMaterial('linen_fabric', {
    color: 0xe0e0e0, // Crisp tailored cream trousers
    roughness: 0.7,
  });

  const shoeMat = new MeshStandardMaterial({
    color: 0x212121,
    roughness: 0.3,
  });

  const hairMat = new MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.9,
  });

  const tabletMat = new MeshStandardMaterial({
    color: 0x37474f,
    metalness: 0.8,
    roughness: 0.2,
  });

  const goldPinMat = new MeshStandardMaterial({
    color: 0xffd700,
    metalness: 0.9,
    roughness: 0.2,
  });

  // 1. Shoes
  const shoeGeo = new BoxGeometry(0.11, 0.07, 0.24);
  const shoeL = new Mesh(shoeGeo, shoeMat);
  shoeL.position.set(-0.12, 0.035, 0.02);
  shoeL.castShadow = true;
  root.add(shoeL);

  const shoeR = new Mesh(shoeGeo, shoeMat);
  shoeR.position.set(0.12, 0.035, 0.02);
  shoeR.castShadow = true;
  root.add(shoeR);

  // 2. Legs / Tailored Trousers
  const legGeo = new CylinderGeometry(0.075, 0.065, 0.84);
  const legL = new Mesh(legGeo, trousersCreamMat);
  legL.position.set(-0.12, 0.46, 0);
  legL.castShadow = true;
  root.add(legL);

  const legR = new Mesh(legGeo, trousersCreamMat);
  legR.position.set(0.12, 0.46, 0);
  legR.castShadow = true;
  root.add(legR);

  // 3. Torso (Navy Executive Blazer)
  const torso = new Mesh(new BoxGeometry(0.38, 0.56, 0.24), blazerNavyMat);
  torso.position.set(0, 1.14, 0);
  torso.castShadow = true;
  root.add(torso);

  // Silk Scarf Accent
  const scarf = new Mesh(new BoxGeometry(0.14, 0.42, 0.04), scarfMat);
  scarf.position.set(0.08, 1.2, 0.12);
  scarf.castShadow = true;
  root.add(scarf);

  // Gold Lapel Pin
  const pin = new Mesh(new CylinderGeometry(0.02, 0.02, 0.01), goldPinMat);
  pin.position.set(-0.12, 1.3, 0.125);
  pin.rotation.x = Math.PI / 2;
  root.add(pin);

  // 4. Arms & Hands holding tablet
  const armL = new Mesh(new CylinderGeometry(0.045, 0.04, 0.56), blazerNavyMat);
  armL.position.set(-0.23, 1.1, 0.06);
  armL.rotation.x = -0.45;
  armL.castShadow = true;
  root.add(armL);

  const armR = new Mesh(new CylinderGeometry(0.045, 0.04, 0.56), blazerNavyMat);
  armR.position.set(0.23, 1.1, 0.06);
  armR.rotation.x = -0.45;
  armR.castShadow = true;
  root.add(armR);

  // Tablet Computer
  const tablet = new Mesh(new BoxGeometry(0.28, 0.2, 0.015), tabletMat);
  tablet.position.set(0, 0.98, 0.22);
  tablet.rotation.x = -0.35;
  tablet.castShadow = true;
  root.add(tablet);

  // 5. Head & Braided Hair
  const neck = new Mesh(new CylinderGeometry(0.05, 0.055, 0.12), skinMat);
  neck.position.set(0, 1.45, 0);
  root.add(neck);

  const head = new Mesh(new SphereGeometry(0.125, 16, 16), skinMat);
  head.position.set(0, 1.58, 0);
  head.castShadow = true;
  root.add(head);

  // Elegant braided hair crown
  const hair = new Mesh(new SphereGeometry(0.135, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.6), hairMat);
  hair.position.set(0, 1.6, 0);
  hair.castShadow = true;
  root.add(hair);

  const hairBun = new Mesh(new SphereGeometry(0.07, 12, 12), hairMat);
  hairBun.position.set(0, 1.69, -0.06);
  hairBun.castShadow = true;
  root.add(hairBun);

  return root;
}
