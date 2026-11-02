/**
 * Advenquo: UI Components and Template Rendering
 *
 * Implements the responsive, atmospheric hybrid adventure interface.
 * Clean, accessible DOM components with rich styling, high contrast,
 * and zero external CSS dependencies.
 */

import type {
  ActiveMissionState,
  ChallengeLevel,
  Destination,
  GameSaveState,
  MissionDefinition,
  MissionStep,
  PointOfInterest,
  WorldNowStory,
} from './types.js';
import type { ChoiceEvaluationResult, MissionCompletionResult } from './mission-engine.js';

export function injectAppStyles(): void {
  const existing = document.getElementById('advenquo-styles');
  if (existing) return;

  const style = document.createElement('style');
  style.id = 'advenquo-styles';
  style.textContent = `
    :root {
      --bg-dark: #080c16;
      --bg-panel: rgba(16, 24, 40, 0.94);
      --bg-card: rgba(26, 38, 62, 0.88);
      --bg-card-hover: rgba(38, 55, 88, 0.95);
      --gold-accent: #f5d370;
      --gold-hover: #ffe494;
      --gold-deep: #c99e32;
      --indigo-accent: #4a90d9;
      --text-main: #f0f4fc;
      --text-muted: #9bb0cf;
      --text-dim: #627899;
      --border-panel: rgba(245, 211, 112, 0.25);
      --border-card: rgba(74, 144, 217, 0.3);
      --success-green: #34d399;
      --tag-verified: #10b981;
      --shadow-lg: 0 16px 36px rgba(0, 0, 0, 0.6);
      --font-stack: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }

    * { box-sizing: border-box; }

    #advenquo-shell {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      font-family: var(--font-stack);
      color: var(--text-main);
      pointer-events: none;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      user-select: none;
      overflow: hidden;
    }

    .shell-active-interactive {
      pointer-events: auto !important;
    }

    /* Top Navigation Bar */
    .top-nav-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 24px;
      background: linear-gradient(180deg, rgba(8, 12, 22, 0.96) 0%, rgba(8, 12, 22, 0.8) 100%);
      border-bottom: 1px solid var(--border-panel);
      backdrop-filter: blur(12px);
      pointer-events: auto;
      z-index: 100;
    }

    .brand-section {
      display: flex;
      flex-direction: column;
      cursor: pointer;
    }

    .brand-title {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 2px;
      color: var(--gold-accent);
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .brand-subtitle {
      font-size: 11px;
      letter-spacing: 0.5px;
      color: var(--text-muted);
    }

    .nav-tabs {
      display: flex;
      gap: 6px;
      background: rgba(0, 0, 0, 0.4);
      padding: 4px;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .nav-tab-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
    }

    .nav-tab-btn:hover {
      color: var(--text-main);
      background: rgba(255, 255, 255, 0.06);
    }

    .nav-tab-btn.active {
      color: var(--bg-dark);
      background: var(--gold-accent);
      font-weight: 700;
    }

    .user-profile-badge {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(255, 255, 255, 0.04);
      padding: 6px 14px;
      border-radius: 30px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      cursor: pointer;
    }

    .profile-avatar {
      font-size: 20px;
    }

    .profile-info {
      display: flex;
      flex-direction: column;
    }

    .profile-name {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-main);
    }

    .profile-level {
      font-size: 11px;
      color: var(--gold-accent);
    }

    /* Main Content Area */
    .shell-view-container {
      flex: 1;
      overflow-y: auto;
      pointer-events: auto;
      padding: 24px;
      display: flex;
      justify-content: center;
      position: relative;
    }

    .view-card-max {
      max-width: 1180px;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* Modals & Overlays */
    .advenquo-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(4, 6, 12, 0.85);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      pointer-events: auto;
      z-index: 2000;
    }

    .advenquo-modal-content {
      background: var(--bg-panel);
      border: 1px solid var(--border-panel);
      border-radius: 16px;
      box-shadow: var(--shadow-lg);
      max-width: 680px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      animation: modalFadeIn 0.25s ease-out;
    }

    @keyframes modalFadeIn {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }

    .modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .modal-title {
      font-size: 20px;
      font-weight: 700;
      color: var(--gold-accent);
      margin: 0;
    }

    .modal-body {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    /* Buttons */
    .btn-gold {
      background: var(--gold-accent);
      color: var(--bg-dark);
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-gold:hover {
      background: var(--gold-hover);
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.08);
      color: var(--text-main);
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 10px 18px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.14);
    }

    /* District Tabs & POI Cards */
    .district-nav-tabs {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }

    .district-pill {
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      padding: 12px 20px;
      border-radius: 12px;
      cursor: pointer;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
      transition: all 0.2s ease;
    }

    .district-pill.active {
      border-color: var(--gold-accent);
      background: rgba(245, 211, 112, 0.08);
    }

    .district-pill-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-main);
    }

    .district-pill.active .district-pill-title {
      color: var(--gold-accent);
    }

    .district-pill-desc {
      font-size: 12px;
      color: var(--text-muted);
    }

    .poi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
      gap: 16px;
    }

    .poi-card {
      background: var(--bg-card);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .poi-card:hover {
      border-color: var(--indigo-accent);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    }

    .poi-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .poi-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--text-main);
    }

    .poi-tag {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      background: rgba(74, 144, 217, 0.2);
      color: var(--indigo-accent);
    }

    .poi-desc {
      font-size: 13px;
      color: var(--text-muted);
      line-height: 1.4;
      flex: 1;
    }

    .poi-significance {
      font-size: 12px;
      color: var(--gold-accent);
      background: rgba(245, 211, 112, 0.06);
      padding: 8px 10px;
      border-radius: 6px;
      line-height: 1.3;
    }

    /* World Now Cards */
    .story-card {
      background: var(--bg-card);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      transition: all 0.2s ease;
    }

    .story-card:hover {
      border-color: var(--gold-accent);
    }

    .story-meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
      font-size: 12px;
      color: var(--text-dim);
    }

    .badge-verified {
      background: rgba(16, 185, 129, 0.2);
      color: var(--tag-verified);
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .badge-developing {
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .badge-corrected {
      background: rgba(147, 51, 234, 0.2);
      color: #c084fc;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .filter-pill {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: var(--text-muted);
      border-radius: 20px;
      padding: 6px 14px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      user-select: none;
    }

    .filter-pill:hover {
      background: rgba(255, 255, 255, 0.12);
      color: var(--text-main);
    }

    .filter-pill.active {
      background: var(--gold-accent);
      color: #0a1024;
      border-color: var(--gold-accent);
      font-weight: 700;
    }

    .story-headline {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-main);
      margin: 0;
      line-height: 1.35;
    }

    .story-summary {
      font-size: 14px;
      color: var(--text-muted);
      line-height: 1.5;
    }

    .story-highlights {
      background: rgba(0, 0, 0, 0.25);
      border-left: 3px solid var(--gold-accent);
      padding: 10px 14px;
      border-radius: 0 8px 8px 0;
    }

    .story-highlights ul {
      margin: 0;
      padding-left: 18px;
      font-size: 13px;
      color: var(--text-main);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    /* Passport & Journal */
    .passport-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .stat-box {
      background: var(--bg-card);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .stat-label {
      font-size: 12px;
      color: var(--text-dim);
      text-transform: uppercase;
      font-weight: 700;
    }

    .stat-value {
      font-size: 26px;
      font-weight: 800;
      color: var(--gold-accent);
    }

    .skill-bar-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 8px;
    }

    .skill-bar-header {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: var(--text-muted);
    }

    .skill-progress-track {
      height: 8px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      overflow: hidden;
    }

    .skill-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--indigo-accent), var(--gold-accent));
      border-radius: 4px;
    }

    /* Floating 3D Encounter HUD */
    .spatial-encounter-hud {
      position: fixed;
      top: 76px;
      right: 24px;
      background: rgba(10, 14, 24, 0.92);
      border: 1px solid var(--border-panel);
      backdrop-filter: blur(12px);
      border-radius: 14px;
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-shadow: var(--shadow-lg);
      max-width: 320px;
      pointer-events: auto;
      z-index: 1000;
    }

    .spatial-hud-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--gold-accent);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .spatial-hud-body {
      font-size: 12px;
      color: var(--text-muted);
      line-height: 1.4;
    }

    /* Mission Modal Choices */
    .choice-button {
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 10px;
      padding: 14px 18px;
      color: var(--text-main);
      font-size: 14px;
      line-height: 1.4;
      text-align: left;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .choice-button:hover {
      border-color: var(--gold-accent);
      background: rgba(245, 211, 112, 0.08);
    }

    .choice-button.selected-correct {
      border-color: var(--tag-verified);
      background: rgba(16, 185, 129, 0.15);
    }

    .choice-button.selected-incorrect {
      border-color: #ef4444;
      background: rgba(239, 68, 68, 0.15);
    }
  `;

  document.head.appendChild(style);
}

