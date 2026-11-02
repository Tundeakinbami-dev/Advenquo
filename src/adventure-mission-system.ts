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
  AudioUtils,
  createSystem,
  Pressed,
  RayInteractable,
  Vector3,
} from '@iwsdk/core';

import { NPCCharacter } from './npc-component.js';
import { CulturalObject } from './cultural-object-component.js';
import { AdventureItem, AdventureState } from './adventure-mission-component.js';
import { PlayerControllerSystem } from './player-controller-system.js';
import { storage } from './game/storage.js';
import { gameShell } from './game/game-shell.js';

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
}) {
  private static instance: AdventureMissionSystem | null = null;
  public static getInstance(): AdventureMissionSystem | null {
    return AdventureMissionSystem.instance;
  }

  // Active Adventure State
  private currentStage: AdventureStage = 'STAGE_0_ARRIVE';
  private inventory: AdventureInventoryItem[] = [];
  private playerPos = new Vector3();
  private tempVec = new Vector3();

  // Known target positions in Ìsàlẹ̀ Èkó courtyard scene
  private readonly POS_IYA_ALASO = new Vector3(2.65, 0, -1.4);
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
    }>;
  } | null = null;

  // Notification toast
  private activeToast: { title: string; message: string; timer: number } | null = null;

  init(): void {
    AdventureMissionSystem.instance = this;

    // Load any saved inventory
    const savedState = storage.getState();
    if (savedState.activeMission?.completedStepIds.includes('step_collected_crate')) {
      this.inventory.push({
        id: 'missing_goods_crate',
        name: 'Abeokuta Indigo Dye Crate',
        icon: '📦',
        description: 'Rare Abeokuta indigo cakes bound in raffia twine with an artisan wax seal.',
        acquiredAt: new Date().toISOString(),
      });
      this.currentStage = 'STAGE_7_RETURN_DELIVERY';
    } else {
      this.currentStage = 'STAGE_1_TALK_TRADER';
    }

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
      case 'STAGE_1_TALK_TRADER':
        return {
          stage: this.currentStage,
          title: 'The Missing Shipment',
          instruction: 'Speak with trader Iyá Aláso at the Adire textile stall.',
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
          title: 'Restoring the Harvest',
          instruction: 'Return the Abeokuta indigo dye crate to Iyá Aláso at her textile stall.',
          targetName: 'Iyá Aláso (Adire Stall)',
          targetPosition: this.POS_IYA_ALASO,
          targetRadius: 3.2,
          hint: 'Carry the recovered crate back to Iyá Aláso so the morning dye vats can be prepared.',
        };

      case 'STAGE_8_COMPLETED':
      default:
        return {
          stage: 'STAGE_8_COMPLETED',
          title: 'Adventure Completed!',
          instruction: 'You have solved the mystery of the missing delivery and earned trader respect.',
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
      if (this.currentStage === 'STAGE_3_DRUM_CIRCLE' || this.currentStage === 'STAGE_4_INSPECT_CLUE') {
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

        this._showToast(
          '📜 Clue Discovered: Delivery Receipt #104',
          'Note reads: "Dye crate dropped off near the storage shed behind the district signpost."',
        );

        this.currentStage = 'STAGE_5_LOCATE_GOODS';
        this._updateNavigationTarget();
        this._refreshHUD();
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

        // Hide the world mesh or show collected feedback
        const crateSceneObj = this.world.getSceneObject('missing-goods-crate');
        if (crateSceneObj) {
          crateSceneObj.visible = false;
        }

        this._showToast(
          '📦 Mission Item Collected!',
          'Abeokuta Indigo Dye Crate added to inventory! Return it to Iyá Aláso.',
        );

        this.currentStage = 'STAGE_7_RETURN_DELIVERY';
        this._updateNavigationTarget();
        this._refreshHUD();
      } else {
        this._showToast('📦 Storage Crate', 'A heavy wooden crate sealed with an Abeokuta dye emblem.');
      }
    }
  }

  /**
   * Evaluates interactions with NPCs (Iyá Aláso, Baba Adéwálé).
   */
  public interactWithNPC(characterId: string): void {
    if (characterId === 'iya-alaso') {
      if (this.currentStage === 'STAGE_0_ARRIVE' || this.currentStage === 'STAGE_1_TALK_TRADER') {
        this.activeDialogueData = {
          characterName: 'Iyá Aláso',
          characterRole: 'Master Adire Artisan & Market Trader',
          speech:
            'Ẹ kárọ̀ o, ọmọ mi! (Good morning, my child!) Thank goodness you stopped by. My morning indigo dye vats are steaming, but the carrier who was transporting our Abeokuta dye consignment has not arrived. Can you help me find it?',
          culturalNote:
            'Adire fabric requires natural indigo (ẹlú) leaves mixed with fermented ash water. Missing a morning dye cycle ruins the entire batch.',
          choices: [
            {
              id: 'c1',
              text: 'Ẹ jọ̀wọ́, Iyá! Where should I begin searching?',
              feedback:
                'Iyá Aláso nods warmly: "Ẹ jọ̀wọ́ shows noble home training! Ask Baba Adéwálé on the palace veranda. Every carrier passes his stool."',
              yorubaTerm: 'Ẹ jọ̀wọ́ (Please / Courtesy)',
              isCorrect: true,
              advanceStage: 'STAGE_2_SEEK_ELDER',
            },
            {
              id: 'c2',
              text: 'Don’t worry, I’ll search the whole market for you!',
              feedback:
                'She smiles: "Your enthusiasm is wonderful! But an explorer needs direction: speak with Baba Adéwálé on the veranda first."',
              isCorrect: true,
              advanceStage: 'STAGE_2_SEEK_ELDER',
            },
          ],
        };
        this._refreshHUD();
      } else if (this.currentStage === 'STAGE_7_RETURN_DELIVERY') {
        // Player returns with the crate!
        this.activeDialogueData = {
          characterName: 'Iyá Aláso',
          characterRole: 'Master Adire Artisan & Market Trader',
          speech:
            'Oṣé púpọ̀! (Thank you so very much!) You found our Abeokuta indigo crate! The vats will be saved and our apprentice has learned his lesson. You carry the true spirit of Ọmọlúwàbí (noble character)!',
          culturalNote:
            'In Yoruba philosophy, Ọmọlúwàbí signifies courage, humility, respect for community, and integrity.',
          choices: [
            {
              id: 'finish',
              text: 'A dúpẹ́, Iyá Aláso! (We give thanks!) It was an honor to help.',
              feedback:
                'Iyá Aláso hands you an artisan indigo sash and awards your explorer passport with the Ọmọlúwàbí stamp!',
              yorubaTerm: 'A dúpẹ́ (We give thanks)',
              isCorrect: true,
              advanceStage: 'STAGE_8_COMPLETED',
            },
          ],
        };
        this._refreshHUD();
      } else {
        this.activeDialogueData = {
          characterName: 'Iyá Aláso',
          characterRole: 'Master Adire Artisan & Market Trader',
          speech:
            'Have you spoken with Baba Adéwálé yet? He sits by the veranda and watches the carriers arrive.',
          choices: [
            {
              id: 'ok',
              text: 'I am on my way now, Iyá.',
              feedback: 'Go well! May your steps find the path.',
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

    if (choice.advanceStage) {
      this.currentStage = choice.advanceStage;
      this._updateNavigationTarget();

      if (this.currentStage === 'STAGE_8_COMPLETED') {
        this._completeAdventure();
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
      } else if (target.name.includes('Baba Adéwálé')) {
        this.interactWithNPC('baba-adewale');
      } else if (target.name.includes('Receipt') || target.name.includes('Manifest')) {
        this.interactWithItem('delivery_manifest');
      } else if (target.name.includes('Crate') || target.name.includes('Dye')) {
        this.interactWithItem('missing_goods_crate');
      } else if (target.name.includes('Talking Drum')) {
        // Drum inspection clue
        this._showToast(
          '🥁 Talking Drum Cadence',
          'The master drummer points with his curved mallet: "The carrier dropped a receipt right by the calabash bowls!"',
        );
        this.currentStage = 'STAGE_4_INSPECT_CLUE';
        this._updateNavigationTarget();
        this._refreshHUD();
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

  private _completeAdventure(): void {
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
        'Traditional Yoruba markets operate on sophisticated trade guilds, trust networks, and linguistic protocols where respect is the currency of exchange.',
      verifiedFact:
        'Abeokuta has been the epicenter of Adire indigo production since the 19th century, utilizing natural cassava starch (ẹ̀kọ) and wild indigo (Indigofera tinctoria).',
      sourceAttribution: 'Lagos State Ministry of Arts & Culture; Nigerian National Museum.',
      discoveredAt: now,
    };

    // Save to storage
    storage.recordMissionCompletion('mission_nigerian_market_discovery', stamp, vocab, journal);
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

    this._showToast(
      '🏆 Mission Complete: Market Rescuer!',
      '+250 XP earned! Stamp "Ọmọlúwàbí" & 6 Yoruba phrases unlocked in your Passport Journal!',
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
    gameShell.render();
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
