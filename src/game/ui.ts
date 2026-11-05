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
import { AdventureMissionSystem } from '../adventure-mission-system.js';
import { PlayerControllerSystem } from '../player-controller-system.js';
import { WorldStreamingSystem } from '../world-streaming-system.js';
import { timeOfDaySystem } from '../systems/time-of-day-system.js';
import { weatherSystem } from '../systems/weather-system.js';
import { storage } from './storage.js';

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

    /* ── Adventure 3D HUD Styles ────────────────────────── */
    .advenquo-adventure-hud-root {
      position: absolute;
      top: 78px;
      left: 0;
      width: 100vw;
      height: calc(100vh - 78px);
      pointer-events: none;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 16px;
      z-index: 70;
      box-sizing: border-box;
    }

    .adventure-top-bar {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      width: 100%;
    }

    .adventure-objective-card {
      background: rgba(12, 18, 34, 0.94);
      border: 1px solid var(--gold-accent);
      border-radius: 12px;
      padding: 12px 18px;
      max-width: 520px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(12px);
      pointer-events: auto;
      transition: all 0.3s ease;
    }

    .adventure-objective-tag {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1.2px;
      color: var(--gold-accent);
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 4px;
    }

    .adventure-objective-instruction {
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
      line-height: 1.4;
      margin-bottom: 6px;
    }

    .adventure-objective-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 12px;
      color: var(--text-muted);
    }

    .adventure-target-badge {
      background: rgba(245, 211, 112, 0.15);
      color: var(--gold-accent);
      padding: 2px 8px;
      border-radius: 6px;
      font-weight: 600;
    }

    /* Dialogue Card */
    .adventure-dialogue-card {
      background: rgba(10, 15, 28, 0.96);
      border: 1.5px solid var(--gold-accent);
      border-radius: 16px;
      padding: 18px 22px;
      max-width: 660px;
      width: 90%;
      margin: 0 auto 16px auto;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(16px);
      pointer-events: auto;
      animation: slideUpFade 0.3s ease-out;
    }

    @keyframes slideUpFade {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .dialogue-speaker-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      border-bottom: 1px solid rgba(245, 211, 112, 0.2);
      padding-bottom: 8px;
      margin-bottom: 10px;
    }

    .dialogue-speaker-name {
      font-size: 17px;
      font-weight: 800;
      color: var(--gold-accent);
    }

    .dialogue-speaker-role {
      font-size: 12px;
      color: var(--text-muted);
      font-style: italic;
    }

    .dialogue-speech-text {
      font-size: 15px;
      line-height: 1.5;
      color: #ffffff;
      margin-bottom: 10px;
    }

    .dialogue-cultural-note {
      background: rgba(26, 35, 126, 0.4);
      border-left: 3px solid var(--indigo-accent);
      padding: 6px 12px;
      border-radius: 0 6px 6px 0;
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 14px;
    }

    .dialogue-choices-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .dialogue-choice-btn {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 10px;
      padding: 10px 14px;
      text-align: left;
      color: #ffffff;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.2s ease;
    }

    .dialogue-choice-btn:hover {
      background: rgba(245, 211, 112, 0.18);
      border-color: var(--gold-accent);
      color: var(--gold-accent);
      transform: translateX(4px);
    }

    /* Action Prompt Button */
    .adventure-action-prompt {
      margin: 0 auto 20px auto;
      background: linear-gradient(135deg, #f5d370 0%, #ffb300 100%);
      color: #1a237e;
      border: none;
      border-radius: 50px;
      padding: 12px 26px;
      font-size: 15px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 6px 20px rgba(245, 211, 112, 0.45);
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 10px;
      animation: pulseBtn 1.8s infinite alternate;
    }

    @keyframes pulseBtn {
      from { transform: scale(1); box-shadow: 0 4px 14px rgba(245, 211, 112, 0.35); }
      to { transform: scale(1.04); box-shadow: 0 8px 24px rgba(245, 211, 112, 0.6); }
    }

    /* Toast Notification */
    .adventure-toast {
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%) translateY(-20px);
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid var(--gold-accent);
      border-radius: 10px;
      padding: 12px 20px;
      color: #ffffff;
      font-size: 14px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(12px);
      z-index: 2000;
      opacity: 0;
      pointer-events: none;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .adventure-toast.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }

    /* Satchel Drawer */
    .adventure-satchel-drawer {
      position: absolute;
      top: 70px;
      right: 16px;
      background: rgba(14, 20, 36, 0.96);
      border: 1px solid var(--border-panel);
      border-radius: 12px;
      padding: 16px;
      width: 290px;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(14px);
      pointer-events: auto;
      display: none;
      flex-direction: column;
      gap: 12px;
    }

    .adventure-satchel-drawer.open {
      display: flex;
    }

    .adventure-controls-hint {
      background: rgba(10, 15, 28, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 20px;
      padding: 6px 14px;
      font-size: 12px;
      color: var(--text-muted);
      pointer-events: auto;
      backdrop-filter: blur(8px);
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

    <nav class="nav-tabs" aria-label="Game Navigation">
      <button class="nav-tab-btn ${activeTab === 'map' ? 'active' : ''}" data-tab="map">
        <span>🗺️</span> <span>World Map</span>
      </button>
      <button class="nav-tab-btn ${activeTab === 'district' ? 'active' : ''}" data-tab="district">
        <span>📍</span> <span>Exploration</span>
      </button>
      <button class="nav-tab-btn ${activeTab === 'spatial' ? 'active' : ''}" data-tab="spatial">
        <span>🌍</span> <span>3D World</span>
      </button>
      <button class="nav-tab-btn ${activeTab === 'world_now' ? 'active' : ''}" data-tab="world_now">
        <span>📰</span> <span>World Now</span>
      </button>
      <button class="nav-tab-btn ${activeTab === 'passport' ? 'active' : ''}" data-tab="passport">
        <span>📖</span> <span>Passport</span>
      </button>
    </nav>

    <div class="nav-actions">
      <button class="btn-enter-vr-nav interactive" id="btn-nav-enter-vr" title="Launch Meta Quest VR Experience" aria-label="Launch Meta Quest VR Experience">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
          <path d="M20.5 6h-17A2.5 2.5 0 0 0 1 8.5v7A2.5 2.5 0 0 0 3.5 18h4.7a2 2 0 0 0 1.6-.8L11 15.5a1.4 1.4 0 0 1 2 0l1.2 1.7a2 2 0 0 0 1.6.8h4.7a2.5 2.5 0 0 0 2.5-2.5v-7A2.5 2.5 0 0 0 20.5 6zM7 13.5A2.5 2.5 0 1 1 9.5 11 2.5 2.5 0 0 1 7 13.5zm10 0A2.5 2.5 0 1 1 19.5 11 2.5 2.5 0 0 1 17 13.5z"/>
        </svg>
        <span>Enter VR</span>
      </button>

      <div class="user-profile-badge" id="btn-user-profile" title="Edit Profile & Challenge Level" role="button" tabindex="0">
        <span class="profile-avatar">${state.profile.avatar}</span>
        <div class="profile-info">
          <span class="profile-name">${state.profile.name}</span>
          <span class="profile-level">Level ${state.profile.guardianLevel} · ${state.profile.totalXp} XP</span>
        </div>
      </div>
    </div>
  `;

  bar.querySelector('#btn-brand-home')?.addEventListener('click', () => onTabSelect('map'));
  bar.querySelector('#btn-user-profile')?.addEventListener('click', onProfileClick);
  bar.querySelector('#btn-nav-enter-vr')?.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('advenquo-launch-vr'));
  });

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
  const worldStreaming = WorldStreamingSystem.getInstance();
  const currentLocId = worldStreaming ? worldStreaming.getCurrentLocationId() : 'nigerian_market';

  // 4 Playable Nigerian Environments on Interactive Regional Map
  const mapNodes = [
    {
      id: 'nigerian_market',
      districtId: 'isale_eko',
      name: 'Ìsàlẹ̀ Èkó Artisan Market',
      localName: 'Ọjà Ìsàlẹ̀ Èkó',
      category: 'market',
      icon: '🛍️',
      color: '#f5d370',
      x: 48,
      y: 52,
      desc: 'Historic indigo dyeing vats, Gángan talking drum guilds & elder veranda.',
    },
    {
      id: 'lagos_urban',
      districtId: 'yaba',
      name: 'Yaba Tech & Transit Corridor',
      localName: 'Yaba Silicon Lagoon',
      category: 'urban',
      icon: '🚌',
      color: '#38bdf8',
      x: 35,
      y: 26,
      desc: 'CcHUB innovation studios, Danfo buses & smart transit shelters.',
    },
    {
      id: 'heritage_iga',
      districtId: 'heritage_iga',
      name: 'Iga Idunganran Royal Palace',
      localName: 'Iga Idúngànrán',
      category: 'heritage',
      icon: '👑',
      color: '#eab308',
      x: 58,
      y: 45,
      desc: 'Ancient Oba’s throne dais, carved iroko pillars & royal bronze leopards.',
    },
    {
      id: 'beach_waterfront',
      districtId: 'beach_waterfront',
      name: 'Tarkwa Bay Coastal Haven',
      localName: 'Etíkun Tarkwa',
      category: 'natural',
      icon: '🏖️',
      color: '#34d399',
      x: 65,
      y: 82,
      desc: 'Atlantic surf, artisanal fishing canoes, coconut palms & marine conservation.',
    },
  ];

  container.innerHTML = `
    <div style="background: var(--bg-panel); border: 1px solid var(--border-panel); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
        <div>
          <h2 style="font-size: 24px; color: var(--gold-accent); margin: 0 0 6px 0;">Interactive World Atlas & Regional Navigation</h2>
          <p style="font-size: 14px; color: var(--text-muted); margin: 0;">Explore connected Nigerian environments, open-world transit links, and global expansion destinations.</p>
        </div>
        <div style="display: flex; gap: 10px; align-items: center;">
          <span style="background: rgba(245, 211, 112, 0.1); border: 1px solid var(--gold-accent); color: var(--gold-accent); padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700;">
            4 Connected Playable Locations
          </span>
          <button class="btn-gold" id="btn-quick-enter-world" style="padding: 7px 16px; font-size: 13px;">
            Enter Living 3D World 🌍 →
          </button>
        </div>
      </div>

      <!-- Interactive Regional Map of Lagos (SVG Visual Map Canvas) -->
      <div style="position: relative; width: 100%; min-height: 380px; background: #060b18; border: 1px solid rgba(74, 144, 217, 0.3); border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; padding: 16px;">
        <svg style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;" viewBox="0 0 100 100" preserveAspectRatio="none">
          <!-- Stylized Lagoon & Ocean Waters -->
          <rect x="0" y="0" width="100" height="100" fill="#060c1c" />
          <!-- Lagos Lagoon Waterway -->
          <path d="M 0 35 Q 35 30 50 48 Q 65 60 100 50 L 100 100 L 0 100 Z" fill="#08182f" opacity="0.8" />
          <!-- Atlantic Ocean Swell -->
          <path d="M 0 70 Q 50 65 100 75 L 100 100 L 0 100 Z" fill="#062244" opacity="0.9" />

          <!-- Connecting Travel Routes -->
          <!-- Route: Yaba to Nigerian Market (Danfo Bus Bridge) -->
          <line x1="35" y1="26" x2="48" y2="52" stroke="#38bdf8" stroke-width="0.8" stroke-dasharray="1.5, 1" />
          <!-- Route: Market to Palace (Archway Path) -->
          <line x1="48" y1="52" x2="58" y2="45" stroke="#f5d370" stroke-width="0.9" />
          <!-- Route: Market to Tarkwa Bay (Harbour Ferry) -->
          <line x1="48" y1="52" x2="65" y2="82" stroke="#34d399" stroke-width="0.8" stroke-dasharray="2, 1" />
          <!-- Route: Palace to Tarkwa Bay (Marina Jetty Ferry) -->
          <line x1="58" y1="45" x2="65" y2="82" stroke="#34d399" stroke-width="0.8" stroke-dasharray="2, 1" />
        </svg>

        <!-- Route Labels & Transit Legend -->
        <div style="z-index: 2; display: flex; justify-content: space-between; align-items: center; background: rgba(8, 12, 22, 0.85); padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.08); font-size: 11px; color: var(--text-muted); backdrop-filter: blur(8px);">
          <div style="display: flex; gap: 14px; flex-wrap: wrap;">
            <span>🚌 <strong>Eko Bridge Transit:</strong> Yaba ↔ Ìsàlẹ̀ Èkó (12 min)</span>
            <span>🚶 <strong>Palace Archway:</strong> Market ↔ Iga Idunganran (3 min)</span>
            <span>⛵ <strong>Harbour Ferry:</strong> CMS ↔ Tarkwa Bay (15 min)</span>
          </div>
          <span style="color: var(--gold-accent); font-weight: 700;">Click any destination node to travel</span>
        </div>

        <!-- Destination Interactive Nodes -->
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: auto;">
          ${mapNodes
            .map((node) => {
              const isCurrent = node.id === currentLocId;
              return `
              <div class="map-interactive-node" data-loc-id="${node.id}" style="
                position: absolute;
                left: ${node.x}%;
                top: ${node.y}%;
                transform: translate(-50%, -50%);
                cursor: pointer;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
                transition: transform 0.2s ease;
                z-index: 10;
              ">
                <div style="
                  width: 44px;
                  height: 44px;
                  border-radius: 50%;
                  background: ${isCurrent ? '#f5d370' : '#101a30'};
                  border: 2px solid ${node.color};
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 20px;
                  box-shadow: 0 0 16px ${isCurrent ? 'rgba(245, 211, 112, 0.7)' : 'rgba(0,0,0,0.5)'};
                ">
                  ${node.icon}
                </div>
                <div style="
                  background: rgba(8, 14, 28, 0.92);
                  border: 1px solid ${isCurrent ? 'var(--gold-accent)' : 'rgba(255,255,255,0.15)'};
                  padding: 3px 8px;
                  border-radius: 6px;
                  text-align: center;
                  white-space: nowrap;
                  backdrop-filter: blur(6px);
                ">
                  <div style="font-size: 11px; font-weight: 700; color: ${isCurrent ? 'var(--gold-accent)' : '#fff'};">
                    ${node.name} ${isCurrent ? '📍 (Here)' : ''}
                  </div>
                  <div style="font-size: 9px; color: var(--text-muted);">${node.localName}</div>
                </div>
              </div>
            `;
            })
            .join('')}
        </div>

        <!-- Map Footer: Quick Travel Bar -->
        <div style="z-index: 2; display: flex; justify-content: space-between; align-items: center; background: rgba(8, 12, 22, 0.88); padding: 8px 14px; border-radius: 8px; border: 1px solid var(--border-panel); backdrop-filter: blur(8px);">
          <div style="font-size: 12px; color: var(--text-main);">
            Currently at: <strong style="color: var(--gold-accent);">${worldStreaming?.getCurrentLocation().name || 'Nigeria'}</strong>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn-travel-quick" data-loc-id="nigerian_market" style="background: rgba(245, 211, 112, 0.15); border: 1px solid #f5d370; color: #f5d370; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">
              🛍️ Market
            </button>
            <button class="btn-travel-quick" data-loc-id="lagos_urban" style="background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; color: #38bdf8; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">
              🚌 Yaba
            </button>
            <button class="btn-travel-quick" data-loc-id="heritage_iga" style="background: rgba(234, 179, 8, 0.15); border: 1px solid #eab308; color: #eab308; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">
              👑 Palace
            </button>
            <button class="btn-travel-quick" data-loc-id="beach_waterfront" style="background: rgba(52, 211, 153, 0.15); border: 1px solid #34d399; color: #34d399; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">
              🏖️ Tarkwa Bay
            </button>
          </div>
        </div>
      </div>

      <!-- Global Expansion Destinations (International Architecture) -->
      <div>
        <h3 style="font-size: 16px; color: var(--text-main); margin: 0 0 10px 0; display: flex; align-items: center; gap: 8px;">
          🌐 Global Expansion World Map
        </h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 12px;">
          ${destinations
            .map(
              (dest) => `
            <div class="destination-card" data-dest-id="${dest.id}" style="
              background: ${dest.id === selectedDestinationId ? 'rgba(245, 211, 112, 0.08)' : 'var(--bg-card)'};
              border: 1px solid ${dest.id === selectedDestinationId ? 'var(--gold-accent)' : 'rgba(255, 255, 255, 0.08)'};
              border-radius: 10px;
              padding: 14px;
              cursor: pointer;
              display: flex;
              flex-direction: column;
              gap: 8px;
            ">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 14px; font-weight: 700; color: var(--text-main);">${dest.name}</span>
                <span style="
                  font-size: 9px;
                  font-weight: 700;
                  padding: 2px 6px;
                  border-radius: 4px;
                  background: ${dest.status === 'PLAYABLE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(156, 163, 175, 0.2)'};
                  color: ${dest.status === 'PLAYABLE' ? 'var(--tag-verified)' : '#9ca3af'};
                ">
                  ${dest.status === 'PLAYABLE' ? '● 4 LOCATIONS' : 'PREVIEW'}
                </span>
              </div>
              <p style="font-size: 11px; color: var(--text-muted); line-height: 1.35; margin: 0;">${dest.description}</p>
            </div>
          `,
            )
            .join('')}
        </div>
      </div>
    </div>
  `;

  // Wire node travel clicks
  container.querySelectorAll('.map-interactive-node, .btn-travel-quick').forEach((el) => {
    el.addEventListener('click', (e) => {
      const locId = (e.currentTarget as HTMLElement).getAttribute('data-loc-id');
      if (locId) {
        WorldStreamingSystem.getInstance()?.travelTo(locId);
        onEnterDestination('nigeria');
      }
    });
  });

  container.querySelectorAll('.destination-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      const destId = (e.currentTarget as HTMLElement).getAttribute('data-dest-id');
      if (destId) onSelectDestination(destId);
    });
  });

  container.querySelector('#btn-quick-enter-world')?.addEventListener('click', () => {
    onEnterDestination('nigeria');
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
  onOpenWorldMap?: () => void,
): HTMLElement {
  const root = document.createElement('div');
  root.className = 'advenquo-adventure-hud-root';

  const advSystem = AdventureMissionSystem.getInstance();
  const playerController = PlayerControllerSystem.getInstance();
  const worldStreaming = WorldStreamingSystem.getInstance();
  const currentLoc = worldStreaming?.getCurrentLocation();
  const objective = advSystem ? advSystem.getActiveObjective() : null;
  const dialogue = advSystem ? advSystem.getActiveDialogue() : null;
  const inventory = advSystem ? advSystem.getInventory() : [];
  let isFreeExploration = (storage.getState().explorationMode ?? 'free_exploration') === 'free_exploration';
  const distance = playerController ? Math.round(playerController.getDistanceToTarget() * 10) / 10 : 0;
  const bearing = playerController ? playerController.getBearingToTarget() : 0;
  const isNearTarget = distance > 0 && distance <= (objective?.targetRadius || 3.2);

  // Direction indicator based on bearing (-180 to 180 degrees)
  let compassArrow = '⬆️';
  if (bearing > 45 && bearing < 135) compassArrow = '➡️';
  else if (bearing >= 135 || bearing <= -135) compassArrow = '⬇️';
  else if (bearing < -45 && bearing > -135) compassArrow = '⬅️';

  root.innerHTML = `
    <!-- Top Adventure Navigation & Objective Bar -->
    <div class="adventure-top-bar">
      <div style="display: flex; flex-direction: column; gap: 8px; pointer-events: auto;">
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <button class="btn-gold" id="btn-spatial-world-map" style="font-size: 13px; padding: 7px 12px; gap: 6px; background: rgba(74, 144, 217, 0.25); border: 1px solid var(--indigo-accent); color: var(--text-main);">
            🗺️ World Map
          </button>
          <button class="btn-gold" id="btn-spatial-travel" style="font-size: 13px; padding: 7px 12px; gap: 6px; background: rgba(16, 185, 129, 0.25); border: 1px solid var(--tag-verified); color: var(--text-main);">
            🚀 Travel
          </button>
          <button class="btn-gold" id="btn-spatial-mode" style="font-size: 13px; padding: 7px 12px; gap: 6px; background: rgba(245, 211, 112, 0.15); border: 1px solid var(--gold-accent); color: var(--gold-accent);">
            ${isFreeExploration ? '🎯 Quest Mode' : '🧭 Free Explore'}
          </button>
          <button class="btn-gold" id="btn-spatial-time" style="font-size: 13px; padding: 7px 12px; gap: 6px; background: rgba(251, 146, 60, 0.25); border: 1px solid #fb923c; color: #ffedd5;">
            ☀️ Time
          </button>
          <button class="btn-gold" id="btn-spatial-weather" style="font-size: 13px; padding: 7px 12px; gap: 6px; background: rgba(56, 189, 248, 0.25); border: 1px solid #38bdf8; color: #e0f2fe;">
            🌦️ Weather
          </button>
          <button class="btn-gold" id="btn-spatial-return" style="font-size: 13px; padding: 7px 12px; gap: 6px;">
            📍 District
          </button>
        </div>
        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          <div style="font-size: 12px; font-weight: 700; color: var(--gold-accent); background: rgba(12, 18, 34, 0.85); padding: 4px 10px; border-radius: 6px; border: 1px solid var(--border-panel); backdrop-filter: blur(8px);">
            🏺 Artifacts: <span id="spatial-counter">${discoveredCount} / ${totalCount}</span>
          </div>
          <div id="spatial-location-chip" style="font-size: 12px; font-weight: 600; color: #a5b4fc; background: rgba(12, 18, 34, 0.85); padding: 4px 10px; border-radius: 6px; border: 1px solid var(--border-panel); backdrop-filter: blur(8px);">
            📍 ${currentLoc ? currentLoc.name : 'Nigeria'}
          </div>
        </div>
      </div>

      <!-- Objective Tracker Card -->
      <div id="adventure-objective-tracker-wrap" style="display: ${isFreeExploration ? 'none' : 'block'};">
      ${
        objective
          ? `
        <div class="adventure-objective-card">
          <div class="adventure-objective-tag">
            <span>🎯 ${objective.title}</span>
          </div>
          <div class="adventure-objective-instruction">
            ${objective.instruction}
          </div>
          <div class="adventure-objective-meta">
            <span class="adventure-target-badge">
              📍 ${objective.targetName}
            </span>
            <span id="adventure-distance-label">
              ${compassArrow} ${distance > 0 ? `${distance}m away` : 'At location'}
            </span>
          </div>
        </div>
      `
          : ''
      }
      </div>

      <!-- Satchel Bag & Controls Guide -->
      <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px; pointer-events: auto;">
        <button class="btn-gold" id="btn-adventure-satchel" style="font-size: 13px; padding: 8px 14px; gap: 8px; background: rgba(22, 30, 58, 0.95); border-color: var(--border-panel);">
          🎒 Satchel (${inventory.length})
        </button>
        <div class="adventure-controls-hint">
          Point at Tobi, a market resident or clue, then pinch to interact. Desktop: click or press E nearby.
        </div>
      </div>
    </div>

    <!-- Quick Travel Drawer -->
    <div id="spatial-travel-drawer" class="adventure-satchel-drawer" style="left: 20px; right: auto; width: 330px;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-panel); padding-bottom: 8px; margin-bottom: 4px;">
        <strong style="color: var(--gold-accent); font-size: 14px;">🚀 Open-World Travel</strong>
        <span style="font-size: 11px; color: var(--text-muted);">4 Destinations</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <button class="btn-travel-dest" data-loc-id="nigerian_market" style="text-align: left; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); padding: 10px; border-radius: 8px; cursor: pointer; color: var(--text-main); transition: all 0.2s ease;">
          <div style="font-weight: 700; font-size: 13px; color: var(--gold-accent);">🛍️ Ìsàlẹ̀ Èkó Artisan Market</div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Adire dyers, master drummers & elder veranda</div>
        </button>
        <button class="btn-travel-dest" data-loc-id="lagos_urban" style="text-align: left; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); padding: 10px; border-radius: 8px; cursor: pointer; color: var(--text-main); transition: all 0.2s ease;">
          <div style="font-weight: 700; font-size: 13px; color: #38bdf8;">🚌 Yaba Tech & Transit Corridor</div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Danfo bus, CcHUB innovation studio & transit shelter</div>
        </button>
        <button class="btn-travel-dest" data-loc-id="heritage_iga" style="text-align: left; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); padding: 10px; border-radius: 8px; cursor: pointer; color: var(--text-main); transition: all 0.2s ease;">
          <div style="font-weight: 700; font-size: 13px; color: #eab308;">👑 Iga Idunganran Royal Palace</div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Ancestral carved iroko columns, royal throne & bronze leopards</div>
        </button>
        <button class="btn-travel-dest" data-loc-id="beach_waterfront" style="text-align: left; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); padding: 10px; border-radius: 8px; cursor: pointer; color: var(--text-main); transition: all 0.2s ease;">
          <div style="font-weight: 700; font-size: 13px; color: #34d399;">🏖️ Tarkwa Bay Coastal Haven</div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Coconut palms, artisanal fishing canoes & ocean cabanas</div>
        </button>
      </div>
    </div>

    <!-- Satchel Drawer (Floating Inventory) -->
    <div id="adventure-satchel-drawer" class="adventure-satchel-drawer">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-panel); padding-bottom: 8px;">
        <strong style="color: var(--gold-accent); font-size: 14px;">🎒 Explorer Satchel</strong>
        <span style="font-size: 12px; color: var(--text-muted);">${inventory.length} item(s)</span>
      </div>
      ${
        inventory.length === 0
          ? `<p style="font-size: 13px; color: var(--text-muted); font-style: italic; margin: 8px 0;">Your satchel is empty. Explore the market to discover clues and items.</p>`
          : inventory
              .map(
                (item) => `
          <div style="background: rgba(255, 255, 255, 0.05); padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1);">
            <div style="font-weight: 700; font-size: 13px; color: var(--gold-accent); margin-bottom: 4px;">
              ${item.icon} ${item.name}
            </div>
            <div style="font-size: 11px; color: var(--text-muted); line-height: 1.3;">
              ${item.description}
            </div>
          </div>
        `,
              )
              .join('')
      }
    </div>

    <!-- Active Toast Notification Container -->
    <div id="adventure-toast" class="adventure-toast"></div>

    <!-- Bottom Context: Interactive Dialogue OR Action Prompt -->
    <div>
      ${
        dialogue
          ? `
        <div class="adventure-dialogue-card">
          <div class="dialogue-speaker-header">
            <span class="dialogue-speaker-name">🗣️ ${dialogue.characterName}</span>
            <span class="dialogue-speaker-role">${dialogue.characterRole}</span>
          </div>
          <div class="dialogue-speech-text">
            "${dialogue.speech}"
          </div>
          ${
            dialogue.culturalNote
              ? `
            <div class="dialogue-cultural-note">
              <strong>Cultural Context:</strong> ${dialogue.culturalNote}
            </div>
          `
              : ''
          }
          <div class="dialogue-choices-grid">
            ${dialogue.choices
              .map(
                (c) => `
              <button class="dialogue-choice-btn" data-choice-id="${c.id}">
                <span>${c.text}</span>
                ${c.yorubaTerm ? `<span style="font-size: 12px; color: var(--gold-accent); background: rgba(245, 211, 112, 0.15); padding: 2px 8px; border-radius: 4px;">${c.yorubaTerm}</span>` : '<span>→</span>'}
              </button>
            `,
              )
              .join('')}
          </div>
          <div style="text-align: right; margin-top: 10px;">
            <button id="btn-dialogue-dismiss" style="background: transparent; border: none; color: var(--text-muted); font-size: 12px; cursor: pointer; text-decoration: underline;">
              Continue exploring
            </button>
          </div>
        </div>
      `
          : isNearTarget
            ? `
        <button class="adventure-action-prompt" id="btn-adventure-action" style="display: ${isFreeExploration ? 'none' : 'flex'};">
          <span>✨ [ E ] Interact with ${objective?.targetName}</span>
        </button>
      `
            : ''
      }
    </div>
  `;

  // Wire events
  root.querySelector('#btn-spatial-return')?.addEventListener('click', onReturnToExploration);

  root.querySelector('#btn-spatial-world-map')?.addEventListener('click', () => {
    if (onOpenWorldMap) {
      onOpenWorldMap();
    } else {
      onReturnToExploration();
    }
  });

  root.querySelector('#btn-spatial-time')?.addEventListener('click', () => {
    const newLighting = timeOfDaySystem.cycleNextTime();
    worldStreaming?.updateAtmosphericLighting();
    worldStreaming?.showToast(
      `☀️ Time: ${newLighting.timeOfDay.toUpperCase().replace('_', ' ')}`,
      `Sun elevation: ${newLighting.sunElevation}°. Atmospheric lighting updated.`,
      3.0,
    );
  });

  root.querySelector('#btn-spatial-weather')?.addEventListener('click', () => {
    const newWeather = weatherSystem.cycleNextWeather();
    worldStreaming?.updateAtmosphericLighting();
    worldStreaming?.showToast(
      `🌦️ Weather: ${newWeather.name}`,
      `${newWeather.description}`,
      3.0,
    );
  });

  const satchelBtn = root.querySelector('#btn-adventure-satchel');
  const satchelDrawer = root.querySelector('#adventure-satchel-drawer');
  satchelBtn?.addEventListener('click', () => {
    satchelDrawer?.classList.toggle('open');
    root.querySelector('#spatial-travel-drawer')?.classList.remove('open');
  });

  const travelBtn = root.querySelector('#btn-spatial-travel');
  const travelDrawer = root.querySelector('#spatial-travel-drawer');
  travelBtn?.addEventListener('click', () => {
    travelDrawer?.classList.toggle('open');
    satchelDrawer?.classList.remove('open');
  });

  root.querySelectorAll('.btn-travel-dest').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const locId = (e.currentTarget as HTMLElement).getAttribute('data-loc-id');
      if (locId) {
        WorldStreamingSystem.getInstance()?.travelTo(locId);
        travelDrawer?.classList.remove('open');
        const locChip = root.querySelector('#spatial-location-chip');
        const updatedLoc = WorldStreamingSystem.getInstance()?.getCurrentLocation();
        if (locChip && updatedLoc) {
          locChip.textContent = `📍 ${updatedLoc.name}`;
        }
      }
    });
  });

  const modeBtn = root.querySelector('#btn-spatial-mode');
  const objectiveWrap = root.querySelector('#adventure-objective-tracker-wrap') as HTMLElement | null;
  const actionPromptBtn = root.querySelector('#btn-adventure-action') as HTMLElement | null;
  modeBtn?.addEventListener('click', () => {
    isFreeExploration = !isFreeExploration;
    if (isFreeExploration) {
      storage.setExplorationMode('free_exploration');
      modeBtn.textContent = '🎯 Quest Mode';
      if (objectiveWrap) objectiveWrap.style.display = 'none';
      if (actionPromptBtn) actionPromptBtn.style.display = 'none';
      WorldStreamingSystem.getInstance()?.showToast(
        '🧭 Free Exploration Active',
        'Explore freely, inspect landmarks, and talk to residents without compulsory objectives.',
        3.0,
      );
    } else {
      storage.setExplorationMode('adventure_mission');
      modeBtn.textContent = '🧭 Free Explore';
      if (objectiveWrap) objectiveWrap.style.display = 'block';
      if (actionPromptBtn) actionPromptBtn.style.display = 'flex';
      WorldStreamingSystem.getInstance()?.showToast(
        '🎯 Adventure Objectives Active',
        'Follow compass waypoints and complete local missions.',
        3.0,
      );
    }
  });

  actionPromptBtn?.addEventListener('click', () => {
    advSystem?.triggerNearbyInteraction();
  });

  const dismissBtn = root.querySelector('#btn-dialogue-dismiss');
  dismissBtn?.addEventListener('click', () => {
    advSystem?.dismissDialogue();
  });

  root.querySelectorAll('.dialogue-choice-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const choiceId = (e.currentTarget as HTMLElement).getAttribute('data-choice-id');
      if (choiceId && advSystem) {
        advSystem.selectDialogueChoice(choiceId);
      }
    });
  });

  return root;
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
