/**
 * Advenquo — Studio Kán Architectes Interior procedural 3D asset.
 *
 * Tobi's architecture studio in Yaba:
 * - Room floor with polished studio timber planks
 * - Interior gallery walls with framed architectural elevations & concept sketches
 * - Large angled wooden drafting table with blueprint rolls, T-square ruler, and drafting lamp
 * - Central display plinth with 3D architectural scale model (sustainable community hub)
 * - Workstation desk with CAD floor plan screen and specification binders
 * - Vertical blueprint storage cylinder and drafting stool
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

export function buildArchitectStudio(): Object3D {
  const root = new Object3D();
  root.name = 'ArchitectStudioInterior';

  // Realistic PBR Materials
  const floorMat = pbrMaterialSystem.getMaterial('african_iroko', {
    color: 0xc8a27a, // Light polished timber planks
    roughness: 0.45,
  });

  const wallMat = pbrMaterialSystem.getMaterial('cured_concrete', {
    color: 0xf5f5f0, // Architectural studio gallery white
    roughness: 0.85,
  });

  const woodDraftMat = pbrMaterialSystem.getMaterial('african_iroko', {
    color: 0x8d5b38, // Rich teak drafting desk wood
    roughness: 0.5,
  });

  const paperBlueprintMat = new MeshStandardMaterial({
    color: 0x1a3a60, // Classic cyan blueprint paper
    roughness: 0.7,
  });

  const paperWhiteMat = new MeshStandardMaterial({
    color: 0xfdfdfd,
    roughness: 0.9,
  });

  const brassRulerMat = new MeshStandardMaterial({
    color: 0xd4af37, // Polished brass T-square
    metalness: 0.8,
    roughness: 0.3,
  });

  const metalDarkMat = new MeshStandardMaterial({
    color: 0x2e3440,
    metalness: 0.6,
    roughness: 0.4,
  });

  const maquetteWoodMat = new MeshStandardMaterial({
    color: 0xd7ccc8, // Balsa wood model material
    roughness: 0.6,
  });

  const screenCadMat = new MeshStandardMaterial({
    color: 0x102a43,
    emissive: 0x1939b7,
    emissiveIntensity: 0.5,
    roughness: 0.2,
  });

  // 1. Room Floor (Walkable 5.2m x 5.2m)
  const floorGeo = new BoxGeometry(5.2, 0.1, 5.2);
  const floor = new Mesh(floorGeo, floorMat);
  floor.position.set(0, -0.05, 0);
  floor.receiveShadow = true;
  root.add(floor);

  // 2. Interior Walls
  // Back wall (Z = -2.6)
  const backWall = new Mesh(new BoxGeometry(5.2, 3.0, 0.12), wallMat);
  backWall.position.set(0, 1.5, -2.6);
  root.add(backWall);

  // Left wall (X = -2.6)
  const leftWall = new Mesh(new BoxGeometry(0.12, 3.0, 5.2), wallMat);
  leftWall.position.set(-2.6, 1.5, 0);
  root.add(leftWall);

  // Right wall (X = 2.6)
  const rightWall = new Mesh(new BoxGeometry(0.12, 3.0, 5.2), wallMat);
  rightWall.position.set(2.6, 1.5, 0);
  root.add(rightWall);

  // 3. Tobi's Slanted Drafting Table (Left side, X = -1.3, Z = -1.2)
  const deskTop = new Mesh(new BoxGeometry(1.5, 0.05, 1.0), woodDraftMat);
  deskTop.rotation.x = 0.25; // Ergonomic 15-degree drafting tilt
  deskTop.position.set(-1.3, 1.05, -1.2);
  root.add(deskTop);

  // Desk frame legs
  const legGeo = new CylinderGeometry(0.025, 0.025, 0.95);
  for (let dx of [-0.65, 0.65]) {
    for (let dz of [-0.4, 0.4]) {
      const leg = new Mesh(legGeo, metalDarkMat);
      leg.position.set(-1.3 + dx, 0.48, -1.2 + dz);
      root.add(leg);
    }
  }

  // Large Blueprint on table
  const blueprintSheet = new Mesh(new BoxGeometry(1.2, 0.008, 0.8), paperBlueprintMat);
  blueprintSheet.rotation.x = 0.25;
  blueprintSheet.position.set(-1.3, 1.08, -1.2);
  root.add(blueprintSheet);

  // T-Square ruler along blueprint
  const tSquare = new Mesh(new BoxGeometry(1.0, 0.012, 0.05), brassRulerMat);
  tSquare.rotation.x = 0.25;
  tSquare.position.set(-1.3, 1.1, -1.1);
  root.add(tSquare);

  // 4. Central Architectural Maquette Table (Center-Right, X = 0.8, Z = -0.8)
  const plinth = new Mesh(new BoxGeometry(1.1, 0.75, 1.1), metalDarkMat);
  plinth.position.set(0.8, 0.375, -0.8);
  root.add(plinth);

  // 3D Building Model (Sustainable pavilion with stepped roof & timber columns)
  const modelBase = new Mesh(new BoxGeometry(0.9, 0.03, 0.9), paperWhiteMat);
  modelBase.position.set(0.8, 0.77, -0.8);
  root.add(modelBase);

  const modelBuilding = new Mesh(new BoxGeometry(0.65, 0.25, 0.55), maquetteWoodMat);
  modelBuilding.position.set(0.8, 0.91, -0.8);
  root.add(modelBuilding);

  const modelRoof = new Mesh(new BoxGeometry(0.75, 0.03, 0.65), woodDraftMat);
  modelRoof.position.set(0.8, 1.05, -0.8);
  modelRoof.rotation.z = 0.08;
  root.add(modelRoof);

  // 5. Workstation / CAD Computer Desk (X = 1.4, Z = 1.0)
  const cadDesk = new Mesh(new BoxGeometry(1.4, 0.06, 0.7), metalDarkMat);
  cadDesk.position.set(1.4, 0.75, 1.0);
  root.add(cadDesk);

  const monitor = new Mesh(new BoxGeometry(0.7, 0.42, 0.04), screenCadMat);
  monitor.position.set(1.4, 1.06, 1.15);
  root.add(monitor);

  const monitorStand = new Mesh(new CylinderGeometry(0.03, 0.06, 0.16), metalDarkMat);
  monitorStand.position.set(1.4, 0.86, 1.15);
  root.add(monitorStand);

  // 6. Rolled Blueprint Storage Cylinder (X = -2.1, Z = -2.0)
  const bin = new Mesh(new CylinderGeometry(0.2, 0.18, 0.6, 16), metalDarkMat);
  bin.position.set(-2.1, 0.3, -2.0);
  root.add(bin);

  const rollGeo = new CylinderGeometry(0.035, 0.035, 0.75);
  for (let i = 0; i < 4; i++) {
    const rollMat = i % 2 === 0 ? paperBlueprintMat : paperWhiteMat;
    const roll = new Mesh(rollGeo, rollMat);
    roll.position.set(-2.1 + (i - 1.5) * 0.06, 0.5, -2.0 + ((i % 2) - 0.5) * 0.06);
    roll.rotation.z = (i - 1.5) * 0.12;
    root.add(roll);
  }

  // 7. Pinned Concept Sketches on Wall
  const sketch1 = new Mesh(new BoxGeometry(0.8, 0.6, 0.01), paperWhiteMat);
  sketch1.position.set(-1.3, 2.0, -2.53);
  root.add(sketch1);

  const sketch2 = new Mesh(new BoxGeometry(0.6, 0.75, 0.01), paperBlueprintMat);
  sketch2.position.set(-0.3, 1.9, -2.53);
  root.add(sketch2);

  return root;
}
