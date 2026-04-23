export const GAME_TITLE = "When the Water Doesn't Come"

export const GAME_SIZE = {
  width: 1280,
  height: 720,
}

export const WORLD = {
  width: 7200,
  height: GAME_SIZE.height,
  groundY: 624,
  gravityY: 1700,
  playerSpeed: 240,
  playerAirSpeed: 220,
  jumpVelocity: -610,
  interactionRadius: 88,
}

export const SCENE_KEYS = {
  BOOT: 'BootScene',
  MENU: 'MenuScene',
  GAME: 'GameScene',
  UI: 'UIScene',
  END: 'EndScene',
}

export const TASK_IDS = {
  LISTEN: 'listen',
  DOCUMENT: 'document',
  REPAIR: 'repair',
}

export const ASSET_KEYS = {
  player: 'player',
  farmer: 'npc-farmer',
  parent: 'npc-mother',
  child: 'npc-child',
  elder: 'npc-elder',
  ground: 'ground',
  groundGreen: 'ground-green',
  platform: 'tile-platform-terrace-main',
  platformSmall: 'tile-platform-terrace-small',
  platformDry: 'tile-platform-terrace-dry',
  platformBamboo: 'tile-platform-bamboo',
  platformCanal: 'tile-platform-canal',
  canalBasin: 'canal-basin',
  canalTrench: 'canal-trench',
  canalBroken: 'canal-broken',
  canalDry: 'canal-dry',
  canalFlow: 'canal-water-0',
  house: 'house',
  tree: 'tree',
  cross: 'cross',
  chapel: 'chapel',
  poster: 'poster',
  projectPoster: 'project-poster',
  shadowBoss: 'shadow-boss',
  dryCrop: 'dry-crop',
  dryCropA: 'dry-crop-a',
  dryCropB: 'dry-crop-b',
  dryCropEdgeLeft: 'dry-crop-edge-left',
  dryCropEdgeRight: 'dry-crop-edge-right',
  fertilizerSack: 'fertilizer-sack',
  debtLedger: 'debt-ledger',
  communityBoard: 'community-board',
  pumpStation: 'pump-station',
  pumpDrip: 'pump-drip-0',
  waterGate: 'water-gate',
  bambooFence: 'bamboo-fence',
  objectiveMarker: 'objective-marker',
  sproutPatch: 'sprout-patch',
  riceRow: 'rice-row',
  endingGateLocked: 'ending-gate-locked',
  endingGateOpen: 'ending-gate-open',
  uiPanel: 'ui-panel',
  taskListen: 'task-listen',
  taskDocument: 'task-document',
  taskRepair: 'task-repair',
  water0: 'water-0',
  water1: 'water-1',
}

export const DEPTH = {
  background: 0,
  scenery: 20,
  world: 40,
  characters: 70,
  prompt: 120,
  overlay: 200,
}

export const OBJECTIVE_IDS = {
  INTRO: 'intro',
  FARMER: 'farmer',
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
}

export const WATER_ANIMATION_KEY = 'water-flow'
export const PUMP_DRIP_ANIMATION_KEY = 'pump-drip'

export const PLAYER_ANIMATION_KEYS = {
  idle: 'player-idle',
  walk: 'player-walk',
  jump: 'player-jump',
  fall: 'player-fall',
}

export const FARMER_ANIMATION_KEYS = {
  idle: 'npc-farmer-idle',
  talk: 'npc-farmer-talk',
}
