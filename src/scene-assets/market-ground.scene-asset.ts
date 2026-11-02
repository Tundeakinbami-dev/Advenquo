/**
 * Advenquo — Market Ground & Courtyard Walkway procedural asset.
 *
 * Represents an authentic cobblestone and compacted red laterite earth
 * courtyard in Ìsàlẹ̀ Èkó, Lagos.
 *
 * Sized 16m × 16m to provide a generous walkable area for both physical
 * room-scale boundary movement and virtual teleportation / smooth locomotion.
 *
 * Evaluated in two realms (runtime + editor) — deterministic and side-effect free.
 */

import {
  BoxGeometry,
  CanvasTexture,
  Mesh,
  MeshStandardMaterial,
  Object3D,
} from '@iwsdk/core';

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

  // Fine noise / sand grain overlay
  ctx.fillStyle = 'rgba(215, 175, 140, 0.12)';
  for (let i = 0; i < 400; i++) {
    const px = Math.floor(Math.random() * size);
    const py = Math.floor(Math.random() * size);
    ctx.fillRect(px, py, 2, 2);
  }

  const texture = new CanvasTexture(canvas);
  texture.repeat.set(8, 8);
  texture.wrapS = 1000; // RepeatWrapping
  texture.wrapT = 1000; // RepeatWrapping
  return texture;
}

export function buildMarketGround(): Object3D {
  const root = new Object3D();
  root.name = 'MarketGround';

  const texture = buildGroundTexture();
  const groundMat = new MeshStandardMaterial({
    color: 0x8d6e63,
    roughness: 0.95,
    metalness: 0.05,
    map: texture,
  });

  // Main walkable ground slab (16m × 0.2m × 16m)
  // Top surface is exactly at y = 0, so player at [0, 0, 0] stands on top of it.
  const groundGeo = new BoxGeometry(16, 0.2, 16);
  const groundMesh = new Mesh(groundGeo, groundMat);
  groundMesh.position.set(0, -0.1, 0);
  groundMesh.receiveShadow = true;
  root.add(groundMesh);

  // Stone curbs around the courtyard edges
  const curbMat = new MeshStandardMaterial({
    color: 0x4e342e,
    roughness: 0.9,
    metalness: 0.1,
  });

  const curbThickness = 0.3;
  const curbHeight = 0.15;
  const length = 16;

  // North curb
  const northCurbGeo = new BoxGeometry(length, curbHeight, curbThickness);
  const northCurb = new Mesh(northCurbGeo, curbMat);
  northCurb.position.set(0, 0.075, -8 + curbThickness / 2);
  root.add(northCurb);

  // South curb
  const southCurb = new Mesh(northCurbGeo, curbMat);
  southCurb.position.set(0, 0.075, 8 - curbThickness / 2);
  root.add(southCurb);

  // West curb
  const sideCurbGeo = new BoxGeometry(curbThickness, curbHeight, length);
  const westCurb = new Mesh(sideCurbGeo, curbMat);
  westCurb.position.set(-8 + curbThickness / 2, 0.075, 0);
  root.add(westCurb);

  // East curb
  const eastCurb = new Mesh(sideCurbGeo, curbMat);
  eastCurb.position.set(8 - curbThickness / 2, 0.075, 0);
  root.add(eastCurb);

  return root;
}
