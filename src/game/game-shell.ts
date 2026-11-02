/**
 * Advenquo: Master Game Shell & Coordinator
 *
 * Unifies the 2D adventure interface (Global Map, District Exploration,
 * World Now Intelligence Hub, Culture Passport) with the IWSDK WebXR
 * 3D spatial artifact encounter.
 */

import { storage } from './storage.js';
import { missionEngine } from './mission-engine.js';
import type { ChoiceEvaluationResult, MissionCompletionResult } from './mission-engine.js';
import { DESTINATIONS } from './world-data.js';
import { getAllCombinedStories, WORLD_NOW_STORIES } from './world-now-data.js';
import { bootstrapLiveWorldEngine } from '../live-world/bootstrap.js';
import { worldEngineApi } from '../live-world/service/world-engine-api.js';
import type {
  ActiveMissionState,
  Destination,
  GameSaveState,
  MissionDefinition,
  MissionStep,
  PointOfInterest,
  WorldNowStory,
} from './types.js';
import {
  injectAppStyles,
  renderDistrictExplorationView,
  renderGlobalMapView,
  renderLiveEventDetailModal,
  renderMissionModal,
  renderPassportView,
  renderPOIModal,
  renderProfileModal,
  renderSpatialHUD,
  renderTopNavBar,
  renderWorldNowView,
} from './ui.js';

export type NavigationTab = 'map' | 'district' | 'spatial' | 'world_now' | 'passport';

export class GameShell {
  private static instance: GameShell;

  private rootElement: HTMLElement | null = null;
  private navBarContainer: HTMLElement | null = null;
  private viewContainer: HTMLElement | null = null;
  private hudContainer: HTMLElement | null = null;
  private modalContainer: HTMLElement | null = null;
  private sceneContainer: HTMLElement | null = null;

  private activeTab: NavigationTab = 'map';
  private activeMissionModal: HTMLElement | null = null;
  private activeProfileModal: HTMLElement | null = null;
  private activePOIModal: HTMLElement | null = null;

  // Active mission running state in UI
  private currentMission: MissionDefinition | null = null;
  private currentEvaluation: ChoiceEvaluationResult | null = null;
  private currentHintText: string | null = null;
  private currentCompletion: MissionCompletionResult | null = null;

  // Spatial encounter live counter
  private spatialDiscoveredCount = 0;
  private readonly spatialTotalCount = 4;

  public static getInstance(): GameShell {
    if (!GameShell.instance) {
      GameShell.instance = new GameShell();
    }
    return GameShell.instance;
  }

  public init(): void {
    if (typeof document === 'undefined') return;

    injectAppStyles();

    this.sceneContainer = document.getElementById('scene-container');

    // Create root overlay shell
    let shell = document.getElementById('advenquo-shell');
    if (!shell) {
      shell = document.createElement('div');
      shell.id = 'advenquo-shell';
      document.body.appendChild(shell);
    }
    this.rootElement = shell;

    // Structure inside shell
    this.rootElement.innerHTML = `
      <div id="advenquo-nav-host"></div>
      <main id="advenquo-view-host" class="shell-view-container"></main>
      <div id="advenquo-hud-host"></div>
      <div id="advenquo-modal-host"></div>
    `;

    this.navBarContainer = this.rootElement.querySelector('#advenquo-nav-host');
    this.viewContainer = this.rootElement.querySelector('#advenquo-view-host');
    this.hudContainer = this.rootElement.querySelector('#advenquo-hud-host');
    this.modalContainer = this.rootElement.querySelector('#advenquo-modal-host');

    // Default to map or district
    const state = storage.getState();
    this.activeTab = 'map';

    // Bootstrap Global Live World Engine
    bootstrapLiveWorldEngine().then(() => {
      this.render();
    });

    this.render();

    // Check if onboarding is needed (first-time player prompt)
    if (state.profile.totalXp === 0 && !sessionStorage.getItem('advenquo_onboarded')) {
      this.openProfileModal();
      sessionStorage.setItem('advenquo_onboarded', 'true');
    }
  }

