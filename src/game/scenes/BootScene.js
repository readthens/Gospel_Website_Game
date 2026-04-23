import Phaser from 'phaser'
import {
  PlaceholderTextureFactory,
  PUMP_DRIP_FRAME_KEYS,
  WATER_FRAME_KEYS,
} from '../systems/PlaceholderTextureFactory'
import { resetGameState } from '../systems/GameState'
import { ASSET_KEYS } from '../utils/constants'
import { preloadOptionalAudio } from '../utils/audio'

export const BOOT_SCENE_KEY = 'BootScene'
export const MENU_SCENE_KEY = 'MenuScene'

const TRANSITION_DELAY_MS = 120
const MENU_RETRY_DELAY_MS = 100
const MENU_RETRY_LIMIT = 20

export default class BootScene extends Phaser.Scene {
  constructor() {
    super(BOOT_SCENE_KEY)

    this.statusText = null
  }

  preload() {
    this.load.spritesheet(ASSET_KEYS.player, '/assets/sprites/player_student_sheet.png', {
      frameWidth: 32,
      frameHeight: 48,
    })
    this.load.spritesheet(ASSET_KEYS.farmer, '/assets/sprites/npc_tatay_ramon_sheet.png', {
      frameWidth: 32,
      frameHeight: 48,
    })
    this.load.image(ASSET_KEYS.platformBamboo, '/assets/tiles/tile_bridge_bamboo_canal.png')
    this.load.image(ASSET_KEYS.platformCanal, '/assets/tiles/tile_bridge_concrete_canal.png')
    this.load.image(ASSET_KEYS.canalBasin, '/assets/tiles/tile_canal_basin.png')
    this.load.image(ASSET_KEYS.canalTrench, '/assets/tiles/tile_canal_trench.png')
    this.load.image(ASSET_KEYS.canalBroken, '/assets/tiles/tile_canal_broken.png')
    this.load.image(ASSET_KEYS.canalDry, '/assets/tiles/tile_canal_dry.png')
    WATER_FRAME_KEYS.forEach((key, index) => {
      this.load.image(key, `/assets/tiles/tile_canal_water_${index}.png`)
    })
    PUMP_DRIP_FRAME_KEYS.forEach((key, index) => {
      this.load.image(key, `/assets/tiles/tile_pump_drip_${index}.png`)
    })
    this.load.image(ASSET_KEYS.pumpStation, '/assets/props/prop_water_pump_station.png')
    this.load.image(ASSET_KEYS.waterGate, '/assets/props/prop_water_gate.png')
    this.load.image(ASSET_KEYS.dryCrop, '/assets/props/prop_dry_crop_patch.png')
    this.load.image(ASSET_KEYS.dryCropA, '/assets/props/prop_dry_crop_patch_a.png')
    this.load.image(ASSET_KEYS.dryCropB, '/assets/props/prop_dry_crop_patch_b.png')
    this.load.image(ASSET_KEYS.dryCropEdgeLeft, '/assets/props/prop_dry_crop_edge_left.png')
    this.load.image(ASSET_KEYS.dryCropEdgeRight, '/assets/props/prop_dry_crop_edge_right.png')
    this.load.image(ASSET_KEYS.poster, '/assets/props/prop_tutorial_sign.png')
    this.load.image(ASSET_KEYS.projectPoster, '/assets/props/prop_project_poster.png')

    preloadOptionalAudio(this)
  }

  create() {
    this.cameras.main.setBackgroundColor('#20160f')
    this.input.mouse?.disableContextMenu()

    resetGameState()
    PlaceholderTextureFactory.install(this)

    this.statusText = this.add
      .text(this.scale.width * 0.5, this.scale.height * 0.5, 'Preparing the village...', {
        color: '#f0e2b6',
        fontFamily: 'Georgia, serif',
        fontSize: '18px',
        align: 'center',
      })
      .setOrigin(0.5)

    this.time.delayedCall(TRANSITION_DELAY_MS, () => {
      this.startMenuScene()
    })
  }

  startMenuScene(attempt = 0) {
    if (this.scene.manager.keys[MENU_SCENE_KEY]) {
      this.scene.start(MENU_SCENE_KEY)
      return
    }

    const nextAttempt = attempt + 1

    if (this.statusText) {
      this.statusText.setText(`Preparing the village...\nWaiting for ${MENU_SCENE_KEY}`)
    }

    if (nextAttempt >= MENU_RETRY_LIMIT) {
      console.warn(
        `[${BOOT_SCENE_KEY}] ${MENU_SCENE_KEY} is not registered. BootScene stayed active after ${MENU_RETRY_LIMIT} checks.`,
      )
      return
    }

    this.time.delayedCall(MENU_RETRY_DELAY_MS, () => {
      this.startMenuScene(nextAttempt)
    })
  }
}
