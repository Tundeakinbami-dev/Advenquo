/**
 * Advenquo — InteractionManager.
 *
 * Centralized interaction handler for the living 3D world:
 * - Interactive Doors & Accessible Buildings (toggling open/closed, entering interiors)
 * - Market Stalls & Produce (inspecting yams, plantains, indigo dyeing vats)
 * - Cultural Artefacts & Relics (talking drum, adire cloth, calabash, oba staff, coral beads)
 * - Vehicles & Transit (Danfo buses, lagoon skiffs, railway shelters)
 * - Environmental Clues & Collectibles (manifest scrolls, lost consignment crates)
 * - Signposts & Directional Guides
 */

import type { InteractionEvent, DoorState } from './types.js';
import { saveSystem } from './save-system.js';

export class InteractionManager {
  private static instance: InteractionManager | null = null;
  private doorStates: Map<string, DoorState> = new Map();
  private onInteractionCallbacks: Array<(event: InteractionEvent) => void> = [];

  public static getInstance(): InteractionManager {
    if (!InteractionManager.instance) {
      InteractionManager.instance = new InteractionManager();
    }
    return InteractionManager.instance;
  }

  constructor() {
    // Initial door registry for accessible buildings
    this.registerDoor({
      doorId: 'door_market_storehouse',
      buildingName: 'Artisan Indigo Dye Storehouse',
      isOpen: false,
      openAngleDeg: 95,
      isLocked: false,
      locationId: 'nigerian_market',
    });

    this.registerDoor({
      doorId: 'door_tech_hub',
      buildingName: 'CcHUB Innovation Studio Interior',
      isOpen: false,
      openAngleDeg: 90,
      isLocked: false,
      locationId: 'lagos_urban',
    });

    this.registerDoor({
      doorId: 'door_palace_chamber',
      buildingName: 'Ancestral Royal Council Chamber',
      isOpen: false,
      openAngleDeg: 95,
      isLocked: false,
      locationId: 'heritage_iga',
    });

    this.registerDoor({
      doorId: 'door_coastal_hut',
      buildingName: 'Coastal Marine Research & Lifeguard Station',
      isOpen: false,
      openAngleDeg: 90,
      isLocked: false,
      locationId: 'beach_waterfront',
    });
  }

  public registerDoor(door: DoorState): void {
    this.doorStates.set(door.doorId, door);
  }

  public getDoorState(doorId: string): DoorState | undefined {
    return this.doorStates.get(doorId);
  }

  public toggleDoor(doorId: string): { isOpen: boolean; buildingName: string } {
    const door = this.doorStates.get(doorId);
    if (!door) {
      return { isOpen: false, buildingName: 'Building' };
    }

    door.isOpen = !door.isOpen;

    this.dispatchInteraction({
      entityId: doorId,
      name: door.buildingName,
      category: 'door',
      title: door.isOpen ? `🚪 Opened ${door.buildingName}` : `🚪 Closed ${door.buildingName}`,
      description: door.isOpen
        ? `The door swings open, allowing you to enter and explore the interior.`
        : `The door is pulled shut.`,
      actionTaken: door.isOpen ? 'door_opened' : 'door_closed',
    });

    return { isOpen: door.isOpen, buildingName: door.buildingName };
  }

