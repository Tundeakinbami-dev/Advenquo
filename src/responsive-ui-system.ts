/**
 * Advenquo — Responsive UI System
 *
 * Provides a responsive, accessible 2D presentation layer for desktop, tablet,
 * and mobile browsers, while seamlessly preserving the Meta Quest VR experience.
 *
 * Responsibilities:
 * - Adapts 2D camera FOV and position on window resize so the cultural showcase
 *   is never cropped or off-screen on narrow mobile screens (320px–430px+).
 * - Provides touch-friendly alternatives (artefact tray, cards, and canvas touch)
 *   to discover artefacts and view cultural stories.
 * - Detects WebXR & Meta Quest device capabilities, providing device-aware status
 *   and clear fallback messaging.
 * - Manages mobile navigation drawer, interactive modals, and discovery progress.
 * - Completely hides all 2D web overlays when an immersive VR session begins.
 */

import {
  AudioUtils,
  createSystem,
  PerspectiveCamera,
  VisibilityState,
} from '@iwsdk/core';

import { CulturalObject } from './cultural-object-component.js';
import { gameShell } from './game/game-shell.js';

interface ArtefactMeta {
  title: string;
  culturalWord: string;
  fact: string;
  icon: string;
  subtitle: string;
}

const ARTEFACT_DATA: Record<string, ArtefactMeta> = {
  'adire-cloth': {
    title: 'Adire Cloth',
    culturalWord: 'Yoruba word: Adire (ah-dee-reh) — to tie and dye',
    fact: 'Adire is a Yoruba tradition of resist-dyeing cloth in deep indigo blue. Geometric patterns are drawn in cassava paste, then the cloth is submerged in pots of indigo dye. Each pattern carries meaning: family, status, or a prayer.',
    icon: '🧵',
    subtitle: 'Indigo Resist-Dye',
  },
  'talking-drum': {
    title: 'Talking Drum',
    culturalWord: 'Yoruba word: Gangan (gahn-gahn) — the talking drum',
    fact: 'The Gangan is an hourglass-shaped drum capable of mimicking the tonal inflections of the Yoruba language. Squeezing the leather tension chords changes the pitch as the player strikes the drum head with a curved mallet.',
    icon: '🥁',
    subtitle: 'Gangan of Kings',
  },
  calabash: {
    title: 'Calabash Bowl',
    culturalWord: 'Yoruba word: Igba (eeg-bah) — dried gourd vessel',
    fact: 'Carved from the dried shell of a gourd, the Igba is a vital domestic and ceremonial vessel in Yoruba culture. Pyrography (hot-metal etching) creates intricate geometric patterns symbolizing prosperity, fertility, and protection.',
    icon: '🏺',
    subtitle: 'Carved Igba Gourd',
  },
  'kola-nut': {
    title: 'Kola Nut',
    culturalWord: 'Yoruba word: Obi (oh-bee) — the sacred kola nut',
    fact: 'The kola nut is a sacred symbol of hospitality, respect, and prayer across West Africa. In Yoruba tradition, offering Obi to a guest is the highest sign of welcome. As the Yoruba proverb says: "He who brings kola brings life."',
    icon: '🌱',
    subtitle: 'Sacred Obi Blessing',
  },
};

