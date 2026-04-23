import {
  FARMER_ANIMATION_KEYS,
  PLAYER_ANIMATION_KEYS,
  PUMP_DRIP_ANIMATION_KEY,
  WATER_ANIMATION_KEY,
} from '../utils/constants.js'

const WATER_FRAME_KEYS = Object.freeze([
  'canal-water-0',
  'canal-water-1',
  'canal-water-2',
  'canal-water-3',
])

const PUMP_DRIP_FRAME_KEYS = Object.freeze([
  'pump-drip-0',
  'pump-drip-1',
  'pump-drip-2',
  'pump-drip-3',
])

export const TEXTURE_KEYS = Object.freeze({
  player: 'player',
  npcs: Object.freeze({
    elder: 'npc-elder',
    mother: 'npc-mother',
    child: 'npc-child',
    farmer: 'npc-farmer',
  }),
  terrain: Object.freeze({
    ground: 'ground',
    groundGreen: 'ground-green',
    platformTerraceMain: 'tile-platform-terrace-main',
    platformTerraceSmall: 'tile-platform-terrace-small',
    platformTerraceDry: 'tile-platform-terrace-dry',
    platformBamboo: 'tile-platform-bamboo',
    platformCanal: 'tile-platform-canal',
    canalDry: 'canal-dry',
    canalWaterFrames: WATER_FRAME_KEYS,
    pumpDripFrames: PUMP_DRIP_FRAME_KEYS,
  }),
  props: Object.freeze({
    house: 'house',
    tree: 'tree',
    cross: 'cross',
    chapel: 'chapel',
    poster: 'poster',
    projectPoster: 'project-poster',
    shadowBoss: 'shadow-boss',
    dryCrop: 'dry-crop',
    fertilizerSack: 'fertilizer-sack',
    debtLedger: 'debt-ledger',
    communityBoard: 'community-board',
    waterGate: 'water-gate',
    bambooFence: 'bamboo-fence',
    objectiveMarker: 'objective-marker',
    sproutPatch: 'sprout-patch',
    riceRow: 'rice-row',
    endingGateLocked: 'ending-gate-locked',
    endingGateOpen: 'ending-gate-open',
  }),
  ui: Object.freeze({
    panel: 'ui-panel',
    taskIcons: Object.freeze({
      listen: 'task-listen',
      document: 'task-document',
      repair: 'task-repair',
    }),
  }),
})

export const ANIMATION_KEYS = Object.freeze({
  waterFlow: WATER_ANIMATION_KEY,
  pumpDrip: PUMP_DRIP_ANIMATION_KEY,
})

function createTexture(scene, key, width, height, draw) {
  if (scene.textures.exists(key)) {
    return false
  }

  const graphics = scene.make.graphics({ x: 0, y: 0, add: false })
  draw(graphics, width, height)
  graphics.generateTexture(key, width, height)
  graphics.destroy()

  return true
}

function drawCharacter(graphics, width, height, palette) {
  graphics.clear()
  graphics.fillStyle(0x3b291d, 0.35)
  graphics.fillEllipse(width * 0.5, height - 4, width * 0.68, 10)

  graphics.fillStyle(palette.skin)
  graphics.fillCircle(width * 0.5, 12, 9)

  graphics.fillStyle(palette.hair)
  graphics.fillEllipse(width * 0.5, 9, 18, 11)
  graphics.fillRect(width * 0.28, 7, width * 0.44, 5)

  graphics.fillStyle(palette.body)
  graphics.fillRoundedRect(width * 0.22, 20, width * 0.56, 17, 5)

  graphics.fillStyle(palette.accent)
  graphics.fillRect(width * 0.27, 26, width * 0.46, 4)

  graphics.fillStyle(0x5a3d28)
  graphics.fillRect(width * 0.27, 37, 7, 10)
  graphics.fillRect(width * 0.59, 37, 7, 10)

  graphics.fillStyle(palette.body)
  graphics.fillRect(width * 0.17, 22, 5, 15)
  graphics.fillRect(width * 0.78, 22, 5, 15)

  graphics.fillStyle(0x1f120d)
  graphics.fillCircle(width * 0.43, 12, 1.5)
  graphics.fillCircle(width * 0.57, 12, 1.5)
}

function drawMotherCharacter(graphics, width, height) {
  const shadow = 0x2c1912
  const skin = 0xcfab85
  const skinShadow = 0xad8667
  const hair = 0x241510
  const hairHighlight = 0x5a4031
  const blouse = 0x995846
  const blouseHighlight = 0xc18269
  const skirt = 0x54453d
  const skirtShadow = 0x3a2f29
  const apron = 0xc5af87
  const sandal = 0x4d3628
  const eye = 0x1a100c

  graphics.clear()
  graphics.fillStyle(shadow, 0.34)
  graphics.fillEllipse(width * 0.5, height - 4, width * 0.62, 9)

  graphics.fillStyle(sandal)
  graphics.fillRect(14, height - 8, 5, 3)
  graphics.fillRect(22, height - 8, 5, 3)

  graphics.fillStyle(skirtShadow)
  graphics.fillTriangle(10, 31, 30, 31, 31, height - 9)

  graphics.fillStyle(skirt)
  graphics.fillRoundedRect(12, 29, 16, 10, 4)
  graphics.fillTriangle(11, 36, 29, 36, 30, height - 10)

  graphics.fillStyle(apron)
  graphics.fillRect(17, 29, 5, 12)
  graphics.fillRect(15, 40, 9, 2)

  graphics.fillStyle(blouse)
  graphics.fillRoundedRect(10, 19, 19, 14, 5)

  graphics.fillStyle(blouseHighlight)
  graphics.fillRect(13, 22, 11, 3)
  graphics.fillRect(15, 26, 8, 2)

  graphics.fillStyle(blouse)
  graphics.fillRect(8, 22, 4, 11)
  graphics.fillRect(28, 23, 4, 8)
  graphics.fillRect(25, 29, 7, 4)

  graphics.fillStyle(skinShadow)
  graphics.fillRect(8, 33, 4, 4)
  graphics.fillRect(24, 29, 4, 5)
  graphics.fillRect(17, 17, 4, 4)

  graphics.fillStyle(skin)
  graphics.fillCircle(19, 11, 7)
  graphics.fillRect(17, 17, 4, 3)

  graphics.fillStyle(hair)
  graphics.fillEllipse(19, 9, 18, 11)
  graphics.fillRect(11, 6, 15, 6)
  graphics.fillRect(10, 10, 4, 9)
  graphics.fillCircle(27, 13, 4)

  graphics.fillStyle(hairHighlight)
  graphics.fillRect(13, 7, 7, 1)
  graphics.fillRect(24, 11, 2, 2)

  graphics.fillStyle(eye)
  graphics.fillCircle(17, 11, 1.3)
  graphics.fillCircle(21, 11, 1.3)
  graphics.fillRect(17, 15, 4, 1)
}

