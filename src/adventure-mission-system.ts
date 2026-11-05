/**
 * Advenquo — Adventure Mission & Objective Tracking System.
 *
 * Implements the core 3D adventure gameplay loop for:
 * "The Missing Market Delivery: Nigerian Traditional Market Discovery"
 *
 * Coordinates:
 * - Sequential exploration objectives with spatial waypoints
 * - Interactive NPC dialogues with contextual Yoruba etiquette learning
 * - Clue discovery and inventory management (Receipt Manifest, Indigo Crate)
 * - Completion celebration, rewards (+250 XP, Stamp, Vocabulary), and persistence
 * - Synchronization across Desktop HUD, Mobile Touch, and WebXR VR Tablet
 */

import {
  createSystem,
  Pressed,
  Vector3,
} from '@iwsdk/core';

import { NPCCharacter } from './npc-component.js';
import { CulturalObject } from './cultural-object-component.js';
import { AdventureItem } from './adventure-mission-component.js';
import { PlayerControllerSystem } from './player-controller-system.js';
import { storage } from './game/storage.js';

export interface AdventureInventoryItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  acquiredAt: string;
}

export type AdventureStage =
  | 'STAGE_0_ARRIVE'
  | 'STAGE_1_TALK_TRADER'
  | 'STAGE_2_SEEK_ELDER'
  | 'STAGE_3_DRUM_CIRCLE'
  | 'STAGE_4_INSPECT_CLUE'
  | 'STAGE_5_LOCATE_GOODS'
  | 'STAGE_6_COLLECT_GOODS'
  | 'STAGE_7_RETURN_DELIVERY'
  | 'STAGE_8_COMPLETED';

const ADVENTURE_ID = 'mission_nigerian_market_discovery';

export interface ActiveObjectiveInfo {
  stage: AdventureStage;
  title: string;
  instruction: string;
  targetName: string;
  targetPosition: Vector3;
  targetRadius: number;
  hint: string;
}

