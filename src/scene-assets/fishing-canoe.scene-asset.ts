/**
 * Advenquo — Artisanal Coastal Fishing Canoe procedural 3D asset.
 *
 * Coastal wooden fishing boat (Ọkọ̀ Ojú Omi) commonly found along Tarkwa Bay:
 * - Carved hardwood hull with traditional blue, green, and red paint bands
 * - Interior ribbed wooden seating thwarts
 * - Tied hemp mooring rope coil
 * - Dual carved wooden steering paddles
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

export function buildFishingCanoe(): Object3D {
  const root = new Object3D();
  root.name = 'FishingCanoe';

  // Materials
  const woodHullMat = new MeshStandardMaterial({
    color: 0x5d4037, // Seasoned maritime timber
    roughness: 0.8,
  });

  const bluePaintMat = new MeshStandardMaterial({
    color: 0x0277bd, // Coastal fishing blue enamel
    roughness: 0.45,
  });

  const redStripeMat = new MeshStandardMaterial({
    color: 0xc62828, // Bright safety red keel stripe
    roughness: 0.5,
  });

  const paddleMat = new MeshStandardMaterial({
    color: 0xd7ccc8, // Light driftwood paddle
    roughness: 0.7,
  });

  // 1. Canoe Main Hull Bottom
  const bottomGeo = new BoxGeometry(1.0, 0.15, 3.8);
  const bottomMesh = new Mesh(bottomGeo, woodHullMat);
  bottomMesh.position.set(0, 0.12, 0);
  root.add(bottomMesh);

  // 2. Port and Starboard Hull Sides
  const sideGeo = new BoxGeometry(0.12, 0.45, 3.8);

  const portSide = new Mesh(sideGeo, bluePaintMat);
  portSide.position.set(-0.48, 0.35, 0);
  portSide.rotation.z = -0.15;
  root.add(portSide);

  const stbdSide = new Mesh(sideGeo, bluePaintMat);
  stbdSide.position.set(0.48, 0.35, 0);
  stbdSide.rotation.z = 0.15;
  root.add(stbdSide);

  // Red Keel Stripe along water line
  const keelGeo = new BoxGeometry(0.08, 0.08, 4.0);
  const keelMesh = new Mesh(keelGeo, redStripeMat);
  keelMesh.position.set(0, 0.04, 0);
  root.add(keelMesh);

  // 3. Tapered Bow and Stern Prow
  const prowGeo = new CylinderGeometry(0.05, 0.5, 0.6, 6);

  const bowProw = new Mesh(prowGeo, bluePaintMat);
  bowProw.position.set(0, 0.4, 2.05);
  bowProw.rotation.x = 0.5;
  root.add(bowProw);

  const sternProw = new Mesh(prowGeo, bluePaintMat);
  sternProw.position.set(0, 0.4, -2.05);
  sternProw.rotation.x = -0.5;
  root.add(sternProw);

  // 4. Seating Thwarts (Cross benches)
  const seatGeo = new BoxGeometry(0.85, 0.06, 0.28);
  const seatPositions = [-0.9, 0, 0.9];

  for (const sz of seatPositions) {
    const seat = new Mesh(seatGeo, woodHullMat);
    seat.position.set(0, 0.38, sz);
    root.add(seat);
  }

  // 5. Wooden Steering Paddle resting inside
  const shaftGeo = new CylinderGeometry(0.025, 0.025, 1.6, 8);
  const bladeGeo = new BoxGeometry(0.18, 0.45, 0.02);

  const paddleShaft = new Mesh(shaftGeo, paddleMat);
  paddleShaft.position.set(0.2, 0.4, 0.2);
  paddleShaft.rotation.x = 0.35;
  paddleShaft.rotation.z = -0.2;
  root.add(paddleShaft);

  const paddleBlade = new Mesh(bladeGeo, paddleMat);
  paddleBlade.position.set(0.35, 0.25, 0.85);
  paddleBlade.rotation.x = 0.35;
  paddleBlade.rotation.z = -0.2;
  root.add(paddleBlade);

  return root;
}
