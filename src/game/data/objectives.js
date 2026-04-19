export const OBJECTIVE_IDS = Object.freeze({
  INTRO: 'intro',
  FARMER: 'farmer',
  CROPS: 'crops',
  CANAL: 'canal',
  FAMILY: 'family',
  REFLECTION: 'reflection',
  HUB: 'hub',
  ENDING: 'ending',
  ARRIVAL_TUTORIAL: 'intro',
  MEET_FARMER: 'farmer',
  INSPECT_IRRIGATION: 'canal',
  WITNESS_FAMILY_BURDEN: 'family',
  HELP_HUB: 'hub',
  RETURN_TO_FARMER: 'ending',
})

export const OBJECTIVES = Object.freeze({
  [OBJECTIVE_IDS.INTRO]: 'Read the village sign.',
  [OBJECTIVE_IDS.FARMER]: 'Hear Tatay Ramon out.',
  [OBJECTIVE_IDS.CROPS]: 'Inspect the dead crops.',
  [OBJECTIVE_IDS.CANAL]: 'Inspect the irrigation canal.',
  [OBJECTIVE_IDS.FAMILY]: 'See what the failed harvest does at home.',
  [OBJECTIVE_IDS.REFLECTION]: 'Continue forward and reflect.',
  [OBJECTIVE_IDS.HUB]: 'Join the response: listen, record, and help repair.',
  [OBJECTIVE_IDS.ENDING]: 'Walk toward the field.',
})

export const OBJECTIVE_SEQUENCE = Object.freeze([
  OBJECTIVE_IDS.INTRO,
  OBJECTIVE_IDS.FARMER,
  OBJECTIVE_IDS.CROPS,
  OBJECTIVE_IDS.CANAL,
  OBJECTIVE_IDS.FAMILY,
  OBJECTIVE_IDS.REFLECTION,
  OBJECTIVE_IDS.HUB,
  OBJECTIVE_IDS.ENDING,
])

export const BEAT_TO_OBJECTIVE_ID = Object.freeze({
  intro: OBJECTIVE_IDS.INTRO,
  farmer: OBJECTIVE_IDS.FARMER,
  crops: OBJECTIVE_IDS.CROPS,
  canal: OBJECTIVE_IDS.CANAL,
  family: OBJECTIVE_IDS.FAMILY,
  reflection: OBJECTIVE_IDS.REFLECTION,
  hub: OBJECTIVE_IDS.HUB,
  ending: OBJECTIVE_IDS.ENDING,
  farmerEncounter: OBJECTIVE_IDS.FARMER,
  inspectIrrigation: OBJECTIVE_IDS.CANAL,
  familyBurden: OBJECTIVE_IDS.FAMILY,
  actionHub: OBJECTIVE_IDS.HUB,
  returnToFarmer: OBJECTIVE_IDS.ENDING,
})

const OBJECTIVE_ID_ALIASES = Object.freeze({
  arrivalTutorial: OBJECTIVE_IDS.INTRO,
  meetFarmer: OBJECTIVE_IDS.FARMER,
  inspectIrrigation: OBJECTIVE_IDS.CANAL,
  witnessFamilyBurden: OBJECTIVE_IDS.FAMILY,
  helpHub: OBJECTIVE_IDS.HUB,
  returnToFarmer: OBJECTIVE_IDS.ENDING,
})

const normalizeObjectiveId = (objectiveId) => OBJECTIVE_ID_ALIASES[objectiveId] || objectiveId

export function getObjectiveIdForBeat(beat) {
  return BEAT_TO_OBJECTIVE_ID[beat] || null
}

export function getHubObjectiveText(remainingTaskIds = []) {
  if (remainingTaskIds === undefined || remainingTaskIds === null) {
    return OBJECTIVES[OBJECTIVE_IDS.HUB]
  }

  if (!remainingTaskIds.length) {
    return OBJECTIVES[OBJECTIVE_IDS.ENDING]
  }

  return OBJECTIVES[OBJECTIVE_IDS.HUB]
}

export function getObjectiveText(objectiveId, context = {}) {
  const normalizedId = normalizeObjectiveId(objectiveId)

  if (!normalizedId) {
    return null
  }

  if (normalizedId === OBJECTIVE_IDS.HUB) {
    return getHubObjectiveText(context.remainingTaskIds)
  }

  return OBJECTIVES[normalizedId] || null
}

export function getObjectiveForBeat(beat, context = {}) {
  const objectiveId = getObjectiveIdForBeat(beat)
  return getObjectiveText(objectiveId, context)
}

export default OBJECTIVES
