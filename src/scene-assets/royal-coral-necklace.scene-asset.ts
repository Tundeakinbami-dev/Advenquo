/**
 * Advenquo — Imperial Coral Bead Collar (Ìyùn) procedural 3D asset.
 *
 * Sacred red coral regalia worn by the Oba of Lagos and royal family:
 * - Cylindrical polished Mediterranean & Atlantic red coral beads
 * - Multi-strand royal collar arrangement
 * - Cast brass ceremonial clasp
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

export function buildRoyalCoralNecklace(): Object3D {
  const root = new Object3D();
  root.name = 'RoyalCoralNecklace';

  // Materials
  const coralMat = new MeshStandardMaterial({
    color: 0xd32f2f, // Deep lustrous red coral
    roughness: 0.35,
  });

  const goldMat = new MeshStandardMaterial({
    color: 0xffd54f, // Ceremonial brass/gold clasp
    metalness: 0.85,
    roughness: 0.25,
  });

  // 1. Multi-tier concentric coral strands
  const tiers = [
    { radius: 0.16, tube: 0.02 },
    { radius: 0.21, tube: 0.024 },
    { radius: 0.26, tube: 0.028 },
  ];

  for (const t of tiers) {
    const torusGeo = new TorusGeometry(t.radius, t.tube, 12, 32);
    const torus = new Mesh(torusGeo, coralMat);
    torus.rotation.x = Math.PI / 2;
    torus.position.set(0, 0.03, 0);
    root.add(torus);
  }

  // 2. Front Center Brass Clasp
  const claspGeo = new CylinderGeometry(0.04, 0.04, 0.06, 12);
  const clasp = new Mesh(claspGeo, goldMat);
  clasp.position.set(0, 0.03, 0.25);
  root.add(clasp);

  return root;
}
