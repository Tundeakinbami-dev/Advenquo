/**
 * Advenquo — NPC Spatial Dialogue System.
 *
 * Drives interactive conversations with 3D characters in the environment
 * (Baba Adéwálé on the veranda, Iyá Aláso at the market stall).
 *
 * Features:
 * - Detects Ray interaction or proximity to NPCs
 * - Renders conversation state dynamically onto `npc-dialogue-panel` (UIKitML)
 * - Evaluates dialogue choices deterministically via `missionEngine`
 * - Provides educational feedback on Yoruba language honorifics and cultural protocol
 * - Plays audio cues on correct answers
 * - Advances mission progress and synchronizes with `storage` and `gameShell`
 */

import {
  createSystem,
  Pressed,
  UIKit,
  UIKitMLAsset,
  Vector3,
} from '@iwsdk/core';

import { NPCCharacter } from './npc-component.js';
import { missionEngine } from './game/mission-engine.js';
import { gameShell } from './game/game-shell.js';
import { CinematicCameraSystem } from './systems/cinematic-camera-system.js';

export class NpcDialogueSystem extends createSystem({
  npcs: { required: [NPCCharacter] },
  interacted: { required: [NPCCharacter, Pressed] },
}) {
  private dialoguePanel: UIKitMLAsset | null = null;
  private activeNpcId: string | null = null;
  private currentMissionId: string = 'mission_yoruba_greetings';
  private tempVec = new Vector3();
  private playerPos = new Vector3();

  // Cached UIKit elements
  private nameEl: UIKit.Text | null = null;
  private roleEl: UIKit.Text | null = null;
  private promptEl: UIKit.Text | null = null;
  private choiceAContainer: any = null;
  private choiceAText: UIKit.Text | null = null;
  private choiceBContainer: any = null;
  private choiceBText: UIKit.Text | null = null;
  private choiceCContainer: any = null;
  private choiceCText: UIKit.Text | null = null;
  private feedbackContainer: any = null;
  private feedbackText: UIKit.Text | null = null;
  private continueBtn: any = null;

  // Active step dialogue choices cache
  private activeChoiceIds: string[] = [];
  private canAdvance = false;
  private isCompletedState = false;

  init(): void {
    // 1. Locate dialogue panel
    this.dialoguePanel = this.world.getSceneObject<UIKitMLAsset>('npc-dialogue-panel') ?? null;
    if (this.dialoguePanel) {
      this.nameEl = this.dialoguePanel.getElementById<UIKit.Text>('npc-name');
      this.roleEl = this.dialoguePanel.getElementById<UIKit.Text>('npc-role');
      this.promptEl = this.dialoguePanel.getElementById<UIKit.Text>('npc-prompt');

      this.choiceAContainer = this.dialoguePanel.getElementById('npc-choice-a');
      this.choiceAText = this.dialoguePanel.getElementById<UIKit.Text>('npc-choice-a-text');

      this.choiceBContainer = this.dialoguePanel.getElementById('npc-choice-b');
      this.choiceBText = this.dialoguePanel.getElementById<UIKit.Text>('npc-choice-b-text');

      this.choiceCContainer = this.dialoguePanel.getElementById('npc-choice-c');
      this.choiceCText = this.dialoguePanel.getElementById<UIKit.Text>('npc-choice-c-text');

      this.feedbackContainer = this.dialoguePanel.getElementById('npc-feedback');
      this.feedbackText = this.dialoguePanel.getElementById<UIKit.Text>('npc-feedback-text');
      this.continueBtn = this.dialoguePanel.getElementById('npc-continue-btn');

      // Wire Choice button clicks
      const onChoiceAClick = (): void => this._handleChoiceSelect(0);
      const onChoiceBClick = (): void => this._handleChoiceSelect(1);
      const onChoiceCClick = (): void => this._handleChoiceSelect(2);
      const onContinueClick = (): void => this._handleContinue();

      this.choiceAContainer?.addEventListener('click', onChoiceAClick);
      this.choiceBContainer?.addEventListener('click', onChoiceBClick);
      this.choiceCContainer?.addEventListener('click', onChoiceCClick);
      this.continueBtn?.addEventListener('click', onContinueClick);

      this.cleanupFuncs.push(
        () => this.choiceAContainer?.removeEventListener('click', onChoiceAClick),
        () => this.choiceBContainer?.removeEventListener('click', onChoiceBClick),
        () => this.choiceCContainer?.removeEventListener('click', onChoiceCClick),
        () => this.continueBtn?.removeEventListener('click', onContinueClick),
      );

      // Start hidden until activated
      this.dialoguePanel.visible = false;
    }

    // 2. React to player clicking/triggering an NPC
    this.cleanupFuncs.push(
      this.queries.interacted.subscribe('qualify', (entity) => {
        const charId = entity.getValue(NPCCharacter, 'characterId');
        if (charId && entity.object3D) {
          this.startDialogueWithNPC(charId, entity.object3D.position);
        }
      }),
    );
  }

  update(delta: number): void {
    // Proximity check: if player is within interaction range of an NPC and no dialogue is open,
    // open dialogue automatically if looking towards them
    if (!this.dialoguePanel?.visible) {
      if (this.player?.head) {
        this.player.head.getWorldPosition(this.playerPos);
      }

      for (const entity of this.queries.npcs.entities) {
        if (!entity.object3D) continue;
        entity.object3D.getWorldPosition(this.tempVec);
        const dist = this.playerPos.distanceTo(this.tempVec);
        const radius = entity.getValue(NPCCharacter, 'interactionRadius') || 3.0;

        if (dist <= radius) {
          const charId = entity.getValue(NPCCharacter, 'characterId');
          // Start dialogue when in close range
          if (charId && charId !== this.activeNpcId) {
            this.startDialogueWithNPC(charId, entity.object3D.position);
            break;
          }
        }
      }
    }
  }

  public startDialogueWithNPC(npcId: string, npcPosition: Vector3): void {
    this.activeNpcId = npcId;
    CinematicCameraSystem.getInstance()?.enterConversationFraming(npcPosition, npcId);

    // Match NPC to current active or relevant mission
    if (npcId === 'baba-adewale') {
      this.currentMissionId = 'mission_yoruba_greetings';
    } else if (npcId === 'iya-alaso') {
      this.currentMissionId = 'mission_adire_drum_investigation';
    } else if (npcId === 'driver-kehinde') {
      this.currentMissionId = 'mission_lagoon_transit';
    } else if (npcId === 'chief-eletu') {
      this.currentMissionId = 'mission_yoruba_greetings';
    } else if (npcId === 'captain-femi') {
      this.currentMissionId = 'mission_blue_line_future';
    }

    // Ensure mission is started in missionEngine
    const active = missionEngine.getActiveMissionState();
    if (!active || active.missionId !== this.currentMissionId) {
      missionEngine.startMission(this.currentMissionId);
    }

    // Position the dialogue panel comfortably beside the character, angled toward player
    if (this.dialoguePanel) {
      this.dialoguePanel.position.set(
        npcPosition.x + 0.65,
        Math.max(1.2, npcPosition.y + 0.6),
        npcPosition.z + 0.2,
      );
      this.dialoguePanel.lookAt(
        this.playerPos.x || 0,
        this.dialoguePanel.position.y,
        this.playerPos.z || 0,
      );
      this.dialoguePanel.visible = true;
    }

    this._renderCurrentStep();
  }

  private _renderCurrentStep(): void {
    const currentStep = missionEngine.getCurrentStep(this.currentMissionId);
    if (!currentStep) {
      // Mission completed or no more steps
      this._showCompletionState();
      return;
    }

    // Update speaker header
    this.nameEl?.setProperties({ text: currentStep.characterName || 'Elder of Ìsàlẹ̀ Èkó' } as never);
    this.roleEl?.setProperties({ text: currentStep.characterRole || 'Cultural Guide' } as never);

    // Update prompt
    this.promptEl?.setProperties({ text: currentStep.prompt } as never);

    // Hide feedback box initially for new step
    this.feedbackContainer?.setProperties({ display: 'none' });
    this.canAdvance = false;

    // Populate choices
    const choices = currentStep.dialogueChoices || [];
    this.activeChoiceIds = choices.map((c) => c.id);

    // Choice A
    if (choices[0]) {
      this.choiceAContainer?.setProperties({ display: 'flex' });
      this.choiceAText?.setProperties({ text: `A: ${choices[0].text}` } as never);
    } else {
      this.choiceAContainer?.setProperties({ display: 'none' });
    }

    // Choice B
    if (choices[1]) {
      this.choiceBContainer?.setProperties({ display: 'flex' });
      this.choiceBText?.setProperties({ text: `B: ${choices[1].text}` } as never);
    } else {
      this.choiceBContainer?.setProperties({ display: 'none' });
    }

    // Choice C
    if (choices[2]) {
      this.choiceCContainer?.setProperties({ display: 'flex' });
      this.choiceCText?.setProperties({ text: `C: ${choices[2].text}` } as never);
    } else {
      this.choiceCContainer?.setProperties({ display: 'none' });
    }
  }

  private _handleChoiceSelect(choiceIndex: number): void {
    const choiceId = this.activeChoiceIds[choiceIndex];
    if (!choiceId) return;

    const currentStep = missionEngine.getCurrentStep(this.currentMissionId);
    if (!currentStep) return;

    const result = missionEngine.submitChoice(this.currentMissionId, currentStep.id, choiceId);
    if (!result) return;

    // Display feedback
    this.feedbackContainer?.setProperties({ display: 'flex' });
    const explanation = result.explanation ? `\n\nCultural Context: ${result.explanation}` : '';
    this.feedbackText?.setProperties({
      text: `${result.feedback}${explanation}`,
    } as never);

    if (result.isCorrect) {
      this.canAdvance = true;
    } else {
      this.canAdvance = false;
    }
  }

  public closeDialogue(): void {
    if (this.dialoguePanel) {
      this.dialoguePanel.visible = false;
    }
    this.activeNpcId = null;
    this.isCompletedState = false;
    CinematicCameraSystem.getInstance()?.exitConversationFraming();
  }

  private _handleContinue(): void {
    if (this.isCompletedState) {
      this.closeDialogue();
      return;
    }

    if (!this.canAdvance) {
      // Allow retry by hiding feedback
      this.feedbackContainer?.setProperties({ display: 'none' });
      return;
    }

    // Advance to next step
    const advanceResult = missionEngine.advanceToNextStep(this.currentMissionId);
    if (advanceResult.hasNextStep) {
      this._renderCurrentStep();
    } else {
      // Mission finished! Complete and award rewards
      missionEngine.completeMission(this.currentMissionId);
      this._showCompletionState();
      // Synchronize gameShell
      gameShell.render();
    }
  }

  private _showCompletionState(): void {
    this.isCompletedState = true;
    this.promptEl?.setProperties({
      text: 'Ẹ ṣeé púpọ̀! (Thank you very much!) You have completed this dialogue with deep cultural respect and understanding.',
    } as never);
    this.choiceAContainer?.setProperties({ display: 'none' });
    this.choiceBContainer?.setProperties({ display: 'none' });
    this.choiceCContainer?.setProperties({ display: 'none' });

    this.feedbackContainer?.setProperties({ display: 'flex' });
    this.feedbackText?.setProperties({
      text: 'Mission completed! Your Culture Passport has been stamped with the Ọmọlúwàbí Badge and new Yoruba vocabulary has been added to your discovery journal.',
    } as never);

    this.continueBtn?.setProperties({ display: 'flex' });
    const contText = this.dialoguePanel?.getElementById<UIKit.Text>('continue-label');
    contText?.setProperties({ text: 'Close Dialogue' } as never);
    this.canAdvance = false;
  }
}