  public setTab(tab: NavigationTab): void {
    this.activeTab = tab;
    this.render();
  }

  public updateSpatialDiscovery(count: number): void {
    this.spatialDiscoveredCount = count;
    const counterEl = document.getElementById('spatial-counter');
    if (counterEl) {
      counterEl.textContent = `${this.spatialDiscoveredCount} / ${this.spatialTotalCount}`;
    }
  }

  public render(): void {
    const state = storage.getState();

    // Update Top Nav Bar
    if (this.navBarContainer) {
      this.navBarContainer.innerHTML = '';
      const navBar = renderTopNavBar(
        this.activeTab,
        state,
        (tab) => this.setTab(tab as NavigationTab),
        () => this.openProfileModal(),
      );
      this.navBarContainer.appendChild(navBar);
    }

    // Handle 3D Scene and Web Overlay visibility bridge
    const webOverlay = document.getElementById('web-overlay');
    if (this.sceneContainer) {
      if (this.activeTab === 'spatial') {
        // Spatial Mode: make 3D canvas primary and fully interactive
        this.sceneContainer.style.opacity = '1';
        this.sceneContainer.style.filter = 'none';
        this.sceneContainer.style.pointerEvents = 'auto';
        this.sceneContainer.style.zIndex = '50';
        if (webOverlay) {
          webOverlay.style.display = 'flex';
          const header = webOverlay.querySelector('.app-header') as HTMLElement | null;
          if (header) header.style.display = 'none';
        }
      } else {
        // 2D Adventure Mode: background canvas slightly dimmed
        this.sceneContainer.style.opacity = '0.2';
        this.sceneContainer.style.filter = 'blur(4px)';
        this.sceneContainer.style.pointerEvents = 'none';
        this.sceneContainer.style.zIndex = '0';
        if (webOverlay) {
          webOverlay.style.display = 'none';
        }
      }
    }

    // Render active view or HUD
    if (this.viewContainer && this.hudContainer) {
      this.viewContainer.innerHTML = '';
      this.hudContainer.innerHTML = '';

      if (this.activeTab === 'spatial') {
        // Floating HUD in 3D mode
        this.viewContainer.style.display = 'none';
        const hud = renderSpatialHUD(
          this.spatialDiscoveredCount,
          this.spatialTotalCount,
          () => this.setTab('district'),
        );
        this.hudContainer.appendChild(hud);
      } else {
        this.viewContainer.style.display = 'flex';

        switch (this.activeTab) {
          case 'map': {
            const mapView = renderGlobalMapView(
              DESTINATIONS,
              state.selectedDestinationId,
              (destId) => {
                storage.setSelectedLocation(destId, state.selectedDistrictId);
                this.render();
              },
              (destId) => {
                storage.setSelectedLocation(destId, 'isale_eko');
                this.setTab('district');
              },
            );
            this.viewContainer.appendChild(mapView);
            break;
          }

          case 'district': {
            const dest = DESTINATIONS.find((d) => d.id === state.selectedDestinationId) || DESTINATIONS[0];
            const districtView = renderDistrictExplorationView(
              dest,
              state.selectedDistrictId,
              (districtId) => {
                storage.setSelectedLocation(dest.id, districtId);
                this.render();
              },
              (poi) => this.openPOIModal(poi),
              (missionId) => this.startMission(missionId),
              (assetId) => {
                storage.setActiveSpatialEncounter(assetId);
                this.setTab('spatial');
              },
            );
            this.viewContainer.appendChild(districtView);
            break;
          }

          case 'world_now': {
            const combinedStories = getAllCombinedStories();
            const worldNowView = renderWorldNowView(
              combinedStories,
              (story) => this.openEventDetailModal(story),
              (missionId) => this.startMission(missionId),
            );
            this.viewContainer.appendChild(worldNowView);
            break;
          }

          case 'passport': {
            const passportView = renderPassportView(state);
            this.viewContainer.appendChild(passportView);
            break;
          }
        }
      }
    }
  }

