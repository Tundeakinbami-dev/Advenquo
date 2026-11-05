/**
 * Advenquo — Chief Ẹletu Odibo (Traditional Prime Minister & Royal Kingmaker) procedural 3D NPC.
 *
 * Historic dignitary at Iga Idunganran Royal Palace:
 * - Pristine white ceremonial Yoruba Agbada (signifying purity and sacred chieftaincy)
 * - Beaded royal Fila with sacred feather crest
 * - Multiple rows of genuine red coral beads (Ìlẹ̀kẹ̀ Iyùn)
 * - Carved royal walking staff of state (Ọ̀pá Àṣẹ)
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

export function buildNpcPalaceChief(): Object3D {
  const root = new Object3D();
  root.name = 'NpcPalaceChief';

  // Materials
  const whiteAgbadaMat = new MeshStandardMaterial({
    color: 0xfafafa, // Ceremonial white damask agbada
    roughness: 0.7,
  });

  const goldTrimMat = new MeshStandardMaterial({
    color: 0xffd54f, // Delicate gold thread embroidery
    roughness: 0.35,
    metalness: 0.6,
  });

  const skinMat = new MeshStandardMaterial({
    color: 0x4a2c11, // Rich dark brown skin tone
    roughness: 0.75,
  });

  const coralMat = new MeshStandardMaterial({
    color: 0xd84315, // Royal red coral beads
    roughness: 0.3,
    metalness: 0.1,
  });

  const staffMat = new MeshStandardMaterial({
    color: 0x3e2723, // Seasoned dark iroko staff
    roughness: 0.5,
  });

  const featherMat = new MeshStandardMaterial({
    color: 0xb71c1c, // Sacred red parrot feather crest
    roughness: 0.6,
  });

  // 1. Lower Agbada Robes (Grand flowing robe)
  const lowerRobeGeo = new CylinderGeometry(0.38, 0.52, 1.0, 12);
  const lowerRobe = new Mesh(lowerRobeGeo, whiteAgbadaMat);
  lowerRobe.position.set(0, 0.5, 0);
  root.add(lowerRobe);

  // 2. Wide Ceremonial Agbada Shoulders / Sleeves
  const shouldersGeo = new BoxGeometry(0.85, 0.65, 0.42);
  const shoulders = new Mesh(shouldersGeo, whiteAgbadaMat);
  shoulders.position.set(0, 1.25, 0);
  root.add(shoulders);

  // Gold Embroidery Center Placket
  const placketGeo = new BoxGeometry(0.18, 0.48, 0.02);
  const placket = new Mesh(placketGeo, goldTrimMat);
  placket.position.set(0, 1.25, 0.22);
  root.add(placket);

  // 3. Coral Necklaces (Triple strand royal coral collar)
  const coralRingGeo = new TorusGeometry(0.15, 0.022, 8, 16);
  const coralNecklace = new Mesh(coralRingGeo, coralMat);
  coralNecklace.position.set(0, 1.5, 0.08);
  coralNecklace.rotation.x = Math.PI / 2.8;
  root.add(coralNecklace);

  // 4. Head & Face
  const headGeo = new SphereGeometry(0.14, 12, 12);
  const head = new Mesh(headGeo, skinMat);
  head.position.set(0, 1.62, 0);
  root.add(head);

  // 5. Beaded Chieftaincy Cap (Fila)
  const capGeo = new CylinderGeometry(0.14, 0.15, 0.12, 12);
  const cap = new Mesh(capGeo, whiteAgbadaMat);
  cap.position.set(0, 1.74, 0);
  cap.rotation.z = -0.1; // Dignified elder slant
  root.add(cap);

  // Sacred Feather Pin
  const featherGeo = new CylinderGeometry(0.015, 0.04, 0.22, 6);
  const feather = new Mesh(featherGeo, featherMat);
  feather.position.set(-0.12, 1.84, 0.05);
  feather.rotation.z = 0.35;
  root.add(feather);

  // 6. Royal Staff of Authority (Ọ̀pá Àṣẹ) in right hand
  const staffGeo = new CylinderGeometry(0.025, 0.028, 1.55, 8);
  const staff = new Mesh(staffGeo, staffMat);
  staff.position.set(0.44, 0.78, 0.15);
  root.add(staff);

  const staffHeadGeo = new SphereGeometry(0.065, 8, 8);
  const staffHead = new Mesh(staffHeadGeo, goldTrimMat);
  staffHead.position.set(0.44, 1.58, 0.15);
  root.add(staffHead);

  return root;
}
