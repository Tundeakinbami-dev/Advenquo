/**
 * Advenquo — Iga Idunganran Royal Palace Ground & Flagstone Courtyard procedural 3D asset.
 *
 * Traditional royal palace ground:
 * - Hand-laid polished terracotta and sandstone flagstone courtyard (16m x 14m)
 * - Raised ceremonial stone perimeter curb
 * - Ancestral perimeter braziers with warm bronze detailing
 * - Decorative relief borders
 *
 * Deterministic and side-effect free: parentless Object3D, no DOM, no timers.
 */

import {
  BoxGeometry,
  CylinderGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
} from '@iwsdk/core';

export function buildPalaceGround(): Object3D {
  const root = new Object3D();
  root.name = 'PalaceGround';

  // Materials
  const terracottaMat = new MeshStandardMaterial({
    color: 0xa0522d, // Rich sienna-terracotta flagstones
    roughness: 0.8,
  });

  const stoneBorderMat = new MeshStandardMaterial({
    color: 0x5d4037, // Dark carved sandstone perimeter
    roughness: 0.85,
  });

  const bronzeAccentMat = new MeshStandardMaterial({
    color: 0xb8860b, // Ceremonial brass/bronze trim
    roughness: 0.35,
    metalness: 0.7,
  });

  const brazierMat = new MeshStandardMaterial({
    color: 0x2e1c14,
    roughness: 0.9,
  });

  const flameMat = new MeshStandardMaterial({
    color: 0xff6f00,
    emissive: 0xffab00,
    emissiveIntensity: 0.8,
    roughness: 0.2,
  });

  // 1. Main Terracotta Courtyard Floor (16m × 14m)
  const floorGeo = new BoxGeometry(16, 0.2, 14);
  const floorMesh = new Mesh(floorGeo, terracottaMat);
  floorMesh.position.set(0, -0.1, 0);
  root.add(floorMesh);

  // 2. Sandstone Perimeter Curbs (North, South, East, West)
  const curbNorthGeo = new BoxGeometry(16.4, 0.35, 0.4);
  const curbNorth = new Mesh(curbNorthGeo, stoneBorderMat);
  curbNorth.position.set(0, 0.05, -7.0);
  root.add(curbNorth);

  const curbSouth = new Mesh(curbNorthGeo, stoneBorderMat);
  curbSouth.position.set(0, 0.05, 7.0);
  root.add(curbSouth);

  const curbEastGeo = new BoxGeometry(0.4, 0.35, 14.4);
  const curbEast = new Mesh(curbEastGeo, stoneBorderMat);
  curbEast.position.set(8.0, 0.05, 0);
  root.add(curbEast);

  const curbWest = new Mesh(curbEastGeo, stoneBorderMat);
  curbWest.position.set(-8.0, 0.05, 0);
  root.add(curbWest);

  // 3. Central Ceremonial Pathway (Inlaid bronze border strips)
  const stripGeo = new BoxGeometry(0.08, 0.02, 12);
  const stripLeft = new Mesh(stripGeo, bronzeAccentMat);
  stripLeft.position.set(-1.4, 0.01, 0);
  root.add(stripLeft);

  const stripRight = new Mesh(stripGeo, bronzeAccentMat);
  stripRight.position.set(1.4, 0.01, 0);
  root.add(stripRight);

  // 4. Ancestral Standing Stone Braziers (4 corners of inner court)
  const brazierBaseGeo = new CylinderGeometry(0.35, 0.45, 0.8, 12);
  const brazierBowlGeo = new CylinderGeometry(0.5, 0.25, 0.35, 12);
  const emberGeo = new CylinderGeometry(0.38, 0.1, 0.15, 8);

  const brazierPositions: Array<[number, number]> = [
    [-6.2, -5.2],
    [6.2, -5.2],
    [-6.2, 5.2],
    [6.2, 5.2],
  ];

  for (const [bx, bz] of brazierPositions) {
    const base = new Mesh(brazierBaseGeo, brazierMat);
    base.position.set(bx, 0.4, bz);
    root.add(base);

    const bowl = new Mesh(brazierBowlGeo, bronzeAccentMat);
    bowl.position.set(bx, 0.95, bz);
    root.add(bowl);

    const ember = new Mesh(emberGeo, flameMat);
    ember.position.set(bx, 1.12, bz);
    root.add(ember);
  }

  return root;
}
