# 82-0 1V1 intro art

Source: `NEW 82-0` Figma 1V1 row plus the matchmaking proto
`apps/eighty-two-and-0/prototypes/1v1_820_matchmaking_with_transition.html`.

## Live composition

The product intro is `@vaulty/ui`'s `Vs1Cinematic` (same engine as Ultimate 11) with
`lib/game/vs1-cinematic-art.ts` supplying this game's layers. Fallback `Vs*` pieces
use the files in this folder if a cinematic asset fails to decode.

## `cinematic/`

Layers extracted from the proto. Names match the U11 cinematic contract
(`bg`, `title_s_l1`, `player_blue`, `burst_sheet`, …) plus 82-0's wedge shafts
(`glow_l`, `glow_r`). No drawn status bar — VLS-2155.

## Fallback files

| file | role |
|---|---|
| `backdrop.webp` | split orange/purple wedge |
| `avatar-you.webp` / `avatar-opponent.webp` | result-screen portraits |
| `vs-player-orange.webp` / `vs-player-violet.webp` | rim-lit figures if the cinematic cannot start |
| `ring-you.svg` / `ring-opponent.svg` / `ring-inner.svg` | result-screen rings |