export function renderTopNavBar(
  activeTab: string,
  state: GameSaveState,
  onTabSelect: (tab: string) => void,
  onProfileClick: () => void,
): HTMLElement {
  const bar = document.createElement('header');
  bar.className = 'top-nav-bar';

  bar.innerHTML = `
    <div class="brand-section" id="btn-brand-home">
      <div class="brand-title">🌍 ADVENQUO</div>
      <div class="brand-subtitle">Global Cultural & Linguistic Adventure</div>
    </div>

    <nav class="nav-tabs">
      <button class="nav-tab-btn ${activeTab === 'map' ? 'active' : ''}" data-tab="map">
        🗺️ World Map
      </button>
      <button class="nav-tab-btn ${activeTab === 'district' ? 'active' : ''}" data-tab="district">
        📍 Exploration
      </button>
      <button class="nav-tab-btn ${activeTab === 'spatial' ? 'active' : ''}" data-tab="spatial">
        🏺 3D Encounters
      </button>
      <button class="nav-tab-btn ${activeTab === 'world_now' ? 'active' : ''}" data-tab="world_now">
        📰 World Now
      </button>
      <button class="nav-tab-btn ${activeTab === 'passport' ? 'active' : ''}" data-tab="passport">
        📖 Passport & Journal
      </button>
    </nav>

    <div class="user-profile-badge" id="btn-user-profile" title="Edit Profile & Challenge Level">
      <span class="profile-avatar">${state.profile.avatar}</span>
      <div class="profile-info">
        <span class="profile-name">${state.profile.name}</span>
        <span class="profile-level">Level ${state.profile.guardianLevel} Guardian · ${state.profile.totalXp} XP</span>
      </div>
    </div>
  `;

  bar.querySelector('#btn-brand-home')?.addEventListener('click', () => onTabSelect('map'));
  bar.querySelector('#btn-user-profile')?.addEventListener('click', onProfileClick);

  bar.querySelectorAll('.nav-tab-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const target = (e.currentTarget as HTMLElement).getAttribute('data-tab');
      if (target) onTabSelect(target);
    });
  });

  return bar;
}

export function renderGlobalMapView(
  destinations: Destination[],
  selectedDestinationId: string,
  onSelectDestination: (destId: string) => void,
  onEnterDestination: (destId: string) => void,
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'view-card-max';

  const selectedDest = destinations.find((d) => d.id === selectedDestinationId) || destinations[0];

  container.innerHTML = `
    <div style="background: var(--bg-panel); border: 1px solid var(--border-panel); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h2 style="font-size: 24px; color: var(--gold-accent); margin: 0 0 6px 0;">Interactive World Atlas</h2>
          <p style="font-size: 14px; color: var(--text-muted); margin: 0;">Select a destination to explore its cultural quarters, languages, and living history.</p>
        </div>
        <span style="background: rgba(245, 211, 112, 0.1); border: 1px solid var(--gold-accent); color: var(--gold-accent); padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700;">
          Inaugural Destination: Nigeria
        </span>
      </div>

      <!-- Stylized Interactive Territory Map Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px;">
        ${destinations
          .map(
            (dest) => `
          <div class="destination-card" data-dest-id="${dest.id}" style="
            background: ${dest.id === selectedDestinationId ? 'rgba(245, 211, 112, 0.08)' : 'var(--bg-card)'};
            border: 1px solid ${dest.id === selectedDestinationId ? 'var(--gold-accent)' : 'rgba(255, 255, 255, 0.08)'};
            border-radius: 12px;
            padding: 16px;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            gap: 10px;
            transition: all 0.2s ease;
          ">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 16px; font-weight: 700; color: var(--text-main);">${dest.name}</span>
              <span style="
                font-size: 10px;
                font-weight: 700;
                padding: 2px 8px;
                border-radius: 4px;
                background: ${dest.status === 'PLAYABLE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(156, 163, 175, 0.2)'};
                color: ${dest.status === 'PLAYABLE' ? 'var(--tag-verified)' : '#9ca3af'};
              ">
                ${dest.status === 'PLAYABLE' ? '● PLAYABLE' : 'PREVIEW ONLY'}
              </span>
            </div>
            <p style="font-size: 12px; color: var(--text-muted); line-height: 1.4; margin: 0;">${dest.description}</p>
            <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--text-dim);">
              <span>Region: ${dest.regionName}</span>
              ${dest.districts.length > 0 ? `<span style="color: var(--indigo-accent); font-weight: 600;">${dest.districts.length} Districts Available</span>` : ''}
            </div>
          </div>
        `,
          )
          .join('')}
      </div>

      <!-- Selected Destination Overview Banner -->
      <div style="background: rgba(0, 0, 0, 0.35); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div style="max-width: 650px;">
          <h3 style="font-size: 18px; color: var(--gold-accent); margin: 0 0 6px 0;">Destination: ${selectedDest.name}</h3>
          <p style="font-size: 13px; color: var(--text-muted); margin: 0; line-height: 1.4;">${selectedDest.description}</p>
        </div>
        ${
          selectedDest.status === 'PLAYABLE'
            ? `<button class="btn-gold" id="btn-enter-destination">
                Explore Districts (${selectedDest.districts.length}) →
              </button>`
            : `<button class="btn-secondary" disabled style="opacity: 0.6; cursor: not-allowed;">
                Locked in Preview
              </button>`
        }
      </div>
    </div>
  `;

  container.querySelectorAll('.destination-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      const destId = (e.currentTarget as HTMLElement).getAttribute('data-dest-id');
      if (destId) onSelectDestination(destId);
    });
  });

  container.querySelector('#btn-enter-destination')?.addEventListener('click', () => {
    onEnterDestination(selectedDestinationId);
  });

  return container;
}

