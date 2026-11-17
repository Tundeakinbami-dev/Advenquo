/**
 * Advenquo: Construction World — Workshop UI & Controls
 *
 * Provides dual UI support:
 * 1. WebXR spatial HUD state & Blueprint Mode integration
 * 2. Desktop 2D DOM control overlay for keyboard and mouse
 *
 * Features:
 * - Active blueprint & stage instruction checklist (Stage 1 Two-Bedroom Bungalow)
 * - Interactive Architectural Blueprint Viewer Modal (3D Reference, Floor Plan, 4 Elevations, Exploded Layers)
 * - Workspace Pinning (pin blueprint panel left/right/top of workspace)
 * - 3-Tier Blueprint Assistance (Visual Hint, Guided Hint, Demonstration)
 * - Material supply palette (click / pinch to spawn components)
 * - Structural assessment button & diagnostic feedback
 * - Undo & Reset controls
 */

import { challengeManager } from '../progression/challenge-manager.js';
import { assemblySystem } from '../assembly/assembly-system.js';
import { desktopConstructionController } from '../interaction/desktop-interaction.js';
import type { ComponentType } from '../core/construction-types.js';
import { Vector3 } from '@iwsdk/core';
import { blueprintManager } from '../blueprints/blueprint-manager.js';
import { TWO_BEDROOM_BUNGALOW_DESIGN } from '../blueprints/two-bedroom-bungalow-design.js';
import { BlueprintValidator } from '../assessment/blueprint-validator.js';
import type { ConstructionLayerId } from '../blueprints/building-design.js';

export class ConstructionWorkshopUI {
  private static instance: ConstructionWorkshopUI | null = null;
  private domOverlay: HTMLElement | null = null;
  private blueprintModal: HTMLElement | null = null;
  private onSpawnCallback?: (type: ComponentType, position: Vector3) => void;

  public static getInstance(): ConstructionWorkshopUI {
    if (!ConstructionWorkshopUI.instance) {
      ConstructionWorkshopUI.instance = new ConstructionWorkshopUI();
    }
    return ConstructionWorkshopUI.instance;
  }

  public setSpawnCallback(cb: (type: ComponentType, position: Vector3) => void): void {
    this.onSpawnCallback = cb;
  }

