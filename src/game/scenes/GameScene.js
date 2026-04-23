import Phaser from 'phaser';
import { DIALOGUE_KEYS } from '../data/dialogue';
import { getObjectiveText } from '../data/objectives';
import { CHALLENGE_IDS } from '../data/challenges';
import { ENDING_VARIANTS, getEndingCopy } from '../data/endings.js';
import {
  ASSET_KEYS,
  OBJECTIVES,
  TASK_IDS,
  WORLD_FLAGS,
  WORLD_LAYOUT,
} from '../data/layout';
import ChallengeSystem from '../systems/ChallengeSystem.js';
import DialogueSystem from '../systems/DialogueSystem';
import { gameState as sharedGameState } from '../systems/GameState';
import TaskSystem from '../systems/TaskSystem';
import Player from '../prefabs/Player';
import Interactable from '../prefabs/Interactable';
import TriggerZone from '../prefabs/TriggerZone';
import { playOptionalMusic, playOptionalSound } from '../utils/audio';

const DIALOGUE_METHODS = ['startDialogue', 'openDialogue', 'beginDialogue', 'showDialogue', 'queueDialogue'];
const TASK_METHODS = ['startTask', 'beginTask', 'openTask', 'runTask', 'activateTask'];
const TASK_ID_LIST = Object.values(TASK_IDS);
const FAMILY_INTERACTION_IDS = ['mother1', 'child1'];

const once = (callback) => {
  let called = false;
  return (...args) => {
    if (called) {
      return undefined;
    }

    called = true;
    return callback(...args);
  };
};

const callFirst = (target, methodNames, ...args) => {
  for (const name of methodNames) {
    if (typeof target?.[name] === 'function') {
      return {
        called: true,
        value: target[name](...args),
      };
    }
  }

  return {
    called: false,
    value: undefined,
  };
};

const getGlobalSharedRoot = () =>
  globalThis.__WWDC_GAME__
  || globalThis.__WHEN_THE_WATER_DOESNT_COME__
  || globalThis.__WHEN_THE_WATER_DOES_NOT_COME__
  || null;

export class GameScene extends Phaser.Scene {
  constructor() {
    super(WORLD_LAYOUT.sceneKey || 'GameScene');
  }

  init(data = {}) {
    this.initialData = data;
  }

