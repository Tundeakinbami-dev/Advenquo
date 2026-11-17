/**
 * Advenquo — Responsive UI System for Construction World
 *
 * Provides a responsive, accessible presentation layer for desktop, tablet,
 * and mobile browsers, while seamlessly preserving the Meta Quest VR experience.
 *
 * Responsibilities:
 * - Adapts 2D camera FOV and position on window resize so the construction workshop
 *   is never cropped or off-screen on narrow mobile screens (320px–430px+).
 * - Provides touch & click controls for selecting and placing modular construction blocks.
 * - Detects WebXR & Meta Quest device capabilities, providing device-aware status
 *   and clear fallback messaging.
 * - Manages mobile navigation drawer, blueprint library modals, and construction stage progress.
 * - Completely hides all 2D web overlays when an immersive VR session begins.
 */

import {
  createSystem,
  PerspectiveCamera,
  Vector3,
  VisibilityState,
} from '@iwsdk/core';

import { challengeManager } from './construction/progression/challenge-manager.js';
import { assemblySystem } from './construction/assembly/assembly-system.js';
import { desktopConstructionController } from './construction/interaction/desktop-interaction.js';
import type { ComponentType } from './construction/core/construction-types.js';

export class ResponsiveUISystem extends createSystem({}) {
  private celebrateShown = false;
  private isVRMode = false;
  private isQuestDevice = false;
  private webXRSupported = false;
  private overlay: HTMLElement | null = null;
  private lastStageIndex = -1;

  init(): void {
    this.overlay = document.getElementById('web-overlay');
    this._detectDeviceAndWebXR();
    this._wireNavigationAndModals();
    this._wireConstructionPalette();
    this._wireCameraResize();
    this._wireVisibilityState();
  }

  update(): void {
    if (this.isVRMode) return;

    // Track active construction challenge stage
    const stage = challengeManager.getCurrentStageInfo();
    if (stage && stage.stageIndex !== this.lastStageIndex) {
      this.lastStageIndex = stage.stageIndex;
      this._updateConstructionHUD(stage.stageIndex, stage.title);
    }

    // Check challenge completion
    if (challengeManager.isChallengeCompleted() && !this.celebrateShown) {
      this.celebrateShown = true;
      this._openModal('completion-modal-backdrop');
    }
  }

  private _updateConstructionHUD(stageIndex: number, stageTitle: string): void {
    const counterEl = document.getElementById('web-counter');
    if (counterEl) {
      counterEl.textContent = `Stage ${stageIndex} / 6: ${stageTitle}`;
    }

    for (let i = 1; i <= 6; i++) {
      const dot = document.getElementById(`dot-stage-${i}`);
      if (!dot) continue;
      dot.classList.remove('active', 'completed');
      if (i === stageIndex) {
        dot.classList.add('active');
      } else if (i < stageIndex) {
        dot.classList.add('completed');
      }
    }
  }

