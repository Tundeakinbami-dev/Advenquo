/**
 * Advenquo — Market Ground & Courtyard Walkway procedural asset.
 *
 * Represents an authentic cobblestone and compacted red laterite earth
 * courtyard in Ìsàlẹ̀ Èkó, Lagos.
 *
 * Features:
 * - High-resolution cobblestone and compacted laterite earth paving (16m × 16m)
 * - Walkway curb transitions with North/South gateway openings for smooth pedestrian flow
 * - Peripheral concrete drainage gutters with cast-iron storm grates
 * - Extended outer street roadway with asphalt texture and painted curb safety markers
 *
 * Sized 16m × 16m core with 24m × 24m outer street perimeter to provide generous walkable
 * space and realistic environmental scale and depth for VR exploration.
 *
 * Evaluated in two realms (runtime + editor) — deterministic and side-effect free.
 */

import {
  BoxGeometry,
  CanvasTexture,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  RepeatWrapping,
} from '@iwsdk/core';

import { pbrMaterialSystem } from '../systems/pbr-material-system.js';

function buildGroundTexture(): CanvasTexture | null {
  if (typeof document === 'undefined') return null;

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Base compacted laterite earth & paving tone
  ctx.fillStyle = '#6d4c41';
  ctx.fillRect(0, 0, size, size);

  // Cobblestone / courtyard paving grid pattern
  const tileSize = 32;
  for (let y = 0; y < size; y += tileSize) {
    for (let x = 0; x < size; x += tileSize) {
      // Slight earthy variation per stone
      const variance = Math.sin(x * 12.3 + y * 45.6) * 15;
      const r = Math.floor(109 + variance);
      const g = Math.floor(76 + variance * 0.8);
      const b = Math.floor(65 + variance * 0.6);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

      // Mortar / earth seams
      ctx.strokeStyle = '#4e342e';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, tileSize, tileSize);
    }
  }

  // Deterministic fine noise / sand grain overlay
  ctx.fillStyle = 'rgba(215, 175, 140, 0.12)';
  for (let i = 0; i < 400; i++) {
    const px = ((i * 137) ^ (i * 257)) % size;
    const py = ((i * 193) ^ (i * 389)) % size;
    ctx.fillRect(px, py, 2, 2);
  }

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
}

export function buildMarketGround(): Object3D {
  const root = new Object3D();
  root.name = 'MarketGround';

  const texture = buildGroundTexture();
  const normalMap = pbrMaterialSystem.generateProceduralNormalMap('laterite_soil');
  const asphaltNormal = pbrMaterialSystem.generateProceduralNormalMap('asphalt_road');

  const groundMat = new MeshStandardMaterial({
    color: 0x8d6e63,
    roughness: 0.92,
    metalness: 0.05,
    normalMap,
  });
  if (texture) {
    groundMat.map = texture;
  }

  const curbMat = new MeshStandardMaterial({
    color: 0x4e342e,
    roughness: 0.88,
    metalness: 0.08,
  });

  const gutterMat = new MeshStandardMaterial({
    color: 0x3e2723,
    roughness: 0.95,
  });

  const ironGrateMat = new MeshStandardMaterial({
    color: 0x263238, // Cast iron drainage grate
    roughness: 0.5,
    metalness: 0.7,
  });

  const outerAsphaltMat = new MeshStandardMaterial({
    color: 0x2b3035,
    roughness: 0.85,
    metalness: 0.12,
    normalMap: asphaltNormal,
  });

  const yellowLineMat = new MeshStandardMaterial({
    color: 0xfbc02d, // Roadway traffic line
    roughness: 0.6,
  });

  // 1. Extended Outer Roadway & Surrounding Street (24m × 0.14m × 24m)
  // Stepped 6cm below the courtyard curb to establish realistic urban street topography
  const outerRoadGeo = new BoxGeometry(24, 0.14, 24);
  const outerRoad = new Mesh(outerRoadGeo, outerAsphaltMat);
  outerRoad.position.set(0, -0.13, 0);
  outerRoad.receiveShadow = true;
  root.add(outerRoad);

  // Painted yellow street curb guide lines
  const yellowLineNorth = new Mesh(new BoxGeometry(18, 0.01, 0.12), yellowLineMat);
  yellowLineNorth.position.set(0, -0.055, -9.2);
  root.add(yellowLineNorth);

  const yellowLineSouth = new Mesh(new BoxGeometry(18, 0.01, 0.12), yellowLineMat);
  yellowLineSouth.position.set(0, -0.055, 9.2);
  root.add(yellowLineSouth);

  // 2. Main Walkable Courtyard Slab (16m × 0.2m × 16m)
  // Top surface is exactly at y = 0, so player at [0, 0, 0] stands comfortably on top
  const groundGeo = new BoxGeometry(16, 0.2, 16);
  const groundMesh = new Mesh(groundGeo, groundMat);
  groundMesh.position.set(0, -0.1, 0);
  groundMesh.receiveShadow = true;
  root.add(groundMesh);

  // 3. Perimeter Drainage Gutters & Storm Grates (Iconic Lagos roadside stormwater gutters)
  const gutterGeo = new BoxGeometry(16.4, 0.06, 0.35);
  const gutterSouth = new Mesh(gutterGeo, gutterMat);
  gutterSouth.position.set(0, -0.04, 8.2);
  root.add(gutterSouth);

  const gutterNorth = new Mesh(gutterGeo, gutterMat);
  gutterNorth.position.set(0, -0.04, -8.2);
  root.add(gutterNorth);

  // Cast iron storm drain grates at corners
  const grateGeo = new BoxGeometry(1.2, 0.02, 0.35);
  for (const gx of [-7.2, 7.2]) {
    const grateS = new Mesh(grateGeo, ironGrateMat);
    grateS.position.set(gx, -0.01, 8.2);
    root.add(grateS);

    const grateN = new Mesh(grateGeo, ironGrateMat);
    grateN.position.set(gx, -0.01, -8.2);
    root.add(grateN);
  }

  // 4. Stone Curbs with Pedestrian Gateway Openings (3m openings on North and South for walking into streets)
  const curbThickness = 0.3;
  const curbHeight = 0.14;
  const halfSegment = 6.2; // Leaves 3.6m open gateway in the middle

  // North Curbs (Left & Right of gateway)
  const northCurbGeo = new BoxGeometry(halfSegment, curbHeight, curbThickness);
  const northCurbL = new Mesh(northCurbGeo, curbMat);
  northCurbL.position.set(-4.8, 0.07, -8 + curbThickness / 2);
  root.add(northCurbL);

  const northCurbR = new Mesh(northCurbGeo, curbMat);
  northCurbR.position.set(4.8, 0.07, -8 + curbThickness / 2);
  root.add(northCurbR);

  // South Curbs (Left & Right of gateway)
  const southCurbL = new Mesh(northCurbGeo, curbMat);
  southCurbL.position.set(-4.8, 0.07, 8 - curbThickness / 2);
  root.add(southCurbL);

  const southCurbR = new Mesh(northCurbGeo, curbMat);
  southCurbR.position.set(4.8, 0.07, 8 - curbThickness / 2);
  root.add(southCurbR);

  // West & East continuous curbs
  const sideCurbGeo = new BoxGeometry(curbThickness, curbHeight, 16);
  const westCurb = new Mesh(sideCurbGeo, curbMat);
  westCurb.position.set(-8 + curbThickness / 2, 0.07, 0);
  root.add(westCurb);

  const eastCurb = new Mesh(sideCurbGeo, curbMat);
  eastCurb.position.set(8 - curbThickness / 2, 0.07, 0);
  root.add(eastCurb);

  return root;
}