  public openProfileModal(): void {
    if (!this.modalContainer) return;
    this.closeAllModals();

    const modal = renderProfileModal(
      storage.getState().profile,
      (updates) => {
        storage.updateProfile(updates);
        this.render();
      },
      () => this.closeAllModals(),
    );

    this.activeProfileModal = modal;
    this.modalContainer.appendChild(modal);
  }

  public openPOIModal(poi: PointOfInterest): void {
    if (!this.modalContainer) return;
    this.closeAllModals();

    const modal = renderPOIModal(
      poi,
      (missionId) => this.startMission(missionId),
      (spatialId) => {
        storage.setActiveSpatialEncounter(spatialId);
        this.setTab('spatial');
      },
      () => this.closeAllModals(),
    );

    this.activePOIModal = modal;
    this.modalContainer.appendChild(modal);
  }

  public openEventDetailModal(story: WorldNowStory): void {
    if (!this.modalContainer) return;
    this.closeAllModals();

    const modal = renderLiveEventDetailModal(
      story,
      (missionId) => this.startMission(missionId),
      (storyId) => {
        worldEngineApi.submitReport(
          storyId,
          'factual_inaccuracy',
          'Explorer community fact-check submission.',
        );
        alert(
          'Thank you for upholding Advenquo information integrity! Your report has been submitted to the editorial desk for review.',
        );
      },
      () => this.closeAllModals(),
    );

    this.modalContainer.appendChild(modal);
  }

  public startMission(missionId: string): void {
    const outcome = missionEngine.startMission(missionId);
    if (!outcome.success || !outcome.mission) {
      alert(outcome.error || 'Failed to start mission.');
      return;
    }

    this.currentMission = outcome.mission;
    this.currentEvaluation = null;
    this.currentHintText = null;
    this.currentCompletion = null;

    this.renderMissionModal();
  }

  private renderMissionModal(): void {
    if (!this.modalContainer || !this.currentMission) return;

    this.closeAllModals();

    const activeState = missionEngine.getActiveMissionState();
    if (!activeState) return;

    const currentStep = missionEngine.getCurrentStep(this.currentMission.id);
    if (!currentStep && !this.currentCompletion) return;

    const modal = renderMissionModal(
      this.currentMission,
      activeState,
      currentStep || this.currentMission.steps[0],
      this.currentEvaluation,
      this.currentHintText,
      this.currentCompletion,
      (choiceId) => {
        if (!currentStep || !this.currentMission) return;
        const result = missionEngine.submitChoice(this.currentMission.id, currentStep.id, choiceId);
        this.currentEvaluation = result;
        this.renderMissionModal();
      },
      () => {
        if (!currentStep || !this.currentMission) return;
        const hintOutcome = missionEngine.requestHint(this.currentMission.id, currentStep.id);
        if (hintOutcome) {
          this.currentHintText = hintOutcome.hint;
          this.renderMissionModal();
        }
      },
      () => {
        if (!this.currentMission) return;
        missionEngine.advanceToNextStep(this.currentMission.id);
        this.currentEvaluation = null;
        this.currentHintText = null;
        this.renderMissionModal();
      },
      () => {
        if (!this.currentMission) return;
        const completion = missionEngine.completeMission(this.currentMission.id);
        this.currentCompletion = completion;
        this.renderMissionModal();
        this.render(); // update passport & level in background
      },
      () => {
        this.closeAllModals();
        this.render();
      },
    );

    this.activeMissionModal = modal;
    this.modalContainer.appendChild(modal);
  }

  private closeAllModals(): void {
    if (this.modalContainer) {
      this.modalContainer.innerHTML = '';
    }
    this.activeMissionModal = null;
    this.activeProfileModal = null;
    this.activePOIModal = null;
  }
}

export const gameShell = GameShell.getInstance();
