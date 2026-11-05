/**
 * Advenquo — Atlantic Giant Tun Marine Shell procedural 3D asset.
 *
 * Spiral sea shell discovered on Tarkwa Bay shoreline:
 * - Spiraling stepped cone shell geometry
 * - Pearlescent off-white and pale amber ridges
 * - Historical reminder of cowries as ancient regional currency
 *
 * Deterministic and side-effect free: parentless Object3D, no DOM, no timers.
 */

import {
  ConeGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  SphereGeometry,
} from '@iwsdk/core';

export function buildSeaShell(): Object3D {
  const root = new Object3D();
  root.name = 'SeaShell';

  // Materials
  const shellMat = new MeshStandardMaterial({
    color: 0xfff8e1, // Pearlescent shell white
    roughness: 0.35,
  });

  const lipMat = new MeshStandardMaterial({
    color: 0xffe0b2, // Amber shell aperture lip
    roughness: 0.25,
  });

  // 1. Main Shell Body
  const bodyGeo = new SphereGeometry(0.12, 16, 16);
  const body = new Mesh(bodyGeo, shellMat);
  body.scale.set(1.2, 0.9, 0.9);
  body.position.set(0, 0.1, 0);
  root.add(body);

  // 2. Spiral Spire Tip
  const spireGeo = new ConeGeometry(0.09, 0.18, 12);
  const spire = new Mesh(spireGeo, shellMat);
  spire.rotation.z = Math.PI / 4;
  spire.position.set(-0.1, 0.14, 0);
  root.add(spire);

  // 3. Aperture Opening Lip
  const lipGeo = new SphereGeometry(0.08, 12, 12);
  const lip = new Mesh(lipGeo, lipMat);
  lip.scale.set(0.6, 1.2, 0.4);
  lip.position.set(0.08, 0.08, 0.06);
  root.add(lip);

  return root;
}
