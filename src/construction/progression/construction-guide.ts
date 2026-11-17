/**
 * Advenquo: Guided Construction System
 *
 * Coordinates the 7-phase guided construction sequence:
 * - Phase 1: Foundation Footprint & Footing Blocks
 * - Phase 2: Ground Floor Slabs & Leveling
 * - Phase 3: External & Internal Walls & Columns
 * - Phase 4: Doors & Windows Portal Frames & Lintels
 * - Phase 5: Engineered Roof Trusses & Zinc Roofing Panels
 * - Phase 6: Finishing Elements & Eaves Trim
 * - Phase 7: Architectural Inspection & Scoring
 *
 * Configurable per building design challenge.
 */

import type { AuthoritativeBuildingDesign, ConstructionLayerId, DesignComponent } from '../blueprints/building-design.js';
import type { ComponentType } from '../core/construction-types.js';

export interface ConstructionPhaseDefinition {
  phaseIndex: number; // 1 to 7
  title: string;
  subtitle: string;
  instruction: string;
  criticalCheck: string;
  layerIds: ConstructionLayerId[];
  requiredComponentTypes: ComponentType[];
  targetComponents: DesignComponent[];
  isInspectionPhase?: boolean;
}

export class ConstructionGuide {
  private design: AuthoritativeBuildingDesign;
  private phases: ConstructionPhaseDefinition[];
  private currentPhaseIndex = 1;

  constructor(design: AuthoritativeBuildingDesign) {
    this.design = design;
    this.phases = this.buildPhases(design);
  }

  private buildPhases(design: AuthoritativeBuildingDesign): ConstructionPhaseDefinition[] {
    const filterComps = (stage: number): DesignComponent[] =>
      design.components.filter((c) => c.stageIndex === stage);

    const getTypes = (comps: DesignComponent[]): ComponentType[] =>
      Array.from(new Set(comps.map((c) => c.componentType)));

    const p1Comps = filterComps(1);
    const p2Comps = filterComps(2);
    const p3Comps = filterComps(3);
    const p4Comps = filterComps(4);
    const p5Comps = filterComps(5);
    const p6Comps = filterComps(6);

    return [
      {
        phaseIndex: 1,
        title: 'Phase 1: Foundation',
        subtitle: 'Perimeter Footings & Sub-Structure',
        instruction:
          'Study the foundation blueprint. Position the reinforced corner footing blocks and central spine blocks across the designated footprint.',
        criticalCheck: 'Foundation perimeter must align with building footprint within 0.20m.',
        layerIds: ['foundation'],
        requiredComponentTypes: getTypes(p1Comps),
        targetComponents: p1Comps,
      },
      {
        phaseIndex: 2,
        title: 'Phase 2: Floor',
        subtitle: 'Ground Floor Slab Decking',
        instruction:
          'Place reinforced precast floor slabs over the foundation footings to create the level floor deck.',
        criticalCheck: 'Floor slabs must fully cover the living, kitchen, and bedroom zones.',
        layerIds: ['floor_slab'],
        requiredComponentTypes: getTypes(p2Comps),
        targetComponents: p2Comps,
      },
      {
        phaseIndex: 3,
        title: 'Phase 3: Walls & Partitions',
        subtitle: 'Load-Bearing Shell & Interior Layout',
        instruction:
          'Erect exterior sandcrete wall panels and interior partition walls separating the bedrooms, living room, and bathroom.',
        criticalCheck: 'Load-bearing columns and perimeter wall heads must be plumb and bonded.',
        layerIds: ['structural_walls', 'internal_partitions'],
        requiredComponentTypes: getTypes(p3Comps),
        targetComponents: p3Comps,
      },
      {
        phaseIndex: 4,
        title: 'Phase 4: Doors & Windows',
        subtitle: 'Portals, Lintels & Natural Ventilation',
        instruction:
          'Install entrance door frame, bedroom doors, and glazed window casements into reserved wall openings. Seat lintels above.',
        criticalCheck: 'Portal frames must be square and lintel beams must bear fully on wall heads.',
        layerIds: ['openings', 'doors_windows'],
        requiredComponentTypes: getTypes(p4Comps),
        targetComponents: p4Comps,
      },
      {
        phaseIndex: 5,
        title: 'Phase 5: Roof Structure & Cladding',
        subtitle: 'King-Post Trusses & Weatherproof Decking',
        instruction:
          'Lift engineered timber king-post trusses onto wall bearing plates and mount corrugated weatherproof zinc roofing panels.',
        criticalCheck: 'Truss heels must rest squarely on wall plates with symmetrical pitch overhang.',
        layerIds: ['roof_structure', 'roofing_materials'],
        requiredComponentTypes: getTypes(p5Comps),
        targetComponents: p5Comps,
      },
      {
        phaseIndex: 6,
        title: 'Phase 6: Finishing Elements',
        subtitle: 'Eaves, Fascia & Architectural Trim',
        instruction:
          'Attach hardwood fascia boards and protective corner trims along roof eaves to complete weather sealing.',
        criticalCheck: 'Finishing elements must be flush and secured.',
        layerIds: ['finishing'],
        requiredComponentTypes: getTypes(p6Comps),
        targetComponents: p6Comps,
      },
      {
        phaseIndex: 7,
        title: 'Phase 7: Architectural Inspection',
        subtitle: 'Quality Certification & Compliance',
        instruction:
          'Perform a complete structural audit. Compare the assembled bungalow against the target blueprint design to obtain your builder rating.',
        criticalCheck: 'Overall building must satisfy structural stability and dimensional tolerances.',
        layerIds: [
          'foundation',
          'floor_slab',
          'structural_walls',
          'internal_partitions',
          'openings',
          'roof_structure',
          'roofing_materials',
          'doors_windows',
          'finishing',
        ],
        requiredComponentTypes: [],
        targetComponents: design.components,
        isInspectionPhase: true,
      },
    ];
  }

  public getPhases(): ConstructionPhaseDefinition[] {
    return this.phases;
  }

  public getCurrentPhaseIndex(): number {
    return this.currentPhaseIndex;
  }

  public getCurrentPhase(): ConstructionPhaseDefinition {
    return this.phases[this.currentPhaseIndex - 1] || this.phases[0];
  }

  public advancePhase(): number {
    if (this.currentPhaseIndex < this.phases.length) {
      this.currentPhaseIndex++;
    }
    return this.currentPhaseIndex;
  }

  public setPhase(index: number): void {
    this.currentPhaseIndex = Math.max(1, Math.min(this.phases.length, index));
  }

  public isLastPhase(): boolean {
    return this.currentPhaseIndex === this.phases.length;
  }

  public reset(): void {
    this.currentPhaseIndex = 1;
  }
}
