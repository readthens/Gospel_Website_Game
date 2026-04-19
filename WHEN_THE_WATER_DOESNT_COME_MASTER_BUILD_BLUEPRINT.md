# When the Water Doesn't Come
## Master Build Blueprint for Codex (React + Phaser 3 + Vercel)

This document is the **single source of truth** for implementing the game flow, world structure, systems, dialogue, assets, and finishing criteria for **When the Water Doesn't Come**.

It is written to sit **on top of your scaffold**. If Codex already generated the repo shell, this file should guide the rest of the work without re-architecting the project.

---

## 1) Project identity

**Title:** When the Water Doesn't Come

**Format:** Short browser-based narrative platformer

**Stack:**
- React.js + Vite
- Phaser 3
- JavaScript only
- No backend
- Static deploy on Vercel

**Target playtime:** 3–5 minutes

**Core message:**
Small Filipino rice farmers face broken irrigation, delayed or missing support, debt, and insecurity even though they feed the nation. The player first witnesses the broken reality, then responds through solidarity, truth, and action.

**Theological frame:**
- dignity of the human person
- dignity of labor
- preferential option for the poor
- solidarity
- common good
- stewardship

---

## 2) Non-negotiable implementation rules

### Technical rules
- React stays thin and only mounts the Phaser game.
- Phaser owns menu, gameplay, UI overlay, transitions, dialogue, tasks, and ending.
- Use exactly 5 scenes:
  - `BootScene`
  - `MenuScene`
  - `GameScene`
  - `UIScene`
  - `EndScene`
- Use one continuous horizontal level.
- No backend.
- No router.
- No persistence.
- No combat.
- No enemies.
- No boss fight mechanics.
- No inventory unless truly required.
- Refresh resets the run.
- Placeholder pixel-style textures are generated in code first.
- Future PNG art must be swappable by reusing the same asset keys.

### Narrative rules
- Story content lives in `src/game/data/*.js`, not hardcoded inside scene logic.
- Objective text must be verb-first and concrete.
- The ending must be hopeful but partial, not magical.
- Corruption/neglect is shown symbolically in the background, not as a literal fight.

---

## 3) The full player journey

### Emotional arc
1. Arrive
2. Notice
3. Listen
4. Understand the system is broken
5. See the family burden
6. Reflect
7. Act
8. Hope begins

### Gameplay loop
`walk -> jump -> interact -> learn -> continue -> reflect -> complete 3 tasks -> unlock ending`

### Control scheme
- `A / Left Arrow` = move left
- `D / Right Arrow` = move right
- `W / Up Arrow / Space` = jump
- `E` = interact
- `Enter` or `Space` = continue dialogue

---

## 4) High-level scene flow

### BootScene
Purpose:
- Generate placeholder textures in code
- Initialize shared `GameState`
- Optionally preload audio hooks if assets exist later
- Start `MenuScene`

### MenuScene
Purpose:
- Title screen
- Start button
- Optional About button
- Transition into gameplay

### GameScene
Purpose:
- Full guided level
- Platforming
- Interactions
- Story triggers
- Action hub
- Ending unlock logic

### UIScene
Purpose:
- Dialogue box
- Objective tracker
- Interaction prompt
- Fade overlays
- Task tracker
- Small notifications

### EndScene
Purpose:
- Final narration
- Replay
- Optional “View Reflection” text
- Return to MenuScene

---

## 5) World layout

Use a single horizontal world around **7200 px wide**.

### Core constants
```js
WORLD_WIDTH = 7200
WORLD_HEIGHT = 720
TILE_SIZE = 32
GROUND_Y = 470
PLAYER_SPEED = 180
PLAYER_JUMP_VELOCITY = -420
GRAVITY_Y = 1000
INTERACT_RADIUS = 56
CAMERA_LERP = 0.12
```

### Map structure
```text
[Menu]
   ↓
[Start / Tutorial Area]
   →
[Jump Platforms to Farmer 1]
   →
[Broken Irrigation Canal + Poster + Shadow Reveal]
   →
[Cracked Ground Transition]
   →
[Family Home Area]
   →
[Reflection Point]
   →
[Action Hub: Listen / Document / Repair]
   →
[Locked Ending Path]
   →
[Hopeful Field + Final Narration]
```

### Accepted layout deviations (implementation-locked)
This section overrides older starter guidance anywhere it conflicts with the current accepted runtime in `src/game/data/layout.js`. Future passes should preserve these choices unless a new layout approval explicitly changes them.

- Playable world width is now about `7200`, not `6200`.
- The farmer section is a wider bidirectional terrace, not a narrow one-way climb. Keep the current rise / ledge / descend shape so the player can return to the farmer even after moving past him.
- Player collision is intentionally tuned for cleaner platform contact. The current truth is the body sizing and offset values in `WORLD_LAYOUT.player`.
- The irrigation set piece is an irrigation basin / crossing, not a pure fall gap.
- The basin includes safe recovery, a visible floor, and fixed floating platforms that let the player re-exit cleanly.
- `brokenCanal` remains the first irrigation interaction, while `projectPoster` and `canalDamage` are intentionally encountered after the crossing.
- The failed-harvest walk before irrigation is intentionally longer and denser than the earlier blueprint draft.
- Dead / dry crops span that failed-harvest stretch but stop before the irrigation basin and recovery area.
- Progression and story order remain unchanged: intro → farmer → canal → family → reflection → hub → ending.

---

## 6) Area-by-area gameplay spec

## Area 1 — Start / tutorial
**World range:** x = 0 to 700

**Purpose:**
- teach movement
- set tone
- let player settle in

