import Phaser from 'phaser'
import { PlaceholderTextureFactory } from '../systems/PlaceholderTextureFactory'
import { resetGameState } from '../systems/GameState'
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
