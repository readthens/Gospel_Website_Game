import Phaser from 'phaser'
import { createGameConfig } from './config'

const GAME_INSTANCE_KEY = '__WHEN_THE_WATER_DOES_NOT_COME__'
const GAME_ALIAS_KEY = '__WWDC_GAME__'

const clearMount = (mountTarget) => {
  if (mountTarget instanceof HTMLElement) {
    mountTarget.replaceChildren()
  }
}

export const getGame = () => globalThis[GAME_INSTANCE_KEY] ?? null

export const destroyGame = () => {
  const game = getGame()

  if (!game) {
    return
  }

  const mountTarget = game.__mountTarget

  game.destroy(true)
  globalThis[GAME_INSTANCE_KEY] = null
  globalThis[GAME_ALIAS_KEY] = null
  clearMount(mountTarget)
}

export const startGame = (parent) => {
  const existingGame = getGame()

  if (existingGame) {
    const sameMount = existingGame.__mountTarget === parent

    if (sameMount) {
      return existingGame
    }

    destroyGame()
  }

  const game = new Phaser.Game(createGameConfig(parent))
  game.__mountTarget = parent
  globalThis[GAME_INSTANCE_KEY] = game
  globalThis[GAME_ALIAS_KEY] = game

  return game
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    destroyGame()
  })
}
