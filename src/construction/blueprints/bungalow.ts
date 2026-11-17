/**
 * Advenquo: Construction World — Stage 1: Two-Bedroom Bungalow Challenge Blueprint
 *
 * Fully integrated with TWO_BEDROOM_BUNGALOW_DESIGN as the single authoritative source of truth:
 * - 32.0 m² gross floor area (6.4m × 5.0m)
 * - Two bedrooms, living room, kitchen, bathroom, central circulation
 * - 7 Guided construction phases
 * - All targets derived directly from authoritative components
 */

import type {
  BlueprintDefinition,
  BlueprintStageItem,
  BlueprintTargetItem,
} from './blueprint-types.js';
import { TWO_BEDROOM_BUNGALOW_DESIGN } from './two-bedroom-bungalow-design.js';
import type { ComponentType } from '../core/construction-types.js';

// Calculate required quantities dynamically from authoritative components
const requiredQuantities: Partial<Record<ComponentType, number>> = {};
for (const comp of TWO_BEDROOM_BUNGALOW_DESIGN.components) {
  requiredQuantities[comp.componentType] = (requiredQuantities[comp.componentType] || 0) + 1;
}

// Convert authoritative components to BlueprintTargetItems
const targets: BlueprintTargetItem[] = TWO_BEDROOM_BUNGALOW_DESIGN.components.map((comp) => ({
  id: comp.id,
  targetId: comp.id,
  componentType: comp.componentType,
  structuralRole: comp.structuralRole,
  targetPosition: comp.position,
  targetRotation: comp.rotation,
  positionToleranceMeters: comp.positionToleranceM ?? 0.2,
  rotationToleranceDeg: comp.rotationToleranceDeg ?? 25,
  stageIndex: comp.stageIndex,
  stageName: `Phase ${comp.stageIndex}`,
  criticalLoadBearing: comp.criticalLoadBearing,
  description: comp.description,
}));

// Define 7 guided construction phases
const stages: BlueprintStageItem[] = [
  {
    stageIndex: 1,
    title: 'Phase 1: Foundation Footings',
    instruction:
      'Lay the perimeter concrete foundation footing blocks and spine across the building footprint.',
    criticalCheck: 'Perimeter alignment must cover 6.4m × 5.0m footprint.',
  },
  {
    stageIndex: 2,
    title: 'Phase 2: Ground Floor Slabs',
    instruction: 'Place precast reinforced floor slabs over footings to complete the floor deck.',
    criticalCheck: 'Floor slabs must be level and flush.',
  },
  {
    stageIndex: 3,
    title: 'Phase 3: Walls & Room Partitions',
    instruction:
      'Erect exterior load-bearing walls and interior partitions defining the two bedrooms, living room, and bathroom.',
    criticalCheck: 'Cross walls must interlock with exterior shell and be plumb.',
  },
  {
    stageIndex: 4,
    title: 'Phase 4: Doors & Windows',
    instruction:
      'Install entrance door, bedroom doors, glazed window casements, and seat lintel beams.',
    criticalCheck: 'Portal frames must sit square and flush in openings.',
  },
  {
    stageIndex: 5,
    title: 'Phase 5: Engineered Roof Trusses',
    instruction:
      'Lift king-post timber trusses onto wall heads and fasten corrugated zinc roofing panels.',
    criticalCheck: 'Truss heels must bear squarely on wall head plates.',
  },
  {
    stageIndex: 6,
    title: 'Phase 6: Architectural Finishing',
    instruction: 'Install hardwood fascia boards and eaves finishing along roof perimeters.',
    criticalCheck: 'Finishing elements must be secured along eaves.',
  },
  {
    stageIndex: 7,
    title: 'Phase 7: Inspection & Certification',
    instruction: 'Perform final architectural audit against blueprint design to receive score.',
    criticalCheck: 'All structural components must satisfy alignment tolerances.',
  },
];

export const BUNGALOW_BLUEPRINT: BlueprintDefinition = {
  id: 'bungalow',
  title: 'Stage 1: Two-Bedroom Bungalow',
  description: TWO_BEDROOM_BUNGALOW_DESIGN.description,
  estimatedBuildTimeMinutes: 25,
  foundationDimensions: [
    TWO_BEDROOM_BUNGALOW_DESIGN.overallDimensions.width,
    0.2,
    TWO_BEDROOM_BUNGALOW_DESIGN.overallDimensions.depth,
  ],
  foundationPosition: TWO_BEDROOM_BUNGALOW_DESIGN.foundationOrigin,
  requiredQuantities,
  stages,
  targets,
};

export default BUNGALOW_BLUEPRINT;
