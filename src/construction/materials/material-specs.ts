/**
 * Advenquo: Construction World — Material Physical Specifications
 *
 * Defines realistic physical material attributes for engineering validation:
 * density, compressive & tensile strength, friction, restitution, and visual PBR hints.
 */

import type { MaterialPhysicalProperties } from '../core/construction-types.js';
import { CONSTRUCTION_CONSTANTS } from '../core/constants.js';

export const MATERIAL_SPECS: Record<string, MaterialPhysicalProperties> = {
  terracotta_clay: {
    name: 'Kiln-Fired Clay Brick',
    densityKgM3: CONSTRUCTION_CONSTANTS.DENSITY_CLAY_BRICK,
    compressiveStrengthMpa: 18.0, // High compressive strength
    tensileStrengthMpa: 1.8, // Low tensile strength (requires mortar/studs)
    friction: 0.75,
    restitution: 0.12,
    colorHex: 0xbf4d28, // Warm Nigerian earthenware terracotta red
    roughness: 0.88,
    metalness: 0.05,
  },

  aggregate_concrete_block: {
    name: 'Cured Aggregate Concrete Block',
    densityKgM3: CONSTRUCTION_CONSTANTS.DENSITY_CONCRETE_BLOCK,
    compressiveStrengthMpa: 22.0,
    tensileStrengthMpa: 2.2,
    friction: 0.8,
    restitution: 0.1,
    colorHex: 0x8a8d8f, // Weathered mineral grey
    roughness: 0.9,
    metalness: 0.05,
  },

  sandcrete: {
    name: 'Standard Sandcrete Masonry Block',
    densityKgM3: 1900.0,
    compressiveStrengthMpa: 7.5,
    tensileStrengthMpa: 0.75,
    friction: 0.85,
    restitution: 0.08,
    colorHex: 0xc4b79b, // Warm sand-cement sandstone tint
    roughness: 0.95,
    metalness: 0.02,
  },

  reinforced_structural_concrete: {
    name: 'Grade 35 Reinforced Concrete with Rebar',
    densityKgM3: CONSTRUCTION_CONSTANTS.DENSITY_REINFORCED_CONCRETE,
    compressiveStrengthMpa: 35.0,
    tensileStrengthMpa: 280.0, // Steel rebar takes tensile & bending loads
    friction: 0.7,
    restitution: 0.15,
    colorHex: 0x9e9e9e, // Engineering grey with subtle aggregate flecks
    roughness: 0.75,
    metalness: 0.15,
  },

  foundation_heavy_concrete: {
    name: 'Grade 40 Foundation Mass Concrete',
    densityKgM3: 2500.0,
    compressiveStrengthMpa: 40.0,
    tensileStrengthMpa: 4.0,
    friction: 0.88,
    restitution: 0.05,
    colorHex: 0x6e7072, // Heavy dark granite aggregate
    roughness: 0.92,
    metalness: 0.05,
  },

  hardwood_timber: {
    name: 'Seasoned Structural Hardwood Timber',
    densityKgM3: 750.0,
    compressiveStrengthMpa: 45.0,
    tensileStrengthMpa: 75.0,
    friction: 0.65,
    restitution: 0.3,
    colorHex: 0x8d5b4c, // Rich grain Iroko / Mahogany timber
    roughness: 0.7,
    metalness: 0.0,
  },

  structural_steel: {
    name: 'Grade 500 High-Yield Structural Steel',
    densityKgM3: 7850.0,
    compressiveStrengthMpa: 500.0,
    tensileStrengthMpa: 550.0,
    friction: 0.5,
    restitution: 0.25,
    colorHex: 0x37474f, // Industrial blackened steel with zinc galvanization
    roughness: 0.45,
    metalness: 0.85,
  },

  corrugated_zinc_roofing: {
    name: 'Weathered Corrugated Zinc Roofing Composite',
    densityKgM3: 1800.0, // Composite panel density including timber battens
    compressiveStrengthMpa: 12.0,
    tensileStrengthMpa: 140.0,
    friction: 0.55,
    restitution: 0.2,
    colorHex: 0x78909c, // Weathered tropical blue-grey zinc with oxide patina
    roughness: 0.65,
    metalness: 0.6,
  },

  precast_deck_concrete: {
    name: 'High-Density Precast Deck Concrete',
    densityKgM3: 2400.0,
    compressiveStrengthMpa: 30.0,
    tensileStrengthMpa: 25.0,
    friction: 0.8,
    restitution: 0.1,
    colorHex: 0xa0a0a0,
    roughness: 0.8,
    metalness: 0.08,
  },

  architectural_glazing_frame: {
    name: 'Anodized Aluminum Frame with Tempered Glass',
    densityKgM3: 2200.0,
    compressiveStrengthMpa: 150.0,
    tensileStrengthMpa: 80.0,
    friction: 0.4,
    restitution: 0.1,
    colorHex: 0x263238, // Dark slate powder-coated extrusion
    roughness: 0.3,
    metalness: 0.7,
  },

  plaster_finish: {
    name: 'Mineral Stucco & Hydraulic Plaster',
    densityKgM3: 1600.0,
    compressiveStrengthMpa: 10.0,
    tensileStrengthMpa: 1.5,
    friction: 0.7,
    restitution: 0.05,
    colorHex: 0xf1f5f9, // Smooth architectural off-white
    roughness: 0.9,
    metalness: 0.02,
  },

  ceramic_tile: {
    name: 'Vitrified Ceramic Floor Tile',
    densityKgM3: 2300.0,
    compressiveStrengthMpa: 60.0,
    tensileStrengthMpa: 15.0,
    friction: 0.6,
    restitution: 0.15,
    colorHex: 0xcbd5e1, // Cool architectural tile grey
    roughness: 0.25,
    metalness: 0.1,
  },

  decorative_brass: {
    name: 'Architectural Cast Brass Trim',
    densityKgM3: 8400.0,
    compressiveStrengthMpa: 250.0,
    tensileStrengthMpa: 300.0,
    friction: 0.45,
    restitution: 0.2,
    colorHex: 0xd4af37, // Rich metallic satin gold / brass
    roughness: 0.35,
    metalness: 0.85,
  },
};
