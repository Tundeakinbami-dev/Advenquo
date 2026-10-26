/**
 * Advenquo — District Signpost procedural asset.
 *
 * Represents an authentic street and district wayfinding signpost in Lagos:
 * - Green & white Lagos signage banner: "IGA IDUNGANRAN WAY / ÌSÀLÈ ÈKÓ"
 * - Directional marker pointing towards the Heritage Market & Courtyard
 *
 * Evaluated in two realms (runtime + editor) — deterministic and side-effect free.
 */

import {
  BoxGeometry,
  CanvasTexture,
  CylinderGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
} from '@iwsdk/core';

function buildSignboardTexture(): CanvasTexture | null {
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Lagos Municipal Green Background
  ctx.fillStyle = '#1b5e20';
  ctx.fillRect(0, 0, 512, 160);

  // White border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, 496, 144);

  // Street Name Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('IGA IDUNGANRAN WAY', 256, 68);

  // District / Locality subtitle
  ctx.fillStyle = '#fbc02d'; // Gold highlight
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('ÌSÀLÈ ÈKÓ • HISTORIC DISTRICT', 256, 120);

  return new CanvasTexture(canvas);
}

export function buildDistrictSign(): Object3D {
  const root = new Object3D();
  root.name = 'DistrictSign';

  // Materials
  const metalPostMat = new MeshStandardMaterial({
    color: 0x37474f,
    roughness: 0.4,
    metalness: 0.7,
  });

  const concreteMat = new MeshStandardMaterial({
    color: 0x9e9e9e,
    roughness: 0.95,
  });

  const signTexture = buildSignboardTexture();
  const signBoardMat = new MeshStandardMaterial({
    color: 0xffffff,
    map: signTexture,
    roughness: 0.5,
  });

  // 1. Concrete ground footing (at y = 0)
  const footingGeo = new CylinderGeometry(0.18, 0.22, 0.25, 8);
  const footing = new Mesh(footingGeo, concreteMat);
  footing.position.set(0, 0.125, 0);
  root.add(footing);

  // 2. Vertical tubular post (2.2m tall)
  const postGeo = new CylinderGeometry(0.04, 0.04, 2.2, 12);
  const post = new Mesh(postGeo, metalPostMat);
  post.position.set(0, 1.1, 0);
  post.castShadow = true;
  root.add(post);

  // 3. Double-sided Street Sign Board (height 1.8m)
  const boardGeo = new BoxGeometry(1.2, 0.38, 0.04);
  const board = new Mesh(boardGeo, signBoardMat);
  board.position.set(0, 1.85, 0);
  board.castShadow = true;
  root.add(board);

  // 4. Directional arrow pointer below
  const arrowGeo = new BoxGeometry(0.9, 0.2, 0.03);
  const arrowMat = new MeshStandardMaterial({
    color: 0x1565c0, // Blue transit wayfinding
    roughness: 0.5,
  });
  const arrow = new Mesh(arrowGeo, arrowMat);
  arrow.position.set(0, 1.5, 0);
  root.add(arrow);

  return root;
}
