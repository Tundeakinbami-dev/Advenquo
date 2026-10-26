/**
 * Advenquo — In-VR Navigation & Journal Tablet System.
 *
 * Coordinates the spatial UI tablet (`vr-nav-tablet`) inside WebXR.
 *
 * Capabilities:
 * - Switches tabs: Missions, World Now, Passport & Journal, Comfort & Locomotion
 * - Real-time comfort & locomotion tuning:
 *   - Toggles Snap Turn (45°) vs Smooth Turn on `LocomotionSystem`
 *   - Adjusts Comfort Assist vignette strength
 *   - Returns player to safe origin [0, 0, 0]
 * - Displays active mission objectives and persistent progress (XP, Level, Vocabulary)
 * - Presents verified contemporary World Now intelligence reports
 */

import {
  createSystem,
  LocomotionSystem,
  TurningMethod,
  UIKit,
  UIKitMLAsset,
  Vector3,
} from '@iwsdk/core';

import { missionEngine } from './game/mission-engine.js';
import { storage } from './game/storage.js';
import { WORLD_NOW_STORIES } from './game/world-now-data.js';

export class VRTabletSystem extends createSystem({}) {
  private tablet: UIKitMLAsset | null = null;
  private activeTab: 'missions' | 'worldnow' | 'journal' | 'settings' = 'missions';

  // Cached views
  private viewMissions: any = null;
  private viewWorldNow: any = null;
  private viewJournal: any = null;
  private viewSettings: any = null;

  // Cached tab buttons & labels
  private tabBtnMissions: any = null;
  private tabBtnWorldNow: any = null;
  private tabBtnJournal: any = null;
  private tabBtnSettings: any = null;

  private tabLblMissions: UIKit.Text | null = null;
  private tabLblWorldNow: UIKit.Text | null = null;
  private tabLblJournal: UIKit.Text | null = null;
  private tabLblSettings: UIKit.Text | null = null;

  // Cached data elements
  private missionTitleEl: UIKit.Text | null = null;
  private missionPromptEl: UIKit.Text | null = null;
  private missionStepEl: UIKit.Text | null = null;
  private missionXpEl: UIKit.Text | null = null;

  private newsTitleEl: UIKit.Text | null = null;
  private newsSummaryEl: UIKit.Text | null = null;
  private newsSourceEl: UIKit.Text | null = null;

  private levelEl: UIKit.Text | null = null;
  private xpEl: UIKit.Text | null = null;
  private stampsEl: UIKit.Text | null = null;
  private vocabEl: UIKit.Text | null = null;

  private btnToggleTurn: any = null;
  private lblToggleTurn: UIKit.Text | null = null;
  private btnToggleVignette: any = null;
  private lblToggleVignette: UIKit.Text | null = null;
  private btnResetPos: any = null;

  // Locomotion state cache
  private isSnapTurn = true;
  private isVignetteActive = true;