**Must contain:**
- flat dry ground
- tutorial sign
- maybe 1 tiny jump box to teach jumping
- gentle background

**Interactions:**
- sign with controls
- opening narration trigger once player walks forward

**Objective after entering area:**
`Move through the village.`

**Dialogue:**
- Sign: movement instructions
- Narration: “You arrive in a farming community where the land is quiet, but the silence carries a burden.”

---

## Area 2 — Farmer 1 encounter
**World range:** x = 700 to 1300

**Purpose:**
- first major encounter
- the player must jump upward to reach the farmer
- establishes the broken reality

**Geometry:**
- wider terraced rise with a return path
- upper ledge with farmer NPC
- descending terrace so the area stays bidirectional
- dry crop props near the farmer

**Interactions:**
- Farmer 1
- dry crops

**Important design meaning:**
The player must make a small effort to reach the person. This supports the theme: encountering suffering requires intentionality.

**Objective before interaction:**
`Talk to the farmer.`

**Objective after farmer interaction:**
`Inspect the irrigation canal.`

---

## Area 3 — Broken irrigation canal
**World range:** x = 1300 to 1900

**Purpose:**
- reveal the deeper system issue
- show that the problem is not only weather
- introduce the symbolic background “boss”

**Must contain:**
- broken canal / irrigation object
- irrigation basin / crossing with safe recovery
- fixed floating platforms inside the basin
- project poster after the crossing
- silhouette/shadow representing corruption/neglect
- cracked soil
- maybe a damaged pipe or blocked sluice

**Interactions:**
- canal
- poster after the crossing
- canal damage after the crossing
- optional cracked concrete / wall object

**Reveal behavior on first canal interaction:**
- darken screen slightly with a brief pulse
- fade in shadow silhouette from alpha 0 to ~0.35
- fade in poster or brighten it
- optional tiny camera shake
- play ominous sting if available

**Do not:**
- spawn a literal enemy
- block the player with boss mechanics
- add attack systems

**Objective after canal interaction:**
`See how the burden reaches the home.`

---

## Area 4 — Family burden area
**World range:** x = 1900 to 3000

**Purpose:**
- show human cost
- connect the broken system to home, debt, and future

**Geometry:**
- a small cracked-ground transition or gap
- simple home sprite
- flat area around the house

**Must contain:**
- Mother / family NPC
- Child NPC
- fertilizer sack
- debt ledger
- maybe a stool, lamp, or empty basin if time permits

**Interactions:**
- mother
- child
- fertilizer sack
- debt ledger

**Objective after this area:**
`Continue forward and reflect.`

---

## Area 5 — Reflection point
**World range:** x = 3000 to 3500

**Purpose:**
- shift from witness to responder
- theological turning point

**Must contain one:**
- tree
- roadside cross
- chapel silhouette
- or quiet stone marker

**Mechanics:**
- entering the reflection trigger pauses or soft-locks movement briefly
- reflection lines appear in the UI
- after reflection, action hub becomes the next objective

**Key line that must appear:**
`To witness suffering is not enough. Love must become action.`

**Objective after reflection:**
`Complete the response tasks.`

---

## Area 6 — Action hub
**World range:** x = 3500 to 5000

**Purpose:**
- player inserts themselves into the story
- fulfills the “Action” requirement of the theology project
- offers a tiny sense of choice without becoming complex

**Hub rule:**
Tasks can be completed in any order.

**Soft emotional order:**
1. Listen
2. Document
3. Repair

### Branch A — Listen
**Purpose:** solidarity begins by listening  
**Contains:** 2 farmer NPCs  
**Completion condition:** talk to both farmers, then mark `listen = true`

### Branch B — Document
**Purpose:** truth-telling / surfacing injustice  
**Contains:** board, notebook, or phone/report object  
**Completion condition:** interact once and mark `document = true`

### Branch C — Begin repair / restore flow
**Purpose:** action, common good, mercy made concrete  
**Contains:** water gate, pump, repair lever, or community repair point  
**Completion condition:** interact sequence marks `repair = true` and starts partial water flow

**Important:**
The repair task should **begin** restoration, not fully solve every problem instantly.

---

## Area 7 — Locked ending path
**World range:** x = 6000 to 6310

**Purpose:**
- final gate
- confirms all tasks are needed

**Mechanics:**
- barrier stays closed or blocked until all 3 tasks are complete
- once all tasks are done:
  - barrier opens
  - water animation starts or expands
  - shadow boss fades
  - poster dims or tears/fades
  - objective changes

**Objective after unlock:**
`Walk toward the field.`

---

## Area 8 — Hopeful ending field
**World range:** x = 6310 to 7200

**Purpose:**
- hopeful but partial ending
- visually brighter than earlier areas
- communicate “hope begins,” not “everything is perfect”

**Must contain:**
- greener ground or sprouts
- visible water flow
- at least one villager present
- final narration trigger
- end-of-level marker or invisible trigger

**Do not show:**
- giant harvest miracle
- instant wealth
- total resolution of every system problem

---

## 7) Exact objective flow

Use an objective map like this:

```js
export const OBJECTIVES = {
  intro: "Move through the village.",
  farmer: "Talk to the farmer.",
  canal: "Inspect the irrigation canal.",
  family: "See how the burden reaches the home.",
  reflection: "Continue forward and reflect.",
  hub: "Complete the response tasks.",
  ending: "Walk toward the field."
};
```

### Objective progression
1. `intro`
2. `farmer`
3. `canal`
4. `family`
5. `reflection`
6. `hub`
7. `ending`

---

## 8) Shared GameState contract

`GameState` must be the single authority for progression.

