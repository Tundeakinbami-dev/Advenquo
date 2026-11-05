/**
 * Advenquo — Yaba Solar IoT Environmental Sensor Beacon procedural 3D asset.
 *
 * Microcontroller weather/air-quality sensor assembled in Yaba:
 * - Weatherproof 3D-printed enclosure box
 * - Mini photovoltaic solar cell on top
 * - Sensor probe tubes (PM2.5 particulate, humidity, temperature)
 * - Blinking status LED indicator
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

export function buildSmartIotBeacon(): Object3D {
  const root = new Object3D();
  root.name = 'SmartIotBeacon';

  // Materials
  const enclosureMat = new MeshStandardMaterial({
    color: 0x37474f, // Durable grey ASA casing
    roughness: 0.5,
  });

  const solarMat = new MeshStandardMaterial({
    color: 0x0d47a1, // Monocrystalline solar chip
    metalness: 0.8,
    roughness: 0.2,
  });

  const ledMat = new MeshStandardMaterial({
    color: 0x00e676, // Active green telemetry LED
    emissive: 0x00e676,
    emissiveIntensity: 0.8,
    roughness: 0.1,
  });

  const antennaMat = new MeshStandardMaterial({
    color: 0x212121,
    metalness: 0.9,
    roughness: 0.3,
  });

  // 1. Enclosure Box
  const boxGeo = new BoxGeometry(0.18, 0.22, 0.1);
  const box = new Mesh(boxGeo, enclosureMat);
  box.position.set(0, 0.11, 0);
  root.add(box);

  // 2. Angled Mini Solar Panel on Top
  const solarGeo = new BoxGeometry(0.16, 0.015, 0.14);
  const solar = new Mesh(solarGeo, solarMat);
  solar.rotation.x = -0.3;
  solar.position.set(0, 0.24, 0.02);
  root.add(solar);

  // 3. Telemetry Blinking LED
  const ledGeo = new CylinderGeometry(0.01, 0.01, 0.02, 8);
  const led = new Mesh(ledGeo, ledMat);
  led.rotation.x = Math.PI / 2;
  led.position.set(0.05, 0.14, 0.055);
  root.add(led);

  // 4. LoRa Wireless Antenna
  const antGeo = new CylinderGeometry(0.006, 0.006, 0.25, 8);
  const ant = new Mesh(antGeo, antennaMat);
  ant.position.set(-0.06, 0.32, -0.02);
  root.add(ant);

  return root;
}
