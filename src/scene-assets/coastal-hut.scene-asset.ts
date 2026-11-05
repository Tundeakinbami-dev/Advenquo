/**
 * Advenquo — Accessible Coastal Marine Research & Lifeguard Shelter procedural 3D asset.
 *
 * Walkable coastal station interior in Tarkwa Bay:
 * - Weathered wooden deck floor
 * - Bamboo and cedar plank walls with nautical louvers
 * - Marine biology research workbench with sea turtle tag logs & microscope
 * - Solar marine radio transceiver and VHF antenna
 * - Hanging fishing nets, life buoys, and diving flippers
 *
 * Deterministic and side-effect free: parentless Object3D, no DOM, no timers.
 */

import {
  BoxGeometry,
  CylinderGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  TorusGeometry,
} from '@iwsdk/core';

export function buildCoastalHut(): Object3D {
  const root = new Object3D();
  root.name = 'CoastalHut';

  // Materials
  const deckMat = new MeshStandardMaterial({
    color: 0xa1887f, // Weathered marine cedar planks
    roughness: 0.8,
  });

  const wallMat = new MeshStandardMaterial({
    color: 0x8d6e63, // Salt-bleached wood siding
    roughness: 0.85,
  });

  const benchMat = new MeshStandardMaterial({
    color: 0x5d4037,
    roughness: 0.7,
  });

  const orangeBuoyMat = new MeshStandardMaterial({
    color: 0xff3d00, // Coast guard high-vis orange
    roughness: 0.4,
  });

  const radioMat = new MeshStandardMaterial({
    color: 0x263238,
    metalness: 0.7,
    roughness: 0.3,
  });

  // 1. Walkable Deck Floor (4.2m width x 3.6m depth)
  const floorGeo = new BoxGeometry(4.2, 0.05, 3.6);
  const floor = new Mesh(floorGeo, deckMat);
  floor.position.set(0, 0.025, 0);
  root.add(floor);

  // 2. Walls (Back, Left, Right)
  const backWallGeo = new BoxGeometry(4.2, 2.6, 0.1);
  const backWall = new Mesh(backWallGeo, wallMat);
  backWall.position.set(0, 1.3, -1.8);
  root.add(backWall);

  const sideWallGeo = new BoxGeometry(0.1, 2.6, 3.6);
  const leftWall = new Mesh(sideWallGeo, wallMat);
  leftWall.position.set(-2.1, 1.3, 0);
  root.add(leftWall);

  const rightWall = new Mesh(sideWallGeo, wallMat);
  rightWall.position.set(2.1, 1.3, 0);
  root.add(rightWall);

  // 3. Marine Research Desk against Left Wall
  const deskGeo = new BoxGeometry(0.8, 0.75, 1.8);
  const desk = new Mesh(deskGeo, benchMat);
  desk.position.set(-1.6, 0.375, -0.6);
  root.add(desk);

  // Marine VHF Radio Transceiver
  const radioGeo = new BoxGeometry(0.25, 0.15, 0.3);
  const radio = new Mesh(radioGeo, radioMat);
  radio.position.set(-1.6, 0.825, -0.8);
  root.add(radio);

  // VHF Radio Antenna
  const antGeo = new CylinderGeometry(0.01, 0.01, 0.6, 6);
  const ant = new Mesh(antGeo, radioMat);
  ant.position.set(-1.6, 1.2, -0.9);
  root.add(ant);

  // 4. Life Ring Buoy hanging on back wall
  const buoyGeo = new TorusGeometry(0.3, 0.08, 12, 24);
  const buoy = new Mesh(buoyGeo, orangeBuoyMat);
  buoy.position.set(0.6, 1.6, -1.72);
  root.add(buoy);

  // 5. Specimen Bench against Right Wall
  const specimenBenchGeo = new BoxGeometry(0.8, 0.75, 1.6);
  const specimenBench = new Mesh(specimenBenchGeo, benchMat);
  specimenBench.position.set(1.6, 0.375, -0.6);
  root.add(specimenBench);

  return root;
}