  init(): void {
    this.tablet = this.world.getSceneObject<UIKitMLAsset>('vr-nav-tablet') ?? null;
    if (!this.tablet) return;

    // Cache views
    this.viewMissions = this.tablet.getElementById('view-missions');
    this.viewWorldNow = this.tablet.getElementById('view-worldnow');
    this.viewJournal = this.tablet.getElementById('view-journal');
    this.viewSettings = this.tablet.getElementById('view-settings');

    // Cache tab buttons
    this.tabBtnMissions = this.tablet.getElementById('tab-btn-missions');
    this.tabBtnWorldNow = this.tablet.getElementById('tab-btn-worldnow');
    this.tabBtnJournal = this.tablet.getElementById('tab-btn-journal');
    this.tabBtnSettings = this.tablet.getElementById('tab-btn-settings');

    this.tabLblMissions = this.tablet.getElementById<UIKit.Text>('tab-lbl-missions');
    this.tabLblWorldNow = this.tablet.getElementById<UIKit.Text>('tab-lbl-worldnow');
    this.tabLblJournal = this.tablet.getElementById<UIKit.Text>('tab-lbl-journal');
    this.tabLblSettings = this.tablet.getElementById<UIKit.Text>('tab-lbl-settings');

    // Cache mission elements
    this.missionTitleEl = this.tablet.getElementById<UIKit.Text>('tablet-mission-title');
    this.missionPromptEl = this.tablet.getElementById<UIKit.Text>('tablet-mission-prompt');
    this.missionStepEl = this.tablet.getElementById<UIKit.Text>('tablet-step-text');
    this.missionXpEl = this.tablet.getElementById<UIKit.Text>('tablet-xp-text');

    // Cache news elements
    this.newsTitleEl = this.tablet.getElementById<UIKit.Text>('tablet-news-title');
    this.newsSummaryEl = this.tablet.getElementById<UIKit.Text>('tablet-news-summary');
    this.newsSourceEl = this.tablet.getElementById<UIKit.Text>('tablet-news-source');

    // Cache journal elements
    this.levelEl = this.tablet.getElementById<UIKit.Text>('tablet-player-level');
    this.xpEl = this.tablet.getElementById<UIKit.Text>('tablet-player-xp');
    this.stampsEl = this.tablet.getElementById<UIKit.Text>('tablet-stamps-count');
    this.vocabEl = this.tablet.getElementById<UIKit.Text>('tablet-vocab-preview');

    // Cache settings buttons
    this.btnToggleTurn = this.tablet.getElementById('btn-toggle-turn');
    this.lblToggleTurn = this.tablet.getElementById<UIKit.Text>('lbl-toggle-turn');
    this.btnToggleVignette = this.tablet.getElementById('btn-toggle-vignette');
    this.lblToggleVignette = this.tablet.getElementById<UIKit.Text>('lbl-toggle-vignette');
    this.btnResetPos = this.tablet.getElementById('btn-reset-pos');

    // Wire Tab Clicks
    const onMissionsTab = (): void => this._switchTab('missions');
    const onWorldNowTab = (): void => this._switchTab('worldnow');
    const onJournalTab = (): void => this._switchTab('journal');
    const onSettingsTab = (): void => this._switchTab('settings');

    this.tabBtnMissions?.addEventListener('click', onMissionsTab);
    this.tabBtnWorldNow?.addEventListener('click', onWorldNowTab);
    this.tabBtnJournal?.addEventListener('click', onJournalTab);
    this.tabBtnSettings?.addEventListener('click', onSettingsTab);

    // Wire Settings actions
    const onToggleTurn = (): void => this._toggleTurningMethod();
    const onToggleVignette = (): void => this._toggleComfortVignette();
    const onResetPos = (): void => this._resetPlayerPosition();

    this.btnToggleTurn?.addEventListener('click', onToggleTurn);
    this.btnToggleVignette?.addEventListener('click', onToggleVignette);
    this.btnResetPos?.addEventListener('click', onResetPos);

    this.cleanupFuncs.push(
      () => this.tabBtnMissions?.removeEventListener('click', onMissionsTab),
      () => this.tabBtnWorldNow?.removeEventListener('click', onWorldNowTab),
      () => this.tabBtnJournal?.removeEventListener('click', onJournalTab),
      () => this.tabBtnSettings?.removeEventListener('click', onSettingsTab),
      () => this.btnToggleTurn?.removeEventListener('click', onToggleTurn),
      () => this.btnToggleVignette?.removeEventListener('click', onToggleVignette),
      () => this.btnResetPos?.removeEventListener('click', onResetPos),
    );

    // Initial update
    this._refreshData();
  }

  update(delta: number): void {
    // Keep data fresh periodically
  }

