import Phaser from 'phaser'
import BootScene from './scenes/BootScene'
import EndScene from './scenes/EndScene'
import GameScene from './scenes/GameScene'
import MenuScene from './scenes/MenuScene'
import UIScene from './scenes/UIScene'
import { GAME_SIZE, SCENE_KEYS, WORLD } from './utils/constants'

export const createGameConfig = (parent) => ({
  type: Phaser.AUTO,
  parent,
  backgroundColor: '#191615',
  pixelArt: true,
  roundPixels: true,
  antialias: false,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_SIZE.width,
    height: GAME_SIZE.height,
  },
  render: {
    antialias: false,
    pixelArt: true,
    roundPixels: true,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: WORLD.gravityY },
      debug: false,
    },
  },
  input: {
    gamepad: false,
  },
  scene: [BootScene, MenuScene, GameScene, UIScene, EndScene],
  callbacks: {
    postBoot: (game) => {
      globalThis.__WWDC_GAME__ = game
      game.registry.set('sceneKeys', SCENE_KEYS)

      if (game.canvas) {
        game.canvas.style.width = '100%'
        game.canvas.style.height = '100%'
        game.canvas.style.imageRendering = 'pixelated'
      }
    },
  },
})
