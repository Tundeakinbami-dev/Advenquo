/**
 * Advenquo — QualityProfileSystem.
 *
 * Implements scalable graphics quality tiers across device classes:
 * - DesktopCinematic: Real-time PCF soft shadows (2048²), procedural PBR normal maps (1024²),
 *   exponential atmospheric fog, multi-joint skeletal animation, and full interior point lighting.
 * - MobileBalanced: Single directional shadow (1024²), 512² PBR maps, linear distance fog,
 *   touch-optimized virtual joystick, and simplified gesture blend trees.
 * - QuestVRPerformance: Strict frame-budget management (72–90 FPS), lightweight forward
 *   lighting, blob contact shadows, optimized skeletal updates, and strict draw-call budgeting (<100).
 */

export type QualityProfileName = 'desktop_cinematic' | 'mobile_balanced' | 'quest_vr_performance';

export interface QualityProfileConfig {
  profileName: QualityProfileName;
  displayName: string;
  shadowMapResolution: number;
  enableSoftShadows: boolean;
  textureMapResolution: number;
  fogType: 'exp2' | 'linear' | 'none';
  fogDensity: number;
  enableInteriorPointLights: boolean;
  maxActiveNpcJointUpdates: number;
  targetFrameRate: number;
  drawCallBudget: number;
}

export class QualityProfileSystem {
  private static instance: QualityProfileSystem | null = null;
  private currentProfileName: QualityProfileName = 'desktop_cinematic';
  private onProfileChangedCallbacks: Array<(config: QualityProfileConfig) => void> = [];

  private readonly profiles: Record<QualityProfileName, QualityProfileConfig> = {
    desktop_cinematic: {
      profileName: 'desktop_cinematic',
      displayName: 'Cinematic Desktop (Ultra PBR & Soft Shadows)',
      shadowMapResolution: 2048,
      enableSoftShadows: true,
      textureMapResolution: 1024,
      fogType: 'exp2',
      fogDensity: 0.012,
      enableInteriorPointLights: true,
      maxActiveNpcJointUpdates: 24,
      targetFrameRate: 60,
      drawCallBudget: 250,
    },
    mobile_balanced: {
      profileName: 'mobile_balanced',
      displayName: 'Mobile Balanced (Adaptive Battery & Shader Scale)',
      shadowMapResolution: 1024,
      enableSoftShadows: false,
      textureMapResolution: 512,
      fogType: 'linear',
      fogDensity: 0.008,
      enableInteriorPointLights: false,
      maxActiveNpcJointUpdates: 12,
      targetFrameRate: 60,
      drawCallBudget: 150,
    },
    quest_vr_performance: {
      profileName: 'quest_vr_performance',
      displayName: 'Meta Quest Standalone VR (72–90 FPS Low Overhead)',
      shadowMapResolution: 512,
      enableSoftShadows: false,
      textureMapResolution: 256,
      fogType: 'linear',
      fogDensity: 0.006,
      enableInteriorPointLights: false,
      maxActiveNpcJointUpdates: 8,
      targetFrameRate: 72,
      drawCallBudget: 100,
    },
  };

  public static getInstance(): QualityProfileSystem {
    if (!QualityProfileSystem.instance) {
      QualityProfileSystem.instance = new QualityProfileSystem();
    }
    return QualityProfileSystem.instance;
  }

  constructor() {
    this.detectOptimalProfile();
  }

  private detectOptimalProfile(): void {
    if (typeof window === 'undefined') return;

    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
    const isQuest = /oculusbrowser|quest/i.test(userAgent);

    if (isQuest) {
      this.currentProfileName = 'quest_vr_performance';
    } else if (isMobile) {
      this.currentProfileName = 'mobile_balanced';
    } else {
      this.currentProfileName = 'desktop_cinematic';
    }
  }

  public getActiveProfile(): QualityProfileConfig {
    return this.profiles[this.currentProfileName];
  }

  public setProfile(profileName: QualityProfileName): void {
    this.currentProfileName = profileName;
    const config = this.getActiveProfile();
    for (const cb of this.onProfileChangedCallbacks) {
      cb(config);
    }
  }

  public onProfileChanged(callback: (config: QualityProfileConfig) => void): () => void {
    this.onProfileChangedCallbacks.push(callback);
    return () => {
      const idx = this.onProfileChangedCallbacks.indexOf(callback);
      if (idx !== -1) this.onProfileChangedCallbacks.splice(idx, 1);
    };
  }
}

export const qualityProfileSystem = QualityProfileSystem.getInstance();
