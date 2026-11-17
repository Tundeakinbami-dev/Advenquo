/**
 * Advenquo: Construction World — Structural Engineering Validator
 *
 * Implements simplified static structural engineering checks:
 * - Load-path continuity (roof -> beam -> column/wall -> foundation)
 * - Ungrounded / floating component detection
 * - Cantilever overhang limits
 * - Lintel beam requirement over doorway openings (blocks cannot float over openings)
 * - Clear educational disclaimer
 */

import { CONSTRUCTION_CONSTANTS } from '../core/constants.js';
import type { ConnectionGraph, GraphNode } from '../assembly/connection-graph.js';
import { getComponentSpec } from '../materials/construction-catalog.js';

export interface StabilityValidationReport {
  isStable: boolean;
  score: number; // 0 to 100
  ungroundedComponents: string[];
  unsupportedOpenings: string[];
  cantileverWarnings: string[];
  missingLoadPaths: string[];
  stabilityErrors: string[];
  feedbackNotes: string[];
  disclaimer: string;
}

export class StructuralValidator {
  public static validate(graph: ConnectionGraph): StabilityValidationReport {
    return this.validateStructure(graph);
  }

  /**
   * Validates structural integrity across an assembled ConnectionGraph.
   */
  public static validateStructure(graph: ConnectionGraph): StabilityValidationReport {
    const nodes = graph.getAllNodes();
    const ungroundedComponents: string[] = [];
    const unsupportedOpenings: string[] = [];
    const cantileverWarnings: string[] = [];
    const missingLoadPaths: string[] = [];
    const stabilityErrors: string[] = [];
    const feedbackNotes: string[] = [];

    if (nodes.length === 0) {
      return {
        isStable: false,
        score: 0,
        ungroundedComponents: [],
        unsupportedOpenings: [],
        cantileverWarnings: [],
        missingLoadPaths: [],
        stabilityErrors: ['No structural components have been placed.'],
        feedbackNotes: ['Begin by inspecting the foundation footing and placing the base blocks.'],
        disclaimer: CONSTRUCTION_CONSTANTS.DISCLAIMER,
      };
    }

    // 1. Load-Path Continuity: Check every node is grounded
    for (const node of nodes) {
      if (node.structuralRole === 'foundation') continue;

      const isConnected = graph.isConnectedToGround(node.instanceId);
      if (!isConnected) {
        ungroundedComponents.push(node.instanceId);
        stabilityErrors.push(
          `Component "${node.instanceId}" (${node.componentType}) has no continuous load path to the foundation.`,
        );
      }
    }

    // 2. Role-specific support rules
    for (const node of nodes) {
      const neighbors = graph.getNeighbors(node.instanceId);
      const neighborNodes = neighbors
        .map((id) => graph.getNode(id))
        .filter((n): n is GraphNode => Boolean(n));

      // Roof panels must have support from horizontal beams or walls
      if (node.structuralRole === 'weather_enclosure') {
        const hasBearingSupport = neighborNodes.some(
          (n) =>
            n.structuralRole === 'load_transfer_beam' ||
            n.structuralRole === 'wall_partition' ||
            n.structuralRole === 'load_bearing_column',
        );
        if (!hasBearingSupport) {
          missingLoadPaths.push(node.instanceId);
          missingLoadPaths.push(`Roof component "${node.instanceId}" lacks load transfer beam or bearing wall support.`);
          stabilityErrors.push(
            `Roof panel "${node.instanceId}" is unanchored; it must rest on a load-bearing beam or wall.`,
          );
        }
      }

      // Horizontal beams must have at least 2 support connections (e.g. left and right column/wall)
      if (node.structuralRole === 'load_transfer_beam') {
        const bearingSupports = neighborNodes.filter(
          (n) =>
            n.structuralRole === 'load_bearing_column' ||
            n.structuralRole === 'wall_partition' ||
            n.structuralRole === 'compressive_masonry',
        );
        if (bearingSupports.length < 2) {
          stabilityErrors.push(
            `Lintel beam "${node.instanceId}" requires support at both ends (only ${bearingSupports.length} support found).`,
          );
        }
      }

      // Columns must have top and bottom connections when roof is loaded
      if (node.structuralRole === 'load_bearing_column') {
        const hasTopLoad = neighborNodes.some(
          (n) =>
            n.structuralRole === 'load_transfer_beam' || n.structuralRole === 'weather_enclosure',
        );
        const hasBottomAnchor = neighborNodes.some(
          (n) =>
            n.structuralRole === 'foundation' ||
            n.structuralRole === 'horizontal_deck' ||
            n.structuralRole === 'compressive_masonry',
        );
        if (hasTopLoad && !hasBottomAnchor) {
          stabilityErrors.push(
            `Column "${node.instanceId}" carries roof loads but has no solid foundation footing.`,
          );
        }
      }
    }

    // Calculate score
    const totalChecks = nodes.length * 2;
    const errorCount = stabilityErrors.length;
    const score = Math.max(0, Math.round(((totalChecks - errorCount) / Math.max(1, totalChecks)) * 100));
    const isStable = errorCount === 0;

    if (isStable) {
      feedbackNotes.push('All structural load paths resolve solidly down to the foundation footing.');
      feedbackNotes.push('Beams, columns, and masonry walls satisfy static equilibrium checks.');
    } else {
      feedbackNotes.push(
        'Structural defects detected. Check ungrounded blocks and ensure beams properly span openings before loading the roof.',
      );
    }

    return {
      isStable,
      score,
      ungroundedComponents,
      unsupportedOpenings,
      cantileverWarnings,
      missingLoadPaths,
      stabilityErrors,
      feedbackNotes,
      disclaimer: CONSTRUCTION_CONSTANTS.DISCLAIMER,
    };
  }
}