### Recommended shape
```js
{
  flags: {
    introSeen: false,
    farmerTalked: false,
    irrigationSeen: false,
    familySeen: false,
    reflectionSeen: false,
    endingUnlocked: false,
    finalNarrationSeen: false
  },

  tasks: {
    listen: false,
    document: false,
    repair: false
  },

  ui: {
    dialogueOpen: false,
    canMove: true,
    currentObjective: "Move through the village.",
    interactTargetId: null
  }
}
```

### Important note
Do **not** duplicate facts across too many booleans.

Example:
- if `tasks.listen === true`, do not also create `listeningTaskDone === true`
- if `flags.endingUnlocked === true`, do not also create `gateOpen === true` unless it directly controls a visual object in scene memory

---

## 9) Internal task progress

The `tasks` object is boolean, but the **listen** task can use internal temporary progress inside `TaskSystem`.

### Recommended temporary progress
```js
{
  listenTalkedTo: new Set()
}
```

When both required farmers in the hub are spoken to:
- set `tasks.listen = true`

This keeps the persistent state simple while allowing multi-step completion.

---

## 10) Event and communication model

Use Phaser’s game-level event emitter or a shared event channel.

### Good cross-scene events
- `ui:showDialogue`
- `ui:hideDialogue`
- `ui:setObjective`
- `ui:setPrompt`
- `ui:clearPrompt`
- `ui:taskCompleted`
- `world:unlockEnding`
- `world:startWater`
- `world:fadeShadow`
- `flow:goToEndScene`

### Rule
- `GameScene` emits
- `UIScene` listens and renders
- `GameState` stores truth
- data files store content
- prefabs stay reusable and dumb where possible

---

## 11) File-by-file implementation spec

## `src/main.jsx`
- mounts React app
- keep default clean
- do not put game logic here

## `src/App.jsx`
- minimal shell
- title or small top text allowed
- mounts `PhaserGame`
- no progression state here

## `src/styles.css`
- layout for page
- center game
- responsive canvas container
- subtle background okay

## `src/components/PhaserGame.jsx`
Responsibilities:
- create Phaser game once
- attach to container ref
- destroy game cleanly on unmount
- avoid duplicate canvases during React StrictMode behavior
- on hot reload, ensure previous game instance is removed

### Key safety rules
- guard against multiple mounts
- destroy existing Phaser instance before creating a new one
- clear DOM container before mount if needed

---

## `src/game/main.js`
Responsibilities:
- instantiate Phaser game from config
- export helper to create/destroy game if needed

## `src/game/config.js`
Responsibilities:
- define width, height, pixelArt mode, arcade physics, gravity, scaling
- register scene order:
  - BootScene
  - MenuScene
  - GameScene
  - UIScene
  - EndScene

Recommended config:
```js
type: Phaser.AUTO
width: 960
height: 540
pixelArt: true
physics: {
  default: "arcade",
  arcade: {
    gravity: { y: 1000 },
    debug: false
  }
}
scale: {
  mode: Phaser.Scale.FIT,
  autoCenter: Phaser.Scale.CENTER_BOTH
}
backgroundColor: "#b8c6a5"
```

---

## `src/game/scenes/BootScene.js`
Responsibilities:
- reset or initialize GameState
- create placeholder textures via `PlaceholderTextureFactory`
- optionally preload audio if files are later added
- start `MenuScene`

### Must not do
- build world here
- render title UI here

---

## `src/game/scenes/MenuScene.js`
Responsibilities:
- display title
- show Start button
- optional About button or short subtitle
- on Start:
  - reset GameState
  - start `GameScene`
  - launch `UIScene`
  - stop `MenuScene`

### Menu text
Title:
`When the Water Doesn't Come`

Subtitle:
`A short Gospel-inspired story about farmers, broken systems, and the choice to respond.`

Optional About text:
`Walk through a farming village, witness a broken reality, and respond with dignity, solidarity, and hope.`

---

## `src/game/scenes/GameScene.js`
This is the largest file.

Responsibilities:
- create world and ground
- spawn player
- configure camera
- create physics collisions
- create interactables
- create trigger zones
- handle proximity interaction logic
- handle progression flags
- coordinate task completion and ending unlock
- emit UI events to `UIScene`

### Major responsibilities by section

#### A. Setup
- set world bounds
- create background layers
- create dry ground
- create platforms
- create decorative objects
- create actor groups

#### B. Player
- spawn at `layout.spawn`
- set collider with ground/platforms
- camera follows player

#### C. Interactions
- each interactable has:
  - id
  - x/y
  - texture key
  - prompt text
  - once/always
  - callback
- nearest valid interactable within radius sets UI prompt

#### D. Triggers
- invisible zones for:
  - opening narration
  - reflection
  - ending narration
  - maybe hub entry

#### E. Story progression
- tutorial -> farmer -> canal -> family -> reflection -> hub -> ending

#### F. Visual state changes
- shadow reveal
- poster dim/bright
- water begin flow
- ending barrier open

---

## `src/game/scenes/UIScene.js`
Responsibilities:
- keep dialogue box above gameplay
- show objective panel
- show interact prompt
- show small notifications
- handle fade overlays
- remain active over `GameScene`

### Must react to events from GameScene
- dialogue open/close
- objective update
- task completion
- prompt update
- narration overlays

### Suggested UI layout
- top-left: objective + task list
- bottom: dialogue panel
- near interactable: small `E` prompt above or in a corner
- center: transient narration overlay when needed

---

## `src/game/scenes/EndScene.js`
Responsibilities:
- fade in final text
- optionally show a final still frame background
- provide:
  - `Play Again`
  - `Back to Menu`

Optional:
- brief theology reflection paragraph

---

