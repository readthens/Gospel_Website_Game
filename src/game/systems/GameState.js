import { OBJECTIVE_IDS, getObjectiveText } from '../data/objectives.js'
import { CHALLENGE_IDS } from '../data/challenges.js'

const TASK_IDS = Object.freeze(['listen', 'document', 'repair'])
const LEARNING_CHALLENGES = Object.freeze(Object.values(CHALLENGE_IDS))

const createInitialTaskStatus = () =>
  TASK_IDS.reduce((statusMap, taskId) => {
    statusMap[taskId] = { status: 'locked' }
    return statusMap
  }, {})

const createInitialLearningResults = () =>
  LEARNING_CHALLENGES.reduce((resultMap, challengeId) => {
    resultMap[challengeId] = {
      status: 'unseen',
      score: 0,
      maxScore: 0,
      attempts: 0,
    }
    return resultMap
  }, {})

export const createInitialGameState = () => ({
  flags: {
    introSeen: false,
    tutorialSignRead: false,
    farmerTalked: false,
    cropsSeen: false,
    irrigationSeen: false,
    familySeen: false,
    reflectionSeen: false,
    endingUnlocked: false,
    finalNarrationSeen: false,
    shadowRevealed: false,
    waterFlowing: false,
  },
  tasks: {
    listen: false,
    document: false,
    repair: false,
  },
  progress: {
    currentBeat: OBJECTIVE_IDS.INTRO,
    taskStatus: createInitialTaskStatus(),
    listenTalkedTo: [],
    learning: {
      results: createInitialLearningResults(),
      endingVariant: null,
    },
  },
  ui: {
    dialogueOpen: false,
    challengeOpen: false,
    canMove: true,
    currentObjective: getObjectiveText(OBJECTIVE_IDS.INTRO),
    currentObjectiveId: OBJECTIVE_IDS.INTRO,
    interactTargetId: null,
    interactionPrompt: '',
    dialogue: null,
    challenge: null,
    narration: null,
  },
})

const cloneState = (value) => {
  if (typeof structuredClone === 'function') {
    return structuredClone(value)
  }

  return JSON.parse(JSON.stringify(value))
}

const normalizeTaskPatch = (patch = {}) => {
  if (typeof patch === 'string') {
    return { status: patch }
  }

  if (typeof patch === 'boolean') {
    return { status: patch ? 'completed' : 'locked' }
  }

  return patch
}

class SharedGameState extends EventTarget {
  constructor() {
    super()
    this.state = createInitialGameState()
  }

  emit(type, detail = this.getSnapshot()) {
    this.dispatchEvent(new CustomEvent(type, { detail }))
  }

  subscribe(type, callback) {
    const handler = (event) => callback(event.detail)
    this.addEventListener(type, handler)

    return () => {
      this.removeEventListener(type, handler)
    }
  }

  getState() {
    return this.state
  }

  getSnapshot() {
    return cloneState(this.state)
  }

  reset() {
    this.state = createInitialGameState()
    this.emit('reset')
    this.emit('change')
  }

  resetRun() {
    this.reset()
  }

  getFlag(flag) {
    return this.state.flags[flag]
  }

  setFlag(flag, value = true) {
    if (this.state.flags[flag] === value) {
      return
    }

    this.state.flags[flag] = value
    this.emit('flag-change', { flag, value, state: this.getSnapshot() })
    this.emit('change')
  }

  getTaskState(taskId) {
    const taskStatus = this.state.progress?.taskStatus?.[taskId]
    const taskComplete = Boolean(this.state.tasks?.[taskId])

    if (taskStatus && typeof taskStatus === 'object') {
      return {
        ...taskStatus,
        status: taskComplete ? 'completed' : taskStatus.status || 'locked',
      }
    }

    if (taskComplete) {
      return { status: 'completed' }
    }

    if (taskStatus) {
      return { status: taskStatus }
    }

    return { status: 'locked' }
  }

  setTaskState(taskId, patch = {}) {
    const normalizedPatch = normalizeTaskPatch(patch)
    const current = this.getTaskState(taskId)

    if (!this.state.progress.taskStatus) {
      this.state.progress.taskStatus = {}
    }

    this.state.progress.taskStatus[taskId] = {
      ...current,
      ...normalizedPatch,
    }

    if (normalizedPatch.status === 'completed') {
      this.state.tasks[taskId] = true
    } else if (!(taskId in this.state.tasks)) {
      this.state.tasks[taskId] = false
    }

    this.emit('task-change', { taskId, state: this.getSnapshot() })
    this.emit('change')

    return this.state.progress.taskStatus[taskId]
  }

  setTask(taskId, value = true) {
    if (!value) {
      this.state.tasks[taskId] = false
      this.setTaskState(taskId, { status: 'locked' })
      return false
    }

    this.completeTask(taskId)
    return true
  }

  unlockTasks(taskIds = []) {
    taskIds.forEach((taskId) => {
      if (!this.state.tasks[taskId]) {
        this.setTaskState(taskId, { status: 'available' })
      }
    })
  }

  completeTask(taskId, meta = {}) {
    if (this.state.tasks[taskId]) {
      return false
    }

    this.state.tasks[taskId] = true
    this.setTaskState(taskId, {
      status: 'completed',
      completedAt: meta.completedAt ?? new Date().toISOString(),
      meta,
    })

    return true
  }

  isTaskComplete(taskId) {
    return Boolean(this.state.tasks[taskId])
  }

  getCurrentBeat() {
    return this.state.progress.currentBeat
  }

