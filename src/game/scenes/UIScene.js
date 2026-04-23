import Phaser from 'phaser';
import ChallengeBox from '../prefabs/ChallengeBox';
import DialogueBox from '../prefabs/DialogueBox';
import ObjectivePanel from '../prefabs/ObjectivePanel';
import { TASK_IDS, WORLD_FLAGS, WORLD_LAYOUT } from '../data/layout';
import { playOptionalSound } from '../utils/audio';

const DEFAULT_OBJECTIVE = 'Read the village sign.';

const DEFAULT_TASKS = [
  { id: 'listen', label: 'Listen', complete: false, status: 'locked' },
  { id: 'document', label: 'Record', complete: false, status: 'locked' },
  { id: 'repair', label: 'Repair', complete: false, status: 'locked' },
];

const ADVANCE_INPUT_COOLDOWN_MS = 150;

const OBJECTIVE_LABELS = Object.freeze({
  intro: 'Read the village sign.',
  farmer: 'Hear Tatay Ramon out.',
  crops: 'Inspect the dead crops.',
  canal: 'Inspect the irrigation canal.',
  family: 'See what the failed harvest does at home.',
  reflection: 'Continue forward and reflect.',
  hub: 'Join the response: listen, record, and help repair.',
  ending: 'Walk toward the field.',
  arrivalTutorial: 'Read the village sign.',
  meetFarmer: 'Hear Tatay Ramon out.',
  inspectIrrigation: 'Inspect the irrigation canal.',
  witnessFamilyBurden: 'See what the failed harvest does at home.',
  helpHub: 'Join the response: listen, record, and help repair.',
  returnToFarmer: 'Walk toward the field.',
});

function isEmitter(value) {
  return Boolean(value)
    && typeof value.on === 'function'
    && typeof value.off === 'function'
    && typeof value.emit === 'function';
}

function getGlobalSharedRoot() {
  return globalThis.__WWDC_GAME__
    || globalThis.__WHEN_THE_WATER_DOESNT_COME__
    || globalThis.__WHEN_THE_WATER_DOES_NOT_COME__
    || null;
}

function collectEmitters(source) {
  const emitters = [source, source?.events, source?.emitter, source?.eventEmitter].filter(isEmitter);
  return Array.from(new Set(emitters));
}

function getDefaultIconKey(taskId) {
  if (!taskId) {
    return null;
  }

  return `task-${taskId}`;
}

function getStateSnapshot(source) {
  if (!source) {
    return {};
  }

  if (typeof source.getSnapshot === 'function') {
    return source.getSnapshot();
  }

  if (typeof source.getState === 'function') {
    return source.getState();
  }

  return source.state || source;
}

function subscribeToSource(source, eventNames, handler, subscriptions) {
  if (!source) {
    return;
  }

  const names = Array.isArray(eventNames) ? eventNames : [eventNames];

  if (typeof source.subscribe === 'function') {
    names.forEach((eventName) => {
      const unsubscribe = source.subscribe(eventName, handler);
      subscriptions.push({ unsubscribe });
    });
    return;
  }

  if (typeof source.addEventListener === 'function' && typeof source.removeEventListener === 'function') {
    names.forEach((eventName) => {
      const listener = (event) => handler(event.detail ?? event);
      source.addEventListener(eventName, listener);
      subscriptions.push({ source, eventName, listener, mode: 'event-target' });
    });
    return;
  }

  collectEmitters(source).forEach((emitter) => {
    names.forEach((eventName) => {
      emitter.on(eventName, handler);
      subscriptions.push({ emitter, eventName, handler, mode: 'emitter' });
    });
  });
}

function resolveSharedValue(scene, data = {}, keys = []) {
  const root = getGlobalSharedRoot();
  const sources = [data, scene.registry, scene.game, root].filter(Boolean);

  for (const key of keys) {
    for (const source of sources) {
      if (source && typeof source.get === 'function') {
        const value = source.get(key);

        if (value) {
          return value;
        }
      }

      if (source && source[key]) {
        return source[key];
      }
    }
  }

  return null;
}

function normalizeTasks(tasks) {
  if (Array.isArray(tasks) && tasks.length) {
    return tasks.map((task, index) => ({
      id: task.id || DEFAULT_TASKS[index]?.id || `task-${index + 1}`,
      label: task.label || task.shortLabel || task.text || DEFAULT_TASKS[index]?.label || `Task ${index + 1}`,
      summary: task.summary || task.description || '',
      complete: Boolean(task.complete || task.done || task.completed || task.isCompleted || task.status === 'completed'),
      status: task.status || (task.complete || task.completed ? 'completed' : 'locked'),
      iconKey: task.iconKey || getDefaultIconKey(task.id || DEFAULT_TASKS[index]?.id),
    }));
  }

  if (tasks && typeof tasks === 'object') {
    return DEFAULT_TASKS.map((task) => {
      const value = tasks[task.id];

      if (value && typeof value === 'object') {
        return {
          id: task.id,
          label: value.label || value.shortLabel || value.text || task.label,
          summary: value.summary || value.description || '',
          complete: Boolean(
            value.complete
              || value.done
              || value.completed
              || value.isCompleted
              || value.status === 'completed'
          ),
          status: value.status || (value.complete || value.completed ? 'completed' : 'locked'),
          iconKey: value.iconKey || getDefaultIconKey(task.id),
        };
      }

      return {
        id: task.id,
        label: task.label,
        summary: '',
        complete: Boolean(value),
        status: value ? 'completed' : 'locked',
        iconKey: getDefaultIconKey(task.id),
      };
    });
  }

  return DEFAULT_TASKS.map((task) => ({ ...task, iconKey: getDefaultIconKey(task.id) }));
}

function parsePrompt(payload) {
  if (!payload) {
    return null;
  }

  if (typeof payload === 'string') {
    return { text: payload, key: 'E', position: null };
  }

  return {
    text: payload.text || payload.prompt || payload.label || payload.message || '',
    key: payload.key || payload.button || 'E',
    position: payload.position || payload.worldPosition || null,
  };
}

function parseDialogue(payload) {
  if (!payload) {
    return null;
  }

  const source = payload.dialogue || payload;

  if (Array.isArray(source.lines) && source.lines.length) {
    return {
      speaker: source.speaker || source.name || '',
      body: source.lines.join('\n'),
      continueText: source.continueText,
      showContinue: source.showContinue,
      canContinue: source.canContinue,
      lineIndex: source.lineIndex,
      totalLines: source.totalLines,
    };
  }

  return {
    speaker: source.speaker || source.name || '',
    body: source.body || source.text || '',
    continueText: source.continueText || source.promptText,
    showContinue: source.showContinue,
    canContinue: source.canContinue,
    lineIndex: source.lineIndex,
    totalLines: source.totalLines,
  };
}

function parseNarration(payload) {
  if (!payload) {
    return null;
  }

  if (typeof payload === 'string') {
    return { text: payload };
  }

  const source = payload.narration || payload;

  return {
    text: source.text || source.body || source.message || '',
    duration: source.duration || 0,
  };
}

