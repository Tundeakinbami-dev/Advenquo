/**
 * Advenquo — Talking Drum (Dundun) procedural asset.
 *
 * The talking drum is an hourglass-shaped Yoruba percussion instrument whose
 * pitch is controlled by squeezing leather cords on its body. Rendered here
 * as a lathe geometry with straps.
 *
 * System-free module — no side effects.
 */

import {
  CylinderGeometry,
  LatheGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Vector2,
} from '@iwsdk/core';

export function buildTalkingDrum(): Object3D {
  const root = new Object3D();
  root.name = 'TalkingDrum';

  // --- Drum body (hourglass lathe) ---
  const points: Vector2[] = [];
  const segments = 16;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments; // 0 → 1 top to bottom
    // Hourglass profile: radius wide at ends, narrow at middle
    const r = 0.06 + 0.055 * Math.pow(Math.abs(t - 0.5) * 2, 1.5);
    const y = (1 - t) * 0.28 - 0.14; // range -0.14 to 0.14
    points.push(new Vector2(r, y));
  }

  const bodyGeo = new LatheGeometry(points, 20);
  const bodyMat = new MeshStandardMaterial({
    color: 0x8d6e63,
    roughness: 0.8,
    metalness: 0.0,
  });
  const body = new Mesh(bodyGeo, bodyMat);
  body.castShadow = false;
  root.add(body);

  // --- Drum heads (flat cylinders top & bottom) ---
  const headGeo = new CylinderGeometry(0.064, 0.064, 0.008, 20);
  const headMat = new MeshStandardMaterial({
    color: 0xd7ccc8,
    roughness: 0.7,
  });

  const topHead = new Mesh(headGeo, headMat);
  topHead.position.y = 0.144;
  root.add(topHead);

  const bottomHead = new Mesh(headGeo, headMat);
  bottomHead.position.y = -0.144;
  root.add(bottomHead);

  // --- Tension straps (thin vertical cylinders around perimeter) ---
  const strapGeo = new CylinderGeometry(0.005, 0.005, 0.32, 4);
  const strapMat = new MeshStandardMaterial({
    color: 0x4e342e,
    roughness: 0.9,
  });

  const strapCount = 8;
  for (let i = 0; i < strapCount; i++) {
    const angle = (i / strapCount) * Math.PI * 2;
    const strap = new Mesh(strapGeo, strapMat);
    strap.position.set(Math.cos(angle) * 0.07, 0, Math.sin(angle) * 0.07);
    root.add(strap);
  }

  return root;
}