## `src/game/prefabs/Player.js`
Responsibilities:
- encapsulate player sprite and movement
- read input
- move left/right
- jump if grounded
- switch between idle / walk / jump textures or frames

### Keep it simple
No attacks.
No crouch.
No double jump.

### Suggested methods
- `update(cursors, wasd)`
- `setCanMove(boolean)`
- `faceDirection(dir)`

---

## `src/game/prefabs/Interactable.js`
Responsibilities:
- reusable object/NPC wrapper
- holds interaction data
- maybe optional prompt offset
- can be physics static body or simple sprite with hit area

### Suggested shape
```js
new Interactable(scene, {
  id: "farmer1",
  x: 1120,
  y: 338,
  texture: "farmer-a",
  prompt: "Talk",
  once: false,
  onInteract: () => {}
});
```

---

## `src/game/prefabs/TriggerZone.js`
Responsibilities:
- invisible zone with callback
- one-time or repeatable
- used for reflection, narration, ending triggers

---

## `src/game/prefabs/DialogueBox.js`
Responsibilities:
- render speaker name
- render line text
- show continue indicator
- update content
- open/close cleanly

### Requirements
- large readable text
- semi-transparent background
- movement locked while open

---

## `src/game/prefabs/ObjectivePanel.js`
Responsibilities:
- show current objective
- show 3 task states
- update check marks or icons when tasks complete

### Display suggestion
```text
Objective: Complete the response tasks.
[ ] Listen
[ ] Document
[ ] Repair
```

When done:
```text
[x] Listen
[x] Document
[x] Repair
```

---

## `src/game/systems/GameState.js`
Responsibilities:
- create/reset state
- expose getters/setters
- remain the single progression authority

### Recommended exports
- `createInitialGameState()`
- `resetGameState()`
- `getGameState()`
- `setFlag(flagName, value)`
- `setTask(taskName, value)`
- `setObjective(text)`
- `setDialogueOpen(boolean)`
- `setCanMove(boolean)`
- `allTasksComplete()`

---

## `src/game/systems/DialogueSystem.js`
Responsibilities:
- resolve dialogue entries by id
- expose next-line flow
- notify UI when dialogue opens/closes
- optionally call `onComplete`

### Data-driven rule
Dialogue content comes from `data/dialogue.js`.

---

## `src/game/systems/TaskSystem.js`
Responsibilities:
- mark boolean tasks complete
- keep temporary listen progress
- check if all 3 tasks are complete
- fire end-unlock callback once
- prevent duplicate completions

### Suggested methods
- `recordListenConversation(id)`
- `completeDocument()`
- `completeRepair()`
- `isTaskComplete(taskId)`
- `areAllTasksComplete()`

---

## `src/game/systems/PlaceholderTextureFactory.js`
Responsibilities:
- generate placeholder textures in code
- keep stable keys for future art replacement
- create simple pixel-style visuals

### Good pattern
Use Phaser Graphics:
- fill rectangles
- stroke outlines
- generate texture
- destroy graphics object after each texture

### Required generated keys
See asset manifest below.

---

## `src/game/data/dialogue.js`
Responsibilities:
- store all dialogue and narration content
- no scene logic
- keyed by IDs

Recommended structure:
```js
export const DIALOGUE = {
  tutorialSign: { speaker: "Sign", lines: [...] },
  farmer1: { speaker: "Tatay Ramon", lines: [...] },
  canal: { speaker: "Narration", lines: [...] }
};
```

---

## `src/game/data/objectives.js`
Responsibilities:
- export objective text
- optionally export helper sequence array

---

## `src/game/data/tasks.js`
Responsibilities:
- export labels, descriptions, and completion hints for the 3 tasks

Recommended:
```js
export const TASKS = {
  listen: {
    id: "listen",
    label: "Listen",
    summary: "Speak with the farmers."
  },
  document: {
    id: "document",
    label: "Document",
    summary: "Record the truth."
  },
  repair: {
    id: "repair",
    label: "Repair",
    summary: "Help begin restoration."
  }
};
```

---

## `src/game/data/layout.js`
Responsibilities:
- store spawn point
- platform rectangles
- decorative prop positions
- NPC positions
- trigger definitions
- ending gate location

Recommended structure:
```js
export const WORLD_LAYOUT = {
  world: { width: 7200, height: 720 },
  spawn: { x: 120, y: 560 },
  beats: {
    intro: 120,
    farmer: 960,
    canal: 1950,
    family: 3100,
    reflection: 4050,
    hub: 5150,
    gate: 6100,
    ending: 6700
  },
  terrain: [...],
  decorations: [...],
  interactables: [...],
  triggers: [...]
};
```

---

## `src/game/utils/constants.js`
Put:
- world constants
- input mapping
- z-order values if needed
- color constants
- event names if you want centralization

---

## `src/game/utils/helpers.js`
Only small utilities:
- nearest interactable
- distance checks
- clamp
- optional text wrapping helper

Do not let this turn into a junk drawer.

---

## 12) Placeholder asset manifest

These keys should exist even before final art is made.

## Player
- `player-idle`
- `player-walk-1`
- `player-walk-2`
- `player-jump`

## NPCs
- `farmer-a`
- `farmer-b`
- `farmer-c`
- `mother-a`
- `child-a`

## Ground and platforms
- `ground-dry`
- `ground-green`
- `ground-dry-edge-left`
- `ground-dry-edge-right`
- `ground-green-edge-left`
- `ground-green-edge-right`
- `platform-wood`
- `platform-stone`
- `cracked-block`

## Props
- `dry-crop`
- `green-crop`
- `canal-broken`
- `canal-flow`
- `pipe-broken`
- `water-gate`
- `fertilizer-sack`
- `debt-ledger`
- `community-board`
- `project-poster`
- `house-small`
- `tree-small`
- `cross-small`
- `chapel-small`
- `tool-box`
- `fence-post`

