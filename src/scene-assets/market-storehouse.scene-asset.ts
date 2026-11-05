/**
 * Advenquo — Accessible Artisan Dye Storehouse procedural 3D asset.
 *
 * Walkable workshop interior in Ìsàlẹ̀ Èkó Artisan Market:
 * - Earth and timber plank floor
 * - Mud-brick and seasoned timber workshop walls
 * - Indigo fermentation clay vats
 * - Bamboo fabric drying frames with folded Adire textiles
 * - Wooden carving tool chests and calabash dye bowls
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

export function buildMarketStorehouse(): Object3D {
  const root = new Object3D();
  root.name = 'MarketStorehouse';

  // Materials
  const floorMat = new MeshStandardMaterial({
    color: 0x5d4037, // Packed earth and clay workshop floor
    roughness: 0.9,
  });

  const wallMat = new MeshStandardMaterial({
    color: 0x795548, // Traditional sun-dried adobe mud-brick
    roughness: 0.85,
  });

  const clayVatMat = new MeshStandardMaterial({
    color: 0x3e2723, // Deep terracotta clay
    roughness: 0.8,
  });

  const indigoLiquidMat = new MeshStandardMaterial({
    color: 0x1a237e, // Dark rich fermented indigo liquid
    roughness: 0.2,
  });

  const clothBlueMat = new MeshStandardMaterial({
    color: 0x283593, // Indigo dyed cotton cloth
    roughness: 0.7,
  });

  const bambooMat = new MeshStandardMaterial({
    color: 0xcd853f,
    roughness: 0.75,
  });

  // 1. Walkable Room Floor (4.2m width x 3.8m depth)
  const floorGeo = new BoxGeometry(4.2, 0.05, 3.8);
  const floor = new Mesh(floorGeo, floorMat);
  floor.position.set(0, 0.025, 0);
  root.add(floor);

  // 2. Walls (Back, Left, Right)
  const backWallGeo = new BoxGeometry(4.2, 2.6, 0.1);
  const backWall = new Mesh(backWallGeo, wallMat);
  backWall.position.set(0, 1.3, -1.9);
  root.add(backWall);

  const sideWallGeo = new BoxGeometry(0.1, 2.6, 3.8);
  const leftWall = new Mesh(sideWallGeo, wallMat);
  leftWall.position.set(-2.1, 1.3, 0);
  root.add(leftWall);

  const rightWall = new Mesh(sideWallGeo, wallMat);
  rightWall.position.set(2.1, 1.3, 0);
  root.add(rightWall);

  // 3. Fermentation Indigo Clay Vats (Deep Round Pots)
  const vatOuterGeo = new CylinderGeometry(0.4, 0.35, 0.65, 12);
  const vatLiquidGeo = new CylinderGeometry(0.36, 0.36, 0.05, 12);

  const vatPositions = [
    [-1.4, -1.2],
    [-1.4, -0.3],
    [-1.4, 0.6],
  ];

  for (const [vx, vz] of vatPositions) {
    const vat = new Mesh(vatOuterGeo, clayVatMat);
    vat.position.set(vx, 0.325, vz);
    root.add(vat);

    const liquid = new Mesh(vatLiquidGeo, indigoLiquidMat);
    liquid.position.set(vx, 0.6, vz);
    root.add(liquid);
  }

  // 4. Bamboo Fabric Drying Frame (Right Side)
  const framePostGeo = new CylinderGeometry(0.04, 0.04, 2.0, 8);
  const post1 = new Mesh(framePostGeo, bambooMat);
  post1.position.set(1.4, 1.0, -1.0);
  root.add(post1);

  const post2 = new Mesh(framePostGeo, bambooMat);
  post2.position.set(1.4, 1.0, 1.0);
  root.add(post2);

  // Horizontal bar
  const barGeo = new CylinderGeometry(0.03, 0.03, 2.1, 8);
  const bar = new Mesh(barGeo, bambooMat);
  bar.rotation.x = Math.PI / 2;
  bar.position.set(1.4, 1.8, 0);
  root.add(bar);

  // Draped indigo cloth over the drying bar
  const clothDrapeGeo = new BoxGeometry(0.02, 1.2, 1.6);
  const clothDrape = new Mesh(clothDrapeGeo, clothBlueMat);
  clothDrape.position.set(1.4, 1.2, 0);
  root.add(clothDrape);

  // 5. Artisan Storage Chest on Back Wall
  const chestGeo = new BoxGeometry(1.2, 0.5, 0.6);
  const chestMat = new MeshStandardMaterial({ color: 0x4e342e });
  const chest = new Mesh(chestGeo, chestMat);
  chest.position.set(0.2, 0.25, -1.5);
  root.add(chest);

  return root;
}
