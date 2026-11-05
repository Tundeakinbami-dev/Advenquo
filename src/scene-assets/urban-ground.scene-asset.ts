/**
 * Advenquo — Lagos Urban Roadway & Walkway procedural 3D ground asset.
 *
 * Urban environment floor:
 * - High-grip dark asphalt roadway
 * - White painted pedestrian zebra crossing
 * - Light grey curbed concrete pedestrian sidewalks
 * - Solar LED streetlamp fixtures
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

export function buildUrbanGround(): Object3D {
  const root = new Object3D();
  root.name = 'UrbanGround';

  // Realistic PBR Materials
  const asphaltMat = pbrMaterialSystem.getMaterial('asphalt_road');
  const sidewalkMat = pbrMaterialSystem.getMaterial('cured_concrete');

  const zebraWhiteMat = new MeshStandardMaterial({
    color: 0xf5f5f5, // High-contrast road line paint
    roughness: 0.5,
  });

  const curbYellowMat = new MeshStandardMaterial({
    color: 0xffb300, // Yellow curb warning stripe
    roughness: 0.6,
  });

  const poleMat = pbrMaterialSystem.getMaterial('steel_scaffold', {
    color: 0x455a64, // Galvanized steel lighting post
    roughness: 0.35,
    metalness: 0.8,
  });

  const lampMat = new MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xfff9c4,
    emissiveIntensity: 0.9,
    roughness: 0.2,
  });

  // 1. Base Ground (18m × 18m)
  const baseGeo = new BoxGeometry(18, 0.1, 18);
  const baseMesh = new Mesh(baseGeo, asphaltMat);
  baseMesh.position.set(0, -0.05, 0);
  baseMesh.receiveShadow = true;
  root.add(baseMesh);

  // 2. Concrete Sidewalk Platforms (West and East sides)
  const sidewalkGeo = new BoxGeometry(5.0, 0.15, 18);
  const leftSidewalk = new Mesh(sidewalkGeo, sidewalkMat);
  leftSidewalk.position.set(-6.5, 0.05, 0);
  leftSidewalk.receiveShadow = true;
  root.add(leftSidewalk);

  const rightSidewalk = new Mesh(sidewalkGeo, sidewalkMat);
  rightSidewalk.position.set(6.5, 0.05, 0);
  rightSidewalk.receiveShadow = true;
  root.add(rightSidewalk);

  // 3. Yellow Curb Trims
  const curbGeo = new BoxGeometry(0.18, 0.16, 18);
  const leftCurb = new Mesh(curbGeo, curbYellowMat);
  leftCurb.position.set(-3.95, 0.06, 0);
  leftCurb.receiveShadow = true;
  root.add(leftCurb);

  const rightCurb = new Mesh(curbGeo, curbYellowMat);
  rightCurb.position.set(3.95, 0.06, 0);
  rightCurb.receiveShadow = true;
  root.add(rightCurb);

  // 4. White Zebra Pedestrian Crossing Stripes
  const stripeGeo = new BoxGeometry(0.5, 0.015, 4.0);
  for (let i = -3; i <= 3; i++) {
    const stripe = new Mesh(stripeGeo, zebraWhiteMat);
    stripe.position.set(i * 0.9, 0.01, 1.8);
    stripe.receiveShadow = true;
    root.add(stripe);
  }

  // 5. Modern Streetlight Posts
  const lampPositions = [
    [-4.8, 0, -4.5],
    [-4.8, 0, 4.5],
    [4.8, 0, -4.5],
    [4.8, 0, 4.5],
  ];

  const poleGeo = new CylinderGeometry(0.06, 0.08, 3.8, 12);
  const armGeo = new BoxGeometry(0.9, 0.08, 0.08);
  const fixtureGeo = new BoxGeometry(0.4, 0.08, 0.2);

  for (const [lx, ly, lz] of lampPositions) {
    const pole = new Mesh(poleGeo, poleMat);
    pole.position.set(lx, 1.9, lz);
    pole.castShadow = true;
    root.add(pole);

    const arm = new Mesh(armGeo, poleMat);
    const armX = lx > 0 ? -0.4 : 0.4;
    arm.position.set(lx + armX, 3.75, lz);
    arm.castShadow = true;
    root.add(arm);

    const fixture = new Mesh(fixtureGeo, lampMat);
    fixture.position.set(lx + armX * 1.8, 3.7, lz);
    root.add(fixture);
  }

  return root;
}