export function renderDistrictExplorationView(
  destination: Destination,
  activeDistrictId: string,
  onSelectDistrict: (districtId: string) => void,
  onSelectPOI: (poi: PointOfInterest) => void,
  onStartMission: (missionId: string) => void,
  onEnterSpatialEncounter: (assetId: string) => void,
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'view-card-max';

  const currentDistrict =
    destination.districts.find((d) => d.id === activeDistrictId) || destination.districts[0];

  container.innerHTML = `
    <!-- District Selection Pills -->
    <div class="district-nav-tabs">
      ${destination.districts
        .map(
          (district) => `
        <div class="district-pill ${district.id === currentDistrict.id ? 'active' : ''}" data-district-id="${district.id}">
          <div class="district-pill-title">${district.name}</div>
          <div class="district-pill-desc">${district.tagline}</div>
        </div>
      `,
        )
        .join('')}
    </div>

    <!-- Active District Canvas / Banner -->
    <div style="background: var(--bg-panel); border: 1px solid var(--border-panel); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
        <div>
          <h2 style="font-size: 22px; color: var(--gold-accent); margin: 0 0 4px 0;">${currentDistrict.localName}</h2>
          <p style="font-size: 14px; color: var(--text-muted); margin: 0;">${currentDistrict.description}</p>
        </div>
        <span style="background: rgba(74, 144, 217, 0.15); color: var(--indigo-accent); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700;">
          Theme: ${currentDistrict.theme}
        </span>
      </div>

      <!-- Points of Interest Section -->
      <div>
        <h3 style="font-size: 16px; color: var(--text-main); margin: 0 0 14px 0; display: flex; align-items: center; gap: 8px;">
          📍 Interactive Points of Interest & Encounters
        </h3>
        <div class="poi-grid">
          ${currentDistrict.pointsOfInterest
            .map(
              (poi) => `
            <div class="poi-card" data-poi-id="${poi.id}">
              <div class="poi-header">
                <span class="poi-title">${poi.name}</span>
                <span class="poi-tag">${poi.type}</span>
              </div>
              <p class="poi-desc">${poi.description}</p>
              <div class="poi-significance">
                <strong>Cultural Significance:</strong> ${poi.culturalSignificance}
              </div>
              <div style="display: flex; gap: 8px; margin-top: 8px;">
                ${
                  poi.linkedMissionId
                    ? `<button class="btn-gold btn-start-mission" data-mission-id="${poi.linkedMissionId}" style="flex: 1; padding: 6px 10px; font-size: 12px; justify-content: center;">
                        Start Mission →
                      </button>`
                    : ''
                }
                ${
                  poi.spatialAssetId
                    ? `<button class="btn-gold btn-enter-spatial" data-spatial-id="${poi.spatialAssetId}" style="flex: 1; padding: 6px 10px; font-size: 12px; justify-content: center; background: #6366f1; color: white;">
                        Enter 3D Room 🏺
                      </button>`
                    : ''
                }
              </div>
            </div>
          `,
            )
            .join('')}
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll('.district-pill').forEach((pill) => {
    pill.addEventListener('click', (e) => {
      const dId = (e.currentTarget as HTMLElement).getAttribute('data-district-id');
      if (dId) onSelectDistrict(dId);
    });
  });

  container.querySelectorAll('.poi-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('.btn-start-mission') || target.closest('.btn-enter-spatial')) return;
      const poiId = (e.currentTarget as HTMLElement).getAttribute('data-poi-id');
      const poi = currentDistrict.pointsOfInterest.find((p) => p.id === poiId);
      if (poi) onSelectPOI(poi);
    });
  });

  container.querySelectorAll('.btn-start-mission').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const mId = (e.currentTarget as HTMLElement).getAttribute('data-mission-id');
      if (mId) onStartMission(mId);
    });
  });

  container.querySelectorAll('.btn-enter-spatial').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const sId = (e.currentTarget as HTMLElement).getAttribute('data-spatial-id');
      if (sId) onEnterSpatialEncounter(sId);
    });
  });

  return container;
}

export function renderWorldNowView(
  stories: WorldNowStory[],
  onSelectStory: (story: WorldNowStory) => void,
  onStartLinkedMission: (missionId: string) => void,
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'view-card-max';

  let currentCategory = 'all';
  let currentSearch = '';
  let activeViewMode: 'feed' | 'map' = 'feed';

  const categories = [
    { id: 'all', label: 'All Developments' },
    { id: 'Infrastructure & Transit', label: '🚆 Transit & Infrastructure' },
    { id: 'Ecology & Agriculture', label: '🌱 Ecology & Climate' },
    { id: 'Arts & Heritage', label: '🏺 Heritage & Arts' },
    { id: 'Technology & Innovation', label: '💡 Tech & Innovation' },
  ];

  function filterStories(): WorldNowStory[] {
    return stories.filter((s) => {
      const matchCat = currentCategory === 'all' || s.category === currentCategory;
      const matchSearch =
        !currentSearch ||
        s.headline.toLowerCase().includes(currentSearch.toLowerCase()) ||
        s.summary.toLowerCase().includes(currentSearch.toLowerCase()) ||
        s.tags.some((t) => t.toLowerCase().includes(currentSearch.toLowerCase()));
      return matchCat && matchSearch;
    });
  }

  function renderContent(): void {
    const filtered = filterStories();
    const feedHost = container.querySelector('#world-now-dynamic-content');
    if (!feedHost) return;

    if (activeViewMode === 'map') {
      feedHost.innerHTML = `
        <div style="background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 14px; padding: 20px; display: flex; flex-direction: column; gap: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <span style="font-size: 14px; font-weight: 700; color: var(--gold-accent);">
              🗺️ Global &amp; Regional Coordinate Intelligence Map
            </span>
            <span style="font-size: 12px; color: var(--text-dim);">
              Active Coordinate Pins: ${filtered.length} Locations
            </span>
          </div>

          <!-- Interactive SVG Map -->
          <div style="position: relative; width: 100%; height: 340px; background: #070d1e; border-radius: 10px; overflow: hidden; border: 1px solid rgba(74, 144, 217, 0.3);">
            <svg viewBox="0 0 800 400" style="width: 100%; height: 100%; background: radial-gradient(circle at 40% 50%, #0d1b3a 0%, #060a16 100%);">
              <!-- Grid lines -->
              <line x1="0" y1="100" x2="800" y2="100" stroke="rgba(255,255,255,0.05)" stroke-dasharray="4" />
              <line x1="0" y1="200" x2="800" y2="200" stroke="rgba(255,255,255,0.08)" stroke-dasharray="4" />
              <line x1="0" y1="300" x2="800" y2="300" stroke="rgba(255,255,255,0.05)" stroke-dasharray="4" />
              <line x1="200" y1="0" x2="200" y2="400" stroke="rgba(255,255,255,0.05)" stroke-dasharray="4" />
              <line x1="400" y1="0" x2="400" y2="400" stroke="rgba(255,255,255,0.08)" stroke-dasharray="4" />
              <line x1="600" y1="0" x2="600" y2="400" stroke="rgba(255,255,255,0.05)" stroke-dasharray="4" />

              <!-- Stylized African Coastline Silhouette -->
              <path d="M 330 80 Q 400 70 480 85 Q 520 120 540 180 Q 560 260 480 340 Q 430 380 400 370 Q 380 300 360 240 Q 320 220 290 190 Q 280 140 330 80 Z"
                    fill="rgba(245, 211, 112, 0.04)" stroke="rgba(245, 211, 112, 0.25)" stroke-width="1.5" />

              <!-- West African Coast detail -->
              <path d="M 290 190 Q 340 200 370 215 Q 400 210 420 240"
                    fill="none" stroke="rgba(0, 230, 118, 0.4)" stroke-width="2" stroke-dasharray="2 2" />

              <!-- Regional Label -->
              <text x="390" y="160" fill="rgba(255,255,255,0.15)" font-size="16" font-weight="700" text-anchor="middle">WEST &amp; CENTRAL AFRICA</text>
              <text x="375" y="235" fill="rgba(245,211,112,0.6)" font-size="11" font-weight="600">Gulf of Guinea</text>

              <!-- Plotted Story Pins -->
              <!-- Lagos Hub Pin (6.45 N, 3.39 E) -->
              <g class="svg-map-pin" data-story-id="${filtered[0]?.id || ''}" style="cursor: pointer;">
                <circle cx="365" cy="215" r="14" fill="rgba(0, 230, 118, 0.2)" />
                <circle cx="365" cy="215" r="7" fill="#00e676" />
                <circle cx="365" cy="215" r="3" fill="#ffffff" />
                <text x="365" y="238" fill="#ffffff" font-size="11" font-weight="700" text-anchor="middle">Lagos [6.45°N, 3.39°E]</text>
              </g>

              <!-- Sahelian Belt Pin (13.5 N, 8.5 E) -->
              <g class="svg-map-pin" data-story-id="${filtered[1]?.id || ''}" style="cursor: pointer;">
                <circle cx="410" cy="140" r="14" fill="rgba(245, 211, 112, 0.2)" />
                <circle cx="410" cy="140" r="7" fill="#f5d370" />
                <circle cx="410" cy="140" r="3" fill="#ffffff" />
                <text x="410" y="125" fill="#f5d370" font-size="11" font-weight="700" text-anchor="middle">Sahel Agroforestry [13.5°N, 8.5°E]</text>
              </g>

              <!-- NCMM Museum Heritage Pin -->
              <g class="svg-map-pin" data-story-id="${filtered[2]?.id || ''}" style="cursor: pointer;">
                <circle cx="350" cy="205" r="12" fill="rgba(99, 102, 241, 0.25)" />
                <circle cx="350" cy="205" r="6" fill="#818cf8" />
                <circle cx="350" cy="205" r="2.5" fill="#ffffff" />
                <text x="320" y="200" fill="#cbd5e1" font-size="10" font-weight="600" text-anchor="end">Ìsàlẹ̀ Èkó Archives</text>
              </g>
            </svg>
          </div>

          <div style="font-size: 13px; color: var(--text-muted); line-height: 1.4;">
            💡 <em>Tip: Click any geographic pin on the map to inspect full verified intelligence, primary sources, and open the interactive investigation.</em>
          </div>
        </div>
      `;

      feedHost.querySelectorAll('.svg-map-pin').forEach((pin) => {
        pin.addEventListener('click', (e) => {
          const sId = (e.currentTarget as HTMLElement).getAttribute('data-story-id');
          const found = stories.find((s) => s.id === sId) || stories[0];
          if (found) onSelectStory(found);
        });
      });
      return;
    }

    // Default Feed View
    if (filtered.length === 0) {
      feedHost.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: var(--text-dim);">
          <span style="font-size: 32px; display: block; margin-bottom: 8px;">🔍</span>
          No developments match your selected criteria. Try adjusting the topic or search keywords.
        </div>
      `;
      return;
    }

    feedHost.innerHTML = filtered
      .map(
        (story) => `
      <div class="story-card" data-story-id="${story.id}">
        <div class="story-meta">
          <span class="${story.verificationLevel === 'VERIFIED_FACT' ? 'badge-verified' : 'badge-developing'}">
            ${story.verificationLevel === 'VERIFIED_FACT' ? '✓ VERIFIED FACT' : '⚡ DEVELOPING STORY'}
          </span>
          <span style="color: var(--gold-accent); font-weight: 600;">${story.category}</span>
          <span>· Published: ${story.publishedAt}</span>
          <span>· Verified: ${story.verifiedAt}</span>
          <span>· Source: ${story.publisher}</span>
        </div>

        <h3 class="story-headline">${story.headline}</h3>
        <p class="story-summary">${story.summary}</p>

        <div class="story-highlights">
          <strong>Verified Highlights:</strong>
          <ul>
            ${story.factualHighlights.map((highlight) => `<li>${highlight}</li>`).join('')}
          </ul>
        </div>

        ${
          story.uncertaintyNotes
            ? `<div style="font-size: 12px; color: #f59e0b; background: rgba(245, 158, 11, 0.1); padding: 8px 12px; border-radius: 6px;">
                <strong>Notice on Developing Aspects:</strong> ${story.uncertaintyNotes}
              </div>`
            : ''
        }

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; flex-wrap: wrap; gap: 12px;">
          <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <button class="btn-secondary btn-investigate-story" data-story-id="${story.id}" style="font-size: 13px; padding: 6px 12px;">
              🔍 Investigate Details &amp; Sources
            </button>
            <a href="${story.sourceUrl}" target="_blank" rel="noopener noreferrer" style="font-size: 13px; color: var(--indigo-accent); text-decoration: none; display: flex; align-items: center; gap: 4px;">
              🔗 Sourced Publisher (${story.publisher}) ↗
            </a>
          </div>

          ${
            story.linkedMissionId
              ? `<button class="btn-gold btn-world-now-mission" data-mission-id="${story.linkedMissionId}">
                  Start Connected Mission →
                </button>`
              : ''
          }
        </div>
      </div>
    `,
      )
      .join('');

    feedHost.querySelectorAll('.btn-world-now-mission').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const mId = (e.currentTarget as HTMLElement).getAttribute('data-mission-id');
        if (mId) onStartLinkedMission(mId);
      });
    });

    feedHost.querySelectorAll('.btn-investigate-story').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const sId = (e.currentTarget as HTMLElement).getAttribute('data-story-id');
        const found = stories.find((s) => s.id === sId);
        if (found) onSelectStory(found);
      });
    });
  }

  container.innerHTML = `
    <div style="background: var(--bg-panel); border: 1px solid var(--border-panel); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px;">
        <div>
          <h2 style="font-size: 24px; color: var(--gold-accent); margin: 0 0 4px 0;">📰 World Now Intelligence Hub</h2>
          <p style="font-size: 14px; color: var(--text-muted); margin: 0;">Verified real-world developments, verified sources, and connected interactive adventure investigations.</p>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <button id="btn-toggle-feed-view" class="filter-pill active" style="font-size: 13px; padding: 6px 14px;">📰 Live Feed</button>
          <button id="btn-toggle-map-view" class="filter-pill" style="font-size: 13px; padding: 6px 14px;">🗺️ Map Explorer</button>
          <span class="badge-verified" style="margin-left: 6px;">
            ✓ Real-Time Verified Engine
          </span>
        </div>
      </div>

      <!-- Controls bar: Search & Category Pills -->
      <div style="display: flex; flex-direction: column; gap: 12px; background: rgba(0, 0, 0, 0.25); padding: 14px 16px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.06);">
        <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
          <input type="text" id="world-now-search-input" placeholder="Search verified headlines, topics, or keywords..." style="
            flex: 1;
            min-width: 240px;
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: var(--text-main);
            padding: 8px 14px;
            border-radius: 8px;
            font-size: 13px;
          " />
        </div>

        <div style="display: flex; gap: 8px; flex-wrap: wrap;" id="category-pills-bar">
          ${categories
            .map(
              (cat) => `
            <button type="button" class="filter-pill ${cat.id === 'all' ? 'active' : ''}" data-cat-id="${cat.id}">
              ${cat.label}
            </button>
          `,
            )
            .join('')}
        </div>
      </div>

      <!-- Dynamic Feed / Map Container -->
      <div id="world-now-dynamic-content" style="display: flex; flex-direction: column; gap: 16px;"></div>
    </div>
  `;

  // Wire search input
  const searchInput = container.querySelector('#world-now-search-input') as HTMLInputElement;
  searchInput?.addEventListener('input', () => {
    currentSearch = searchInput.value.trim();
    renderContent();
  });

  // Wire category pills
  container.querySelectorAll('#category-pills-bar .filter-pill').forEach((pill) => {
    pill.addEventListener('click', (e) => {
      container.querySelectorAll('#category-pills-bar .filter-pill').forEach((p) => p.classList.remove('active'));
      const el = e.currentTarget as HTMLElement;
      el.classList.add('active');
      currentCategory = el.getAttribute('data-cat-id') || 'all';
      renderContent();
    });
  });

  // Wire view mode buttons
  const btnFeed = container.querySelector('#btn-toggle-feed-view');
  const btnMap = container.querySelector('#btn-toggle-map-view');

  btnFeed?.addEventListener('click', () => {
    activeViewMode = 'feed';
    btnFeed.classList.add('active');
    btnMap?.classList.remove('active');
    renderContent();
  });

  btnMap?.addEventListener('click', () => {
    activeViewMode = 'map';
    btnMap.classList.add('active');
    btnFeed?.classList.remove('active');
    renderContent();
  });

  // Initial render
  renderContent();
  return container;
}

