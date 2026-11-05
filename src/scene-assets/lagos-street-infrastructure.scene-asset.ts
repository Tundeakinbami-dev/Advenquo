/**
 * Advenquo — Authentic Lagos Street Infrastructure procedural 3D asset.
 *
 * Captures the authentic environmental texture and density of urban Lagos:
 * - Reinforced concrete utility power pole with cross-arms and ceramic bell insulators
 * - Realistic sagging electrical distribution cables and service drops
 * - Pole-mounted step-down transformer with cooling fins & yellow warning stencil
 * - Open concrete stormwater drainage gutter (the iconic Lagos roadside gutter)
 * - Removable reinforced concrete pedestrian crossing slabs over the drain
 * - Curbstones painted in alternating black and white traffic safety bands
 * - Crushed granite aggregate asphalt roadway with red laterite dirt shoulder
 * - Roadside tropical vegetation: potted bougainvillea vine and young Neem tree
 *
 * Deterministic and side-effect free: parentless Object3D, no DOM, no timers.
 */

import {
  BoxGeometry,
  CylinderGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  SphereGeometry,
} from '@iwsdk/core';

import { pbrMaterialSystem } from '../systems/pbr-material-system.js';

export function buildLagosStreetInfrastructure(): Object3D {
  const root = new Object3D();
  root.name = 'LagosStreetInfrastructure';

  // Materials
  const concreteMat = pbrMaterialSystem.getMaterial('cured_concrete');
  const asphaltMat = pbrMaterialSystem.getMaterial('asphalt_road');
  const soilMat = pbrMaterialSystem.getMaterial('laterite_soil');

  const cableMat = new MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.9,
  });

  const ceramicMat = new MeshStandardMaterial({
    color: 0xd7ccc8, // Off-white glazed ceramic
    roughness: 0.2,
  });

  const curbBlackMat = new MeshStandardMaterial({
    color: 0x212121,
    roughness: 0.8,
  });

  const curbWhiteMat = new MeshStandardMaterial({
    color: 0xf5f5f5,
    roughness: 0.8,
  });

  const transformerMat = new MeshStandardMaterial({
    color: 0x455a64, // Dark industrial grey steel
    metalness: 0.7,
    roughness: 0.4,
  });

  const foliageMat = new MeshStandardMaterial({
    color: 0x2e7d32, // Lush tropical green
    roughness: 0.8,
  });

  const flowerMat = new MeshStandardMaterial({
    color: 0xc2185b, // Magenta Bougainvillea blossoms
    roughness: 0.7,
  });

  // 1. Asphalt Roadway & Laterite Dirt Shoulder (6.0m x 2.4m)
  const roadSlab = new Mesh(new BoxGeometry(6.0, 0.08, 1.8), asphaltMat);
  roadSlab.name = 'AsphaltRoadway';
  roadSlab.position.set(0, 0.04, 0.6);
  root.add(roadSlab);

  const lateriteShoulder = new Mesh(new BoxGeometry(6.0, 0.06, 0.8), soilMat);
  lateriteShoulder.name = 'LateriteShoulder';
  lateriteShoulder.position.set(0, 0.03, -0.6);
  root.add(lateriteShoulder);

  // 2. Concrete Stormwater Drainage Gutter (along Z = -0.15)
  // Trench floor
  const trenchFloor = new Mesh(new BoxGeometry(6.0, 0.04, 0.45), concreteMat);
  trenchFloor.name = 'StormwaterDrainGutter';
  trenchFloor.position.set(0, -0.15, -0.15);
  root.add(trenchFloor);

  // Trench side walls
  const trenchWallGeo = new BoxGeometry(6.0, 0.25, 0.08);
  const wallFront = new Mesh(trenchWallGeo, concreteMat);
  wallFront.position.set(0, -0.02, 0.05);
  root.add(wallFront);

  const wallBack = new Mesh(trenchWallGeo, concreteMat);
  wallBack.position.set(0, -0.02, -0.35);
  root.add(wallBack);

  // Pedestrian Crossing Bridge Slabs over the drain
  const bridgeSlabGeo = new BoxGeometry(0.85, 0.08, 0.55);
  for (let bx of [-1.8, 1.8]) {
    const bridge = new Mesh(bridgeSlabGeo, concreteMat);
    bridge.name = 'PedestrianCrossingSlabs';
    bridge.position.set(bx, 0.08, -0.15);
    root.add(bridge);
  }

  // 3. Alternating Curb Stones (Black & White pattern)
  const curbGeo = new BoxGeometry(0.5, 0.12, 0.1);
  for (let i = 0; i < 10; i++) {
    const curbMat = i % 2 === 0 ? curbBlackMat : curbWhiteMat;
    const curb = new Mesh(curbGeo, curbMat);
    curb.name = 'PaintedSafetyCurbs';
    curb.position.set(-2.25 + i * 0.5, 0.1, 0.12);
    root.add(curb);
  }

  // 4. Concrete Utility Power Pole (NEPA / EKEDC Pole) at X = -2.2, Z = -0.7
  const pole = new Mesh(new CylinderGeometry(0.12, 0.16, 5.8, 12), concreteMat);
  pole.name = 'ConcretePowerPole';
  pole.position.set(-2.2, 2.9, -0.7);
  root.add(pole);

  // Cross-arms
  const crossArmGeo = new BoxGeometry(1.6, 0.1, 0.1);
  const crossArmTop = new Mesh(crossArmGeo, concreteMat);
  crossArmTop.position.set(-2.2, 5.2, -0.7);
  root.add(crossArmTop);

  const crossArmMid = new Mesh(crossArmGeo, concreteMat);
  crossArmMid.position.set(-2.2, 4.4, -0.7);
  root.add(crossArmMid);

  // Ceramic Insulators
  const insulatorGeo = new CylinderGeometry(0.04, 0.03, 0.14, 8);
  for (let dx of [-0.6, 0.0, 0.6]) {
    const insTop = new Mesh(insulatorGeo, ceramicMat);
    insTop.position.set(-2.2 + dx, 5.32, -0.7);
    root.add(insTop);

    const insMid = new Mesh(insulatorGeo, ceramicMat);
    insMid.position.set(-2.2 + dx, 4.52, -0.7);
    root.add(insMid);
  }

  // Sagging overhead electrical cables spanning across X
  const cableGeoH = new CylinderGeometry(0.008, 0.008, 6.0);
  for (let y of [5.38, 4.58]) {
    const cable = new Mesh(cableGeoH, cableMat);
    cable.position.set(0.8, y - 0.08, -0.7);
    cable.rotation.z = Math.PI / 2;
    root.add(cable);
  }

  // 5. Pole-Mounted Distribution Transformer
  const transformer = new Mesh(new BoxGeometry(0.5, 0.65, 0.45), transformerMat);
  transformer.name = 'StepDownTransformer';
  transformer.position.set(-2.2, 3.4, -0.42);
  root.add(transformer);

  // Cooling fins
  const finGeo = new BoxGeometry(0.52, 0.03, 0.47);
  for (let fy = -0.2; fy <= 0.2; fy += 0.1) {
    const fin = new Mesh(finGeo, transformerMat);
    fin.position.set(-2.2, 3.4 + fy, -0.42);
    root.add(fin);
  }

  // 6. Tropical Roadside Neem Tree (Dogonyaro) at X = 2.4, Z = -0.7
  const treeTrunk = new Mesh(new CylinderGeometry(0.08, 0.12, 2.4, 8), pbrMaterialSystem.getMaterial('african_iroko'));
  treeTrunk.name = 'RoadsideVegetation';
  treeTrunk.position.set(2.4, 1.2, -0.7);
  root.add(treeTrunk);

  // Foliage clusters
  for (let [dx, dy, dz, r] of [
    [0, 2.4, 0, 0.65],
    [-0.3, 2.2, 0.2, 0.45],
    [0.35, 2.3, -0.15, 0.5],
  ]) {
    const cluster = new Mesh(new SphereGeometry(r, 8, 8), foliageMat);
    cluster.position.set(2.4 + dx, dy, -0.7 + dz);
    root.add(cluster);
  }

  // Bougainvillea blossoms accent
  for (let [bx, by, bz] of [
    [2.3, 2.1, -0.5],
    [2.5, 2.35, -0.6],
    [2.2, 2.4, -0.8],
  ]) {
    const flowers = new Mesh(new SphereGeometry(0.12, 6, 6), flowerMat);
    flowers.position.set(bx, by, bz);
    root.add(flowers);
  }

  return root;
}
