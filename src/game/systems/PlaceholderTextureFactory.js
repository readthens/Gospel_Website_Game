const WATER_FRAME_KEYS = Object.freeze([
  'canal-water-0',
  'canal-water-1',
  'canal-water-2',
  'canal-water-3',
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
    canalDry: 'canal-dry',
    canalWaterFrames: WATER_FRAME_KEYS,
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
  waterFlow: 'water-flow',
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

function drawPlatform(graphics, width, height) {
  graphics.clear()
  graphics.fillStyle(0x8f6b42)
  graphics.fillRoundedRect(0, 2, width, height - 4, 6)
  graphics.fillStyle(0xb28959)
  graphics.fillRect(4, 4, width - 8, 6)
  graphics.lineStyle(2, 0x6f4f2e, 0.85)
  graphics.lineBetween(8, height - 6, width - 8, height - 6)
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
  graphics.clear()
  graphics.fillStyle(0x3b291d, 0.28)
  graphics.fillEllipse(width * 0.5, height - 4, width * 0.82, 12)

  graphics.fillStyle(0xb98a5b)
  graphics.fillRoundedRect(12, 30, width - 24, height - 40, 6)

  graphics.fillStyle(0x7d4635)
  graphics.fillTriangle(width * 0.5, 8, 4, 34, width - 4, 34)

  graphics.fillStyle(0x68422f)
  graphics.fillRoundedRect(width * 0.42, height - 30, 14, 20, 4)

  graphics.fillStyle(0xe8d8a9)
  graphics.fillRect(16, 38, 12, 10)
  graphics.fillRect(width - 28, 38, 12, 10)

  graphics.lineStyle(2, 0x4c3020, 0.8)
  graphics.strokeRoundedRect(12, 30, width - 24, height - 40, 6)
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
  graphics.clear()
  graphics.fillStyle(0x3b291d, 0.22)
  graphics.fillEllipse(width * 0.5, height - 4, width * 0.74, 10)

  graphics.fillStyle(0xd9ceb0)
  graphics.fillRoundedRect(10, 10, width - 20, height - 18, 10)
  graphics.fillStyle(0xb26e3a)
  graphics.fillRect(16, 18, width - 32, 8)
  graphics.fillStyle(0x6e5738)
  graphics.fillRoundedRect(width * 0.32, height * 0.45, width * 0.36, height * 0.22, 4)
  graphics.fillStyle(0xe7ddb7)
  graphics.fillRect(14, 14, width - 28, 3)
}

function drawDebtLedger(graphics, width, height) {
  graphics.clear()
  graphics.fillStyle(0x3b291d, 0.22)
  graphics.fillEllipse(width * 0.5, height - 4, width * 0.68, 10)

  graphics.fillStyle(0x5f3f2e)
  graphics.fillRoundedRect(8, 8, width - 16, height - 16, 6)
  graphics.fillStyle(0x7b523c)
  graphics.fillRoundedRect(12, 10, width - 20, height - 20, 5)
  graphics.fillStyle(0xe4d6b5)
  graphics.fillRect(16, 14, width - 28, height - 28)
  graphics.lineStyle(2, 0xa48157, 0.8)
  graphics.lineBetween(20, 20, width - 18, 20)
  graphics.lineBetween(20, 26, width - 18, 26)
  graphics.lineBetween(20, 32, width - 18, 32)
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
      [TEXTURE_KEYS.npcs.mother, { skin: 0xcfa078, hair: 0x3a251a, body: 0xa45d4a, accent: 0xf0d59a }],
      [TEXTURE_KEYS.npcs.child, { skin: 0xe0ba92, hair: 0x352015, body: 0x4f7ca1, accent: 0xf2e7bc }],
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

    register(createTexture(scene, TEXTURE_KEYS.terrain.ground, 64, 64, drawGround), TEXTURE_KEYS.terrain.ground)
    register(
      createTexture(scene, TEXTURE_KEYS.terrain.groundGreen, 64, 64, drawGroundGreen),
      TEXTURE_KEYS.terrain.groundGreen,
    )
    register(createTexture(scene, 'platform', 64, 24, drawPlatform), 'platform')
    register(createTexture(scene, TEXTURE_KEYS.terrain.canalDry, 64, 32, drawCanalDry), TEXTURE_KEYS.terrain.canalDry)

    WATER_FRAME_KEYS.forEach((key, frameIndex) => {
      register(
        createTexture(scene, key, 64, 32, (graphics, width, height) => {
          drawCanalWater(graphics, width, height, frameIndex)
        }),
        key,
      )
    })

    register(createTexture(scene, TEXTURE_KEYS.props.house, 80, 64, drawHouse), TEXTURE_KEYS.props.house)
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
    if (scene.anims.exists(ANIMATION_KEYS.waterFlow)) {
      return
    }

    // Keep the animation key stable so later sprite sheets can replace these frame keys.
    scene.anims.create({
      key: ANIMATION_KEYS.waterFlow,
      frames: WATER_FRAME_KEYS.map((key) => ({ key })),
      frameRate: 5,
      repeat: -1,
    })
  }
}

export { WATER_FRAME_KEYS }
