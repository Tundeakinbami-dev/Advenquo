/**
 * Advenquo: Construction World — Procedural Component 3D Factory
 *
 * Constructs realistic Three.js Object3D visual representations:
 * - Hybrid appearance: LEGO-like modular interlocking studs/sockets combined
 *   with authentic Nigerian architectural materials (terracotta clay, aggregate
 *   cured concrete, steel rebar, and weathered corrugated zinc).
 * - Deterministic and parentless: safe for dual JS realm evaluation.
 * - Imports Three.js strictly from `@iwsdk/core`.
 */

import {
  BoxGeometry,
  CylinderGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
} from '@iwsdk/core';

import type { ComponentType } from '../core/construction-types.js';
import { CONSTRUCTION_CATALOG, getComponentSpec } from './construction-catalog.js';

export function createComponentMesh(type: ComponentType): Object3D {
  const spec = getComponentSpec(type);
  const root = new Object3D();
  root.name = `ConstructionMesh_${type}`;

  const [w, h, d] = spec.dimensions;
  const p = spec.material;

  const mainMat = new MeshStandardMaterial({
    color: p.colorHex,
    roughness: p.roughness,
    metalness: p.metalness,
  });

  // Highlight/socket material for modular connectors
  const studMat = new MeshStandardMaterial({
    color: p.colorHex,
    roughness: Math.max(0.2, p.roughness - 0.15),
    metalness: Math.min(1.0, p.metalness + 0.1),
  });

  switch (type) {
    case 'clay_brick': {
      // 1. Brick base
      const body = new Mesh(new BoxGeometry(w, h, d), mainMat);
      body.castShadow = true;
      body.receiveShadow = true;
      root.add(body);

      // 2. Modular interlocking studs on top (LEGO-like connection mechanics)
      const studGeo = new CylinderGeometry(0.024, 0.024, 0.016, 12);
      const stud1 = new Mesh(studGeo, studMat);
      stud1.position.set(-0.06, h / 2 + 0.008, 0);
      stud1.castShadow = true;
      root.add(stud1);

      const stud2 = new Mesh(studGeo, studMat);
      stud2.position.set(0.06, h / 2 + 0.008, 0);
      stud2.castShadow = true;
      root.add(stud2);
      break;
    }

    case 'sandcrete_block': {
      // 1. Sandcrete hollow masonry unit body
      const body = new Mesh(new BoxGeometry(w, h, d), mainMat);
      body.castShadow = true;
      body.receiveShadow = true;
      root.add(body);

      // 2. Studs on top
      const studGeo = new CylinderGeometry(0.032, 0.032, 0.02, 12);
      const studL = new Mesh(studGeo, studMat);
      studL.position.set(-0.11, h / 2 + 0.01, 0);
      root.add(studL);

      const studR = new Mesh(studGeo, studMat);
      studR.position.set(0.11, h / 2 + 0.01, 0);
      root.add(studR);
      break;
    }

    case 'concrete_block': {
      // 1. Hollow-core cinder block outer shell
      const body = new Mesh(new BoxGeometry(w, h, d), mainMat);
      body.castShadow = true;
      body.receiveShadow = true;
      root.add(body);

      // 2. Modular alignment studs on top
      const studGeo = new CylinderGeometry(0.035, 0.035, 0.02, 16);
      const studL = new Mesh(studGeo, studMat);
      studL.position.set(-0.1, h / 2 + 0.01, 0);
      studL.castShadow = true;
      root.add(studL);

      const studR = new Mesh(studGeo, studMat);
      studR.position.set(0.1, h / 2 + 0.01, 0);
      studR.castShadow = true;
      root.add(studR);

      // 3. Hollow core indentation indicators (dark recesses)
      const holeMat = new MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.95,
      });
      const holeL = new Mesh(new BoxGeometry(0.12, 0.005, 0.12), holeMat);
      holeL.position.set(-0.1, h / 2 + 0.001, 0);
      root.add(holeL);

      const holeR = new Mesh(new BoxGeometry(0.12, 0.005, 0.12), holeMat);
      holeR.position.set(0.1, h / 2 + 0.001, 0);
      root.add(holeR);
      break;
    }

    case 'foundation_block': {
      // Massive footing pad
      const footing = new Mesh(new BoxGeometry(w, h, d), mainMat);
      footing.castShadow = true;
      footing.receiveShadow = true;
      root.add(footing);

      // Central socket ring
      const ringGeo = new CylinderGeometry(0.12, 0.14, 0.04, 16);
      const ring = new Mesh(ringGeo, studMat);
      ring.position.set(0, h / 2 + 0.02, 0);
      root.add(ring);
      break;
    }

    case 'timber_piece': {
      // Hardwood batten
      const batten = new Mesh(new BoxGeometry(w, h, d), mainMat);
      batten.castShadow = true;
      batten.receiveShadow = true;
      root.add(batten);
      break;
    }

    case 'rebar': {
      // Ribbed rebar cylinder
      const rod = new Mesh(new CylinderGeometry(w / 2, w / 2, h, 8), mainMat);
      rod.castShadow = true;
      root.add(rod);
      break;
    }

    case 'steel_connector': {
      // 3D Gusset plate bracket
      const gusset = new Mesh(new BoxGeometry(w, h, d), mainMat);
      gusset.castShadow = true;
      root.add(gusset);
      break;
    }

    case 'reinforced_column':
    case 'column': {
      // 1. Main vertical concrete shaft
      const shaft = new Mesh(new BoxGeometry(w, h, d), mainMat);
      shaft.castShadow = true;
      shaft.receiveShadow = true;
      root.add(shaft);

      // 2. Base footing pad
      const footingMat = new MeshStandardMaterial({
        color: 0x5a5a5a,
        roughness: 0.9,
      });
      const footing = new Mesh(new BoxGeometry(w * 1.15, 0.08, d * 1.15), footingMat);
      footing.position.set(0, -h / 2 + 0.04, 0);
      root.add(footing);

      // 3. Top load-bearing beam saddle plate
      const saddleMat = new MeshStandardMaterial({
        color: 0x444444,
        metalness: 0.6,
        roughness: 0.4,
      });
      const saddle = new Mesh(new BoxGeometry(w * 1.1, 0.06, d * 1.1), saddleMat);
      saddle.position.set(0, h / 2 - 0.03, 0);
      root.add(saddle);

      // 4. Exposed rebar dowel pins on top for interlocking beam seats
      const rebarGeo = new CylinderGeometry(0.012, 0.012, 0.08, 8);
      const rebarMat = new MeshStandardMaterial({
        color: 0x2e2e2e,
        metalness: 0.8,
        roughness: 0.3,
      });
      const pinL = new Mesh(rebarGeo, rebarMat);
      pinL.position.set(-0.08, h / 2 + 0.04, 0);
      root.add(pinL);

      const pinR = new Mesh(rebarGeo, rebarMat);
      pinR.position.set(0.08, h / 2 + 0.04, 0);
      root.add(pinR);
      break;
    }

    case 'horizontal_beam':
    case 'beam': {
      // 1. Prestressed concrete beam body
      const body = new Mesh(new BoxGeometry(w, h, d), mainMat);
      body.castShadow = true;
      body.receiveShadow = true;
      root.add(body);

      // 2. Left & right bearing pad sockets (for columns/walls)
      const padMat = new MeshStandardMaterial({
        color: 0x3d3d3d,
        metalness: 0.5,
        roughness: 0.5,
      });
      const padLeft = new Mesh(new BoxGeometry(0.32, 0.04, d * 1.05), padMat);
      padLeft.position.set(-0.85, -h / 2 + 0.02, 0);
      root.add(padLeft);

      const padRight = new Mesh(new BoxGeometry(0.32, 0.04, d * 1.05), padMat);
      padRight.position.set(0.85, -h / 2 + 0.02, 0);
      root.add(padRight);

      // 3. Top deck anchor studs for roof and upper masonry
      const studGeo = new CylinderGeometry(0.028, 0.028, 0.025, 12);
      for (const x of [-0.6, 0, 0.6]) {
        const stud = new Mesh(studGeo, studMat);
        stud.position.set(x, h / 2 + 0.012, 0);
        stud.castShadow = true;
        root.add(stud);
      }
      break;
    }

    case 'floor_component':
    case 'floor_slab': {
      // 1. Flat deck slab
      const slab = new Mesh(new BoxGeometry(w, h, d), mainMat);
      slab.castShadow = true;
      slab.receiveShadow = true;
      root.add(slab);

      // 2. Surface tile / screed markings
      const grooveMat = new MeshStandardMaterial({
        color: 0x707070,
        roughness: 0.95,
      });
      const jointX = new Mesh(new BoxGeometry(w * 0.98, 0.005, 0.015), grooveMat);
      jointX.position.set(0, h / 2 + 0.002, 0);
      root.add(jointX);

      const jointZ = new Mesh(new BoxGeometry(0.015, 0.005, d * 0.98), grooveMat);
      jointZ.position.set(0, h / 2 + 0.002, 0);
      root.add(jointZ);
      break;
    }

    case 'wall_panel': {
      // 1. Infill wall panel
      const panel = new Mesh(new BoxGeometry(w, h, d), mainMat);
      panel.castShadow = true;
      panel.receiveShadow = true;
      root.add(panel);

      // 2. Modular perimeter frame reinforcement
      const frameMat = new MeshStandardMaterial({
        color: 0x5e6366,
        roughness: 0.8,
        metalness: 0.2,
      });
      const frameTop = new Mesh(new BoxGeometry(w, 0.08, d * 1.05), frameMat);
      frameTop.position.set(0, h / 2 - 0.04, 0);
      root.add(frameTop);

      const frameBottom = new Mesh(new BoxGeometry(w, 0.08, d * 1.05), frameMat);
      frameBottom.position.set(0, -h / 2 + 0.04, 0);
      root.add(frameBottom);
      break;
    }

    case 'staircase': {
      // Tiered stepped structure
      const steps = 8;
      const stepH = h / steps;
      const stepD = d / steps;
      for (let i = 0; i < steps; i++) {
        const step = new Mesh(
          new BoxGeometry(w, stepH * (i + 1), stepD),
          mainMat
        );
        const yPos = -h / 2 + (stepH * (i + 1)) / 2;
        const zPos = -d / 2 + (i + 0.5) * stepD;
        step.position.set(0, yPos, zPos);
        step.castShadow = true;
        root.add(step);
      }
      break;
    }

    case 'door_frame': {
      // Outer portal jambs & lintel
      const jambGeo = new BoxGeometry(0.1, h, d);
      const leftJamb = new Mesh(jambGeo, mainMat);
      leftJamb.position.set(-w / 2 + 0.05, 0, 0);
      root.add(leftJamb);

      const rightJamb = new Mesh(jambGeo, mainMat);
      rightJamb.position.set(w / 2 - 0.05, 0, 0);
      root.add(rightJamb);

      const topLintel = new Mesh(new BoxGeometry(w, 0.1, d), mainMat);
      topLintel.position.set(0, h / 2 - 0.05, 0);
      root.add(topLintel);
      break;
    }

    case 'window_frame': {
      // Rectangular casing with glass pane
      const frameGeo = new BoxGeometry(0.08, h, d);
      const leftF = new Mesh(frameGeo, mainMat);
      leftF.position.set(-w / 2 + 0.04, 0, 0);
      root.add(leftF);

      const rightF = new Mesh(frameGeo, mainMat);
      rightF.position.set(w / 2 - 0.04, 0, 0);
      root.add(rightF);

      const topF = new Mesh(new BoxGeometry(w, 0.08, d), mainMat);
      topF.position.set(0, h / 2 - 0.04, 0);
      root.add(topF);

      const btmF = new Mesh(new BoxGeometry(w, 0.08, d), mainMat);
      btmF.position.set(0, -h / 2 + 0.04, 0);
      root.add(btmF);

      // Glass pane
      const glassMat = new MeshStandardMaterial({
        color: 0x90caf9,
        transparent: true,
        opacity: 0.45,
        roughness: 0.1,
        metalness: 0.9,
      });
      const glass = new Mesh(new BoxGeometry(w - 0.1, h - 0.1, 0.02), glassMat);
      root.add(glass);
      break;
    }

    case 'roof_truss': {
      // Triangle King-Post Truss
      const bottomChord = new Mesh(new BoxGeometry(w, 0.1, d), mainMat);
      bottomChord.position.set(0, -h / 2 + 0.05, 0);
      root.add(bottomChord);

      const kingPost = new Mesh(new BoxGeometry(0.1, h, d), mainMat);
      kingPost.position.set(0, 0, 0);
      root.add(kingPost);
      break;
    }

    case 'roof_panel': {
      // 1. Base corrugated zinc sheet
      const sheet = new Mesh(new BoxGeometry(w, 0.03, d), mainMat);
      sheet.castShadow = true;
      sheet.receiveShadow = true;
      root.add(sheet);

      // 2. Corrugation ridges
      const ridgeMat = new MeshStandardMaterial({
        color: 0x607d8b,
        metalness: 0.7,
        roughness: 0.5,
      });
      const numRidges = 8;
      const ridgeSpacing = (w - 0.1) / numRidges;
      const ridgeGeo = new BoxGeometry(0.035, 0.025, d * 0.98);

      for (let i = 0; i <= numRidges; i++) {
        const rx = -w / 2 + 0.05 + i * ridgeSpacing;
        const ridge = new Mesh(ridgeGeo, ridgeMat);
        ridge.position.set(rx, 0.02, 0);
        ridge.castShadow = true;
        root.add(ridge);
      }

      // 3. Timber underside purlins/rafters
      const timberMat = new MeshStandardMaterial({
        color: 0x5d4037, // African Iroko / Teak rafter timber
        roughness: 0.85,
      });
      const purlinFront = new Mesh(new BoxGeometry(w * 0.95, 0.06, 0.08), timberMat);
      purlinFront.position.set(0, -0.04, -d / 3);
      root.add(purlinFront);

      const purlinBack = new Mesh(new BoxGeometry(w * 0.95, 0.06, 0.08), timberMat);
      purlinBack.position.set(0, -0.04, d / 3);
      root.add(purlinBack);
      break;
    }

    case 'bridge_section': {
      // Heavy segmental box girder
      const girder = new Mesh(new BoxGeometry(w, h, d), mainMat);
      girder.castShadow = true;
      girder.receiveShadow = true;
      root.add(girder);

      // Side parapet safety barriers
      const barrierMat = new MeshStandardMaterial({
        color: 0x78909c,
        roughness: 0.6,
      });
      const barrierL = new Mesh(new BoxGeometry(w, 0.25, 0.1), barrierMat);
      barrierL.position.set(0, h / 2 + 0.125, -d / 2 + 0.05);
      root.add(barrierL);

      const barrierR = new Mesh(new BoxGeometry(w, 0.25, 0.1), barrierMat);
      barrierR.position.set(0, h / 2 + 0.125, d / 2 - 0.05);
      root.add(barrierR);
      break;
    }
  }

  return root;
}