function resolveObjectiveLabel(value) {
  if (typeof value !== 'string' || !value.trim()) {
    return DEFAULT_OBJECTIVE;
  }

  return OBJECTIVE_LABELS[value] || value;
}

function safeCall(target, methodNames) {
  if (!target) {
    return false;
  }

  return methodNames.some((methodName) => {
    if (typeof target[methodName] !== 'function') {
      return false;
    }

    target[methodName]();
    return true;
  });
}

function capitalize(value = '') {
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : '';
}

function getNotificationPalette(tone = 'default') {
  switch (tone) {
    case 'warning':
      return {
        fill: 0x2f2116,
        border: 0xd5a56a,
        accent: 0xe7bd80,
        title: '#f4e0bb',
        body: '#eadbc1',
      };
    case 'hope':
      return {
        fill: 0x163022,
        border: 0x8bc08b,
        accent: 0xb9efaa,
        title: '#ecf7df',
        body: '#d7ead2',
      };
    case 'task':
      return {
        fill: 0x142734,
        border: 0xd7c07b,
        accent: 0xf0e2aa,
        title: '#f6ecd1',
        body: '#dce8ef',
      };
    default:
      return {
        fill: 0x102430,
        border: 0xa8bfd0,
        accent: 0xdce8ef,
        title: '#edf5fa',
        body: '#d2dde5',
      };
  }
}