export function renderLiveEventDetailModal(
  story: WorldNowStory,
  onStartLinkedMission: (missionId: string) => void,
  onReportInaccuracy: (storyId: string) => void,
  onClose: () => void,
): HTMLElement {
  const backdrop = document.createElement('div');
  backdrop.className = 'advenquo-modal-backdrop';

  backdrop.innerHTML = `
    <div class="advenquo-modal-content" style="max-width: 740px;">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span class="${story.verificationLevel === 'VERIFIED_FACT' ? 'badge-verified' : 'badge-developing'}">
            ${story.verificationLevel === 'VERIFIED_FACT' ? '✓ VERIFIED FACT' : '⚡ DEVELOPING STORY'}
          </span>
          <span style="font-size: 13px; color: var(--gold-accent); font-weight: 700;">${story.category}</span>
        </div>
        <button id="modal-close-x" style="background: transparent; border: none; color: var(--text-dim); font-size: 20px; cursor: pointer;">✕</button>
      </div>

      <div class="modal-body" style="gap: 20px;">
        <!-- Headline & Summary -->
        <div>
          <h2 style="font-size: 20px; font-weight: 800; color: var(--text-main); margin: 0 0 10px 0; line-height: 1.35;">
            ${story.headline}
          </h2>
          <p style="font-size: 14px; color: var(--text-muted); line-height: 1.6; margin: 0;">
            ${story.summary}
          </p>
        </div>

        <!-- Verified Findings & Claims -->
        <div style="background: rgba(0, 0, 0, 0.35); border-left: 3px solid var(--tag-verified); padding: 14px 18px; border-radius: 0 8px 8px 0;">
          <span style="font-size: 13px; font-weight: 700; color: var(--gold-accent); display: block; margin-bottom: 8px;">
            Verified Intelligence Highlights
          </span>
          <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: var(--text-main); display: flex; flex-direction: column; gap: 6px;">
            ${story.factualHighlights.map((highlight) => `<li>${highlight}</li>`).join('')}
          </ul>
        </div>

        <!-- Interactive Updates Timeline -->
        <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 16px;">
          <span style="font-size: 13px; font-weight: 700; color: var(--gold-accent); display: block; margin-bottom: 12px;">
            Chronological Development Timeline
          </span>
          <div style="display: flex; flex-direction: column; gap: 12px; padding-left: 8px; border-left: 2px solid rgba(245, 211, 112, 0.4);">
            <div style="position: relative; padding-left: 14px;">
              <div style="position: absolute; left: -19px; top: 4px; width: 8px; height: 8px; border-radius: 50%; background: var(--gold-accent);"></div>
              <span style="font-size: 11px; color: var(--text-dim);">${story.publishedAt} (UTC)</span>
              <div style="font-size: 13px; font-weight: 600; color: var(--text-main);">Initial Reporting Intake &amp; Provenance Record</div>
              <div style="font-size: 12px; color: var(--text-muted);">Recorded by Advenquo from ${story.publisher}.</div>
            </div>
            <div style="position: relative; padding-left: 14px;">
              <div style="position: absolute; left: -19px; top: 4px; width: 8px; height: 8px; border-radius: 50%; background: #00e676;"></div>
              <span style="font-size: 11px; color: var(--text-dim);">${story.verifiedAt} (UTC)</span>
              <div style="font-size: 13px; font-weight: 600; color: var(--text-main);">Editorial Verification &amp; Corroboration Review</div>
              <div style="font-size: 12px; color: var(--text-muted);">Verified against institutional documentation and satellite/engineering records.</div>
            </div>
          </div>
        </div>

        <!-- Sourced Evidence Panel -->
        <div style="background: rgba(0, 0, 0, 0.25); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 8px;">
          <span style="font-size: 13px; font-weight: 700; color: var(--gold-accent);">
            Sources, Attribution &amp; Licensing
          </span>
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div style="font-size: 13px; color: var(--text-dim);">
              Publisher: <strong style="color: var(--text-main);">${story.publisher}</strong> · Status: <strong>${story.status}</strong>
            </div>
            <a href="${story.sourceUrl}" target="_blank" rel="noopener noreferrer" style="font-size: 13px; color: var(--indigo-accent); text-decoration: none;">
              🔗 Direct Source Document ↗
            </a>
          </div>
          <p style="font-size: 11px; color: var(--text-dim); margin: 4px 0 0 0;">
            Attribution Notice: Verified under fair use citation and open public record standards. No algorithmic alteration of source quotes.
          </p>
        </div>

        ${
          story.uncertaintyNotes
            ? `<div style="font-size: 13px; color: #f59e0b; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.25); padding: 12px; border-radius: 8px;">
                <strong>Known Uncertainties &amp; Developing Factors:</strong><br />
                ${story.uncertaintyNotes}
              </div>`
            : ''
        }
      </div>

      <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <button class="btn-secondary" id="btn-report-story" style="font-size: 12px; padding: 8px 12px;">
          🚩 Report Inaccuracy / Feedback
        </button>

        <div style="display: flex; gap: 10px;">
          <button class="btn-secondary" id="btn-modal-close">Close</button>
          ${
            story.linkedMissionId
              ? `<button class="btn-gold" id="btn-modal-start-mission">
                  Launch Connected Adventure →
                </button>`
              : ''
          }
        </div>
      </div>
    </div>
  `;

  backdrop.querySelector('#modal-close-x')?.addEventListener('click', onClose);
  backdrop.querySelector('#btn-modal-close')?.addEventListener('click', onClose);

  backdrop.querySelector('#btn-modal-start-mission')?.addEventListener('click', () => {
    if (story.linkedMissionId) {
      onClose();
      onStartLinkedMission(story.linkedMissionId);
    }
  });

  backdrop.querySelector('#btn-report-story')?.addEventListener('click', () => {
    onReportInaccuracy(story.id);
  });

  return backdrop;
}