function drawChildCharacter(graphics, width, height) {
  const shadow = 0x2c1912
  const skin = 0xe0ba92
  const skinShadow = 0xb68d6f
  const hair = 0x2a1711
  const hairHighlight = 0x5e4538
  const top = 0xb8c5ab
  const topShadow = 0x8e9b81
  const collar = 0xeaddc3
  const skirt = 0x617490
  const skirtShadow = 0x445163
  const shoe = 0x473227
  const eye = 0x1a100c

  graphics.clear()
  graphics.fillStyle(shadow, 0.32)
  graphics.fillEllipse(width * 0.5, height - 4, width * 0.52, 8)

  graphics.fillStyle(shoe)
  graphics.fillRect(12, height - 7, 4, 2)
  graphics.fillRect(18, height - 7, 4, 2)

  graphics.fillStyle(skirtShadow)
  graphics.fillTriangle(9, 28, 23, 28, 24, 38)

  graphics.fillStyle(skirt)
  graphics.fillRoundedRect(10, 27, 12, 8, 4)
  graphics.fillTriangle(10, 32, 22, 32, 23, 38)

  graphics.fillStyle(topShadow)
  graphics.fillRoundedRect(9, 19, 14, 11, 4)

  graphics.fillStyle(top)
  graphics.fillRoundedRect(8, 18, 15, 10, 4)

  graphics.fillStyle(collar)
  graphics.fillRect(11, 21, 9, 3)
  graphics.fillRect(15, 24, 2, 5)

  graphics.fillStyle(topShadow)
  graphics.fillRect(6, 22, 3, 9)
  graphics.fillRect(23, 22, 3, 9)

  graphics.fillStyle(skinShadow)
  graphics.fillRect(6, 30, 3, 3)
  graphics.fillRect(23, 30, 3, 3)
  graphics.fillRect(13, 38, 3, 6)
  graphics.fillRect(18, 38, 3, 6)
  graphics.fillRect(14, 17, 4, 3)

  graphics.fillStyle(skin)
  graphics.fillCircle(16, 11, 7)
  graphics.fillRect(14, 17, 4, 2)

  graphics.fillStyle(hair)
  graphics.fillEllipse(16, 9, 18, 11)
  graphics.fillRect(9, 6, 14, 5)
  graphics.fillRect(8, 10, 4, 8)
  graphics.fillRect(21, 10, 4, 8)
  graphics.fillCircle(23, 14, 3)

  graphics.fillStyle(hairHighlight)
  graphics.fillRect(11, 7, 6, 1)
  graphics.fillRect(20, 11, 2, 1)

  graphics.fillStyle(eye)
  graphics.fillCircle(14, 11, 1.2)
  graphics.fillCircle(18, 11, 1.2)
  graphics.fillRect(14, 15, 4, 1)
}

function drawGround(graphics, width, height) {
  graphics.clear()
  graphics.fillStyle(0x8c6239)
  graphics.fillRect(0, 0, width, height)

  graphics.fillStyle(0x9c7345)
  graphics.fillRect(0, 0, width, height * 0.28)

  graphics.lineStyle(2, 0x6d4727, 0.8)
  graphics.beginPath()
  graphics.moveTo(8, 14)
  graphics.lineTo(20, 20)
  graphics.lineTo(16, 34)
  graphics.lineTo(31, 41)
  graphics.lineTo(27, 56)
  graphics.strokePath()

  graphics.beginPath()
  graphics.moveTo(46, 7)
  graphics.lineTo(39, 19)
  graphics.lineTo(52, 28)
  graphics.lineTo(44, 43)
  graphics.lineTo(56, 57)
  graphics.strokePath()

  graphics.fillStyle(0xa98052)
  graphics.fillCircle(11, 52, 3)
  graphics.fillCircle(38, 9, 2)
  graphics.fillCircle(52, 47, 4)
}

function drawGroundGreen(graphics, width, height) {
  drawGround(graphics, width, height)

  graphics.fillStyle(0x7fb062, 0.92)
  graphics.fillRect(0, 0, width, height * 0.24)

  graphics.fillStyle(0x9dd27c, 0.88)
  graphics.fillRect(0, 8, width, 6)

  graphics.lineStyle(2, 0x5f9148, 0.75)
  graphics.beginPath()
  graphics.moveTo(10, 22)
  graphics.lineTo(17, 12)
  graphics.moveTo(26, 24)
  graphics.lineTo(30, 13)
  graphics.moveTo(44, 26)
  graphics.lineTo(49, 15)
  graphics.strokePath()
}

function drawTerracePlatform(graphics, width, height, palette = {}) {
  const grassHighlight = palette.grassHighlight ?? 0x97a266
  const grass = palette.grass ?? 0x768450
  const grassShadow = palette.grassShadow ?? 0x55653a
  const dryGrass = palette.dryGrass ?? 0xb0a06c
  const lip = palette.lip ?? 0x5f4025
  const soilHighlight = palette.soilHighlight ?? 0xa57042
  const soilMid = palette.soilMid ?? 0x7d4d2d
  const soilLow = palette.soilLow ?? 0x6a3f23
  const soilShadow = palette.soilShadow ?? 0x432716
  const root = palette.root ?? 0x603a1f
  const pebble = palette.pebble ?? 0xbb8c56

  graphics.clear()

  graphics.fillStyle(soilShadow)
  graphics.fillRect(0, 0, width, height)

  graphics.fillStyle(grassShadow)
  graphics.fillRect(0, 0, width, 6)

  graphics.fillStyle(grass)
  graphics.fillRect(0, 0, width, 4)

  graphics.fillStyle(grassHighlight)
  graphics.fillRect(0, 0, width, 1)

  graphics.fillStyle(dryGrass)
  ;[4, 18, 31, 46, 58].forEach((x, index) => {
    const tuftWidth = index % 2 === 0 ? 6 : 5
    graphics.fillRect(x, 2, Math.min(tuftWidth, width - x), 2)
  })

  graphics.fillStyle(grass)
  ;[6, 14, 22, 34, 42, 50, 60].forEach((x, index) => {
    const fringeHeight = index % 3 === 0 ? 3 : 2
    graphics.fillRect(x, 4, Math.min(2, width - x), fringeHeight)
  })

  graphics.fillStyle(lip)
  graphics.fillRect(0, 5, width, 2)

  graphics.fillStyle(soilHighlight)
  graphics.fillRect(0, 7, width, 3)

  graphics.fillStyle(soilMid)
  graphics.fillRect(0, 10, width, 4)

  graphics.fillStyle(soilLow)
  graphics.fillRect(0, 14, width, Math.max(height - 18, 1))

  graphics.fillStyle(pebble)
  ;[
    [10, 12, 4, 1],
    [26, 15, 5, 1],
    [41, 11, 4, 1],
    [54, 14, 6, 1],
  ].forEach(([x, y, rectWidth, rectHeight]) => {
    graphics.fillRect(x, y, rectWidth, rectHeight)
  })

  graphics.lineStyle(1, root, 1)
  graphics.beginPath()
  graphics.moveTo(8, 16)
  graphics.lineTo(14, 18)
  graphics.lineTo(11, 21)
  graphics.moveTo(28, 13)
  graphics.lineTo(33, 15)
  graphics.lineTo(31, 18)
  graphics.moveTo(47, 16)
  graphics.lineTo(53, 18)
  graphics.lineTo(50, 21)
  graphics.strokePath()

  graphics.fillStyle(soilShadow)
  graphics.fillRect(0, height - 4, width, 4)
}

function drawTerracePlatformSmall(graphics, width, height) {
  const grassHighlight = 0x95a166
  const grass = 0x6e7d4b
  const grassShadow = 0x4d5e37
  const dryGrass = 0xa99b68
  const lip = 0x564026
  const soilHighlight = 0x91623a
  const soilMid = 0x714525
  const soilShadow = 0x3f2414
  const stone = 0x8a643d
  const root = 0x5a341b

  graphics.clear()

  graphics.fillStyle(soilShadow)
  graphics.fillRect(0, 0, width, height)

  graphics.fillStyle(grassShadow)
  graphics.fillRect(0, 0, width, 5)

  graphics.fillStyle(grass)
  graphics.fillRect(0, 0, width, 3)

  graphics.fillStyle(grassHighlight)
  graphics.fillRect(0, 0, width, 1)

  graphics.fillStyle(dryGrass)
  ;[6, 20, 36, 52].forEach((x) => {
    graphics.fillRect(x, 2, Math.min(5, width - x), 1)
  })

  graphics.fillStyle(grass)
  ;[8, 18, 28, 40, 50, 60].forEach((x, index) => {
    graphics.fillRect(x, 3, Math.min(2, width - x), index % 2 === 0 ? 2 : 1)
  })

  graphics.fillStyle(lip)
  graphics.fillRect(0, 4, width, 2)

  graphics.fillStyle(soilHighlight)
  graphics.fillRect(0, 6, width, 3)

  graphics.fillStyle(soilMid)
  graphics.fillRect(0, 9, width, Math.max(height - 12, 1))

  graphics.fillStyle(stone)
  ;[
    [12, 12, 5, 2],
    [31, 14, 6, 1],
    [48, 11, 4, 2],
  ].forEach(([x, y, rectWidth, rectHeight]) => {
    graphics.fillRect(x, y, rectWidth, rectHeight)
  })

  graphics.lineStyle(1, root, 1)
  graphics.beginPath()
  graphics.moveTo(16, 15)
  graphics.lineTo(22, 17)
  graphics.moveTo(42, 13)
  graphics.lineTo(48, 16)
  graphics.strokePath()

  graphics.fillStyle(soilShadow)
  graphics.fillRect(0, height - 3, width, 3)
}