  public handleEntityInteraction(entityId: string, objectName: string): InteractionEvent {
    let event: InteractionEvent;

    // 1. Doors & Buildings
    if (entityId.includes('door-') || entityId.startsWith('door_') || objectName.includes('InteractiveDoor')) {
      const doorId = entityId.replace('door-', 'door_');
      const outcome = this.toggleDoor(doorId);
      event = {
        entityId,
        name: outcome.buildingName,
        category: 'door',
        title: outcome.isOpen ? `🚪 Welcome inside ${outcome.buildingName}` : `🚪 Door Closed`,
        description: outcome.isOpen
          ? 'Step inside to explore the interior workstations and furnishings.'
          : 'You closed the entrance.',
      };
    }
    // 2. Vehicles
    else if (entityId === 'urban-danfo-bus' || objectName === 'UrbanDanfoBus') {
      event = {
        entityId,
        name: 'Iconic Lagos Danfo Minibus',
        category: 'vehicle',
        title: '🚌 Commercial Danfo Minibus (Volkswagen Transporter)',
        description: 'Ubiquitous canary-yellow bus with dual black stripes. Drivers and conductors move millions of Lagosians across bridges daily.',
        culturalInsight: 'Conductors call destinations with rhythmic slang and accept fares using specialized finger grips.',
      };
    } else if (entityId === 'fishing-canoe' || objectName === 'FishingCanoe') {
      event = {
        entityId,
        name: 'Handcrafted Wooden Fishing Canoe (Ọkọ̀)',
        category: 'vehicle',
        title: '🛶 Traditional Dugout Lagoon Canoe',
        description: 'Carved from African mahogany wood, used for artisanal cast-net fishing and shallow harbor passenger transit.',
        culturalInsight: 'Coastal fishing families navigate by celestial constellations and seasonal Gulf of Guinea tide patterns.',
      };
    }
    // 3. Cultural Artifacts
    else if (entityId === 'adire-cloth' || entityId === 'adire_cloth') {
      event = {
        entityId,
        name: 'Adire Eleko Cloth Panel',
        category: 'artifact',
        title: '🧵 Adire Indigo Resist-Dyed Textile',
        description: 'Pure cotton fabric patterned with geometric cassava starch resist motifs cured in natural indigo vats.',
        culturalInsight: 'Patterns record royal genealogies, proverbs of patience, and ocean blessings.',
      };
      saveSystem.recordArtifactDiscovered('adire-cloth');
    } else if (entityId === 'talking-drum' || entityId === 'talking_drum') {
      event = {
        entityId,
        name: 'Gángan Talking Drum',
        category: 'artifact',
        title: '🥁 Sacred Gángan Talking Drum',
        description: 'Hourglass tension drum tuned to mimic the three tonal pitch registers of the spoken Yoruba language.',
        culturalInsight: 'Drummers could broadcast poetry and news across neighboring towns before modern telecommunications.',
      };
      saveSystem.recordArtifactDiscovered('talking-drum');
    } else if (entityId === 'calabash') {
      event = {
        entityId,
        name: 'Carved Igba Calabash Bowl',
        category: 'artifact',
        title: '🏺 Pyrographic Etched Igba Gourd',
        description: 'Dried gourd carved with cosmic geometry representing heaven and earth in Yoruba philosophy.',
        culturalInsight: 'Used as an honored vessel for wedding gifts, palm wine, and ancestral offerings.',
      };
      saveSystem.recordArtifactDiscovered('calabash');
    } else if (entityId === 'kola-nut' || entityId === 'kola_nut') {
      event = {
        entityId,
        name: 'Sacred Obi Kola Nut',
        category: 'artifact',
        title: '🌱 Obi Àbàtà Blessing Nut',
        description: 'Multi-lobed caffeine-rich nut presented in a wooden dish as the supreme sign of welcome and hospitality.',
        culturalInsight: 'Proverb: "He who brings kola brings life." Dividing lobes invites mutual peace and long life.',
      };
      saveSystem.recordArtifactDiscovered('kola-nut');
    } else if (entityId === 'danfo-fare-box') {
      event = {
        entityId,
        name: 'Vintage Danfo Conductor Coin Box',
        category: 'artifact',
        title: '🚐 Danfo Conductor Fare Dispenser',
        description: 'Stamped metal coin box carrying old coins and transit tokens from decades of Lagos mobility.',
        culturalInsight: 'Represents the ingenuity and rapid hand-calculations of Lagos informal transit operators.',
      };
      saveSystem.recordArtifactDiscovered('danfo-fare-box');
    } else if (entityId === 'smart-iot-beacon') {
      event = {
        entityId,
        name: 'Yaba Solar IoT Environmental Sensor',
        category: 'artifact',
        title: '📡 Locally Engineered Solar IoT Telemetry Station',
        description: 'Solar-powered air quality and weather microcontroller designed and deployed by university student engineers.',
        culturalInsight: 'Highlights Nigeria’s young tech innovators applying open-source hardware to urban climate challenges.',
      };
      saveSystem.recordArtifactDiscovered('smart-iot-beacon');
    } else if (entityId === 'oba-staff') {
      event = {
        entityId,
        name: 'Ọpá Àṣẹ (Staff of Office)',
        category: 'artifact',
        title: '👑 Sacred Ọpá Àṣẹ: Royal Staff of Office',
        description: 'Hand-carved African mahogany sceptre with sterling silver crown finial symbolizing sovereign authority.',
        culturalInsight: 'Carried by the Oba of Lagos during ancestral state ceremonies and council decrees.',
      };
      saveSystem.recordArtifactDiscovered('oba-staff');
    } else if (entityId === 'royal-coral-necklace') {
      event = {
        entityId,
        name: 'Imperial Coral Bead Collar (Ìyùn)',
        category: 'artifact',
        title: '📿 Red Coral Bead Collar (Ìyùn)',
        description: 'Multi-strand cylindrical polished red coral beads with cast brass ceremonial clasp.',
        culturalInsight: 'Signifies endurance, dignity, and royal lineage across southern Nigerian kingdoms.',
      };
      saveSystem.recordArtifactDiscovered('royal-coral-necklace');
    } else if (entityId === 'sea-shell') {
      event = {
        entityId,
        name: 'Atlantic Giant Tun Marine Shell',
        category: 'artifact',
        title: '🐚 Atlantic Spiral Marine Shell',
        description: 'Iridescent spiral seashell harvested along the Tarkwa Bay coastal breakwater.',
        culturalInsight: 'Cowries and seashells historically functioned as recognized legal currency across coastal kingdoms.',
      };
      saveSystem.recordArtifactDiscovered('sea-shell');
    } else if (entityId === 'fresh-coconut') {
      event = {
        entityId,
        name: 'Chilled Coconut with Drinking Palm Straw',
        category: 'food_produce',
        title: '🥥 Natural Green Coconut (Àgbọn Tútù)',
        description: 'Freshly harvested tropical coconut offering refreshing natural electrolyte water beneath the palm trees.',
        culturalInsight: 'Coastal residents utilize every element: the water for health, the fronds for roofing, and husk fibers for rope.',
      };
      saveSystem.recordArtifactDiscovered('fresh-coconut');
    }
    // 4. Market Stalls & Food Products
    else if (entityId === 'market-props' || objectName === 'MarketProps') {
      event = {
        entityId,
        name: 'Fresh Market Harvest & Produce',
        category: 'food_produce',
        title: '🍠 Tubers of Yam, Plantains & Chili Peppers',
        description: 'Harvested from southwestern farms: white guinea yams, sweet yellow plantains, and fiery ata rodo chili peppers.',
        culturalInsight: 'The annual New Yam festival celebrates ancestral blessings of fertility and food security.',
      };
    }
    // 5. Landmarks
    else if (entityId === 'palace-throne-dais' || objectName === 'PalaceThroneDais') {
      event = {
        entityId,
        name: 'Royal Audience Throne & Bronze Leopards',
        category: 'building',
        title: '👑 Ceremonial Dais of the Oba of Lagos',
        description: 'Crimson velvet dais guarded by twin lost-wax Benin bronze leopards symbolizing royal vigilance.',
        culturalInsight: 'The Oba represents centuries of Yoruba diplomatic and cultural heritage.',
      };
    } else if (entityId === 'beach-cabana' || objectName === 'BeachCabana') {
      event = {
        entityId,
        name: 'Thatched Bamboo Beach Cabana',
        category: 'building',
        title: '🏖️ Communal Coastal Beach Shade',
        description: 'Woven bamboo posts with dried palm thatch roof offering shade from tropical sun.',
        culturalInsight: 'Communal rest spots where fishermen and visitors share stories and ocean breezes.',
      };
    }
    // 6. Tobi's Architectural World & Construction Site
    else if (entityId === 'architect-studio' || objectName.includes('ArchitectStudio')) {
      event = {
        entityId,
        name: 'Studio Kán Architectes',
        category: 'building',
        title: '📐 Studio Kán Architectes (Tobi’s Studio)',
        description: 'Slanted drafting tables hold pencil elevations, blueprint rolls, and the Eco-Terrace 3D scale maquette.',
        culturalInsight: 'Traditional Yoruba courtyards (Àtẹ́lẹwọ́) inspire modern bioclimatic architecture in Lagos.',
      };
    } else if (entityId === 'construction-site' || objectName.includes('ConstructionSite')) {
      event = {
        entityId,
        name: 'Eco-Terrace Construction Site',
        category: 'building',
        title: '🏗️ Eco-Terrace Active Construction Site',
        description: 'A bustling building site with yellow scaffolding, cement mixers, and curing concrete masonry blocks.',
        culturalInsight: 'LASPPPA enforces structural safety standards to eliminate substandard building materials.',
      };
    } else if (entityId === 'buka-restaurant' || objectName.includes('Buka')) {
      event = {
        entityId,
        name: 'Mama Nkechi’s Buka Canteen',
        category: 'food_produce',
        title: '🍲 Mama Nkechi’s Buka Canteen',
        description: 'Smoky firewood Jollof rice, Egusi soup, and golden fried plantain (Dodo) served on rustic wooden benches.',
        culturalInsight: 'Bukas are the communal dining room of Lagos, uniting people across all walks of life.',
      };
    } else if (entityId.includes('Pillar') || objectName.includes('DefectivePillar')) {
      event = {
        entityId,
        name: 'Defective Load-Bearing Pillar',
        category: 'artifact',
        title: '⚠️ Cracked Structural Column (Grade 32.5 Fracture)',
        description: 'Hairline diagonal stress cracks marked in red inspection chalk reveal substandard cement mix in this critical load-bearing column.',
        culturalInsight: 'Structural integrity is the ethical foundation of engineering; catching defects before upper slab pours saves lives.',
      };
    }
    // Default fallback
    else {
      event = {
        entityId,
        name: objectName || entityId,
        category: 'signboard',
        title: `📍 ${objectName || entityId}`,
        description: 'An interactive landmark in the environment.',
      };
    }

    this.dispatchInteraction(event);
    return event;
  }

  public onInteraction(callback: (event: InteractionEvent) => void): () => void {
    this.onInteractionCallbacks.push(callback);
    return () => {
      const idx = this.onInteractionCallbacks.indexOf(callback);
      if (idx !== -1) this.onInteractionCallbacks.splice(idx, 1);
    };
  }

  private dispatchInteraction(event: InteractionEvent): void {
    for (const cb of this.onInteractionCallbacks) {
      cb(event);
    }
  }
}

export const interactionManager = InteractionManager.getInstance();