export function renderPassportView(state: GameSaveState): HTMLElement {
  const container = document.createElement('div');
  container.className = 'view-card-max';

  const { passport, profile, skills } = state;

  container.innerHTML = `
    <div style="background: var(--bg-panel); border: 1px solid var(--border-panel); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h2 style="font-size: 24px; color: var(--gold-accent); margin: 0 0 4px 0;">📖 Culture Passport & Discovery Journal</h2>
          <p style="font-size: 14px; color: var(--text-muted); margin: 0;">Your permanent record of cultural discoveries, linguistic vocabulary, and verified achievements.</p>
        </div>
      </div>

      <!-- Quick Stats Grid -->
      <div class="passport-stats-grid">
        <div class="stat-box">
          <span class="stat-label">Guardian Level</span>
          <span class="stat-value">Level ${profile.guardianLevel}</span>
        </div>
        <div class="stat-box">
          <span class="stat-label">Total Experience</span>
          <span class="stat-value">${profile.totalXp} XP</span>
        </div>
        <div class="stat-box">
          <span class="stat-label">Passport Stamps</span>
          <span class="stat-value">${passport.stamps.length}</span>
        </div>
        <div class="stat-box">
          <span class="stat-label">Vocabulary Bank</span>
          <span class="stat-value">${passport.vocabulary.length}</span>
        </div>
      </div>

      <!-- Skill Mastery Sliders -->
      <div style="background: var(--bg-card); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 20px;">
        <h3 style="font-size: 16px; color: var(--gold-accent); margin: 0 0 14px 0;">Adaptive Skill Mastery</h3>
        <div class="skill-bar-row">
          <div class="skill-bar-header">
            <span>Language Comprehension & Registers</span>
            <span>${skills.languageComprehension}%</span>
          </div>
          <div class="skill-progress-track"><div class="skill-progress-fill" style="width: ${skills.languageComprehension}%"></div></div>
        </div>
        <div class="skill-bar-row">
          <div class="skill-bar-header">
            <span>Cultural Interpretation & Material Arts</span>
            <span>${skills.culturalInterpretation}%</span>
          </div>
          <div class="skill-progress-track"><div class="skill-progress-fill" style="width: ${skills.culturalInterpretation}%"></div></div>
        </div>
        <div class="skill-bar-row">
          <div class="skill-bar-header">
            <span>Geographic Reasoning & Hydrology</span>
            <span>${skills.geographicReasoning}%</span>
          </div>
          <div class="skill-progress-track"><div class="skill-progress-fill" style="width: ${skills.geographicReasoning}%"></div></div>
        </div>
        <div class="skill-bar-row">
          <div class="skill-bar-header">
            <span>Evidence Evaluation & Fact-Checking</span>
            <span>${skills.evidenceEvaluation}%</span>
          </div>
          <div class="skill-progress-track"><div class="skill-progress-fill" style="width: ${skills.evidenceEvaluation}%"></div></div>
        </div>
        <div class="skill-bar-row">
          <div class="skill-bar-header">
            <span>Navigation Planning & Mobility</span>
            <span>${skills.navigationPlanning}%</span>
          </div>
          <div class="skill-progress-track"><div class="skill-progress-fill" style="width: ${skills.navigationPlanning}%"></div></div>
        </div>
      </div>

      <!-- Passport Stamps Section -->
      <div>
        <h3 style="font-size: 16px; color: var(--gold-accent); margin: 0 0 14px 0;">Earned Passport Stamps</h3>
        ${
          passport.stamps.length === 0
            ? `<p style="font-size: 14px; color: var(--text-dim); margin: 0;">No stamps unlocked yet. Complete your first mission in Ìsàlẹ̀ Èkó to earn your inaugural stamp!</p>`
            : `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px;">
                ${passport.stamps
                  .map(
                    (stamp) => `
                  <div style="background: var(--bg-card); border: 1px solid var(--border-panel); border-radius: 12px; padding: 14px; display: flex; gap: 12px; align-items: center;">
                    <span style="font-size: 32px;">${stamp.icon}</span>
                    <div style="display: flex; flex-direction: column;">
                      <span style="font-size: 14px; font-weight: 700; color: var(--gold-accent);">${stamp.name}</span>
                      <span style="font-size: 11px; color: var(--text-dim);">${stamp.category} · ${new Date(stamp.unlockedAt).toLocaleDateString()}</span>
                      <span style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">${stamp.description}</span>
                    </div>
                  </div>
                `,
                  )
                  .join('')}
              </div>`
        }
      </div>

      <!-- Learned Vocabulary Bank -->
      <div>
        <h3 style="font-size: 16px; color: var(--gold-accent); margin: 0 0 14px 0;">Linguistic Vocabulary Bank</h3>
        ${
          passport.vocabulary.length === 0
            ? `<p style="font-size: 14px; color: var(--text-dim); margin: 0;">No vocabulary saved yet. Practice greeting elders and navigating markets to build your lexicon.</p>`
            : `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px;">
                ${passport.vocabulary
                  .map(
                    (vocab) => `
                  <div style="background: var(--bg-card); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 6px;">
                    <div style="display: flex; justify-content: space-between; align-items: baseline;">
                      <span style="font-size: 16px; font-weight: 800; color: var(--gold-accent);">${vocab.term}</span>
                      <span style="font-size: 12px; color: var(--text-dim);">${vocab.language}</span>
                    </div>
                    <span style="font-size: 12px; color: var(--indigo-accent); font-style: italic;">[${vocab.phonetic}]</span>
                    <span style="font-size: 13px; font-weight: 600; color: var(--text-main);">${vocab.englishGloss}</span>
                    <span style="font-size: 11px; color: var(--text-muted);">${vocab.context}</span>
                  </div>
                `,
                  )
                  .join('')}
              </div>`
        }
      </div>

      <!-- Journal Entries -->
      <div>
        <h3 style="font-size: 16px; color: var(--gold-accent); margin: 0 0 14px 0;">Verified Discovery Journal</h3>
        ${
          passport.journal.length === 0
            ? `<p style="font-size: 14px; color: var(--text-dim); margin: 0;">No journal entries recorded. Complete investigations to log academic facts and cultural history.</p>`
            : `<div style="display: flex; flex-direction: column; gap: 12px;">
                ${passport.journal
                  .map(
                    (entry) => `
                  <div style="background: var(--bg-card); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="font-size: 15px; font-weight: 700; color: var(--gold-accent);">${entry.title}</span>
                      <span style="font-size: 11px; color: var(--text-dim);">${entry.category}</span>
                    </div>
                    <p style="font-size: 13px; color: var(--text-muted); margin: 0; line-height: 1.4;">${entry.summary}</p>
                    <div style="background: rgba(0, 0, 0, 0.3); border-left: 2px solid var(--tag-verified); padding: 8px 12px; font-size: 12px; color: var(--text-main);">
                      <strong>Verified Fact:</strong> ${entry.verifiedFact}
                    </div>
                    <span style="font-size: 11px; color: var(--text-dim); align-self: flex-end;">Source: ${entry.sourceAttribution}</span>
                  </div>
                `,
                  )
                  .join('')}
              </div>`
        }
      </div>
    </div>
  `;

  return container;
}

