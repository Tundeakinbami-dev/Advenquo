/**
 * Advenquo — Iyá Aláso (Master Adire Artisan) Cinematic Realistic 3D NPC.
 *
 * Represents an esteemed master textile artist and trade matriarch at the Ìsàlẹ̀ Èkó artisan guild.
 * - Anatomically proportioned Nigerian female master artisan (7.6 heads tall, 1.68m stature)
 * - Sculpted facial structure: defined jawline, prominent cheekbones, arched brow ridge,
 *   almond-shaped eyes with sclera and pupils, sculpted nose with flared alar wings,
 *   and contoured lips
 * - Ceremonial folded Gele (Yoruba Asọ-Òkè headwrap) with sculptural pleated wings
 * - Authentic traditional attire: tailored linen Buba blouse with gold-embroidered collar,
 *   flowing floor-length Iro wrapper skirt with draped overlap, and cinched waist sash
 * - Royal Coral beads (Ìlẹ̀kẹ̀ Iyun) necklace and wrist bangles
 * - Realistic PBR materials with procedural Adire geometric resist dye textures
 * - Articulated skeletal hierarchy with named joints:
 *   Iya_Chest, Iya_Neck, Iya_Head, Iya_RightArm, Iya_RightForearm, Iya_LeftArm
 *   enabling real-time multi-joint breathing, conversational gesturing, and eye gaze tracking
 *
 * Deterministic and side-effect free: parentless Object3D, no DOM dependencies inside core geometry.
 */

import {
  BoxGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  RepeatWrapping,
  SphereGeometry,
  TorusGeometry,
} from '@iwsdk/core';

import { pbrMaterialSystem } from '../systems/pbr-material-system.js';

/**
 * Procedural Adire Eleko resist dye pattern generator for the Iro wrapper skirt.
 * Creates authentic Yoruba geometric motifs (concentric diamonds, cassava leaf chevrons).
 */
function buildAdirePatternTexture(): CanvasTexture | null {
  if (typeof document === 'undefined') return null;

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Deep indigo dye base
  ctx.fillStyle = '#14223d';
  ctx.fillRect(0, 0, size, size);

  // Geometric grid of Adire resist stencils
  const cellSize = 64;
  for (let y = 0; y < size; y += cellSize) {
    for (let x = 0; x < size; x += cellSize) {
      const cx = x + cellSize / 2;
      const cy = y + cellSize / 2;

      // Concentric resist diamonds
      ctx.strokeStyle = '#41679d';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx, y + 4);
      ctx.lineTo(x + cellSize - 4, cy);
      ctx.lineTo(cx, y + cellSize - 4);
      ctx.lineTo(x + 4, cy);
      ctx.closePath();
      ctx.stroke();

      // Inner diamond
      ctx.strokeStyle = '#7094c6';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, y + 14);
      ctx.lineTo(x + cellSize - 14, cy);
      ctx.lineTo(cx, y + cellSize - 14);
      ctx.lineTo(x + 14, cy);
      ctx.closePath();
      ctx.stroke();

      // Central resist star dot
      ctx.fillStyle = '#b0c8ea';
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Chevron accent lines
      ctx.strokeStyle = 'rgba(112, 148, 198, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 6, cy);
      ctx.lineTo(cx, y + cellSize - 6);
      ctx.lineTo(x + cellSize - 6, cy);
      ctx.stroke();
    }
  }

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(3, 4);
  return texture;
}

