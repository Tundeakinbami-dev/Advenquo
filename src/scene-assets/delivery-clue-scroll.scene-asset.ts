/**
 * Advenquo — Delivery Clue Manifest procedural asset.
 *
 * A dropped carrier guild receipt scroll (Ìwé-ẹ̀rí):
 * - Rolled parchment paper with indigo script marks
 * - Raffia tie string
 * - Soft golden quest indicator ring
 *
 * Deterministic and side-effect free: parentless Object3D, no DOM, no timers.
 */

import {
  CylinderGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  TorusGeometry,
} from '@iwsdk/core';

export function buildDeliveryClueScroll(): Object3D {
  const root = new Object3D();
  root.name = 'DeliveryClueScroll';

  // Materials
  const paperMat = new MeshStandardMaterial({
    color: 0xfff8e1, // Aged cream parchment
    roughness: 0.9,
    metalness: 0.0,
  });

  const ribbonMat = new MeshStandardMaterial({
    color: 0x8d6e63, // Dark twine tie
    roughness: 0.95,
  });

  const glowMat = new MeshStandardMaterial({
    color: 0x80d8ff, // Cyan-blue clue shimmer ring
    emissive: 0x00b0ff,
    emissiveIntensity: 0.5,
    roughness: 0.3,
  });

  // 1. Parchment Cylinder Scroll
  const scrollGeo = new CylinderGeometry(0.025, 0.025, 0.22, 16);
  const scrollMesh = new Mesh(scrollGeo, paperMat);
  scrollMesh.rotation.z = Math.PI / 2;
  scrollMesh.position.set(0, 0.025, 0);
  root.add(scrollMesh);

  // 2. Tie Band
  const tieGeo = new CylinderGeometry(0.027, 0.027, 0.03, 16);
  const tieMesh = new Mesh(tieGeo, ribbonMat);
  tieMesh.rotation.z = Math.PI / 2;
  tieMesh.position.set(0, 0.025, 0);
  root.add(tieMesh);

  // 3. Ground Indicator Ring
  const ringGeo = new TorusGeometry(0.18, 0.008, 8, 24);
  const ringMesh = new Mesh(ringGeo, glowMat);
  ringMesh.rotation.x = Math.PI / 2;
  ringMesh.position.set(0, 0.005, 0);
  root.add(ringMesh);

  return root;
}
