/**
 * Advenquo — Tropical Coconut Palm Tree procedural 3D asset.
 *
 * Coastal flora of Tarkwa Bay and coastal Lagos:
 * - Natural segmented, gently curving timber trunk (4.5m tall)
 * - Radiating radial palm fronds with realistic arch
 * - Cluster of ripe coconuts at the crown
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

export function buildCoconutPalm(): Object3D {
  const root = new Object3D();
  root.name = 'CoconutPalm';

  // Materials
  const trunkMat = new MeshStandardMaterial({
    color: 0x6d4c41, // Textured warm brown fibrous bark
    roughness: 0.9,
  });

  const frondMat = new MeshStandardMaterial({
    color: 0x2e7d32, // Lush tropical palm green
    roughness: 0.65,
  });

  const frondYellowMat = new MeshStandardMaterial({
    color: 0x558b2f, // Golden-green mature frond
    roughness: 0.7,
  });

  const coconutMat = new MeshStandardMaterial({
    color: 0x4e342e, // Brown ripe coconut husk
    roughness: 0.85,
  });

  // 1. Curved Trunk (5 Segmented cylinders ascending with slight lean)
  const segments = [
    { height: 0.9, radiusB: 0.28, radiusT: 0.25, x: 0, y: 0.45, z: 0, rotZ: 0.05 },
    { height: 0.9, radiusB: 0.25, radiusT: 0.23, x: 0.06, y: 1.3, z: 0.04, rotZ: 0.08 },
    { height: 0.9, radiusB: 0.23, radiusT: 0.21, x: 0.16, y: 2.15, z: 0.09, rotZ: 0.12 },
    { height: 0.9, radiusB: 0.21, radiusT: 0.19, x: 0.29, y: 2.98, z: 0.15, rotZ: 0.16 },
    { height: 0.9, radiusB: 0.19, radiusT: 0.17, x: 0.46, y: 3.8, z: 0.22, rotZ: 0.2 },
  ];

  for (const s of segments) {
    const geo = new CylinderGeometry(s.radiusT, s.radiusB, s.height, 10);
    const mesh = new Mesh(geo, trunkMat);
    mesh.position.set(s.x, s.y, s.z);
    mesh.rotation.z = s.rotZ;
    root.add(mesh);
  }

  // Crown Position at top of trunk
  const crownX = 0.58;
  const crownY = 4.25;
  const crownZ = 0.28;

  // 2. Crown Fronds (8 radiating arching fronds)
  const frondGeo = new BoxGeometry(0.35, 0.03, 2.2);

  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8;
    const frond = new Mesh(frondGeo, i % 2 === 0 ? frondMat : frondYellowMat);
    frond.position.set(crownX, crownY, crownZ);
    frond.rotation.y = angle;
    frond.rotation.x = 0.35; // Droop downward
    frond.translateZ(0.9); // Extend outward from center
    root.add(frond);
  }

  // 3. Coconut Cluster (4 coconuts nestled under fronds)
  const coconutGeo = new SphereGeometry(0.12, 8, 8);
  const coconutOffsets = [
    [-0.1, -0.15, 0],
    [0.1, -0.15, 0.08],
    [0, -0.18, -0.1],
    [0.08, -0.22, -0.05],
  ];

  for (const [cx, cy, cz] of coconutOffsets) {
    const coconut = new Mesh(coconutGeo, coconutMat);
    coconut.position.set(crownX + cx, crownY + cy, crownZ + cz);
    root.add(coconut);
  }

  return root;
}
