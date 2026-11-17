/**
 * Advenquo: Construction World — Main Module Exports
 */

// Core
export * from './core/constants.js';
export * from './core/construction-types.js';
export * from './core/construction-components.js';
export * from './core/construction-events.js';
export * from './core/construction-state.js';
export * from './core/construction-manager.js';

// Materials
export * from './materials/material-specs.js';
export * from './materials/material-definitions.js';
export * from './materials/material-registry.js';
export * from './materials/construction-catalog.js';
export * from './materials/component-factory.js';
export * from './materials/block-factory.js';

// Interaction
export * from './interaction/seated-workspace.js';
export * from './interaction/two-hand-manipulation.js';
export * from './interaction/hand-grab-system.js';
export * from './interaction/hand-interaction-manager.js';
export * from './interaction/placement-preview.js';
export * from './interaction/construction-interaction-system.js';
export * from './interaction/desktop-interaction.js';

// Assembly
export * from './assembly/snap-point.js';
export * from './assembly/connection-graph.js';
export * from './assembly/connection-validator.js';
export * from './assembly/block-snapping-system.js';
export * from './assembly/assembly-system.js';
export * from './assembly/assembly-manager.js';

// Physics
export * from './physics/construction-physics-manager.js';
export * from './physics/collision-manager.js';
export * from './physics/load-distribution.js';
export * from './physics/stability-validator.js';
export * from './physics/construction-physics.js';

// Blueprints
export * from './blueprints/blueprint-types.js';
export * from './blueprints/blueprint-schema.js';
export * from './blueprints/building-design.js';
export * from './blueprints/two-bedroom-bungalow-design.js';
export * from './blueprints/blueprint-renderer.js';
export * from './blueprints/blueprint-viewer.js';
export * from './blueprints/blueprint-manager.js';
export * from './blueprints/blueprint-assistance.js';
export * from './blueprints/small-house-blueprint.js';
export * from './blueprints/small-house.js';
export * from './blueprints/duplex.js';
export * from './blueprints/bungalow.js';
export * from './blueprints/castle.js';
export * from './blueprints/mansion.js';
export * from './blueprints/bridge.js';
export * from './blueprints/blueprint-catalog.js';
export * from './blueprints/blueprint-loader.js';
export * from './blueprints/blueprint-visualizer.js';

// Assessment
export * from './assessment/blueprint-validator.js';
export * from './assessment/material-validator.js';
export * from './assessment/structural-validator.js';
export * from './assessment/construction-score.js';
export * from './assessment/assessment-engine.js';

// Progression
export * from './progression/unlock-manager.js';
export * from './progression/achievement-manager.js';
export * from './progression/level-manager.js';
export * from './progression/challenge-manager.js';
export * from './progression/construction-guide.js';

// UI
export * from './ui/construction-hud.js';
export * from './ui/material-selector.js';
export * from './ui/blueprint-display.js';
export * from './ui/assessment-display.js';
export * from './ui/construction-workshop-ui.js';

// Persistence
export * from './persistence/construction-save.js';
export * from './persistence/construction-progress.js';
export * from './persistence/construction-persistence.js';

// Workshop
export * from './workshop/construction-workshop.js';
