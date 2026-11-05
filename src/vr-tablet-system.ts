/**
 * Advenquo — In-VR Navigation, World Travel & Journal Tablet System.
 *
 * Coordinates the spatial UI tablet (`vr-nav-tablet`) inside WebXR.
 *
 * Capabilities:
 * - Switches tabs: Missions, Connected World Map, World Now, Passport & Journal, Comfort & Locomotion
 * - Seamless open-world travel across all 4 Nigerian environments in VR
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
import { getAllCombinedStories } from './game/world-now-data.js';
import { WorldStreamingSystem } from './world-streaming-system.js';
import { PlayerControllerSystem } from './player-controller-system.js';
import { loadYorubaFontFamilies } from './yoruba-font.js';

export class VRTabletSystem extends createSystem({}) {
  private tablet: UIKitMLAsset | null = null;
  private activeTab: 'missions' | 'travel' | 'worldnow' | 'journal' | 'settings' = 'missions';
  private currentStoryIndex = 0;

  // Cached views
  private viewMissions: any = null;
  private viewTravel: any = null;
  private viewWorldNow: any = null;
  private viewJournal: any = null;
  private viewSettings: any = null;

  // Cached tab buttons & labels
  private tabBtnMissions: any = null;
  private tabBtnTravel: any = null;
  private tabBtnWorldNow: any = null;
  private tabBtnJournal: any = null;
  private tabBtnSettings: any = null;

  private tabLblMissions: UIKit.Text | null = null;
  private tabLblTravel: UIKit.Text | null = null;
  private tabLblWorldNow: UIKit.Text | null = null;
  private tabLblJournal: UIKit.Text | null = null;
  private tabLblSettings: UIKit.Text | null = null;

  // Cached travel buttons
  private btnTravelMarket: any = null;
  private btnTravelUrban: any = null;
  private btnTravelPalace: any = null;
  private btnTravelBeach: any = null;

  // Cached data elements
  private missionTitleEl: UIKit.Text | null = null;
  private missionPromptEl: UIKit.Text | null = null;
  private missionStepEl: UIKit.Text | null = null;
  private missionXpEl: UIKit.Text | null = null;

  private newsTitleEl: UIKit.Text | null = null;
  private newsSummaryEl: UIKit.Text | null = null;
  private newsSourceEl: UIKit.Text | null = null;
  private newsCounterEl: UIKit.Text | null = null;
  private newsBadgeTextEl: UIKit.Text | null = null;
  private btnNewsPrev: any = null;
  private btnNewsNext: any = null;

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
    void loadYorubaFontFamilies().then((fontFamilies) => {
      this.tablet?.document.rootElement.setProperties({ fontFamilies } as never);
    }).catch((error: unknown) => console.error('Yoruba font atlas failed to load:', error));

    // Cache views
    this.viewMissions = this.tablet.getElementById('view-missions');
    this.viewTravel = this.tablet.getElementById('view-travel');
    this.viewWorldNow = this.tablet.getElementById('view-worldnow');
    this.viewJournal = this.tablet.getElementById('view-journal');
    this.viewSettings = this.tablet.getElementById('view-settings');

    // Cache tab buttons
    this.tabBtnMissions = this.tablet.getElementById('tab-btn-missions');
    this.tabBtnTravel = this.tablet.getElementById('tab-btn-travel');
    this.tabBtnWorldNow = this.tablet.getElementById('tab-btn-worldnow');
    this.tabBtnJournal = this.tablet.getElementById('tab-btn-journal');
    this.tabBtnSettings = this.tablet.getElementById('tab-btn-settings');

    this.tabLblMissions = this.tablet.getElementById<UIKit.Text>('tab-lbl-missions');
    this.tabLblTravel = this.tablet.getElementById<UIKit.Text>('tab-lbl-travel');
    this.tabLblWorldNow = this.tablet.getElementById<UIKit.Text>('tab-lbl-worldnow');
    this.tabLblJournal = this.tablet.getElementById<UIKit.Text>('tab-lbl-journal');
    this.tabLblSettings = this.tablet.getElementById<UIKit.Text>('tab-lbl-settings');

    // Cache travel buttons
    this.btnTravelMarket = this.tablet.getElementById('btn-travel-market');
    this.btnTravelUrban = this.tablet.getElementById('btn-travel-urban');
    this.btnTravelPalace = this.tablet.getElementById('btn-travel-palace');
    this.btnTravelBeach = this.tablet.getElementById('btn-travel-beach');

    // Wire travel buttons
    const onTravelMarket = (): void => {
      WorldStreamingSystem.getInstance()?.travelTo('nigerian_market', 'Lagos Island Artisan Market');
      this._switchTab('travel');
    };
    const onTravelUrban = (): void => {
      WorldStreamingSystem.getInstance()?.travelTo('lagos_urban', 'Danfo Bus to Yaba Silicon Lagoon');
      this._switchTab('travel');
    };
    const onTravelPalace = (): void => {
      WorldStreamingSystem.getInstance()?.travelTo('heritage_iga', 'Royal Procession to Iga Idunganran Palace');
      this._switchTab('travel');
    };
    const onTravelBeach = (): void => {
      WorldStreamingSystem.getInstance()?.travelTo('beach_waterfront', 'Harbour Ferry to Tarkwa Bay Coastal Haven');
      this._switchTab('travel');
    };

    this.btnTravelMarket?.addEventListener('click', onTravelMarket);
    this.btnTravelUrban?.addEventListener('click', onTravelUrban);
    this.btnTravelPalace?.addEventListener('click', onTravelPalace);
    this.btnTravelBeach?.addEventListener('click', onTravelBeach);

    // Cache mission elements
    this.missionTitleEl = this.tablet.getElementById<UIKit.Text>('tablet-mission-title');
    this.missionPromptEl = this.tablet.getElementById<UIKit.Text>('tablet-mission-prompt');
    this.missionStepEl = this.tablet.getElementById<UIKit.Text>('tablet-step-text');
    this.missionXpEl = this.tablet.getElementById<UIKit.Text>('tablet-xp-text');

    // Cache news elements
    this.newsTitleEl = this.tablet.getElementById<UIKit.Text>('tablet-news-title');
    this.newsSummaryEl = this.tablet.getElementById<UIKit.Text>('tablet-news-summary');
    this.newsSourceEl = this.tablet.getElementById<UIKit.Text>('tablet-news-source');
    this.newsCounterEl = this.tablet.getElementById<UIKit.Text>('tablet-news-counter');
    this.newsBadgeTextEl = this.tablet.getElementById<UIKit.Text>('tablet-news-badge-text');
    this.btnNewsPrev = this.tablet.getElementById('btn-news-prev');
    this.btnNewsNext = this.tablet.getElementById('btn-news-next');

    // Wire news navigation
    const onNewsPrev = (): void => {
      const stories = getAllCombinedStories();
      if (stories.length === 0) return;
      this.currentStoryIndex = (this.currentStoryIndex - 1 + stories.length) % stories.length;
      this._refreshData();
    };

    const onNewsNext = (): void => {
      const stories = getAllCombinedStories();
      if (stories.length === 0) return;
      this.currentStoryIndex = (this.currentStoryIndex + 1) % stories.length;
      this._refreshData();
    };

    this.btnNewsPrev?.addEventListener('click', onNewsPrev);
    this.btnNewsNext?.addEventListener('click', onNewsNext);

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
    const onTravelTab = (): void => this._switchTab('travel');
    const onWorldNowTab = (): void => this._switchTab('worldnow');
    const onJournalTab = (): void => this._switchTab('journal');
    const onSettingsTab = (): void => this._switchTab('settings');

    this.tabBtnMissions?.addEventListener('click', onMissionsTab);
    this.tabBtnTravel?.addEventListener('click', onTravelTab);
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
      () => this.tabBtnTravel?.removeEventListener('click', onTravelTab),
      () => this.tabBtnWorldNow?.removeEventListener('click', onWorldNowTab),
      () => this.tabBtnJournal?.removeEventListener('click', onJournalTab),
      () => this.tabBtnSettings?.removeEventListener('click', onSettingsTab),
      () => this.btnTravelMarket?.removeEventListener('click', onTravelMarket),
      () => this.btnTravelUrban?.removeEventListener('click', onTravelUrban),
      () => this.btnTravelPalace?.removeEventListener('click', onTravelPalace),
      () => this.btnTravelBeach?.removeEventListener('click', onTravelBeach),
      () => this.btnToggleTurn?.removeEventListener('click', onToggleTurn),
      () => this.btnToggleVignette?.removeEventListener('click', onToggleVignette),
      () => this.btnResetPos?.removeEventListener('click', onResetPos),
      () => this.btnNewsPrev?.removeEventListener('click', onNewsPrev),
      () => this.btnNewsNext?.removeEventListener('click', onNewsNext),
    );

    // Initial update
    this._refreshData();
  }

  update(delta: number): void {
    // Keep data fresh periodically
  }

  private _switchTab(tab: 'missions' | 'travel' | 'worldnow' | 'journal' | 'settings'): void {
    this.activeTab = tab;

    // Toggle views
    this.viewMissions?.setProperties({ display: tab === 'missions' ? 'flex' : 'none' });
    this.viewTravel?.setProperties({ display: tab === 'travel' ? 'flex' : 'none' });
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

    this.tabBtnTravel?.setProperties({
      backgroundColor: tab === 'travel' ? '#f5d370' : 'rgba(255, 255, 255, 0.1)',
    });
    this.tabLblTravel?.setProperties({
      color: tab === 'travel' ? '#1a237e' : '#ffffff',
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
    this.missionXpEl?.setProperties({ text: `+${curMission.learningObjectives[0]?.xpReward || 150} XP` } as never);

    // 2. Refresh World Now News
    const stories = getAllCombinedStories();
    if (stories.length > 0) {
      const story = stories[this.currentStoryIndex % stories.length];
      this.newsTitleEl?.setProperties({ text: story.headline } as never);
      this.newsSummaryEl?.setProperties({ text: story.summary } as never);
      this.newsSourceEl?.setProperties({ text: `Source: ${story.publisher}` } as never);
      this.newsCounterEl?.setProperties({
        text: `Story ${(this.currentStoryIndex % stories.length) + 1} / ${stories.length}`,
      } as never);
      this.newsBadgeTextEl?.setProperties({
        text: `${story.verificationLevel.toUpperCase()} • ${story.category.toUpperCase()}`,
      } as never);
    }

    // 3. Refresh Journal & Profile
    this.levelEl?.setProperties({ text: `Level ${state.profile.guardianLevel}` } as never);
    this.xpEl?.setProperties({ text: `${state.profile.totalXp} XP` } as never);
    this.stampsEl?.setProperties({
      text: `${state.passport.stamps.length} / 4 Stamps`,
    } as never);

    if (state.passport.vocabulary.length > 0) {
      const vocab = state.passport.vocabulary[state.passport.vocabulary.length - 1];
      this.vocabEl?.setProperties({
        text: `"${vocab.term}" — ${vocab.englishGloss}`,
      } as never);
    }
  }

  private _toggleTurningMethod(): void {
    const locomotionSystem = this.world.getSystem(LocomotionSystem);
    if (!locomotionSystem) return;

    this.isSnapTurn = !this.isSnapTurn;
    const newMethod = this.isSnapTurn ? TurningMethod.SnapTurn : TurningMethod.SmoothTurn;
    locomotionSystem.config.turningMethod.value = newMethod;

    this.lblToggleTurn?.setProperties({
      text: this.isSnapTurn ? 'Snap Turn (45°)' : 'Smooth Turn (180°/s)',
    } as never);
  }

  private _toggleComfortVignette(): void {
    const locomotionSystem = this.world.getSystem(LocomotionSystem);
    if (!locomotionSystem) return;

    this.isVignetteActive = !this.isVignetteActive;
    locomotionSystem.config.comfortAssist.value = this.isVignetteActive ? 0.5 : 0.0;

    this.lblToggleVignette?.setProperties({
      text: this.isVignetteActive ? 'Active (Low Motion)' : 'Disabled (Full Field)',
    } as never);
  }

  private _resetPlayerPosition(): void {
    const curLoc = WorldStreamingSystem.getInstance()?.getCurrentLocation();
    const spawnX = curLoc?.spawnPosition[0] || 0;
    const spawnZ = curLoc?.spawnPosition[2] || 0;

    const locomotionSystem = this.world.getSystem(LocomotionSystem);
    if (locomotionSystem) {
      locomotionSystem.setPlayerPosition(new Vector3(spawnX, 0, spawnZ));
    }
    const pc = PlayerControllerSystem.getInstance();
    if (pc) {
      pc.teleportTo(spawnX, spawnZ, 0);
    }
  }
}
