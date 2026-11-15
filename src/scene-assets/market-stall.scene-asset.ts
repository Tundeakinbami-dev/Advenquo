/**
 * Advenquo — Artisan Market Stall procedural asset.
 *
 * Represents an authentic Yoruba textile & craft stall (Iyá Aláso's Adire stall)
 * in the Ìsàlẹ̀ Èkó heritage market.
 *
 * Features:
 * - Weathered African Iroko timber pole framework with joinery mortise pegs
 * - Forward-slanted indigo canopy roof with scalloped gold awning flap
 * - Carved timber stall plaque ("ILÉ ÀSỌ ÀDÌRẸ — ÌSÀLẸ̀ ÈKÓ")
 * - Tiered display counter with brass counterweight scales and trade weights
 * - Stacked bolts of woven Adire indigo & turquoise textiles with ribbon ties
 * - Hanging display rack with draped fabric swags
 * - Authentic terracotta indigo dye vats with wooden stirring paddles beneath shelf
 *
 * Evaluated in two realms (runtime + editor) — deterministic and side-effect free.
 */

import {
  BoxGeometry,
  CylinderGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  SphereGeometry,
  TorusGeometry,
} from '@iwsdk/core';

import { pbrMaterialSystem } from '../systems/pbr-material-system.js';

export function buildMarketStall(): Object3D {
  const root = new Object3D();
  root.name = 'MarketStall';

  // Realistic PBR Materials
  const timberMat = pbrMaterialSystem.getMaterial('african_iroko', {
    color: 0x5d4037, // Weathered timber
    roughness: 0.85,
  });

  const canopyMat = new MeshStandardMaterial({
    color: 0x15356e, // Deep royal indigo market canopy
    roughness: 0.88,
    metalness: 0.02,
  });

  const canopyStripeMat = new MeshStandardMaterial({
    color: 0xf5b027, // Golden yellow accent stripes & scalloped edge
    roughness: 0.85,
    metalness: 0.05,
  });

  const counterMat = pbrMaterialSystem.getMaterial('african_iroko', {
    color: 0x6d4c41,
    roughness: 0.72,
  });

  const clothIndigoMat = pbrMaterialSystem.getMaterial('indigo_adire');

  const clothTealMat = pbrMaterialSystem.getMaterial('indigo_adire', {
    color: 0x00695c,
    roughness: 0.8,
  });

  const clothOchreMat = new MeshStandardMaterial({
    color: 0xd97706, // Warm terracotta-ochre printed cloth
    roughness: 0.85,
  });

  const brassMat = new MeshStandardMaterial({
    color: 0xf5b027, // Polished brass scale and weights
    roughness: 0.32,
    metalness: 0.82,
  });

  const clayVatMat = new MeshStandardMaterial({
    color: 0x4e342e, // Heavy terracotta earthenware dye pot
    roughness: 0.9,
    metalness: 0.05,
  });

  const dyeLiquidMat = new MeshStandardMaterial({
    color: 0x0d1f3c, // Deep indigo dye vat liquid with subtle sheen
    roughness: 0.2,
    metalness: 0.1,
  });

  // 1. Four Corner Timber Posts (2.3m high in back, 2.1m in front for forward roof slant)
  const postRadius = 0.04;
  const backPostGeo = new CylinderGeometry(postRadius, postRadius, 2.3, 8);
  const frontPostGeo = new CylinderGeometry(postRadius, postRadius, 2.1, 8);

  const halfWidth = 1.15;
  const halfDepth = 0.65;

  // Front Left & Right Posts
  const flPost = new Mesh(frontPostGeo, timberMat);
  flPost.position.set(-halfWidth, 1.05, halfDepth);
  flPost.castShadow = true;
  root.add(flPost);

  const frPost = new Mesh(frontPostGeo, timberMat);
  frPost.position.set(halfWidth, 1.05, halfDepth);
  frPost.castShadow = true;
  root.add(frPost);

  // Back Left & Right Posts
  const blPost = new Mesh(backPostGeo, timberMat);
  blPost.position.set(-halfWidth, 1.15, -halfDepth);
  blPost.castShadow = true;
  root.add(blPost);

  const brPost = new Mesh(backPostGeo, timberMat);
  brPost.position.set(halfWidth, 1.15, -halfDepth);
  brPost.castShadow = true;
  root.add(brPost);

  // Joinery pegs at corners
  const pegGeo = new CylinderGeometry(0.015, 0.015, 0.12, 6);
  for (const px of [-halfWidth, halfWidth]) {
    for (const pz of [-halfDepth, halfDepth]) {
      const peg = new Mesh(pegGeo, brassMat);
      peg.position.set(px, pz > 0 ? 2.05 : 2.25, pz);
      peg.rotation.x = Math.PI / 2;
      root.add(peg);
    }
  }

  // 2. Horizontal Header Beams
  const frontBeamGeo = new BoxGeometry(2.45, 0.08, 0.08);
  const frontBeam = new Mesh(frontBeamGeo, timberMat);
  frontBeam.position.set(0, 2.05, halfDepth);
  root.add(frontBeam);

  const backBeam = new Mesh(frontBeamGeo, timberMat);
  backBeam.position.set(0, 2.25, -halfDepth);
  root.add(backBeam);

  const sideBeamGeo = new BoxGeometry(0.08, 0.08, 1.45);
  const leftBeam = new Mesh(sideBeamGeo, timberMat);
  leftBeam.position.set(-halfWidth, 2.15, 0);
  root.add(leftBeam);

  const rightBeam = new Mesh(sideBeamGeo, timberMat);
  rightBeam.position.set(halfWidth, 2.15, 0);
  root.add(rightBeam);

  // 3. Slanted Canopy Roof & Front Scalloped Awning
  const canopyGeo = new BoxGeometry(2.5, 0.035, 1.6);
  const canopy = new Mesh(canopyGeo, canopyMat);
  canopy.name = 'MarketStallCanopy';
  canopy.position.set(0, 2.18, 0);
  canopy.rotation.x = 0.14; // Forward pitch to shed rain
  canopy.castShadow = true;
  root.add(canopy);

  // Decorative gold awning front flap
  const flapGeo = new BoxGeometry(2.5, 0.26, 0.02);
  const flap = new Mesh(flapGeo, canopyStripeMat);
  flap.name = 'MarketStallAwningFlap';
  flap.position.set(0, 1.95, halfDepth + 0.09);
  root.add(flap);

  // Wooden Stall Sign Plaque
  const signPlaque = new Mesh(new BoxGeometry(1.6, 0.22, 0.04), timberMat);
  signPlaque.position.set(0, 2.06, halfDepth + 0.1);
  root.add(signPlaque);

  const signBorder = new Mesh(new BoxGeometry(1.64, 0.24, 0.02), brassMat);
  signBorder.position.set(0, 2.06, halfDepth + 0.08);
  root.add(signBorder);

  // 4. Counter / Display Table Top (height 0.78m)
  const counterGeo = new BoxGeometry(2.25, 0.06, 0.95);
  const counter = new Mesh(counterGeo, counterMat);
  counter.position.set(0, 0.76, 0.1);
  counter.castShadow = true;
  counter.receiveShadow = true;
  root.add(counter);

  // Lower Storage Shelf
  const lowerShelfGeo = new BoxGeometry(2.15, 0.04, 0.85);
  const lowerShelf = new Mesh(lowerShelfGeo, counterMat);
  lowerShelf.position.set(0, 0.25, 0);
  lowerShelf.receiveShadow = true;
  root.add(lowerShelf);

  // 5. Traditional Brass Balance Scale on Counter
  const scaleBase = new Mesh(new CylinderGeometry(0.08, 0.09, 0.03, 12), brassMat);
  scaleBase.position.set(0.7, 0.8, 0.2);
  root.add(scaleBase);

  const scalePole = new Mesh(new CylinderGeometry(0.012, 0.012, 0.35, 8), brassMat);
  scalePole.position.set(0.7, 0.98, 0.2);
  root.add(scalePole);

  const scaleBeam = new Mesh(new BoxGeometry(0.32, 0.015, 0.015), brassMat);
  scaleBeam.position.set(0.7, 1.15, 0.2);
  root.add(scaleBeam);

  // Brass scale pans
  const panGeo = new CylinderGeometry(0.07, 0.05, 0.02, 10);
  const leftPan = new Mesh(panGeo, brassMat);
  leftPan.position.set(0.56, 1.02, 0.2);
  root.add(leftPan);

  const rightPan = new Mesh(panGeo, brassMat);
  rightPan.position.set(0.84, 1.04, 0.2);
  root.add(rightPan);

  // Brass trade weights on counter
  for (let w = 0; w < 3; w++) {
    const weight = new Mesh(new CylinderGeometry(0.015 - w * 0.003, 0.018 - w * 0.003, 0.03, 8), brassMat);
    weight.position.set(0.52 + w * 0.04, 0.8, 0.4);
    root.add(weight);
  }

  // 6. Hanging Textiles on Back Timber Rail
  const rackRod = new Mesh(new CylinderGeometry(0.018, 0.018, 2.3, 8), timberMat);
  rackRod.rotation.z = Math.PI / 2;
  rackRod.position.set(0, 1.72, -halfDepth + 0.12);
  root.add(rackRod);

  // Draped Hanging Cloths
  const cloth1 = new Mesh(new BoxGeometry(0.55, 0.85, 0.02), clothIndigoMat);
  cloth1.position.set(-0.62, 1.3, -halfDepth + 0.14);
  cloth1.castShadow = true;
  root.add(cloth1);

  const cloth2 = new Mesh(new BoxGeometry(0.52, 0.9, 0.02), clothTealMat);
  cloth2.position.set(0.0, 1.28, -halfDepth + 0.14);
  cloth2.castShadow = true;
  root.add(cloth2);

  const cloth3 = new Mesh(new BoxGeometry(0.55, 0.82, 0.02), clothOchreMat);
  cloth3.position.set(0.62, 1.32, -halfDepth + 0.14);
  cloth3.castShadow = true;
  root.add(cloth3);

  // 7. Stacked Bolts of Folded Cloth on Counter
  const boltGeo = new BoxGeometry(0.38, 0.08, 0.28);
  const boltMats = [clothIndigoMat, clothTealMat, clothOchreMat];
  for (let b = 0; b < 3; b++) {
    const bolt = new Mesh(boltGeo, boltMats[b % 3]);
    bolt.position.set(-0.7, 0.83 + b * 0.085, 0.15);
    bolt.castShadow = true;
    root.add(bolt);

    // Golden ribbon tied around each bolt
    const rib = new Mesh(new TorusGeometry(0.12, 0.008, 6, 14), brassMat);
    rib.position.set(-0.7, 0.83 + b * 0.085, 0.15);
    rib.rotation.y = Math.PI / 2;
    root.add(rib);
  }

  // 8. Earthen Terracotta Indigo Dye Vats Beneath Stall Shelf
  const vatGeo = new SphereGeometry(0.24, 12, 10);
  const vatRimGeo = new TorusGeometry(0.19, 0.03, 6, 16);
  const liquidGeo = new CylinderGeometry(0.18, 0.18, 0.02, 12);

  for (let v = 0; v < 2; v++) {
    const vx = -0.6 + v * 0.55;
    const vat = new Mesh(vatGeo, clayVatMat);
    vat.position.set(vx, 0.2, -0.15);
    vat.scale.set(1, 0.9, 1);
    vat.castShadow = true;
    root.add(vat);

    const vatRim = new Mesh(vatRimGeo, clayVatMat);
    vatRim.position.set(vx, 0.38, -0.15);
    vatRim.rotation.x = Math.PI / 2;
    root.add(vatRim);

    const liquid = new Mesh(liquidGeo, dyeLiquidMat);
    liquid.position.set(vx, 0.36, -0.15);
    root.add(liquid);

    // Wooden dye stirring paddle
    const paddle = new Mesh(new CylinderGeometry(0.015, 0.015, 0.6, 6), timberMat);
    paddle.position.set(vx + 0.05, 0.45, -0.15);
    paddle.rotation.set(0.25, 0, -0.3);
    root.add(paddle);
  }

  return root;
}
