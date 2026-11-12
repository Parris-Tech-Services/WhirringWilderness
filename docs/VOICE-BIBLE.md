# Whispering Wilds: Voice Bible (DRAFT, derived from existing text and quest logic)

No separate taste brief exists in this repo, so this is inferred from what the game already says. Josh approves or edits; nothing here changes the game.

## What the game already sounds like
- **A hushed, wary wilderness.** Nobody shouts. The Wilds are "uneasy", a grove is "wrong somehow", the water "hums with whispers". Dread is quiet and domestic.
- **Plain, practical speech.** The trader talks in goods (herbs, ore, water). The hermit talks in refusals ("What do you want?"). The caretaker talks in tasks. Keep that: people mostly talk about work and what they will not do.
- **Cause and consequence the player can see.** Healing the grove changes the lake; the lake changes what the hermit says; reputation with the forest changes encounters. Prose should name the change, not announce a theme.
- **Place names are plain compounds:** the Sanctum, the Gate, the Wilds, the Lake, the Mine, Hermit's Hut, Trader's Post, the Deeper Wilds. New places follow that pattern.

## Rules for new writing (positive)
1. Say what the character wants and what they refuse to do. One concrete detail per line.
2. Every consequence is visible in the next line of text.
3. Let characters stay silent or turn the player away.
4. Names come from the generator (`namegen.py --voice docs/voice.json`), never from a model. Display names only; ids stay.
5. Keep "echoes" and "whispers" as the **plot** vocabulary of the lake event only. Do not use them as general atmosphere elsewhere.

## Lint note
`slop_lint --code-strings` scores `src/engine/actions.ts` at 43. That number is mostly code repetition (`timestamp: Date.now()` x42) and four uses of "echoes" that are plot terms. It is not a prose problem and I changed nothing.