function drawBambooPlatform(graphics, width, height) {
  const poleOutline = 0x6a4a2c
  const poleFill = 0xbf9860
  const poleHighlight = 0xe0c68c
  const poleShadow = 0x8d6a42
  const rope = 0x73583a
  const ropeShadow = 0x4c3925
  const support = 0x5c4329
  const shadow = 0x392616
  const poleWidth = 14
  const poleGap = 2

  graphics.clear()

  graphics.fillStyle(shadow)
  graphics.fillRect(0, height - 4, width, 4)

  graphics.fillStyle(support)
  graphics.fillRect(0, height - 7, width, 3)

  for (let x = 0; x < width; x += poleWidth + poleGap) {
    const currentWidth = Math.min(poleWidth, width - x)
    if (currentWidth <= 0) {
      continue
    }

    graphics.fillStyle(poleOutline)
    graphics.fillRect(x, 0, currentWidth, height - 5)

    graphics.fillStyle(poleFill)
    graphics.fillRect(x + 1, 0, Math.max(currentWidth - 2, 1), height - 8)

    graphics.fillStyle(poleHighlight)
    graphics.fillRect(x + 1, 0, Math.max(currentWidth - 2, 1), 1)

    graphics.fillStyle(poleShadow)
    graphics.fillRect(x + 1, 6, Math.max(currentWidth - 2, 1), 1)
    graphics.fillRect(x + 1, 13, Math.max(currentWidth - 2, 1), 1)
    graphics.fillRect(x + 1, height - 8, Math.max(currentWidth - 2, 1), 1)
  }

  graphics.fillStyle(ropeShadow)
  ;[14, 30, 46, 62].forEach((x) => {
    if (x < width) {
      graphics.fillRect(x, 2, Math.min(2, width - x), height - 8)
    }
  })

  graphics.fillStyle(rope)
  ;[14, 30, 46, 62].forEach((x) => {
    if (x < width) {
      graphics.fillRect(x, 1, Math.min(2, width - x), height - 10)
      graphics.fillRect(Math.max(x - 1, 0), 7, Math.min(4, width - Math.max(x - 1, 0)), 1)
    }
  })
}

function drawCanalPlatform(graphics, width, height) {
  const concreteHighlight = 0xd5d0bf
  const concreteTop = 0xb8b19e
  const concreteLip = 0x8c877a
  const concreteFace = 0x77746b
  const concreteShadow = 0x5b5953
  const crack = 0x4e4d48
  const moss = 0x6e7b4f
  const mud = 0x5d4227
  const mudShadow = 0x3c2818

  graphics.clear()

  graphics.fillStyle(concreteHighlight)
  graphics.fillRect(0, 0, width, 1)

  graphics.fillStyle(concreteTop)
  graphics.fillRect(0, 1, width, 4)

  graphics.fillStyle(concreteLip)
  graphics.fillRect(0, 5, width, 2)

  graphics.fillStyle(concreteFace)
  graphics.fillRect(0, 7, width, Math.max(height - 11, 1))

  graphics.fillStyle(concreteShadow)
  graphics.fillRect(0, 13, width, Math.max(height - 17, 1))

  graphics.fillStyle(moss)
  graphics.fillRect(10, 6, 8, 2)
  graphics.fillRect(31, 6, 10, 2)
  graphics.fillRect(50, 6, 7, 2)

  graphics.lineStyle(1, crack, 1)
  graphics.beginPath()
  graphics.moveTo(12, 10)
  graphics.lineTo(17, 13)
  graphics.lineTo(15, 16)
  graphics.moveTo(34, 9)
  graphics.lineTo(39, 11)
  graphics.lineTo(36, 15)
  graphics.moveTo(53, 11)
  graphics.lineTo(58, 14)
  graphics.strokePath()

  graphics.fillStyle(mud)
  graphics.fillRect(0, height - 4, width, 2)
  graphics.fillRect(6, height - 6, 10, 2)
  graphics.fillRect(42, height - 6, 14, 2)

  graphics.fillStyle(mudShadow)
  graphics.fillRect(0, height - 2, width, 2)
}

function drawCanalDry(graphics, width, height) {
  graphics.clear()
  graphics.fillStyle(0x7b5630)
  graphics.fillRect(0, 0, width, height)

  graphics.fillStyle(0xa07749)
  graphics.fillRect(0, 0, width, 6)
  graphics.fillRect(0, height - 6, width, 6)

  graphics.fillStyle(0x5a3f25)
  graphics.fillRoundedRect(0, 6, width, height - 12, 8)

  graphics.fillStyle(0x6b4a2a)
  graphics.fillRoundedRect(4, 10, width - 8, height - 20, 8)

  graphics.lineStyle(2, 0x8a6339, 0.65)
  graphics.beginPath()
  graphics.moveTo(10, height * 0.45)
  graphics.lineTo(width * 0.36, height * 0.62)
  graphics.lineTo(width * 0.58, height * 0.38)
  graphics.lineTo(width - 8, height * 0.55)
  graphics.strokePath()
}

function drawCanalWater(graphics, width, height, frameIndex) {
  const foamOffset = frameIndex * 8
  const rippleOffset = frameIndex * 10

  graphics.clear()
  drawCanalDry(graphics, width, height)

  graphics.fillStyle(0x164867)
  graphics.fillRoundedRect(4, 8, width - 8, height - 16, 8)

  graphics.fillStyle(0x23769f, 0.98)
  graphics.fillRoundedRect(6, 11, width - 12, height - 20, 8)

  graphics.fillStyle(0x4fbfe0, 0.72)
  graphics.fillRect(8, 12, width - 16, 4)

  graphics.fillStyle(0x1f5e86, 0.62)
  graphics.fillRoundedRect(9, height * 0.48, width - 18, height * 0.18, 6)

  graphics.lineStyle(3, 0x9ae7f2, 0.6)
  for (let index = -1; index < 5; index += 1) {
    const startX = ((index * 16 + rippleOffset) % (width + 26)) - 12
    graphics.beginPath()
    graphics.moveTo(startX, 18)
    graphics.lineTo(startX + 8, 14)
    graphics.lineTo(startX + 16, 19)
    graphics.lineTo(startX + 24, 15)
    graphics.lineTo(startX + 31, 20)
    graphics.strokePath()
  }

  graphics.fillStyle(0xe4fbff, 0.9)
  for (let index = 0; index < 5; index += 1) {
    const x = (foamOffset + index * 16) % width
    graphics.fillCircle(x, height * 0.4, 1.9)
    graphics.fillCircle((x + 7) % width, height * 0.54, 1.5)
    graphics.fillCircle((x + 12) % width, height * 0.68, 1.2)
  }
}

