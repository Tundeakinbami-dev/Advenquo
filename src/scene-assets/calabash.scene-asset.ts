/**
 * Advenquo — Calabash Bowl procedural asset.
 *
 * A calabash is a dried gourd used throughout West Africa as a bowl, container,
 * musical instrument, and ritual vessel. Rendered as a lathe-spun half-sphere
 * with a decorative carved rim.
 *
 * System-free module — no side effects.
 */

import {
  LatheGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Vector2,
} from '@iwsdk/core';

export function buildCalabash(): Object3D {
  const root = new Object3D();
  root.name = 'Calabash';

  // --- Bowl outer shell (lathe from bottom rim to top rim) ---
  const outerPoints: Vector2[] = [];
  const segments = 24;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    // Half-sphere profile slightly flattened
    const angle = t * Math.PI * 0.9; // 0 to ~162°
    const r = 0.12 * Math.sin(angle);
    const y = -0.08 + 0.1 * (1 - Math.cos(angle));
    outerPoints.push(new Vector2(r, y));
  }

  const outerGeo = new LatheGeometry(outerPoints, 28);
  const outerMat = new MeshStandardMaterial({
    color: 0xd4a853,
    roughness: 0.75,
    metalness: 0.0,
  });
  const outer = new Mesh(outerGeo, outerMat);
  outer.castShadow = false;
  root.add(outer);

  // --- Interior (slightly smaller, darker) ---
  const innerPoints: Vector2[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = t * Math.PI * 0.85;
    const r = 0.105 * Math.sin(angle);
    const y = -0.07 + 0.09 * (1 - Math.cos(angle));
    innerPoints.push(new Vector2(r, y));
  }

  const innerGeo = new LatheGeometry(innerPoints, 28);
  const innerMat = new MeshStandardMaterial({
    color: 0xa07840,
    roughness: 0.85,
    side: 1, // BackSide
  });
  const inner = new Mesh(innerGeo, innerMat);
  root.add(inner);

  // --- Decorative carved rim ring ---
  const rimPoints: Vector2[] = [
    new Vector2(0.115, 0.02),
    new Vector2(0.12, 0.025),
    new Vector2(0.118, 0.03),
    new Vector2(0.11, 0.03),
  ];
  const rimGeo = new LatheGeometry(rimPoints, 28);
  const rimMat = new MeshStandardMaterial({
    color: 0x5d4037,
    roughness: 0.9,
  });
  const rim = new Mesh(rimGeo, rimMat);
  root.add(rim);

  return root;
}
