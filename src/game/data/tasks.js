import { DIALOGUE_KEYS } from './dialogue.js'

export const TASK_IDS = Object.freeze({
  LISTEN: 'listen',
  DOCUMENT: 'document',
  REPAIR: 'repair',
})

export const TASK_ORDER = Object.freeze([
  TASK_IDS.LISTEN,
  TASK_IDS.DOCUMENT,
  TASK_IDS.REPAIR,
])

export const TASKS = Object.freeze({
  [TASK_IDS.LISTEN]: {
    id: TASK_IDS.LISTEN,
    label: 'Listen',
    shortLabel: 'Listen',
    summary: 'Makinig sa mga taong may pasan ng bigat.',
    description: 'Listen before speaking for anyone else.',
    completionMessage: 'You stayed long enough to hear the whole weight of it.',
    dialogueKey: DIALOGUE_KEYS.TASK_LISTEN,
    completionDialogueKey: DIALOGUE_KEYS.LISTEN_COMPLETE,
    recommendedAfter: [],
  },
  [TASK_IDS.DOCUMENT]: {
    id: TASK_IDS.DOCUMENT,
    label: 'Record',
    shortLabel: 'Record',
    summary: 'Isulat ang matagal nang hindi dapat tinatago.',
    description: 'Name the damage plainly so it cannot be brushed aside.',
    completionMessage: 'What silence hid is now in plain words.',
    dialogueKey: DIALOGUE_KEYS.TASK_DOCUMENT,
    completionDialogueKey: DIALOGUE_KEYS.DOCUMENT_COMPLETE,
    recommendedAfter: [TASK_IDS.LISTEN],
  },
  [TASK_IDS.REPAIR]: {
    id: TASK_IDS.REPAIR,
    label: 'Repair',
    shortLabel: 'Repair',
    summary: 'Simulan ang kayang galawin.',
    description: 'Begin repair without pretending one effort solves the whole system.',
    completionMessage: 'Care became work in your hands.',
    dialogueKey: DIALOGUE_KEYS.TASK_REPAIR,
    completionDialogueKey: DIALOGUE_KEYS.REPAIR_GATE_COMPLETE,
    recommendedAfter: [],
  },
})

export const TASK_DEFINITIONS = TASKS

export function getTaskDefinition(taskId) {
  return TASKS[taskId] || null
}

export function getTaskDefinitions(taskIds = TASK_ORDER) {
  return taskIds.map((taskId) => getTaskDefinition(taskId)).filter(Boolean)
}

export default TASKS