  /**
   * Initializes the desktop overlay HUD.
   */
  public mountDesktopOverlay(container: HTMLElement = document.body): HTMLElement {
    if (this.domOverlay) return this.domOverlay;

    const overlay = document.createElement('div');
    overlay.id = 'construction-workshop-overlay';
    overlay.style.cssText = `
      position: absolute;
      top: 16px;
      right: 16px;
      width: 360px;
      background: rgba(15, 23, 42, 0.94);
      border: 1px solid rgba(56, 189, 248, 0.3);
      border-radius: 12px;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      padding: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
      z-index: 1000;
      backdrop-filter: blur(10px);
      pointer-events: auto;
    `;

    const blueprint = challengeManager.getBlueprint();
    const stage = challengeManager.getCurrentStageInfo();

    overlay.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <h3 style="margin:0; font-size:16px; font-weight:700; color:#38bdf8;">🔨 Construction Workshop</h3>
        <span id="stage-badge" style="background:#0284c7; padding:2px 8px; border-radius:12px; font-size:12px; font-weight:600;">Stage ${stage.stageIndex}/${blueprint.stages.length}</span>
      </div>
      <div id="project-title" style="font-size:13px; font-weight:600; color:#f8fafc; margin-bottom:4px;">${blueprint.title}</div>
      <div id="stage-instruction" style="font-size:12px; color:#94a3b8; line-height:1.4; margin-bottom:12px;">${stage.instruction}</div>

      <!-- Blueprint Mode Bar -->
      <div style="display:flex; gap:6px; margin-bottom:12px;">
        <button id="btn-blueprint-mode" style="flex:2; background:#0284c7; color:white; border:none; border-radius:6px; padding:8px 10px; font-size:12px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;">
          📐 Blueprint Mode
        </button>
        <button id="btn-pin-toggle" style="flex:1; background:#334155; color:#38bdf8; border:1px solid #0284c7; border-radius:6px; padding:8px; font-size:11px; font-weight:600; cursor:pointer;">
          📌 Pin Left
        </button>
      </div>

      <!-- Materials Supply Bay -->
      <div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:10px; margin-bottom:10px;">
        <div style="font-size:12px; font-weight:600; color:#cbd5e1; margin-bottom:6px;">📦 Materials Supply Bay</div>
        <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:6px;">
          <button class="mat-btn" data-type="foundation_block" style="background:#334155; color:#f1f5f9; border:none; border-radius:6px; padding:6px; font-size:11px; cursor:pointer;">🧱 Foundation Block</button>
          <button class="mat-btn" data-type="concrete_block" style="background:#334155; color:#f1f5f9; border:none; border-radius:6px; padding:6px; font-size:11px; cursor:pointer;">🔲 Concrete Block</button>
          <button class="mat-btn" data-type="floor_component" style="background:#334155; color:#f1f5f9; border:none; border-radius:6px; padding:6px; font-size:11px; cursor:pointer;">⬛ Floor Slab</button>
          <button class="mat-btn" data-type="wall_panel" style="background:#334155; color:#f1f5f9; border:none; border-radius:6px; padding:6px; font-size:11px; cursor:pointer;">🚪 Wall Panel</button>
          <button class="mat-btn" data-type="door_frame" style="background:#334155; color:#f1f5f9; border:none; border-radius:6px; padding:6px; font-size:11px; cursor:pointer;">🚪 Door Frame</button>
          <button class="mat-btn" data-type="window_frame" style="background:#334155; color:#f1f5f9; border:none; border-radius:6px; padding:6px; font-size:11px; cursor:pointer;">🪟 Window Frame</button>
          <button class="mat-btn" data-type="roof_truss" style="background:#334155; color:#f1f5f9; border:none; border-radius:6px; padding:6px; font-size:11px; cursor:pointer;">📐 King-Post Truss</button>
          <button class="mat-btn" data-type="roof_panel" style="background:#334155; color:#f1f5f9; border:none; border-radius:6px; padding:6px; font-size:11px; cursor:pointer;">🏠 Zinc Roof Panel</button>
        </div>
      </div>

      <!-- Action Controls -->
      <div style="display:flex; gap:6px; margin-bottom:10px;">
        <button id="btn-validate" style="flex:1.2; background:#059669; color:white; border:none; border-radius:6px; padding:8px; font-size:12px; font-weight:700; cursor:pointer;">🔍 Validate Design</button>
        <button id="btn-assistance" style="flex:1; background:#d97706; color:white; border:none; border-radius:6px; padding:8px; font-size:12px; font-weight:600; cursor:pointer;">💡 Hint</button>
        <button id="btn-undo" style="flex:0.8; background:#475569; color:white; border:none; border-radius:6px; padding:8px; font-size:12px; font-weight:600; cursor:pointer;">↩️ Undo</button>
        <button id="btn-reset" style="flex:0.8; background:#b91c1c; color:white; border:none; border-radius:6px; padding:8px; font-size:12px; font-weight:600; cursor:pointer;">🔄 Reset</button>
      </div>

      <div id="assessment-panel" style="background:#090d16; border-radius:6px; padding:8px; font-size:11px; color:#cbd5e1; max-height:110px; overflow-y:auto; line-height:1.4;">
        Study the blueprint before building. Grab components with your hands or click materials to place.
      </div>
      <div style="margin-top:6px; font-size:10px; color:#64748b; font-style:italic;">
        Desktop Controls: Click & Drag to Move | Q / E: Rotate Yaw | R: Rotate Pitch | Click to Snap | U: Undo
      </div>
    `;

    // Wire listeners
    overlay.querySelectorAll('.mat-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const type = (e.currentTarget as HTMLElement).getAttribute('data-type') as ComponentType;
        if (type && this.onSpawnCallback) {
          this.onSpawnCallback(type, new Vector3(0, 1.2, -1.8));
        }
      });
    });

    overlay.querySelector('#btn-blueprint-mode')?.addEventListener('click', () => {
      this.openBlueprintModal();
    });

    overlay.querySelector('#btn-pin-toggle')?.addEventListener('click', () => {
      const current = blueprintManager.getPinPlacement();
      const next = current === 'left' ? 'right' : 'left';
      blueprintManager.setPinPlacement(next);
      const btn = overlay.querySelector('#btn-pin-toggle');
      if (btn) btn.textContent = `📌 Pin ${next === 'left' ? 'Left' : 'Right'}`;
    });

    overlay.querySelector('#btn-validate')?.addEventListener('click', () => {
      this.runAssessment();
    });

    overlay.querySelector('#btn-assistance')?.addEventListener('click', () => {
      this.provideAssistance();
    });

    overlay.querySelector('#btn-undo')?.addEventListener('click', () => {
      desktopConstructionController.undoLastPlacement();
      this.updateState();
    });

    overlay.querySelector('#btn-reset')?.addEventListener('click', () => {
      assemblySystem.reset();
      challengeManager.reset();
      blueprintManager.getGuide().reset();
      this.updateState();
    });

    container.appendChild(overlay);
    this.domOverlay = overlay;
    return overlay;
  }

  /**
   * Opens the full interactive Architectural Blueprint Viewer Modal.
   */
  public openBlueprintModal(container: HTMLElement = document.body): HTMLElement {
    if (this.blueprintModal) {
      this.blueprintModal.style.display = 'flex';
      return this.blueprintModal;
    }

    const design = TWO_BEDROOM_BUNGALOW_DESIGN;
    const viewer = blueprintManager.getViewer();

    const modal = document.createElement('div');
    modal.id = 'architectural-blueprint-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(4, 9, 20, 0.88);
      backdrop-filter: blur(12px);
      display: flex;
      flex-direction: column;
      z-index: 2000;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      padding: 24px;
      box-sizing: border-box;
    `;

    modal.innerHTML = `
      <!-- Modal Header -->
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(56, 189, 248, 0.3); padding-bottom:12px; margin-bottom:14px;">
        <div>
          <div style="font-size:11px; font-weight:700; color:#38bdf8; text-transform:uppercase; letter-spacing:1px;">Architectural Blueprint Mode · ${design.subtitle}</div>
          <h2 style="margin:2px 0 0 0; font-size:20px; font-weight:800; color:#f8fafc;">${design.title} (6.40m × 5.00m · ${design.totalAreaM2.toFixed(1)} m²)</h2>
        </div>
        <div style="display:flex; gap:10px;">
          <button id="btn-modal-start-build" style="background:#059669; color:white; border:none; border-radius:6px; padding:8px 16px; font-size:13px; font-weight:700; cursor:pointer;">
            🔨 Enter Construction & Pin
          </button>
          <button id="btn-modal-close" style="background:#334155; color:#94a3b8; border:none; border-radius:6px; padding:8px 14px; font-size:13px; font-weight:700; cursor:pointer;">
            ✕ Close
          </button>
        </div>
      </div>

      <!-- Main Layout: Sidebar & Viewport -->
      <div style="display:flex; flex:1; gap:16px; overflow:hidden;">
        <!-- Left: View Selection & Layers -->
        <div style="width:280px; background:rgba(15, 23, 42, 0.8); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:12px; overflow-y:auto;">
          <div>
            <div style="font-size:11px; font-weight:700; color:#94a3b8; margin-bottom:6px;">ARCHITECTURAL VIEWS</div>
            <div style="display:flex; flex-direction:column; gap:4px;">
              <button class="view-btn" data-view="3d_reference" style="background:#0284c7; color:white; border:none; border-radius:4px; padding:7px 10px; font-size:12px; font-weight:600; text-align:left; cursor:pointer;">🏠 3D Reference Model</button>
              <button class="view-btn" data-view="floor_plan" style="background:#1e293b; color:#cbd5e1; border:none; border-radius:4px; padding:7px 10px; font-size:12px; font-weight:600; text-align:left; cursor:pointer;">📐 Architectural Floor Plan</button>
              <button class="view-btn" data-view="elevation_front" style="background:#1e293b; color:#cbd5e1; border:none; border-radius:4px; padding:7px 10px; font-size:12px; font-weight:600; text-align:left; cursor:pointer;">🏛️ Front Elevation (South)</button>
              <button class="view-btn" data-view="elevation_rear" style="background:#1e293b; color:#cbd5e1; border:none; border-radius:4px; padding:7px 10px; font-size:12px; font-weight:600; text-align:left; cursor:pointer;">🏛️ Rear Elevation (North)</button>
              <button class="view-btn" data-view="elevation_left" style="background:#1e293b; color:#cbd5e1; border:none; border-radius:4px; padding:7px 10px; font-size:12px; font-weight:600; text-align:left; cursor:pointer;">🏛️ Left Elevation (West)</button>
              <button class="view-btn" data-view="elevation_right" style="background:#1e293b; color:#cbd5e1; border:none; border-radius:4px; padding:7px 10px; font-size:12px; font-weight:600; text-align:left; cursor:pointer;">🏛️ Right Elevation (East)</button>
              <button class="view-btn" data-view="exploded" style="background:#1e293b; color:#cbd5e1; border:none; border-radius:4px; padding:7px 10px; font-size:12px; font-weight:600; text-align:left; cursor:pointer;">💥 Exploded Layer View</button>
            </div>
          </div>

          <!-- Exploded View Slider -->
          <div id="exploded-controls" style="border-top:1px solid rgba(255,255,255,0.1); padding-top:10px;">
            <div style="font-size:11px; font-weight:700; color:#38bdf8; margin-bottom:4px;">EXPLODED LAYER SEPARATION</div>
            <input type="range" id="slider-exploded" min="0" max="100" value="0" style="width:100%; cursor:pointer; accent-color:#0284c7;">
            <div style="display:flex; justify-content:space-between; font-size:10px; color:#64748b; margin-top:2px;">
              <span>Assembled (0%)</span>
              <span>Fully Exploded (100%)</span>
            </div>
          </div>

          <!-- 9 Construction Layers -->
          <div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:10px; flex:1;">
            <div style="font-size:11px; font-weight:700; color:#94a3b8; margin-bottom:6px;">CONSTRUCTION LAYERS (9)</div>
            <div id="layer-list" style="display:flex; flex-direction:column; gap:4px; font-size:11px;">
              ${design.layers
                .map(
                  (l) => `
                <label style="display:flex; align-items:center; gap:6px; cursor:pointer; color:#cbd5e1;">
                  <input type="checkbox" class="layer-checkbox" data-layer="${l.id}" checked style="accent-color:#0284c7;">
                  <span>${l.name}</span>
                </label>
              `,
                )
                .join('')}
            </div>
          </div>
        </div>

        <!-- Center: Interactive Viewport -->
        <div style="flex:1; background:#070d19; border:1px solid rgba(56, 189, 248, 0.2); border-radius:8px; display:flex; flex-direction:column; overflow:hidden; position:relative;">
          <!-- Viewport Toolbar -->
          <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(15, 23, 42, 0.9); padding:8px 12px; border-bottom:1px solid rgba(255,255,255,0.08);">
            <div id="viewport-title" style="font-size:12px; font-weight:700; color:#38bdf8;">🏠 3D Reference Model</div>
            <div style="display:flex; gap:6px;">
              <button id="btn-rot-left" style="background:#1e293b; color:#cbd5e1; border:none; border-radius:4px; padding:4px 8px; font-size:11px; cursor:pointer;">↺ Left</button>
              <button id="btn-rot-right" style="background:#1e293b; color:#cbd5e1; border:none; border-radius:4px; padding:4px 8px; font-size:11px; cursor:pointer;">↻ Right</button>
              <button id="btn-zoom-in" style="background:#1e293b; color:#cbd5e1; border:none; border-radius:4px; padding:4px 8px; font-size:11px; cursor:pointer;">+ Zoom</button>
              <button id="btn-zoom-out" style="background:#1e293b; color:#cbd5e1; border:none; border-radius:4px; padding:4px 8px; font-size:11px; cursor:pointer;">- Zoom</button>
              <button id="btn-view-reset" style="background:#1e293b; color:#cbd5e1; border:none; border-radius:4px; padding:4px 8px; font-size:11px; cursor:pointer;">Reset</button>
            </div>
          </div>

          <!-- Viewport Content Area -->
          <div id="viewport-render-area" style="flex:1; display:flex; align-items:center; justify-content:center; overflow:hidden; padding:16px;">
            <div id="svg-container" style="display:none; width:100%; height:100%; display:flex; align-items:center; justify-content:center;"></div>
            <div id="viewer-info-banner" style="position:absolute; bottom:12px; left:12px; background:rgba(15, 23, 42, 0.85); padding:8px 12px; border-radius:6px; font-size:11px; color:#94a3b8;">
              3D Reference active in VR Workspace. Drag to orbit, wheel to zoom.
            </div>
          </div>
        </div>

        <!-- Right: Architectural Specs & Room Schedule -->
        <div style="width:280px; background:rgba(15, 23, 42, 0.8); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:12px; overflow-y:auto;">
          <div>
            <div style="font-size:11px; font-weight:700; color:#94a3b8; margin-bottom:6px;">ROOM SCHEDULE (${design.totalAreaM2.toFixed(1)} m²)</div>
            <div style="display:flex; flex-direction:column; gap:4px; font-size:11px;">
              ${design.rooms
                .map(
                  (r) => `
                <div style="display:flex; justify-content:space-between; padding:4px 6px; background:#1e293b; border-radius:4px;">
                  <span style="color:#f1f5f9; font-weight:600;">${r.name}</span>
                  <span style="color:#38bdf8;">${r.areaM2.toFixed(2)} m²</span>
                </div>
              `,
                )
                .join('')}
            </div>
          </div>

          <div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:10px;">
            <div style="font-size:11px; font-weight:700; color:#94a3b8; margin-bottom:6px;">LEVEL DATUMS</div>
            <div style="display:flex; flex-direction:column; gap:4px; font-size:11px;">
              ${design.elevationDatums
                .map(
                  (d) => `
                <div style="display:flex; justify-content:space-between; padding:4px 6px; background:#1e293b; border-radius:4px;">
                  <span style="color:#cbd5e1;">${d.name}</span>
                  <span style="color:#fbbf24; font-family:monospace;">${d.elevationM >= 0 ? '+' : ''}${d.elevationM.toFixed(2)}m</span>
                </div>
              `,
                )
                .join('')}
            </div>
          </div>

          <div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:10px;">
            <div style="font-size:11px; font-weight:700; color:#38bdf8; margin-bottom:6px;">💡 BLUEPRINT ASSISTANCE</div>
            <div style="display:flex; flex-direction:column; gap:6px;">
              <button id="btn-modal-hint-1" style="background:#1e293b; color:#cbd5e1; border:1px solid #0284c7; border-radius:4px; padding:6px; font-size:11px; cursor:pointer;">Level 1: Visual Hint</button>
              <button id="btn-modal-hint-2" style="background:#1e293b; color:#cbd5e1; border:1px solid #d97706; border-radius:4px; padding:6px; font-size:11px; cursor:pointer;">Level 2: Guided Hint</button>
              <button id="btn-modal-hint-3" style="background:#1e293b; color:#cbd5e1; border:1px solid #059669; border-radius:4px; padding:6px; font-size:11px; cursor:pointer;">Level 3: Assembly Demo</button>
            </div>
            <div id="assistance-output" style="margin-top:6px; font-size:10px; color:#94a3b8; line-height:1.4;">
              Select an assistance tier to view assembly guidance for the active phase.
            </div>
          </div>
        </div>
      </div>
    `;

    // Wire Modal View buttons
    modal.querySelectorAll('.view-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const view = (e.currentTarget as HTMLElement).getAttribute('data-view');
        if (!view) return;

        modal.querySelectorAll('.view-btn').forEach((b) => {
          (b as HTMLElement).style.background = '#1e293b';
          (b as HTMLElement).style.color = '#cbd5e1';
        });
        (e.currentTarget as HTMLElement).style.background = '#0284c7';
        (e.currentTarget as HTMLElement).style.color = 'white';

        this.renderModalView(modal, view as any);
      });
    });

    // Wire Layer Checkboxes
    modal.querySelectorAll('.layer-checkbox').forEach((cb) => {
      cb.addEventListener('change', (e) => {
        const layerId = (e.currentTarget as HTMLElement).getAttribute('data-layer') as ConstructionLayerId;
        const checked = (e.currentTarget as HTMLInputElement).checked;
        if (layerId) {
          viewer.toggleLayer(layerId, checked);
        }
      });
    });

    // Wire Exploded Slider
    const slider = modal.querySelector('#slider-exploded') as HTMLInputElement;
    if (slider) {
      slider.addEventListener('input', () => {
        const val = parseFloat(slider.value) / 100;
        viewer.setExplodedProgress(val);
      });
    }

    // Viewport controls
    modal.querySelector('#btn-rot-left')?.addEventListener('click', () => viewer.rotate(-0.25, 0));
    modal.querySelector('#btn-rot-right')?.addEventListener('click', () => viewer.rotate(0.25, 0));
    modal.querySelector('#btn-zoom-in')?.addEventListener('click', () => viewer.zoom(0.2));
    modal.querySelector('#btn-zoom-out')?.addEventListener('click', () => viewer.zoom(-0.2));
    modal.querySelector('#btn-view-reset')?.addEventListener('click', () => {
      viewer.resetView();
      if (slider) slider.value = '0';
    });

    // Assistance buttons
    modal.querySelector('#btn-modal-hint-1')?.addEventListener('click', () => {
      const hint = blueprintManager.getAssistance().getVisualHint(
        challengeManager.getCurrentStageIndex(),
        assemblySystem.getGraph().getAllNodes() as any,
      );
      const out = modal.querySelector('#assistance-output');
      if (out && hint) {
        out.innerHTML = `<span style="color:#38bdf8; font-weight:700;">VISUAL HINT:</span><br>Target: ${hint.description} (${hint.componentType})<br>Position: [${hint.targetPosition.map((n) => n.toFixed(2)).join(', ')}]`;
      }
    });

    modal.querySelector('#btn-modal-hint-2')?.addEventListener('click', () => {
      const hint = blueprintManager.getAssistance().getGuidedHint(
        challengeManager.getCurrentStageIndex(),
        assemblySystem.getGraph().getAllNodes() as any,
      );
      const out = modal.querySelector('#assistance-output');
      if (out && hint) {
        out.innerHTML = `<span style="color:#fbbf24; font-weight:700;">GUIDED HINT:</span><br>${hint.architecturalNote}<br>${hint.connectionInstructions}`;
      }
    });

    modal.querySelector('#btn-modal-hint-3')?.addEventListener('click', () => {
      const demo = blueprintManager.getAssistance().getDemonstration(
        challengeManager.getCurrentStageIndex(),
        assemblySystem.getGraph().getAllNodes() as any,
      );
      const out = modal.querySelector('#assistance-output');
      if (out && demo) {
        out.innerHTML = `<span style="color:#34d399; font-weight:700;">ASSEMBLY DEMONSTRATION:</span><br>${demo.assemblyTips.join('<br>')}`;
      }
    });

    // Close & Start Build
    modal.querySelector('#btn-modal-close')?.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    modal.querySelector('#btn-modal-start-build')?.addEventListener('click', () => {
      modal.style.display = 'none';
      blueprintManager.startConstruction();
      this.updateState();
    });

    container.appendChild(modal);
    this.blueprintModal = modal;
    return modal;
  }

  private renderModalView(
    modal: HTMLElement,
    viewType:
      | '3d_reference'
      | 'floor_plan'
      | 'elevation_front'
      | 'elevation_rear'
      | 'elevation_left'
      | 'elevation_right'
      | 'exploded',
  ): void {
    const viewer = blueprintManager.getViewer();
    const titleEl = modal.querySelector('#viewport-title');
    const svgContainer = modal.querySelector('#svg-container') as HTMLElement;
    const bannerEl = modal.querySelector('#viewer-info-banner') as HTMLElement;

    viewer.setViewType(viewType);

    if (viewType === '3d_reference' || viewType === 'exploded') {
      if (titleEl) {
        titleEl.textContent = viewType === 'exploded' ? '💥 Exploded Construction Layer View' : '🏠 3D Reference Model';
      }
      if (svgContainer) svgContainer.style.display = 'none';
      if (bannerEl) {
        bannerEl.textContent = '3D Reference active in VR Workspace. Drag to orbit, wheel to zoom.';
      }
    } else {
      if (svgContainer) {
        svgContainer.style.display = 'flex';
        let svg = '';
        if (viewType === 'floor_plan') {
          if (titleEl) titleEl.textContent = '📐 Architectural Floor Plan (Top-Down Projection)';
          svg = viewer.getFloorPlanSVG({ widthPx: 750, heightPx: 520 });
        } else {
          const elev = viewType.replace('elevation_', '') as any;
          if (titleEl) titleEl.textContent = `🏛️ ${elev.toUpperCase()} ELEVATION`;
          svg = viewer.getElevationSVG(elev, { widthPx: 750, heightPx: 480 });
        }
        svgContainer.innerHTML = svg;
      }
      if (bannerEl) {
        bannerEl.textContent = '2D Vector Drawing with accurate metric dimensions and room datums.';
      }
    }
  }

  public runAssessment(): void {
    const graph = assemblySystem.getGraph();
    const placedList = graph.getAllNodes() as any;
    const result = BlueprintValidator.validateAgainstDesign(
      TWO_BEDROOM_BUNGALOW_DESIGN,
      placedList,
      0.25,
      30,
    );

    const panel = this.domOverlay?.querySelector('#assessment-panel');
    if (panel) {
      if (result.passed) {
        panel.innerHTML = `<span style="color:#34d399; font-weight:700;">PASSED (${result.overallScore}% · ${result.starRating} Stars)</span><br>${result.overallFeedback.join('<br>')}`;
      } else {
        panel.innerHTML = `<span style="color:#f87171; font-weight:700;">VALIDATION INCOMPLETE (${result.overallScore}%)</span><br>${result.overallFeedback.slice(0, 3).join('<br>')}`;
      }
    }
  }

  public provideAssistance(): void {
    const hint = blueprintManager.getAssistance().getGuidedHint(
      challengeManager.getCurrentStageIndex(),
      assemblySystem.getGraph().getAllNodes() as any,
    );
    const panel = this.domOverlay?.querySelector('#assessment-panel');
    if (panel && hint) {
      panel.innerHTML = `<span style="color:#fbbf24; font-weight:700;">HINT:</span><br>${hint.description}<br>${hint.connectionInstructions}`;
    }
  }

  public updateState(): void {
    if (!this.domOverlay) return;

    const blueprint = challengeManager.getBlueprint();
    const stage = challengeManager.getCurrentStageInfo();
    const badge = this.domOverlay.querySelector('#stage-badge');
    const instruction = this.domOverlay.querySelector('#stage-instruction');
    const title = this.domOverlay.querySelector('#project-title');

    if (badge) badge.textContent = `Stage ${stage.stageIndex}/${blueprint.stages.length}`;
    if (instruction) instruction.textContent = stage.instruction;
    if (title) title.textContent = blueprint.title;
  }

  public unmount(): void {
    if (this.domOverlay && this.domOverlay.parentElement) {
      this.domOverlay.parentElement.removeChild(this.domOverlay);
      this.domOverlay = null;
    }
    if (this.blueprintModal && this.blueprintModal.parentElement) {
      this.blueprintModal.parentElement.removeChild(this.blueprintModal);
      this.blueprintModal = null;
    }
  }
}

export const constructionWorkshopUI = ConstructionWorkshopUI.getInstance();
