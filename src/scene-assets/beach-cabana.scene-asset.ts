/**
 * Advenquo — Tarkwa Bay Beach Thatched Cabana procedural 3D asset.
 *
 * Coastal bamboo shelter:
 * - 4 Natural bamboo corner posts
 * - Thatched dried raffia / palm leaf hip roof
 * - Wooden beach table and relaxation benches
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

export function buildBeachCabana(): Object3D {
  const root = new Object3D();
  root.name = 'BeachCabana';

  // Materials
  const bambooMat = new MeshStandardMaterial({
    color: 0xcd853f, // Peru golden-brown bamboo timber
    roughness: 0.75,
  });

  const thatchMat = new MeshStandardMaterial({
    color: 0x8b7355, // Dried golden palm thatch
    roughness: 0.95,
  });

  const benchMat = new MeshStandardMaterial({
    color: 0xdeb887,
    roughness: 0.8,
  });

  // 1. Four Bamboo Posts (3.0m x 2.6m footprint, 2.4m height)
  const postGeo = new CylinderGeometry(0.08, 0.09, 2.4, 8);
  const postPositions: Array<[number, number]> = [
    [-1.5, -1.3],
    [1.5, -1.3],
    [-1.5, 1.3],
    [1.5, 1.3],
  ];

  for (const [px, pz] of postPositions) {
    const post = new Mesh(postGeo, bambooMat);
    post.position.set(px, 1.2, pz);
    root.add(post);
  }

  // 2. Horizontal Support Beams
  const beamLongGeo = new BoxGeometry(3.3, 0.1, 0.1);
  const beamShortGeo = new BoxGeometry(0.1, 0.1, 2.8);

  const beamNorth = new Mesh(beamLongGeo, bambooMat);
  beamNorth.position.set(0, 2.35, -1.3);
  root.add(beamNorth);

  const beamSouth = new Mesh(beamLongGeo, bambooMat);
  beamSouth.position.set(0, 2.35, 1.3);
  root.add(beamSouth);

  const beamWest = new Mesh(beamShortGeo, bambooMat);
  beamWest.position.set(-1.5, 2.35, 0);
  root.add(beamWest);

  const beamEast = new Mesh(beamShortGeo, bambooMat);
  beamEast.position.set(1.5, 2.35, 0);
  root.add(beamEast);

  // 3. Thatched Hip Roof (Pyramidal tiered thatch)
  const roofTier1Geo = new BoxGeometry(3.8, 0.25, 3.2);
  const roofTier1 = new Mesh(roofTier1Geo, thatchMat);
  roofTier1.position.set(0, 2.55, 0);
  root.add(roofTier1);

  const roofTier2Geo = new BoxGeometry(2.8, 0.35, 2.2);
  const roofTier2 = new Mesh(roofTier2Geo, thatchMat);
  roofTier2.position.set(0, 2.8, 0);
  root.add(roofTier2);

  const roofCapGeo = new BoxGeometry(1.4, 0.3, 1.1);
  const roofCap = new Mesh(roofCapGeo, thatchMat);
  roofCap.position.set(0, 3.05, 0);
  root.add(roofCap);

  // 4. Center Low Beach Table & Bench
  const tableGeo = new BoxGeometry(1.2, 0.45, 0.8);
  const table = new Mesh(tableGeo, benchMat);
  table.position.set(0, 0.22, 0);
  root.add(table);

  return root;
}
