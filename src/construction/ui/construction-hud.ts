/**
 * Advenquo: Construction World — Construction HUD
 *
 * Coordinates seated construction HUD indicators:
 * - Active project title & stage progress
 * - Virtual table height offset & turntable orientation indicators
 * - Grabbed component status & two-hand manipulation indicators
 */

import type { Handedness, StarRating } from '../core/construction-types.js';

export interface HudViewModel {
  projectTitle: string;
  stageTitle: string;
  stageInstruction: string;
  stageNumber: number;
  totalStages: number;
  placedCount: number;
  tableHeightOffsetM: number;
  turntableAngleDeg: number;
  leftHandHolding?: string;
  rightHandHolding?: string;
  isTwoHanded: boolean;
  score?: number;
  stars?: StarRating;
}

export class ConstructionHud {
  private viewModel: HudViewModel;

  constructor() {
    this.viewModel = {
      projectTitle: 'Level 1: Small House',
      stageTitle: 'Foundation Inspection',
      stageInstruction: 'Inspect the foundation footing at the center of the workshop.',
      stageNumber: 1,
      totalStages: 6,
      placedCount: 0,
      tableHeightOffsetM: -0.35,
      turntableAngleDeg: 0,
      isTwoHanded: false,
    };
  }

  public getViewModel(): HudViewModel {
    return { ...this.viewModel };
  }

  public updateStage(
    stageNumber: number,
    totalStages: number,
    title: string,
    instruction: string
  ): void {
    this.viewModel.stageNumber = stageNumber;
    this.viewModel.totalStages = totalStages;
    this.viewModel.stageTitle = title;
    this.viewModel.stageInstruction = instruction;
  }

  public updateWorkspace(tableHeightM: number, turntableAngleRad: number): void {
    this.viewModel.tableHeightOffsetM = tableHeightM;
    this.viewModel.turntableAngleDeg = Math.round((turntableAngleRad * 180) / Math.PI);
  }

  public updateHandStatus(
    hand: Handedness,
    heldInstanceId?: string,
    isTwoHanded: boolean = false
  ): void {
    if (hand === 'left') {
      this.viewModel.leftHandHolding = heldInstanceId;
    } else {
      this.viewModel.rightHandHolding = heldInstanceId;
    }
    this.viewModel.isTwoHanded = isTwoHanded;
  }

  public updatePlacedCount(count: number): void {
    this.viewModel.placedCount = count;
  }
}
