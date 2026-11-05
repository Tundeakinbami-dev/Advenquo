/**
 * Advenquo — Ọpá Àṣẹ (Oba's Ceremonial Staff of Office) procedural 3D asset.
 *
 * Sacred sceptre of royal authority in Yoruba governance:
 * - Hand-carved African mahogany staff with spiral relief motifs
 * - Cast silver / brass finial tip depicting ancestral bird/crown
 * - Beaded tassels and brass ferrule base
 *
 * Deterministic and side-effect free: parentless Object3D, no DOM, no timers.
 */

import {
  CylinderGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  SphereGeometry,
} from '@iwsdk/core';

export function buildObaStaff(): Object3D {
  const root = new Object3D();
  root.name = 'ObaStaffOfOffice';

  // Materials
  const woodMat = new MeshStandardMaterial({
    color: 0x3e2723, // Polished dark mahogany
    roughness: 0.5,
  });

  const silverMat = new MeshStandardMaterial({
    color: 0xe0e0e0, // Royal sterling silver
    metalness: 0.9,
    roughness: 0.2,
  });

  const goldMat = new MeshStandardMaterial({
    color: 0xffd54f, // Ceremonial brass
    metalness: 0.85,
    roughness: 0.25,
  });

  // 1. Staff Shaft (1.3m height)
  const shaftGeo = new CylinderGeometry(0.018, 0.022, 1.3, 12);
  const shaft = new Mesh(shaftGeo, woodMat);
  shaft.position.set(0, 0.65, 0);
  root.add(shaft);

  // 2. Brass Base Ferrule
  const ferruleGeo = new CylinderGeometry(0.024, 0.02, 0.12, 12);
  const ferrule = new Mesh(ferruleGeo, goldMat);
  ferrule.position.set(0, 0.06, 0);
  root.add(ferrule);

  // 3. Middle Beaded Grips
  const gripGeo = new CylinderGeometry(0.028, 0.028, 0.08, 12);
  const grip = new Mesh(gripGeo, goldMat);
  grip.position.set(0, 0.75, 0);
  root.add(grip);

  // 4. Silver Crown Finial
  const finialBaseGeo = new CylinderGeometry(0.04, 0.025, 0.12, 12);
  const finialBase = new Mesh(finialBaseGeo, silverMat);
  finialBase.position.set(0, 1.36, 0);
  root.add(finialBase);

  const crownSphereGeo = new SphereGeometry(0.05, 12, 12);
  const crownSphere = new Mesh(crownSphereGeo, silverMat);
  crownSphere.position.set(0, 1.45, 0);
  root.add(crownSphere);

  return root;
}