export function renderSpatialHUD(
  discoveredCount: number,
  totalCount: number,
  onReturnToExploration: () => void,
): HTMLElement {
  const hud = document.createElement('div');
  hud.className = 'spatial-encounter-hud';

  hud.innerHTML = `
    <div class="spatial-hud-title">
      <span>🏺 3D Artifact Room</span>
      <span style="font-size: 11px; background: rgba(245, 211, 112, 0.15); color: var(--gold-accent); padding: 2px 6px; border-radius: 4px;">Seated Mode</span>
    </div>
    <div class="spatial-hud-body">
      Four authentic Yoruba artifacts rest on the mahogany table before you.
      <br /><br />
      <strong>Interaction:</strong><br />
      • <em>In VR:</em> Pinch thumb & index or pull controller trigger.<br />
      • <em>Desktop:</em> Click directly on artifacts with your mouse.
    </div>
    <div style="font-size: 13px; font-weight: 700; color: var(--gold-accent);">
      Discovered: <span id="spatial-counter">${discoveredCount} / ${totalCount}</span>
    </div>
    <button class="btn-gold" id="btn-spatial-return" style="width: 100%; justify-content: center; font-size: 13px; padding: 8px 12px;">
      ← Return to Exploration
    </button>
  `;

  hud.querySelector('#btn-spatial-return')?.addEventListener('click', onReturnToExploration);
  return hud;
}

