import { forwardRef, useImperativeHandle, useLayoutEffect, useRef } from 'react'
import { destroyGame, getGame, startGame } from '../game/main'

export const PhaserGame = forwardRef(function PhaserGame(_, ref) {
  const mountRef = useRef(null)

  useImperativeHandle(
    ref,
    () => ({
      get game() {
        return getGame()
      },
    }),
    [],
  )

  useLayoutEffect(() => {
    const mountNode = mountRef.current

    if (!mountNode) {
      return undefined
    }

    mountNode.replaceChildren()
    startGame(mountNode)

    return () => {
      destroyGame()
      mountNode.replaceChildren()
    }
  }, [])

  return (
    <div className="phaser-frame">
      <div
        ref={mountRef}
        className="phaser-mount"
        aria-label="When the Water Doesn't Come game"
      />
    </div>
  )
})
