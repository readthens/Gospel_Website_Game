# When the Water Doesn't Come

Short browser-based narrative platformer built with React, Vite, and Phaser 3. React stays as a thin shell. Phaser owns the menu, world flow, dialogue, UI, transitions, and ending.

## Gameplay Summary

The player walks through one continuous village-to-field route:

1. Arrive in a dry farming community and learn the controls.
2. Reach the farmer terrace and hear the first account of the failed season.
3. Inspect the broken irrigation canal and see the symbolic reveal of neglect.
4. Continue into the family area and witness how field failure becomes household burden.
5. Cross the reflection point, then complete three response tasks:
   `listen`, `document`, and `repair`.
6. Unlock the ending path and walk into a calmer, partially restored field.

The ending is intentionally hopeful but incomplete. Water begins to return, but the world is not magically solved.

## Controls

- `A / Left Arrow`: move left
- `D / Right Arrow`: move right
- `W / Up Arrow / Space`: jump
- `E`: interact
- `Enter / Space`: advance dialogue or start/replay from menu screens
- `Escape` on the ending screen: return to menu

## Run Locally

Use the repo Node version first:

```bash
nvm use
```

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Build the production bundle:

```bash
npm run build
```

Preview the built app on the local network:

```bash
npm run preview -- --host 0.0.0.0
```

Lint the repo:

```bash
npm run lint
```

## Desktop And Mobile Notes

- The game is desktop-first and expects keyboard input.
- Smaller screens are supported through Phaser `FIT` scaling and letterboxing.
- Mobile-width viewing should remain readable, but touch controls are intentionally not implemented.

## Project Structure

- `src/App.jsx`: minimal React shell around the Phaser mount
- `src/components/PhaserGame.jsx`: creates and destroys the Phaser instance safely
- `src/game/scenes/BootScene.js`: resets run state, builds placeholder textures, and preloads optional audio if present
- `src/game/scenes/MenuScene.js`: title screen and entry into gameplay
- `src/game/scenes/GameScene.js`: single horizontal level, progression, interactions, tasks, and ending unlock
- `src/game/scenes/UIScene.js`: dialogue, objectives, prompts, notifications, and screen pulses
- `src/game/scenes/EndScene.js`: final reflection plus replay/menu exit
- `src/game/systems/PlaceholderTextureFactory.js`: generated placeholder art with stable texture keys

## Placeholder Art And Audio Swap Rules

This build is placeholder-first. Scene logic should keep using stable keys so art and audio can be replaced later without rewriting gameplay code.

### Art

Generated texture keys live in `src/game/systems/PlaceholderTextureFactory.js`.

Swap rule:

1. Load the real asset with the same key.
2. Keep scene references unchanged.
3. Remove or bypass the placeholder generator for that key only when the real asset is ready.

### Audio

Optional audio is discovered from `src/assets/audio/` when files are present.

Supported keys:

- `bgm-title`
- `bgm-field`
- `bgm-hope`
- `sfx-jump`
- `sfx-interact`
- `sfx-task`
- `sfx-water`
- `sfx-confirm`

If those files do not exist, the game remains fully playable with no audio dependency.

## Vercel Notes

- This repo is a static Vite deployment target.
- A standard Vercel project can build it with the default Vite flow.
- No backend, router, or persistence layer is required for deployment.
- If you add optional audio/art assets later, keep file names and key casing exact for Linux-safe deploys.

Reference docs:

- https://vercel.com/docs/frameworks/frontend/vite
- https://vercel.com/docs/deployments/overview

## Final Handoff Notes

- Refresh resets the run.
- The accepted world geometry and scene flow are intentionally frozen.
- Replay should return to a clean intro state with one Phaser canvas only.
- Future upgrades should focus on art/audio replacement, not new mechanics.
