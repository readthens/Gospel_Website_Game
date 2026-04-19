# Narrative Phaser Game Builder

Use this skill when building or modifying a short narrative browser game for a school project using React.js + Phaser 3.

## Purpose

Build a small, polished, browser-based narrative platformer that is easy to finish, easy to deploy on Vercel, and easy to improve later by swapping placeholder assets for final pixel art.

This project is a Theology “Make Your Own Gospel” output. The game must present:
- a specific social issue
- a clear broken reality / context
- a clear action / response
- a conclusion rooted in Gospel values and Catholic social thought

## Hard constraints

- Use **React.js** as the frontend container only.
- Use **Phaser 3** for the game itself.
- Use **JavaScript**, not TypeScript, unless explicitly requested otherwise.
- Use a **Vite-compatible** setup.
- No backend.
- No database.
- No authentication.
- No multiplayer.
- No unnecessary dependencies.
- Must be deployable on **Vercel**.
- Must work as a short standalone web game.

## Game scope

The game should remain a **small MVP**:
- one short guided side-scrolling level
- total playtime around **3 to 5 minutes**
- keyboard controls only
- simple left/right movement
- simple jump
- one interact button
- no combat
- no enemies
- no inventory unless truly necessary
- no overbuilding

The game should feel like a simple Mario-style narrative platformer:
- move right
- jump onto platforms
- interact with characters and objects
- encounter story beats in sequence
- complete a small action phase
- reach a hopeful ending

## Design philosophy

Prioritize:
1. clarity
2. emotional storytelling
3. theological alignment
4. finishability
5. modularity

Do **not** prioritize:
- advanced mechanics
- flashy effects
- complicated AI
- elaborate menu systems
- unnecessary polish before the core loop works

## Story requirements

The game title is:

**When the Water Doesn’t Come**

The social issue is:

**Small Filipino rice farmers suffering because of broken or unreliable irrigation systems, delayed or insufficient support, debt, and neglect despite their essential role in feeding the nation.**

The game must show:
- the broken reality first
- the human cost second
- the player’s response third
- hope through solidarity and justice at the end

## Required story beats

The game must include these beats in approximately this order:

1. **Arrival / tutorial area**
   - movement and interaction tutorial
   - quiet rural setting
   - immediate emotional tone

2. **Farmer encounter**
   - player jumps up to reach a farmer
   - farmer explains that the water has not come
   - promised repairs have not reached the people

3. **Broken irrigation interaction**
   - player inspects damaged canal / irrigation
   - popup explains that resources meant for the community did not reach them
   - symbolic background “boss” appears as corruption / neglect / false promises
   - no direct named real politician unless explicitly requested and well-supported

4. **Family burden area**
   - player reaches a home
   - child and family dialogue show debt, insecurity, and fear for the future
   - dignity of labor and family burden are visible

5. **Reflection area**
   - player encounters a quiet reflective space
   - key line appears:
     **“To witness suffering is not enough. Love must become action.”**

6. **Action hub**
   - player completes 3 simple tasks in any order:
     - listen to farmers
     - document the truth
     - help begin repair / restore flow
   - these represent solidarity, truth, and collective action

7. **Hopeful ending**
   - water begins to flow
   - the background shadow weakens or fades
   - hope appears, but not a fake perfect ending
   - final message emphasizes dignity, justice, solidarity, and love

## Theological integration

The game must reflect these principles through story and interaction, not just exposition:
- dignity of the human person
- dignity of labor
- preferential option for the poor
- solidarity
- common good
- stewardship where appropriate

Do not turn the game into a theology lecture. Show these ideas through:
- dialogue
- setting
- interactions
- progression
- action tasks
- final resolution

## Art / asset strategy

Start with **generated placeholder pixel-style textures** in code.

This is very important:
- do not block implementation waiting for art
- generate simple placeholder textures in Phaser first
- use consistent asset keys so real PNG assets can replace them later
- keep placeholder art readable and modular

The placeholder style should be:
- pixel-like
- blocky
- simple
- readable silhouettes
- minimal colors
- visually consistent enough to test the full game loop

Support future replacement with external assets later.

## Core systems to implement

Implement these cleanly:

### 1. Scene structure
Recommended scenes:
- BootScene
- MenuScene
- GameScene
- UIScene
- EndScene

### 2. Shared game state
Use an in-memory shared state object for:
- story flags
- task completion
- UI lock / dialogue state
- ending unlock

### 3. Player controller
Support:
- move left/right
- jump
- basic gravity/collision
- interact near objects/NPCs

### 4. Interactable system
Use a reusable interactable abstraction for:
- NPCs
- objects
- signs
- story triggers
- task nodes

### 5. Dialogue system
Must support:
- speaker name
- multi-line dialogue
- next / continue
- on-complete callbacks
- locking movement while dialogue is open

### 6. Task system
Track 3 required action tasks:
- listen
- document
- repair

When all 3 are complete:
- unlock ending path
- trigger visual change
- allow final progression

### 7. UI overlay
Support:
- objective text
- interaction prompt
- task progress
- fade or narration overlay if needed

## Level design constraints

Use **one continuous horizontal level**.
Do not build multiple full levels unless explicitly requested.

Recommended layout:
- start/tutorial area
- jump platforms to farmer
- broken irrigation zone
- cracked-ground transition
- family home
- reflection point
- action hub with 3 mini paths
- ending field

The action hub may feel slightly open, but keep it very small and contained.

## Dialogue tone

Dialogue should be:
- simple
- emotional
- clear
- grounded
- not melodramatic
- not overly academic

The writing should feel human and reflective.

Avoid:
- preachy exposition
- long paragraphs
- cartoon villain dialogue
- unrealistic speeches

## Accuracy / issue framing

Represent the issue seriously and carefully.

Prefer phrasing like:
- “resources meant for the community did not reach them”
- “repairs were promised, but the canal remains broken”
- “the poor carry the cost of neglect”

Avoid making unsupported direct accusations toward named individuals inside the game.

If specific real-world claims are added later, keep them in separate written material unless explicitly instructed to integrate them into gameplay.

## Engineering requirements

Code should be:
- modular
- readable
- easy to swap assets later
- easy to change dialogue later
- safe to deploy statically
- not overengineered

Organize files cleanly into folders such as:
- scenes/
- prefabs/
- systems/
- data/
- utils/

Dialogue and objectives should live in separate data files where practical.

## What to do first

Always build in this order:

1. project scaffold
2. phaser mount in react
3. scene structure
4. placeholder texture generation
5. player movement and collisions
6. interaction system
7. dialogue system
8. story triggers
9. task system
10. ending unlock
11. polish
12. asset swapping support

## What not to do

Do not:
- introduce backend services
- add combat
- add enemy AI
- add save systems
- add online features
- add unnecessary menus
- add complex physics
- add large maps
- add collectible systems unless requested
- rewrite the story away from the farmer / irrigation issue
- replace the theological core with generic activism

## Definition of done

The MVP is complete when:
- the menu works
- the player can move and jump
- all required story beats are present
- dialogue works
- the irrigation reveal works
- the 3 action tasks work
- completing tasks unlocks the ending
- the ending plays correctly
- the project runs locally and builds for Vercel
- the code is organized enough for later asset replacement

## Preferred assistant behavior when using this skill

When working on this project:
- inspect structure first
- make low-risk additive changes
- preserve the existing gameplay contract unless explicitly asked to change it
- keep changes small and modular
- explain what was added and where
- keep implementation practical, not theoretical
- optimize for finishing the game successfully
