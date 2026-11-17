/**
 * Advenquo: Construction World — Blueprint Display & Formatter
 *
 * Formats:
 * - Legacy BlueprintDefinition (backward-compatible)
 * - AuthoritativeBuildingDesign architectural views (Floor Plan, 4 Elevations, 9 Layers)
 * - Room schedule & metric dimensions
 * - 7 Guided construction phases
 */

import type { BlueprintDefinition, BlueprintStage } from '../blueprints/blueprint-types.js';
import type {
  AuthoritativeBuildingDesign,
  BuildingDimension,
  ConstructionLayerDefinition,
  RoomZone,
} from '../blueprints/building-design.js';
import { TWO_BEDROOM_BUNGALOW_DESIGN } from '../blueprints/two-bedroom-bungalow-design.js';

export interface FormattedBlueprintView {
  title: string;
  description: string;
  estimatedTime: string;
  currentStage: BlueprintStage;
  totalStages: number;
  materialsList: Array<{ name: string; count: number }>;
}

export interface FormattedArchitecturalDesignView {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  dimensions: {
    width: string;
    height: string;
    depth: string;
    totalArea: string;
  };
  rooms: Array<{
    name: string;
    area: string;
    bounds: string;
  }>;
  layers: Array<{
    id: string;
    order: number;
    name: string;
    description: string;
  }>;
  elevationDatums: Array<{
    name: string;
    elevation: string;
  }>;
  criticalDimensions: Array<{
    label: string;
    value: string;
  }>;
  totalComponents: number;
}

export class BlueprintDisplay {
  /**
   * Formats a legacy or catalog BlueprintDefinition.
   */
  public static format(
    blueprint: BlueprintDefinition,
    currentStageIndex: number,
  ): FormattedBlueprintView {
    const stage =
      blueprint.stages.find((s) => s.stageIndex === currentStageIndex) ||
      blueprint.stages[0];

    const materialsList = Object.entries(blueprint.requiredQuantities).map(
      ([type, count]) => ({
        name: type.replace(/_/g, ' ').toUpperCase(),
        count: count || 0,
      }),
    );

    return {
      title: blueprint.title,
      description: blueprint.description,
      estimatedTime: `${blueprint.estimatedBuildTimeMinutes} min`,
      currentStage: stage,
      totalStages: blueprint.stages.length,
      materialsList,
    };
  }

  /**
   * Formats an AuthoritativeBuildingDesign for presentation in Blueprint Mode.
   */
  public static formatArchitecturalDesign(
    design: AuthoritativeBuildingDesign = TWO_BEDROOM_BUNGALOW_DESIGN,
  ): FormattedArchitecturalDesignView {
    return {
      id: design.id,
      title: design.title,
      subtitle: design.subtitle,
      description: design.description,
      dimensions: {
        width: `${design.overallDimensions.width.toFixed(2)} m`,
        height: `${design.overallDimensions.height.toFixed(2)} m`,
        depth: `${design.overallDimensions.depth.toFixed(2)} m`,
        totalArea: `${design.totalAreaM2.toFixed(1)} m²`,
      },
      rooms: design.rooms.map((r) => ({
        name: r.name,
        area: `${r.areaM2.toFixed(2)} m²`,
        bounds: `${(r.bounds.maxX - r.bounds.minX).toFixed(1)}m × ${(r.bounds.maxZ - r.bounds.minZ).toFixed(1)}m`,
      })),
      layers: design.layers.map((l) => ({
        id: l.id,
        order: l.order,
        name: l.name,
        description: l.description,
      })),
      elevationDatums: design.elevationDatums.map((d) => ({
        name: d.name,
        elevation: `${d.elevationM >= 0 ? '+' : ''}${d.elevationM.toFixed(2)} m`,
      })),
      criticalDimensions: design.dimensions.map((d) => ({
        label: d.label,
        value: `${d.valueMeters.toFixed(2)} m`,
      })),
      totalComponents: design.components.length,
    };
  }
}
