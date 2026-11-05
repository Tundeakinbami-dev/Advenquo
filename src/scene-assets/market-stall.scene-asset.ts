/**
 * Advenquo — Artisan Market Stall procedural asset.
 *
 * Represents an authentic Yoruba textile & craft stall (Iyá Aláso's Adire stall)
 * in the Ìsàlẹ̀ Èkó heritage market.
 *
 * Features:
 * - Sturdy timber pole framework
 * - Slanted canopy in bright market fabric (indigo & gold)
 * - Wooden display counter & lower storage shelf
 * - Hanging timber rack with folded/draped textile displays
 *
 * Evaluated in two realms (runtime + editor) — deterministic and side-effect free.
 */

import {
  BoxGeometry,
  CylinderGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
} from '@iwsdk/core';

import { pbrMaterialSystem } from '../systems/pbr-material-system.js';

export function buildMarketStall(): Object3D {
  const root = new Object3D();
  root.name = 'MarketStall';

  // Realistic PBR Materials
  const timberMat = pbrMaterialSystem.getMaterial('african_iroko', {
    color: 0x5d4037, // Weathered wood
    roughness: 0.85,
  });

  const canopyMat = new MeshStandardMaterial({
    color: 0x1565c0, // Bright indigo market canopy
    roughness: 0.9,
    metalness: 0.0,
  });

  const canopyStripeMat = new MeshStandardMaterial({
    color: 0xfbc02d, // Golden yellow accent stripes
    roughness: 0.9,
    metalness: 0.0,
  });

  const counterMat = pbrMaterialSystem.getMaterial('african_iroko', {
    color: 0x6d4c41,
    roughness: 0.75,
  });

  const clothIndigoMat = pbrMaterialSystem.getMaterial('indigo_adire');

  const clothTealMat = pbrMaterialSystem.getMaterial('indigo_adire', {
    color: 0x00695c, // Patterned turquoise/green cloth
    roughness: 0.85,
  });

  // 1. Four Corner Timber Posts (2.3m high in back, 2.1m in front for slant)
  const postRadius = 0.035;
  const backPostGeo = new CylinderGeometry(postRadius, postRadius, 2.3, 8);
  const frontPostGeo = new CylinderGeometry(postRadius, postRadius, 2.1, 8);

  const halfWidth = 1.1;
  const halfDepth = 0.65;

  // Front Left & Right
  const flPost = new Mesh(frontPostGeo, timberMat);
  flPost.position.set(-halfWidth, 1.05, halfDepth);
  root.add(flPost);

  const frPost = new Mesh(frontPostGeo, timberMat);
  frPost.position.set(halfWidth, 1.05, halfDepth);
  root.add(frPost);

  // Back Left & Right
  const blPost = new Mesh(backPostGeo, timberMat);
  blPost.position.set(-halfWidth, 1.15, -halfDepth);
  root.add(blPost);

  const brPost = new Mesh(backPostGeo, timberMat);
  brPost.position.set(halfWidth, 1.15, -halfDepth);
  root.add(brPost);

  // 2. Horizontal Header Beams
  const frontBeamGeo = new BoxGeometry(2.35, 0.07, 0.07);
  const frontBeam = new Mesh(frontBeamGeo, timberMat);
  frontBeam.position.set(0, 2.05, halfDepth);
  root.add(frontBeam);

  const backBeam = new Mesh(frontBeamGeo, timberMat);
  backBeam.position.set(0, 2.25, -halfDepth);
  root.add(backBeam);

  const sideBeamGeo = new BoxGeometry(0.07, 0.07, 1.4);
  const leftBeam = new Mesh(sideBeamGeo, timberMat);
  leftBeam.position.set(-halfWidth, 2.15, 0);
  root.add(leftBeam);

  const rightBeam = new Mesh(sideBeamGeo, timberMat);
  rightBeam.position.set(halfWidth, 2.15, 0);
  root.add(rightBeam);

  // 3. Canopy Roof (sloped forward)
  const canopyGeo = new BoxGeometry(2.4, 0.03, 1.55);
  const canopy = new Mesh(canopyGeo, canopyMat);
  canopy.position.set(0, 2.18, 0);
  canopy.rotation.x = 0.14; // slants forward
  canopy.castShadow = true;
  root.add(canopy);

  // Decorative scalloped / striped awning front flap
  const flapGeo = new BoxGeometry(2.4, 0.25, 0.02);
  const flap = new Mesh(flapGeo, canopyStripeMat);
  flap.position.set(0, 1.95, halfDepth + 0.08);
  root.add(flap);

  // 4. Counter / Display Table Top (height 0.75m)
  const counterGeo = new BoxGeometry(2.2, 0.05, 0.9);
  const counter = new Mesh(counterGeo, counterMat);
  counter.position.set(0, 0.75, 0.1);
  counter.castShadow = true;
  root.add(counter);

  // Lower Shelf
  const lowerShelfGeo = new BoxGeometry(2.1, 0.03, 0.8);
  const lowerShelf = new Mesh(lowerShelfGeo, counterMat);
  lowerShelf.position.set(0, 0.25, 0);
  root.add(lowerShelf);

  // 5. Hanging Textiles from Back Rack
  const rackRodGeo = new CylinderGeometry(0.015, 0.015, 2.2, 8);
  const rackRod = new Mesh(rackRodGeo, timberMat);
  rackRod.rotation.z = Math.PI / 2;
  rackRod.position.set(0, 1.7, -halfDepth + 0.1);
  root.add(rackRod);

  // Folded / Hanging Cloth 1 (Navy Indigo)
  const cloth1Geo = new BoxGeometry(0.5, 0.8, 0.02);
  const cloth1 = new Mesh(cloth1Geo, clothIndigoMat);
  cloth1.position.set(-0.6, 1.3, -halfDepth + 0.12);
  root.add(cloth1);

  // Hanging Cloth 2 (Teal)
  const cloth2Geo = new BoxGeometry(0.5, 0.85, 0.02);
  const cloth2 = new Mesh(cloth2Geo, clothTealMat);
  cloth2.position.set(0.5, 1.28, -halfDepth + 0.12);
  root.add(cloth2);

  // Stacks of folded fabric bolts on the counter
  const boltGeo = new BoxGeometry(0.35, 0.08, 0.25);
  for (let i = 0; i < 3; i++) {
    const bolt = new Mesh(boltGeo, i % 2 === 0 ? clothIndigoMat : clothTealMat);
    bolt.position.set(-0.7, 0.82 + i * 0.085, 0.15);
    root.add(bolt);
  }

  return root;
}