  create() {
    this.runtime = {
      lockDepth: 0,
      lockStartedAt: 0,
      currentPromptSignature: null,
      currentObjectiveKey: null,
      currentObjectiveText: null,
      nearestInteractable: null,
      endingTriggered: false,
      endingUnlockInProgress: false,
      familyWitnessed: new Set(),
      hubMarkers: [],
      endingFieldWaterAnnounced: false,
      progressWarningTimes: new Map(),
      challengeListeners: [],
      fallbackState: {
        flags: new Map(),
        tasks: new Map(TASK_ID_LIST.map((taskId) => [taskId, false])),
        prompt: null,
        objectiveKey: null,
        uiLocked: false,
      },
    };

    this.services = this.resolveServices(this.initialData);
    this.prepareServices();
    this.staticBodies = [];
    this.progressBarriers = [];
    this.progressBarrierById = new Map();
    this.progressBarrierBodies = [];
    this.progressBarrierTriggers = [];
    this.interactables = [];
    this.interactablesById = new Map();
    this.objectiveMarkers = [];
    this.triggers = [];
    this.triggerById = new Map();
    this.decorationsById = new Map();
    this.externalListeners = [];

    this.physics.world.setBounds(0, 0, WORLD_LAYOUT.world.width, WORLD_LAYOUT.world.height);
    this.physics.world.gravity.y = WORLD_LAYOUT.world.gravityY;

    this.createBackground();
    this.createTerrain();
    this.createDecorations();
    this.createAmbientEffects();
    this.createProgressBarriers();
    this.createGate();
    this.createPlayer();
    this.createInteractables();
    this.configureHubMarkers();
    this.configureObjectiveMarkers();
    this.createTriggers();
    this.createColliders();
    this.refreshProgressBarrierState();
    this.createFallbackUi();
    this.setupCamera();
    this.bindExternalEvents();
    this.syncWorldState();
    this.startFieldMusic();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.handleShutdown, this);
  }

  startFieldMusic() {
    playOptionalMusic(this, 'bgm-field', { volume: 0.28 });
  }

  update(time) {
    if (!this.player) {
      return;
    }

    this.services.challengeSystem?.update?.(Date.now());
    this.player.update(time);
    if (this.player.consumeJumpCue?.()) {
      playOptionalSound(this, 'sfx-jump', { volume: 0.22 });
    }
    this.recoverFromStaleLocks(time);
    this.syncObjectiveMarkers(time);
    this.updateInteractionState();
    this.syncFallbackUi();

    if (!this.isInputLocked() && this.player.wantsToInteract() && this.runtime.nearestInteractable) {
      this.runtime.nearestInteractable.interact(this.createSceneContext(this.runtime.nearestInteractable));
    }
  }

  resolveServices(data = {}) {
    const sharedRoot = getGlobalSharedRoot();
    const globalServices = globalThis.__WWDC_SERVICES__ || {};
    const gameServices = this.game?.services || {};

    const pick = (values) => values.find(Boolean) || null;

    return {
      gameState: pick([
        data.gameState,
        data.state,
        data.services?.gameState,
        this.registry.get('gameState'),
        this.registry.get('GameState'),
        this.game?.gameState,
        this.game?.sharedState,
        this.game?.state,
        gameServices.gameState,
        globalServices.gameState,
        sharedRoot?.gameState,
        sharedRoot?.GameState,
      ]),
      dialogueSystem: pick([
        data.dialogueSystem,
        data.services?.dialogueSystem,
        this.registry.get('dialogueSystem'),
        this.registry.get('DialogueSystem'),
        this.game?.dialogueSystem,
        gameServices.dialogueSystem,
        globalServices.dialogueSystem,
        sharedRoot?.dialogueSystem,
        sharedRoot?.DialogueSystem,
      ]),
      taskSystem: pick([
        data.taskSystem,
        data.services?.taskSystem,
        this.registry.get('taskSystem'),
        this.registry.get('TaskSystem'),
        this.game?.taskSystem,
        gameServices.taskSystem,
        globalServices.taskSystem,
        sharedRoot?.taskSystem,
        sharedRoot?.TaskSystem,
      ]),
      challengeSystem: pick([
        data.challengeSystem,
        data.services?.challengeSystem,
        this.registry.get('challengeSystem'),
        this.registry.get('ChallengeSystem'),
        this.game?.challengeSystem,
        gameServices.challengeSystem,
        globalServices.challengeSystem,
        sharedRoot?.challengeSystem,
        sharedRoot?.ChallengeSystem,
      ]),
    };
  }

  prepareServices() {
    const sharedRoot = getGlobalSharedRoot();

    this.services.gameState = this.services.gameState || sharedGameState || null;
    this.installGameStateAdapters(this.services.gameState);

    if (!this.services.dialogueSystem && this.services.gameState) {
      this.services.dialogueSystem = new DialogueSystem({
        gameState: this.services.gameState,
      });
    } else if (typeof this.services.dialogueSystem?.setGameState === 'function') {
      this.services.dialogueSystem.setGameState(this.services.gameState);
    }

    if (!this.services.taskSystem && this.services.gameState) {
      this.services.taskSystem = new TaskSystem({
        gameState: this.services.gameState,
      });
    } else if (typeof this.services.taskSystem?.setGameState === 'function') {
      this.services.taskSystem.setGameState(this.services.gameState);
    }

    if (!this.services.challengeSystem && this.services.gameState) {
      this.services.challengeSystem = new ChallengeSystem({
        gameState: this.services.gameState,
      });
    } else if (typeof this.services.challengeSystem?.setGameState === 'function') {
      this.services.challengeSystem.setGameState(this.services.gameState);
    }

    if (typeof this.services.dialogueSystem?.setHooks === 'function') {
      this.services.dialogueSystem.setHooks({
        onUnlockTasks: ({ taskIds }) => {
          this.services.taskSystem?.activateTasks?.(taskIds);
        },
        onCompleteTask: ({ taskId, context }) => {
          this.completeTask(taskId, {
            sourceId: context?.sourceId || 'dialogue-system',
          });
        },
      });
    }

    if (typeof this.services.challengeSystem?.setHooks === 'function') {
      this.services.challengeSystem.setHooks({
        onChallengeComplete: (payload) => {
          this.handleChallengeComplete(payload);
        },
      });
    }

    if (this.services.gameState) {
      this.registry.set('gameState', this.services.gameState);
      this.game.gameState = this.services.gameState;
      this.game.sharedState = this.services.gameState;
    }
    if (this.services.dialogueSystem) {
      this.registry.set('dialogueSystem', this.services.dialogueSystem);
      this.game.dialogueSystem = this.services.dialogueSystem;
    }
    if (this.services.taskSystem) {
      this.registry.set('taskSystem', this.services.taskSystem);
      this.game.taskSystem = this.services.taskSystem;
    }
    if (this.services.challengeSystem) {
      this.registry.set('challengeSystem', this.services.challengeSystem);
      this.game.challengeSystem = this.services.challengeSystem;
    }

    if (sharedRoot && typeof sharedRoot === 'object') {
      if (this.services.gameState) {
        sharedRoot.gameState = this.services.gameState;
      }
      if (this.services.dialogueSystem) {
        sharedRoot.dialogueSystem = this.services.dialogueSystem;
      }
      if (this.services.taskSystem) {
        sharedRoot.taskSystem = this.services.taskSystem;
      }
      if (this.services.challengeSystem) {
        sharedRoot.challengeSystem = this.services.challengeSystem;
      }
    }
  }

  installGameStateAdapters(gameState) {
    if (!gameState) {
      return;
    }

    if (!gameState.state && typeof gameState.getState === 'function') {
      gameState.state = gameState.getState();
    }

    if (!gameState.state) {
      gameState.state = {};
    }
    if (!gameState.state.flags) {
      gameState.state.flags = {};
    }
    if (!gameState.state.tasks) {
      gameState.state.tasks = {};
    }
    if (!gameState.state.ui) {
      gameState.state.ui = {};
    }
    if (!gameState.state.progress) {
      gameState.state.progress = {
        currentBeat: 'intro',
      };
    }
    if (!gameState.state.progress.learning) {
      gameState.state.progress.learning = {
        results: {},
        endingVariant: null,
      };
    }
    if (!('challengeOpen' in gameState.state.ui)) {
      gameState.state.ui.challengeOpen = false;
    }
    if (!('challenge' in gameState.state.ui)) {
      gameState.state.ui.challenge = null;
    }

    if (typeof gameState.getCurrentBeat !== 'function') {
      gameState.getCurrentBeat = function getCurrentBeat() {
        return this.state?.progress?.currentBeat || null;
      };
    }

    if (typeof gameState.setCurrentBeat !== 'function') {
      gameState.setCurrentBeat = function setCurrentBeat(beat) {
        if (!beat) {
          return;
        }

        this.state.progress = {
          ...(this.state.progress || {}),
          currentBeat: beat,
        };

        this.emit?.('beat-change', {
          beat,
          state: typeof this.getSnapshot === 'function' ? this.getSnapshot() : this.state,
        });
        this.emit?.('change');
      };
    }

    if (typeof gameState.getCanMove !== 'function') {
      gameState.getCanMove = function getCanMove() {
        return this.state?.ui?.canMove ?? true;
      };
    }

    if (typeof gameState.updateUIState !== 'function') {
      gameState.updateUIState = function updateUIState(patch = {}) {
        this.state.ui = {
          ...(this.state.ui || {}),
          ...patch,
        };
        this.emit?.('change');
      };
    }

    if (typeof gameState.setUIState !== 'function') {
      gameState.setUIState = function setUIState(nextUi = {}) {
        this.state.ui = { ...nextUi };
        this.emit?.('change');
      };
    }

    if (typeof gameState.setCurrentObjective !== 'function') {
      gameState.setCurrentObjective = function setCurrentObjective(text, objectiveId = null) {
        this.state.ui = {
          ...(this.state.ui || {}),
          currentObjective: text || objectiveId || this.state.ui?.currentObjective || '',
          currentObjectiveId: objectiveId || null,
        };

        this.emit?.('objective-change', {
          objectiveId,
          text,
          state: typeof this.getSnapshot === 'function' ? this.getSnapshot() : this.state,
        });
        this.emit?.('change');
      };
    }

    if (typeof gameState.getTaskState !== 'function') {
      gameState.getTaskState = function getTaskState(taskId) {
        const raw = this.state?.tasks?.[taskId];

        if (raw && typeof raw === 'object') {
          return raw;
        }
        if (raw === true) {
          return { status: 'completed' };
        }
        if (raw === false) {
          return { status: 'locked' };
        }

        return {};
      };
    }

    if (typeof gameState.setTaskState !== 'function') {
      gameState.setTaskState = function setTaskState(taskId, patch = {}) {
        const current = typeof this.getTaskState === 'function' ? this.getTaskState(taskId) : {};
        this.state.tasks[taskId] = {
          ...current,
          ...patch,
        };

        this.emit?.('task-change', {
          taskId,
          state: typeof this.getSnapshot === 'function' ? this.getSnapshot() : this.state,
        });
        this.emit?.('change');

        return this.state.tasks[taskId];
      };
    }

    if (typeof gameState.unlockTasks !== 'function') {
      gameState.unlockTasks = function unlockTasks(taskIds = []) {
        taskIds.forEach((taskId) => {
          const current = typeof this.getTaskState === 'function' ? this.getTaskState(taskId) : {};
          if (current.status !== 'completed') {
            this.setTaskState(taskId, { status: 'available' });
          }
        });
      };
    }

    if (typeof gameState.getChallengeResult !== 'function') {
      gameState.getChallengeResult = function getChallengeResult(challengeId) {
        return this.state?.progress?.learning?.results?.[challengeId] || {
          status: 'unseen',
          score: 0,
          maxScore: 0,
          attempts: 0,
        };
      };
    }

    if (typeof gameState.setChallengeResult !== 'function') {
      gameState.setChallengeResult = function setChallengeResult(challengeId, patch = {}) {
        this.state.progress.learning.results[challengeId] = {
          ...(this.state.progress.learning.results[challengeId] || {}),
          ...patch,
        };
        this.emit?.('change');
        return this.state.progress.learning.results[challengeId];
      };
    }

    if (typeof gameState.setEndingVariant !== 'function') {
      gameState.setEndingVariant = function setEndingVariant(endingVariant = null) {
        this.state.progress.learning.endingVariant = endingVariant;
        this.emit?.('change');
      };
    }
  }

  getGameStateRoot() {
    return this.services.gameState?.state || this.services.gameState || null;
  }

  createBackground() {
    const { width, height } = WORLD_LAYOUT.world;
    const canalCenter = WORLD_LAYOUT.beats.canal + 320;
    const endingCenter = WORLD_LAYOUT.beats.ending + 140;

    this.atmosphere = {};

    this.atmosphere.sky = this.add.rectangle(width * 0.5, height * 0.5, width, height, 0xb3bbb4).setDepth(-20);
    this.atmosphere.horizonBack = this.add.rectangle(width * 0.5, height - 260, width, 260, 0x98ad84).setDepth(-18);
    this.atmosphere.horizonFront = this.add.rectangle(width * 0.5, height - 156, width, 212, 0x738a57).setDepth(-16);
    this.atmosphere.hopeWash = this.add.ellipse(endingCenter + 50, height - 220, 1380, 360, 0xd7e5b2, 0.04).setDepth(-19);
    this.atmosphere.endingMist = this.add.ellipse(endingCenter, height - 170, 1180, 280, 0xc9dc95, 0.1).setDepth(-15);
    this.atmosphere.endingFieldTone = this.add.rectangle(endingCenter, height - 144, 1220, 188, 0x6f9460, 0.04).setDepth(-17);
    this.atmosphere.dryWash = this.add.rectangle(width * 0.5, height * 0.5, width, height, 0x8f7148, 0.22).setDepth(-14);
    this.atmosphere.canalTension = this.add.ellipse(canalCenter, height - 270, 980, 300, 0x4a2418, 0).setDepth(-13);
    this.atmosphere.canalEdge = this.add.ellipse(canalCenter - 20, height - 198, 640, 136, 0xc49362, 0).setDepth(-12);
    this.atmosphere.canalRevealGlow = this.add.ellipse(canalCenter + 40, height - 214, 780, 200, 0x805241, 0).setDepth(-11);
    this.atmosphere.shadowHalo = this.add.ellipse(canalCenter + 120, height - 308, 540, 280, 0x1c1018, 0).setDepth(-10);
    this.atmosphere.endingLight = this.add.ellipse(endingCenter + 70, 150, 620, 210, 0xecf1cd, 0.06).setDepth(-21);

    this.createSkyAtmosphereLayer();
    this.createFarBackgroundLayer();
    this.createMidBackgroundLayer();
    this.createNearBackgroundLayer();

    this.tweens.add({
      targets: [this.atmosphere.hopeWash, this.atmosphere.endingLight],
      scaleX: 1.03,
      scaleY: 1.05,
      duration: 3800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.tweens.add({
      targets: this.atmosphere.canalRevealGlow,
      scaleX: 1.03,
      scaleY: 1.05,
      duration: 2800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  createSkyAtmosphereLayer() {
    const { width, height } = WORLD_LAYOUT.world;
    const layer = this.add.graphics().setDepth(-19).setScrollFactor(0.86);

    [
      [0, 92, 0xc9d0c1, 0.32],
      [92, 90, 0xbec8b7, 0.26],
      [182, 86, 0xb4c0a8, 0.2],
      [268, 54, 0xa7b58f, 0.16],
    ].forEach(([y, bandHeight, color, alpha]) => {
      layer.fillStyle(color, alpha);
      layer.fillRect(0, y, width, bandHeight);
    });

    const drawBlockCloud = (x, y, blocks, alpha = 0.14) => {
      layer.fillStyle(0xe4dfc6, alpha);
      blocks.forEach(([offsetX, offsetY, blockWidth, blockHeight]) => {
        layer.fillRect(x + offsetX, y + offsetY, blockWidth, blockHeight);
      });
    };

    drawBlockCloud(360, 110, [[0, 12, 120, 16], [48, 0, 160, 18], [170, 14, 90, 14]], 0.12);
    drawBlockCloud(2260, 132, [[0, 8, 150, 14], [70, 0, 190, 16], [230, 10, 120, 14]], 0.1);
    drawBlockCloud(4680, 104, [[0, 12, 110, 14], [54, 0, 170, 16], [190, 12, 100, 12]], 0.1);
    drawBlockCloud(6060, 128, [[0, 10, 140, 14], [64, 0, 190, 18], [240, 12, 96, 12]], 0.12);
    drawBlockCloud(3360, 152, [[0, 8, 94, 12], [46, 0, 144, 14], [178, 10, 70, 10]], 0.07);

    layer.fillStyle(0xd9c68a, 0.08);
    layer.fillRect(240, 118, 420, 20);
    layer.fillRect(320, 145, 620, 14);
    layer.fillStyle(0xd6bd78, 0.055);
    layer.fillRect(4080, 158, 760, 16);
    layer.fillRect(4920, 190, 980, 12);
    layer.fillStyle(0x7d936d, 0.1);
    layer.fillRect(0, height - 316, width, 34);
  }

  createFarBackgroundLayer() {
    const { width, height } = WORLD_LAYOUT.world;
    const layer = this.add.graphics().setDepth(-17).setScrollFactor(0.9);

    const drawTerraceStack = (x, y, widths, alpha = 0.2) => {
      widths.forEach((rowWidth, index) => {
        const rowY = y + index * 18;
        layer.fillStyle(index % 2 === 0 ? 0x8aa174 : 0x7f9669, alpha - index * 0.012);
        layer.fillRect(x + index * 36, rowY, rowWidth, 8);
        layer.fillStyle(0xc3b47d, 0.08);
        layer.fillRect(x + index * 36, rowY + 8, rowWidth * 0.82, 3);
      });
    };

    const drawPixelTreeMass = (x, y, pattern, alpha = 0.13) => {
      pattern.forEach(([offsetX, offsetY, blockWidth, blockHeight]) => {
        layer.fillStyle(0x526b48, alpha);
        layer.fillRect(x + offsetX, y + offsetY, blockWidth, blockHeight);
        layer.fillStyle(0x6d8056, alpha * 0.55);
        layer.fillRect(x + offsetX + 8, y + offsetY + 4, blockWidth * 0.42, Math.max(4, blockHeight * 0.18));
      });
    };

    const drawFarFieldBands = (x, y, bandWidth, bands = 4, alpha = 0.15, greener = false) => {
      for (let index = 0; index < bands; index += 1) {
        const rowY = y + index * 16;
        const offset = index * 34;
        const rowWidth = bandWidth - index * 76;
        layer.fillStyle(greener ? 0x8aa76d : 0x8b935f, alpha - index * 0.016);
        layer.fillRect(x + offset, rowY, rowWidth, 8);
        layer.fillStyle(greener ? 0xb8cfa0 : 0xc0b37a, alpha * 0.32);
        layer.fillRect(x + offset + 12, rowY + 8, rowWidth * 0.72, 2);
      }
    };

    const drawDistantHut = (x, y, hutWidth = 62, alpha = 0.12) => {
      layer.fillStyle(0x5b4d36, alpha);
      layer.fillRect(x + hutWidth * 0.2, y, hutWidth * 0.6, hutWidth * 0.22);
      layer.fillStyle(0x6a412a, alpha * 1.2);
      layer.fillTriangle(x, y, x + hutWidth * 0.5, y - hutWidth * 0.24, x + hutWidth, y);
      layer.fillStyle(0x938262, alpha * 0.5);
      layer.fillRect(x + hutWidth * 0.32, y + hutWidth * 0.08, hutWidth * 0.16, hutWidth * 0.14);
    };

    [
      [-160, 410, 620, 272, 0xd3d6c8, 0.14],
      [420, 390, 1160, 270, 0xc8cfbd, 0.16],
      [1340, 420, 2140, 274, 0xd3d5c4, 0.13],
      [3320, 398, 4460, 274, 0xcbd2bf, 0.14],
      [5200, 406, width + 220, 274, 0xd0d2c2, 0.14],
    ].forEach(([leftX, peakX, rightX, baseY, color, alpha]) => {
      layer.fillStyle(color, alpha);
      layer.fillTriangle(leftX, height - 346, peakX, baseY, rightX, height - 346);
    });

    layer.fillStyle(0x71895f, 0.18);
    layer.fillRect(0, height - 334, width, 18);
    layer.fillStyle(0x657b53, 0.14);
    layer.fillRect(0, height - 310, width, 18);

    drawPixelTreeMass(260, height - 324, [[0, 10, 78, 30], [52, 0, 108, 42], [140, 16, 92, 28], [220, 6, 114, 36]], 0.12);
    drawPixelTreeMass(1450, height - 332, [[0, 18, 94, 28], [84, 0, 118, 42], [184, 12, 126, 34], [292, 22, 84, 24]], 0.11);
    drawPixelTreeMass(3860, height - 326, [[0, 12, 86, 30], [76, 0, 126, 38], [190, 16, 96, 26], [276, 8, 116, 34]], 0.1);
    drawPixelTreeMass(6400, height - 330, [[0, 14, 96, 30], [88, 0, 130, 42], [204, 12, 130, 34], [320, 20, 104, 26]], 0.14);

    drawTerraceStack(160, height - 292, [640, 560, 468, 360], 0.2);
    drawTerraceStack(960, height - 302, [760, 636, 500, 386], 0.18);
    drawTerraceStack(3960, height - 298, [720, 590, 460, 350], 0.17);
    drawTerraceStack(5480, height - 304, [840, 690, 520, 380], 0.22);
    drawFarFieldBands(40, height - 258, 1040, 4, 0.13);
    drawFarFieldBands(1240, height - 266, 1140, 4, 0.12);
    drawFarFieldBands(2920, height - 260, 1180, 4, 0.1);
    drawFarFieldBands(4560, height - 264, 1240, 4, 0.12);
    drawFarFieldBands(5940, height - 266, 1120, 4, 0.16, true);
    drawDistantHut(820, height - 296, 70, 0.1);
    drawDistantHut(3100, height - 288, 62, 0.09);
    drawDistantHut(6110, height - 302, 78, 0.12);

    layer.lineStyle(7, 0x7e8580, 0.14);
    layer.lineBetween(2440, height - 350, 3440, height - 340);
    layer.fillStyle(0x747b76, 0.12);
    [2560, 2860, 3160].forEach((x) => {
      layer.fillRect(x, height - 342, 14, 78);
    });
  }

  createMidBackgroundLayer() {
    const { height } = WORLD_LAYOUT.world;
    const layer = this.add.graphics().setDepth(-7).setScrollFactor(0.97);

    const drawFieldBorders = (startX, y, width, rows = 3, alpha = 0.2) => {
      for (let index = 0; index < rows; index += 1) {
        const rowY = y + index * 22;
        layer.fillStyle(0x586644, alpha);
        layer.fillRect(startX + index * 28, rowY, width - index * 64, 5);
        layer.fillStyle(0xc1aa68, alpha * 0.4);
        layer.fillRect(startX + index * 28, rowY + 5, (width - index * 64) * 0.72, 2);
      }
    };

    const drawRiceGrid = (startX, y, width, columns = 5, alpha = 0.12) => {
      layer.lineStyle(2, 0x62714c, alpha);
      for (let index = 0; index < columns; index += 1) {
        const x = startX + index * (width / columns);
        layer.lineBetween(x, y + 2, x + 58, y + 74);
      }
      layer.lineStyle(1, 0xc8b56e, alpha * 0.64);
      layer.lineBetween(startX, y + 24, startX + width, y + 18);
      layer.lineBetween(startX + 20, y + 52, startX + width - 30, y + 46);
    };

    const drawTree = (x, y, scale = 1, alpha = 0.22) => {
      layer.fillStyle(0x4f4a32, alpha);
      layer.fillRect(x - 4 * scale, y - 52 * scale, 8 * scale, 52 * scale);
      layer.fillStyle(0x5d734a, alpha);
      layer.fillRect(x - 28 * scale, y - 80 * scale, 56 * scale, 20 * scale);
      layer.fillRect(x - 40 * scale, y - 64 * scale, 80 * scale, 24 * scale);
      layer.fillRect(x - 24 * scale, y - 42 * scale, 48 * scale, 16 * scale);
      layer.fillStyle(0x75885b, alpha * 0.62);
      layer.fillRect(x - 20 * scale, y - 74 * scale, 28 * scale, 6 * scale);
      layer.fillRect(x + 8 * scale, y - 58 * scale, 20 * scale, 6 * scale);
    };

    const drawPole = (x, groundY, poleHeight = 112, alpha = 0.3) => {
      layer.fillStyle(0x4f4230, alpha);
      layer.fillRect(x - 3, groundY - poleHeight, 6, poleHeight);
      layer.fillRect(x - 20, groundY - poleHeight + 22, 40, 5);
      layer.lineStyle(1, 0x4c4639, alpha * 0.85);
      layer.lineBetween(x - 140, groundY - poleHeight + 30, x + 150, groundY - poleHeight + 22);
    };

    const drawRoof = (x, y, width, color = 0x6a3a25, alpha = 0.2) => {
      layer.fillStyle(color, alpha);
      layer.fillTriangle(x, y, x + width * 0.5, y - width * 0.22, x + width, y);
      layer.fillRect(x + width * 0.18, y, width * 0.64, width * 0.18);
      layer.fillStyle(0x9b7045, alpha * 0.42);
      layer.fillRect(x + width * 0.28, y - width * 0.09, width * 0.35, 4);
    };

    const drawNipaHut = (x, groundY, width = 120, alpha = 0.18) => {
      const wallY = groundY - width * 0.34;
      layer.fillStyle(0x665640, alpha);
      layer.fillRect(x + width * 0.2, wallY, width * 0.6, width * 0.26);
      layer.fillStyle(0x7d6c48, alpha * 0.78);
      layer.fillRect(x + width * 0.32, wallY + 8, width * 0.12, width * 0.16);
      layer.fillRect(x + width * 0.58, wallY + 8, width * 0.1, width * 0.12);
      layer.fillStyle(0x614326, alpha);
      layer.fillTriangle(x, wallY + 4, x + width * 0.5, wallY - width * 0.22, x + width, wallY + 4);
      layer.fillRect(x + width * 0.12, wallY, width * 0.76, 6);
      layer.fillStyle(0x4b3f2d, alpha * 0.74);
      layer.fillRect(x + width * 0.28, groundY - 18, 5, 18);
      layer.fillRect(x + width * 0.68, groundY - 18, 5, 18);
    };

    const drawScarecrow = (x, groundY, alpha = 0.24) => {
      layer.fillStyle(0x5f4d34, alpha);
      layer.fillRect(x - 2, groundY - 64, 4, 56);
      layer.fillRect(x - 30, groundY - 49, 60, 4);
      layer.fillStyle(0xc2a05a, alpha);
      layer.fillTriangle(x - 16, groundY - 67, x, groundY - 84, x + 16, groundY - 67);
      layer.fillStyle(0x6f5b3f, alpha * 0.86);
      layer.fillRect(x - 14, groundY - 47, 28, 28);
    };

    const drawBambooClump = (x, groundY, alpha = 0.18) => {
      layer.fillStyle(0x4d6541, alpha);
      for (let index = 0; index < 7; index += 1) {
        const stemX = x + index * 8;
        const stemHeight = 74 + (index % 3) * 12;
        layer.fillRect(stemX, groundY - stemHeight, 3, stemHeight);
        layer.fillRect(stemX - 10, groundY - stemHeight + 20, 18, 4);
        layer.fillRect(stemX + 2, groundY - stemHeight + 38, 18, 4);
      }
    };

    const drawFieldMarkers = (startX, groundY, count, gap, alpha = 0.18) => {
      layer.fillStyle(0x5c4a31, alpha);
      for (let index = 0; index < count; index += 1) {
        const x = startX + index * gap;
        layer.fillRect(x, groundY - 30 - (index % 2) * 5, 4, 34);
        layer.fillStyle(index % 3 === 0 ? 0xd6c390 : 0x9e8a62, alpha * 0.7);
        layer.fillRect(x + 5, groundY - 31 - (index % 2) * 5, 16, 8);
        layer.fillStyle(0x5c4a31, alpha);
      }
    };

    drawFieldBorders(160, height - 250, 900, 4, 0.18);
    drawRiceGrid(190, height - 236, 760, 6, 0.1);
    drawTree(560, height - 214, 0.76);
    drawBambooClump(690, height - 212, 0.14);
    drawPole(800, height - 212, 120, 0.28);
    drawFieldMarkers(330, height - 214, 5, 122, 0.14);
    drawRoof(1110, height - 226, 118, 0x6b3f28, 0.18);
    drawScarecrow(940, height - 212, 0.18);
    this.createBackgroundSign({
      x: 430,
      y: height - 262,
      width: 96,
      height: 38,
      label: 'SERBISYO',
      depth: -6,
      alpha: 0.24,
      includePortrait: true,
    });

    drawFieldBorders(1540, height - 244, 820, 3, 0.16);
    drawRiceGrid(1510, height - 230, 720, 5, 0.09);
    drawPole(1780, height - 206, 138, 0.28);
    layer.fillStyle(0x4e5548, 0.22);
    layer.fillRect(2148, height - 262, 70, 54);
    layer.fillStyle(0x3d3f37, 0.2);
    layer.fillRect(2136, height - 274, 94, 14);
    layer.fillStyle(0x6d604d, 0.26);
    [1888, 1992, 2260].forEach((x) => {
      layer.fillRect(x, height - 236, 14, 42);
      layer.fillRect(x - 8, height - 244, 30, 8);
    });
    this.createBackgroundSign({
      x: 2295,
      y: height - 290,
      width: 142,
      height: 48,
      label: 'AYOS NA ANG',
      sublabel: 'IRIGASYON',
      depth: -6,
      alpha: 0.3,
    });

    drawFieldBorders(2880, height - 246, 840, 3, 0.14);
    drawRiceGrid(2860, height - 232, 820, 6, 0.08);
    drawTree(3740, height - 220, 0.82, 0.18);
    drawBambooClump(3390, height - 216, 0.12);
    drawNipaHut(3420, height - 214, 120, 0.14);
    drawRoof(3560, height - 230, 126, 0x68422e, 0.17);
    drawRoof(3186, height - 222, 96, 0x5f432d, 0.14);
    this.createBackgroundSign({
      x: 3016,
      y: height - 282,
      width: 104,
      height: 40,
      label: 'PARA SA',
      sublabel: 'BAYAN',
      depth: -6,
      alpha: 0.22,
    });

    drawFieldBorders(4300, height - 244, 950, 4, 0.16);
    drawRiceGrid(4260, height - 230, 980, 7, 0.08);
    drawPole(4720, height - 210, 118, 0.26);
    drawTree(4960, height - 214, 0.72, 0.18);
    drawBambooClump(4580, height - 214, 0.12);
    drawScarecrow(5360, height - 214, 0.16);
    drawFieldMarkers(4380, height - 212, 6, 136, 0.12);
    this.createBackgroundSign({
      x: 5120,
      y: height - 286,
      width: 136,
      height: 46,
      label: 'PROYEKTO PARA',
      sublabel: 'SA MAGSASAKA',
      depth: -6,
      alpha: 0.28,
    });

    drawFieldBorders(5940, height - 246, 900, 4, 0.18);
    drawRiceGrid(5920, height - 232, 980, 7, 0.1);
    drawRoof(6280, height - 236, 150, 0x5f432c, 0.17);
    drawNipaHut(6355, height - 216, 112, 0.13);
    drawTree(6550, height - 222, 0.86, 0.24);
    this.createBackgroundSign({
      x: 5960,
      y: height - 286,
      width: 96,
      height: 38,
      label: 'UNLAD',
      depth: -6,
      alpha: 0.2,
    });
  }

  createNearBackgroundLayer() {
    const { height } = WORLD_LAYOUT.world;
    const layer = this.add.graphics().setDepth(7).setScrollFactor(0.995);

    const drawFence = (startX, y, postCount, gap, alpha = 0.32) => {
      layer.fillStyle(0x513d27, alpha);
      for (let index = 0; index < postCount; index += 1) {
        const x = startX + gap * index;
        layer.fillRect(x - 3, y - 34 - (index % 2) * 4, 6, 40);
      }
      layer.fillRect(startX, y - 24, gap * (postCount - 1), 5);
      layer.fillRect(startX, y - 9, gap * (postCount - 1), 4);
    };

    const drawLowDressing = (startX, endX, y, tint = 0x5f7b41, alpha = 0.26) => {
      layer.fillStyle(tint, alpha);
      for (let x = startX; x < endX; x += 38) {
        layer.fillRect(x, y - 8, 5, 8);
        layer.fillRect(x + 7, y - 12, 5, 12);
        layer.fillRect(x + 15, y - 7, 5, 7);
        layer.fillRect(x + 23, y - 10, 5, 10);
      }
    };

    const drawBunds = (startX, endX, y, alpha = 0.22) => {
      layer.fillStyle(0x3f321f, alpha);
      for (let x = startX; x < endX; x += 160) {
        layer.fillRect(x, y + ((x / 160) % 2) * 4, 108, 7);
      }
      layer.fillStyle(0x6f7d45, alpha * 0.82);
      for (let x = startX + 38; x < endX; x += 146) {
        layer.fillRect(x, y - 12, 64, 12);
      }
    };

    const drawBackgroundSack = (x, y, alpha = 0.22) => {
      layer.fillStyle(0xb49b69, alpha);
      layer.fillRoundedRect(x, y, 34, 30, 8);
      layer.fillStyle(0x776140, alpha * 0.72);
      layer.fillRect(x + 8, y + 9, 18, 3);
    };

    const drawBackgroundPail = (x, y, alpha = 0.2) => {
      layer.fillStyle(0x6d7f84, alpha);
      layer.fillRect(x, y + 8, 24, 20);
      layer.fillStyle(0x8fa1a0, alpha * 0.78);
      layer.fillRect(x + 3, y + 4, 18, 6);
      layer.lineStyle(1, 0x596568, alpha);
      layer.lineBetween(x + 5, y + 6, x + 12, y);
      layer.lineBetween(x + 12, y, x + 20, y + 6);
    };

    const drawBackgroundCrate = (x, y, alpha = 0.2) => {
      layer.fillStyle(0x80633f, alpha);
      layer.fillRect(x, y, 48, 30);
      layer.fillStyle(0x4f3b26, alpha * 0.64);
      layer.fillRect(x + 5, y + 6, 38, 3);
      layer.fillRect(x + 5, y + 19, 38, 3);
      layer.fillRect(x + 22, y + 3, 4, 24);
    };

    const drawConcreteMarkers = (startX, y, count, gap, alpha = 0.22) => {
      layer.fillStyle(0x9b9a8b, alpha);
      for (let index = 0; index < count; index += 1) {
        const x = startX + index * gap;
        layer.fillRect(x, y - 32, 16, 34);
        layer.fillStyle(0x6f725f, alpha * 0.56);
        layer.fillRect(x + 2, y - 24, 12, 3);
        layer.fillStyle(0x9b9a8b, alpha);
      }
    };

    drawBunds(40, 1120, height - 190, 0.16);
    drawFence(250, height - 214, 6, 72, 0.22);
    drawLowDressing(70, 1080, height - 206, 0x5b7341, 0.22);
    drawBackgroundCrate(610, height - 164, 0.14);

    layer.fillStyle(0x6d604a, 0.36);
    [1780, 1910, 2070, 2220].forEach((x) => {
      layer.fillRect(x, height - 184, 14, 54);
      layer.fillRect(x - 8, height - 190, 30, 8);
    });
    layer.fillStyle(0x7b6b4d, 0.28);
    layer.fillRoundedRect(2194, height - 170, 58, 28, 6);
    layer.fillStyle(0x445033, 0.24);
    layer.fillRect(1760, height - 154, 540, 10);
    drawLowDressing(1720, 2440, height - 162, 0x536b38, 0.3);
    drawBunds(1640, 2450, height - 178, 0.18);
    drawConcreteMarkers(2300, height - 158, 4, 52, 0.16);

    drawFence(3020, height - 198, 5, 70, 0.24);
    layer.lineStyle(2, 0x5b4b35, 0.36);
    layer.lineBetween(3122, height - 206, 3465, height - 226);
    layer.fillStyle(0xddd5bd, 0.34);
    layer.fillRect(3198, height - 220, 24, 32);
    layer.fillStyle(0xb7c1aa, 0.32);
    layer.fillRect(3244, height - 218, 26, 28);
    layer.fillStyle(0x8c5c45, 0.3);
    layer.fillRect(3330, height - 222, 30, 34);
    layer.fillStyle(0x6d6755, 0.36);
    layer.fillRoundedRect(3512, height - 154, 26, 30, 5);
    layer.fillStyle(0x5b402b, 0.3);
    layer.fillRect(3090, height - 154, 54, 28);
    layer.fillStyle(0x89704b, 0.28);
    layer.fillRect(3146, height - 160, 40, 34);
    drawBackgroundSack(3038, height - 158, 0.2);
    drawBackgroundSack(3072, height - 164, 0.18);
    drawBackgroundPail(3468, height - 166, 0.2);
    drawBackgroundCrate(3588, height - 164, 0.16);
    drawLowDressing(2920, 3700, height - 162, 0x59743d, 0.26);
    drawBunds(2880, 3740, height - 180, 0.18);

    drawFence(4540, height - 196, 8, 76, 0.26);
    layer.fillStyle(0x5f4b32, 0.32);
    layer.fillRect(4920, height - 168, 92, 28);
    layer.fillRect(5024, height - 182, 46, 42);
    layer.fillStyle(0x77644a, 0.28);
    layer.fillRoundedRect(5124, height - 174, 62, 28, 4);
    layer.fillStyle(0x4d5b38, 0.24);
    layer.fillRect(4740, height - 152, 620, 8);
    drawLowDressing(4380, 5560, height - 160, 0x5b7441, 0.24);
    drawBunds(4300, 5580, height - 178, 0.18);
    drawBackgroundSack(5210, height - 160, 0.16);
    drawBackgroundPail(5660, height - 164, 0.14);

    drawFence(6120, height - 192, 6, 84, 0.22);
    drawLowDressing(6000, 7060, height - 164, 0x6d8e52, 0.36);
    drawBunds(5960, 7100, height - 180, 0.16);
    layer.fillStyle(0x79985d, 0.22);
    [6200, 6420, 6680, 6900].forEach((x) => {
      layer.fillRect(x - 38, height - 184, 76, 18);
      layer.fillRect(x - 24, height - 196, 48, 12);
    });
  }

  createBackgroundSign({
    x,
    y,
    width,
    height,
    label,
    sublabel = '',
    depth = -6,
    alpha = 0.28,
    includePortrait = false,
    scrollFactor = 0.97,
  }) {
    const panel = this.add.rectangle(0, 0, width, height, 0xd2c59f, 0.78)
      .setStrokeStyle(1, 0x5f553f, 0.52);
    const postLeft = this.add.rectangle(-width * 0.34, height * 0.5 + 12, 4, 24, 0x4c3b28, 0.48);
    const postRight = this.add.rectangle(width * 0.34, height * 0.5 + 12, 4, 24, 0x4c3b28, 0.48);
    const textOffsetX = includePortrait ? width * 0.12 : 0;
    const labelText = this.add.text(textOffsetX, sublabel ? -7 : 0, label, {
      fontFamily: '"Courier New", monospace',
      fontSize: '9px',
      color: '#4f4735',
      align: 'center',
      lineSpacing: 0,
    }).setOrigin(0.5);
    const children = [postLeft, postRight, panel, labelText];

    if (sublabel) {
      children.push(this.add.text(textOffsetX, 8, sublabel, {
        fontFamily: '"Courier New", monospace',
        fontSize: '8px',
        color: '#5b513b',
        align: 'center',
      }).setOrigin(0.5));
    }

    if (includePortrait) {
      children.push(this.add.circle(-width * 0.32, -1, 10, 0x76614c, 0.45));
      children.push(this.add.rectangle(-width * 0.32, 13, 18, 12, 0x5d6d4f, 0.42));
    }

    return this.add.container(x, y, children).setDepth(depth).setAlpha(alpha).setScrollFactor(scrollFactor);
  }

  setRenderableTint(renderable, color) {
    if (!renderable || color === undefined || color === null) {
      return;
    }

    if (typeof renderable.setTint === 'function') {
      renderable.setTint(color);
      return;
    }

    if (typeof renderable.setFillStyle === 'function') {
      renderable.setFillStyle(color, renderable.fillAlpha ?? 1);
    }
  }

  refreshAtmosphereState({ animate = false } = {}) {
    const afterCanal = this.getFlag(WORLD_FLAGS.IRRIGATION_SEEN) || this.getFlag(WORLD_FLAGS.SHADOW_REVEALED);
    const hopeful = this.getFlag(WORLD_FLAGS.ENDING_UNLOCKED);

    this.atmosphere?.sky?.setFillStyle(hopeful ? 0xc8d7ca : afterCanal ? 0xb6beb7 : 0xb3bbb4, 1);
    this.atmosphere?.horizonBack?.setFillStyle(hopeful ? 0xa2bc88 : afterCanal ? 0x93a57d : 0x98ad84, 1);
    this.atmosphere?.horizonFront?.setFillStyle(hopeful ? 0x84a265 : afterCanal ? 0x6f8654 : 0x738a57, 1);

    const alphaTargets = [
      { target: this.atmosphere?.dryWash, alpha: hopeful ? 0.05 : afterCanal ? 0.16 : 0.22 },
      { target: this.atmosphere?.canalTension, alpha: hopeful ? 0.05 : afterCanal ? 0.28 : 0 },
      { target: this.atmosphere?.canalEdge, alpha: hopeful ? 0.03 : afterCanal ? 0.18 : 0 },
      { target: this.atmosphere?.canalRevealGlow, alpha: hopeful ? 0.04 : afterCanal ? 0.2 : 0 },
      { target: this.atmosphere?.shadowHalo, alpha: hopeful ? 0 : afterCanal ? 0.22 : 0 },
      { target: this.atmosphere?.endingMist, alpha: hopeful ? 0.26 : 0.1 },
      { target: this.atmosphere?.hopeWash, alpha: hopeful ? 0.18 : 0.04 },
      { target: this.atmosphere?.endingFieldTone, alpha: hopeful ? 0.18 : 0.04 },
      { target: this.atmosphere?.endingLight, alpha: hopeful ? 0.2 : 0.06 },
    ];

    alphaTargets.forEach(({ target, alpha }) => {
      if (!target) {
        return;
      }

      if (animate) {
        this.tweens.killTweensOf(target);
        this.tweens.add({
          targets: target,
          alpha,
          duration: 450,
          ease: 'Sine.Out',
        });
      } else {
        target.setAlpha(alpha);
      }
    });

    const endingGlow = this.decorationsById.get('ending-glow');
    if (endingGlow) {
      if (typeof endingGlow.setFillStyle === 'function') {
        endingGlow.setFillStyle(hopeful ? 0xe2f5b5 : 0xc8df92, 1);
      }
      endingGlow.setAlpha(hopeful ? 0.32 : 0.12);
    }

    ['sprout-patch-left', 'sprout-patch-right'].forEach((id) => {
      const sprout = this.decorationsById.get(id);
      if (!sprout) {
        return;
      }

      this.setRenderableTint(sprout, hopeful ? 0x97ce70 : 0x6e8f59);
      sprout.setAlpha(hopeful ? 0.98 : 0.36);
    });

    const endingTree = this.decorationsById.get('ending-tree');
    if (endingTree) {
      this.setRenderableTint(endingTree, hopeful ? 0x8fc56d : 0x698a55);
      endingTree.setAlpha(hopeful ? 1 : 0.84);
    }

    ['water-source-basin', 'water-canal', 'water-river', 'water-river-outflow', 'water-ending', 'water-pump-drip'].forEach((id) => {
      const water = this.decorationsById.get(id);
      if (!water) {
        return;
      }

      this.setRenderableTint(water, hopeful ? 0x8de4f1 : 0x61b7d7);
    });

    this.refreshAmbientEffects({ animate });
  }

  createTerrain() {
    WORLD_LAYOUT.terrain.forEach((definition) => {
      const solid = this.createRenderable(definition);
      this.physics.add.existing(solid, true);
      if ('allowGravity' in solid.body) {
        solid.body.allowGravity = false;
      }
      solid.body.moves = false;
      if (typeof solid.body.setSize === 'function') {
        solid.body.setSize(definition.width, definition.height);
      }
      if (typeof solid.body.updateFromGameObject === 'function') {
        solid.body.updateFromGameObject();
      }
      this.staticBodies.push(solid);
    });
  }

  createDecorations() {
    WORLD_LAYOUT.decorations.forEach((definition) => {
      const decoration = this.createRenderable(definition);
      if (definition.id === 'symbolic-shadow') {
        decoration.setVisible(this.getFlag(WORLD_FLAGS.SHADOW_REVEALED));
      }
      this.decorationsById.set(definition.id, decoration);
    });
  }

  createAmbientEffects() {
    this.ambientEffects = {
      waterSheens: [],
      hopeParticles: [],
    };

    const waterConfigs = [
      { x: 2265, y: 630, width: 156, height: 16, depth: 9, activeAlpha: 0.16, unlockOnly: false, drift: 18, duration: 1800 },
      { x: 2535, y: 638, width: 380, height: 18, depth: 9, activeAlpha: 0.14, unlockOnly: false, drift: -22, duration: 2100 },
      { x: 6685, y: 602, width: 270, height: 18, depth: 18, activeAlpha: 0.22, unlockOnly: true, drift: 20, duration: 1900 },
    ];

    waterConfigs.forEach((config) => {
      const sheen = this.add.ellipse(config.x, config.y, config.width, config.height, 0xe6fbff, 1);
      sheen.setDepth(config.depth);
      sheen.setAlpha(0);
      sheen.setVisible(false);

      const tween = this.tweens.add({
        targets: sheen,
        x: config.x + config.drift,
        alpha: { from: config.activeAlpha * 0.4, to: config.activeAlpha },
        duration: config.duration,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        paused: true,
      });

      this.ambientEffects.waterSheens.push({
        ...config,
        sheen,
        tween,
        enabled: false,
      });
    });

    for (let index = 0; index < 8; index += 1) {
      const particle = this.add.circle(
        6500 + index * 74 + Phaser.Math.Between(-18, 18),
        520 + Phaser.Math.Between(-60, 70),
        Phaser.Math.Between(2, 3),
        index % 2 === 0 ? 0xe7f4c6 : 0xa8dfda,
        1,
      );

      particle.setDepth(18);
      particle.setAlpha(0);
      particle.setVisible(false);

      const baseX = particle.x;
      const baseY = particle.y;
      const tween = this.tweens.add({
        targets: particle,
        x: baseX + Phaser.Math.Between(-14, 14),
        y: baseY - Phaser.Math.Between(12, 28),
        alpha: { from: 0.08, to: 0.22 },
        duration: 1700 + index * 110,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        paused: true,
      });

      this.ambientEffects.hopeParticles.push({
        particle,
        tween,
        enabled: false,
      });
    }
  }

  createProgressBarriers() {
    (WORLD_LAYOUT.progressBarriers || []).forEach((definition) => {
      const barrier = this.createRenderable({
        ...definition,
        color: definition.textureKey ? undefined : definition.lockedColor,
        alpha: definition.lockedAlpha,
      });

      barrier.id = definition.id;

      this.physics.add.existing(barrier, true);
      if ('allowGravity' in barrier.body) {
        barrier.body.allowGravity = false;
      }
      barrier.body.moves = false;
      if (typeof barrier.body.setSize === 'function') {
        barrier.body.setSize(definition.width, definition.height);
      }
      if (typeof barrier.body.updateFromGameObject === 'function') {
        barrier.body.updateFromGameObject();
      }

      const entry = {
        definition,
        barrier,
        reminderTrigger: null,
        isUnlocked: false,
        collider: null,
      };

      if (definition.reminderTrigger) {
        const reminderTrigger = new TriggerZone(this, {
          id: `${definition.id}Reminder`,
          ...definition.reminderTrigger,
          once: false,
          cooldownMs: definition.warningCooldownMs ?? 1400,
        });

        reminderTrigger.barrierId = definition.id;
        reminderTrigger.setHandler((_context, source) => this.handleProgressBarrierReminder(source.barrierId));
        entry.reminderTrigger = reminderTrigger;
        this.progressBarrierTriggers.push(reminderTrigger);
      }

      this.progressBarriers.push(entry);
      this.progressBarrierBodies.push(barrier);
      this.progressBarrierById.set(definition.id, entry);
    });
  }

  createGate() {
    const { gate } = WORLD_LAYOUT;

    this.gate = {
      glow: this.add.ellipse(gate.x + 84, gate.y + 8, 240, 180, 0xdff0b4, 0),
      pathLight: this.add.rectangle(gate.x + 124, gate.y + 24, 240, 148, 0xcfe4a1, 0),
      lockedVisual: this.createRenderable({
        id: 'gate-locked',
        x: gate.x,
        y: gate.y,
        width: gate.width,
        height: gate.height,
        textureKey: gate.lockedTextureKey,
        color: gate.lockedColor,
        depth: 40,
      }),
      openVisual: this.createRenderable({
        id: 'gate-open',
        x: gate.x,
        y: gate.y,
        width: gate.width,
        height: gate.height,
        textureKey: gate.openTextureKey,
        color: gate.openColor,
        depth: 39,
        alpha: 0,
      }),
      barrier: this.add.rectangle(
        gate.barrier.x,
        gate.barrier.y,
        gate.barrier.width,
        gate.barrier.height,
        gate.barrier.color,
        0.22
      ),
    };

    this.gate.glow.setDepth(36);
    this.gate.pathLight.setDepth(37);
    this.gate.barrier.setDepth(38);
    this.physics.add.existing(this.gate.barrier, true);
    if ('allowGravity' in this.gate.barrier.body) {
      this.gate.barrier.body.allowGravity = false;
    }
    this.gate.barrier.body.moves = false;
  }

  createPlayer() {
    this.player = new Player(this, WORLD_LAYOUT.spawn.x, WORLD_LAYOUT.spawn.y, WORLD_LAYOUT.player);
  }

  createInteractables() {
    WORLD_LAYOUT.interactables.forEach((definition) => {
      const interactable = new Interactable(this, {
        ...definition,
        tint: definition.tint ?? this.getInteractableTint(definition),
      });

      interactable.setHandler((context, target) => this.handleInteractable(context, target));
      this.interactables.push(interactable);
      this.interactablesById.set(interactable.id, interactable);
    });
  }

  configureHubMarkers() {
    const markerConfigs = [
      {
        markerId: 'hub-listen-marker',
        taskId: TASK_IDS.LISTEN,
        targetIds: ['listenFarmerA', 'listenFarmerB'],
      },
      {
        markerId: 'hub-document-marker',
        taskId: TASK_IDS.DOCUMENT,
        targetIds: ['documentBoard'],
      },
      {
        markerId: 'hub-repair-marker',
        taskId: TASK_IDS.REPAIR,
        targetIds: ['repairGate'],
      },
    ];

    this.runtime.hubMarkers = markerConfigs
      .map((config) => {
        const marker = this.decorationsById.get(config.markerId);

        if (!marker) {
          return null;
        }

        marker.setDepth(56);
        marker.setAlpha(0);
        marker.setVisible(false);

        return {
          ...config,
          marker,
          baseY: marker.y,
        };
      })
      .filter(Boolean);
  }

  configureObjectiveMarkers() {
    const markerConfigs = [
      {
        targetType: 'interactable',
        targetId: 'tutorialSign',
        isActive: () => !this.getFlag(WORLD_FLAGS.TUTORIAL_SIGN_READ),
      },
      {
        targetType: 'interactable',
        targetId: 'farmer1',
        isActive: () => (
          this.getFlag(WORLD_FLAGS.INTRO_SEEN)
          && this.getFlag(WORLD_FLAGS.TUTORIAL_SIGN_READ)
          && !this.getFlag(WORLD_FLAGS.FARMER_TALKED)
        ),
      },
      {
        targetType: 'interactable',
        targetId: 'dryCrops',
        isActive: () => this.getFlag(WORLD_FLAGS.FARMER_TALKED) && !this.getFlag(WORLD_FLAGS.CROPS_SEEN),
      },
      {
        targetType: 'interactable',
        targetId: 'brokenCanal',
        isActive: () => this.getFlag(WORLD_FLAGS.CROPS_SEEN) && !this.getFlag(WORLD_FLAGS.IRRIGATION_SEEN),
      },
      {
        targetType: 'interactable',
        targetId: 'mother1',
        isActive: () => this.getFlag(WORLD_FLAGS.IRRIGATION_SEEN) && !this.runtime.familyWitnessed.has('mother1'),
      },
      {
        targetType: 'interactable',
        targetId: 'child1',
        isActive: () => this.getFlag(WORLD_FLAGS.IRRIGATION_SEEN) && !this.runtime.familyWitnessed.has('child1'),
      },
      {
        targetType: 'decoration',
        targetId: 'reflect-marker',
        offsetY: 34,
        isActive: () => this.getFlag(WORLD_FLAGS.FAMILY_SEEN) && !this.getFlag(WORLD_FLAGS.REFLECTION_SEEN),
      },
      {
        targetType: 'interactable',
        targetId: 'listenFarmerA',
        isActive: () => this.getFlag(WORLD_FLAGS.REFLECTION_SEEN) && !this.isTaskComplete(TASK_IDS.LISTEN),
      },
      {
        targetType: 'interactable',
        targetId: 'listenFarmerB',
        isActive: () => this.getFlag(WORLD_FLAGS.REFLECTION_SEEN) && !this.isTaskComplete(TASK_IDS.LISTEN),
      },
      {
        targetType: 'interactable',
        targetId: 'documentBoard',
        isActive: () => this.getFlag(WORLD_FLAGS.REFLECTION_SEEN) && !this.isTaskComplete(TASK_IDS.DOCUMENT),
      },
      {
        targetType: 'interactable',
        targetId: 'repairGate',
        isActive: () => this.getFlag(WORLD_FLAGS.REFLECTION_SEEN) && !this.isTaskComplete(TASK_IDS.REPAIR),
      },
      {
        targetType: 'interactable',
        targetId: 'endingVillager',
        isActive: () => this.getFlag(WORLD_FLAGS.ENDING_UNLOCKED) && !this.getFlag(WORLD_FLAGS.FINAL_NARRATION_SEEN),
      },
    ];

    this.objectiveMarkers = markerConfigs.map((config, index) => {
      const marker = this.add.image(0, 0, ASSET_KEYS.OBJECTIVE_MARKER);
      marker.setDepth(62);
      marker.setAlpha(0);
      marker.setVisible(false);

      return {
        ...config,
        marker,
        index,
        offsetY: config.offsetY ?? 28,
      };
    });
  }

  getObjectiveMarkerTarget(entry) {
    if (entry.targetType === 'decoration') {
      return this.decorationsById.get(entry.targetId) || null;
    }

    return this.interactablesById.get(entry.targetId) || null;
  }

  getObjectiveMarkerAnchor(target, offsetY = 28) {
    const displayHeight = target.displayHeight || target.height || 0;
    const originY = typeof target.originY === 'number' ? target.originY : 0.5;
    const topY = target.y - displayHeight * originY;

    return {
      x: target.x,
      y: topY - offsetY,
    };
  }

  createTriggers() {
    WORLD_LAYOUT.triggers.forEach((definition) => {
      const trigger = new TriggerZone(this, definition);
      trigger.setHandler((context, source) => this.handleTrigger(context, source));
      this.triggers.push(trigger);
      this.triggerById.set(trigger.id, trigger);
    });
  }

  createColliders() {
    this.physics.add.collider(this.player, this.staticBodies);
    this.physics.add.collider(this.player, this.gate.barrier);

    this.progressBarriers.forEach((entry) => {
      entry.collider = this.physics.add.collider(
        this.player,
        entry.barrier,
        () => {
          this.handleProgressBarrierReminder(entry.definition.id);
        },
        null,
        this
      );
    });

    this.triggers.forEach((trigger) => {
      this.physics.add.overlap(
        this.player,
        trigger,
        () => {
          trigger.handleOverlap(this.createSceneContext(trigger));
        },
        null,
        this
      );
    });

    this.progressBarrierTriggers.forEach((trigger) => {
      this.physics.add.overlap(
        this.player,
        trigger,
        () => {
          trigger.handleOverlap(this.createSceneContext(trigger));
        },
        null,
        this
      );
    });
  }

  createFallbackUi() {
    const width = this.scale.width || 1280;
    const height = this.scale.height || 720;

    this.fallbackUi = {
      panel: this.add.rectangle(262, 84, 470, 124, 0x11202a, 0.48),
      objectiveText: this.add.text(34, 28, '', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#f4f1e9',
        wordWrap: { width: 430 },
      }),
      taskText: this.add.text(34, 92, '', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#d8e7d0',
      }),
      promptBackground: this.add.rectangle(width * 0.5, height - 42, 320, 38, 0x11202a, 0.58),
      promptText: this.add.text(width * 0.5, height - 42, '', {
        fontFamily: 'monospace',
        fontSize: '15px',
        color: '#fff7d8',
      }),
    };

    this.fallbackUi.panel.setOrigin(0.5).setScrollFactor(0).setDepth(1000);
    this.fallbackUi.objectiveText.setScrollFactor(0).setDepth(1001);
    this.fallbackUi.taskText.setScrollFactor(0).setDepth(1001);
    this.fallbackUi.promptBackground.setOrigin(0.5).setScrollFactor(0).setDepth(1000);
    this.fallbackUi.promptText.setOrigin(0.5).setScrollFactor(0).setDepth(1001);
  }

  setupCamera() {
    const camera = this.cameras.main;
    const config = WORLD_LAYOUT.camera;

    camera.setBounds(0, 0, WORLD_LAYOUT.world.width, WORLD_LAYOUT.world.height);
    camera.setZoom(config.zoom);
    camera.setDeadzone(config.deadzoneWidth, config.deadzoneHeight);
    camera.startFollow(this.player, true, config.lerpX, config.lerpY);
    camera.setFollowOffset(config.followOffsetX, config.followOffsetY);
    camera.roundPixels = true;
  }

  bindExternalEvents() {
    const bindings = [
      {
        eventName: 'task:completed',
        handler: (payload) => this.handleExternalTaskCompletion(payload),
      },
      {
        eventName: 'task:complete',
        handler: (payload) => this.handleExternalTaskCompletion(payload),
      },
      {
        eventName: 'dialogue:closed',
        handler: () => this.clearAllLocks(),
      },
      {
        eventName: 'task:closed',
        handler: () => this.clearAllLocks(),
      },
      {
        eventName: 'gameplay:activate-water-flow',
        handler: (payload) => this.activateWaterFlow(payload?.source || 'external'),
      },
    ];

    bindings.forEach((binding) => {
      this.game.events.on(binding.eventName, binding.handler);
      this.externalListeners.push(binding);
    });

    const challengeEvents = [
      'ui:challenge:show',
      'ui:challenge:update',
      'ui:challenge:hide',
      'gameplay:challenge-complete',
    ];

    if (typeof this.services.challengeSystem?.subscribe === 'function') {
      challengeEvents.forEach((eventName) => {
        const unsubscribe = this.services.challengeSystem.subscribe(eventName, (payload) => {
          this.emitGameEvent(eventName, payload);
        });

        this.runtime.challengeListeners.push(unsubscribe);
      });
    }
  }

  handleShutdown() {
    this.externalListeners.forEach(({ eventName, handler }) => {
      this.game.events.off(eventName, handler);
    });
    this.externalListeners = [];

    this.runtime.challengeListeners.forEach((unsubscribe) => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.runtime.challengeListeners = [];
  }

  createRenderable(definition) {
    const textureExists = definition.textureKey && this.textures.exists(definition.textureKey);
    const repeatTexture = textureExists && definition.repeatTexture && !definition.animationKey;
    const originX = definition.originX ?? 0.5;
    const originY = definition.originY ?? 0.5;
    let renderable;

    if (textureExists) {
      if (definition.animationKey) {
        renderable = this.add.sprite(definition.x, definition.y, definition.textureKey);
        if (typeof renderable.setDisplaySize === 'function') {
          renderable.setDisplaySize(definition.width, definition.height);
        }
      } else if (repeatTexture) {
        renderable = this.add.tileSprite(
          definition.x,
          definition.y,
          definition.width,
          definition.height,
          definition.textureKey,
        );

        const baseFrame = this.textures.getFrame(definition.textureKey);
        if (baseFrame && typeof renderable.setTileScale === 'function') {
          renderable.setTileScale(1, definition.height / baseFrame.height);
        }
      } else {
        renderable = this.add.image(definition.x, definition.y, definition.textureKey);
        renderable.setDisplaySize(definition.width, definition.height);
      }

      if (definition.color !== undefined) {
        renderable.setTint(definition.color);
      }
    } else {
      renderable = this.add.rectangle(
        definition.x,
        definition.y,
        definition.width,
        definition.height,
        definition.color ?? 0xffffff,
        definition.alpha ?? 1
      );
    }

    if (typeof renderable.setOrigin === 'function') {
      renderable.setOrigin(originX, originY);
    }
    if (typeof renderable.setDepth === 'function') {
      renderable.setDepth(definition.depth ?? 10);
    }
    if (definition.alpha !== undefined && typeof renderable.setAlpha === 'function') {
      renderable.setAlpha(definition.alpha);
    }
    if (definition.visible !== undefined && typeof renderable.setVisible === 'function') {
      renderable.setVisible(definition.visible);
    }
    if (definition.animationKey && typeof renderable.play === 'function' && this.anims.exists(definition.animationKey)) {
      renderable.play(definition.animationKey);
    }

    return renderable;
  }

  getInteractableTint(definition) {
    if (definition.taskId === TASK_IDS.DOCUMENT) {
      return 0xa7d7f9;
    }
    if (definition.taskId === TASK_IDS.REPAIR) {
      return 0xf2b36e;
    }

    const tints = {
      tutorialSign: 0xe7d3a3,
      farmer1: 0xe0d8a8,
      dryCrops: 0xb89156,
      brokenCanal: 0xa5b8bf,
      projectPoster: 0xd7cca4,
      canalDamage: 0xb6aa92,
      mother1: 0xf1c28a,
      child1: 0xd3dcb2,
      fertilizerSack: 0xd9ceb0,
      debtLedger: 0xb99371,
      listenFarmerA: 0xf6d88c,
      listenFarmerB: 0xf6d88c,
      endingVillager: 0xe0d8a8,
    };

    return tints[definition.id] || 0xffffff;
  }

  createSceneContext(source) {
    return {
      scene: this,
      source,
      player: this.player,
      getFlag: (flag) => this.getFlag(flag),
      setFlag: (flag, value = true) => this.setFlag(flag, value),
      isTaskComplete: (taskId) => this.isTaskComplete(taskId),
      completeTask: (taskId, meta) => this.completeTask(taskId, meta),
      activateWaterFlow: (origin) => this.activateWaterFlow(origin),
      unlockEndingPath: () => this.beginEndingUnlockSequence(),
    };
  }

  updateInteractionState() {
    const context = this.createSceneContext(this.player);
    let nearest = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    this.interactables.forEach((interactable) => {
      interactable.setHighlighted(false);
      interactable.refreshState(context);

      if (this.isInputLocked()) {
        return;
      }

      if (!interactable.isAvailable(context) || !interactable.canPrompt(this.player)) {
        return;
      }

      const distance = interactable.getInteractionDistanceTo(this.player);
      if (distance < nearestDistance) {
        nearest = interactable;
        nearestDistance = distance;
      }
    });

    if (nearest) {
      nearest.setHighlighted(true);
      nearest.refreshState(context);
    }

    this.runtime.nearestInteractable = nearest;
    if (nearest) {
      this.setPrompt({
        id: nearest.id,
        key: 'E',
        text: nearest.prompt,
        position: nearest.getPromptPosition(),
      });
    } else {
      this.setPrompt(null);
    }
  }

  handleInteractable(_context, interactable) {
    switch (interactable.id) {
      case 'tutorialSign':
        return this.requestDialogue({
          key: interactable.dialogueKey,
          sourceId: interactable.id,
          beat: interactable.beat,
          onComplete: () => {
            const firstRead = !this.getFlag(WORLD_FLAGS.TUTORIAL_SIGN_READ);
            this.setFlag(WORLD_FLAGS.TUTORIAL_SIGN_READ, true);

            if (firstRead) {
              this.emitBeat('tutorial_sign_read', { x: interactable.x });
            }

            if (!this.getFlag(WORLD_FLAGS.FARMER_TALKED)) {
              if (this.getFlag(WORLD_FLAGS.INTRO_SEEN)) {
                this.setObjective('farmer');
              } else {
                this.setObjective('intro', { force: true });
              }
            }
          },
        });
      case 'projectPoster':
      case 'waterPump':
      case 'canalDamage':
      case 'fertilizerSack':
      case 'debtLedger':
        return this.requestDialogue({
          key: interactable.dialogueKey,
          sourceId: interactable.id,
          beat: interactable.beat,
        });
      case 'endingVillager':
        return this.finishRun(interactable.id);
      case 'farmer1':
        return this.requestDialogue({
          key: interactable.dialogueKey,
          sourceId: interactable.id,
          beat: interactable.beat,
          onComplete: () => {
            if (!this.getFlag(WORLD_FLAGS.FARMER_TALKED)) {
              this.setFlag(WORLD_FLAGS.FARMER_TALKED, true);
              this.setObjective('crops');
              this.emitBeat('farmer_talked', { x: interactable.x });
            }
          },
        });
      case 'dryCrops':
        return this.requestDialogue({
          key: interactable.dialogueKey,
          sourceId: interactable.id,
          beat: interactable.beat,
          onComplete: () => {
            const firstInspection = !this.getFlag(WORLD_FLAGS.CROPS_SEEN);
            this.setFlag(WORLD_FLAGS.CROPS_SEEN, true);
            if (firstInspection) {
              this.setObjective('canal');
              this.emitBeat('crops_seen', { x: interactable.x });
              return;
            }
            if (!this.getFlag(WORLD_FLAGS.IRRIGATION_SEEN)) {
              this.setObjective('canal');
            }
          },
        });
      case 'brokenCanal':
        return this.requestDialogue({
          key: interactable.dialogueKey,
          sourceId: interactable.id,
          beat: interactable.beat,
          onComplete: () => {
            const firstInspection = !this.getFlag(WORLD_FLAGS.IRRIGATION_SEEN);
            this.setFlag(WORLD_FLAGS.IRRIGATION_SEEN, true);
            this.revealCanalSymbolism();
            if (firstInspection) {
              this.setObjective('family');
              this.emitBeat('irrigation_seen', { x: interactable.x });
            }
          },
        });
      case 'mother1':
      case 'child1':
        return this.requestDialogue({
          key: interactable.dialogueKey,
          sourceId: interactable.id,
          beat: interactable.beat,
          onComplete: () => {
            this.recordFamilyWitness(interactable.id, interactable.x);
          },
        });
      case 'listenFarmerA':
      case 'listenFarmerB':
        return this.requestDialogue({
          key: interactable.dialogueKey,
          sourceId: interactable.id,
          beat: interactable.beat,
          onComplete: () => {
            this.recordListenConversation(interactable);
          },
        });
      default:
        if (interactable.taskId) {
          if (interactable.id === 'documentBoard') {
            return this.requestDialogue({
              key: DIALOGUE_KEYS.DOCUMENT_BOARD,
              sourceId: interactable.id,
              beat: interactable.beat,
              onComplete: () => {
                this.startChallenge(CHALLENGE_IDS.DOCUMENT_TRUTH, {
                  sourceId: interactable.id,
                  x: interactable.x,
                  taskId: interactable.taskId,
                });
              },
            });
          }

          if (interactable.id === 'repairGate') {
            return this.requestDialogue({
              key: DIALOGUE_KEYS.REPAIR_GATE_INTRO,
              sourceId: interactable.id,
              beat: interactable.beat,
              onComplete: () => {
                this.startChallenge(CHALLENGE_IDS.REPAIR_GATE, {
                  sourceId: interactable.id,
                  x: interactable.x,
                  taskId: interactable.taskId,
                });
              },
            });
          }

          return this.requestDialogue({
            key: interactable.dialogueKey || interactable.taskId,
            sourceId: interactable.id,
            beat: interactable.beat,
            onComplete: () => {
              this.completeTask(interactable.taskId, {
                sourceId: interactable.id,
                x: interactable.x,
              });
            },
          });
        }
        break;
    }

    return false;
  }

  handleTrigger(_context, trigger) {
    trigger.flagsOnEnter.forEach((flag) => this.setFlag(flag, true));

    if (trigger.eventKey) {
      this.emitBeat(trigger.eventKey, {
        triggerId: trigger.id,
        beat: trigger.beat,
      });
    }

    switch (trigger.id) {
      case 'introNarration':
        if (this.getFlag(WORLD_FLAGS.INTRO_SEEN) || this.services.dialogueSystem?.isActive?.()) {
          break;
        }
        this.startIntroNarration(trigger.id);
        break;
      case 'reflectionZone':
        if (!this.getFlag(WORLD_FLAGS.REFLECTION_SEEN)) {
          this.requestDialogue({
            key: DIALOGUE_KEYS.REFLECTION,
            sourceId: trigger.id,
            beat: 'reflection',
            onComplete: () => {
              const firstReflection = !this.getFlag(WORLD_FLAGS.REFLECTION_SEEN);
              this.setFlag(WORLD_FLAGS.REFLECTION_SEEN, true);
              if (typeof this.services.taskSystem?.activateTasks === 'function') {
                this.services.taskSystem.activateTasks(TASK_ID_LIST);
              }
              if (firstReflection) {
                this.setObjective('hub');
                this.emitBeat('reflection_seen', { x: trigger.x });
              }
            },
          });
        }
        break;
      case 'gateReminder':
        this.handleGateReminder();
        break;
      case 'endingNarrationZone':
        break;
      default:
        break;
    }
  }

  handleGateReminder() {
    if (this.getFlag(WORLD_FLAGS.ENDING_UNLOCKED)) {
      this.setObjective('ending');
      return;
    }

    this.setObjective('hub');
    this.emitProgressReminder({
      reminderId: 'endingGate',
      title: 'Finish the response tasks first.',
      objectiveKey: 'hub',
      cooldownMs: 1500,
    });

    if (this.gate?.lockedVisual) {
      this.tweens.killTweensOf(this.gate.lockedVisual);
      this.tweens.add({
        targets: this.gate.lockedVisual,
        duration: 180,
        yoyo: true,
        repeat: 1,
        scaleX: 1.04,
        scaleY: 1.04,
        ease: 'Sine.Out',
      });
    }
  }

  startIntroNarration(sourceId = 'introNarration') {
    if (this.getFlag(WORLD_FLAGS.INTRO_SEEN)) {
      return false;
    }

    return this.requestDialogue({
      key: DIALOGUE_KEYS.INTRO_NARRATION,
      sourceId,
      beat: 'intro',
      onComplete: () => {
        this.setFlag(WORLD_FLAGS.INTRO_SEEN, true);
        if (this.getFlag(WORLD_FLAGS.TUTORIAL_SIGN_READ) && !this.getFlag(WORLD_FLAGS.FARMER_TALKED)) {
          this.setObjective('farmer');
        } else {
          this.setObjective('intro');
        }
      },
    });
  }

  handleProgressBarrierReminder(barrierId) {
    const entry = this.progressBarrierById.get(barrierId);

    if (!entry || this.getFlag(entry.definition.unlockFlag)) {
      return false;
    }

    return this.emitProgressReminder({
      reminderId: barrierId,
      title: entry.definition.warningTitle,
      objectiveKey: this.getObjectiveForProgress(),
      cooldownMs: entry.definition.warningCooldownMs,
      barrierEntry: entry,
    });
  }

  pulseProgressBarrier(entry) {
    const barrier = entry?.barrier;

    if (!barrier?.visible) {
      return;
    }

    this.tweens.killTweensOf(barrier);
    barrier.setPosition(entry.definition.x, entry.definition.y);
    barrier.setAngle(0);
    this.tweens.add({
      targets: barrier,
      x: entry.definition.x + 4,
      angle: 1.6,
      duration: 70,
      yoyo: true,
      repeat: 1,
      ease: 'Sine.Out',
      onComplete: () => {
        barrier.setPosition(entry.definition.x, entry.definition.y);
        barrier.setAngle(0);
      },
    });
  }

  getObjectivePayload(objectiveKey = this.getObjectiveForProgress()) {
    if (!OBJECTIVES[objectiveKey]) {
      return {
        id: objectiveKey,
        key: objectiveKey,
        text: this.runtime.currentObjectiveText || '',
      };
    }

    const text = this.resolveObjectiveText(objectiveKey);

    return {
      id: OBJECTIVES[objectiveKey].id,
      key: objectiveKey,
      text,
    };
  }

  resolveObjectiveText(objectiveKey) {
    if (objectiveKey === 'hub') {
      return this.services.taskSystem?.getHubObjective?.() || getObjectiveText('hub', {
        remainingTaskIds: this.services.taskSystem?.getRemainingTaskIds?.() || [],
      });
    }

    if (
      objectiveKey === 'ending'
      && this.getFlag(WORLD_FLAGS.ENDING_UNLOCKED)
      && !this.getFlag(WORLD_FLAGS.FINAL_NARRATION_SEEN)
    ) {
      return 'Talk to Tatay Ramon in the field.';
    }

    return OBJECTIVES[objectiveKey]?.text || objectiveKey;
  }

  emitProgressReminder({
    reminderId,
    title = 'Finish the current objective first.',
    objectiveKey = this.getObjectiveForProgress(),
    cooldownMs = 1400,
    barrierEntry = null,
  } = {}) {
    const now = this.time.now;
    const lastShownAt = this.runtime.progressWarningTimes.get(reminderId) ?? -Infinity;

    if (now - lastShownAt < cooldownMs) {
      return false;
    }

    this.runtime.progressWarningTimes.set(reminderId, now);

    if (barrierEntry) {
      this.pulseProgressBarrier(barrierEntry);
    }

    this.player?.setVelocityX?.(0);
    this.cameras.main.shake(70, 0.0007);
    playOptionalSound(this, 'sfx-interact', { volume: 0.22 });

    const objective = this.getObjectivePayload(objectiveKey);

    this.emitGameEvent('gameplay:objective-reminder', {
      reminderId,
      title,
      tone: 'warning',
      duration: 1700,
      objectiveKey: objective.key,
      objectiveText: objective.text,
      body: objective.text ? `Current objective: ${objective.text}` : '',
    });

    return true;
  }

  recordFamilyWitness(interactableId, x) {
    this.runtime.familyWitnessed.add(interactableId);

    if (
      !this.getFlag(WORLD_FLAGS.FAMILY_SEEN)
      && FAMILY_INTERACTION_IDS.every((id) => this.runtime.familyWitnessed.has(id))
    ) {
      this.setFlag(WORLD_FLAGS.FAMILY_SEEN, true);
      this.setObjective('reflection');
      this.emitBeat('family_seen', { x });
      return true;
    }

    if (!this.getFlag(WORLD_FLAGS.FAMILY_SEEN)) {
      this.setObjective('family');
    }

    return false;
  }

  recordListenConversation(interactable) {
    const progress = this.services.taskSystem?.recordListenConversation?.(interactable.id) || {
      readyToComplete: false,
    };

    if (!progress.readyToComplete || this.isTaskComplete(TASK_IDS.LISTEN)) {
      this.setObjective('hub');
      return false;
    }

    return this.requestDialogue({
      key: DIALOGUE_KEYS.LISTEN_COMPLETE,
      sourceId: `${interactable.id}-complete`,
      beat: 'hub',
      onComplete: () => {
        this.startChallenge(CHALLENGE_IDS.LISTEN_REFLECTION, {
          sourceId: interactable.id,
          listenedTo: progress.listenedTo,
          x: interactable.x,
        });
      },
    });
  }

  startChallenge(challengeId, context = {}) {
    if (!this.services.challengeSystem?.start) {
      return false;
    }

    this.acquireInteractionLock();
    this.services.challengeSystem.start(challengeId, {
      context,
      now: Date.now(),
    });
    return true;
  }

  handleChallengeComplete(payload = {}) {
    this.releaseInteractionLock();

    switch (payload.challengeId) {
      case CHALLENGE_IDS.LISTEN_REFLECTION:
        this.completeTask(TASK_IDS.LISTEN, {
          sourceId: payload.context?.sourceId || 'listenReflection',
          listenedTo: payload.context?.listenedTo || [],
          x: payload.context?.x,
          challengeResult: payload,
        });
        break;
      case CHALLENGE_IDS.DOCUMENT_TRUTH:
        this.requestDialogue({
          key: DIALOGUE_KEYS.DOCUMENT_COMPLETE,
          sourceId: `${payload.context?.sourceId || 'documentBoard'}-complete`,
          beat: 'hub',
          onComplete: () => {
            this.completeTask(TASK_IDS.DOCUMENT, {
              sourceId: payload.context?.sourceId || 'documentTruth',
              x: payload.context?.x,
              challengeResult: payload,
            });
          },
        });
        break;
      case CHALLENGE_IDS.REPAIR_GATE:
        if (!payload.passed) {
          this.setObjective('hub');
          this.syncWorldState();
          return;
        }

        this.requestDialogue({
          key: DIALOGUE_KEYS.REPAIR_GATE_COMPLETE,
          sourceId: `${payload.context?.sourceId || 'repairGate'}-complete`,
          beat: 'hub',
          onComplete: () => {
            this.completeTask(TASK_IDS.REPAIR, {
              sourceId: payload.context?.sourceId || 'repairGate',
              x: payload.context?.x,
              challengeResult: payload,
            });
          },
        });
        break;
      case CHALLENGE_IDS.FINAL_ASSESSMENT:
        this.finishEndingFromAssessment(payload);
        break;
      default:
        break;
    }
  }

  showDialogueSnapshot(snapshot) {
    const line = snapshot?.line || null;
    const text = snapshot?.text || line?.text || '';

    if (!text) {
      return;
    }

    const payload = {
      speaker: snapshot?.speaker || line?.speaker || '',
      body: text,
      canContinue: true,
      continueText: snapshot?.canAdvance === false ? 'Finish  ENTER / SPACE' : 'Continue  ENTER / SPACE',
      lineIndex: snapshot?.lineIndex,
      totalLines: snapshot?.totalLines,
    };

    const state = this.services.gameState;
    if (typeof state?.openDialogue === 'function') {
      state.openDialogue(payload);
    } else {
      const root = this.getGameStateRoot();
      if (root?.ui) {
        root.ui.dialogueOpen = true;
        root.ui.canMove = false;
        root.ui.dialogue = payload;
      }
    }

    this.emitGameEvent('ui:dialogue:show', payload);
    this.emitGameEvent('dialogue:show', payload);
  }

  hideDialogueUi() {
    const state = this.services.gameState;
    if (typeof state?.closeDialogue === 'function') {
      state.closeDialogue();
    } else {
      const root = this.getGameStateRoot();
      if (root?.ui) {
        root.ui.dialogueOpen = false;
        root.ui.canMove = true;
        root.ui.dialogue = null;
      }
    }

    this.emitGameEvent('ui:dialogue:hide', { instant: true });
    this.emitGameEvent('dialogue:hide', { instant: true });
  }

  requestDialogue(payload) {
    const sourceInteractable = payload.sourceId ? this.interactablesById.get(payload.sourceId) : null;
    const complete = once(() => {
      sourceInteractable?.playBaseAnimation?.();
      this.hideDialogueUi();
      this.releaseInteractionLock();
      payload.onComplete?.();
      this.syncWorldState();
    });

    const request = {
      ...payload,
      sceneKey: this.scene.key,
      onComplete: complete,
      onClose: complete,
      onFinish: complete,
    };

    const objectiveContext = payload.objectiveContext
      || (payload.beat === 'hub'
        ? {
          remainingTaskIds: this.services.taskSystem?.getRemainingTaskIds?.() || [],
        }
        : undefined);

    sourceInteractable?.playTalkAnimation?.();
    this.acquireInteractionLock();

    if (typeof this.services.dialogueSystem?.start === 'function') {
      const snapshot = this.services.dialogueSystem.start(payload.key, {
        context: request,
        objectiveId: payload.objectiveId || null,
        objectiveContext,
        onComplete: complete,
        restart: true,
      });
      this.showDialogueSnapshot(snapshot);
      return true;
    }

    const dialogueResult = callFirst(this.services.dialogueSystem, DIALOGUE_METHODS, request);
    if (dialogueResult.called && dialogueResult.value !== false) {
      const snapshot = dialogueResult.value?.snapshot || dialogueResult.value;
      this.showDialogueSnapshot(snapshot);
      return true;
    }

    if (this.emitIfHandled('dialogue:request', request)) {
      return true;
    }

    complete();
    return true;
  }

  requestTask(payload) {
    if (payload.key) {
      return this.requestDialogue(payload);
    }

    const complete = once(() => {
      this.releaseInteractionLock();
      payload.onComplete?.();
      this.syncWorldState();
    });

    const request = {
      ...payload,
      sceneKey: this.scene.key,
      onComplete: complete,
      onClose: complete,
      onFinish: complete,
    };

    this.acquireInteractionLock();

    if (typeof this.services.taskSystem?.start === 'function') {
      const taskResult = this.services.taskSystem.start(payload.taskId, request);
      if (taskResult !== false) {
        return true;
      }
    }

    const taskResult = callFirst(this.services.taskSystem, TASK_METHODS, request);
    if (taskResult.called && taskResult.value !== false) {
      return true;
    }

    if (this.emitIfHandled('task:request', request)) {
      return true;
    }

    complete();
    return true;
  }

  revealCanalSymbolism() {
    const shadow = this.decorationsById.get('symbolic-shadow');
    const poster = this.interactablesById.get('projectPoster');
    const firstReveal = !this.getFlag(WORLD_FLAGS.SHADOW_REVEALED);

    this.setFlag(WORLD_FLAGS.SHADOW_REVEALED, true);

    if (shadow) {
      shadow.setVisible(true);
      this.tweens.killTweensOf(shadow);
      shadow.setScale(firstReveal ? 0.92 : 1);
      this.tweens.add({
        targets: shadow,
        scaleX: 1,
        scaleY: 1,
        alpha: 0.35,
        duration: firstReveal ? 700 : 220,
        ease: 'Sine.Out',
      });
    }

    if (poster) {
      poster.settings.tint = 0xffffff;
      poster.settings.idleAlpha = 0.94;
      poster.settings.inactiveAlpha = 0.7;
      poster.refreshState(this.createSceneContext(poster));
    }

    if (firstReveal) {
      playOptionalSound(this, 'sfx-interact', { volume: 0.55 });
      this.refreshAtmosphereState({ animate: true });
      this.cameras.main.shake(180, 0.0022);
      this.emitGameEvent('world:revealShadow', { source: 'brokenCanal' });
    }
  }

  activateWaterFlow(source = 'system', { endingField = false } = {}) {
    const firstActivation = !this.getFlag(WORLD_FLAGS.WATER_FLOWING);
    this.setFlag(WORLD_FLAGS.WATER_FLOWING, true);
    const fullyOpened = endingField || this.getFlag(WORLD_FLAGS.ENDING_UNLOCKED);
    const announceEndingField = fullyOpened && !this.runtime.endingFieldWaterAnnounced;
    const pumpDrip = this.decorationsById.get('water-pump-drip');

    if (pumpDrip) {
      pumpDrip.setVisible(true);
      this.tweens.killTweensOf(pumpDrip);
      this.tweens.add({
        targets: pumpDrip,
        alpha: 0,
        duration: 420,
        ease: 'Sine.Out',
        onComplete: () => {
          pumpDrip.setVisible(false);
        },
      });
    }

    ['water-river', 'water-river-outflow', 'water-ending'].forEach((id, index) => {
      const visual = this.decorationsById.get(id);
      if (!visual) {
        return;
      }

      const shouldShow = id !== 'water-ending' || fullyOpened;
      const targetAlpha = id === 'water-ending'
        ? (fullyOpened ? 1 : 0)
        : id === 'water-river'
          ? (fullyOpened ? 0.84 : 0.72)
          : (fullyOpened ? 0.78 : 0.64);

      visual.setVisible(shouldShow);
      this.tweens.killTweensOf(visual);

      if (firstActivation || fullyOpened) {
        this.tweens.add({
          targets: visual,
          alpha: targetAlpha,
          duration: 650,
          delay: shouldShow ? index * 120 : 0,
          ease: 'Sine.Out',
        });
      } else {
        visual.setAlpha(targetAlpha);
      }
    });

    this.refreshAmbientEffects({ animate: firstActivation || fullyOpened });

    if (announceEndingField) {
      this.runtime.endingFieldWaterAnnounced = true;
    }

    if (firstActivation || announceEndingField) {
      playOptionalSound(this, 'sfx-water', { volume: 0.5 });
      this.emitGameEvent('gameplay:water-flow', { source });
      this.emitGameEvent('world:startWater', { source, endingField: fullyOpened });
    }
  }

  completeTask(taskId, meta = {}) {
    if (this.isTaskComplete(taskId)) {
      return false;
    }

    this.setTaskComplete(taskId, true, meta);
    playOptionalSound(this, 'sfx-task', { volume: 0.65 });

    const taskInteractable = this.interactables.find((entry) => entry.taskId === taskId);
    taskInteractable?.setCompleted(true);

    if (taskId === TASK_IDS.REPAIR) {
      this.activateWaterFlow('repair-task');
    }

    this.emitGameEvent('gameplay:task-complete', {
      taskId,
      ...meta,
    });

    if (this.allTasksComplete()) {
      this.beginEndingUnlockSequence();
    } else {
      this.setObjective('hub');
    }

    this.syncWorldState();
    return true;
  }

  beginEndingUnlockSequence() {
    if (this.getFlag(WORLD_FLAGS.ENDING_UNLOCKED) || this.runtime.endingUnlockInProgress) {
      return;
    }

    this.runtime.endingUnlockInProgress = true;
    this.setObjective('hub');

    this.requestDialogue({
      key: DIALOGUE_KEYS.HUB_UNLOCK,
      sourceId: 'endingUnlock',
      beat: 'hub',
      onComplete: () => {
        this.finalizeEndingUnlock();
      },
    });
  }

  finalizeEndingUnlock() {
    const alreadyUnlocked = this.getFlag(WORLD_FLAGS.ENDING_UNLOCKED);

    this.runtime.endingUnlockInProgress = false;
    this.setFlag(WORLD_FLAGS.ENDING_UNLOCKED, true);
    this.activateWaterFlow('ending-unlock', { endingField: true });
    this.fadeShadowAfterUnlock();
    this.refreshAtmosphereState({ animate: true });

    if (!alreadyUnlocked) {
      playOptionalSound(this, 'sfx-confirm', { volume: 0.55 });
      this.emitBeat('ending_unlocked', { x: WORLD_LAYOUT.gate.x });
      this.emitGameEvent('world:unlockEnding', { x: WORLD_LAYOUT.gate.x });

      this.gate.openVisual.setScale(0.92, 1);
      this.gate.openVisual.setAlpha(0);
      this.tweens.add({
        targets: this.gate.openVisual,
        alpha: 1,
        scaleX: 1,
        scaleY: 1,
        duration: 520,
        ease: 'Back.Out',
      });

      this.tweens.add({
        targets: [this.gate.lockedVisual, this.gate.barrier],
        alpha: 0,
        duration: 360,
        ease: 'Sine.Out',
      });

      this.tweens.add({
        targets: [this.gate.glow, this.gate.pathLight],
        alpha: { from: 0.04, to: 0.3 },
        duration: 520,
        ease: 'Sine.Out',
      });
    }

    this.refreshGateState();
    this.setObjective('ending');
  }

  fadeShadowAfterUnlock() {
    const shadow = this.decorationsById.get('symbolic-shadow');
    if (shadow) {
      this.tweens.killTweensOf(shadow);
      this.tweens.add({
        targets: shadow,
        alpha: 0,
        duration: 650,
        ease: 'Sine.Out',
      });
    }

    const poster = this.interactablesById.get('projectPoster');
    if (poster) {
      poster.settings.tint = 0xc8b888;
      poster.settings.idleAlpha = 0.34;
      poster.settings.inactiveAlpha = 0.28;
      poster.refreshState(this.createSceneContext(poster));
    }

    this.emitGameEvent('world:fadeShadow', { source: 'ending-unlock' });
  }

  refreshGateState() {
    const unlocked = this.getFlag(WORLD_FLAGS.ENDING_UNLOCKED);

    if (unlocked) {
      this.gate.lockedVisual.setAlpha(0);
      this.gate.openVisual.setAlpha(1);
      this.gate.glow.setAlpha(0.3);
      this.gate.pathLight.setAlpha(0.14);
      this.gate.barrier.body.enable = false;
      this.gate.barrier.setAlpha(0);
    } else {
      this.gate.lockedVisual.setAlpha(1);
      this.gate.openVisual.setAlpha(0);
      this.gate.glow.setAlpha(0.04);
      this.gate.pathLight.setAlpha(0);
      this.gate.barrier.body.enable = true;
      this.gate.barrier.setAlpha(0.22);
    }
  }

  refreshAmbientEffects({ animate = false } = {}) {
    const waterFlowing = this.getFlag(WORLD_FLAGS.WATER_FLOWING);
    const hopeful = this.getFlag(WORLD_FLAGS.ENDING_UNLOCKED);

    this.ambientEffects?.waterSheens?.forEach((entry) => {
      const enabled = waterFlowing && (!entry.unlockOnly || hopeful);

      if (entry.enabled === enabled) {
        return;
      }

      entry.enabled = enabled;

      if (enabled) {
        entry.sheen.setVisible(true);
        if (animate) {
          entry.sheen.setAlpha(0);
        } else {
          entry.sheen.setAlpha(entry.activeAlpha);
        }
        entry.tween.resume();
        return;
      }

      entry.tween.pause();
      entry.sheen.setAlpha(0);
      entry.sheen.setVisible(false);
    });

    this.ambientEffects?.hopeParticles?.forEach((entry) => {
      if (entry.enabled === hopeful) {
        return;
      }

      entry.enabled = hopeful;

      if (hopeful) {
        entry.particle.setVisible(true);
        if (animate) {
          entry.particle.setAlpha(0);
        }
        entry.tween.resume();
        return;
      }

      entry.tween.pause();
      entry.particle.setAlpha(0);
      entry.particle.setVisible(false);
    });
  }

  finishRun(sourceId = 'endingNarrationZone') {
    if (this.runtime.endingTriggered || !this.getFlag(WORLD_FLAGS.ENDING_UNLOCKED)) {
      return false;
    }

    this.runtime.endingTriggered = true;
    this.setObjective('ending');

    return this.requestDialogue({
      key: DIALOGUE_KEYS.ENDING_VILLAGER,
      sourceId,
      beat: 'ending',
      onComplete: () => {
        this.startChallenge(CHALLENGE_IDS.FINAL_ASSESSMENT, {
          sourceId,
          x: this.interactablesById.get('endingVillager')?.x,
        });
      },
    });
  }

  resolveEndingVariant(finalAssessmentPayload = null) {
    const state = this.services.gameState;
    const listenResult = state?.getChallengeResult?.(CHALLENGE_IDS.LISTEN_REFLECTION) || null;
    const documentResult = state?.getChallengeResult?.(CHALLENGE_IDS.DOCUMENT_TRUTH) || null;
    const finalResult = finalAssessmentPayload
      || state?.getChallengeResult?.(CHALLENGE_IDS.FINAL_ASSESSMENT)
      || null;

    const learned = listenResult?.status === 'passed'
      && documentResult?.status === 'passed'
      && (finalResult?.score || 0) >= 3;

    return learned ? ENDING_VARIANTS.LEARNED : ENDING_VARIANTS.DID_NOT_LEARN;
  }

  finishEndingFromAssessment(payload) {
    const endingVariant = this.resolveEndingVariant(payload);
    const sequenceKey = endingVariant === ENDING_VARIANTS.LEARNED
      ? DIALOGUE_KEYS.ENDING_SEQUENCE_LEARNED
      : DIALOGUE_KEYS.ENDING_SEQUENCE_DID_NOT_LEARN;

    if (typeof this.services.gameState?.setEndingVariant === 'function') {
      this.services.gameState.setEndingVariant(endingVariant);
    }

    this.requestDialogue({
      key: sequenceKey,
      sourceId: payload.context?.sourceId || 'endingAssessment',
      beat: 'ending',
      onComplete: () => {
        this.setFlag(WORLD_FLAGS.FINAL_NARRATION_SEEN, true);
        this.startEndScene(endingVariant);
      },
    });
  }

  startEndScene(endingVariant = null) {
    const resolvedVariant = endingVariant || this.resolveEndingVariant();
    const payload = {
      sceneKey: this.scene.key,
      gameState: this.services.gameState,
      completedTasks: TASK_ID_LIST.filter((taskId) => this.isTaskComplete(taskId)),
      waterFlowing: this.getFlag(WORLD_FLAGS.WATER_FLOWING),
      endingUnlocked: this.getFlag(WORLD_FLAGS.ENDING_UNLOCKED),
      endingVariant: resolvedVariant,
      ending: getEndingCopy(resolvedVariant),
      text: this.resolveObjectiveText('ending'),
    };

    this.emitGameEvent('gameplay:end', payload);
    this.emitGameEvent('ending:start', payload);
    this.emitGameEvent('flow:goToEndScene', payload);

    if (this.scene.manager.keys.EndScene) {
      if (this.scene.isActive('UIScene')) {
        this.scene.stop('UIScene');
      }
      this.scene.start('EndScene', payload);
      return;
    }

    this.cameras.main.flash(500, 255, 255, 255);
  }

  syncWorldState() {
    if (this.getFlag(WORLD_FLAGS.FAMILY_SEEN) && this.runtime.familyWitnessed.size === 0) {
      FAMILY_INTERACTION_IDS.forEach((id) => this.runtime.familyWitnessed.add(id));
    }

    if (this.getFlag(WORLD_FLAGS.REFLECTION_SEEN) && !this.allTasksComplete()) {
      const taskSnapshot = this.services.taskSystem?.getSnapshot?.().tasks || [];
      const hasLockedTasks = taskSnapshot.some((task) => task.status === 'locked');
      if (hasLockedTasks || !taskSnapshot.length) {
        this.services.taskSystem?.activateTasks?.(TASK_ID_LIST);
      }
    }

    if (this.allTasksComplete() && !this.getFlag(WORLD_FLAGS.ENDING_UNLOCKED) && !this.runtime.endingUnlockInProgress) {
      this.beginEndingUnlockSequence();
    }

    if (this.getFlag(WORLD_FLAGS.WATER_FLOWING)) {
      ['water-river', 'water-river-outflow', 'water-ending'].forEach((id) => {
        const visual = this.decorationsById.get(id);
        if (!visual) {
          return;
        }

        const fullyOpened = this.getFlag(WORLD_FLAGS.ENDING_UNLOCKED);
        const shouldShow = id !== 'water-ending' || fullyOpened;
        const targetAlpha = id === 'water-ending'
          ? (fullyOpened ? 1 : 0)
          : id === 'water-river'
            ? (fullyOpened ? 0.84 : 0.72)
            : (fullyOpened ? 0.78 : 0.64);

        visual.setVisible(shouldShow);
        visual.setAlpha(targetAlpha);
      });
    }

    const pumpDrip = this.decorationsById.get('water-pump-drip');
    if (pumpDrip) {
      if (this.getFlag(WORLD_FLAGS.WATER_FLOWING)) {
        pumpDrip.setVisible(false);
        pumpDrip.setAlpha(0);
      } else {
        pumpDrip.setVisible(true);
        pumpDrip.setAlpha(0.88);
      }
    }

    const shadow = this.decorationsById.get('symbolic-shadow');
    if (shadow) {
      if (this.getFlag(WORLD_FLAGS.SHADOW_REVEALED)) {
        shadow.setVisible(true);
        shadow.setAlpha(this.getFlag(WORLD_FLAGS.ENDING_UNLOCKED) ? 0 : 0.35);
      } else {
        shadow.setVisible(false);
      }
    }

    const poster = this.interactablesById.get('projectPoster');
    if (poster) {
      if (this.getFlag(WORLD_FLAGS.ENDING_UNLOCKED)) {
        poster.settings.tint = 0xc8b888;
        poster.settings.idleAlpha = 0.34;
        poster.settings.inactiveAlpha = 0.28;
      } else if (this.getFlag(WORLD_FLAGS.SHADOW_REVEALED)) {
        poster.settings.tint = 0xffffff;
        poster.settings.idleAlpha = 0.94;
        poster.settings.inactiveAlpha = 0.7;
      } else {
        poster.settings.tint = 0xd7cca4;
        poster.settings.idleAlpha = 0.58;
        poster.settings.inactiveAlpha = 0.42;
      }
    }

    this.refreshAtmosphereState();
    this.refreshProgressBarrierState();
    this.refreshGateState();
    this.interactables.forEach((interactable) => {
      if (interactable.taskId && this.isTaskComplete(interactable.taskId)) {
        interactable.setCompleted(true);
      }
      interactable.refreshState(this.createSceneContext(interactable));
    });
    this.setObjective(this.getObjectiveForProgress());
  }

  getObjectiveForProgress() {
    if (this.getFlag(WORLD_FLAGS.FINAL_NARRATION_SEEN)) {
      return 'ending';
    }
    if (this.getFlag(WORLD_FLAGS.ENDING_UNLOCKED)) {
      return 'ending';
    }
    if (this.runtime.endingUnlockInProgress || this.allTasksComplete()) {
      return 'hub';
    }
    if (this.getFlag(WORLD_FLAGS.REFLECTION_SEEN)) {
      return 'hub';
    }
    if (this.getFlag(WORLD_FLAGS.FAMILY_SEEN)) {
      return 'reflection';
    }
    if (this.getFlag(WORLD_FLAGS.IRRIGATION_SEEN)) {
      return 'family';
    }
    if (this.getFlag(WORLD_FLAGS.CROPS_SEEN)) {
      return 'canal';
    }
    if (this.getFlag(WORLD_FLAGS.FARMER_TALKED)) {
      return 'crops';
    }
    if (this.getFlag(WORLD_FLAGS.INTRO_SEEN) && this.getFlag(WORLD_FLAGS.TUTORIAL_SIGN_READ)) {
      return 'farmer';
    }
    return 'intro';
  }

  handleExternalTaskCompletion(payload) {
    const taskId = payload?.taskId || payload?.id;
    if (!taskId || !TASK_ID_LIST.includes(taskId)) {
      return;
    }

    this.completeTask(taskId, {
      sourceId: payload?.sourceId || 'external',
    });
  }

  acquireInteractionLock() {
    this.runtime.lockDepth += 1;
    this.runtime.lockStartedAt = this.time.now;
    this.player.lockMovement(true);
    this.setUiLocked(true);
  }

  releaseInteractionLock() {
    this.runtime.lockDepth = Math.max(0, this.runtime.lockDepth - 1);
    if (this.runtime.lockDepth === 0) {
      this.runtime.lockStartedAt = 0;
      this.player.lockMovement(false);
      this.setUiLocked(false);
    }
  }

  clearAllLocks() {
    this.runtime.lockDepth = 0;
    this.runtime.lockStartedAt = 0;
    this.player.lockMovement(false);
    this.setUiLocked(false);
  }

  isInputLocked() {
    return this.runtime.lockDepth > 0 || Boolean(this.runtime.fallbackState.uiLocked);
  }

  recoverFromStaleLocks(time) {
    const uiScene = this.scene.isActive('UIScene') ? this.scene.get('UIScene') : null;
    const gameStateUi = this.services.gameState?.state?.ui || {};
    const dialogueSnapshot = this.services.dialogueSystem?.getSnapshot?.() || null;
    const challengeSnapshot = this.services.challengeSystem?.getSnapshot?.() || null;
    const dialogueActive = Boolean(this.services.dialogueSystem?.isActive?.() || gameStateUi.dialogueOpen || gameStateUi.dialogue);
    const dialogueVisible = Boolean(uiScene?.dialogueBox?.visible);
    const challengeActive = Boolean(
      this.services.challengeSystem?.isActive?.()
      || gameStateUi.challengeOpen
      || gameStateUi.challenge
    );
    const challengeVisible = Boolean(uiScene?.challengeBox?.visible);
    const movementStuck = Boolean(
      this.player?.movementLocked
      || this.runtime.fallbackState.uiLocked
      || gameStateUi.locked
      || gameStateUi.canMove === false
    );

    if (this.runtime.lockDepth <= 0) {
      if (!dialogueActive && !challengeActive && movementStuck) {
        this.hideDialogueUi();
        this.clearAllLocks();
      }
      return;
    }

    if ((dialogueActive && dialogueVisible) || (challengeActive && challengeVisible)) {
      return;
    }

    if (time - this.runtime.lockStartedAt < 220) {
      return;
    }

    if (dialogueActive && dialogueSnapshot?.text) {
      this.showDialogueSnapshot(dialogueSnapshot);
      this.runtime.lockStartedAt = time;
      return;
    }

    if (challengeActive && challengeSnapshot?.active) {
      this.runtime.lockStartedAt = time;
      return;
    }

    if (dialogueActive && typeof this.services.dialogueSystem?.close === 'function') {
      this.services.dialogueSystem.close({ source: 'stale-lock' });
      this.hideDialogueUi();
    }

    this.clearAllLocks();
  }

  syncObjectiveMarkers(time = 0) {
    if (this.runtime.hubMarkers?.length) {
      this.runtime.hubMarkers.forEach((entry) => {
        entry.marker.setVisible(false);
        entry.marker.setAlpha(0);
      });
    }

    if (!this.objectiveMarkers?.length) {
      return;
    }

    const wave = time / 220;

    this.objectiveMarkers.forEach((entry) => {
      const { marker, offsetY, index } = entry;
      const target = this.getObjectiveMarkerTarget(entry);

      if (!target || !entry.isActive()) {
        marker.setVisible(false);
        marker.setAlpha(0);
        return;
      }

      if (!target.visible || !target.active) {
        marker.setVisible(false);
        marker.setAlpha(0);
        return;
      }

      const anchor = this.getObjectiveMarkerAnchor(target, offsetY);
      const offset = Math.sin(wave + index * 0.8) * 8;

      marker.setVisible(true);
      marker.setAlpha(0.96);
      marker.setPosition(anchor.x, anchor.y + offset);
      marker.setScale(1 + Math.sin(wave + index * 0.8) * 0.04);
    });
  }

  hasListeners(eventName) {
    const events = this.game?.events;
    if (!events) {
      return false;
    }

    if (typeof events.listenerCount === 'function') {
      return events.listenerCount(eventName) > 0;
    }
    if (typeof events.listeners === 'function') {
      return events.listeners(eventName).length > 0;
    }

    return false;
  }

  emitIfHandled(eventName, payload) {
    if (!this.hasListeners(eventName)) {
      return false;
    }

    this.game.events.emit(eventName, payload);
    return true;
  }

  emitGameEvent(eventName, payload) {
    this.game.events.emit(eventName, payload);
  }

  emitBeat(id, payload = {}) {
    this.emitGameEvent('gameplay:beat', {
      id,
      ...payload,
    });
  }

  getFlag(flag) {
    const state = this.services.gameState;
    const root = this.getGameStateRoot();

    if (typeof state?.getFlag === 'function') {
      const value = state.getFlag(flag);
      if (value !== undefined) {
        return Boolean(value);
      }
    }
    if (typeof state?.hasFlag === 'function') {
      return Boolean(state.hasFlag(flag));
    }
    if (root?.flags && flag in root.flags) {
      return Boolean(root.flags[flag]);
    }

    return Boolean(this.runtime.fallbackState.flags.get(flag));
  }

  setFlag(flag, value = true) {
    this.runtime.fallbackState.flags.set(flag, value);

    const state = this.services.gameState;
    const root = this.getGameStateRoot();

    if (typeof state?.setFlag === 'function') {
      state.setFlag(flag, value);
    }

    if (typeof state?.setStoryFlag === 'function') {
      state.setStoryFlag(flag, value);
    }

    if (typeof state?.updateFlag === 'function') {
      state.updateFlag(flag, value);
    }

    if (root?.flags) {
      root.flags[flag] = value;
      state?.emit?.('flag-change', {
        flag,
        value,
        state: typeof state?.getSnapshot === 'function' ? state.getSnapshot() : root,
      });
      state?.emit?.('change');
    }

    this.registry.set(`flag:${flag}`, value);
    return value;
  }

  isTaskComplete(taskId) {
    if (typeof this.services.taskSystem?.isTaskComplete === 'function') {
      return Boolean(this.services.taskSystem.isTaskComplete(taskId));
    }

    const state = this.services.gameState;
    const root = this.getGameStateRoot();
    if (typeof state?.isTaskComplete === 'function') {
      return Boolean(state.isTaskComplete(taskId));
    }
    if (typeof state?.hasTaskCompleted === 'function') {
      return Boolean(state.hasTaskCompleted(taskId));
    }
    if (typeof state?.getTaskState === 'function') {
      return state.getTaskState(taskId)?.status === 'completed';
    }
    if (root?.tasks && taskId in root.tasks) {
      const value = root.tasks[taskId];
      if (value && typeof value === 'object') {
        return value.status === 'completed' || Boolean(value.complete);
      }
      return Boolean(value);
    }

    return Boolean(this.runtime.fallbackState.tasks.get(taskId));
  }

  setTaskComplete(taskId, value = true, meta = {}) {
    this.runtime.fallbackState.tasks.set(taskId, value);

    const state = this.services.gameState;
    const root = this.getGameStateRoot();
    if (value && typeof this.services.taskSystem?.completeTask === 'function') {
      this.services.taskSystem.completeTask(taskId, meta);
    } else if (value && typeof state?.setTaskState === 'function') {
      state.setTaskState(taskId, {
        status: 'completed',
        completedAt: meta.completedAt || new Date().toISOString(),
        meta,
      });
    } else if (value && typeof state?.completeTask === 'function') {
      state.completeTask(taskId);
    } else if (typeof state?.setTaskComplete === 'function') {
      state.setTaskComplete(taskId, value);
    } else if (typeof state?.markTaskComplete === 'function') {
      state.markTaskComplete(taskId, value);
    } else if (root?.tasks) {
      root.tasks[taskId] = value
        ? {
          ...(root.tasks[taskId] || {}),
          status: 'completed',
          completedAt: meta.completedAt || new Date().toISOString(),
          meta,
        }
        : false;
    }

    this.registry.set(`task:${taskId}`, value);
  }

  allTasksComplete() {
    if (typeof this.services.taskSystem?.areAllTasksComplete === 'function') {
      return Boolean(this.services.taskSystem.areAllTasksComplete());
    }

    const state = this.services.gameState;
    if (typeof state?.areAllTasksComplete === 'function') {
      return Boolean(state.areAllTasksComplete());
    }
    if (typeof state?.allTasksComplete === 'function') {
      return Boolean(state.allTasksComplete());
    }

    return TASK_ID_LIST.every((taskId) => this.isTaskComplete(taskId));
  }

  refreshProgressBarrierState() {
    this.progressBarriers.forEach((entry) => {
      const { barrier, reminderTrigger, definition } = entry;
      const unlocked = this.getFlag(definition.unlockFlag);

      if (reminderTrigger?.body) {
        reminderTrigger.body.enable = !unlocked;
      }
      if (reminderTrigger) {
        reminderTrigger.active = !unlocked;
      }

      if (barrier?.body) {
        barrier.body.enable = !unlocked;
      }

      if (unlocked) {
        barrier.setVisible(false);
        barrier.setAlpha(0);
      } else {
        barrier.setVisible(true);
        barrier.setAlpha(definition.lockedAlpha ?? 0.9);
        if (!definition.textureKey) {
          this.setRenderableTint(barrier, definition.lockedColor);
        } else if (typeof barrier.clearTint === 'function') {
          barrier.clearTint();
        }
      }

      entry.isUnlocked = unlocked;
    });
  }

  setObjective(objectiveKey, options = {}) {
    if (!OBJECTIVES[objectiveKey]) {
      return;
    }

    const force = options.force === true;
    const objectiveText = options.text || this.resolveObjectiveText(objectiveKey);

    if (
      !force
      && (
      this.runtime.currentObjectiveKey === objectiveKey
      && this.runtime.currentObjectiveText === objectiveText
      )
    ) {
      return;
    }

    this.runtime.currentObjectiveKey = objectiveKey;
    this.runtime.currentObjectiveText = objectiveText;
    this.runtime.fallbackState.objectiveKey = objectiveKey;
    const payload = {
      key: objectiveKey,
      ...OBJECTIVES[objectiveKey],
      text: objectiveText,
    };

    const state = this.services.gameState;
    const root = this.getGameStateRoot();
    if (typeof this.services.taskSystem?.setBeat === 'function') {
      this.services.taskSystem.setBeat(payload.id, { syncObjective: false });
    } else if (typeof state?.setCurrentBeat === 'function') {
      state.setCurrentBeat(payload.id);
    }

    if (typeof state?.setCurrentObjective === 'function') {
      state.setCurrentObjective(payload.text, payload.id);
    } else if (typeof state?.setObjective === 'function') {
      state.setObjective(payload.id);
    } else if (typeof state?.setObjectiveKey === 'function') {
      state.setObjectiveKey(payload.id);
    } else if (root?.ui) {
      root.ui.currentObjective = payload.text;
      root.ui.currentObjectiveId = payload.id;
    }

    this.registry.set('objective', payload);
    this.emitGameEvent('gameplay:objective', payload);
  }

  setPrompt(prompt) {
    const signature = prompt ? `${prompt.id}:${prompt.text}` : null;
    if (signature === this.runtime.currentPromptSignature) {
      return;
    }

    this.runtime.currentPromptSignature = signature;
    this.runtime.fallbackState.prompt = prompt;

    const state = this.services.gameState;
    const root = this.getGameStateRoot();
    const promptText = prompt?.text || '';

    if (typeof state?.setInteractionPrompt === 'function') {
      state.setInteractionPrompt(promptText, prompt?.id || null);
    } else if (typeof state?.setPrompt === 'function') {
      state.setPrompt(promptText);
    } else if (typeof state?.setInteractPrompt === 'function') {
      state.setInteractPrompt(promptText);
    } else if (typeof state?.setPromptState === 'function') {
      state.setPromptState({
        text: promptText,
        key: prompt?.key || 'E',
      });
    } else if (root?.ui) {
      root.ui.interactionPrompt = promptText;
    }

    this.registry.set('prompt', prompt);
    this.emitGameEvent('gameplay:prompt', prompt);
  }

  setUiLocked(locked) {
    this.runtime.fallbackState.uiLocked = locked;

    const state = this.services.gameState;
    const root = this.getGameStateRoot();
    if (typeof state?.setUiLocked === 'function') {
      state.setUiLocked(locked);
    } else if (typeof state?.setCanMove === 'function') {
      state.setCanMove(!locked);
    } else if (typeof state?.setInputLocked === 'function') {
      state.setInputLocked(locked);
    } else if (typeof state?.setDialogueOpen === 'function') {
      state.setDialogueOpen(locked);
    } else if (root?.ui) {
      root.ui.locked = locked;
      root.ui.canMove = !locked;
    }

    this.registry.set('uiLocked', locked);
  }

  shouldUseFallbackUi() {
    return !this.scene.isActive('UIScene');
  }

  syncFallbackUi() {
    if (!this.fallbackUi || !this.sys?.isActive()) {
      return;
    }

    const showFallback = this.shouldUseFallbackUi();
    Object.values(this.fallbackUi).forEach((entry) => {
      if (!entry?.scene || entry.active === false) {
        return;
      }
      entry.setVisible(showFallback);
    });

    if (!showFallback) {
      return;
    }

    const prompt = this.runtime.fallbackState.prompt;
    const objectiveText = this.fallbackUi.objectiveText;
    const taskText = this.fallbackUi.taskText;
    const promptText = this.fallbackUi.promptText;
    const promptBackground = this.fallbackUi.promptBackground;

    if (
      !objectiveText?.scene
      || !taskText?.scene
      || !promptText?.scene
      || !promptBackground?.scene
      || objectiveText.active === false
      || taskText.active === false
      || promptText.active === false
      || promptBackground.active === false
    ) {
      return;
    }

    objectiveText.setText(this.runtime.currentObjectiveText || '');
    taskText.setText(
      `Actions: ${TASK_ID_LIST.map((taskId) => `${this.isTaskComplete(taskId) ? '[x]' : '[ ]'} ${taskId}`).join('   ')}`
    );
    promptText.setText(prompt ? `[${prompt.key || 'E'}] ${prompt.text}` : '');
    promptBackground.setVisible(showFallback && Boolean(prompt));
    promptText.setVisible(showFallback && Boolean(prompt));
  }
}

export default GameScene;
