# Narrative Guide

This file is the writing guardrail for `When the Water Doesn't Come`.

## Social Issue Statement

The game responds to one specific issue:

Small Filipino rice-farming households are harmed when irrigation remains broken, repair support is delayed or falsely reported as complete, and the financial burden of seeds, fertilizer, food, medicine, and schooling falls hardest on families with the least room to absorb it.

## Story Promise

The game must show two things clearly:

1. **Context**
   The player understands the real social problem before the action hub begins.
2. **Action**
   The player becomes a participant who responds through Gospel-shaped action: listening, truth-telling, and beginning repair.

The player does not rescue the community. The player joins people already carrying the burden.

## Meaningful Choice Layer

The game now carries a short challenge layer on top of the existing walk-and-interact structure.

- `listenReflection`
  Two short choice rounds after the listen task. The player must recognize that the issue is not abstract delay, but delayed water and repair reaching the home as hunger, medicine cuts, and school burden.
- `documentTruth`
  Three short choice rounds at the community board. The player must choose the clearest truthful record and avoid softening the damage into vague hardship.
- `repairGate`
  A short alternating-input meter at the gate. This is effort, not theology. It must gate repair completion but must not decide whether the player "learned."
- `finalAssessment`
  Four Tatay Ramon questions in the ending field. This is the single branch point for the run.

## Ending Variants

There are now two ending outcomes.

1. `learned`
   The player passed `listenReflection`, passed `documentTruth`, and scored at least `3 / 4` on `finalAssessment`.
2. `did_not_learn`
   Any lower result.

The hopeful branch remains the ideal ending.
The failure branch should not feel like parody or punishment. It should show that the player saw the village but did not yet fully understand what the Gospel-shaped response requires.

## Authored Challenge Copy

These prompts are now part of the authored narrative surface and should stay aligned with runtime code:

- Listen challenge:
  - What were Mang Lito and Nena really asking for?
  - Kapag "delay" lang ang tawag dito sa bayan, ano ang ibig sabihin nito sa baryo?
- Record challenge:
  - Which record names the irrigation problem most truthfully?
  - Which line best records how the delay reached the household?
  - Which final note keeps the debt visible?
- Final assessment:
  - If someone says this was only bad weather, what answer shows you understood?
  - When the harvest fails, who carries the damage?
  - What is the right first response after seeing the cost?
  - What does the good news look like here?

## Factual Anchors To Preserve

- The issue is not presented as vague poverty or generic hardship.
- The failure is not only weather; it also involves delayed, absent, or falsely completed repair support.
- Farmers invest labor and inputs before harvest.
- Debt survives a failed season.
- The damage reaches the home through food, medicine, fare, and schooling.
- The ending remains hopeful but incomplete.

## Speaker Rules

- **Narration**
  Sparse, visual, observant. It should interpret only when needed.
- **Tatay Ramon**
  Steady, tired, practical. He speaks like a farmer, not an essay.
- **Aling Rosa**
  Careful, economical, quiet strain. She thinks in household tradeoffs.
- **Mara**
  Direct, simple, emotionally sharp because she is plainspoken.
- **Mang Lito**
  Labor-centered, dignified, no flourish.
- **Nena**
  More socially alert, but still sounds like a person and not a lecture.

## Mandatory Interactions

These scenes must carry the whole story even if optional props are skipped:

- intro narration
- Tatay Ramon
- broken canal
- Aling Rosa
- Mara
- reflection
- both listen conversations
- record board
- repair gate
- unlock narration
- ending villager
- final Gospel close

## Optional Depth Interactions

These deepen the world but must not carry the thesis alone:

- tutorial sign
- dead crops
- poster
- canal damage
- fertilizer sack
- debt ledger

## Theological Framing

- The Gospel response is not pity.
- It is presence, truth-telling, solidarity, and beginning repair.
- Catholic social thought should be shown first through situation and action.
- Explicit moral language belongs mostly in reflection and ending, not in every early conversation.

## Runtime Naming Note

Player-facing copy should use:

- Listen
- Record
- Repair

The internal runtime task ids remain:

- `listen`
- `document`
- `repair`

Do not rename runtime ids unless the game systems are intentionally updated together.

## Forbidden Writing Habits

- school-paper language
- repeated abstract moral terms
- every character sounding equally polished
- explaining the meaning before the player sees it
- turning the player into a hero-savior
- ending with total resolution

## Quality Checks

- Narration should stay below half of all lines.
- Most lines should be readable in one breath.
- Every major scene should include one concrete human detail.
- Every major scene should contain a turn, not just information.