export class AdventureMissionSystem extends createSystem({
  npcs: { required: [NPCCharacter] },
  adventureItems: { required: [AdventureItem] },
  interactedItems: { required: [AdventureItem, Pressed] },
  interactedNpcs: { required: [NPCCharacter, Pressed] },
  interactedCulturalObjects: { required: [CulturalObject, Pressed] },
}) {
  private static instance: AdventureMissionSystem | null = null;
  public static getInstance(): AdventureMissionSystem | null {
    return AdventureMissionSystem.instance;
  }

  // Active Adventure State
  private currentStage: AdventureStage = 'STAGE_0_ARRIVE';
  private inventory: AdventureInventoryItem[] = [];
  private decisionId: string | null = null;
  private playerPos = new Vector3();
  private tempVec = new Vector3();

  // Known target positions in Ìsàlẹ̀ Èkó courtyard scene
  private readonly POS_IYA_ALASO = new Vector3(2.65, 0, -1.4);
  private readonly POS_TOBI = new Vector3(-4.8, 0, 0.5);
  private readonly POS_BABA_ADEWALE = new Vector3(0, 0, -3.8);
  private readonly POS_DRUM_CIRCLE = new Vector3(-2.11, 0.76, -1.45);
  private readonly POS_CLUE_SCROLL = new Vector3(-1.48, 0.74, -1.35);
  private readonly POS_MISSING_CRATE = new Vector3(-3.5, 0, 1.8);

  // Active dialogue popup state for Desktop/Mobile HUD
  private activeDialogueData: {
    characterName: string;
    characterRole: string;
    speech: string;
    culturalNote?: string;
    choices: Array<{
      id: string;
      text: string;
      feedback: string;
      yorubaTerm?: string;
      isCorrect: boolean;
      advanceStage?: AdventureStage;
      decisionId?: string;
    }>;
  } | null = null;

  // Notification toast
  private activeToast: { title: string; message: string; timer: number } | null = null;

  init(): void {
    AdventureMissionSystem.instance = this;

    const savedState = storage.getState();
    const savedAdventure = savedState.adventureProgress;
    this.currentStage = savedAdventure?.missionId === ADVENTURE_ID && this._isAdventureStage(savedAdventure.stage)
      ? savedAdventure.stage
      : savedState.activeMission?.completedStepIds.includes('step_collected_crate')
        ? 'STAGE_7_RETURN_DELIVERY'
        : 'STAGE_0_ARRIVE';
    this.decisionId = savedAdventure?.decisionId ?? null;

    if (savedAdventure?.inventoryItemIds.includes('delivery_manifest')) {
      this.inventory.push({
        id: 'delivery_manifest',
        name: 'Carriers Guild Receipt #104',
        icon: '📜',
        description: 'Receipt #104 traces the missing market consignment to the storage shed behind the district signpost.',
        acquiredAt: new Date().toISOString(),
      });
      this._markAdventureItemCollected('delivery_manifest');
    }
    if (savedAdventure?.inventoryItemIds.includes('missing_goods_crate') || this.currentStage === 'STAGE_7_RETURN_DELIVERY') {
      this.inventory.push({
        id: 'missing_goods_crate',
        name: 'Abeokuta Indigo Dye Crate',
        icon: '📦',
        description: 'Rare Abeokuta indigo cakes bound in raffia twine with an artisan wax seal.',
        acquiredAt: new Date().toISOString(),
      });
      this._markAdventureItemCollected('missing_goods_crate');
      const recoveredCrate = this.world.getSceneObject('missing-goods-crate');
      if (recoveredCrate) recoveredCrate.visible = false;
    }
    this._saveProgress();

    this._updateNavigationTarget();

    // 1. Subscribe to Adventure Items Pressed
    this.cleanupFuncs.push(
      this.queries.interactedItems.subscribe('qualify', (entity) => {
        const itemId = entity.getValue(AdventureItem, 'itemId');
        if (itemId) this.interactWithItem(itemId);
      }),
    );

    // 2. Subscribe to NPC Pressed
    this.cleanupFuncs.push(
      this.queries.interactedNpcs.subscribe('qualify', (entity) => {
        const charId = entity.getValue(NPCCharacter, 'characterId');
        if (charId) this.interactWithNPC(charId);
      }),
    );

    // The talking drum is an environmental clue as well as a cultural artifact.
    this.cleanupFuncs.push(
      this.queries.interactedCulturalObjects.subscribe('qualify', (entity) => {
        if (
          this.currentStage === 'STAGE_3_DRUM_CIRCLE' &&
          entity.getValue(CulturalObject, 'factId') === 'talking-drum'
        ) {
          this._discoverDrumClue();
        }
      }),
    );


    // 3. Listen to keyboard interaction hotkey 'E' or Space
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.code === 'KeyE' || e.key === 'e') {
        this.triggerNearbyInteraction();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    this.cleanupFuncs.push(() => {
      window.removeEventListener('keydown', onKeyDown);
    });
  }

  public getCurrentStage(): AdventureStage {
    return this.currentStage;
  }

  public getInventory(): AdventureInventoryItem[] {
    return this.inventory;
  }

  public getActiveDialogue() {
    return this.activeDialogueData;
  }

  public dismissDialogue(): void {
    this.activeDialogueData = null;
    this._refreshHUD();
  }

  public getActiveObjective(): ActiveObjectiveInfo {
    switch (this.currentStage) {
      case 'STAGE_0_ARRIVE':
        return {
          stage: this.currentStage,
          title: 'The Missing Shipment',
          instruction: 'Meet Tobi, the junior architect coordinating a sustainable market-side construction project.',
          targetName: 'Tobi Adeleke (Project Architect)',
          targetPosition: this.POS_TOBI,
          targetRadius: 3.2,
          hint: 'Find Tobi by the market approach and ask which construction materials have gone missing.',
        };
      case 'STAGE_1_TALK_TRADER':
        return {
          stage: this.currentStage,
          title: 'The Missing Shipment',
          instruction: 'Ask Iyá Aláso what she knows about the shipment Tobi arranged through the market guild.',
          targetName: 'Iyá Aláso (Textile Stall)',
          targetPosition: this.POS_IYA_ALASO,
          targetRadius: 3.2,
          hint: 'Head toward the colorful indigo fabric stall on the right side of the courtyard.',
        };

      case 'STAGE_2_SEEK_ELDER':
        return {
          stage: this.currentStage,
          title: 'The Elder’s Counsel',
          instruction: 'Consult Baba Adéwálé on the palace veranda about passing carriers.',
          targetName: 'Baba Adéwálé (Palace Veranda)',
          targetPosition: this.POS_BABA_ADEWALE,
          targetRadius: 3.5,
          hint: 'Approach the carved veranda at the front of the courtyard and greet Baba Adéwálé respectfully.',
        };

      case 'STAGE_3_DRUM_CIRCLE':
        return {
          stage: this.currentStage,
          title: 'Echoes of the Market',
          instruction: 'Investigate the Talking Drum circle for clues about the carrier.',
          targetName: 'Talking Drum (Display Table)',
          targetPosition: this.POS_DRUM_CIRCLE,
          targetRadius: 2.8,
          hint: 'Walk past the center courtyard to the wooden display table where the Gángan drum rests.',
        };

      case 'STAGE_4_INSPECT_CLUE':
        return {
          stage: this.currentStage,
          title: 'The Dropped Manifest',
          instruction: 'Inspect the dropped manifest receipt scroll near the calabash bowls.',
          targetName: 'Delivery Receipt Scroll',
          targetPosition: this.POS_CLUE_SCROLL,
          targetRadius: 2.4,
          hint: 'Look closely at the table next to the carved calabash bowls for a parchment scroll.',
        };

      case 'STAGE_5_LOCATE_GOODS':
      case 'STAGE_6_COLLECT_GOODS':
        return {
          stage: this.currentStage,
          title: 'Unclaimed Consignment',
          instruction: 'Search behind the Ìsàlẹ̀ Èkó district signpost for the missing dye crate.',
          targetName: 'Abeokuta Indigo Dye Crate',
          targetPosition: this.POS_MISSING_CRATE,
          targetRadius: 2.6,
          hint: 'Follow the western pathway behind the district signpost toward the storage stall.',
        };

      case 'STAGE_7_RETURN_DELIVERY':
        return {
          stage: this.currentStage,
          title: 'Resolve the Site Delay',
          instruction: 'Bring the recovered consignment to Tobi and decide how the crew should proceed.',
          targetName: 'Tobi Adeleke (Project Architect)',
          targetPosition: this.POS_TOBI,
          targetRadius: 3.2,
          hint: 'Return the shipment to Tobi at the market approach. He is waiting to plan the construction work safely.',
        };

      case 'STAGE_8_COMPLETED':
      default:
        return {
          stage: 'STAGE_8_COMPLETED',
          title: 'Adventure Completed!',
          instruction: 'You traced the shipment with Tobi and Iyá Aláso, then agreed on a plan for the delayed construction work.',
          targetName: 'Courtyard Center',
          targetPosition: new Vector3(0, 0, 0),
          targetRadius: 5.0,
          hint: 'Explore the market or open the Adventure Journal to view your rewards.',
        };
    }
  }

  /**
   * Evaluates interactions with items (clue manifest, missing crate).
   */
  public interactWithItem(itemId: string): void {
    if (itemId === 'delivery_manifest') {
      if (this.currentStage === 'STAGE_4_INSPECT_CLUE') {
        // Collect clue receipt
        if (!this.inventory.some((i) => i.id === 'delivery_manifest')) {
          this.inventory.push({
            id: 'delivery_manifest',
            name: 'Carriers Guild Receipt #104',
            icon: '📜',
            description: 'A parchment receipt: "Consignment #104: Abeokuta Indigo dye cakes & Adire stencils. Dropped off at the courtyard storage shed behind the market signpost."',
            acquiredAt: new Date().toISOString(),
          });
        }

        this._markAdventureItemCollected(itemId);

        this._showToast(
          '📜 Clue Discovered: Delivery Receipt #104',
          'Note reads: "Dye crate dropped off near the storage shed behind the district signpost."',
        );

        this._setStage('STAGE_5_LOCATE_GOODS');
      } else {
        this._showToast('📜 Carrier Manifest', 'A guild receipt mentioning Abeokuta indigo dye.');
      }
    } else if (itemId === 'missing_goods_crate') {
      if (
        this.currentStage === 'STAGE_5_LOCATE_GOODS' ||
        this.currentStage === 'STAGE_6_COLLECT_GOODS'
      ) {
        // Pick up the crate
        if (!this.inventory.some((i) => i.id === 'missing_goods_crate')) {
          this.inventory.push({
            id: 'missing_goods_crate',
            name: 'Abeokuta Indigo Dye Crate',
            icon: '📦',
            description: 'Twine-bound wooden crate containing rare Abeokuta indigo cakes and dye stencils with an authentic artisan wax seal.',
            acquiredAt: new Date().toISOString(),
          });
        }
        this._markAdventureItemCollected(itemId);

        // Hide the world mesh or show collected feedback
        const crateSceneObj = this.world.getSceneObject('missing-goods-crate');
        if (crateSceneObj) {
          crateSceneObj.visible = false;
        }

        this._showToast(
          '📦 Mission Item Collected!',
          'Abeokuta Indigo Dye Crate added to inventory! Take it back to Tobi to plan the delayed installation.',
        );

        this._setStage('STAGE_7_RETURN_DELIVERY');
      } else {
        this._showToast('📦 Storage Crate', 'A heavy wooden crate sealed with an Abeokuta dye emblem.');
      }
    }
  }

  /**
   * Route all characters through the same active shipment adventure.
   */
  public interactWithNPC(characterId: string): void {
    if (characterId === 'npc_tobi') {
      if (this.currentStage === 'STAGE_0_ARRIVE') {
        this.activeDialogueData = {
          characterName: 'Tobi Adeleke',
          characterRole: '27-year-old Junior Architect · Ìsàlẹ̀ Èkó Market Project',
          speech: 'Ẹ káàárọ̀. I’m Tobi, a junior architect coordinating the market-side shade workshop. Our crew is waiting on a consignment of Abeokuta indigo and Adire stencils for the locally made cooling screens. The carrier missed the handoff, and the installation is holding up the build. Iyá Aláso knows the market guild routes—could you ask what she has heard?',
          culturalNote: 'Tobi is sourcing locally made shade screens as part of a passive-cooling design, so the market shipment is tied directly to his construction schedule.',
          choices: [
            { id: 'tobi_help', text: 'I’ll ask Iyá Aláso and trace the guild receipt.', feedback: 'Tobi shares the consignment number: 104. “Thank you. Let’s find where it was left before we decide how to adjust the crew’s schedule.”', isCorrect: true, advanceStage: 'STAGE_1_TALK_TRADER' },
            { id: 'tobi_plan', text: 'Let’s locate the shipment first, then choose a safe schedule.', feedback: 'Tobi nods. “Agreed. I’ll hold the shade-screen installation until we know what arrived.”', isCorrect: true, advanceStage: 'STAGE_1_TALK_TRADER' },
            { id: 'tobi_later', text: 'I’d like to explore the market first; I may come back to this.', feedback: '“Of course. Take your time in the market; I’ll be here if you decide to help.”', isCorrect: true },
          ],
        };
        this._refreshHUD();
      } else if (this.currentStage === 'STAGE_7_RETURN_DELIVERY') {
        this.activeDialogueData = {
          characterName: 'Tobi Adeleke',
          characterRole: 'Junior Architect · Project Materials Lead',
          speech: 'You found the consignment. The crew can finish the cooling screens, but we need to decide how to handle the delay. We can pause the affected work and verify every stencil and indigo batch before installation, or use the verified stock already on site for the first screens while Iyá prepares the recovered shipment for the next section.',
          culturalNote: 'Both plans keep unverified materials out of the structure. The choice changes which part of the project waits and what the crew checks next.',
          choices: [
            { id: 'decision_verify_first', decisionId: 'verify-first', text: 'Pause this section; verify the recovered batch before fitting it.', feedback: 'Tobi records a short hold on this section and checks each piece with Iyá. The installation slips, but the full screen set is traceable before it is fitted.', isCorrect: true, advanceStage: 'STAGE_8_COMPLETED' },
            { id: 'decision_phase_work', decisionId: 'phase-with-verified-stock', text: 'Use only the verified stock already on site; reserve this shipment for the next section.', feedback: 'Tobi keeps the crew on the first section using verified stock, then schedules Iyá’s recovered batch for the next one. The build moves forward while the new materials remain separate until checked.', isCorrect: true, advanceStage: 'STAGE_8_COMPLETED' },
          ],
        };
        this._refreshHUD();
      } else if (this.currentStage === 'STAGE_8_COMPLETED') {
        this.activeDialogueData = {
          characterName: 'Tobi Adeleke', characterRole: 'Junior Architect',
          speech: this.decisionId === 'verify-first'
            ? 'The batch is checked and the crew has a clear revised schedule. Thank you for helping me keep the installation accountable.'
            : 'The first screens are moving ahead with verified stock, and the recovered consignment is booked for the next section. Thank you for helping us keep the work moving safely.',
          choices: [{ id: 'tobi_done', text: 'I’m glad we could make a plan together.', feedback: 'Tobi thanks you and invites you to explore the completed market shade screens as the project progresses.', isCorrect: true }],
        };
        this._refreshHUD();
      } else {
        const clue = this.inventory.some((item) => item.id === 'delivery_manifest')
          ? 'The receipt points to the storage shed. Bring the recovered shipment back here and we can agree on a safe work plan.'
          : this.inventory.some((item) => item.id === 'drum-clue')
            ? 'You noticed the carrier stopped at the drum circle. Check the guild receipt beside it; the drop-off is written there.'
            : 'Iyá can trace the guild route. Once we know where the carrier left the consignment, I can plan the work around verified materials.';
        this.activeDialogueData = {
          characterName: 'Tobi Adeleke', characterRole: 'Junior Architect · Market Construction Project', speech: clue,
          choices: [{ id: 'tobi_continue', text: 'I’ll keep following the shipment trail.', feedback: 'Tobi points you back to the current objective.', isCorrect: true }],
        };
        this._refreshHUD();
      }
    } else if (characterId === 'iya-alaso') {
      if (this.currentStage === 'STAGE_1_TALK_TRADER') {
        this.activeDialogueData = {
          characterName: 'Iyá Aláso',
          characterRole: 'Master Adire Artisan & Market Trader',
          speech:
            'Ẹ káàárọ̀, ọmọ mi. Tobi sent you? I prepared the indigo and stencils for his cooling screens, but the guild carrier never checked in. I remember the courier stopping at the talking-drum table before the receipt was dropped. The receipt should tell us where the crate was left.',
          culturalNote:
            'Iyá Aláso is an experienced Adire artisan. She prepared the locally sourced finishings and recognizes the guild carrier’s route.',
          choices: [
            {
              id: 'iya_trace',
              text: 'I’ll inspect the drum table, then read the guild receipt.',
              feedback:
                'Iyá nods. “That is where the carrier paused. Look for the receipt beside the drum; it records the handoff.”',
              yorubaTerm: 'Ẹ jọ̀wọ́ (Please / Courtesy)',
              isCorrect: true,
              advanceStage: 'STAGE_2_SEEK_ELDER',
            },
            {
              id: 'iya_ask_guild',
              text: 'Could you tell me which guild handled the consignment?',
              feedback:
                '“The carriers’ guild recorded it as consignment 104. The drum table is your best lead; the receipt will show the drop-off.”',
              isCorrect: true,
              advanceStage: 'STAGE_3_DRUM_CIRCLE',
            },
          ],
        };
        this._refreshHUD();
      } else if (this.currentStage === 'STAGE_0_ARRIVE') {
        this.activeDialogueData = {
          characterName: 'Iyá Aláso', characterRole: 'Master Adire Artisan & Market Trader',
          speech: 'Tobi is coordinating the cooling-screen build near the market. He asked me to prepare the locally made finishings. Please meet him first so he can give you the consignment number and the reason the work is waiting.',
          choices: [
            { id: 'iya_meet_tobi', text: 'I’ll meet Tobi and ask for the details.', feedback: 'Iyá points toward the market approach, where Tobi is waiting.', isCorrect: true },
          ],
        };
        this._refreshHUD();
      } else {
        this.activeDialogueData = {
          characterName: 'Iyá Aláso',
          characterRole: 'Master Adire Artisan & Market Trader',
          speech: this.currentStage === 'STAGE_7_RETURN_DELIVERY'
            ? 'The recovered materials are ready for Tobi. He is waiting to decide how to reschedule the cooling-screen work.'
            : this.inventory.some((item) => item.id === 'delivery_manifest')
              ? 'That receipt confirms the crate is at the storage shed behind the district signpost. Please bring it back to Tobi so he can plan the installation.'
              : this.inventory.some((item) => item.id === 'drum-clue')
                ? 'The carrier paused at the drum table. The guild receipt left beside it should name the drop-off point.'
                : 'The drum guild table is the carrier’s last known stop. Check there for the guild receipt.',
          choices: [
            {
              id: 'ok',
              text: 'I’ll follow the lead and return to Tobi.',
              feedback: 'Iyá wishes you well and asks you to bring Tobi the receipt and shipment details.',
              isCorrect: true,
            },
          ],
        };
        this._refreshHUD();
      }
    } else if (characterId === 'baba-adewale') {
      if (this.currentStage === 'STAGE_2_SEEK_ELDER') {
        this.activeDialogueData = {
          characterName: 'Baba Adéwálé',
          characterRole: 'Elder of the Courtyard',
          speech:
            'Baba Adéwálé looks up calmly from his carved wooden stool, awaiting your greeting with attentive eyes.',
          culturalNote:
            'In Yoruba culture, greeting an elder respectfully using the honorific "Ẹ" prefix establishes trust and blessings.',
          choices: [
            {
              id: 'elder_greet',
              text: 'Ẹ káàárọ̀ o, Baba! (Good morning, respected father!)',
              feedback:
                'Baba Adéwálé smiles approvingly: "Àkànbí, ẹ kárọ̀! You speak with true home training. Yes, I saw a young carrier carrying a wicker basket. He was entranced by the master drummer! Check the Talking Drum circle near the display table."',
              yorubaTerm: 'Ẹ káàárọ̀ (Respectful Morning Greeting)',
              isCorrect: true,
              advanceStage: 'STAGE_3_DRUM_CIRCLE',
            },
            {
              id: 'peer_greet',
              text: 'Báwo ni, Baba! Did you see a delivery carrier?',
              feedback:
                'Baba gestures gently: "Báwo ni is for playground friends, my child. Soften your tongue with respect: Ẹ káàárọ̀ is how one greets an elder."',
              yorubaTerm: 'Báwo ni (Casual Greeting)',
              isCorrect: false,
            },
          ],
        };
        this._refreshHUD();
      } else {
        this.activeDialogueData = {
          characterName: 'Baba Adéwálé',
          characterRole: 'Elder of the Courtyard',
          speech:
            'The market whispers its secrets to those who observe with patience and respect.',
          choices: [
            {
              id: 'peace',
              text: 'Ẹ ṣeé o, Baba. (Thank you, elder.)',
              feedback: 'Walk well in the sunlight of Ìsàlẹ̀ Èkó.',
              isCorrect: true,
            },
          ],
        };
        this._refreshHUD();
      }
    }
  }

  /**
   * Handles player selecting a dialogue choice.
   */
  public selectDialogueChoice(choiceId: string): void {
    if (!this.activeDialogueData) return;

    const choice = this.activeDialogueData.choices.find((c) => c.id === choiceId);
    if (!choice) return;

    if (choice.decisionId) {
      this.decisionId = choice.decisionId;
    }
    if (choice.advanceStage) {
      this._setStage(choice.advanceStage);

      if (this.currentStage === 'STAGE_8_COMPLETED') {
        this._completeAdventure(choice.feedback);
      }
    }

    if (choice.isCorrect) {
      this._showToast('🌟 Cultural Discovery!', choice.feedback);
      this.activeDialogueData = null;
    } else {
      this._showToast('💡 Guidance', choice.feedback);
    }

    this._refreshHUD();
  }

  /**
   * Checks for nearby interactive objects and triggers interaction.
   */
  public triggerNearbyInteraction(): void {
    const controller = PlayerControllerSystem.getInstance();
    const target = controller?.getActiveTarget();
    const distance = controller?.getDistanceToTarget() ?? 999;

    if (target && distance < (target.radius || 3.0)) {
      if (target.name.includes('Iyá Aláso')) {
        this.interactWithNPC('iya-alaso');
      } else if (target.name.includes('Tobi')) {
        this.interactWithNPC('npc_tobi');
      } else if (target.name.includes('Baba Adéwálé')) {
        this.interactWithNPC('baba-adewale');
      } else if (target.name.includes('Receipt') || target.name.includes('Manifest')) {
        this.interactWithItem('delivery_manifest');
      } else if (target.name.includes('Crate') || target.name.includes('Dye')) {
        this.interactWithItem('missing_goods_crate');
      } else if (target.name.includes('Talking Drum')) {
        this._discoverDrumClue();
      }
    }
  }

  private _updateNavigationTarget(): void {
    const controller = PlayerControllerSystem.getInstance();
    if (!controller) return;

    const objective = this.getActiveObjective();
    controller.setActiveTarget({
      name: objective.targetName,
      position: objective.targetPosition,
      radius: objective.targetRadius,
    });
  }

  private _setStage(stage: AdventureStage): void {
    this.currentStage = stage;
    this._saveProgress();
    this._updateNavigationTarget();
    this._refreshHUD();
  }

  private _isAdventureStage(stage: string): stage is AdventureStage {
    return [
      'STAGE_0_ARRIVE', 'STAGE_1_TALK_TRADER', 'STAGE_2_SEEK_ELDER',
      'STAGE_3_DRUM_CIRCLE', 'STAGE_4_INSPECT_CLUE', 'STAGE_5_LOCATE_GOODS',
      'STAGE_6_COLLECT_GOODS', 'STAGE_7_RETURN_DELIVERY', 'STAGE_8_COMPLETED',
    ].includes(stage);
  }

  private _markAdventureItemCollected(itemId: string): void {
    for (const entity of this.queries.adventureItems.entities) {
      if (entity.getValue(AdventureItem, 'itemId') === itemId) {
        entity.setValue(AdventureItem, 'collected', true);
      }
    }
  }

  private _discoverDrumClue(): void {
    if (this.currentStage !== 'STAGE_3_DRUM_CIRCLE') return;
    if (!this.inventory.some((item) => item.id === 'drum-clue')) {
      this.inventory.push({
        id: 'drum-clue', name: 'Carrier’s Drum Signal', icon: '🥁',
        description: 'The carrier stopped to hear the drum guild. A guild receipt nearby records where the consignment was left.',
        acquiredAt: new Date().toISOString(),
      });
    }
    this._setStage('STAGE_4_INSPECT_CLUE');
    this._showToast('🥁 Clue noticed', 'The drum circle drew the carrier off route. Inspect the receipt beside the display table.');
  }

  private _saveProgress(): void {
    storage.setAdventureProgress({
      missionId: ADVENTURE_ID,
      stage: this.currentStage,
      decisionId: this.decisionId,
      inventoryItemIds: this.inventory.map((item) => item.id),
    });
  }

  private _completeAdventure(outcomeFeedback: string): void {
    const now = new Date().toISOString();

    // 1. Award Stamp
    const stamp = {
      id: 'stamp_market_discovery',
      name: 'Ọmọlúwàbí: The Market Rescuer',
      category: 'artifact' as const,
      destinationId: 'nigeria',
      districtId: 'isale_eko',
      icon: '🧵',
      unlockedAt: now,
      description: 'Solved the missing Abeokuta dye delivery and mastered Yoruba market etiquette.',
    };

    // 2. Award Vocabulary
    const vocab = [
      {
        term: 'Ẹ káàárọ̀',
        phonetic: 'Eh-kah-ah-raw',
        englishGloss: 'Good morning (respectful elder register)',
        language: 'Yoruba',
        context: 'Used when addressing elders or dignitaries.',
        masteryScore: 100,
        learnedAt: now,
      },
      {
        term: 'Ẹ jọ̀wọ́',
        phonetic: 'Eh-jaw-woh',
        englishGloss: 'Please / Excuse me (courtesy)',
        language: 'Yoruba',
        context: 'Essential polite phrase when asking for assistance.',
        masteryScore: 100,
        learnedAt: now,
      },
      {
        term: 'Oṣé púpọ̀',
        phonetic: 'Oh-sheh poo-paw',
        englishGloss: 'Thank you very much',
        language: 'Yoruba',
        context: 'Expression of gratitude upon completing a helpful deed.',
        masteryScore: 100,
        learnedAt: now,
      },
      {
        term: 'Ọmọlúwàbí',
        phonetic: 'Aw-maw-loo-wah-bee',
        englishGloss: 'Person of noble character and social honor',
        language: 'Yoruba',
        context: 'The foundational philosophy of respect, honesty, and virtue.',
        masteryScore: 100,
        learnedAt: now,
      },
      {
        term: 'Adire',
        phonetic: 'Ah-dee-reh',
        englishGloss: 'Resist-dyed indigo textile craft',
        language: 'Yoruba',
        context: 'Traditional geometric cloth patterning of Abeokuta and Lagos.',
        masteryScore: 100,
        learnedAt: now,
      },
      {
        term: 'Àkẹ̀tẹ̀',
        phonetic: 'Ah-keh-teh',
        englishGloss: 'Woven wicker straw delivery basket',
        language: 'Yoruba',
        context: 'Used by market transport carriers across West Africa.',
        masteryScore: 100,
        learnedAt: now,
      },
    ];

    // 3. Award Journal Entry
    const journal = {
      id: 'journal_market_guilds',
      title: 'Artisan Guilds and Trade Protocols of Ìsàlẹ̀ Èkó',
      category: 'Culture & Commerce',
      summary:
        `You helped Tobi and Iyá Aláso trace the missing cooling-screen shipment. ${outcomeFeedback}`,
      verifiedFact:
        'Abeokuta has been the epicenter of Adire indigo production since the 19th century, utilizing natural cassava starch (ẹ̀kọ) and wild indigo (Indigofera tinctoria).',
      sourceAttribution: 'Lagos State Ministry of Arts & Culture; Nigerian National Museum.',
      discoveredAt: now,
    };

    // Save to storage
    storage.recordMissionCompletion(ADVENTURE_ID, stamp, vocab, journal);
    storage.advanceSkills({
      languageComprehension: 25,
      culturalInterpretation: 30,
      navigationPlanning: 20,
    });
    storage.addXp(250);

    // Show completion Celebration
    const celebratePanel = this.world.getSceneObject('completion-panel');
    if (celebratePanel) {
      celebratePanel.visible = true;
    }

    this._saveProgress();
    this._showToast(
      '🏆 Mission Complete: The Missing Shipment',
      `+250 XP earned. ${this.decisionId === 'verify-first' ? 'The recovered batch will be checked before the delayed section resumes.' : 'The crew can proceed with verified stock while this consignment is reserved for the next section.'} Passport stamp and Yoruba vocabulary unlocked.`,
    );
  }

  private _showToast(title: string, message: string): void {
    this.activeToast = { title, message, timer: 6.0 };
    const toastEl = document.getElementById('adventure-toast');
    if (toastEl) {
      toastEl.innerHTML = `<strong>${title}</strong><br/><span>${message}</span>`;
      toastEl.classList.add('show');
    }
  }

  private _refreshHUD(): void {
    void import('./game/game-shell.js').then(({ gameShell }) => gameShell.render());
  }

  update(delta: number): void {
    if (this.activeToast) {
      this.activeToast.timer -= delta;
      if (this.activeToast.timer <= 0) {
        this.activeToast = null;
        const toastEl = document.getElementById('adventure-toast');
        if (toastEl) toastEl.classList.remove('show');
      }
    }
  }
}