export class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');

    this.subscriptions = [];
    this.narrationTimer = null;
    this.notificationTimer = null;
    this.notificationQueue = [];
    this.objectiveNoticeQueue = [];
    this.objectiveNoticeActive = false;
    this.objectiveNoticeOwnsPause = false;
    this.activePrompt = null;
    this.currentDialogueSignature = null;
    this.currentChallengeSignature = null;
    this.currentChallengeSnapshot = null;
    this.lastObjectiveNotice = null;
    this.currentObjectiveText = DEFAULT_OBJECTIVE;
    this.advanceInputCooldownUntil = 0;
  }

  create(data = {}) {
    this.gameState = resolveSharedValue(this, data, ['gameState', 'GameState', 'sharedState', 'state']);
    this.dialogueSystem = data.dialogueSystem || resolveSharedValue(this, data, ['dialogueSystem', 'DialogueSystem']);
    this.taskSystem = data.taskSystem || resolveSharedValue(this, data, ['taskSystem', 'TaskSystem']);
    this.challengeSystem = data.challengeSystem || resolveSharedValue(this, data, ['challengeSystem', 'ChallengeSystem']);

    this.buildOverlay();
    this.bindInput();
    this.bindSources();
    this.syncFromState();

    this.scene.bringToTop('UIScene');
    this.scale.on('resize', this.handleResize, this);
    this.events.once('shutdown', this.handleShutdown, this);
  }

  update() {
    this.syncPromptPosition();
    this.syncDirectionGuide();
  }

  buildOverlay() {
    const { width, height } = this.scale;

    this.pulseRect = this.add.rectangle(0, 0, width, height, 0x081015, 0);
    this.pulseRect.setOrigin(0, 0);
    this.pulseRect.setAlpha(0);
    this.pulseRect.setScrollFactor(0);
    this.pulseRect.setDepth(6);

    this.flashRect = this.add.rectangle(0, 0, width, height, 0xffffff, 0);
    this.flashRect.setOrigin(0, 0);
    this.flashRect.setAlpha(0);
    this.flashRect.setScrollFactor(0);
    this.flashRect.setDepth(7);

    this.narrationDim = this.add.rectangle(0, 0, width, height, 0x050b11, 0);
    this.narrationDim.setOrigin(0, 0);
    this.narrationDim.setAlpha(0);
    this.narrationDim.setScrollFactor(0);
    this.narrationDim.setDepth(18);

    this.narrationPanel = this.add.rectangle(width / 2, height * 0.28, Math.min(820, width - 48), 150, 0x102430, 0);
    this.narrationPanel.setStrokeStyle(2, 0xd8bf79, 0);
    this.narrationPanel.setAlpha(0);
    this.narrationPanel.setScrollFactor(0);
    this.narrationPanel.setDepth(25);

    this.narrationLabel = this.add.text(width / 2, height * 0.28 - 42, 'Narration', {
      fontFamily: '"Courier New", monospace',
      fontSize: '13px',
      color: '#d8bf79',
      align: 'center',
    });
    this.narrationLabel.setOrigin(0.5);
    this.narrationLabel.setAlpha(0);
    this.narrationLabel.setDepth(26);
    this.narrationLabel.setScrollFactor(0);

    this.narrationText = this.add.text(width / 2, height * 0.28 + 6, '', {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: '28px',
      color: '#f6ecd1',
      align: 'center',
      lineSpacing: 10,
      wordWrap: { width: Math.min(760, width - 96), useAdvancedWrap: true },
    });
    this.narrationText.setOrigin(0.5);
    this.narrationText.setAlpha(0);
    this.narrationText.setDepth(26);
    this.narrationText.setScrollFactor(0);

    this.dialogueBox = new DialogueBox(
      this,
      width / 2,
      height - 114,
      Math.min(920, width - 36),
      Math.min(196, Math.max(170, height * 0.24)),
    );

    this.challengeDim = this.add.rectangle(0, 0, width, height, 0x04080d, 0);
    this.challengeDim.setOrigin(0, 0);
    this.challengeDim.setAlpha(0);
    this.challengeDim.setVisible(false);
    this.challengeDim.setScrollFactor(0);
    this.challengeDim.setDepth(29);

    this.challengeBox = new ChallengeBox(
      this,
      width / 2,
      height * 0.56,
      Math.min(700, width - 36),
      Math.min(470, height - 88),
    );
    this.challengeBox.setChoiceHandler((index) => {
      this.getChallengeSystem()?.submitSelection?.(index);
    });

    this.objectivePanel = new ObjectivePanel(this, 16, 16, Math.min(368, width - 32), {
      objective: DEFAULT_OBJECTIVE,
      tasks: DEFAULT_TASKS,
    });

    this.promptBackdrop = this.add.rectangle(0, 0, 192, 38, 0x102430, 0.94);
    this.promptBackdrop.setStrokeStyle(1, 0xd7c07b, 0.72);
    this.promptBackdrop.setOrigin(0.5);

    this.promptKeyCap = this.add.rectangle(-58, 0, 42, 24, 0xd7c07b, 1);
    this.promptKeyCap.setOrigin(0.5);

    this.promptKeyText = this.add.text(-58, 0, 'E', {
      fontFamily: '"Courier New", monospace',
      fontSize: '14px',
      color: '#102430',
      align: 'center',
    });
    this.promptKeyText.setOrigin(0.5);

    this.promptLabel = this.add.text(-24, 0, '', {
      fontFamily: '"Trebuchet MS", Helvetica, sans-serif',
      fontSize: '15px',
      color: '#f7f2dd',
      align: 'left',
    });
    this.promptLabel.setOrigin(0, 0.5);

    this.promptContainer = this.add.container(width / 2, height - 236, [
      this.promptBackdrop,
      this.promptKeyCap,
      this.promptKeyText,
      this.promptLabel,
    ]);
    this.promptContainer.setScrollFactor(0);
    this.promptContainer.setDepth(22);
    this.promptContainer.setVisible(false);
    this.promptContainer.setAlpha(0);

    this.promptTween = this.tweens.add({
      targets: this.promptKeyCap,
      scaleX: 1.06,
      scaleY: 1.06,
      alpha: { from: 0.86, to: 1 },
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.directionGuideBackdrop = this.add.rectangle(0, 0, 152, 44, 0x102430, 0.9);
    this.directionGuideBackdrop.setStrokeStyle(1, 0xd7c07b, 0.72);
    this.directionGuideBackdrop.setOrigin(0.5);

    this.directionGuideArrow = this.add.text(-40, 0, '>>>', {
      fontFamily: '"Courier New", monospace',
      fontSize: '16px',
      color: '#f2d7a1',
      align: 'center',
    });
    this.directionGuideArrow.setOrigin(0.5);

    this.directionGuideLabel = this.add.text(-8, 0, 'MOVE RIGHT', {
      fontFamily: '"Courier New", monospace',
      fontSize: '13px',
      color: '#f7f2dd',
      align: 'left',
    });
    this.directionGuideLabel.setOrigin(0, 0.5);

    this.directionGuideContainer = this.add.container(width - 112, height - 108, [
      this.directionGuideBackdrop,
      this.directionGuideArrow,
      this.directionGuideLabel,
    ]);
    this.directionGuideContainer.setScrollFactor(0);
    this.directionGuideContainer.setDepth(21);
    this.directionGuideContainer.setVisible(false);
    this.directionGuideContainer.setAlpha(0);

    this.directionGuideTween = this.tweens.add({
      targets: this.directionGuideArrow,
      x: -34,
      duration: 560,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.notificationAccent = this.add.rectangle(0, 0, 10, 58, 0xdce8ef, 1);
    this.notificationAccent.setOrigin(0, 0);

    this.notificationBackdrop = this.add.rectangle(0, 0, Math.min(340, width - 36), 72, 0x102430, 0.95);
    this.notificationBackdrop.setOrigin(0.5);
    this.notificationBackdrop.setStrokeStyle(1, 0xa8bfd0, 0.85);

    this.notificationTitle = this.add.text(0, 0, '', {
      fontFamily: '"Courier New", monospace',
      fontSize: '12px',
      color: '#edf5fa',
    });
    this.notificationTitle.setOrigin(0, 0);

    this.notificationBody = this.add.text(0, 0, '', {
      fontFamily: '"Trebuchet MS", Helvetica, sans-serif',
      fontSize: '15px',
      color: '#dce8ef',
      wordWrap: { width: Math.min(272, width - 84), useAdvancedWrap: true },
      lineSpacing: 4,
    });
    this.notificationBody.setOrigin(0, 0);

    this.notificationContainer = this.add.container(width / 2, 92, [
      this.notificationBackdrop,
      this.notificationAccent,
      this.notificationTitle,
      this.notificationBody,
    ]);
    this.notificationContainer.setScrollFactor(0);
    this.notificationContainer.setDepth(24);
    this.notificationContainer.setVisible(false);
    this.notificationContainer.setAlpha(0);

    this.objectiveNoticeDim = this.add.rectangle(0, 0, width, height, 0x04080d, 0);
    this.objectiveNoticeDim.setOrigin(0, 0);
    this.objectiveNoticeDim.setAlpha(0);
    this.objectiveNoticeDim.setScrollFactor(0);
    this.objectiveNoticeDim.setDepth(27);

    this.objectiveNoticeBackdrop = this.add.rectangle(0, 0, Math.min(620, width - 24), 188, 0x102430, 0.98);
    this.objectiveNoticeBackdrop.setOrigin(0.5);
    this.objectiveNoticeBackdrop.setStrokeStyle(2, 0xd7c07b, 0.85);

    this.objectiveNoticeLabel = this.add.text(0, 0, 'Objective Updated', {
      fontFamily: '"Courier New", monospace',
      fontSize: '13px',
      color: '#d8c792',
      align: 'center',
    });
    this.objectiveNoticeLabel.setOrigin(0.5);

    this.objectiveNoticeText = this.add.text(0, 0, '', {
      fontFamily: '"Trebuchet MS", Helvetica, sans-serif',
      fontSize: '28px',
      color: '#f6ecd1',
      align: 'center',
      lineSpacing: 8,
      wordWrap: { width: Math.min(540, width - 80), useAdvancedWrap: true },
    });
    this.objectiveNoticeText.setOrigin(0.5);

    this.objectiveNoticeContinue = this.add.text(0, 0, 'Continue  ENTER / SPACE', {
      fontFamily: '"Courier New", monospace',
      fontSize: '13px',
      color: '#dce8ef',
      align: 'center',
    });
    this.objectiveNoticeContinue.setOrigin(0.5);

    this.objectiveNoticeContainer = this.add.container(width / 2, height * 0.42, [
      this.objectiveNoticeBackdrop,
      this.objectiveNoticeLabel,
      this.objectiveNoticeText,
      this.objectiveNoticeContinue,
    ]);
    this.objectiveNoticeContainer.setScrollFactor(0);
    this.objectiveNoticeContainer.setDepth(28);
    this.objectiveNoticeContainer.setVisible(false);
    this.objectiveNoticeContainer.setAlpha(0);

    this.layoutObjectiveNotice(width, height);
  }

  bindInput() {
    this.advanceHandler = (event) => {
      const challengeSystem = this.getChallengeSystem();
      const challengeSnapshot = challengeSystem?.getSnapshot?.() || this.currentChallengeSnapshot;

      if (challengeSnapshot?.active) {
        if (challengeSnapshot.type === 'choiceQuiz') {
          if (event.code === 'ArrowUp' || event.code === 'KeyW') {
            event.preventDefault();
            challengeSystem.moveSelection?.(-1);
            return;
          }

          if (event.code === 'ArrowDown' || event.code === 'KeyS') {
            event.preventDefault();
            challengeSystem.moveSelection?.(1);
            return;
          }

          if ((event.code === 'Enter' || event.code === 'Space') && !event.repeat) {
            event.preventDefault();
            challengeSystem.submitSelection?.();
          }
          return;
        }

        if (
          challengeSnapshot.type === 'actionMeter'
          && !event.repeat
          && ['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD'].includes(event.code)
        ) {
          event.preventDefault();
          challengeSystem.registerMeterInput?.(event.code, Date.now());
          return;
        }

        return;
      }

      const interactiveKeys = ['Space', 'Enter'];
      const isInteractiveKey = interactiveKeys.includes(event.code);

      if (!isInteractiveKey) {
        return;
      }

      event.preventDefault();

      if (event.repeat || this.time.now < this.advanceInputCooldownUntil) {
        return;
      }

      if (this.objectiveNoticeActive) {
        this.advanceInputCooldownUntil = this.time.now + ADVANCE_INPUT_COOLDOWN_MS;
        this.dismissObjectiveNotice();
        return;
      }

      if (this.dialogueBox.visible) {
        if (!this.dialogueBox.isReadyToAdvance()) {
          return;
        }

        this.advanceInputCooldownUntil = this.time.now + ADVANCE_INPUT_COOLDOWN_MS;
        this.requestDialogueAdvance();
      }
    };

    this.input.keyboard.on('keydown', this.advanceHandler);
  }

  bindSources() {
    const syncHandler = (payload) => {
      this.syncFromState(payload?.state || payload);
    };

    subscribeToSource(
      this.gameState,
      ['change', 'reset', 'objective-change', 'task-change', 'prompt-change', 'dialogue-open', 'dialogue-close', 'narration-change'],
      syncHandler,
      this.subscriptions,
    );

    [
      { source: this.dialogueSystem, events: [[['dialogue:start', 'dialogue:show'], this.showDialogue.bind(this)], [['dialogue:end', 'dialogue:hide'], this.hideDialogue.bind(this)]] },
      { source: this.taskSystem, events: [[['tasks:update', 'task:update', 'task:complete'], this.setTasks.bind(this)]] },
      {
        source: this.game.events,
        events: [
          [['ui:objective:update'], this.setObjective.bind(this)],
          [['ui:tasks:update'], this.setTasks.bind(this)],
          [['ui:prompt:show'], this.showInteractionPrompt.bind(this)],
          [['ui:prompt:hide'], this.hideInteractionPrompt.bind(this)],
          [['ui:dialogue:show'], this.showDialogue.bind(this)],
          [['ui:dialogue:hide'], this.hideDialogue.bind(this)],
          [['ui:challenge:show', 'ui:challenge:update'], this.showChallenge.bind(this)],
          [['ui:challenge:hide'], this.hideChallenge.bind(this)],
          [['ui:narration:show'], this.showNarration.bind(this)],
          [['ui:narration:hide'], this.hideNarration.bind(this)],
          [['run:reset', 'ui:reset'], this.resetUI.bind(this)],
          [['gameplay:objective'], this.handleObjectiveEvent.bind(this)],
          [['gameplay:objective-reminder'], this.handleObjectiveReminder.bind(this)],
          [['gameplay:task-complete'], this.handleTaskComplete.bind(this)],
          [['gameplay:challenge-complete'], this.handleChallengeComplete.bind(this)],
          [['world:revealShadow'], this.handleCanalReveal.bind(this)],
          [['world:startWater'], this.handleWaterStart.bind(this)],
          [['world:unlockEnding'], this.handleEndingUnlock.bind(this)],
          [['ending:trigger', 'ending:start'], this.handleEndingTriggered.bind(this)],
        ],
      },
    ].forEach(({ source, events }) => {
      events.forEach(([eventNames, handler]) => {
        subscribeToSource(source, eventNames, handler, this.subscriptions);
      });
    });
  }

  syncFromState(snapshot = null) {
    const state = getStateSnapshot(snapshot || this.gameState);
    const ui = state.ui || {};

    const taskSnapshot = typeof this.taskSystem?.getSnapshot === 'function' ? this.taskSystem.getSnapshot().tasks : null;
    const objective = ui.currentObjective || ui.objective || state.objective || state.currentObjective || DEFAULT_OBJECTIVE;
    const tasks = ui.tasks || taskSnapshot || state.tasks || state.taskProgress || DEFAULT_TASKS;
    const prompt = ui.interactionPrompt || state.interactionPrompt || null;
    const dialogue = ui.dialogue || state.dialogue || null;
    const challenge = ui.challenge || state.challenge || null;
    const narration = ui.narration || state.narration || null;

    this.setObjective(objective);
    this.setTasks(tasks);

    if (prompt) {
      this.showInteractionPrompt(prompt);
    } else {
      this.hideInteractionPrompt(true);
    }

    if (dialogue && (dialogue.visible || dialogue.active || dialogue.text || dialogue.body)) {
      this.showDialogue(dialogue);
    } else {
      this.hideDialogue(true);
    }

    if (challenge && (challenge.active || challenge.challengeId)) {
      this.showChallenge(challenge);
    } else {
      this.hideChallenge(true);
    }

    if (narration && (narration.visible || narration.text || narration.body)) {
      this.showNarration(narration);
    } else {
      this.hideNarration(true);
    }
  }

  setObjective(payload) {
    if (payload?.state) {
      this.syncFromState(payload.state);
      return;
    }

    const objective = typeof payload === 'string'
      ? payload
      : payload?.currentObjective || payload?.objective || payload?.text || payload?.label || payload?.objectiveId || DEFAULT_OBJECTIVE;

    this.currentObjectiveText = resolveObjectiveLabel(objective);
    this.objectivePanel.setObjective(this.currentObjectiveText);
  }

  setTasks(payload) {
    if (payload?.state) {
      this.syncFromState(payload.state);
      return;
    }

    const tasks = payload?.tasks || payload;
    this.objectivePanel.setTasks(normalizeTasks(tasks));
  }

  getChallengeSystem() {
    if (!this.challengeSystem) {
      this.challengeSystem = resolveSharedValue(this, {}, ['challengeSystem', 'ChallengeSystem']);
    }

    return this.challengeSystem;
  }

  setTaskProgress(payload) {
    this.setTasks(payload);
  }

  showInteractionPrompt(payload) {
    if (payload?.state) {
      this.syncFromState(payload.state);
      return;
    }

    const prompt = parsePrompt(payload);

    if (!prompt || !prompt.text) {
      this.hideInteractionPrompt();
      return;
    }

    this.activePrompt = prompt;
    this.promptKeyText.setText(prompt.key);
    this.promptLabel.setText(prompt.text);
    this.promptBackdrop.setSize(Math.max(176, this.promptLabel.width + 104), 38);
    this.promptContainer.setVisible(true);
    this.syncPromptPosition();
    this.tweens.killTweensOf(this.promptContainer);
    this.tweens.add({
      targets: this.promptContainer,
      alpha: 1,
      duration: 130,
      ease: 'Quad.easeOut',
    });
  }

  showPrompt(payload) {
    this.showInteractionPrompt(payload);
  }

  hideInteractionPrompt(instant = false) {
    const shouldHideInstantly = typeof instant === 'boolean' ? instant : Boolean(instant?.instant);

    this.activePrompt = null;

    if (shouldHideInstantly) {
      this.promptContainer.setAlpha(0);
      this.promptContainer.setVisible(false);
      return;
    }

    this.tweens.killTweensOf(this.promptContainer);
    this.tweens.add({
      targets: this.promptContainer,
      alpha: 0,
      duration: 100,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.promptContainer.setVisible(false);
      },
    });
  }

  hidePrompt(instant = false) {
    this.hideInteractionPrompt(instant);
  }

  syncPromptPosition() {
    if (!this.activePrompt || !this.promptContainer.visible) {
      return;
    }

    const { width, height } = this.scale;
    const defaultX = width / 2;
    const defaultY = height - (this.dialogueBox.visible ? 240 : 72);

    if (!this.activePrompt.position || !this.scene.isActive('GameScene')) {
      this.promptContainer.setPosition(defaultX, defaultY);
      return;
    }

    const gameScene = this.scene.get('GameScene');
    const camera = gameScene?.cameras?.main;

    if (!camera) {
      this.promptContainer.setPosition(defaultX, defaultY);
      return;
    }

    const promptX = Phaser.Math.Clamp(
      this.activePrompt.position.x - camera.scrollX,
      this.promptBackdrop.width * 0.5 + 14,
      width - this.promptBackdrop.width * 0.5 - 14,
    );
    const promptY = Phaser.Math.Clamp(
      this.activePrompt.position.y - camera.scrollY,
      72,
      height - (this.dialogueBox.visible ? 242 : 74),
    );

    this.promptContainer.setPosition(promptX, promptY);
  }

  syncDirectionGuide() {
    if (!this.directionGuideContainer) {
      return;
    }

    if (this.scale.width < 700) {
      this.setDirectionGuideVisible(false);
      return;
    }

    const gameScene = this.scene.isActive('GameScene') ? this.scene.get('GameScene') : null;
    const player = gameScene?.player;

    if (
      !gameScene
      || !player
      || this.objectiveNoticeActive
      || this.objectiveNoticeContainer.visible
      || this.dialogueBox.visible
      || this.challengeBox.visible
      || this.narrationText.alpha > 0.02
    ) {
      this.setDirectionGuideVisible(false);
      return;
    }

    let targetX = null;
    let label = 'MOVE RIGHT';

    if (gameScene.getFlag?.(WORLD_FLAGS.ENDING_UNLOCKED)) {
      targetX = WORLD_LAYOUT.beats.ending;
      label = 'FIELD AHEAD';
    } else if (gameScene.getFlag?.(WORLD_FLAGS.REFLECTION_SEEN)) {
      const remainingTargets = [];

      if (!gameScene.isTaskComplete?.(TASK_IDS.LISTEN)) {
        remainingTargets.push(5050);
      }
      if (!gameScene.isTaskComplete?.(TASK_IDS.DOCUMENT)) {
        remainingTargets.push(5250);
      }
      if (!gameScene.isTaskComplete?.(TASK_IDS.REPAIR)) {
        remainingTargets.push(5720);
      }

      if (remainingTargets.length) {
        targetX = Math.max(...remainingTargets);
      }
    }

    if (!targetX || targetX - player.x < 260) {
      this.setDirectionGuideVisible(false);
      return;
    }

    if (this.directionGuideLabel.text !== label) {
      this.directionGuideLabel.setText(label);
      this.directionGuideBackdrop.setSize(Math.max(152, this.directionGuideLabel.width + 100), 44);
    }

    this.setDirectionGuideVisible(true);
  }

  setDirectionGuideVisible(visible) {
    if (!this.directionGuideContainer) {
      return;
    }

    if (!visible) {
      if (!this.directionGuideContainer.visible && this.directionGuideContainer.alpha === 0) {
        return;
      }

      this.tweens.killTweensOf(this.directionGuideContainer);
      this.tweens.add({
        targets: this.directionGuideContainer,
        alpha: 0,
        duration: 120,
        ease: 'Quad.easeIn',
        onComplete: () => {
          this.directionGuideContainer.setVisible(false);
        },
      });
      return;
    }

    if (this.directionGuideContainer.visible && this.directionGuideContainer.alpha >= 0.98) {
      return;
    }

    this.directionGuideContainer.setVisible(true);
    this.tweens.killTweensOf(this.directionGuideContainer);
    this.tweens.add({
      targets: this.directionGuideContainer,
      alpha: 1,
      duration: 150,
      ease: 'Quad.easeOut',
    });
  }

  showDialogue(payload) {
    if (payload?.state) {
      this.syncFromState(payload.state);
      return;
    }

    const dialogue = parseDialogue(payload);

    if (!dialogue || !dialogue.body) {
      return;
    }

    const signature = [
      dialogue.speaker || '',
      dialogue.body || '',
      dialogue.continueText || '',
      dialogue.lineIndex ?? '',
      dialogue.totalLines ?? '',
    ].join('::');

    this.hideInteractionPrompt(true);
    this.dialogueBox.show(dialogue, this.currentDialogueSignature === signature && this.dialogueBox.visible);
    this.currentDialogueSignature = signature;
  }

  hideDialogue(instant = false) {
    const shouldHideInstantly = typeof instant === 'boolean' ? instant : Boolean(instant?.instant);
    this.currentDialogueSignature = null;
    this.dialogueBox.hide(shouldHideInstantly);
  }

  showChallenge(payload) {
    if (payload?.state) {
      this.syncFromState(payload.state);
      return;
    }

    if (!payload?.active && !payload?.challengeId) {
      this.hideChallenge();
      return;
    }

    const signature = [
      payload.challengeId || '',
      payload.roundIndex ?? '',
      payload.selectedIndex ?? '',
      payload.meterProgress ?? '',
      payload.timeRemainingMs ?? '',
    ].join('::');

    this.currentChallengeSnapshot = payload;
    this.currentChallengeSignature = signature;
    this.hideDialogue(true);
    this.hideInteractionPrompt(true);

    const shouldAnimateIn = !this.challengeBox.visible;
    this.challengeDim.setVisible(true);
    this.challengeBox.show(payload);

    if (shouldAnimateIn || this.challengeDim.alpha < 0.84) {
      this.tweens.killTweensOf(this.challengeDim);
      this.tweens.add({
        targets: this.challengeDim,
        alpha: 0.86,
        duration: 140,
        ease: 'Quad.easeOut',
      });
    }
  }

  hideChallenge(instant = false) {
    const shouldHideInstantly = typeof instant === 'boolean' ? instant : Boolean(instant?.instant);

    this.currentChallengeSnapshot = null;
    this.currentChallengeSignature = null;

    if (shouldHideInstantly) {
      this.challengeDim.setAlpha(0);
      this.challengeDim.setVisible(false);
      this.challengeBox.hide(true);
      return;
    }

    this.tweens.killTweensOf(this.challengeDim);
    this.tweens.add({
      targets: this.challengeDim,
      alpha: 0,
      duration: 110,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.challengeDim.setVisible(false);
      },
    });
    this.challengeBox.hide(false);
  }

  showNarration(payload) {
    if (payload?.state) {
      this.syncFromState(payload.state);
      return;
    }

    const narration = parseNarration(payload);

    if (!narration || !narration.text) {
      return;
    }

    if (this.narrationTimer) {
      this.narrationTimer.remove(false);
      this.narrationTimer = null;
    }

    this.narrationText.setText(narration.text);
    this.tweens.killTweensOf([this.narrationDim, this.narrationPanel, this.narrationLabel, this.narrationText]);
    this.tweens.add({
      targets: [this.narrationDim, this.narrationPanel, this.narrationLabel, this.narrationText],
      alpha: 1,
      duration: 220,
      ease: 'Quad.easeOut',
    });

    if (narration.duration > 0) {
      this.narrationTimer = this.time.delayedCall(narration.duration, () => {
        this.hideNarration();
      });
    }
  }

  hideNarration(instant = false) {
    const shouldHideInstantly = typeof instant === 'boolean' ? instant : Boolean(instant?.instant);

    if (this.narrationTimer) {
      this.narrationTimer.remove(false);
      this.narrationTimer = null;
    }

    if (shouldHideInstantly) {
      this.narrationDim.setAlpha(0);
      this.narrationPanel.setAlpha(0);
      this.narrationLabel.setAlpha(0);
      this.narrationText.setAlpha(0);
      return;
    }

    this.tweens.killTweensOf([this.narrationDim, this.narrationPanel, this.narrationLabel, this.narrationText]);
    this.tweens.add({
      targets: [this.narrationDim, this.narrationPanel, this.narrationLabel, this.narrationText],
      alpha: 0,
      duration: 170,
      ease: 'Quad.easeIn',
    });
  }

  runScreenPulse({
    fillColor = 0x081015,
    peakAlpha = 0.28,
    flashColor = 0xffffff,
    flashAlpha = 0.04,
    duration = 320,
  } = {}) {
    this.pulseRect.setFillStyle(fillColor, 1);
    this.flashRect.setFillStyle(flashColor, 1);
    this.tweens.killTweensOf([this.pulseRect, this.flashRect]);
    this.pulseRect.setAlpha(0);
    this.flashRect.setAlpha(0);

    this.tweens.add({
      targets: this.pulseRect,
      alpha: { from: 0, to: peakAlpha },
      duration: duration * 0.45,
      yoyo: true,
      ease: 'Sine.easeInOut',
    });

    if (flashAlpha > 0) {
      this.tweens.add({
        targets: this.flashRect,
        alpha: { from: 0, to: flashAlpha },
        duration: duration * 0.25,
        yoyo: true,
        ease: 'Sine.easeOut',
      });
    }
  }

  enqueueNotification(payload = {}) {
    const notification = typeof payload === 'string'
      ? { title: payload, text: '', tone: 'default', duration: 1800 }
      : {
        title: payload.title || '',
        text: payload.text || '',
        tone: payload.tone || 'default',
        duration: payload.duration || 1800,
      };

    if (!notification.title && !notification.text) {
      return;
    }

    this.notificationQueue.push(notification);

    if (!this.notificationContainer.visible && !this.objectiveNoticeActive && !this.objectiveNoticeContainer.visible) {
      this.showNextNotification();
    }
  }

  layoutObjectiveNotice(width = this.scale.width, height = this.scale.height) {
    const compact = width < 720;
    const veryCompact = width < 520;
    const boxWidth = Math.min(compact ? width - 24 : 620, width - 24);
    const textWidth = boxWidth - (veryCompact ? 40 : 72);

    this.objectiveNoticeDim.setSize(width, height);
    this.objectiveNoticeContainer.setPosition(width / 2, compact ? height * 0.46 : height * 0.42);
    this.objectiveNoticeText.setFontSize(veryCompact ? 22 : compact ? 24 : 28);
    this.objectiveNoticeText.setWordWrapWidth(textWidth, true);

    const boxHeight = Math.max(compact ? 178 : 188, 118 + this.objectiveNoticeText.height);
    this.objectiveNoticeBackdrop.setSize(boxWidth, boxHeight);
    this.objectiveNoticeLabel.setPosition(0, -boxHeight / 2 + 28);
    this.objectiveNoticeText.setPosition(0, compact ? -4 : 0);
    this.objectiveNoticeContinue.setPosition(0, boxHeight / 2 - 24);
  }

  enqueueObjectiveNotice(payload = {}) {
    const notice = typeof payload === 'string'
      ? { title: 'Objective Updated', text: payload }
      : {
        title: payload.title || 'Objective Updated',
        text: payload.text || '',
      };

    if (!notice.text) {
      return;
    }

    this.objectiveNoticeQueue.push(notice);

    if (!this.objectiveNoticeActive) {
      this.showNextObjectiveNotice();
    }
  }

  showNextObjectiveNotice() {
    if (!this.objectiveNoticeQueue.length) {
      return;
    }

    const next = this.objectiveNoticeQueue.shift();

    if (!this.objectiveNoticeOwnsPause && this.scene.isActive('GameScene')) {
      this.scene.pause('GameScene');
      this.objectiveNoticeOwnsPause = true;
    }

    this.objectiveNoticeActive = true;
    this.hideInteractionPrompt(true);
    this.objectiveNoticeLabel.setText(next.title);
    this.objectiveNoticeText.setText(next.text);
    this.layoutObjectiveNotice();

    this.objectiveNoticeDim.setAlpha(0);
    this.objectiveNoticeContainer.setAlpha(0);
    this.objectiveNoticeContainer.setVisible(true);

    this.tweens.killTweensOf([this.objectiveNoticeDim, this.objectiveNoticeContainer]);
    this.tweens.add({
      targets: this.objectiveNoticeDim,
      alpha: 0.82,
      duration: 160,
      ease: 'Quad.easeOut',
    });
    this.tweens.add({
      targets: this.objectiveNoticeContainer,
      alpha: 1,
      y: this.objectiveNoticeContainer.y + 6,
      duration: 190,
      ease: 'Quad.easeOut',
    });
  }

  dismissObjectiveNotice(instant = false) {
    if (!instant && !this.objectiveNoticeActive) {
      return;
    }

    if (
      instant
      && !this.objectiveNoticeActive
      && !this.objectiveNoticeContainer.visible
      && !this.objectiveNoticeOwnsPause
      && !this.objectiveNoticeQueue.length
    ) {
      return;
    }

    this.objectiveNoticeActive = false;

    const finishDismiss = () => {
      this.objectiveNoticeContainer.setVisible(false);

      if (this.objectiveNoticeQueue.length) {
        this.showNextObjectiveNotice();
        return;
      }

      if (this.objectiveNoticeOwnsPause) {
        this.scene.resume('GameScene');
        this.objectiveNoticeOwnsPause = false;
      }

      if (this.notificationQueue.length && !this.notificationContainer.visible) {
        this.showNextNotification();
      }
    };

    this.tweens.killTweensOf([this.objectiveNoticeDim, this.objectiveNoticeContainer]);

    if (instant) {
      this.objectiveNoticeDim.setAlpha(0);
      this.objectiveNoticeContainer.setAlpha(0);
      finishDismiss();
      return;
    }

    this.tweens.add({
      targets: this.objectiveNoticeDim,
      alpha: 0,
      duration: 130,
      ease: 'Quad.easeIn',
    });
    this.tweens.add({
      targets: this.objectiveNoticeContainer,
      alpha: 0,
      duration: 140,
      ease: 'Quad.easeIn',
      onComplete: finishDismiss,
    });
  }

  showNextNotification() {
    if (!this.notificationQueue.length) {
      return;
    }

    const next = this.notificationQueue.shift();
    const palette = getNotificationPalette(next.tone);

    this.notificationBackdrop.setFillStyle(palette.fill, 0.95);
    this.notificationBackdrop.setStrokeStyle(1, palette.border, 0.85);
    this.notificationAccent.setFillStyle(palette.accent, 1);
    this.notificationTitle.setColor(palette.title);
    this.notificationBody.setColor(palette.body);
    this.notificationTitle.setText(next.title);
    this.notificationBody.setText(next.text);

    const boxWidth = Math.min(360, this.scale.width - 36);
    const bodyWidth = boxWidth - 82;
    this.notificationBody.setWordWrapWidth(bodyWidth, true);

    const boxHeight = Math.max(64, 40 + this.notificationBody.height);
    this.notificationBackdrop.setSize(boxWidth, boxHeight);
    this.notificationAccent.setSize(10, boxHeight);
    this.notificationAccent.setPosition(-boxWidth / 2, -boxHeight / 2);
    this.notificationTitle.setPosition(-boxWidth / 2 + 22, -boxHeight / 2 + 12);
    this.notificationBody.setPosition(-boxWidth / 2 + 22, -boxHeight / 2 + 28);

    this.notificationContainer.setVisible(true);
    this.notificationContainer.setAlpha(0);
    this.notificationContainer.y = this.scale.width < 720 ? 88 : 92;

    this.tweens.killTweensOf(this.notificationContainer);
    this.tweens.add({
      targets: this.notificationContainer,
      alpha: 1,
      y: this.notificationContainer.y + 4,
      duration: 160,
      ease: 'Quad.easeOut',
    });

    if (this.notificationTimer) {
      this.notificationTimer.remove(false);
    }

    this.notificationTimer = this.time.delayedCall(next.duration, () => {
      this.hideNotification();
    });
  }

  hideNotification(instant = false) {
    if (this.notificationTimer) {
      this.notificationTimer.remove(false);
      this.notificationTimer = null;
    }

    if (instant) {
      this.notificationContainer.setAlpha(0);
      this.notificationContainer.setVisible(false);
      if (this.notificationQueue.length) {
        this.showNextNotification();
      }
      return;
    }

    this.tweens.killTweensOf(this.notificationContainer);
    this.tweens.add({
      targets: this.notificationContainer,
      alpha: 0,
      duration: 120,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.notificationContainer.setVisible(false);
        if (this.notificationQueue.length) {
          this.showNextNotification();
        }
      },
    });
  }

  clearNotifications() {
    this.notificationQueue = [];
    this.hideNotification(true);
  }

  requestDialogueAdvance() {
    if (this.dialogueSystem && typeof this.dialogueSystem.advance === 'function') {
      this.applyDialogueResult(this.dialogueSystem.advance());
      return;
    }

    if (this.dialogueSystem && typeof this.dialogueSystem.next === 'function') {
      this.applyDialogueResult(this.dialogueSystem.next());
      return;
    }

    if (this.dialogueSystem && typeof this.dialogueSystem.continue === 'function') {
      this.applyDialogueResult(this.dialogueSystem.continue());
      return;
    }

    if (this.dialogueSystem && typeof this.dialogueSystem.advanceDialogue === 'function') {
      this.applyDialogueResult(this.dialogueSystem.advanceDialogue());
      return;
    }

    if (safeCall(this.gameState, ['advanceDialogue', 'nextDialogue'])) {
      return;
    }

    [this.dialogueSystem, this.gameState, this.game.events].forEach((source) => {
      collectEmitters(source).forEach((emitter) => {
        emitter.emit('dialogue:advance-request');
      });
    });
  }

  applyDialogueResult(result) {
    if (!result) {
      return;
    }

    const snapshot = result.snapshot || result;
    const line = snapshot.line || null;
    const hasDialogue = Boolean(snapshot.active || snapshot.dialogueOpen || snapshot.text || line?.text);
    const liveSnapshot = this.dialogueSystem?.getSnapshot?.() || null;
    const liveLine = liveSnapshot?.line || null;
    const hasLiveDialogue = Boolean(
      liveSnapshot?.active
      && (liveSnapshot?.text || liveLine?.text)
    );

    if (!hasDialogue || result.status === 'completed' || result.status === 'closed') {
      if (hasLiveDialogue) {
        this.showDialogue({
          speaker: liveSnapshot.speaker || liveLine?.speaker || '',
          body: liveSnapshot.text || liveLine?.text || '',
          canContinue: true,
          continueText: liveSnapshot.canAdvance === false ? 'Finish  ENTER / SPACE' : 'Continue  ENTER / SPACE',
          lineIndex: liveSnapshot.lineIndex,
          totalLines: liveSnapshot.totalLines,
        });
        return;
      }

      this.hideDialogue();
      return;
    }

    this.showDialogue({
      speaker: snapshot.speaker || line?.speaker || '',
      body: snapshot.text || line?.text || '',
      canContinue: true,
      continueText: snapshot.canAdvance === false ? 'Finish  ENTER / SPACE' : 'Continue  ENTER / SPACE',
      lineIndex: snapshot.lineIndex,
      totalLines: snapshot.totalLines,
    });
  }

  getTaskLabel(taskId, taskPayload = null) {
    if (taskPayload?.task?.label) {
      return taskPayload.task.label;
    }

    const tasks = normalizeTasks(taskPayload?.tasks || this.taskSystem?.getSnapshot?.().tasks || DEFAULT_TASKS);
    return tasks.find((task) => task.id === taskId)?.label || capitalize(taskId);
  }

  handleObjectiveEvent(payload) {
    if (!payload) {
      return;
    }

    this.setObjective(payload);

    const objectiveText = resolveObjectiveLabel(payload.text || payload.objective || payload.key || payload.id || DEFAULT_OBJECTIVE);

    if (objectiveText && objectiveText !== this.lastObjectiveNotice) {
      if (payload.id !== 'intro') {
        this.enqueueObjectiveNotice({
          title: 'Objective Updated',
          text: objectiveText,
        });
      }

      this.lastObjectiveNotice = objectiveText;
    }
  }

  handleObjectiveReminder(payload) {
    if (!payload) {
      return;
    }

    const objectiveText = resolveObjectiveLabel(payload.objectiveText || payload.text || this.currentObjectiveText || DEFAULT_OBJECTIVE);

    if (objectiveText) {
      this.setObjective(objectiveText);
      this.objectivePanel.pulseObjective?.();
    }

    this.runScreenPulse({
      fillColor: 0x2b1f14,
      peakAlpha: 0.08,
      flashColor: 0xe0ba85,
      flashAlpha: 0.04,
      duration: 180,
    });

    this.enqueueNotification({
      title: payload.title || 'Finish the current objective first.',
      text: payload.body || (objectiveText ? `Current objective: ${objectiveText}` : ''),
      tone: payload.tone || 'warning',
      duration: payload.duration || 1800,
    });
  }

  handleTaskComplete(payload) {
    this.setTasks(payload?.tasks || payload);

    if (payload?.taskId) {
      this.objectivePanel.pulseTask(payload.taskId);
    }

    this.runScreenPulse({
      fillColor: 0xefe5bf,
      peakAlpha: 0.08,
      flashColor: 0xffffff,
      flashAlpha: 0.05,
      duration: 260,
    });

    this.enqueueNotification({
      title: 'Task Complete',
      text: `${this.getTaskLabel(payload?.taskId, payload)} is complete.`,
      tone: 'task',
      duration: payload?.allComplete ? 1450 : 1250,
    });

    playOptionalSound(this, 'sfx-task', { volume: 0.65 });
  }

  handleChallengeComplete(payload) {
    if (!payload?.feedbackTitle && !payload?.feedbackBody) {
      return;
    }

    this.objectivePanel.pulseObjective?.();

    this.enqueueNotification({
      title: payload.feedbackTitle,
      text: payload.feedbackBody,
      tone: payload.feedbackTone || (payload.passed ? 'hope' : 'warning'),
      duration: 1900,
    });
  }

  handleCanalReveal() {
    this.runScreenPulse({
      fillColor: 0x081015,
      peakAlpha: 0.34,
      flashColor: 0xb06f4d,
      flashAlpha: 0.06,
      duration: 420,
    });

    this.enqueueNotification({
      title: 'The Canal Reveals More',
      text: 'Promises were posted, but the canal still stands broken.',
      tone: 'warning',
      duration: 1800,
    });

    playOptionalSound(this, 'sfx-interact', { volume: 0.55 });
  }

  handleWaterStart(payload) {
    this.runScreenPulse({
      fillColor: payload?.endingField ? 0xcfe9d7 : 0xb7d8df,
      peakAlpha: payload?.endingField ? 0.12 : 0.08,
      flashColor: 0xffffff,
      flashAlpha: 0.03,
      duration: payload?.endingField ? 420 : 260,
    });

    if (payload?.endingField) {
      this.enqueueNotification({
        title: 'Water Returns',
        text: 'The field looks calmer now, but the work is not finished.',
        tone: 'hope',
        duration: 1750,
      });
    }
  }

  handleEndingUnlock() {
    this.runScreenPulse({
      fillColor: 0xd8edc8,
      peakAlpha: 0.16,
      flashColor: 0xffffff,
      flashAlpha: 0.06,
      duration: 460,
    });

    this.enqueueNotification({
      title: 'Path Opened',
      text: 'Walk toward the field.',
      tone: 'hope',
      duration: 1800,
    });

    playOptionalSound(this, 'sfx-confirm', { volume: 0.55 });
  }

  resetUI() {
    this.currentDialogueSignature = null;
    this.currentChallengeSignature = null;
    this.currentChallengeSnapshot = null;
    this.activePrompt = null;
    this.lastObjectiveNotice = null;
    this.advanceInputCooldownUntil = 0;
    this.hideDialogue(true);
    this.hideChallenge(true);
    this.hideInteractionPrompt(true);
    this.hideNarration(true);
    this.objectiveNoticeQueue = [];
    this.dismissObjectiveNotice(true);
    this.clearNotifications();
    this.setObjective(DEFAULT_OBJECTIVE);
    this.setTasks(DEFAULT_TASKS);
  }

  handleEndingTriggered(payload) {
    this.hideInteractionPrompt(true);
    this.hideDialogue(true);
    this.runScreenPulse({
      fillColor: 0x050b10,
      peakAlpha: 0.24,
      flashColor: 0xf7f1d2,
      flashAlpha: 0.05,
      duration: 380,
    });

    if (payload?.message || payload?.body) {
      this.showNarration(payload);
    }
  }

  handleResize(gameSize) {
    const { width, height } = gameSize;
    const compact = width < 720;
    const veryCompact = width < 580;

    this.pulseRect.setSize(width, height);
    this.flashRect.setSize(width, height);
    this.narrationDim.setSize(width, height);

    this.narrationPanel.setPosition(width / 2, height * 0.28);
    this.narrationPanel.setSize(Math.min(820, width - (veryCompact ? 28 : 48)), compact ? 162 : 150);
    this.narrationLabel.setPosition(width / 2, height * 0.28 - (compact ? 48 : 42));
    this.narrationText.setPosition(width / 2, height * 0.28 + 6);
    this.narrationText.setFontSize(veryCompact ? 22 : compact ? 24 : 28);
    this.narrationText.setWordWrapWidth(Math.min(760, width - (veryCompact ? 44 : 96)), true);
    this.layoutObjectiveNotice(width, height);

    this.dialogueBox.setPosition(width / 2, height - (compact ? 124 : 114));
    this.dialogueBox.resize(
      Math.min(920, width - (compact ? 18 : 36)),
      Math.min(compact ? 212 : 196, Math.max(veryCompact ? 186 : compact ? 178 : 170, height * 0.25)),
    );
    this.challengeDim.setSize(width, height);
    this.challengeBox.setPosition(width / 2, height * 0.56);
    this.challengeBox.resize(
      Math.min(700, width - (compact ? 20 : 36)),
      Math.min(compact ? height - 72 : 470, height - (compact ? 72 : 88)),
    );

    const objectiveWidth = compact ? Math.min(width - 16, 360) : Math.min(368, width - 32);
    this.objectivePanel.resize(objectiveWidth);
    this.objectivePanel.setPosition(compact ? Math.max(10, (width - objectiveWidth) / 2) : 16, 14);

    this.directionGuideContainer.setPosition(width - (compact ? 94 : 112), height - (compact ? 96 : 108));
    this.notificationContainer.setPosition(width / 2, compact ? 88 : 92);
    this.notificationBackdrop.setSize(Math.min(360, width - 36), this.notificationBackdrop.height);
    this.notificationBody.setWordWrapWidth(Math.min(276, width - 84), true);

    this.syncPromptPosition();
  }

  handleShutdown() {
    this.scale.off('resize', this.handleResize, this);
    this.input.keyboard.off('keydown', this.advanceHandler);

    this.subscriptions.forEach((subscription) => {
      if (typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
        return;
      }

      if (subscription.mode === 'event-target') {
        subscription.source.removeEventListener(subscription.eventName, subscription.listener);
        return;
      }

      if (subscription.mode === 'emitter') {
        subscription.emitter.off(subscription.eventName, subscription.handler);
      }
    });
    this.subscriptions = [];

    if (this.narrationTimer) {
      this.narrationTimer.remove(false);
      this.narrationTimer = null;
    }

    if (this.notificationTimer) {
      this.notificationTimer.remove(false);
      this.notificationTimer = null;
    }

    this.advanceInputCooldownUntil = 0;

    if (this.objectiveNoticeOwnsPause) {
      this.scene.resume('GameScene');
      this.objectiveNoticeOwnsPause = false;
    }

    if (this.promptTween) {
      this.promptTween.stop();
      this.promptTween = null;
    }

    if (this.directionGuideTween) {
      this.directionGuideTween.stop();
      this.directionGuideTween = null;
    }
  }
}

export default UIScene;
