/**
 * Advenquo — Tarkwa Bay Coastal Beach Ground & Ocean Shoreline procedural 3D asset.
 *
 * Coastal beach environment:
 * - Golden beach sand shore (18m x 16m)
 * - Gentle ocean surf water plane with turquoise tropical coloring
 * - Natural sea-shell and pebble clusters
 * - Coastal breakwater rock revetment border
 *
 * Deterministic and side-effect free: parentless Object3D, no DOM, no timers.
 */

import {
  BoxGeometry,
  CylinderGeometry,
  DodecahedronGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
} from '@iwsdk/core';

export function buildCoastalGround(): Object3D {
  const root = new Object3D();
  root.name = 'CoastalGround';

  // Materials
  const goldenSandMat = new MeshStandardMaterial({
    color: 0xdeb887, // Burlywood golden warm sand
    roughness: 0.95,
  });

  const wetSandMat = new MeshStandardMaterial({
    color: 0xc29b68, // Wet shoreline sand
    roughness: 0.5,
  });

  const turquoiseOceanMat = new MeshStandardMaterial({
    color: 0x008080, // Rich turquoise Atlantic coastal water
    roughness: 0.15,
    metalness: 0.3,
  });

  const foamMat = new MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.8,
  });

  const graniteRockMat = new MeshStandardMaterial({
    color: 0x4a4a4a, // Dark Atlantic breakwater stone
    roughness: 0.85,
  });

  // 1. Dry Golden Beach Sand Area (18m × 10m, z: -1 to +7)
  const drySandGeo = new BoxGeometry(18, 0.25, 10);
  const drySandMesh = new Mesh(drySandGeo, goldenSandMat);
  drySandMesh.position.set(0, -0.125, 2.5);
  root.add(drySandMesh);

  // 2. Wet Shoreline Transition (18m × 2.5m, z: -3.5 to -1)
  const wetSandGeo = new BoxGeometry(18, 0.24, 2.5);
  const wetSandMesh = new Mesh(wetSandGeo, wetSandMat);
  wetSandMesh.position.set(0, -0.13, -2.25);
  root.add(wetSandMesh);

  // 3. Turquoise Ocean Water Plane (18m × 6m, z: -6.5 to -3.5)
  const oceanGeo = new BoxGeometry(18, 0.2, 5.5);
  const oceanMesh = new Mesh(oceanGeo, turquoiseOceanMat);
  oceanMesh.position.set(0, -0.11, -5.75);
  root.add(oceanMesh);

  // Surf Foam Line along shoreline
  const foamGeo = new BoxGeometry(18, 0.04, 0.4);
  const foamMesh = new Mesh(foamGeo, foamMat);
  foamMesh.position.set(0, -0.01, -3.45);
  root.add(foamMesh);

  // 4. Breakwater Rock Boulders on the eastern and western headlands
  const rockGeoA = new DodecahedronGeometry(0.75, 1);
  const rockGeoB = new DodecahedronGeometry(0.55, 1);

  const rockPositions: Array<[number, number, number, number]> = [
    [-7.8, 0.4, -4.5, 1.2],
    [-7.2, 0.35, -3.2, 0.9],
    [-6.8, 0.3, -5.2, 1.1],
    [7.8, 0.4, -4.5, 1.2],
    [7.3, 0.35, -3.2, 0.9],
    [6.9, 0.3, -5.2, 1.0],
  ];

  for (const [rx, ry, rz, s] of rockPositions) {
    const rock = new Mesh(s > 1.0 ? rockGeoA : rockGeoB, graniteRockMat);
    rock.position.set(rx, ry, rz);
    rock.scale.set(s, s * 0.8, s);
    root.add(rock);
  }

  return root;
}
