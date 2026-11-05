/**
 * Advenquo — Chilled Coconut with Drinking Palm Straw procedural 3D asset.
 *
 * Fresh natural coconut beverage at Tarkwa Bay:
 * - Husked green-and-golden coconut sphere with flat opening cut
 * - Natural palm drinking straw angled outward
 * - Natural refreshing hydration symbol ("Àgbọn Tútù")
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

export function buildFreshCoconut(): Object3D {
  const root = new Object3D();
  root.name = 'FreshCoconut';

  // Materials
  const coconutHuskMat = new MeshStandardMaterial({
    color: 0x689f38, // Fresh green-golden palm coconut
    roughness: 0.7,
  });

  const coconutMeatMat = new MeshStandardMaterial({
    color: 0xffffff, // White coconut meat ring
    roughness: 0.3,
  });

  const coconutWaterMat = new MeshStandardMaterial({
    color: 0xe0f7fa, // Crystal clear coconut water
    roughness: 0.1,
  });

  const strawMat = new MeshStandardMaterial({
    color: 0xffeb3b, // Golden straw
    roughness: 0.4,
  });

  // 1. Coconut Sphere
  const sphereGeo = new SphereGeometry(0.14, 16, 16);
  const sphere = new Mesh(sphereGeo, coconutHuskMat);
  sphere.scale.set(1.0, 1.15, 1.0);
  sphere.position.set(0, 0.12, 0);
  root.add(sphere);

  // 2. Cut Opening Rim & Inner Meat
  const rimGeo = new CylinderGeometry(0.065, 0.065, 0.02, 16);
  const rim = new Mesh(rimGeo, coconutMeatMat);
  rim.position.set(0, 0.26, 0);
  root.add(rim);

  const waterGeo = new CylinderGeometry(0.055, 0.055, 0.01, 16);
  const water = new Mesh(waterGeo, coconutWaterMat);
  water.position.set(0, 0.255, 0);
  root.add(water);

  // 3. Bamboo / Palm Drinking Straw
  const strawGeo = new CylinderGeometry(0.006, 0.006, 0.28, 8);
  const straw = new Mesh(strawGeo, strawMat);
  straw.rotation.z = -0.35;
  straw.position.set(0.06, 0.32, 0);
  root.add(straw);

  return root;
}