function drawHouse(graphics, width, height) {
  const shadow = 0x2e1a11
  const earth = 0x4c2d1b
  const post = 0x5e3c28
  const postHighlight = 0x8a6243
  const wallDark = 0x6e4d30
  const wallMid = 0x946845
  const wallLight = 0xb88558
  const roofDark = 0x4d2318
  const roofMid = 0x6d3324
  const roofLight = 0x8f5038
  const trim = 0x3b2318
  const windowFrame = 0x583623
  const windowLight = 0xe8d7aa
  const windowShadow = 0xb9915d
  const doorway = 0x26140d
  const doorstep = 0x6f5535
  const grass = 0x7b8551

  graphics.clear()
  graphics.fillStyle(shadow, 0.32)
  graphics.fillEllipse(width * 0.5, height - 4, width * 0.84, 12)

  graphics.fillStyle(earth, 0.72)
  graphics.fillRoundedRect(16, height - 10, width - 32, 6, 3)

  graphics.fillStyle(post)
  graphics.fillRect(20, 32, 6, height - 18)
  graphics.fillRect(33, 34, 5, height - 20)
  graphics.fillRect(width - 38, 34, 5, height - 20)
  graphics.fillRect(width - 26, 32, 6, height - 18)

  graphics.fillStyle(postHighlight)
  graphics.fillRect(21, 33, 1, height - 20)
  graphics.fillRect(width - 25, 33, 1, height - 20)

  graphics.fillStyle(roofDark)
  graphics.fillTriangle(width * 0.5, 5, 4, 32, width - 4, 36)

  graphics.fillStyle(roofMid)
  graphics.fillTriangle(width * 0.5, 8, 8, 32, width - 10, 35)

  graphics.lineStyle(2, roofLight, 0.9)
  graphics.beginPath()
  graphics.moveTo(width * 0.5, 9)
  graphics.lineTo(18, 28)
  graphics.moveTo(width * 0.5, 9)
  graphics.lineTo(width - 24, 28)
  graphics.strokePath()

  graphics.lineStyle(1.5, trim, 0.75)
  ;[18, 22, 26, 30].forEach((roofY) => {
    graphics.beginPath()
    graphics.moveTo(16 + (roofY - 18), roofY)
    graphics.lineTo(width - 16 - Math.max(roofY - 18, 0), roofY + 2)
    graphics.strokePath()
  })

  graphics.fillStyle(trim)
  graphics.fillRect(13, 31, width - 26, 4)

  graphics.fillStyle(wallDark)
  graphics.fillRoundedRect(18, 34, width - 36, height - 24, 5)

  graphics.fillStyle(wallMid)
  graphics.fillRoundedRect(20, 36, width - 40, height - 28, 4)

  graphics.fillStyle(wallLight)
  graphics.fillRect(23, 38, 18, 3)
  graphics.fillRect(23, 44, 10, 2)

  graphics.lineStyle(1.5, wallDark, 0.5)
  ;[30, 39, 48, 58, 67].forEach((panelX) => {
    graphics.beginPath()
    graphics.moveTo(panelX, 38)
    graphics.lineTo(panelX, height - 16)
    graphics.strokePath()
  })
  graphics.beginPath()
  graphics.moveTo(22, 48)
  graphics.lineTo(width - 22, 48)
  graphics.strokePath()

  graphics.fillStyle(doorway)
  graphics.fillRoundedRect(width * 0.44, height - 32, 14, 22, 4)

  graphics.fillStyle(0x4f3324)
  graphics.fillRect(width * 0.45, height - 29, 4, 16)

  graphics.fillStyle(doorstep)
  graphics.fillRoundedRect(width * 0.41, height - 9, 18, 4, 2)

  graphics.fillStyle(windowFrame)
  graphics.fillRoundedRect(23, 40, 16, 12, 2)
  graphics.fillRoundedRect(width - 39, 41, 14, 11, 2)

  graphics.fillStyle(windowLight)
  graphics.fillRect(26, 43, 10, 6)
  graphics.fillRect(width - 36, 44, 8, 5)

  graphics.fillStyle(windowShadow)
  graphics.fillRect(26, 49, 10, 1)
  graphics.fillRect(width - 36, 48, 8, 1)

  graphics.lineStyle(1.5, trim, 0.7)
  graphics.beginPath()
  graphics.moveTo(31, 40)
  graphics.lineTo(31, 52)
  graphics.moveTo(width - 32, 41)
  graphics.lineTo(width - 32, 52)
  graphics.strokePath()

  graphics.fillStyle(grass, 0.62)
  graphics.fillRect(18, height - 10, 8, 2)
  graphics.fillRect(width - 28, height - 10, 9, 2)
}

function drawTree(graphics, width, height) {
  graphics.clear()
  graphics.fillStyle(0x3b291d, 0.26)
  graphics.fillEllipse(width * 0.5, height - 6, width * 0.72, 12)

  graphics.fillStyle(0x6f4a2a)
  graphics.fillRoundedRect(width * 0.43, height - 38, 14, 28, 5)

  graphics.fillStyle(0x2f6f38)
  graphics.fillCircle(width * 0.5, 28, 18)
  graphics.fillCircle(width * 0.34, 38, 14)
  graphics.fillCircle(width * 0.66, 38, 14)
  graphics.fillCircle(width * 0.5, 48, 16)

  graphics.fillStyle(0x4f9a52, 0.85)
  graphics.fillCircle(width * 0.38, 30, 6)
  graphics.fillCircle(width * 0.62, 35, 5)
  graphics.fillCircle(width * 0.56, 22, 4)
}

function drawCross(graphics, width, height) {
  graphics.clear()
  graphics.fillStyle(0x3b291d, 0.28)
  graphics.fillEllipse(width * 0.5, height - 4, width * 0.56, 8)

  graphics.fillStyle(0x7b6245)
  graphics.fillRoundedRect(width * 0.44, 10, 8, height - 18, 4)
  graphics.fillRoundedRect(width * 0.28, 24, width * 0.44, 8, 4)

  graphics.fillStyle(0x9f815c, 0.65)
  graphics.fillRect(width * 0.46, 12, 2, height - 24)
}

function drawChapel(graphics, width, height) {
  graphics.clear()
  graphics.fillStyle(0x3b291d, 0.3)
  graphics.fillEllipse(width * 0.5, height - 4, width * 0.74, 12)

  graphics.fillStyle(0xe2d7bf)
  graphics.fillRoundedRect(16, 28, width - 32, height - 40, 8)

  graphics.fillStyle(0x7d4635)
  graphics.fillTriangle(width * 0.5, 6, 10, 34, width - 10, 34)

  graphics.fillStyle(0x6f4a2a)
  graphics.fillRoundedRect(width * 0.42, height - 34, 16, 22, 6)

  graphics.fillStyle(0xbcae86)
  graphics.fillRect(24, 38, 10, 14)
  graphics.fillRect(width - 34, 38, 10, 14)

  graphics.fillStyle(0x7b6245)
  graphics.fillRoundedRect(width * 0.47, 10, 6, 18, 3)
  graphics.fillRoundedRect(width * 0.39, 16, 18, 5, 2)
}

function drawPoster(graphics, width, height) {
  graphics.clear()
  graphics.fillStyle(0x694c2a)
  graphics.fillRoundedRect(3, 0, width - 6, height, 4)

  graphics.fillStyle(0xe7ddb7)
  graphics.fillRoundedRect(6, 3, width - 12, height - 6, 3)

  graphics.lineStyle(2, 0x8c2f20, 0.95)
  graphics.strokeRect(11, 10, width - 22, 10)
  graphics.lineStyle(2, 0x8b7d5c, 0.8)
  graphics.lineBetween(11, 27, width - 11, 27)
  graphics.lineBetween(11, 33, width - 11, 33)
  graphics.lineBetween(11, 39, width - 11, 39)
}

function drawProjectPoster(graphics, width, height) {
  drawPoster(graphics, width, height)

  graphics.fillStyle(0x8c2f20)
  graphics.fillRect(10, 9, width - 20, 8)

  graphics.lineStyle(2, 0x55778a, 0.9)
  graphics.lineBetween(11, 24, width - 11, 24)
  graphics.lineBetween(11, 31, width - 11, 31)

  graphics.fillStyle(0x5b6e46, 0.8)
  graphics.fillRoundedRect(12, height - 13, width - 24, 5, 2)
}

