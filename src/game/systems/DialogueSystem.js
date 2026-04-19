import DIALOGUE_SEQUENCES, { getDialogueSequence } from '../data/dialogue.js';
import { getObjectiveText } from '../data/objectives.js';

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

class DialogueSystem {
  constructor({ gameState = null, sequences = DIALOGUE_SEQUENCES, hooks = {} } = {}) {
    this.gameState = gameState;
    this.sequences = sequences;
    this.hooks = hooks;
    this.reset();
  }

  setGameState(gameState) {
    this.gameState = gameState;
    return this;
  }

  setHooks(hooks = {}) {
    this.hooks = { ...this.hooks, ...hooks };
    return this;
  }

  setSequences(sequences = DIALOGUE_SEQUENCES) {
    this.sequences = sequences;
    return this;
  }

  reset() {
    this.activeKey = null;
    this.lineIndex = -1;
    this.activeOptions = null;
    this.previousCanMove = true;
  }

  getSequence(sequenceKey) {
    return this.sequences[sequenceKey] || getDialogueSequence(sequenceKey);
  }

  getCurrentSequence() {
    return this.activeKey ? this.getSequence(this.activeKey) : null;
  }

  getCurrentLine() {
    const sequence = this.getCurrentSequence();

    if (!sequence || this.lineIndex < 0) {
      return null;
    }

    return sequence.lines[this.lineIndex] || null;
  }

  isActive() {
    return Boolean(this.getCurrentSequence());
  }

  hasNextLine() {
    const sequence = this.getCurrentSequence();
    return Boolean(sequence) && this.lineIndex < sequence.lines.length - 1;
  }

  start(sequenceKey, options = {}) {
    const sequence = this.getSequence(sequenceKey);

    if (!sequence) {
      throw new Error(`DialogueSystem: unknown dialogue sequence "${sequenceKey}".`);
    }

    if (this.activeKey === sequenceKey && options.restart === false) {
      return this.getSnapshot();
    }

    if (this.isActive() && this.activeKey !== sequenceKey) {
      this.close({ source: 'replace' });
    }

    this.activeKey = sequenceKey;
    this.lineIndex = 0;
    this.activeOptions = { ...options };
    this.previousCanMove = this._getCanMoveState();

    this._applyStartState(sequence, this.activeOptions);

    const snapshot = this.getSnapshot();
    this._callHook('onSequenceStart', {
      sequence,
      snapshot,
      context: this.activeOptions.context || null,
    });

    return snapshot;
  }

  advance() {
    if (!this.isActive()) {
      return this.getSnapshot();
    }

    if (!this.hasNextLine()) {
      return this.finish({ source: 'advance' });
    }

    this.lineIndex += 1;

    const snapshot = this.getSnapshot();
    this._callHook('onLineAdvance', {
      sequence: this.getCurrentSequence(),
      snapshot,
      context: this.activeOptions?.context || null,
    });

    return snapshot;
  }

  finish({ source = 'finish' } = {}) {
    if (!this.isActive()) {
      return {
        status: 'idle',
        snapshot: this.getSnapshot(),
      };
    }

    const sequence = this.getCurrentSequence();
    const context = this.activeOptions?.context || null;
    const payload = {
      status: 'completed',
      source,
      sequenceKey: sequence.key,
      sequence,
      line: this.getCurrentLine(),
      lineIndex: this.lineIndex,
      context,
    };

    this._applyCompletionState(sequence, context);
    this._restoreUiState(sequence);

    const onComplete = this.activeOptions?.onComplete;
    this.reset();

    payload.snapshot = this.getSnapshot();

    if (typeof onComplete === 'function') {
      onComplete(payload);
    }

    this._callHook('onSequenceComplete', payload);
    return payload;
  }

  close({ fireComplete = false, source = 'close' } = {}) {
    if (fireComplete) {
      return this.finish({ source });
    }

    if (!this.isActive()) {
      return {
        status: 'idle',
        snapshot: this.getSnapshot(),
      };
    }

    const sequence = this.getCurrentSequence();
    const payload = {
      status: 'closed',
      source,
      sequenceKey: sequence.key,
      sequence,
      line: this.getCurrentLine(),
      lineIndex: this.lineIndex,
      context: this.activeOptions?.context || null,
    };

    this._restoreUiState(sequence);
    this.reset();
    payload.snapshot = this.getSnapshot();
    this._callHook('onSequenceClose', payload);
    return payload;
  }

  getSnapshot() {
    const sequence = this.getCurrentSequence();
    const line = this.getCurrentLine();

    return {
      active: Boolean(sequence),
      dialogueOpen: Boolean(sequence),
      sequenceKey: sequence?.key || null,
      beat: sequence?.beat || null,
      taskId: sequence?.taskId || null,
      lineIndex: sequence ? this.lineIndex : -1,
      totalLines: sequence?.lines.length || 0,
      line,
      speaker: line?.speaker || null,
      text: line?.text || null,
      canAdvance: this.hasNextLine(),
    };
  }