  private _switchTab(tab: 'missions' | 'worldnow' | 'journal' | 'settings'): void {
    this.activeTab = tab;

    // Toggle views
    this.viewMissions?.setProperties({ display: tab === 'missions' ? 'flex' : 'none' });
    this.viewWorldNow?.setProperties({ display: tab === 'worldnow' ? 'flex' : 'none' });
    this.viewJournal?.setProperties({ display: tab === 'journal' ? 'flex' : 'none' });
    this.viewSettings?.setProperties({ display: tab === 'settings' ? 'flex' : 'none' });

    // Update tab bar styles
    this.tabBtnMissions?.setProperties({
      backgroundColor: tab === 'missions' ? '#f5d370' : 'rgba(255, 255, 255, 0.1)',
    });
    this.tabLblMissions?.setProperties({
      color: tab === 'missions' ? '#1a237e' : '#ffffff',
    });

    this.tabBtnWorldNow?.setProperties({
      backgroundColor: tab === 'worldnow' ? '#f5d370' : 'rgba(255, 255, 255, 0.1)',
    });
    this.tabLblWorldNow?.setProperties({
      color: tab === 'worldnow' ? '#1a237e' : '#ffffff',
    });

    this.tabBtnJournal?.setProperties({
      backgroundColor: tab === 'journal' ? '#f5d370' : 'rgba(255, 255, 255, 0.1)',
    });
    this.tabLblJournal?.setProperties({
      color: tab === 'journal' ? '#1a237e' : '#ffffff',
    });

    this.tabBtnSettings?.setProperties({
      backgroundColor: tab === 'settings' ? '#f5d370' : 'rgba(255, 255, 255, 0.1)',
    });
    this.tabLblSettings?.setProperties({
      color: tab === 'settings' ? '#1a237e' : '#ffffff',
    });

    this._refreshData();
  }

  private _refreshData(): void {
    const state = storage.getState();

    // 1. Refresh Missions view
    const active = missionEngine.getActiveMissionState();
    const allMissions = missionEngine.getAllMissions();
    const curMission = allMissions.find((m) => m.id === (active?.missionId || 'mission_yoruba_greetings')) || allMissions[0];
    const curStep = curMission.steps[active?.currentStepIndex || 0] || curMission.steps[0];

    this.missionTitleEl?.setProperties({ text: curMission.title } as never);
    this.missionPromptEl?.setProperties({ text: curStep.prompt } as never);
    this.missionStepEl?.setProperties({
      text: `Step ${(active?.currentStepIndex || 0) + 1} of ${curMission.steps.length}`,
    } as never);
    this.missionXpEl?.setProperties({ text: `+${curMission.rewards.xp} XP` } as never);

    // 2. Refresh World Now view
    const latestStory = WORLD_NOW_STORIES[0];
    if (latestStory) {
      this.newsTitleEl?.setProperties({ text: latestStory.headline } as never);
      this.newsSummaryEl?.setProperties({ text: latestStory.summary } as never);
      this.newsSourceEl?.setProperties({
        text: `Publisher: ${latestStory.publisher} (${latestStory.publishedAt})`,
      } as never);
    }

    // 3. Refresh Journal view
    this.levelEl?.setProperties({ text: `${state.profile.guardianLevel}` } as never);
    this.xpEl?.setProperties({ text: `${state.profile.totalXp}` } as never);
    this.stampsEl?.setProperties({ text: `${state.passport.stamps.length} / 5` } as never);

    if (state.passport.vocabulary.length > 0) {
      const vocab = state.passport.vocabulary[state.passport.vocabulary.length - 1];
      this.vocabEl?.setProperties({
        text: `"${vocab.term}" (${vocab.phonetic}) — ${vocab.englishGloss}`,
      } as never);
    }
  }

  private _toggleTurningMethod(): void {
    this.isSnapTurn = !this.isSnapTurn;
    const locomotion = this.world.getSystem(LocomotionSystem);
    if (locomotion) {
      locomotion.config.turningMethod.value = this.isSnapTurn
        ? TurningMethod.SnapTurn
        : TurningMethod.SmoothTurn;
    }
    this.lblToggleTurn?.setProperties({
      text: this.isSnapTurn ? 'Snap Turn (45°)' : 'Smooth Turn (180°/s)',
    } as never);
  }

  private _toggleComfortVignette(): void {
    this.isVignetteActive = !this.isVignetteActive;
    const locomotion = this.world.getSystem(LocomotionSystem);
    if (locomotion) {
      locomotion.config.comfortAssist.value = this.isVignetteActive ? 0.5 : 0.0;
    }
    this.lblToggleVignette?.setProperties({
      text: this.isVignetteActive ? 'Active (Low Motion)' : 'Disabled (Free)',
    } as never);
  }

  private _resetPlayerPosition(): void {
    const locomotion = this.world.getSystem(LocomotionSystem);
    if (locomotion) {
      locomotion.setPlayerPosition(new Vector3(0, 0, 0));
    }
    if (this.player) {
      this.player.position.set(0, 0, 0);
    }
  }
}
