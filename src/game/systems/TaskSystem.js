import TASK_DEFINITIONS, { TASK_ORDER, getTaskDefinition } from '../data/tasks.js';
import {
  OBJECTIVE_IDS,
  getObjectiveForBeat,
  getObjectiveIdForBeat,
  getObjectiveText,
} from '../data/objectives.js';

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

class TaskSystem {
  constructor({ gameState = null, taskDefinitions = TASK_DEFINITIONS, taskOrder = TASK_ORDER, hooks = {} } = {}) {
    this.gameState = gameState;
    this.taskDefinitions = taskDefinitions;
    this.taskOrder = taskOrder;
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

  reset() {
    this.listenTalkedTo = new Set();
    return this;
  }

  hasListenConversation(conversationId) {
    return this.listenTalkedTo.has(conversationId);
  }

  getListenProgress() {
    return {
      listenedTo: [...this.listenTalkedTo],
      count: this.listenTalkedTo.size,
      remaining: Math.max(0, 2 - this.listenTalkedTo.size),
      readyToComplete: this.listenTalkedTo.size >= 2 && !this.isTaskComplete('listen'),
      completed: this.isTaskComplete('listen'),
    };
  }

  recordListenConversation(conversationId) {
    if (!conversationId) {
      return this.getListenProgress();
    }

    this.listenTalkedTo.add(conversationId);
    return this.getListenProgress();
  }

  completeDocument(meta = {}) {
    return this.completeTask('document', meta);
  }

  completeRepair(meta = {}) {
    return this.completeTask('repair', meta);
  }

  getDefinition(taskId) {
    return this.taskDefinitions[taskId] || getTaskDefinition(taskId);
  }

  getTaskState(taskId) {
    const definition = this.getDefinition(taskId);

    if (!definition) {
      return null;
    }

    const stored = this._readTaskState(taskId);
    const status = stored.status || 'locked';

    return {
      ...definition,
      ...stored,
      id: taskId,
      status,
      isCompleted: status === 'completed',
      isUnlocked: status !== 'locked',
      isAvailable: status === 'available' || status === 'completed',
      isRecommendedNext: this._isRecommendedNext(taskId, status),
    };
  }

  getTaskStates(taskIds = this.taskOrder) {
    return taskIds.map((taskId) => this.getTaskState(taskId)).filter(Boolean);
  }

  getSnapshot(taskIds = this.taskOrder) {
    const tasks = this.getTaskStates(taskIds);
    const remainingTaskIds = tasks.filter((task) => !task.isCompleted).map((task) => task.id);
    const beat = this.getBeat();
    const objectiveText = this.getObjectiveForBeat(beat);

    return {
      beat,
      tasks,
      remainingTaskIds,
      allComplete: remainingTaskIds.length === 0,
      objectiveText,
    };
  }

  getRemainingTaskIds(taskIds = this.taskOrder) {
    return taskIds.filter((taskId) => !this.isTaskComplete(taskId));
  }

  isTaskComplete(taskId) {
    return this.getTaskState(taskId)?.isCompleted || false;
  }

  areAllTasksComplete(taskIds = this.taskOrder) {
    return this.getRemainingTaskIds(taskIds).length === 0;
  }

  activateTasks(taskIds = this.taskOrder) {
    const ids = this._normalizeTaskIds(taskIds);
    const remainingTaskIds = this.getRemainingTaskIds(ids);

    ids.forEach((taskId) => {
      if (!this.isTaskComplete(taskId)) {
        this._writeTaskState(taskId, { status: 'available' });
      }
    });

    const allComplete = remainingTaskIds.length === 0;
    const beat = allComplete ? 'ending' : 'hub';
    const objectiveId = allComplete ? OBJECTIVE_IDS.ENDING : OBJECTIVE_IDS.HUB;

    this._setBeat(beat);

    const objectiveText = this._setObjective(objectiveId, {
      remainingTaskIds,
    });

    const payload = {
      taskIds: ids,
      tasks: this.getTaskStates(ids),
      objectiveId,
      objectiveText,
    };

    this._callHook('onTasksUnlocked', payload);
    return payload;
  }

  completeTask(taskId, meta = {}) {
    const definition = this.getDefinition(taskId);

    if (!definition) {
      throw new Error(`TaskSystem: unknown task "${taskId}".`);
    }

    const current = this.getTaskState(taskId);

    if (current?.isCompleted) {
      return {
        task: current,
        alreadyCompleted: true,
        allComplete: this.areAllTasksComplete(),
        remainingTaskIds: this.getRemainingTaskIds(),
        objectiveId: this._getCurrentObjectiveId(),
        objectiveText: this._getCurrentObjectiveText(),
      };
    }

    this._writeTaskState(taskId, {
      status: 'completed',
      completedAt: meta.completedAt || new Date().toISOString(),
      meta: meta.meta || meta,
    });

    const remainingTaskIds = this.getRemainingTaskIds();
    const allComplete = remainingTaskIds.length === 0;
    const objectiveId = allComplete ? OBJECTIVE_IDS.ENDING : OBJECTIVE_IDS.HUB;

    this._setBeat(allComplete ? 'ending' : 'hub');

    const objectiveText = this._setObjective(objectiveId, {
      remainingTaskIds,
    });

    const payload = {
      task: this.getTaskState(taskId),
      alreadyCompleted: false,
      allComplete,
      remainingTaskIds,
      objectiveId,
      objectiveText,
      unlockedEnding: allComplete,
      tasks: this.getTaskStates(),
    };

    this._callHook('onTaskCompleted', payload);

    if (allComplete) {
      this._callHook('onAllTasksComplete', payload);
    }

    return payload;
  }

  getHubObjective(remainingTaskIds = this.getRemainingTaskIds()) {
    return getObjectiveText(OBJECTIVE_IDS.HUB, { remainingTaskIds });
  }

  getObjectiveForBeat(beat = this.getBeat()) {
    return getObjectiveForBeat(beat, {
      remainingTaskIds: this.getRemainingTaskIds(),
    });
  }

  syncObjectiveForBeat(beat = this.getBeat()) {
    let objectiveId = getObjectiveIdForBeat(beat);

    if (!objectiveId) {
      return null;
    }

    if (objectiveId === OBJECTIVE_IDS.HUB && this.areAllTasksComplete()) {
      objectiveId = OBJECTIVE_IDS.ENDING;
    }

    return this._setObjective(objectiveId, {
      remainingTaskIds: this.getRemainingTaskIds(),
    });
  }

  setBeat(beat, { syncObjective = true } = {}) {
    this._setBeat(beat);

    if (syncObjective) {
      return this.syncObjectiveForBeat(beat);
    }

    return beat;
  }

  getBeat() {
    const gameState = this.gameState;

    if (!gameState) {
      return null;
    }

    if (typeof gameState.getCurrentBeat === 'function') {
      return gameState.getCurrentBeat();
    }

    if (typeof gameState.getBeat === 'function') {
      return gameState.getBeat();
    }

    return gameState.progress?.currentBeat || null;
  }

  _normalizeTaskIds(taskIds) {
    return taskIds.filter((taskId) => Boolean(this.getDefinition(taskId)));
  }

  _readTaskState(taskId) {
    const gameState = this.gameState;

    if (!gameState) {
      return {};
    }

    if (typeof gameState.getTaskState === 'function') {
      return gameState.getTaskState(taskId) || {};
    }

    return gameState.tasks?.[taskId] || {};
  }

  _writeTaskState(taskId, patch) {
    const gameState = this.gameState;

    if (!gameState) {
      return patch;
    }

    if (typeof gameState.setTaskState === 'function') {
      gameState.setTaskState(taskId, patch);
      return this._readTaskState(taskId);
    }

    if (patch.status === 'completed' && typeof gameState.completeTask === 'function') {
      gameState.completeTask(taskId, patch);
      return this._readTaskState(taskId);
    }

    if (typeof gameState.updateTask === 'function') {
      gameState.updateTask(taskId, patch);
      return this._readTaskState(taskId);
    }

    if (!isObject(gameState.tasks)) {
      gameState.tasks = {};
    }

    gameState.tasks[taskId] = {
      ...(gameState.tasks[taskId] || {}),
      ...patch,
    };

    return gameState.tasks[taskId];
  }

  _isRecommendedNext(taskId, status) {
    if (status === 'locked' || status === 'completed') {
      return false;
    }

    const definition = this.getDefinition(taskId);
    const recommendedAfter = definition?.recommendedAfter || [];

    return recommendedAfter.every((requiredTaskId) => this.isTaskComplete(requiredTaskId));
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

    if (typeof gameState.updateUIState === 'function') {
      gameState.updateUIState({
        currentObjective: objectiveText,
        currentObjectiveId: objectiveId,
      });
      return objectiveText;
    }

    if (!isObject(gameState.ui)) {
      gameState.ui = {};
    }

    gameState.ui = {
      ...gameState.ui,
      currentObjective: objectiveText,
      currentObjectiveId: objectiveId,
    };

    return objectiveText;
  }

  _getCurrentObjectiveId() {
    const gameState = this.gameState;
    return gameState?.ui?.currentObjectiveId || null;
  }

  _getCurrentObjectiveText() {
    const gameState = this.gameState;
    return gameState?.ui?.currentObjective || null;
  }

  _callHook(hookName, payload) {
    const hook = this.hooks?.[hookName];

    if (typeof hook === 'function') {
      hook(payload, this);
    }
  }
}

export default TaskSystem;
