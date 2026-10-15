# 82-0 Profile artwork (VLS-2123, unblocked in VLS-2431)

`page` is exported. `avatar`, `playIcon` and `stats` are still empty, and `ProfileView`
(`@vaulty/views`) degrades for each — a stat card with no art entry draws without art, and the
avatar falls back to initials.

**This folder used to be blocked on a frame-level Figma link.** VLS-2123's node `1082:38845`
resolved to a text label named "PROFILE" (1033×303 at y=11164), not a frame, so there was nothing to
export from. VLS-2431's link — `3290:45596`, "82 - Temporary PROFILE" — is the frame, which is what
made the backdrop below possible.

## What is here

| file | node | scale | notes |
|---|---|---|---|
| `page-backdrop.webp` | `3290:44898` | 2× the IMAGE NODE (477×836 → 941×1672) | WebP q80, 127KB |

**WebP, per the format rule** in `apps/ultimate-11/public/ultimate-11/profile/README.md` — webp for
photographs, SVG for vectors, as every sibling profile folder already does (U11's own
`page-stadium.webp` is 57KB). Measured on this image: JPEG q60 was 231KB, WebP q80 is 127KB and q72
is 98KB for the same 941×1672; the source PNG was 2.0MB. q80 shows no banding in the dark gradients
the scrim sits on. Do not re-encode as JPEG.

Two things about `page-backdrop.webp` that are easy to undo by accident:

1. **It is exported at the image node's box, not the frame's.** The node is 477 wide and bleeds 43px
   past each edge of the 390 frame. `PageArt` is `object-cover object-top`, so a 941×1672 source in
   a 390×845 box scales to 475.6 wide and crops 42.8px per side — reproducing that bleed exactly.
   Re-exporting at 390 wide would silently widen the field of view.
2. **The frame's 258px "hero band" art (`3290:45044`) is the SAME FILE** — identical SHA256. Do not
   export it as a second asset; `ProfileView` already draws this backdrop inside the pinned header
   as well as behind the page.

   Their **scrims** are a different matter. The band's stops (304.89% / 308.51% over 258px) are not
   the page layer's (97.596% / 100% over 847px) rescaled — that would put them near 320% / 329%,
   and the two ratios disagree (0.988 vs 0.976). The band's wash was drawn separately, spanning
   ~796px. `--vaulty-profile-scrim` carries the PAGE layer's value and the header re-draws it, which
   over the header's first 258px is within a couple of percent — a deliberate approximation, not a
   reproduction. Only the image identity is proven; don't build a further inference on it.


## What each slot needs

| `PROFILE_ART` key | what it is | where it lands |
|---|---|---|
| `page` | full-page backdrop behind the signed-in page | `backgroundArtSrc` |
| `signedOut` | full-bleed art behind "BE PART OF THE GAME" | `signedOutArtSrc` |
| `avatar` | the 86px identity portrait | `avatarSrc` |
| `playIcon` | leading glyph on the empty state's PLAY button (SVG) | `playIcon` |
| `stats[<field id>]` | one stat card's background | `statArt` |

`stats` is keyed by the field's **`id` in the `profile_page` document**, not by a name of ours.
82-0's document publishes `best_score`, `games_played` and `record`. An id with no entry renders its
card without art, so renaming a field in the back office silently drops its art rather than breaking
the build — the tradeoff that comes with a server-declared field list.

(This used to cite `hooks/use-profile-data.ts` as the reader of those three fields. VLS-2123 deleted
that hook when the screen moved onto the shared `ProfileView`; the field list now comes from
`useProfile` in `@vaulty/core`, joined to the document.)

## Two export traps, both paid for already

Recorded in `apps/ultimate-11/public/ultimate-11/profile/README.md` and worth repeating:

1. **The page backdrop is the layer UNDER the one whose name reads like it.** Exporting the
   obvious-sounding node gives the scrim, not the photograph.
2. **Stat-card art must come from an UNSCROLLED frame**, or Figma clips the export at the
   viewport edge.

## When you add a file

Export at 2× the frame's box, commit it here, add the path to `PROFILE_ART` in
`lib/profile-view-config.ts`, and record the node id + export scale in this file. Both the live
route and `/dev/profile` read that one object, so neither can drift from the other.

`page` and `signedOut` must be **two different images** — passing the page backdrop for both is what
put a bare stadium behind U11's "BE PART OF THE GAME" (VLS-1876 #4).