function drawDryCrop(graphics, width, height) {
  graphics.clear()
  graphics.fillStyle(0x3b291d, 0.28)
  graphics.fillEllipse(width * 0.5, height - 4, width * 0.94, 12)

  graphics.fillStyle(0x6d4d2c, 0.92)
  graphics.fillRoundedRect(8, height - 16, width - 16, 10, 5)
  graphics.lineStyle(2, 0x8a6237, 0.7)
  ;[
    [10, height - 11, 22, height - 14, 34, height - 10],
    [36, height - 9, 50, height - 14, 64, height - 11],
    [62, height - 10, 76, height - 14, 90, height - 8],
  ].forEach(([x1, y1, x2, y2, x3, y3]) => {
    graphics.beginPath()
    graphics.moveTo(x1, y1)
    graphics.lineTo(x2, y2)
    graphics.lineTo(x3, y3)
    graphics.strokePath()
  })

  const clusters = [
    { baseX: width * 0.12, baseY: height - 8, heightScale: 0.54 },
    { baseX: width * 0.28, baseY: height - 10, heightScale: 0.44 },
    { baseX: width * 0.46, baseY: height - 7, heightScale: 0.48 },
    { baseX: width * 0.64, baseY: height - 11, heightScale: 0.4 },
    { baseX: width * 0.82, baseY: height - 8, heightScale: 0.46 },
  ]

  graphics.lineStyle(3, 0x7f5c2c, 0.95)
  clusters.forEach(({ baseX, baseY, heightScale }, clusterIndex) => {
    const stemOffsets = [-8, -2, 4, 9]
    stemOffsets.forEach((offset, stemIndex) => {
      const lean = (stemIndex - 1.5) * 4 + (clusterIndex % 2 === 0 ? -3 : 3)
      const tipX = baseX + offset + lean
      const tipY = height * heightScale - stemIndex * 2
      graphics.lineBetween(baseX + offset * 0.28, baseY, tipX, tipY)

      graphics.lineStyle(2, 0xa47b3e, 0.88)
      graphics.lineBetween(tipX, tipY + 4, tipX - 8, tipY - 1)
      graphics.lineBetween(tipX + 1, tipY + 3, tipX + 9, tipY)

      graphics.fillStyle(0xc39852, 0.88)
      graphics.fillEllipse(tipX + 3, tipY - 2, 8, 4)
      graphics.lineStyle(3, 0x7f5c2c, 0.95)
    })
  })
}

function drawFertilizerSack(graphics, width, height) {
  const shadow = 0x2c1912
  const sackDark = 0xa99979
  const sackMid = 0xd6c7a6
  const sackLight = 0xeadebe
  const stitch = 0x7a6447
  const strap = 0xaf6d3c
  const strapLight = 0xd18b54
  const label = 0x6b573c
  const fold = 0x9b8563

  graphics.clear()
  graphics.fillStyle(shadow, 0.24)
  graphics.fillEllipse(width * 0.5, height - 4, width * 0.74, 10)

  graphics.fillStyle(sackDark)
  graphics.fillRoundedRect(8, 10, width - 16, height - 16, 10)

  graphics.fillStyle(sackMid)
  graphics.fillRoundedRect(10, 12, width - 20, height - 20, 9)

  graphics.fillStyle(sackLight)
  graphics.fillRect(14, 14, width - 28, 3)
  graphics.fillRect(13, 18, 4, height - 24)

  graphics.fillStyle(strap)
  graphics.fillRect(14, 18, width - 28, 8)

  graphics.fillStyle(strapLight)
  graphics.fillRect(16, 19, width - 32, 2)

  graphics.fillStyle(label)
  graphics.fillRoundedRect(width * 0.3, height * 0.46, width * 0.4, height * 0.22, 4)

  graphics.fillStyle(fold)
  graphics.fillRect(11, 27, 3, 8)
  graphics.fillRect(width - 14, 28, 3, 7)
  graphics.fillRect(width * 0.5 - 1, 31, 2, 8)

  graphics.lineStyle(1.5, stitch, 0.7)
  graphics.beginPath()
  graphics.moveTo(14, 17)
  graphics.lineTo(width - 14, 17)
  graphics.moveTo(width * 0.5, 10)
  graphics.lineTo(width * 0.5, height - 9)
  graphics.strokePath()
}

function drawDebtLedger(graphics, width, height) {
  const shadow = 0x2c1912
  const coverDark = 0x4b2f24
  const coverMid = 0x6a4433
  const coverLight = 0x85563f
  const paper = 0xe5d8b7
  const paperShadow = 0xba9768
  const line = 0x9c7b52
  const strap = 0x3c2a20
  const corner = 0xc7b18e

  graphics.clear()
  graphics.fillStyle(shadow, 0.24)
  graphics.fillEllipse(width * 0.5, height - 4, width * 0.68, 10)

  graphics.fillStyle(coverDark)
  graphics.fillRoundedRect(6, 8, width - 12, height - 14, 6)

  graphics.fillStyle(coverMid)
  graphics.fillRoundedRect(8, 10, width - 16, height - 18, 5)

  graphics.fillStyle(coverLight)
  graphics.fillRect(10, 12, 4, height - 22)

  graphics.fillStyle(paper)
  graphics.fillRect(15, 14, width - 24, height - 24)

  graphics.fillStyle(corner)
  graphics.fillTriangle(width - 16, 14, width - 9, 14, width - 9, 21)

  graphics.fillStyle(paperShadow)
  graphics.fillRect(15, height - 11, width - 24, 2)

  graphics.lineStyle(1.5, line, 0.85)
  ;[20, 25, 30].forEach((lineY) => {
    graphics.beginPath()
    graphics.moveTo(19, lineY)
    graphics.lineTo(width - 12, lineY)
    graphics.strokePath()
  })

  graphics.fillStyle(strap)
  graphics.fillRect(width - 12, 11, 3, height - 20)
}

function drawCommunityBoard(graphics, width, height) {
  graphics.clear()
  graphics.fillStyle(0x3b291d, 0.24)
  graphics.fillEllipse(width * 0.5, height - 4, width * 0.8, 12)

  graphics.fillStyle(0x6f4a2a)
  graphics.fillRect(width * 0.22, height - 18, 8, 16)
  graphics.fillRect(width * 0.7, height - 18, 8, 16)
  graphics.fillRoundedRect(6, 8, width - 12, height - 20, 6)

  graphics.fillStyle(0xdfd3b2)
  graphics.fillRoundedRect(12, 14, width * 0.34, height * 0.24, 3)
  graphics.fillRoundedRect(width * 0.5, 14, width * 0.22, height * 0.18, 3)
  graphics.fillRoundedRect(16, height * 0.46, width * 0.26, height * 0.16, 3)
  graphics.fillRoundedRect(width * 0.46, height * 0.4, width * 0.34, height * 0.24, 3)

  graphics.fillStyle(0x8c2f20)
  graphics.fillCircle(18, 18, 2)
  graphics.fillCircle(width * 0.52, 18, 2)
  graphics.fillCircle(20, height * 0.48, 2)
}

function drawWaterGate(graphics, width, height) {
  graphics.clear()
  graphics.fillStyle(0x3b291d, 0.24)
  graphics.fillEllipse(width * 0.5, height - 5, width * 0.82, 12)

  graphics.fillStyle(0x6c5332)
  graphics.fillRect(width * 0.22, 8, 8, height - 16)
  graphics.fillRect(width * 0.7, 8, 8, height - 16)
  graphics.fillRoundedRect(width * 0.3, 12, width * 0.4, height - 24, 6)

  graphics.lineStyle(4, 0xa2b7bd, 1)
  graphics.strokeCircle(width * 0.5, height * 0.34, width * 0.15)
  graphics.lineBetween(width * 0.5, height * 0.18, width * 0.5, height * 0.5)
  graphics.lineBetween(width * 0.36, height * 0.34, width * 0.64, height * 0.34)

  graphics.fillStyle(0xcdebf3, 0.5)
  graphics.fillRect(width * 0.28, height * 0.66, width * 0.44, 5)
}