export class ResponsiveUISystem extends createSystem({
  cultural: { required: [CulturalObject] },
}) {
  private prevDiscoveredCount = -1;
  private celebrateShown = false;
  private isVRMode = false;
  private isQuestDevice = false;
  private webXRSupported = false;
  private overlay: HTMLElement | null = null;

  init(): void {
    this.overlay = document.getElementById('web-overlay');
    this._detectDeviceAndWebXR();
    this._wireNavigationAndModals();
    this._wireArtefactCards();
    this._wireCameraResize();
    this._wireVisibilityState();

    // Attach click listeners to 3D cultural object entities for 2D interaction
    this.cleanupFuncs.push(
      this.queries.cultural.subscribe('qualify', (entity) => {
        const obj = entity.object3D;
        if (!obj) return;
        const onClick = (): void => {
          if (!this.isVRMode) {
            this.discoverArtefact(entity);
          }
        };
        obj.addEventListener('click', onClick);
      }),
    );
  }

  update(): void {
    if (this.isVRMode) return;

    let discoveredCount = 0;
    const total = this.queries.cultural.entities.size;

    for (const entity of this.queries.cultural.entities) {
      const isFound = entity.getValue(CulturalObject, 'discovered');
      const factId = entity.getValue(CulturalObject, 'factId');

      if (isFound) {
        discoveredCount++;
        if (factId) {
          this._updateArtefactCardFound(factId);
        }
      }
    }

    if (discoveredCount !== this.prevDiscoveredCount) {
      this.prevDiscoveredCount = discoveredCount;
      this._updateProgressHUD(discoveredCount, total);

      // Trigger celebration when all artefacts are discovered
      if (total > 0 && discoveredCount === total && !this.celebrateShown) {
        this.celebrateShown = true;
        this._openModal('completion-modal-backdrop');
      }
    }
  }

  /**
   * Discovers an artefact from 2D web interaction (card tap or canvas click).
   * Sets ECS state, plays audio chime, and opens cultural fact modal.
   */
  public discoverArtefact(entity: (typeof this.queries.cultural.entities extends Set<infer E> ? E : never)): void {
    const isFound = entity.getValue(CulturalObject, 'discovered');
    const factId = entity.getValue(CulturalObject, 'factId');

    if (!isFound) {
      entity.setValue(CulturalObject, 'discovered', true);
      AudioUtils.play(entity);
    }

    if (factId) {
      this.openFactModal(factId);
    }
  }

  /**
   * Opens the cultural fact modal for a specific artefact ID.
   */
  public openFactModal(factId: string): void {
    const meta = ARTEFACT_DATA[factId];
    if (!meta) return;

    const titleEl = document.getElementById('fact-modal-title');
    const wordEl = document.getElementById('fact-modal-word');
    const bodyEl = document.getElementById('fact-modal-body');

    if (titleEl) titleEl.textContent = meta.title;
    if (wordEl) wordEl.textContent = meta.culturalWord;
    if (bodyEl) bodyEl.textContent = meta.fact;

    this._openModal('fact-modal-backdrop');
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

      if (aspect < 1.1) {
        // Portrait mobile/tablet: increase distance and FOV proportionally so artefacts aren't clipped
        const portraitScale = Math.min(1.1 / Math.max(aspect, 0.4), 2.2);
        const targetZ = baseZ + (portraitScale - 1.0) * 0.42;
        const targetY = baseY + (portraitScale - 1.0) * 0.12;
        const targetFov = 50 + (portraitScale - 1.0) * 10;

        camera.position.set(0, targetY, targetZ);
        camera.fov = targetFov;
      } else {
        // Landscape / desktop
        camera.position.set(0, baseY, baseZ);
        camera.fov = 50;
      }

      camera.aspect = aspect;
      camera.lookAt(0, 0.95, -0.75);
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', update2DCamera, false);
    // Initial camera calibration
    update2DCamera();

    this.cleanupFuncs.push(() => {
      window.removeEventListener('resize', update2DCamera, false);
    });
  }

  private _wireArtefactCards(): void {
    const cards = document.querySelectorAll<HTMLElement>('.artefact-card');
    for (const card of cards) {
      const factId = card.dataset.factId;
      if (!factId) continue;

      const onSelect = (e: Event): void => {
        e.preventDefault();
        // Find matching entity
        for (const entity of this.queries.cultural.entities) {
          if (entity.getValue(CulturalObject, 'factId') === factId) {
            this.discoverArtefact(entity);
            return;
          }
        }
        // Fallback: show modal even if entity not yet loaded
        this.openFactModal(factId);
      };

      card.addEventListener('click', onSelect);
      card.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect(e);
        }
      });
    }
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
    const scrollToArtefacts = (): void => {
      this._closeMobileDrawer();
      const dock = document.getElementById('artefact-dock');
      dock?.scrollIntoView({ behavior: 'smooth' });
    };

    document.getElementById('nav-how-to-play')?.addEventListener('click', openHelp);
    document.getElementById('drawer-link-help')?.addEventListener('click', openHelp);
    document.getElementById('nav-about')?.addEventListener('click', openAbout);
    document.getElementById('drawer-link-about')?.addEventListener('click', openAbout);
    document.getElementById('nav-artefacts')?.addEventListener('click', scrollToArtefacts);
    document.getElementById('drawer-link-artefacts')?.addEventListener('click', scrollToArtefacts);
    document.getElementById('brand-home-btn')?.addEventListener('click', openAbout);

    // Modal Close Buttons
    this._wireModalClose('fact-modal-backdrop', ['fact-modal-close', 'fact-modal-ok']);
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

  private _updateProgressHUD(count: number, total: number): void {
    const counterEl = document.getElementById('web-counter');
    if (counterEl) {
      counterEl.textContent = `${count} / ${total || 4} Discovered`;
    }
    gameShell.updateSpatialDiscovery(count);
  }

  private _updateArtefactCardFound(factId: string): void {
    // Map factId to DOM elements
    const idMap: Record<string, { card: string; badge: string; dot: string }> = {
      'adire-cloth': { card: 'card-adire', badge: 'badge-adire', dot: 'dot-adire' },
      'talking-drum': { card: 'card-drum', badge: 'badge-drum', dot: 'dot-drum' },
      calabash: { card: 'card-calabash', badge: 'badge-calabash', dot: 'dot-calabash' },
      'kola-nut': { card: 'card-kola', badge: 'badge-kola', dot: 'dot-kola' },
    };

    const mapping = idMap[factId];
    if (!mapping) return;

    const card = document.getElementById(mapping.card);
    const badge = document.getElementById(mapping.badge);
    const dot = document.getElementById(mapping.dot);

    if (card && !card.classList.contains('discovered')) {
      card.classList.add('discovered');
    }
    if (badge && badge.textContent !== 'Found ✓') {
      badge.textContent = 'Found ✓';
    }
    if (dot && !dot.classList.contains('active')) {
      dot.classList.add('active');
    }
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
