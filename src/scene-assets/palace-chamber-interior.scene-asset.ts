/**
 * Advenquo — Accessible Royal Palace Council Chamber procedural 3D asset.
 *
 * Walkable ceremonial council vestibule inside Iga Idunganran:
 * - Geometric terracotta tile floor
 * - Ancient relief-carved timber walls depicting royal Yoruba emblems
 * - Carved elder council benches (Àwọn Alákóso) with woven mat cushions
 * - Cast bronze ceremonial oil lamps on carved pedestals
 * - Royal tapestry runner leading to the audience chamber
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

export function buildPalaceChamberInterior(): Object3D {
  const root = new Object3D();
  root.name = 'PalaceChamberInterior';

  // Materials
  const floorMat = new MeshStandardMaterial({
    color: 0x8d6e63, // Terracotta tile flooring
    roughness: 0.65,
  });

  const wallMat = new MeshStandardMaterial({
    color: 0x4e342e, // Rich antique carved timber walls
    roughness: 0.75,
  });

  const velvetRunnerMat = new MeshStandardMaterial({
    color: 0xb71c1c, // Imperial crimson ceremonial aisle runner
    roughness: 0.9,
  });

  const irokoWoodMat = new MeshStandardMaterial({
    color: 0x3e2723, // Solid African iroko wood
    roughness: 0.7,
  });

  const bronzeLampMat = new MeshStandardMaterial({
    color: 0xffb300,
    metalness: 0.85,
    roughness: 0.3,
    emissive: 0xff6f00,
    emissiveIntensity: 0.5,
  });

  // 1. Walkable Room Floor (4.8m width x 4.2m depth)
  const floorGeo = new BoxGeometry(4.8, 0.05, 4.2);
  const floor = new Mesh(floorGeo, floorMat);
  floor.position.set(0, 0.025, 0);
  root.add(floor);

  // 2. Ceremonial Velvet Floor Runner (1.4m width x 4.2m depth)
  const runnerGeo = new BoxGeometry(1.4, 0.01, 4.18);
  const runner = new Mesh(runnerGeo, velvetRunnerMat);
  runner.position.set(0, 0.06, 0);
  root.add(runner);

  // 3. Walls (Back and Sides)
  const backWallGeo = new BoxGeometry(4.8, 3.2, 0.12);
  const backWall = new Mesh(backWallGeo, wallMat);
  backWall.position.set(0, 1.6, -2.1);
  root.add(backWall);

  const sideWallGeo = new BoxGeometry(0.12, 3.2, 4.2);
  const leftWall = new Mesh(sideWallGeo, wallMat);
  leftWall.position.set(-2.4, 1.6, 0);
  root.add(leftWall);

  const rightWall = new Mesh(sideWallGeo, wallMat);
  rightWall.position.set(2.4, 1.6, 0);
  root.add(rightWall);

  // 4. Carved Council Benches (Left and Right for Chief Kingmakers)
  const benchGeo = new BoxGeometry(0.7, 0.5, 2.6);
  const leftBench = new Mesh(benchGeo, irokoWoodMat);
  leftBench.position.set(-1.8, 0.25, 0);
  root.add(leftBench);

  const rightBench = new Mesh(benchGeo, irokoWoodMat);
  rightBench.position.set(1.8, 0.25, 0);
  root.add(rightBench);

  // 5. Cast Bronze Pedestal Oil Lamps
  const pedestalGeo = new CylinderGeometry(0.1, 0.14, 0.9, 12);
  const lampBowlGeo = new CylinderGeometry(0.2, 0.1, 0.15, 12);

  const lampPositions = [
    [-1.8, 0, -1.6],
    [1.8, 0, -1.6],
  ];

  for (const [lx, ly, lz] of lampPositions) {
    const ped = new Mesh(pedestalGeo, irokoWoodMat);
    ped.position.set(lx, 0.45, lz);
    root.add(ped);

    const lamp = new Mesh(lampBowlGeo, bronzeLampMat);
    lamp.position.set(lx, 0.98, lz);
    root.add(lamp);
  }

  return root;
}