export function buildNpcIyaAlaso(): Object3D {
  const root = new Object3D();
  root.name = 'NpcIyaAlaso';

  // Realistic PBR Materials
  const skinMat = pbrMaterialSystem.getMaterial('human_skin_dark');
  const adireNormal = pbrMaterialSystem.generateProceduralNormalMap('indigo_adire');
  const adireTexture = buildAdirePatternTexture();

  const iroMat = new MeshStandardMaterial({
    color: 0x1a2e51,
    roughness: 0.72,
    metalness: 0.04,
    normalMap: adireNormal,
  });
  if (adireTexture) {
    iroMat.map = adireTexture;
  }

  const bubaMat = new MeshStandardMaterial({
    color: 0x152644, // Matching indigo linen blouse
    roughness: 0.78,
    metalness: 0.05,
    normalMap: adireNormal,
  });

  const geleMat = new MeshStandardMaterial({
    color: 0x1e3a6d, // Asọ-Òkè ceremonial weave with subtle metallic gold luster
    roughness: 0.52,
    metalness: 0.28,
  });

  const goldAccentMat = new MeshStandardMaterial({
    color: 0xf5b027, // Royal gold thread embroidery & jewelry
    roughness: 0.35,
    metalness: 0.75,
  });

  const coralMat = new MeshStandardMaterial({
    color: 0xd94420, // Polished royal red-orange coral beads (Iyun)
    roughness: 0.3,
    metalness: 0.12,
  });

  const eyeWhiteMat = new MeshStandardMaterial({
    color: 0xf4f4f4,
    roughness: 0.2,
  });

  const eyeIrisMat = new MeshStandardMaterial({
    color: 0x2b170c, // Deep rich brown eyes
    roughness: 0.1,
  });

  const lipMat = new MeshStandardMaterial({
    color: 0x5a2d24, // Warm terracotta-rose lip undertone
    roughness: 0.45,
  });

  const sandalMat = new MeshStandardMaterial({
    color: 0x3d2518, // Traditional dark leather sandals
    roughness: 0.6,
  });

  // 1. Lower Body & Wrapped Iro Skirt (Anatomical female proportion: y = 0 to 0.94m)
  // Leather sandals
  const sandalGeo = new BoxGeometry(0.1, 0.04, 0.23);
  const leftSandal = new Mesh(sandalGeo, sandalMat);
  leftSandal.position.set(-0.11, 0.02, 0.02);
  root.add(leftSandal);

  const rightSandal = new Mesh(sandalGeo, sandalMat);
  rightSandal.position.set(0.11, 0.02, 0.02);
  root.add(rightSandal);

  // Wrapped Iro Skirt (tapers from waist down with natural drape)
  const iroGeo = new CylinderGeometry(0.23, 0.28, 0.92, 16);
  const iroMesh = new Mesh(iroGeo, iroMat);
  iroMesh.position.set(0, 0.48, 0);
  iroMesh.castShadow = true;
  root.add(iroMesh);

  // Sculpted Iro wrapper overlap fold on front
  const iroFoldGeo = new BoxGeometry(0.12, 0.9, 0.05);
  const iroFold = new Mesh(iroFoldGeo, iroMat);
  iroFold.position.set(0.06, 0.47, 0.24);
  iroFold.rotation.y = 0.08;
  root.add(iroFold);

  // Cinched waist sash (Iborun tied at waist)
  const sashGeo = new TorusGeometry(0.24, 0.045, 8, 20);
  const sash = new Mesh(sashGeo, goldAccentMat);
  sash.position.set(0, 0.94, 0);
  sash.rotation.x = Math.PI / 2;
  root.add(sash);

  // 2. Articulated Torso Joint (Iya_Chest at y = 0.98m)
  const chestJoint = new Object3D();
  chestJoint.name = 'Iya_Chest';
  chestJoint.position.set(0, 0.98, 0);
  root.add(chestJoint);

  // Tailored Buba Blouse (Female anatomical taper: 0.36m height)
  const bubaGeo = new CylinderGeometry(0.23, 0.24, 0.36, 14);
  const bubaMesh = new Mesh(bubaGeo, bubaMat);
  bubaMesh.position.set(0, 0.18, 0);
  bubaMesh.scale.set(1.08, 1, 0.88);
  bubaMesh.castShadow = true;
  chestJoint.add(bubaMesh);

  // Embroidered Buba Neckline Border (Gold thread embroidery)
  const neckEmbroidery = new Mesh(new TorusGeometry(0.14, 0.025, 8, 16), goldAccentMat);
  neckEmbroidery.position.set(0, 0.35, 0.05);
  neckEmbroidery.rotation.x = Math.PI / 3.2;
  chestJoint.add(neckEmbroidery);

  // Royal Coral Bead Necklace (Multi-tier Iyun beads)
  const coralNecklace = new Mesh(new TorusGeometry(0.16, 0.02, 8, 20), coralMat);
  coralNecklace.position.set(0, 0.31, 0.08);
  coralNecklace.rotation.x = Math.PI / 3.4;
  chestJoint.add(coralNecklace);

  // Ceremonial Sash draped across left shoulder
  const shoulderSash = new Mesh(new BoxGeometry(0.12, 0.42, 0.26), geleMat);
  shoulderSash.position.set(-0.16, 0.2, 0.02);
  shoulderSash.rotation.z = 0.12;
  chestJoint.add(shoulderSash);

  // 3. Articulated Neck Joint (Iya_Neck)
  const neckJoint = new Object3D();
  neckJoint.name = 'Iya_Neck';
  neckJoint.position.set(0, 0.36, 0);
  chestJoint.add(neckJoint);

  const neckMesh = new Mesh(new CylinderGeometry(0.055, 0.065, 0.12, 12), skinMat);
  neckMesh.position.set(0, 0.06, 0);
  neckJoint.add(neckMesh);

  // 4. Articulated Head Joint (Iya_Head at y = 0.12m above neck)
  const headJoint = new Object3D();
  headJoint.name = 'Iya_Head';
  headJoint.position.set(0, 0.12, 0);
  neckJoint.add(headJoint);

  // Anatomical Cranium
  const cranium = new Mesh(new SphereGeometry(0.115, 18, 16), skinMat);
  cranium.position.set(0, 0.07, -0.01);
  cranium.castShadow = true;
  headJoint.add(cranium);

  // Sculpted Jaw and Chin
  const jaw = new Mesh(new BoxGeometry(0.125, 0.1, 0.13), skinMat);
  jaw.name = 'Jaw_Joint';
  jaw.position.set(0, 0.015, 0.02);
  headJoint.add(jaw);

  // Sculpted Cheekbones (Zygomatic arches)
  const leftCheek = new Mesh(new SphereGeometry(0.045, 8, 8), skinMat);
  leftCheek.position.set(-0.065, 0.045, 0.06);
  headJoint.add(leftCheek);

  const rightCheek = new Mesh(new SphereGeometry(0.045, 8, 8), skinMat);
  rightCheek.position.set(0.065, 0.045, 0.06);
  headJoint.add(rightCheek);

  // Sculpted Brow Ridge
  const browRidge = new Mesh(new BoxGeometry(0.14, 0.022, 0.04), skinMat);
  browRidge.position.set(0, 0.075, 0.09);
  headJoint.add(browRidge);

  // Almond-shaped Eyes with Sclera & Pupils
  const eyeScleraGeo = new SphereGeometry(0.018, 10, 8);
  const eyeIrisGeo = new SphereGeometry(0.009, 8, 8);

  // Left Eye & Blinking Eyelid
  const leftSclera = new Mesh(eyeScleraGeo, eyeWhiteMat);
  leftSclera.name = 'EyeSclera_L';
  leftSclera.position.set(-0.042, 0.065, 0.098);
  leftSclera.scale.set(1.2, 0.8, 0.7);
  headJoint.add(leftSclera);

  const leftIris = new Mesh(eyeIrisGeo, eyeIrisMat);
  leftIris.name = 'EyeIris_L';
  leftIris.position.set(-0.042, 0.065, 0.11);
  headJoint.add(leftIris);

  const leftEyelid = new Mesh(new SphereGeometry(0.019, 8, 6), skinMat);
  leftEyelid.name = 'EyeLid_L';
  leftEyelid.position.set(-0.042, 0.068, 0.102);
  leftEyelid.scale.set(1.25, 0.35, 0.75);
  headJoint.add(leftEyelid);

  // Right Eye & Blinking Eyelid
  const rightSclera = new Mesh(eyeScleraGeo, eyeWhiteMat);
  rightSclera.name = 'EyeSclera_R';
  rightSclera.position.set(0.042, 0.065, 0.098);
  rightSclera.scale.set(1.2, 0.8, 0.7);
  headJoint.add(rightSclera);

  const rightIris = new Mesh(eyeIrisGeo, eyeIrisMat);
  rightIris.name = 'EyeIris_R';
  rightIris.position.set(0.042, 0.065, 0.11);
  headJoint.add(rightIris);

  const rightEyelid = new Mesh(new SphereGeometry(0.019, 8, 6), skinMat);
  rightEyelid.name = 'EyeLid_R';
  rightEyelid.position.set(0.042, 0.068, 0.102);
  rightEyelid.scale.set(1.25, 0.35, 0.75);
  headJoint.add(rightEyelid);

  // Sculpted Nigerian Nose
  const noseBridge = new Mesh(new BoxGeometry(0.026, 0.045, 0.035), skinMat);
  noseBridge.position.set(0, 0.04, 0.108);
  headJoint.add(noseBridge);

  const noseTip = new Mesh(new SphereGeometry(0.018, 8, 8), skinMat);
  noseTip.position.set(0, 0.025, 0.122);
  headJoint.add(noseTip);

  // Sculpted Contoured Lips & Speech Articulation Joints
  const upperLip = new Mesh(new BoxGeometry(0.048, 0.016, 0.022), lipMat);
  upperLip.name = 'UpperLip';
  upperLip.position.set(0, 0.003, 0.11);
  headJoint.add(upperLip);

  const lowerLip = new Mesh(new BoxGeometry(0.044, 0.018, 0.022), lipMat);
  lowerLip.name = 'LowerLip';
  lowerLip.position.set(0, -0.013, 0.106);
  headJoint.add(lowerLip);

  // Ears & Gold Coral Hoop Earrings
  const earGeo = new SphereGeometry(0.028, 8, 8);
  const leftEar = new Mesh(earGeo, skinMat);
  leftEar.position.set(-0.115, 0.05, -0.01);
  leftEar.scale.set(0.4, 1.2, 0.8);
  headJoint.add(leftEar);

  const rightEar = new Mesh(earGeo, skinMat);
  rightEar.position.set(0.115, 0.05, -0.01);
  rightEar.scale.set(0.4, 1.2, 0.8);
  headJoint.add(rightEar);

  // Gold Coral Hoop Earrings (Traditional Yoruba style)
  const earringGeo = new TorusGeometry(0.022, 0.005, 6, 14);
  const leftEarring = new Mesh(earringGeo, goldAccentMat);
  leftEarring.position.set(-0.118, 0.022, -0.01);
  leftEarring.rotation.y = Math.PI / 2;
  headJoint.add(leftEarring);

  const rightEarring = new Mesh(earringGeo, goldAccentMat);
  rightEarring.position.set(0.118, 0.022, -0.01);
  rightEarring.rotation.y = Math.PI / 2;
  headJoint.add(rightEarring);

  // 5. Ceremonial Folded Gele Headwrap (Asọ-Òkè)
  // Crown base of Gele wrapped around cranium
  const geleCrownGeo = new CylinderGeometry(0.18, 0.13, 0.16, 18);
  const geleCrown = new Mesh(geleCrownGeo, geleMat);
  geleCrown.position.set(0, 0.14, -0.01);
  geleCrown.castShadow = true;
  headJoint.add(geleCrown);

  // Sculptural Pleated Fan Wing (Right side flare)
  const geleWingGeo = new TorusGeometry(0.24, 0.055, 8, 16, Math.PI);
  const geleWingRight = new Mesh(geleWingGeo, geleMat);
  geleWingRight.position.set(0.08, 0.19, 0.02);
  geleWingRight.rotation.set(0.22, 0.42, 0.28);
  geleWingRight.castShadow = true;
  headJoint.add(geleWingRight);

  // Counter-balancing Gele Pleat (Left side tier)
  const geleWingLeft = new Mesh(new TorusGeometry(0.2, 0.048, 8, 16, Math.PI * 0.85), geleMat);
  geleWingLeft.position.set(-0.07, 0.17, -0.02);
  geleWingLeft.rotation.set(-0.15, -0.35, -0.25);
  geleWingLeft.castShadow = true;
  headJoint.add(geleWingLeft);

  // Gold trimmed crest on top of Gele
  const geleCrest = new Mesh(new TorusGeometry(0.12, 0.02, 6, 16), goldAccentMat);
  geleCrest.position.set(0.02, 0.22, 0.01);
  geleCrest.rotation.x = Math.PI / 2;
  headJoint.add(geleCrest);

  // 6. Articulated Left Arm (Iya_LeftArm holding bolt of Adire cloth)
  const leftArmJoint = new Object3D();
  leftArmJoint.name = 'Iya_LeftArm';
  leftArmJoint.position.set(-0.24, 0.32, 0);
  chestJoint.add(leftArmJoint);

  const leftUpperArm = new Mesh(new CylinderGeometry(0.042, 0.038, 0.26), bubaMat);
  leftUpperArm.position.set(0, -0.13, 0.02);
  leftUpperArm.rotation.x = -0.35;
  leftArmJoint.add(leftUpperArm);

  const leftForearm = new Mesh(new CylinderGeometry(0.038, 0.032, 0.26), skinMat);
  leftForearm.position.set(0.02, -0.26, 0.14);
  leftForearm.rotation.x = -1.05;
  leftArmJoint.add(leftForearm);

  // Coral bangle on left wrist
  const leftBangle = new Mesh(new TorusGeometry(0.045, 0.012, 6, 14), coralMat);
  leftBangle.position.set(0.02, -0.32, 0.21);
  leftBangle.rotation.x = Math.PI / 2.2;
  leftArmJoint.add(leftBangle);

  // Masterpiece Rolled Bolt of Adire Cloth tucked under left arm
  const boltGeo = new CylinderGeometry(0.08, 0.08, 0.52, 14);
  const boltMesh = new Mesh(boltGeo, iroMat);
  boltMesh.position.set(0.06, -0.22, 0.24);
  boltMesh.rotation.set(0.4, 0.1, -0.3);
  boltMesh.castShadow = true;
  leftArmJoint.add(boltMesh);

  // Gold tie ribbons on cloth bolt
  const boltRibbonGeo = new TorusGeometry(0.084, 0.01, 6, 16);
  const ribbon1 = new Mesh(boltRibbonGeo, goldAccentMat);
  ribbon1.position.set(0.05, -0.14, 0.2);
  ribbon1.rotation.set(0.4, 0.1, -0.3);
  leftArmJoint.add(ribbon1);

  const ribbon2 = new Mesh(boltRibbonGeo, goldAccentMat);
  ribbon2.position.set(0.07, -0.3, 0.28);
  ribbon2.rotation.set(0.4, 0.1, -0.3);
  leftArmJoint.add(ribbon2);

  // 7. Articulated Right Arm Joint (Iya_RightArm -> Iya_RightForearm for Welcoming Gestures)
  const rightArmJoint = new Object3D();
  rightArmJoint.name = 'Iya_RightArm';
  rightArmJoint.position.set(0.24, 0.32, 0);
  chestJoint.add(rightArmJoint);

  const rightUpperArm = new Mesh(new CylinderGeometry(0.042, 0.038, 0.26), bubaMat);
  rightUpperArm.position.set(0, -0.13, 0);
  rightArmJoint.add(rightUpperArm);

  const rightForearmJoint = new Object3D();
  rightForearmJoint.name = 'Iya_RightForearm';
  rightForearmJoint.position.set(0, -0.26, 0);
  rightArmJoint.add(rightForearmJoint);

  const rightForearmMesh = new Mesh(new CylinderGeometry(0.038, 0.032, 0.26), skinMat);
  rightForearmMesh.position.set(0, -0.13, 0);
  rightForearmJoint.add(rightForearmMesh);

  // Coral bangle on right wrist
  const rightBangle = new Mesh(new TorusGeometry(0.045, 0.012, 6, 14), coralMat);
  rightBangle.position.set(0, -0.25, 0);
  rightBangle.rotation.x = Math.PI / 2;
  rightForearmJoint.add(rightBangle);

  // Sculpted Hand with Welcoming Open Palm Gesture
  const palmGeo = new BoxGeometry(0.065, 0.075, 0.024);
  const palm = new Mesh(palmGeo, skinMat);
  palm.name = 'Iya_RightHand';
  palm.position.set(0, -0.29, 0);
  rightForearmJoint.add(palm);

  // Defined Fingers (Four fingers + thumb)
  const fingerGeo = new CylinderGeometry(0.008, 0.007, 0.055, 6);
  for (let f = 0; f < 4; f++) {
    const finger = new Mesh(fingerGeo, skinMat);
    finger.position.set(-0.024 + f * 0.016, -0.34, 0);
    finger.rotation.z = (f - 1.5) * 0.05;
    rightForearmJoint.add(finger);
  }

  // Thumb
  const thumb = new Mesh(new CylinderGeometry(0.009, 0.008, 0.042, 6), skinMat);
  thumb.position.set(-0.038, -0.28, 0.015);
  thumb.rotation.set(0.3, 0, 0.6);
  rightForearmJoint.add(thumb);

  return root;
}
