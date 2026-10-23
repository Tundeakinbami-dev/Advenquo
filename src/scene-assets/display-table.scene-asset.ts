/**
 * Advenquo — Display Table procedural asset.
 *
 * A low wooden table (in the style of a museum display or market stall surface)
 * where the four Yoruba cultural objects sit. The table is the anchor of the
 * miniature environment.
 *
 * System-free module — no side effects.
 */

import {
  BoxGeometry,
  CylinderGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
} from '@iwsdk/core';

export function buildDisplayTable(): Object3D {
  const root = new Object3D();
  root.name = 'DisplayTable';

  const woodMat = new MeshStandardMaterial({
    color: 0x5d4037,
    roughness: 0.85,
    metalness: 0.0,
  });

  // Table top
  const topGeo = new BoxGeometry(1.1, 0.04, 0.7);
  const top = new Mesh(topGeo, woodMat);
  top.position.y = 0;
  root.add(top);

  // Four legs
  const legGeo = new CylinderGeometry(0.03, 0.03, 0.75, 8);
  const legPositions: [number, number, number][] = [
    [0.5, -0.395, 0.3],
    [-0.5, -0.395, 0.3],
    [0.5, -0.395, -0.3],
    [-0.5, -0.395, -0.3],
  ];
  for (const [x, y, z] of legPositions) {
    const leg = new Mesh(legGeo, woodMat);
    leg.position.set(x, y, z);
    root.add(leg);
  }

  // Cloth runner across the top (decorative strip with Adire-inspired colour)
  const runnerGeo = new BoxGeometry(0.95, 0.005, 0.22);
  const runnerMat = new MeshStandardMaterial({
    color: 0x1a237e,
    roughness: 0.9,
  });
  const runner = new Mesh(runnerGeo, runnerMat);
  runner.position.y = 0.023;
  root.add(runner);

  return root;
}