function drawBambooFence(graphics, width, height) {
  graphics.clear()
  graphics.fillStyle(0x3b291d, 0.22)
  graphics.fillEllipse(width * 0.5, height - 5, width * 0.86, 12)

  const fenceBottom = height - 10
  const postLayout = [
    { x: width * 0.18, top: 24 },
    { x: width * 0.37, top: 8 },
    { x: width * 0.63, top: 14 },
    { x: width * 0.82, top: 30 },
  ]

  const drawBambooPole = (x, top, poleWidth) => {
    const poleHeight = fenceBottom - top
    graphics.fillStyle(0x5f4628)
    graphics.fillRoundedRect(x - poleWidth / 2, top, poleWidth, poleHeight, 4)
    graphics.fillStyle(0xceaa6a)
    graphics.fillRoundedRect(x - poleWidth / 2 + 1.5, top + 2, poleWidth - 3, poleHeight - 4, 4)
    graphics.fillStyle(0xe4c988, 0.78)
    graphics.fillRect(x - poleWidth / 2 + 2, top + 6, 2, poleHeight - 14)
    graphics.fillStyle(0x8b693f, 0.84)
    ;[top + 22, top + 48, top + 78, top + 112, top + 144].forEach((jointY) => {
      if (jointY < fenceBottom - 8) {
        graphics.fillRect(x - poleWidth / 2 + 1, jointY, poleWidth - 2, 2)
      }
    })
  }

  postLayout.forEach(({ x, top }) => {
    drawBambooPole(x, top, 10)
  })

  const drawCrossbar = (y, tilt = 0) => {
    graphics.fillStyle(0x6e532f)
    graphics.fillRoundedRect(10, y + tilt, width - 20, 10, 4)
    graphics.fillStyle(0xc79f61)
    graphics.fillRoundedRect(12, y + tilt + 2, width - 24, 6, 4)
    graphics.fillStyle(0xe4c888, 0.7)
    graphics.fillRect(14, y + tilt + 2, width - 30, 2)
  }

  drawCrossbar(height * 0.3, -1)
  drawCrossbar(height * 0.5, 1)
  drawCrossbar(height * 0.7, 0)

  graphics.lineStyle(2, 0x7f6545, 0.95)
  ;[
    [postLayout[0].x + 2, height * 0.33],
    [postLayout[1].x + 1, height * 0.52],
    [postLayout[2].x - 1, height * 0.33],
    [postLayout[3].x - 2, height * 0.52],
    [postLayout[1].x, height * 0.72],
    [postLayout[2].x, height * 0.72],
  ].forEach(([x, y]) => {
    graphics.lineBetween(x - 4, y - 5, x + 4, y + 5)
    graphics.lineBetween(x - 4, y + 5, x + 4, y - 5)
  })

  graphics.fillStyle(0x6a4d2d)
  graphics.fillRoundedRect(width * 0.38, height * 0.12, width * 0.24, 18, 3)
  graphics.fillStyle(0xc79e69)
  graphics.fillRoundedRect(width * 0.39, height * 0.12 + 2, width * 0.22, 14, 3)
  graphics.lineStyle(2, 0x8d3f22, 0.9)
  graphics.lineBetween(width * 0.44, height * 0.12 + 6, width * 0.56, height * 0.12 + 12)
  graphics.lineBetween(width * 0.56, height * 0.12 + 6, width * 0.44, height * 0.12 + 12)
  graphics.lineStyle(1, 0xcab189, 0.8)
  graphics.lineBetween(width * 0.42, height * 0.12, width * 0.4, height * 0.09)
  graphics.lineBetween(width * 0.58, height * 0.12, width * 0.6, height * 0.09)

  graphics.fillStyle(0x6d5937, 0.86)
  graphics.fillRect(width * 0.12, fenceBottom - 4, width * 0.76, 4)
}

function drawObjectiveMarker(graphics, width, height) {
  graphics.clear()

  graphics.fillStyle(0x3b291d, 0.16)
  graphics.fillEllipse(width * 0.5, height - 7, width * 0.42, 8)

  graphics.fillStyle(0x6a4d2d)
  graphics.fillRoundedRect(width * 0.28, 3, width * 0.44, 18, 6)

  graphics.fillStyle(0xe7ddb7)
  graphics.fillRoundedRect(width * 0.31, 5, width * 0.38, 14, 5)

  graphics.lineStyle(2, 0x9f834f, 0.95)
  graphics.lineBetween(width * 0.39, 10, width * 0.5, 7)
  graphics.lineBetween(width * 0.61, 10, width * 0.5, 7)

  graphics.fillStyle(0x6a4d2d)
  graphics.fillTriangle(width * 0.5, height - 8, width * 0.22, 18, width * 0.78, 18)

  graphics.fillStyle(0xd3b77d)
  graphics.fillTriangle(width * 0.5, height - 11, width * 0.28, 20, width * 0.72, 20)

  graphics.fillStyle(0xf8efca, 0.8)
  graphics.fillTriangle(width * 0.5, height - 16, width * 0.36, 22, width * 0.64, 22)

  graphics.lineStyle(2, 0x7c6542, 0.8)
  graphics.lineBetween(width * 0.22, 18, width * 0.78, 18)
}

function drawSproutPatch(graphics, width, height) {
  graphics.clear()
  graphics.fillStyle(0x3b291d, 0.18)
  graphics.fillEllipse(width * 0.5, height - 4, width * 0.8, 10)

  graphics.fillStyle(0x745a35, 0.92)
  graphics.fillRoundedRect(6, height - 14, width - 12, 8, 4)

  graphics.fillStyle(0x7bc567)
  ;[
    [width * 0.18, height - 8],
    [width * 0.34, height - 12],
    [width * 0.5, height - 10],
    [width * 0.66, height - 13],
    [width * 0.8, height - 9],
  ].forEach(([x, y]) => {
    graphics.fillTriangle(x, y, x - 6, y - 12, x + 3, y - 10)
    graphics.fillTriangle(x, y, x + 6, y - 12, x - 3, y - 10)
  })

  graphics.fillStyle(0xbfe8a3, 0.88)
  ;[
    [width * 0.2, height - 18],
    [width * 0.36, height - 24],
    [width * 0.52, height - 20],
    [width * 0.68, height - 25],
    [width * 0.82, height - 18],
  ].forEach(([x, y]) => {
    graphics.fillCircle(x, y, 1.8)
  })
}

function drawRiceRow(graphics, width, height) {
  graphics.clear()
  graphics.fillStyle(0x3b291d, 0.18)
  graphics.fillEllipse(width * 0.5, height - 4, width * 0.96, 13)

  graphics.fillStyle(0x6a5433, 0.86)
  graphics.fillRoundedRect(6, height - 12, width - 12, 8, 4)

  graphics.fillStyle(0x7ea85a, 0.9)
  const backStems = 18
  for (let index = 0; index < backStems; index += 1) {
    const x = 8 + (index * (width - 16)) / (backStems - 1)
    const bladeHeight = 8 + (index % 4) * 3
    graphics.fillTriangle(x, height - 5, x - 5, height - bladeHeight - 10, x - 1, height - bladeHeight + 1)
    graphics.fillTriangle(x + 1, height - 5, x + 6, height - bladeHeight - 8, x + 2, height - bladeHeight - 1)
  }

  graphics.fillStyle(0x96c96b, 0.98)
  const frontStems = 20
  for (let index = 0; index < frontStems; index += 1) {
    const x = 6 + (index * (width - 12)) / (frontStems - 1)
    const bladeHeight = 9 + (index % 5) * 2
    graphics.fillTriangle(x, height - 4, x - 5, height - bladeHeight - 10, x - 1, height - bladeHeight + 1)
    graphics.fillTriangle(x + 2, height - 4, x + 7, height - bladeHeight - 9, x + 1, height - bladeHeight)
    graphics.fillTriangle(x + 1, height - 4, x - 2, height - bladeHeight - 6, x + 4, height - bladeHeight - 2)
  }

  graphics.fillStyle(0xd6de8a, 0.94)
  for (let index = 0; index < frontStems; index += 1) {
    const x = 10 + (index * (width - 20)) / (frontStems - 1)
    const seedY = height - 11 - (index % 3) * 2
    graphics.fillCircle(x - 1, seedY, 1.7)
    graphics.fillCircle(x + 4, seedY - 2, 1.5)
    if (index % 2 === 0) {
      graphics.fillCircle(x + 8, seedY - 1, 1.3)
    }
  }

  graphics.fillStyle(0xcfe5d7, 0.16)
  graphics.fillRect(10, height - 11, width - 20, 2)
}