## Background / symbolic boss
- `bg-sky-dry`
- `bg-field-dry`
- `bg-field-green`
- `bg-hills-far`
- `bg-shadow-boss`
- `bg-government-silhouette`

## UI
- `ui-dialog-panel`
- `ui-name-plate`
- `ui-interact-icon`
- `ui-task-empty`
- `ui-task-done`
- `ui-button`
- `ui-button-hover`
- `ui-fade-panel`

## Effects
- `water-1`
- `water-2`
- `sparkle-hope`
- `dust-land`
- `task-flash`

### Placeholder visual style
- 32x32 base grid for most world objects
- low color count
- thick readable silhouette
- no detailed shading required
- player readable from distance
- shadow boss almost monochrome

---

## 13) Exact world coordinates (accepted runtime target)

Treat the current data file as truth. These anchors are the accepted runtime targets to preserve unless a new layout pass explicitly changes them.

```js
export const WORLD_LAYOUT = {
  world: { width: 7200, height: 720 },
  spawn: { x: 120, y: 560 },
  beats: {
    intro: 120,
    farmer: 960,
    canal: 1950,
    family: 3100,
    reflection: 4050,
    hub: 5150,
    gate: 6100,
    ending: 6700
  },
  terrain: [
    // wider farmer terrace
    { id: "farmer-rise-1", x: 740, y: 590, width: 156, height: 26 },
    { id: "farmer-rise-2", x: 860, y: 548, width: 168, height: 26 },
    { id: "farmer-ledge", x: 980, y: 502, width: 250, height: 28 },
    { id: "farmer-descend", x: 1120, y: 548, width: 176, height: 28 },

    // irrigation basin crossing with safe recovery
    { id: "canal-basin-floor", x: 2530, y: 688, width: 560, height: 52 },
    { id: "canal-float-1", x: 2390, y: 626, width: 180, height: 24 },
    { id: "canal-float-2", x: 2605, y: 594, width: 200, height: 24 },
    { id: "canal-exit-right", x: 2860, y: 628, width: 190, height: 24 }
  ],
  interactables: [
    { id: "brokenCanal", x: 2240, y: 622 },
    { id: "projectPoster", x: 2895, y: 548 }, // after the crossing
    { id: "canalDamage", x: 3005, y: 620 } // after the crossing
  ]
};
```

### Suggested interactable placements
```js
[
  { id: "tutorialSign", x: 280, y: 404, texture: "sign-controls" },
  { id: "farmer1", x: 1090, y: 274, texture: "farmer-a" },
  { id: "dryCrops", x: 1210, y: 408, texture: "dry-crop" },

  { id: "brokenCanal", x: 1560, y: 405, texture: "canal-broken" },
  { id: "projectPoster", x: 1690, y: 320, texture: "project-poster" },

  { id: "mother1", x: 2480, y: 405, texture: "mother-a" },
  { id: "child1", x: 2620, y: 410, texture: "child-a" },
  { id: "fertilizerSack", x: 2390, y: 418, texture: "fertilizer-sack" },
  { id: "debtLedger", x: 2710, y: 420, texture: "debt-ledger" },

  { id: "reflectMarker", x: 3240, y: 390, texture: "cross-small" },

  { id: "listenFarmerA", x: 3780, y: 405, texture: "farmer-b" },
  { id: "listenFarmerB", x: 3920, y: 405, texture: "farmer-c" },
  { id: "documentBoard", x: 4100, y: 314, texture: "community-board" },
  { id: "repairGate", x: 4660, y: 404, texture: "water-gate" },

  { id: "endingVillager", x: 5560, y: 405, texture: "farmer-a" }
]
```

### Suggested trigger placements
```js
[
  { id: "introNarration", x: 120, y: 0, width: 220, height: 540, once: true },
  { id: "reflectionZone", x: 3140, y: 0, width: 240, height: 540, once: true },
  { id: "endingNarrationZone", x: 5480, y: 0, width: 300, height: 540, once: true }
]
```

### Suggested ending gate
```js
{ x: 5070, y: 380, width: 40, height: 120 }
```

---

## 14) Full dialogue script

Use these as the actual initial script unless you later revise for polish.

## MenuScene
**Title**  
When the Water Doesn't Come

**Subtitle**  
A short Gospel-inspired story about farmers, broken systems, and the choice to respond.

**About text**  
Walk through a farming village, witness a broken reality, and respond with dignity, solidarity, and hope.

---

## Area 1 — Tutorial sign
**Speaker:** Sign  
**Lines:**
1. Move with the arrow keys or A and D.
2. Press SPACE to jump.
3. Press E to interact.

**Narration trigger:**  
**Speaker:** Narration  
**Lines:**
1. You arrive in a farming community where the land is quiet, but the silence carries a burden.

---

## Area 2 — Farmer 1 (Tatay Ramon)
**Speaker:** Tatay Ramon  
**Lines:**
1. We planted again this season. We always begin with hope.
2. But when the water does not come, hope is the first thing that dries.
3. They said the irrigation would be repaired. We are still waiting.

### Dry crops object
**Speaker:** Dry Crops  
**Lines:**
1. These plants were given labor, time, and care.
2. But effort alone cannot replace water.

---

## Area 3 — Broken canal
**Speaker:** Narration  
**Lines:**
1. This canal was meant to carry life into the fields.
2. Repairs were promised, but the damage remains.
3. Resources meant for the community did not reach the people who needed them most.

