/**
 * Advenquo — Kola Nut procedural asset.
 *
 * The kola nut (Obi) is a culturally significant seed in Yoruba tradition,
 * offered at ceremonies, prayers, and greetings as a symbol of hospitality
 * and respect. Rendered as a small segmented seed on a ceremonial saucer.
 *
 * System-free module — no side effects.
 */

import {
  CylinderGeometry,
  LatheGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  SphereGeometry,
  Vector2,
} from '@iwsdk/core';

export function buildKolaNut(): Object3D {
  const root = new Object3D();
  root.name = 'KolaNut';

  // --- Saucer / ceremonial dish ---
  const saucerPoints: Vector2[] = [
    new Vector2(0, 0),
    new Vector2(0.07, 0),
    new Vector2(0.09, 0.01),
    new Vector2(0.09, 0.025),
    new Vector2(0.07, 0.03),
    new Vector2(0.03, 0.03),
  ];
  const saucerGeo = new LatheGeometry(saucerPoints, 24);
  const saucerMat = new MeshStandardMaterial({
    color: 0xc8a96e,
    roughness: 0.6,
    metalness: 0.1,
  });
  const saucer = new Mesh(saucerGeo, saucerMat);
  saucer.castShadow = false;
  root.add(saucer);

  // --- Kola nut body (4 lobes arranged in a cluster) ---
  const nutMat = new MeshStandardMaterial({
    color: 0x8b4513,
    roughness: 0.8,
  });

  const lobeGeo = new SphereGeometry(0.022, 12, 8);
  const lobeOffsets: [number, number, number][] = [
    [0.018, 0.048, 0.018],
    [-0.018, 0.048, 0.018],
    [0.018, 0.048, -0.018],
    [-0.018, 0.048, -0.018],
  ];

  for (const [x, y, z] of lobeOffsets) {
    const lobe = new Mesh(lobeGeo, nutMat);
    lobe.position.set(x, y, z);
    lobe.scale.y = 1.2;
    root.add(lobe);
  }

  // --- Thin decorative ring on saucer ---
  const ringGeo = new CylinderGeometry(0.06, 0.06, 0.003, 24, 1, true);
  const ringMat = new MeshStandardMaterial({
    color: 0xa07040,
    roughness: 0.7,
  });
  const ring = new Mesh(ringGeo, ringMat);
  ring.position.y = 0.016;
  root.add(ring);

  return root;
}