export function renderProfileModal(
  profile: GameSaveState['profile'],
  onSave: (updates: Partial<GameSaveState['profile']>) => void,
  onClose: () => void,
): HTMLElement {
  const backdrop = document.createElement('div');
  backdrop.className = 'advenquo-modal-backdrop';

  backdrop.innerHTML = `
    <div class="advenquo-modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Explorer Profile & Adaptive Settings</h3>
        <button id="modal-close-x" style="background: transparent; border: none; color: var(--text-dim); font-size: 20px; cursor: pointer;">✕</button>
      </div>

      <div class="modal-body">
        <div>
          <label style="font-size: 13px; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 6px;">
            Explorer Alias
          </label>
          <input type="text" id="input-profile-name" value="${profile.name}" style="
            width: 100%;
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: var(--text-main);
            padding: 10px 14px;
            border-radius: 8px;
            font-size: 14px;
          " />
        </div>

        <div>
          <label style="font-size: 13px; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 6px;">
            Avatar Icon
          </label>
          <div style="display: flex; gap: 8px;" id="avatar-selector">
            ${['🧭', '🏺', '👑', '🌍', '🪘', '💡', '🌴']
              .map(
                (emoji) => `
              <button type="button" class="avatar-opt-btn ${emoji === profile.avatar ? 'selected' : ''}" data-emoji="${emoji}" style="
                font-size: 20px;
                padding: 8px 12px;
                background: ${emoji === profile.avatar ? 'rgba(245, 211, 112, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
                border: 1px solid ${emoji === profile.avatar ? 'var(--gold-accent)' : 'rgba(255, 255, 255, 0.1)'};
                border-radius: 8px;
                cursor: pointer;
              ">${emoji}</button>
            `,
              )
              .join('')}
          </div>
        </div>

        <div>
          <label style="font-size: 13px; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 6px;">
            Challenge & Scaffolding Level
          </label>
          <div style="display: flex; flex-direction: column; gap: 8px;" id="challenge-selector">
            <label style="display: flex; align-items: flex-start; gap: 10px; background: rgba(0, 0, 0, 0.25); padding: 10px; border-radius: 8px; cursor: pointer;">
              <input type="radio" name="challenge" value="explorer" ${profile.challengeLevel === 'explorer' ? 'checked' : ''} />
              <div>
                <strong style="color: var(--text-main); font-size: 13px;">Explorer (Gentle Scaffolding)</strong>
                <p style="margin: 2px 0 0 0; font-size: 12px; color: var(--text-muted);">Provides generous contextual hints, pronunciation guides, and forgiving conversational retries.</p>
              </div>
            </label>
            <label style="display: flex; align-items: flex-start; gap: 10px; background: rgba(0, 0, 0, 0.25); padding: 10px; border-radius: 8px; cursor: pointer;">
              <input type="radio" name="challenge" value="apprentice" ${profile.challengeLevel === 'apprentice' ? 'checked' : ''} />
              <div>
                <strong style="color: var(--gold-accent); font-size: 13px;">Apprentice (Balanced Adventure)</strong>
                <p style="margin: 2px 0 0 0; font-size: 12px; color: var(--text-muted);">Standard challenge level. Cultural nuances, honorific registers, and navigation puzzles.</p>
              </div>
            </label>
            <label style="display: flex; align-items: flex-start; gap: 10px; background: rgba(0, 0, 0, 0.25); padding: 10px; border-radius: 8px; cursor: pointer;">
              <input type="radio" name="challenge" value="scholar" ${profile.challengeLevel === 'scholar' ? 'checked' : ''} />
              <div>
                <strong style="color: #a78bfa; font-size: 13px;">Scholar (Deep Rigor)</strong>
                <p style="margin: 2px 0 0 0; font-size: 12px; color: var(--text-muted);">In-depth linguistic scrutiny, fact-verification against primary sources, and minimal hints.</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" id="modal-btn-cancel">Cancel</button>
        <button class="btn-gold" id="modal-btn-save">Save Profile</button>
      </div>
    </div>
  `;

  let selectedAvatar = profile.avatar;

  backdrop.querySelectorAll('.avatar-opt-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      backdrop.querySelectorAll('.avatar-opt-btn').forEach((b) => {
        (b as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.1)';
        (b as HTMLElement).style.background = 'rgba(255, 255, 255, 0.05)';
      });
      const el = e.currentTarget as HTMLElement;
      el.style.borderColor = 'var(--gold-accent)';
      el.style.background = 'rgba(245, 211, 112, 0.2)';
      selectedAvatar = el.getAttribute('data-emoji') || '🧭';
    });
  });

  backdrop.querySelector('#modal-close-x')?.addEventListener('click', onClose);
  backdrop.querySelector('#modal-btn-cancel')?.addEventListener('click', onClose);

  backdrop.querySelector('#modal-btn-save')?.addEventListener('click', () => {
    const nameInput = backdrop.querySelector('#input-profile-name') as HTMLInputElement;
    const challengeInput = backdrop.querySelector('input[name="challenge"]:checked') as HTMLInputElement;

    onSave({
      name: nameInput?.value.trim() || profile.name,
      avatar: selectedAvatar,
      challengeLevel: (challengeInput?.value as ChallengeLevel) || profile.challengeLevel,
    });
    onClose();
  });

  return backdrop;
}

export function renderPOIModal(
  poi: PointOfInterest,
  onStartMission: (missionId: string) => void,
  onEnterSpatial: (spatialAssetId: string) => void,
  onClose: () => void,
): HTMLElement {
  const backdrop = document.createElement('div');
  backdrop.className = 'advenquo-modal-backdrop';

  backdrop.innerHTML = `
    <div class="advenquo-modal-content">
      <div class="modal-header">
        <div>
          <span style="font-size: 11px; text-transform: uppercase; color: var(--indigo-accent); font-weight: 700;">Point of Interest</span>
          <h3 class="modal-title">${poi.name}</h3>
        </div>
        <button id="poi-modal-close" style="background: transparent; border: none; color: var(--text-dim); font-size: 20px; cursor: pointer;">✕</button>
      </div>

      <div class="modal-body">
        <p style="font-size: 14px; color: var(--text-main); line-height: 1.5; margin: 0;">${poi.description}</p>
        <div style="background: rgba(245, 211, 112, 0.08); border-left: 3px solid var(--gold-accent); padding: 12px 16px; border-radius: 0 8px 8px 0;">
          <strong style="color: var(--gold-accent); font-size: 13px;">Cultural & Historical Significance:</strong>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: var(--text-muted); line-height: 1.4;">${poi.culturalSignificance}</p>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" id="poi-modal-btn-close">Close</button>
        ${
          poi.linkedMissionId
            ? `<button class="btn-gold" id="poi-modal-btn-mission">Start Mission →</button>`
            : ''
        }
        ${
          poi.spatialAssetId
            ? `<button class="btn-gold" id="poi-modal-btn-spatial" style="background: #6366f1; color: white;">Inspect in 3D 🏺</button>`
            : ''
        }
      </div>
    </div>
  `;

  backdrop.querySelector('#poi-modal-close')?.addEventListener('click', onClose);
  backdrop.querySelector('#poi-modal-btn-close')?.addEventListener('click', onClose);

  backdrop.querySelector('#poi-modal-btn-mission')?.addEventListener('click', () => {
    if (poi.linkedMissionId) {
      onStartMission(poi.linkedMissionId);
      onClose();
    }
  });

  backdrop.querySelector('#poi-modal-btn-spatial')?.addEventListener('click', () => {
    if (poi.spatialAssetId) {
      onEnterSpatial(poi.spatialAssetId);
      onClose();
    }
  });

  return backdrop;
}