### Project poster
**Speaker:** Poster  
**Lines:**
1. PROJECT APPROVED.
2. REPAIR FUNDED.
3. FOR THE PEOPLE.

### Optional damaged wall text
**Speaker:** Narration  
**Lines:**
1. On paper, help had already arrived.
2. In the field, nothing changed.

### Background reveal narration
**Speaker:** Narration  
**Lines:**
1. In the distance, promises stand taller than the harvest.

---

## Area 4 — Family burden
### Mother (Aling Rosa)
**Speaker:** Aling Rosa  
**Lines:**
1. When the harvest fails, the problem does not stay in the field.
2. It enters the home.
3. It enters the table.
4. It enters the future.

### Child (Mara)
**Speaker:** Mara  
**Lines:**
1. Nanay says we must save everything.
2. If the harvest fails again… can I still go to school?

### Fertilizer sack
**Speaker:** Narration  
**Lines:**
1. Inputs cost money.
2. Many farmers borrow before they earn.

### Debt ledger
**Speaker:** Narration  
**Lines:**
1. Planting begins with debt.
2. A failed season makes the next one heavier.

---

## Area 5 — Reflection
**Speaker:** Narration  
**Lines:**
1. You have seen enough to know this is not only about weather.
2. It is also about neglect, broken systems, and the cost carried by those with the least power.
3. To witness suffering is not enough.
4. Love must become action.

---

## Area 6 — Action hub

### Listen branch: Farmer 2 (Mang Lito)
**Speaker:** Mang Lito  
**Lines:**
1. We do not ask for luxury.
2. We ask for what was already promised:
3. water, support, and a fair chance to work with dignity.

### Listen branch: Farmer 3 (Nena)
**Speaker:** Nena  
**Lines:**
1. People eat because farmers labor.
2. Yet the ones who feed the nation are often the ones left behind.

### Listen completion narration
**Speaker:** Narration  
**Lines:**
1. You listened before acting.
2. Solidarity begins by refusing to look away.

### Document branch: community board
**Speaker:** Narration  
**Lines:**
1. You write down what the village has carried in silence:
2. broken canals,
3. delayed help,
4. unpaid repair,
5. and families pushed deeper into debt.
6. To name the truth is the beginning of justice.

### Document completion narration
**Speaker:** Narration  
**Lines:**
1. The burden is no longer hidden.
2. Love tells the truth about suffering.

### Repair branch: water gate first interaction
**Speaker:** Narration  
**Lines:**
1. The gate is heavy.
2. Repair has not truly begun, but the community can still choose not to surrender.

### Repair branch: activation / second line
**Speaker:** Narration  
**Lines:**
1. With joined effort, the passage begins to open.

### Repair completion narration
**Speaker:** Narration  
**Lines:**
1. Mercy moved from feeling to action.
2. The common good is served when people act together.

---

## Unlock sequence after all tasks
**Speaker:** Narration  
**Lines:**
1. The shadow of neglect does not disappear in a single day.
2. But silence has been broken.
3. The people are no longer standing alone.

---

## Area 8 — Ending field
**Speaker:** Narration  
**Lines:**
1. The fields were not healed in one day.
2. But where truth is spoken,
3. where dignity is defended,
4. and where people stand together,
5. hope begins.

### Final villager line
**Speaker:** Tatay Ramon  
**Lines:**
1. The harvest is still uncertain.
2. But now, at least, we are heard.

### Final theological line
**Speaker:** Narration  
**Lines:**
1. The Gospel calls us not only to see suffering,
2. but to respond with justice, solidarity, and love.

---

## 15) Interaction matrix

| ID | Type | Needed for progress | First-time effect | Repeat behavior |
|---|---|---:|---|---|
| tutorialSign | object | optional but recommended | shows controls | can repeat |
| farmer1 | NPC | yes | sets `farmerTalked`, objective -> canal | repeat okay |
| dryCrops | object | no | flavor dialogue | repeat okay |
| brokenCanal | object | yes | sets `irrigationSeen`, reveals shadow/poster, objective -> family | repeat short text |
| projectPoster | object | no | poster text | repeat okay |
| mother1 | NPC | yes | family dialogue | repeat okay |
| child1 | NPC | yes | child dialogue | repeat okay |
| fertilizerSack | object | no | flavor dialogue | repeat okay |
| debtLedger | object | no | flavor dialogue | repeat okay |
| reflectionZone | trigger | yes | reflection narration, objective -> hub | once only |
| listenFarmerA | NPC | task | records first listen talk | repeat short |
| listenFarmerB | NPC | task | records second listen talk, may complete task | repeat short |
| documentBoard | object | task | completes document task | repeat short |
| repairGate | object | task | completes repair task, starts local flow | repeat short |
| endingNarrationZone | trigger | yes | final narration, go to EndScene after delay | once |

---

## 16) Symbolic boss behavior

The “boss” is not a fight. It is a **background system of corruption and neglect**.

### How it appears
- It is revealed after the canal interaction.
- It should be a silhouette, billboard, looming figure, or government-project shadow.
- It sits in the background only.
- It never collides with the player.
- It never attacks.

### How it is “defeated”
Not through violence.
It weakens when:
1. the people are heard
2. the truth is named
3. repair begins through collective action

### Unlock visuals
When all three tasks complete:
- shadow boss alpha tween to 0
- poster fades or rips/falls/dims
- water animation becomes brighter or more active
- ending barrier opens

---

## 17) Data-file payloads Codex can implement directly