  setCurrentBeat(beat) {
    if (!beat || this.state.progress.currentBeat === beat) {
      return
    }

    this.state.progress.currentBeat = beat
    this.emit('beat-change', { beat, state: this.getSnapshot() })
    this.emit('change')
  }

  updateUIState(patch = {}) {
    this.state.ui = {
      ...this.state.ui,
      ...patch,
    }
    this.emit('change')
  }

  setCurrentObjective(text, objectiveId = null) {
    if (
      this.state.ui.currentObjective === text
      && this.state.ui.currentObjectiveId === objectiveId
    ) {
      return
    }

    this.state.ui.currentObjective = text
    this.state.ui.currentObjectiveId = objectiveId
    this.emit('objective-change', {
      objectiveId,
      text,
      state: this.getSnapshot(),
    })
    this.emit('change')
  }

  setObjective(objectiveId, context = {}) {
    const text = getObjectiveText(objectiveId, context) || objectiveId
    this.setCurrentObjective(text, objectiveId)
  }

  setInteractionPrompt(prompt = '', interactTargetId = null) {
    if (
      this.state.ui.interactionPrompt === prompt
      && this.state.ui.interactTargetId === interactTargetId
    ) {
      return
    }

    this.state.ui.interactionPrompt = prompt
    this.state.ui.interactTargetId = interactTargetId
    this.emit('prompt-change', { prompt, interactTargetId, state: this.getSnapshot() })
    this.emit('change')
  }

  setInteractTargetId(interactTargetId = null) {
    if (this.state.ui.interactTargetId === interactTargetId) {
      return
    }

    this.state.ui.interactTargetId = interactTargetId
    this.emit('change')
  }

  openDialogue(dialogue) {
    this.state.ui.dialogueOpen = true
    this.state.ui.canMove = false
    this.state.ui.dialogue = dialogue
    this.emit('dialogue-open', { dialogue, state: this.getSnapshot() })
    this.emit('change')
  }

  closeDialogue() {
    if (!this.state.ui.dialogueOpen && !this.state.ui.dialogue) {
      return
    }

    this.state.ui.dialogueOpen = false
    this.state.ui.canMove = true
    this.state.ui.dialogue = null
    this.emit('dialogue-close', this.getSnapshot())
    this.emit('change')
  }

  getCanMove() {
    return this.state.ui.canMove
  }

  setCanMove(canMove) {
    if (this.state.ui.canMove === canMove) {
      return
    }

    this.state.ui.canMove = canMove
    this.emit('movement-change', { canMove, state: this.getSnapshot() })
    this.emit('change')
  }

  setDialogueOpen(dialogueOpen) {
    if (this.state.ui.dialogueOpen === dialogueOpen) {
      return
    }

    this.state.ui.dialogueOpen = dialogueOpen
    this.emit('change')
  }

  setNarration(narration) {
    this.state.ui.narration = narration
    this.emit('narration-change', { narration, state: this.getSnapshot() })
    this.emit('change')
  }

  clearNarration() {
    if (!this.state.ui.narration) {
      return
    }

    this.state.ui.narration = null
    this.emit('narration-change', { narration: null, state: this.getSnapshot() })
    this.emit('change')
  }

  getLearningSnapshot() {
    return cloneState(this.state.progress?.learning || {
      results: createInitialLearningResults(),
      endingVariant: null,
    })
  }

  getChallengeResult(challengeId) {
    const results = this.state.progress?.learning?.results || {}
    return results[challengeId] || {
      status: 'unseen',
      score: 0,
      maxScore: 0,
      attempts: 0,
    }
  }

  setChallengeResult(challengeId, patch = {}) {
    if (!this.state.progress.learning) {
      this.state.progress.learning = {
        results: createInitialLearningResults(),
        endingVariant: null,
      }
    }

    if (!this.state.progress.learning.results) {
      this.state.progress.learning.results = createInitialLearningResults()
    }

    const current = this.getChallengeResult(challengeId)
    this.state.progress.learning.results[challengeId] = {
      ...current,
      ...patch,
    }

    this.emit('challenge-result-change', {
      challengeId,
      result: cloneState(this.state.progress.learning.results[challengeId]),
      state: this.getSnapshot(),
    })
    this.emit('change')

    return this.state.progress.learning.results[challengeId]
  }

  getEndingVariant() {
    return this.state.progress?.learning?.endingVariant || null
  }

  setEndingVariant(endingVariant = null) {
    if (!this.state.progress.learning) {
      this.state.progress.learning = {
        results: createInitialLearningResults(),
        endingVariant: null,
      }
    }

    if (this.state.progress.learning.endingVariant === endingVariant) {
      return
    }

    this.state.progress.learning.endingVariant = endingVariant
    this.emit('ending-variant-change', {
      endingVariant,
      state: this.getSnapshot(),
    })
    this.emit('change')
  }

  openChallenge(challenge) {
    this.state.ui.challengeOpen = true
    this.state.ui.canMove = false
    this.state.ui.challenge = challenge
    this.emit('challenge-open', { challenge, state: this.getSnapshot() })
    this.emit('change')
  }

  closeChallenge() {
    if (!this.state.ui.challengeOpen && !this.state.ui.challenge) {
      return
    }

    this.state.ui.challengeOpen = false
    this.state.ui.challenge = null
    this.state.ui.canMove = true
    this.emit('challenge-close', this.getSnapshot())
    this.emit('change')
  }

  areAllTasksComplete() {
    return TASK_IDS.every((taskId) => Boolean(this.state.tasks[taskId]))
  }

  allTasksComplete() {
    return this.areAllTasksComplete()
  }
}

export const gameState = new SharedGameState()

export const resetGameState = () => {
  gameState.reset()
  return gameState
}

export const getGameState = () => gameState
