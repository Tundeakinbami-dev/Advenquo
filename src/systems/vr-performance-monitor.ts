/**
 * Advenquo — Meta Quest 3 VR Performance Monitor & Profiler.
 *
 * Implements real-time frame budget and resource tracking for WebXR on Meta Quest 3:
 * - 72 FPS target: 13.89 ms frame-time budget
 * - 90 FPS sustainable target: 11.11 ms frame-time budget
 * - Consecutive frame-drop detection and hitch counting
 * - Garbage collection pressure monitoring (zero allocations in update loops)
 * - Exposes metrics for QualityProfileSystem dynamic LOD scaling
 */

export interface PerformanceMetrics {
  currentFps: number;
  averageFps: number;
  frameTimeMs: number;
  targetBudgetMs: number;
  consecutiveDrops: number;
  totalFrames: number;
  droppedFrames: number;
  heapUsedMb?: number;
  isWithinBudget: boolean;
}

export class VRPerformanceMonitor {
  private static instance: VRPerformanceMonitor | null = null;

  // Frame budgets in milliseconds
  public static readonly BUDGET_72_FPS = 13.889; // 1000 / 72
  public static readonly BUDGET_90_FPS = 11.111; // 1000 / 90

  private targetBudgetMs = VRPerformanceMonitor.BUDGET_72_FPS;
  private frameCount = 0;
  private droppedFrameCount = 0;
  private consecutiveDropCount = 0;
  private lastTimestamp = 0;
  private currentFrameTimeMs = 0;
  private recentFrameTimes: Float32Array = new Float32Array(60);
  private ringIndex = 0;

  public static getInstance(): VRPerformanceMonitor {
    if (!VRPerformanceMonitor.instance) {
      VRPerformanceMonitor.instance = new VRPerformanceMonitor();
    }
    return VRPerformanceMonitor.instance;
  }

  public setTargetFps(target: 72 | 90): void {
    this.targetBudgetMs =
      target === 90
        ? VRPerformanceMonitor.BUDGET_90_FPS
        : VRPerformanceMonitor.BUDGET_72_FPS;
  }

  /**
   * Called once per frame by the render loop or system update.
   * Zero heap allocations.
   */
  public recordFrame(deltaSeconds: number): void {
    this.frameCount++;
    const frameTimeMs = deltaSeconds * 1000;
    this.currentFrameTimeMs = frameTimeMs;

    this.recentFrameTimes[this.ringIndex] = frameTimeMs;
    this.ringIndex = (this.ringIndex + 1) % 60;

    if (frameTimeMs > this.targetBudgetMs + 1.5) {
      this.droppedFrameCount++;
      this.consecutiveDropCount++;
    } else {
      this.consecutiveDropCount = 0;
    }
  }

  public getMetrics(): PerformanceMetrics {
    let sum = 0;
    const count = Math.min(this.frameCount, 60);
    for (let i = 0; i < count; i++) {
      sum += this.recentFrameTimes[i];
    }
    const avgFrameTime = count > 0 ? sum / count : this.targetBudgetMs;
    const avgFps = avgFrameTime > 0 ? Math.min(120, Math.round(1000 / avgFrameTime)) : 72;
    const curFps = this.currentFrameTimeMs > 0 ? Math.min(120, Math.round(1000 / this.currentFrameTimeMs)) : avgFps;

    let heapUsedMb: number | undefined;
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      heapUsedMb = Math.round((performance as any).memory.usedJSHeapSize / (1024 * 1024));
    }

    return {
      currentFps: curFps,
      averageFps: avgFps,
      frameTimeMs: Number(this.currentFrameTimeMs.toFixed(2)),
      targetBudgetMs: Number(this.targetBudgetMs.toFixed(2)),
      consecutiveDrops: this.consecutiveDropCount,
      totalFrames: this.frameCount,
      droppedFrames: this.droppedFrameCount,
      heapUsedMb,
      isWithinBudget: this.currentFrameTimeMs <= this.targetBudgetMs,
    };
  }

  public reset(): void {
    this.frameCount = 0;
    this.droppedFrameCount = 0;
    this.consecutiveDropCount = 0;
    this.currentFrameTimeMs = 0;
    this.ringIndex = 0;
    this.recentFrameTimes.fill(0);
  }
}

export const vrPerformanceMonitor = VRPerformanceMonitor.getInstance();