## `dialogue.js`
```js
export const DIALOGUE = {
  tutorialSign: { speaker: "Sign", lines: [...] },
  introNarration: { speaker: "Narration", lines: [...] },
  farmer1: { speaker: "Tatay Ramon", lines: [...] },
  dryCrops: { speaker: "Dry Crops", lines: [...] },
  canal: { speaker: "Narration", lines: [...] },
  poster: { speaker: "Poster", lines: [...] },
  canalDamage: { speaker: "Narration", lines: [...] },
  canalReveal: { speaker: "Narration", lines: [...] },
  mother1: { speaker: "Aling Rosa", lines: [...] },
  child1: { speaker: "Mara", lines: [...] },
  fertilizerSack: { speaker: "Narration", lines: [...] },
  debtLedger: { speaker: "Narration", lines: [...] },
  reflection: { speaker: "Narration", lines: [...] },
  listenFarmerA: { speaker: "Mang Lito", lines: [...] },
  listenFarmerB: { speaker: "Nena", lines: [...] },
  listenComplete: { speaker: "Narration", lines: [...] },
  documentBoard: { speaker: "Narration", lines: [...] },
  documentComplete: { speaker: "Narration", lines: [...] },
  repairGateIntro: { speaker: "Narration", lines: [...] },
  repairGateComplete: { speaker: "Narration", lines: [...] },
  hubUnlock: { speaker: "Narration", lines: [...] },
  endingNarration: { speaker: "Narration", lines: [...] },
  endingVillager: { speaker: "Tatay Ramon", lines: [...] },
  endingGospel: { speaker: "Narration", lines: [...] }
};
```

## `objectives.js`
```js
export const OBJECTIVES = {
  intro: "Move through the village.",
  farmer: "Talk to the farmer.",
  canal: "Inspect the irrigation canal.",
  family: "See how the burden reaches the home.",
  reflection: "Continue forward and reflect.",
  hub: "Complete the response tasks.",
  ending: "Walk toward the field."
};

export const OBJECTIVE_SEQUENCE = [
  "intro",
  "farmer",
  "canal",
  "family",
  "reflection",
  "hub",
  "ending"
];
```

## `tasks.js`
```js
export const TASKS = {
  listen: {
    id: "listen",
    label: "Listen",
    description: "Speak with the farmers."
  },
  document: {
    id: "document",
    label: "Document",
    description: "Record the truth."
  },
  repair: {
    id: "repair",
    label: "Repair",
    description: "Help begin restoration."
  }
};
```

---

## 18) Core flow pseudocode

## BootScene
```js
create() {
  resetGameState();
  generatePlaceholderTextures(this);
  this.scene.start("MenuScene");
}
```

## MenuScene
```js
onStart() {
  resetGameState();
  this.scene.start("GameScene");
  this.scene.launch("UIScene");
}
```

## GameScene
```js
create() {
  createBackground();
  createGround();
  createPlatforms();
  createPlayer();
  createInteractables();
  createTriggerZones();
  createBarrier();
  createShadowBoss(hidden=true);
  createWaterFlow(hidden=true);
  setObjective(OBJECTIVES.intro);
}

update() {
  player.update();
  const target = findNearestInteractable(player, interactables, INTERACT_RADIUS);

  if (target) showPrompt(target.prompt);
  else clearPrompt();

  if (interactPressed && target && canMove()) {
    target.interact();
  }
}
```

## Example farmer interaction
```js
if (!state.flags.farmerTalked) {
  openDialogue("farmer1", () => {
    setFlag("farmerTalked", true);
    setObjective(OBJECTIVES.canal);
  });
} else {
  openDialogue("farmer1");
}
```

## Canal interaction
```js
if (!state.flags.irrigationSeen) {
  openDialogue("canal", () => {
    revealShadowBoss();
    highlightPoster();
    setFlag("irrigationSeen", true);
    setObjective(OBJECTIVES.family);
  });
} else {
  openDialogue("canal");
}
```

## Reflection trigger
```js
if (!state.flags.reflectionSeen) {
  lockMovement();
  openDialogue("reflection", () => {
    setFlag("reflectionSeen", true);
    setObjective(OBJECTIVES.hub);
    unlockMovement();
  });
}
```

## Listen task
```js
taskSystem.recordListenConversation("listenFarmerA");
taskSystem.recordListenConversation("listenFarmerB");

if (taskSystem.justCompleted("listen")) {
  openDialogue("listenComplete");
  emitTaskComplete("listen");
}
```

## All tasks complete
```js
if (taskSystem.areAllTasksComplete() && !state.flags.endingUnlocked) {
  setFlag("endingUnlocked", true);
  openDialogue("hubUnlock", () => {
    fadeShadowBossOut();
    startEndingWaterFlow();
    openBarrier();
    setObjective(OBJECTIVES.ending);
  });
}
```

## Ending trigger
```js
if (!state.flags.finalNarrationSeen) {
  lockMovement();
  playEndingSequence(() => {
    setFlag("finalNarrationSeen", true);
    this.scene.stop("UIScene");
    this.scene.start("EndScene");
  });
}
```

---

## 19) Recommended implementation order

This matters. Do not build out of order.

### Phase 1 — Foundation
- verify React + Phaser mount works
- verify only one canvas exists after hot reload
- verify game destroys cleanly on unmount
- create config + empty scene skeletons

### Phase 2 — Placeholder asset generation
- generate required textures
- confirm all keys exist
- test player sprite renders
- test one NPC renders

### Phase 3 — Movement and camera
- player physics
- collisions
- jump
- camera follow
- world bounds

### Phase 4 — UI basics
- dialogue box
- objective panel
- interact prompt
- game ↔ UI event flow

### Phase 5 — Story path
- tutorial area
- farmer interaction
- canal interaction + shadow reveal
- family area
- reflection trigger

### Phase 6 — Action hub
- 3 task interactables
- task tracker updates
- ending unlock

