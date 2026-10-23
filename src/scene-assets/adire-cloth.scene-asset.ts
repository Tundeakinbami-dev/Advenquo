/**
 * Advenquo — Adire Cloth procedural asset.
 *
 * A rectangular cloth panel with a hand-painted Adire (Yoruba resist-dyed
 * indigo fabric) geometric pattern rendered as a Three.js canvas texture.
 * The cloth hangs on a simple wooden rod.
 *
 * This module is evaluated in two realms (runtime + editor) — no side effects.
 */

import {
  BoxGeometry,
  CanvasTexture,
  CylinderGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
} from '@iwsdk/core';

function buildAdireTexture(): CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Background — deep indigo
  ctx.fillStyle = '#1a237e';
  ctx.fillRect(0, 0, size, size);

  // Adire geometric pattern — white/cream resist lines
  ctx.strokeStyle = '#f5f0e0';
  ctx.lineWidth = 2;

  // Grid of diamond/cross motifs
  const cell = 32;
  for (let row = 0; row < size / cell; row++) {
    for (let col = 0; col < size / cell; col++) {
      const cx = col * cell + cell / 2;
      const cy = row * cell + cell / 2;
      const r = cell * 0.35;

      // Diamond outline
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx + r, cy);
      ctx.lineTo(cx, cy + r);
      ctx.lineTo(cx - r, cy);
      ctx.closePath();
      ctx.stroke();

      // Centre dot
      ctx.fillStyle = '#f5f0e0';
      ctx.beginPath();
      ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Horizontal stripe borders
  ctx.strokeStyle = '#90caf9';
  ctx.lineWidth = 3;
  for (const y of [16, size - 16]) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }

  return new CanvasTexture(canvas);
}

export function buildAdireCloth(): Object3D {
  const root = new Object3D();
  root.name = 'AdireCloth';

  // Hanging rod
  const rodGeo = new CylinderGeometry(0.015, 0.015, 0.55, 8);
  const rodMat = new MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9 });
  const rod = new Mesh(rodGeo, rodMat);
  rod.rotation.z = Math.PI / 2;
  rod.position.y = 0.25;
  rod.castShadow = false;
  root.add(rod);

  // Cloth panel
  const clothGeo = new BoxGeometry(0.45, 0.5, 0.005);
  const clothMat = new MeshStandardMaterial({
    map: buildAdireTexture(),
    roughness: 0.85,
    metalness: 0,
  });
  const cloth = new Mesh(clothGeo, clothMat);
  cloth.position.y = 0;
  cloth.castShadow = false;
  root.add(cloth);

  return root;
}
