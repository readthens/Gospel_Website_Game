const OPTIONAL_AUDIO_FILES = import.meta.glob('../../assets/audio/**/*.{mp3,ogg,wav,m4a}', {
  eager: true,
  import: 'default',
})

export const OPTIONAL_AUDIO_KEYS = Object.freeze({
  bgmTitle: 'bgm-title',
  bgmField: 'bgm-field',
  bgmHope: 'bgm-hope',
  sfxJump: 'sfx-jump',
  sfxInteract: 'sfx-interact',
  sfxTask: 'sfx-task',
  sfxWater: 'sfx-water',
  sfxConfirm: 'sfx-confirm',
})

const MUSIC_KEYS = Object.freeze([
  OPTIONAL_AUDIO_KEYS.bgmTitle,
  OPTIONAL_AUDIO_KEYS.bgmField,
  OPTIONAL_AUDIO_KEYS.bgmHope,
])

const AUDIO_ASSET_MAP = Object.freeze(
  Object.entries(OPTIONAL_AUDIO_FILES).reduce((assets, [filePath, assetUrl]) => {
    const key = filePath.split('/').pop()?.replace(/\.[^/.]+$/, '')

    if (key) {
      assets[key] = assetUrl
    }

    return assets
  }, {}),
)

function getManagedSounds(scene, key) {
  const sounds = Array.isArray(scene.sound?.sounds) ? scene.sound.sounds : []
  return sounds.filter((sound) => sound?.key === key)
}

export function preloadOptionalAudio(scene) {
  Object.entries(AUDIO_ASSET_MAP).forEach(([key, assetUrl]) => {
    if (!scene.cache?.audio?.exists(key)) {
      scene.load.audio(key, assetUrl)
    }
  })
}

export function hasOptionalAudio(scene, key) {
  return Boolean(key && scene.cache?.audio?.exists(key))
}

export function playOptionalSound(scene, key, config = {}) {
  if (!hasOptionalAudio(scene, key)) {
    return false
  }

  scene.sound.play(key, config)
  return true
}

export function stopOptionalMusic(scene, key = null) {
  const keys = key ? [key] : MUSIC_KEYS

  keys.forEach((musicKey) => {
    if (typeof scene.sound?.stopByKey === 'function') {
      scene.sound.stopByKey(musicKey)
      return
    }

    getManagedSounds(scene, musicKey).forEach((sound) => {
      sound.stop()
    })
  })
}

export function playOptionalMusic(scene, key, config = {}) {
  if (!hasOptionalAudio(scene, key) || scene.sound?.locked) {
    return null
  }

  MUSIC_KEYS.filter((musicKey) => musicKey !== key).forEach((musicKey) => {
    stopOptionalMusic(scene, musicKey)
  })

  const existing = getManagedSounds(scene, key)[0]

  if (existing) {
    existing.setLoop(config.loop ?? true)
    existing.setVolume(config.volume ?? 0.42)

    if (!existing.isPlaying) {
      existing.play()
    }

    return existing
  }

  const sound = scene.sound.add(key, {
    loop: config.loop ?? true,
    volume: config.volume ?? 0.42,
  })

  sound.play()
  return sound
}