function drawEndingGate(graphics, width, height, opened = false) {
  graphics.clear()
  graphics.fillStyle(0x3b291d, 0.2)
  graphics.fillEllipse(width * 0.5, height - 6, width * 0.82, 10)

  if (opened) {
    graphics.fillStyle(0x739b5c)
    graphics.fillRoundedRect(width * 0.1, 16, width * 0.18, height - 26, 5)
    graphics.fillRoundedRect(width * 0.72, 16, width * 0.18, height - 26, 5)
    graphics.fillStyle(0xdaf1ba, 0.45)
    graphics.fillRoundedRect(width * 0.33, 20, width * 0.34, height - 42, 7)
    graphics.fillStyle(0xb6d685, 0.78)
    graphics.fillRect(width * 0.17, 22, 2, height - 38)
    graphics.fillRect(width * 0.79, 22, 2, height - 38)
    graphics.lineStyle(2, 0xe9f6d2, 0.85)
    graphics.lineBetween(width * 0.38, 26, width * 0.62, 26)
    graphics.lineBetween(width * 0.4, 32, width * 0.6, 32)
    return
  }

  graphics.fillStyle(0x5d4838)
  graphics.fillRoundedRect(8, 10, width - 16, height - 20, 8)
  graphics.lineStyle(3, 0xc4ab84, 0.84)
  ;[0.24, 0.4, 0.56, 0.72].forEach((ratio) => {
    graphics.lineBetween(width * ratio, 18, width * ratio, height - 18)
  })
  graphics.lineBetween(14, height * 0.35, width - 14, height * 0.35)
  graphics.lineBetween(14, height * 0.62, width - 14, height * 0.62)
  graphics.lineBetween(16, 24, width - 16, height - 24)
  graphics.lineBetween(width - 16, 24, 16, height - 24)

  graphics.fillStyle(0xd7b782, 0.92)
  graphics.fillCircle(width * 0.5, height * 0.49, 3)
}

function drawShadowBoss(graphics, width, height) {
  graphics.clear()
  graphics.fillStyle(0x160f16, 0.42)
  graphics.fillEllipse(width * 0.5, height - 6, width * 0.84, 18)

  graphics.fillStyle(0x1a0f1d, 0.97)
  graphics.fillEllipse(width * 0.5, height * 0.48, width * 0.48, height * 0.62)
  graphics.fillEllipse(width * 0.34, height * 0.47, width * 0.18, height * 0.44)
  graphics.fillEllipse(width * 0.66, height * 0.47, width * 0.18, height * 0.44)
  graphics.fillEllipse(width * 0.5, height * 0.18, width * 0.32, height * 0.26)

  graphics.fillStyle(0x8d1935, 0.95)
  graphics.fillEllipse(width * 0.42, height * 0.34, 10, 6)
  graphics.fillEllipse(width * 0.58, height * 0.34, 10, 6)

  graphics.lineStyle(3, 0x34203a, 0.9)
  graphics.beginPath()
  graphics.moveTo(width * 0.3, height * 0.72)
  graphics.lineTo(width * 0.18, height * 0.9)
  graphics.moveTo(width * 0.7, height * 0.72)
  graphics.lineTo(width * 0.82, height * 0.9)
  graphics.strokePath()
}

function drawPanel(graphics, width, height) {
  graphics.clear()
  graphics.fillStyle(0x201913, 0.94)
  graphics.fillRoundedRect(0, 0, width, height, 14)

  graphics.fillStyle(0x36281b, 0.95)
  graphics.fillRoundedRect(6, 6, width - 12, height - 12, 12)

  graphics.lineStyle(3, 0xd3b77d, 0.85)
  graphics.strokeRoundedRect(4, 4, width - 8, height - 8, 12)

  graphics.lineStyle(2, 0x6c5332, 0.95)
  graphics.lineBetween(18, 22, width - 18, 22)
}

function drawTalkIcon(graphics, width, height) {
  graphics.clear()
  graphics.fillStyle(0x254557)
  graphics.fillRoundedRect(2, 2, width - 4, height - 8, 7)
  graphics.fillTriangle(7, height - 8, 11, height - 1, 15, height - 8)
  graphics.fillStyle(0xeff7f8)
  graphics.fillCircle(8, 11, 2)
  graphics.fillCircle(14, 11, 2)
  graphics.fillCircle(20, 11, 2)
}

function drawRepairIcon(graphics, width, height) {
  graphics.clear()
  graphics.lineStyle(4, 0x725037, 1)
  graphics.lineBetween(6, height - 6, width - 6, 6)
  graphics.lineStyle(3, 0xb98a5b, 1)
  graphics.lineBetween(11, height - 5, width - 1, 7)

  graphics.fillStyle(0x5c6f74)
  graphics.fillRoundedRect(3, 13, 11, 7, 2)
  graphics.fillStyle(0xa2b7bd)
  graphics.fillRect(12, 6, 9, 5)
}

function drawInspectIcon(graphics, width, height) {
  graphics.clear()
  graphics.lineStyle(3, 0xe6dac3, 1)
  graphics.strokeCircle(10, 10, 6)
  graphics.lineStyle(4, 0x7b6245, 1)
  graphics.lineBetween(15, 15, width - 4, height - 4)
}