  private _wireConstructionPalette(): void {
    const cards = document.querySelectorAll<HTMLElement>('.construction-card');
    cards.forEach((card) => {
      const compType = card.dataset.componentType as ComponentType;
      if (!compType) return;

      const onSelect = (e: Event): void => {
        e.preventDefault();
        desktopConstructionController.selectComponent(
          `spawned_${compType}_${Date.now().toString(36)}`,
          compType,
          new Vector3(0, 1.2, -1.8),
        );
        this._showToast(`Selected ${card.querySelector('.card-name')?.textContent || compType}. Move mouse & click to place.`);
      };

      card.addEventListener('click', onSelect);
      card.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect(e);
        }
      });
    });

    // Wire dock controls
    document.getElementById('btn-dock-validate')?.addEventListener('click', () => {
      const graph = assemblySystem.getGraph();
      const result = challengeManager.evaluateProgress(graph);
      if (result.passed) {
        this._openModal('completion-modal-backdrop');
      } else {
        const err = result.placementErrors[0] || result.stabilityErrors[0] || result.feedbackNotes[0] || 'Validation incomplete';
        this._showToast(`Validation: ${err}`);
      }
    });

    document.getElementById('btn-dock-undo')?.addEventListener('click', () => {
      const undone = desktopConstructionController.undoLastPlacement();
      if (undone) {
        this._showToast(`Undid placement of ${undone}`);
      } else {
        this._showToast('Nothing to undo.');
      }
    });

    document.getElementById('btn-dock-reset')?.addEventListener('click', () => {
      assemblySystem.reset();
      challengeManager.reset();
      desktopConstructionController.reset();
      this.celebrateShown = false;
      this._updateConstructionHUD(1, 'Foundation Inspection');
      this._showToast('Construction project reset.');
    });
  }

  // ── Private Setup Methods ────────────────────────────────────────────────

  private _detectDeviceAndWebXR(): void {
    const ua = navigator.userAgent;
    this.isQuestDevice = /OculusBrowser|Quest/i.test(ua);

    const statusEl = document.getElementById('device-status-text');
    const drawerStatusEl = document.getElementById('drawer-device-text');
    const deviceBadge = document.getElementById('device-badge');
    const drawerBadge = document.getElementById('drawer-device-badge');

    if ('xr' in navigator && navigator.xr) {
      navigator.xr
        .isSessionSupported('immersive-vr')
        .then((supported) => {
          this.webXRSupported = supported;
          if (supported) {
            deviceBadge?.classList.add('vr-supported');
            drawerBadge?.classList.add('vr-supported');
            const label = this.isQuestDevice ? 'Meta Quest Ready' : 'WebXR Supported';
            if (statusEl) statusEl.textContent = label;
            if (drawerStatusEl) drawerStatusEl.textContent = label;
          } else {
            this._set2DFallbackStatus();
          }
        })
        .catch(() => {
          this._set2DFallbackStatus();
        });
    } else {
      this._set2DFallbackStatus();
    }
  }

  private _set2DFallbackStatus(): void {
    this.webXRSupported = false;
    const statusEl = document.getElementById('device-status-text');
    const drawerStatusEl = document.getElementById('drawer-device-text');
    if (statusEl) statusEl.textContent = '3D Web Showcase';
    if (drawerStatusEl) drawerStatusEl.textContent = '3D Web Showcase';
  }

  private _wireVisibilityState(): void {
    const handleLaunchVR = () => {
      this._launchVRSession();
    };
    document.addEventListener('advenquo-launch-vr', handleLaunchVR);
    this.cleanupFuncs.push(() => {
      document.removeEventListener('advenquo-launch-vr', handleLaunchVR);
    });

    this.cleanupFuncs.push(
      this.world.visibilityState.subscribe((state) => {
        const is2D = state === VisibilityState.NonImmersive;
        this.isVRMode = !is2D;

        const overlay = document.getElementById('web-overlay');
        const shell = document.getElementById('advenquo-shell');

        if (is2D) {
          if (overlay) overlay.classList.remove('in-vr');
          if (shell) shell.classList.remove('in-vr');
        } else {
          if (overlay) overlay.classList.add('in-vr');
          if (shell) shell.classList.add('in-vr');
          this._closeAllModals();
          this._closeMobileDrawer();
        }
      }),
    );
  }

  private _wireCameraResize(): void {
    const update2DCamera = (): void => {
      if (this.isVRMode) return;

      const camera = this.world.camera;
      if (!(camera instanceof PerspectiveCamera)) return;

      const aspect = window.innerWidth / window.innerHeight;

      // Base pose authored in iwsdk.config.json: position [0, 1.2, 0.35], lookAt [0, 0.95, -0.75]
      const baseZ = 0.35;
      const baseY = 1.2;

      camera.aspect = aspect;
      camera.updateProjectionMatrix();

      // Only perform initial static pose reset if player controller is not active
      const hasPlayerMoved = camera.position.x !== 0 || camera.position.z !== 0.35;
      if (!hasPlayerMoved) {
        if (aspect < 1.1) {
          const portraitScale = Math.min(1.1 / Math.max(aspect, 0.4), 2.2);
          const targetZ = baseZ + (portraitScale - 1.0) * 0.42;
          const targetY = baseY + (portraitScale - 1.0) * 0.12;
          camera.position.set(0, targetY, targetZ);
          camera.fov = 50 + (portraitScale - 1.0) * 10;
        } else {
          camera.position.set(0, baseY, baseZ);
          camera.fov = 50;
        }
        camera.lookAt(0, 0.95, -0.75);
        camera.updateProjectionMatrix();
      }
    };


    window.addEventListener('resize', update2DCamera, false);
    // Initial camera calibration
    update2DCamera();

    this.cleanupFuncs.push(() => {
      window.removeEventListener('resize', update2DCamera, false);
    });
  }

  private _launchVRSession(): void {
    if (this.world.xrEnabled) {
      try {
        this.world.launchXR();
      } catch {
        this._showToast(
          'Could not enter VR. Connect a Meta Quest headset or open this URL in the Meta Quest Browser.',
        );
      }
    } else {
      this._showToast(
        'WebXR is not active. Open this URL in the Meta Quest Browser for the immersive VR experience.',
      );
    }
  }

  private _wireNavigationAndModals(): void {
    // Web Enter VR Buttons
    const handleEnterVR = (): void => {
      this._launchVRSession();
    };

    document
      .getElementById('web-enter-vr-btn')
      ?.addEventListener('click', handleEnterVR);
    document
      .getElementById('drawer-enter-vr-btn')
      ?.addEventListener('click', () => {
        this._closeMobileDrawer();
        handleEnterVR();
      });

    // Mobile Menu Toggle & Drawer
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const drawerClose = document.getElementById('drawer-close-btn');
    const drawerBackdrop = document.getElementById('mobile-nav-backdrop');

    menuToggle?.addEventListener('click', () => {
      this._openMobileDrawer();
    });

    drawerClose?.addEventListener('click', () => {
      this._closeMobileDrawer();
    });

    drawerBackdrop?.addEventListener('click', (e) => {
      if (e.target === drawerBackdrop) {
        this._closeMobileDrawer();
      }
    });

    // Navigation Links
    const openHelp = (): void => {
      this._closeMobileDrawer();
      this._openModal('help-modal-backdrop');
    };
    const openAbout = (): void => {
      this._closeMobileDrawer();
      this._openModal('about-modal-backdrop');
    };
    const openProjects = (): void => {
      this._closeMobileDrawer();
      this._openModal('projects-modal-backdrop');
    };
    const scrollToMaterials = (): void => {
      this._closeMobileDrawer();
      const dock = document.getElementById('artefact-dock');
      dock?.scrollIntoView({ behavior: 'smooth' });
    };

    document.getElementById('nav-how-to-play')?.addEventListener('click', openHelp);
    document.getElementById('drawer-link-help')?.addEventListener('click', openHelp);
    document.getElementById('nav-about')?.addEventListener('click', openAbout);
    document.getElementById('drawer-link-about')?.addEventListener('click', openAbout);
    document.getElementById('nav-projects')?.addEventListener('click', openProjects);
    document.getElementById('drawer-link-projects')?.addEventListener('click', openProjects);
    document.getElementById('nav-materials')?.addEventListener('click', scrollToMaterials);
    document.getElementById('drawer-link-materials')?.addEventListener('click', scrollToMaterials);
    document.getElementById('nav-workshop')?.addEventListener('click', () => {
      this._closeAllModals();
      this._closeMobileDrawer();
    });
    document.getElementById('drawer-link-workshop')?.addEventListener('click', () => {
      this._closeAllModals();
      this._closeMobileDrawer();
    });
    document.getElementById('brand-home-btn')?.addEventListener('click', openAbout);

    // Project selection cards
    const projectCards = document.querySelectorAll<HTMLElement>('.project-card');
    projectCards.forEach((card) => {
      card.addEventListener('click', () => {
        projectCards.forEach((c) => c.classList.remove('active'));
        card.classList.add('active');
        const projId = card.dataset.projectId;
        if (projId) {
          const bp = challengeManager.selectBlueprint(projId);
          this._updateConstructionHUD(1, bp.stages[0]?.title || 'Stage 1');
          this._showToast(`Loaded blueprint: ${bp.title}`);
        }
      });
    });

    // Modal Close Buttons
    this._wireModalClose('projects-modal-backdrop', ['projects-modal-close', 'projects-modal-select-btn']);
    this._wireModalClose('help-modal-backdrop', ['help-modal-close', 'help-modal-ok']);
    this._wireModalClose('about-modal-backdrop', ['about-modal-close', 'about-modal-ok']);
    this._wireModalClose('completion-modal-backdrop', ['celebrate-close-btn']);

    // Toast Close
    document.getElementById('toast-close')?.addEventListener('click', () => {
      document.getElementById('vr-notice-toast')?.classList.remove('show');
    });

    // Escape Key Handler for Accessibility
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this._closeAllModals();
        this._closeMobileDrawer();
      }
    });
  }



  private _openMobileDrawer(): void {
    const backdrop = document.getElementById('mobile-nav-backdrop');
    const toggle = document.getElementById('mobile-menu-toggle');
    backdrop?.classList.add('open');
    backdrop?.setAttribute('aria-hidden', 'false');
    toggle?.setAttribute('aria-expanded', 'true');
    this.overlay?.classList.add('drawer-active');
  }

  private _closeMobileDrawer(): void {
    const backdrop = document.getElementById('mobile-nav-backdrop');
    const toggle = document.getElementById('mobile-menu-toggle');
    backdrop?.classList.remove('open');
    backdrop?.setAttribute('aria-hidden', 'true');
    toggle?.setAttribute('aria-expanded', 'false');
    this.overlay?.classList.remove('drawer-active');
  }

  private _openModal(modalId: string): void {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      this.overlay?.classList.add('modal-active');
    }
  }

  private _closeModal(modalId: string): void {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }
    const anyOpen = document.querySelectorAll('.modal-backdrop.open');
    if (anyOpen.length === 0) {
      this.overlay?.classList.remove('modal-active');
    }
  }

  private _closeAllModals(): void {
    const modals = document.querySelectorAll('.modal-backdrop');
    for (const modal of modals) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }
    this.overlay?.classList.remove('modal-active');
  }

  private _wireModalClose(modalBackdropId: string, buttonIds: string[]): void {
    const backdrop = document.getElementById(modalBackdropId);
    backdrop?.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        this._closeModal(modalBackdropId);
      }
    });

    for (const btnId of buttonIds) {
      document.getElementById(btnId)?.addEventListener('click', () => {
        this._closeModal(modalBackdropId);
      });
    }
  }

  private _showToast(message: string): void {
    const toast = document.getElementById('vr-notice-toast');
    const text = document.getElementById('toast-text');
    if (toast && text) {
      text.textContent = message;
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 5000);
    }
  }
}
