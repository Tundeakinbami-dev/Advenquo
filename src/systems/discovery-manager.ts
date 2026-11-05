/**
 * Advenquo — DiscoveryManager.
 *
 * Coordinates cultural discoveries across all 4 Nigerian environments:
 * - Traditional Market: Adire cloth, Gángan talking drum, Igba calabash, Obì kola nut
 * - Lagos Urban: Danfo conductor fare box, Yaba solar IoT environmental sensor
 * - Royal Palace: Ọpá Àṣẹ (Staff of office), Imperial coral collar (Ìyùn)
 * - Tarkwa Bay: Atlantic spiral sea shell, Chilled drinking coconut
 *
 * Awards XP, unlocks passport stamps, and adds detailed cultural journal insights.
 */

import { saveSystem } from './save-system.js';
import { playerProgression } from './player-progression.js';
import { locationManager } from './location-manager.js';
import type { LocationArtifactDef } from '../world/location-types.js';

export interface DiscoveryFact {
  id: string;
  title: string;
  localName: string;
  icon: string;
  description: string;
  culturalSignificance: string;
  locationId: string;
}

export class DiscoveryManager {
  private static instance: DiscoveryManager | null = null;
  private discoveredArtifactIds: Set<string> = new Set();
  private onDiscoveryCallbacks: Array<(fact: DiscoveryFact) => void> = [];

  public static getInstance(): DiscoveryManager {
    if (!DiscoveryManager.instance) {
      DiscoveryManager.instance = new DiscoveryManager();
    }
    return DiscoveryManager.instance;
  }

  constructor() {
    // Restore discovered artifacts
    const state = saveSystem.getRawState();
    for (const item of state.passport.stamps) {
      if (item.category === 'artifact' || item.category === 'geography') {
        this.discoveredArtifactIds.add(item.id.replace('stamp_', ''));
      }
    }
  }

  public discoverArtifact(artifactId: string): { isNew: boolean; fact?: DiscoveryFact } {
    const isNew = !this.discoveredArtifactIds.has(artifactId);
    this.discoveredArtifactIds.add(artifactId);
    saveSystem.recordArtifactDiscovered(artifactId);

    // Locate artifact details from location catalog
    let foundArtifact: LocationArtifactDef | undefined;
    let foundLocationId = '';

    for (const loc of locationManager.getAllPlayableLocations()) {
      const art = loc.artifacts.find((a) => a.id === artifactId);
      if (art) {
        foundArtifact = art;
        foundLocationId = loc.id;
        break;
      }
    }

    if (foundArtifact) {
      const fact: DiscoveryFact = {
        id: foundArtifact.id,
        title: foundArtifact.name,
        localName: foundArtifact.localName || foundArtifact.name,
        icon: foundArtifact.icon,
        description: foundArtifact.description,
        culturalSignificance: foundArtifact.culturalFact,
        locationId: foundLocationId,
      };

      if (isNew) {
        // Award XP and passport stamp
        playerProgression.addXP(100);
        playerProgression.advanceSkill('culturalInterpretation', 10);
        playerProgression.awardStamp({
          id: `stamp_${foundArtifact.id}`,
          name: foundArtifact.name,
          category: 'artifact',
          destinationId: 'nigeria',
          districtId: foundLocationId,
          icon: foundArtifact.icon,
          unlockedAt: new Date().toISOString(),
          description: foundArtifact.culturalFact,
        });
        playerProgression.recordJournalEntry({
          id: `journal_${foundArtifact.id}`,
          title: foundArtifact.name,
          category: 'Cultural Artefact',
          summary: foundArtifact.description,
          verifiedFact: foundArtifact.culturalFact,
          sourceAttribution: 'Indigenous Guild Elders & Lagos State Historical Records',
          discoveredAt: new Date().toISOString(),
        });
      }

      for (const cb of this.onDiscoveryCallbacks) {
        cb(fact);
      }

      return { isNew, fact };
    }

    return { isNew };
  }

  public isArtifactDiscovered(artifactId: string): boolean {
    return this.discoveredArtifactIds.has(artifactId);
  }

  public getTotalDiscoveredCount(): number {
    return this.discoveredArtifactIds.size;
  }

  public getDiscoveredCountForLocation(locationId?: string): { discovered: number; total: number } {
    const loc = locationManager.getLocationById(locationId || locationManager.getActiveLocationId());
    if (!loc) return { discovered: 0, total: 0 };

    let count = 0;
    for (const art of loc.artifacts) {
      if (this.discoveredArtifactIds.has(art.id)) {
        count++;
      }
    }
    return { discovered: count, total: loc.artifacts.length };
  }

  public onDiscovery(callback: (fact: DiscoveryFact) => void): () => void {
    this.onDiscoveryCallbacks.push(callback);
    return () => {
      const idx = this.onDiscoveryCallbacks.indexOf(callback);
      if (idx !== -1) this.onDiscoveryCallbacks.splice(idx, 1);
    };
  }
}

export const discoveryManager = DiscoveryManager.getInstance();