export class PlaceholderTextureFactory {
  static install(scene) {
    const generated = []

    const register = (created, key) => {
      if (created) {
        generated.push(key)
      }
    }

    register(
      createTexture(scene, TEXTURE_KEYS.player, 32, 48, (graphics, width, height) => {
        drawCharacter(graphics, width, height, {
          skin: 0xd6b08a,
          hair: 0x24150f,
          body: 0x417f73,
          accent: 0xe8d07c,
        })
      }),
      TEXTURE_KEYS.player,
    )

    const npcPalettes = [
      [TEXTURE_KEYS.npcs.elder, { skin: 0xd1b694, hair: 0x6b6157, body: 0x7f6a54, accent: 0xe2d4b5 }],
      [TEXTURE_KEYS.npcs.farmer, { skin: 0xc79262, hair: 0x2a1b15, body: 0x6f8251, accent: 0xd8c074 }],
    ]

    npcPalettes.forEach(([key, palette]) => {
      register(
        createTexture(scene, key, 32, 48, (graphics, width, height) => {
          drawCharacter(graphics, width, height, palette)
        }),
        key,
      )
    })

    register(
      createTexture(scene, TEXTURE_KEYS.npcs.mother, 40, 56, drawMotherCharacter),
      TEXTURE_KEYS.npcs.mother,
    )
    register(
      createTexture(scene, TEXTURE_KEYS.npcs.child, 32, 48, drawChildCharacter),
      TEXTURE_KEYS.npcs.child,
    )

    register(createTexture(scene, TEXTURE_KEYS.terrain.ground, 64, 64, drawGround), TEXTURE_KEYS.terrain.ground)
    register(
      createTexture(scene, TEXTURE_KEYS.terrain.groundGreen, 64, 64, drawGroundGreen),
      TEXTURE_KEYS.terrain.groundGreen,
    )
    register(
      createTexture(scene, TEXTURE_KEYS.terrain.platformTerraceMain, 64, 24, drawTerracePlatform),
      TEXTURE_KEYS.terrain.platformTerraceMain,
    )
    register(
      createTexture(scene, TEXTURE_KEYS.terrain.platformTerraceSmall, 64, 24, drawTerracePlatformSmall),
      TEXTURE_KEYS.terrain.platformTerraceSmall,
    )
    register(
      createTexture(scene, TEXTURE_KEYS.terrain.platformTerraceDry, 64, 24, (graphics, width, height) => {
        drawTerracePlatform(graphics, width, height, {
          grassHighlight: 0xb5b07d,
          grass: 0x8c8a57,
          grassShadow: 0x67643d,
          dryGrass: 0xd2bb7c,
          soilHighlight: 0xa26a3c,
          soilMid: 0x784828,
          soilLow: 0x5d361f,
        })
      }),
      TEXTURE_KEYS.terrain.platformTerraceDry,
    )
    register(
      createTexture(scene, TEXTURE_KEYS.terrain.platformBamboo, 64, 24, drawBambooPlatform),
      TEXTURE_KEYS.terrain.platformBamboo,
    )
    register(
      createTexture(scene, TEXTURE_KEYS.terrain.platformCanal, 64, 24, drawCanalPlatform),
      TEXTURE_KEYS.terrain.platformCanal,
    )
    register(createTexture(scene, 'platform', 64, 24, drawTerracePlatform), 'platform')
    register(createTexture(scene, TEXTURE_KEYS.terrain.canalDry, 64, 32, drawCanalDry), TEXTURE_KEYS.terrain.canalDry)

    WATER_FRAME_KEYS.forEach((key, frameIndex) => {
      register(
        createTexture(scene, key, 64, 32, (graphics, width, height) => {
          drawCanalWater(graphics, width, height, frameIndex)
        }),
        key,
      )
    })

    register(createTexture(scene, TEXTURE_KEYS.props.house, 96, 76, drawHouse), TEXTURE_KEYS.props.house)
    register(createTexture(scene, TEXTURE_KEYS.props.tree, 64, 96, drawTree), TEXTURE_KEYS.props.tree)
    register(createTexture(scene, TEXTURE_KEYS.props.cross, 40, 64, drawCross), TEXTURE_KEYS.props.cross)
    register(createTexture(scene, TEXTURE_KEYS.props.chapel, 80, 96, drawChapel), TEXTURE_KEYS.props.chapel)
    register(createTexture(scene, TEXTURE_KEYS.props.poster, 32, 48, drawPoster), TEXTURE_KEYS.props.poster)
    register(
      createTexture(scene, TEXTURE_KEYS.props.projectPoster, 40, 56, drawProjectPoster),
      TEXTURE_KEYS.props.projectPoster,
    )
    register(createTexture(scene, TEXTURE_KEYS.props.shadowBoss, 96, 96, drawShadowBoss), TEXTURE_KEYS.props.shadowBoss)
    register(createTexture(scene, TEXTURE_KEYS.props.dryCrop, 96, 56, drawDryCrop), TEXTURE_KEYS.props.dryCrop)
    register(
      createTexture(scene, TEXTURE_KEYS.props.fertilizerSack, 42, 42, drawFertilizerSack),
      TEXTURE_KEYS.props.fertilizerSack,
    )
    register(
      createTexture(scene, TEXTURE_KEYS.props.debtLedger, 38, 38, drawDebtLedger),
      TEXTURE_KEYS.props.debtLedger,
    )
    register(
      createTexture(scene, TEXTURE_KEYS.props.communityBoard, 56, 56, drawCommunityBoard),
      TEXTURE_KEYS.props.communityBoard,
    )
    register(createTexture(scene, TEXTURE_KEYS.props.waterGate, 52, 64, drawWaterGate), TEXTURE_KEYS.props.waterGate)
    register(createTexture(scene, TEXTURE_KEYS.props.bambooFence, 104, 320, drawBambooFence), TEXTURE_KEYS.props.bambooFence)
    register(
      createTexture(scene, TEXTURE_KEYS.props.objectiveMarker, 36, 44, drawObjectiveMarker),
      TEXTURE_KEYS.props.objectiveMarker,
    )
    register(createTexture(scene, TEXTURE_KEYS.props.sproutPatch, 56, 28, drawSproutPatch), TEXTURE_KEYS.props.sproutPatch)
    register(createTexture(scene, TEXTURE_KEYS.props.riceRow, 96, 28, drawRiceRow), TEXTURE_KEYS.props.riceRow)
    register(
      createTexture(scene, TEXTURE_KEYS.props.endingGateLocked, 48, 96, (graphics, width, height) => {
        drawEndingGate(graphics, width, height, false)
      }),
      TEXTURE_KEYS.props.endingGateLocked,
    )
    register(
      createTexture(scene, TEXTURE_KEYS.props.endingGateOpen, 48, 96, (graphics, width, height) => {
        drawEndingGate(graphics, width, height, true)
      }),
      TEXTURE_KEYS.props.endingGateOpen,
    )
    register(createTexture(scene, TEXTURE_KEYS.ui.panel, 192, 96, drawPanel), TEXTURE_KEYS.ui.panel)

    const iconBuilders = [
      [TEXTURE_KEYS.ui.taskIcons.listen, drawTalkIcon],
      [TEXTURE_KEYS.ui.taskIcons.document, drawInspectIcon],
      [TEXTURE_KEYS.ui.taskIcons.repair, drawRepairIcon],
    ]

    iconBuilders.forEach(([key, draw]) => {
      register(createTexture(scene, key, 24, 24, draw), key)
    })

    this.ensureAnimations(scene)

    return {
      generated,
      textures: TEXTURE_KEYS,
      animations: ANIMATION_KEYS,
    }
  }

  static ensureAnimations(scene) {
    const playerTexture = scene.textures.exists(TEXTURE_KEYS.player)
      ? scene.textures.get(TEXTURE_KEYS.player)
      : null
    const farmerTexture = scene.textures.exists(TEXTURE_KEYS.npcs.farmer)
      ? scene.textures.get(TEXTURE_KEYS.npcs.farmer)
      : null

    if (playerTexture?.has?.(11) && !scene.anims.exists(PLAYER_ANIMATION_KEYS.idle)) {
      scene.anims.create({
        key: PLAYER_ANIMATION_KEYS.idle,
        frames: scene.anims.generateFrameNumbers(TEXTURE_KEYS.player, { start: 0, end: 3 }),
        frameRate: 4,
        repeat: -1,
      })

      scene.anims.create({
        key: PLAYER_ANIMATION_KEYS.walk,
        frames: scene.anims.generateFrameNumbers(TEXTURE_KEYS.player, { start: 4, end: 9 }),
        frameRate: 10,
        repeat: -1,
      })

      scene.anims.create({
        key: PLAYER_ANIMATION_KEYS.jump,
        frames: [{ key: TEXTURE_KEYS.player, frame: 10 }],
        frameRate: 1,
      })

      scene.anims.create({
        key: PLAYER_ANIMATION_KEYS.fall,
        frames: [{ key: TEXTURE_KEYS.player, frame: 11 }],
        frameRate: 1,
      })
    }

    if (farmerTexture?.has?.(7) && !scene.anims.exists(FARMER_ANIMATION_KEYS.idle)) {
      scene.anims.create({
        key: FARMER_ANIMATION_KEYS.idle,
        frames: scene.anims.generateFrameNumbers(TEXTURE_KEYS.npcs.farmer, { start: 0, end: 3 }),
        frameRate: 4,
        repeat: -1,
      })

      scene.anims.create({
        key: FARMER_ANIMATION_KEYS.talk,
        frames: scene.anims.generateFrameNumbers(TEXTURE_KEYS.npcs.farmer, { start: 4, end: 7 }),
        frameRate: 5,
        repeat: -1,
      })
    }

    if (scene.anims.exists(ANIMATION_KEYS.waterFlow)) {
      if (!scene.anims.exists(ANIMATION_KEYS.pumpDrip)) {
        scene.anims.create({
          key: ANIMATION_KEYS.pumpDrip,
          frames: PUMP_DRIP_FRAME_KEYS.map((key) => ({ key })),
          frameRate: 6,
          repeat: -1,
        })
      }
      return
    }

    // Keep the animation key stable so later sprite sheets can replace these frame keys.
    scene.anims.create({
      key: ANIMATION_KEYS.waterFlow,
      frames: WATER_FRAME_KEYS.map((key) => ({ key })),
      frameRate: 5,
      repeat: -1,
    })

    if (!scene.anims.exists(ANIMATION_KEYS.pumpDrip)) {
      scene.anims.create({
        key: ANIMATION_KEYS.pumpDrip,
        frames: PUMP_DRIP_FRAME_KEYS.map((key) => ({ key })),
        frameRate: 6,
        repeat: -1,
      })
    }
  }
}

export { PUMP_DRIP_FRAME_KEYS, WATER_FRAME_KEYS }