export function renderMissionModal(
  mission: MissionDefinition,
  activeState: ActiveMissionState,
  currentStep: MissionStep,
  lastEvaluation: ChoiceEvaluationResult | null,
  activeHint: string | null,
  completionResult: MissionCompletionResult | null,
  onSubmitChoice: (choiceId: string) => void,
  onRequestHint: () => void,
  onAdvance: () => void,
  onComplete: () => void,
  onClose: () => void,
): HTMLElement {
  const backdrop = document.createElement('div');
  backdrop.className = 'advenquo-modal-backdrop';

  // Completion view
  if (completionResult && completionResult.success) {
    const { rewards, unlockedStamp, addedVocabulary, xpEarned, newGuardianLevel, leveledUp } = completionResult;
    backdrop.innerHTML = `
      <div class="advenquo-modal-content" style="max-width: 620px;">
        <div class="modal-header" style="background: rgba(245, 211, 112, 0.1); border-color: var(--gold-accent);">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 28px;">🏆</span>
            <div>
              <span style="font-size: 11px; text-transform: uppercase; color: var(--gold-accent); font-weight: 700;">Mission Accomplished</span>
              <h3 class="modal-title">${mission.title}</h3>
            </div>
          </div>
          <button id="mission-modal-x" style="background: transparent; border: none; color: var(--text-dim); font-size: 20px; cursor: pointer;">✕</button>
        </div>

        <div class="modal-body">
          <div style="background: rgba(0, 0, 0, 0.35); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 16px; display: flex; justify-content: space-around; align-items: center;">
            <div style="text-align: center;">
              <span style="font-size: 11px; text-transform: uppercase; color: var(--text-dim); font-weight: 700;">XP Earned</span>
              <div style="font-size: 24px; font-weight: 800; color: var(--gold-accent);">+${xpEarned}</div>
            </div>
            <div style="width: 1px; height: 36px; background: rgba(255, 255, 255, 0.1);"></div>
            <div style="text-align: center;">
              <span style="font-size: 11px; text-transform: uppercase; color: var(--text-dim); font-weight: 700;">Guardian Status</span>
              <div style="font-size: 20px; font-weight: 800; color: var(--text-main);">
                Level ${newGuardianLevel} ${leveledUp ? '🎉 (Level Up!)' : ''}
              </div>
            </div>
          </div>

          <!-- Unlocked Stamp -->
          ${
            unlockedStamp
              ? `<div style="background: rgba(245, 211, 112, 0.08); border: 1px solid var(--border-panel); border-radius: 12px; padding: 14px; display: flex; align-items: center; gap: 14px;">
                  <span style="font-size: 36px;">${unlockedStamp.icon}</span>
                  <div>
                    <span style="font-size: 11px; text-transform: uppercase; color: var(--gold-accent); font-weight: 700;">New Passport Stamp!</span>
                    <h4 style="margin: 2px 0 0 0; font-size: 15px; color: var(--text-main);">${unlockedStamp.name}</h4>
                    <p style="margin: 4px 0 0 0; font-size: 12px; color: var(--text-muted);">${unlockedStamp.description}</p>
                  </div>
                </div>`
              : ''
          }

          <!-- Educational Debrief -->
          <div style="background: var(--bg-card); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 10px;">
            <strong style="color: var(--gold-accent); font-size: 14px;">🎓 Educational Insights Learned:</strong>
            <p style="margin: 0; font-size: 13px; color: var(--text-main); line-height: 1.4;">${mission.culturalDebrief.summary}</p>
            <div style="font-size: 12px; color: var(--text-muted); background: rgba(0, 0, 0, 0.2); padding: 8px 12px; border-radius: 6px;">
              <strong>Living Context:</strong> ${mission.culturalDebrief.realWorldContext}
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-gold" id="btn-finish-mission-modal" style="width: 100%; justify-content: center;">
            Save to Passport & Continue Exploring →
          </button>
        </div>
      </div>
    `;

    backdrop.querySelector('#mission-modal-x')?.addEventListener('click', onClose);
    backdrop.querySelector('#btn-finish-mission-modal')?.addEventListener('click', onClose);
    return backdrop;
  }

  // Active step view
  const stepIndex = activeState.currentStepIndex + 1;
  const totalSteps = mission.steps.length;

  backdrop.innerHTML = `
    <div class="advenquo-modal-content">
      <div class="modal-header">
        <div>
          <span style="font-size: 11px; text-transform: uppercase; color: var(--indigo-accent); font-weight: 700;">
            ${mission.title} · Step ${stepIndex} of ${totalSteps}
          </span>
          <h3 class="modal-title">${currentStep.title}</h3>
        </div>
        <button id="mission-modal-x" style="background: transparent; border: none; color: var(--text-dim); font-size: 20px; cursor: pointer;">✕</button>
      </div>

      <div class="modal-body">
        ${
          currentStep.characterName
            ? `<div style="display: flex; align-items: center; gap: 10px; background: rgba(74, 144, 217, 0.1); border-left: 3px solid var(--indigo-accent); padding: 8px 14px; border-radius: 0 8px 8px 0;">
                <span style="font-size: 20px;">🗣️</span>
                <div>
                  <strong style="font-size: 13px; color: var(--text-main);">${currentStep.characterName}</strong>
                  <span style="font-size: 11px; color: var(--text-muted);"> (${currentStep.characterRole || 'Resident'})</span>
                </div>
              </div>`
            : ''
        }

        <p style="font-size: 13px; color: var(--text-muted); margin: 0; line-height: 1.4;">${currentStep.context}</p>

        <div style="background: rgba(0, 0, 0, 0.35); border-radius: 10px; padding: 14px; border: 1px solid rgba(255, 255, 255, 0.08);">
          <strong style="font-size: 15px; color: var(--gold-accent); display: block; margin-bottom: 6px;">
            ${currentStep.prompt}
          </strong>
        </div>

        <!-- Clues if present -->
        ${
          currentStep.clues && currentStep.clues.length > 0
            ? `<div style="background: rgba(0, 0, 0, 0.2); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 8px;">
                <strong style="font-size: 12px; color: var(--indigo-accent); text-transform: uppercase;">Field Clues Available:</strong>
                ${currentStep.clues
                  .map(
                    (clue) => `
                  <div style="font-size: 12px; color: var(--text-main);">
                    <strong>• ${clue.title}:</strong> ${clue.description}
                  </div>
                `,
                  )
                  .join('')}
              </div>`
            : ''
        }

        <!-- Dialogue / Action Choices -->
        <div style="display: flex; flex-direction: column; gap: 10px;" id="choices-list">
          ${(currentStep.dialogueChoices || [])
            .map((choice) => {
              const isSelected = lastEvaluation && lastEvaluation.feedback.includes(choice.feedback);
              let stateClass = '';
              if (isSelected) {
                stateClass = lastEvaluation.isCorrect ? 'selected-correct' : 'selected-incorrect';
              }
              return `
                <button type="button" class="choice-button ${stateClass}" data-choice-id="${choice.id}">
                  <span>${choice.text}</span>
                </button>
              `;
            })
            .join('')}
        </div>

        <!-- Evaluation Feedback Area -->
        ${
          lastEvaluation
            ? `<div style="
                background: ${lastEvaluation.isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'};
                border: 1px solid ${lastEvaluation.isCorrect ? 'var(--tag-verified)' : '#ef4444'};
                border-radius: 10px;
                padding: 12px 16px;
                display: flex;
                flex-direction: column;
                gap: 6px;
              ">
                <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: ${lastEvaluation.isCorrect ? 'var(--tag-verified)' : '#f87171'};">
                  <span>${lastEvaluation.isCorrect ? '✓ Correct Understanding!' : '⚠ Consider Cultural Context:'}</span>
                </div>
                <p style="margin: 0; font-size: 13px; color: var(--text-main); line-height: 1.4;">${lastEvaluation.feedback}</p>
                <p style="margin: 0; font-size: 12px; color: var(--text-muted);">${lastEvaluation.explanation}</p>
              </div>`
            : ''
        }

        <!-- Active Hint Drawer -->
        ${
          activeHint
            ? `<div style="background: rgba(245, 211, 112, 0.1); border-left: 3px solid var(--gold-accent); padding: 10px 14px; border-radius: 0 8px 8px 0; font-size: 13px; color: var(--gold-accent);">
                <strong>💡 Cultural Hint:</strong> ${activeHint}
              </div>`
            : ''
        }
      </div>

      <div class="modal-footer" style="justify-content: space-between;">
        <button class="btn-secondary" id="btn-request-hint" style="display: flex; align-items: center; gap: 6px;">
          💡 Need a Hint?
        </button>

        <div style="display: flex; gap: 10px;">
          ${
            lastEvaluation && lastEvaluation.canAdvance
              ? stepIndex < totalSteps
                ? `<button class="btn-gold" id="btn-advance-step">Next Step (${stepIndex + 1}/${totalSteps}) →</button>`
                : `<button class="btn-gold" id="btn-complete-mission" style="background: var(--tag-verified);">Complete Mission 🎉</button>`
              : `<button class="btn-secondary" id="btn-cancel-mission">Exit Mission</button>`
          }
        </div>
      </div>
    </div>
  `;

  backdrop.querySelector('#mission-modal-x')?.addEventListener('click', onClose);
  backdrop.querySelector('#btn-cancel-mission')?.addEventListener('click', onClose);

  backdrop.querySelectorAll('.choice-button').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const choiceId = (e.currentTarget as HTMLElement).getAttribute('data-choice-id');
      if (choiceId) onSubmitChoice(choiceId);
    });
  });

  backdrop.querySelector('#btn-request-hint')?.addEventListener('click', onRequestHint);
  backdrop.querySelector('#btn-advance-step')?.addEventListener('click', onAdvance);
  backdrop.querySelector('#btn-complete-mission')?.addEventListener('click', onComplete);

  return backdrop;
}