  _applyStartState(sequence, options) {
    const lockMovement = options.lockMovement ?? sequence.lockMovement ?? true;
    const startBeat = options.startBeat ?? sequence.startBeat;
    const objectiveId = options.objectiveId ?? sequence.startObjectiveId;

    if (startBeat) {
      this._setBeat(startBeat);
    }

    if (objectiveId) {
      this._setObjective(objectiveId, options.objectiveContext);
    }

    this._patchUi({
      dialogueOpen: true,
      canMove: lockMovement ? false : this.previousCanMove,
    });
  }

  _applyCompletionState(sequence, context) {
    const completion = sequence.completion || {};

    if (completion.unlockTasks?.length) {
      this._unlockTasks(completion.unlockTasks, sequence, context);
    }

    if (completion.completeTaskId) {
      this._completeTask(completion.completeTaskId, sequence, context);
    }

    if (completion.nextBeat) {
      this._setBeat(completion.nextBeat);
    }

    if (completion.objectiveId) {
      const objectiveContext = {
        remainingTaskIds: completion.unlockTasks || [],
        ...completion.objectiveContext,
      };
      this._setObjective(completion.objectiveId, objectiveContext);
    }
  }

  _restoreUiState(sequence) {
    const lockMovement = this.activeOptions?.lockMovement ?? sequence.lockMovement ?? true;

    this._patchUi({
      dialogueOpen: false,
      canMove: lockMovement ? this.previousCanMove : this._getCanMoveState(),
    });
  }

  _unlockTasks(taskIds, sequence, context) {
    if (this._hasHook('onUnlockTasks')) {
      this._callHook('onUnlockTasks', { taskIds, sequence, context });
      return;
    }

    const gameState = this.gameState;
    if (!gameState) {
      return;
    }

    if (typeof gameState.unlockTasks === 'function') {
      gameState.unlockTasks(taskIds);
      return;
    }

    const tasks = this._ensureTasksRoot();
    taskIds.forEach((taskId) => {
      const current = tasks[taskId] || {};
      if (current.status !== 'completed') {
        tasks[taskId] = { ...current, status: 'available' };
      }
    });
  }

  _completeTask(taskId, sequence, context) {
    if (this._hasHook('onCompleteTask')) {
      this._callHook('onCompleteTask', { taskId, sequence, context });
      return;
    }

    const gameState = this.gameState;
    if (!gameState) {
      return;
    }

    if (typeof gameState.completeTask === 'function') {
      gameState.completeTask(taskId);
      return;
    }

    const tasks = this._ensureTasksRoot();
    const current = tasks[taskId] || {};
    tasks[taskId] = {
      ...current,
      status: 'completed',
      completedAt: current.completedAt || new Date().toISOString(),
    };
  }

  _getCanMoveState() {
    const gameState = this.gameState;

    if (!gameState) {
      return true;
    }

    if (typeof gameState.getCanMove === 'function') {
      return Boolean(gameState.getCanMove());
    }

    return gameState.ui?.canMove ?? true;
  }

  _setBeat(beat) {
    const gameState = this.gameState;

    if (!gameState || !beat) {
      return;
    }

    if (typeof gameState.setCurrentBeat === 'function') {
      gameState.setCurrentBeat(beat);
      return;
    }

    if (typeof gameState.setBeat === 'function') {
      gameState.setBeat(beat);
      return;
    }

    if (!isObject(gameState.progress)) {
      gameState.progress = {};
    }

    gameState.progress.currentBeat = beat;
  }

  _setObjective(objectiveId, context = {}) {
    const objectiveText = getObjectiveText(objectiveId, context);
    const gameState = this.gameState;

    if (!objectiveText || !gameState) {
      return objectiveText;
    }

    if (typeof gameState.setCurrentObjective === 'function') {
      gameState.setCurrentObjective(objectiveText, objectiveId);
      return objectiveText;
    }

    this._patchUi({
      currentObjective: objectiveText,
      currentObjectiveId: objectiveId,
    });

    return objectiveText;
  }

  _patchUi(patch) {
    const gameState = this.gameState;

    if (!gameState || !isObject(patch)) {
      return;
    }

    if (typeof gameState.updateUIState === 'function') {
      gameState.updateUIState(patch);
      return;
    }

    if (typeof gameState.setUIState === 'function') {
      gameState.setUIState({ ...(gameState.ui || {}), ...patch });
      return;
    }

    if (!isObject(gameState.ui)) {
      gameState.ui = {};
    }

    gameState.ui = { ...gameState.ui, ...patch };
  }

  _ensureTasksRoot() {
    const gameState = this.gameState;

    if (!gameState) {
      return {};
    }

    if (!isObject(gameState.tasks)) {
      gameState.tasks = {};
    }

    return gameState.tasks;
  }

  _callHook(hookName, payload) {
    const hook = this.hooks?.[hookName];

    if (typeof hook === 'function') {
      hook(payload, this);
    }
  }

  _hasHook(hookName) {
    return typeof this.hooks?.[hookName] === 'function';
  }
}

export default DialogueSystem;
