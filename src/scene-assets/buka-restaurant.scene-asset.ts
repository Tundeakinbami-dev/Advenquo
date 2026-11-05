/**
 * Advenquo — Mama Nkechi's Buka Canteen procedural 3D asset.
 *
 * Traditional Lagos local canteen & social hub:
 * - Shaded corrugated iron canopy with rustic timber support columns
 * - Polished red screed floor (classic Lagos Buka flooring)
 * - Food serving counter with warming stainless steel pots & stew basins
 * - Wooden dining benches and low tables for communal meals
 * - Beverage crate cooler with chilled malt bottles
 * - Handcrafted chalkboard menu board listing authentic dishes
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

import { pbrMaterialSystem } from '../systems/pbr-material-system.js';

export function buildBukaRestaurant(): Object3D {
  const root = new Object3D();
  root.name = 'MamaNkechiBuka';

  // Realistic PBR Materials
  const floorMat = pbrMaterialSystem.getMaterial('cured_concrete', {
    color: 0x8d4239, // Terracotta red screed floor
    roughness: 0.65,
  });

  const timberPostMat = pbrMaterialSystem.getMaterial('african_iroko', {
    color: 0x5d4037, // Dark rough timber
    roughness: 0.8,
  });

  const zincRoofMat = pbrMaterialSystem.getMaterial('weathered_zinc');

  const counterMat = pbrMaterialSystem.getMaterial('african_iroko', {
    color: 0x3e2723,
    roughness: 0.7,
  });

  const potSteelMat = new MeshStandardMaterial({
    color: 0xe0e0e0,
    metalness: 0.85,
    roughness: 0.25,
  });

  const jollofMat = new MeshStandardMaterial({
    color: 0xd84315, // Rich smokey orange Jollof rice
    roughness: 0.9,
  });

  const dodoMat = new MeshStandardMaterial({
    color: 0xf57f17, // Golden caramelized fried plantain (Dodo)
    roughness: 0.6,
  });

  const plasticCrateMat = new MeshStandardMaterial({
    color: 0x1565c0, // Blue beverage crate
    roughness: 0.5,
  });

  const chalkboardMat = new MeshStandardMaterial({
    color: 0x263238, // Slate chalkboard
    roughness: 0.95,
  });

  // 1. Screed Floor (4.8m x 4.8m)
  const floor = new Mesh(new BoxGeometry(4.8, 0.1, 4.8), floorMat);
  floor.position.set(0, -0.05, 0);
  floor.receiveShadow = true;
  root.add(floor);

  // 2. Timber Canopy Columns (4 posts)
  const postGeo = new CylinderGeometry(0.06, 0.07, 2.8);
  for (let dx of [-2.1, 2.1]) {
    for (let dz of [-2.1, 2.1]) {
      const post = new Mesh(postGeo, timberPostMat);
      post.position.set(dx, 1.4, dz);
      post.castShadow = true;
      root.add(post);
    }
  }

  // Corrugated Roof Canopy
  const roof = new Mesh(new BoxGeometry(4.9, 0.05, 4.9), zincRoofMat);
  roof.position.set(0, 2.82, 0);
  roof.rotation.x = 0.05; // Slight drainage tilt
  roof.castShadow = true;
  root.add(roof);

  // 3. Serving Counter (X = 0, Z = -1.6)
  const counter = new Mesh(new BoxGeometry(3.2, 0.85, 0.75), counterMat);
  counter.position.set(0, 0.425, -1.6);
  counter.castShadow = true;
  counter.receiveShadow = true;
  root.add(counter);

  // Stainless Steel Stew / Jollof Pots
  for (let i = 0; i < 3; i++) {
    const pot = new Mesh(new CylinderGeometry(0.22, 0.2, 0.25, 16), potSteelMat);
    pot.position.set(-0.8 + i * 0.8, 0.975, -1.6);
    pot.castShadow = true;
    root.add(pot);

    // Food surface inside pot
    const foodMat = i === 0 ? jollofMat : i === 1 ? dodoMat : jollofMat;
    const food = new Mesh(new CylinderGeometry(0.2, 0.2, 0.02, 16), foodMat);
    food.position.set(-0.8 + i * 0.8, 1.08, -1.6);
    root.add(food);
  }

  // 4. Dining Bench & Table (X = 0, Z = 0.8)
  const table = new Mesh(new BoxGeometry(2.2, 0.75, 0.7), timberPostMat);
  table.position.set(0, 0.375, 0.8);
  table.castShadow = true;
  table.receiveShadow = true;
  root.add(table);

  // Benches on either side
  const benchGeo = new BoxGeometry(2.0, 0.42, 0.3);
  const benchA = new Mesh(benchGeo, timberPostMat);
  benchA.position.set(0, 0.21, 0.25);
  benchA.castShadow = true;
  benchA.receiveShadow = true;
  root.add(benchA);

  const benchB = new Mesh(benchGeo, timberPostMat);
  benchB.position.set(0, 0.21, 1.35);
  benchB.castShadow = true;
  benchB.receiveShadow = true;
  root.add(benchB);

  // 5. Drink Crates (X = -1.8, Z = 1.6)
  const crateGeo = new BoxGeometry(0.45, 0.3, 0.35);
  for (let layer = 0; layer < 2; layer++) {
    const crate = new Mesh(crateGeo, plasticCrateMat);
    crate.position.set(-1.8, 0.15 + layer * 0.3, 1.6);
    crate.castShadow = true;
    root.add(crate);
  }

  // 6. Menu Chalkboard (X = 1.8, Z = -1.6)
  const menuBoard = new Mesh(new BoxGeometry(0.6, 0.8, 0.04), chalkboardMat);
  menuBoard.position.set(1.8, 1.5, -1.6);
  menuBoard.castShadow = true;
  root.add(menuBoard);

  return root;
}