### Phase 7 — Ending
- final area visuals
- ending narration
- EndScene flow

### Phase 8 — Polish
- gentle fades
- basic audio hooks
- prompt animation
- water flicker
- menu button hover
- restart flow

---

## 20) Visual state transitions

### Early game
- colors muted
- dry browns/yellows
- canal broken
- shadow hidden

### Midpoint after canal
- shadow appears
- poster becomes readable
- tension slightly increases

### After reflection
- no huge visual change
- objective changes
- player role changes

### After tasks complete
- shadow fades
- some blue water appears
- ending gate opens
- final area becomes greener

### Ending field
- slightly brighter palette
- green sprouts
- water flowing
- subtle hope particles optional

---

## 21) Audio hooks (optional, non-blocking)

Audio should not block completion.

### Music tracks
- `bgm-title`
- `bgm-field`
- `bgm-hope`

### SFX
- `sfx-jump`
- `sfx-interact`
- `sfx-task`
- `sfx-water`
- `sfx-confirm`

### Rule
If assets are missing, the game should still run.

Guard sound calls:
```js
if (this.sound.get("sfx-interact")) {
  this.sound.play("sfx-interact");
}
```

---

## 22) Mobile-width and desktop behavior

The game is desktop-first, but should not break on smaller screens.

### Must-do
- use `Phaser.Scale.FIT`
- center canvas
- allow the whole game to letterbox
- keep text readable

### Nice-to-have
- show a small notice outside canvas on mobile:
  `Best experienced on desktop or laptop.`

Do not implement touch controls unless absolutely needed.

---

## 23) What to cut immediately if time gets tight

Cut these first:
- parallax
- animated title background
- sparkle particles
- button hover polish
- audio
- extra decorative props
- alternate dialogue on repeats
- fancy transitions
- chapel variant if a cross/tree already works

Keep these no matter what:
- full story path
- farmer
- canal reveal
- family
- reflection
- 3 action tasks
- ending unlock
- final narration

---

## 24) Common mistakes to avoid

- Duplicating progression state in React and Phaser
- Hardcoding dialogue directly inside scene logic
- Adding a literal attack or enemy because of the “boss” idea
- Turning the hub into a big explorable world
- Blocking implementation on final art
- Requiring audio to make the game playable
- Forgetting to destroy the Phaser instance on unmount
- Allowing multiple canvases to pile up during dev hot reload
- Using case-mismatched asset names that later fail on Vercel/Linux

---

## 25) Validation checklist

The game is ready when all of these are true:

### Core playthrough
- [ ] title screen works
- [ ] start button enters the game
- [ ] player moves and jumps
- [ ] tutorial sign works
- [ ] player can reach farmer 1
- [ ] farmer dialogue works
- [ ] player can inspect the broken canal
- [ ] shadow/poster reveal works
- [ ] player can reach family area
- [ ] mother dialogue works
- [ ] child dialogue works
- [ ] reflection trigger works
- [ ] action hub is reachable
- [ ] listen task completes
- [ ] document task completes
- [ ] repair task completes
- [ ] task UI updates correctly
- [ ] all-tasks-complete unlock fires once
- [ ] barrier opens
- [ ] water is visible in ending state
- [ ] final narration appears
- [ ] EndScene works
- [ ] replay works

### Technical validation
- [ ] `npm install`
- [ ] `npm run dev`
- [ ] `npm run build`
- [ ] `npm run preview -- --host 0.0.0.0`
- [ ] only one canvas exists after reload/restart
- [ ] no uncaught console errors during full playthrough
- [ ] Vercel preview deploy works
- [ ] assets/paths are case-safe on Linux

---

## 26) Future art swap plan

The scaffold should stay art-agnostic.

### Current phase
Use generated placeholder textures only.

### Later phase
Replace with PNG sprites while preserving keys:
- `player-idle`
- `farmer-a`
- `canal-broken`
- etc.

### Swapping rule
If the scene logic references texture keys consistently, swapping art becomes:
1. load external PNG
2. assign same key
3. stop generating that key in placeholder factory or let loaded asset override

---

## 27) Submission package plan

Even though this file is for implementation, the final school submission should likely include:
1. playable web build or hosted Vercel link
2. short screen recording
3. short written explanation of:
   - social issue
   - broken reality / context
   - action / response
   - Gospel/Catholic social thought principles reflected

---

## 28) Final implementation truth

If time is low, choose **clarity over complexity**.

The game succeeds if the player can:
- feel the suffering,
- understand the broken system,
- become a responder,
- and end with a real but incomplete hope.

That is enough.

---

## 29) Paste-ready instruction for Codex after scaffold exists

```text
Use the existing React + Phaser scaffold and implement the full master plan from the project blueprint.

Do not re-architect the app.
Preserve React as a thin mount layer and Phaser as the runtime owner.

Implement the remaining game flow exactly as specified:
- one continuous horizontal level
- tutorial area
- jump-to-farmer area
- broken canal interaction with symbolic shadow/poster reveal
- family burden area
- reflection trigger
- small three-task action hub
- ending unlock after all 3 tasks complete
- hopeful ending field and EndScene

Follow the data-driven structure:
- story content in src/game/data/*.js
- GameState as the single progression authority
- reusable Interactable prefab
- UIScene above GameScene
- placeholder pixel-style textures generated in code first

Prioritize:
- full playable flow
- clean task completion logic
- stable hot reload behavior
- modular code
- easy future art swap

Do not add:
- combat
- enemies
- backend
- router
- persistence
- inventory
- unnecessary systems

After implementation, report:
1. files changed
2. gameplay flow completed
3. remaining polish work
4. any assumptions made
```

---
