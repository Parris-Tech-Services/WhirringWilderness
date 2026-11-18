# NPC profiles (DRAFT, derived only from existing lines and quest logic)

Format follows the research repo's NPC standard: want, limit, taboo, knowledge, what they notice, what changes their tone. Items marked *(inferred)* are my reading of existing text; items marked *(open)* are gaps for Josh to decide, not facts.

## Caretaker (Sanctum)
- **Want:** the grove healed. Gives the task and the herbs-and-water recipe.
- **Limit:** will not heal it herself; asks a traveler to do it *(inferred)*.
- **Knows:** the grove "feels wrong"; the Sanctum has been quiet.
- **Does not know:** why *(open)*.
- **Tone change:** completes the quest line when the grove is healed.

## Hermit (Hermit's Hut)
- **Want:** to be left alone, then (after the grove) to learn about the lights and the pale shard.
- **Limit / taboo:** "I keep to myself." Gives no answers freely.
- **Knows:** lights deeper in the Wilds; the lake echoes after the healing.
- **Tone change:** opens up in stages as the player returns from the lake and the Deeper Wilds.

## Ranger (Trader's Post)
- **Want:** useful goods: herbs, ore, water.
- **Limit:** trades, does not give; nothing in the existing text says what they will not discuss *(open)*.
- **Knows:** the Wilds are dangerous and valuable.
- **Gap:** the Ranger has no personal want beyond trade and no state-dependent lines yet *(open)*.

## Recommended next step (needs your OK)
Extend `NpcData` with an authored `profile` block and a content-integrity test that fails on a missing want/limit, then write return-and-after lines for the Ranger. This touches types and tests, so I left it for approval.
