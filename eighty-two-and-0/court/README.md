# 82-0 court art (VLS-2125, VLS-2553)

Source: `NEW 82-0` Figma, "NEW 82 - Draft flow". Consumed through
`lib/game/court-art.ts` — nothing here is referenced by path from a component.

| file | role | source node |
|---|---|---|
| `court.webp` | the wood, drawn oversized and offset behind the mask | `Untitled-1 1`'s image fill |
| `hoop.webp` | backboard + rim | **the `Hoop` COMPONENT FRAME `120:848`** — see below |
| `court-mask.svg` | the court's top/bottom dissolve, as Figma authors it | `Mask` `1602:48663` |

`court-mask.svg` is a reference copy: the dissolve ships as a CSS gradient in
`components/draft/draft-court.tsx` (`COURT_FADE`) with the same three stops, so nothing
loads this file at runtime. Keep them in step if the mask is ever re-authored.

## Export `hoop.webp` from the FRAME, not the rect inside it

`120:848` contains two children:

```
Hoop           (frame 120:848)        135 x 81
├── Hoop       (rect  120:850)         90 x 67   the backboard and rim
└── Rectangle 105 (rect 120:927)      135 x 56   a dark veil over the top
```

`Rectangle 105` is a dark gradient — alpha ramping roughly 195 → 0 downwards — that dissolves
the backboard's top edge and the court line just beneath it into the page ground. It is the
whole reason the design's backboard fades out at the top instead of ending on a hard white
line.

VLS-2125 exported the inner `Hoop` rect alone, so the shipped bitmap had a fully opaque
`(232,231,236)` top row where Figma renders `(25,32,42)`. That is what VLS-2553 reported as
"there is a fade in the top of the backboard + the court line close under the backboard".

So: **export the frame.** Both nodes render 112x84, which is why the mistake produced a
correctly-sized file and went unnoticed — the box in `EIGHTY_TWO_COURT.hoop` is unchanged
either way.

Two more things that cost time:

1. **Use the node RENDER, not the asset download.** Figma's asset-download path composites the
   frame onto the canvas and returns a fully opaque PNG (`#1e1e1e` showing through every gap in
   the backboard); the node render returns it on transparency, which is what this needs.
2. **Encode lossless.** The veil is a smooth alpha ramp, exactly the gradient lossy webp bands.
   Lossless costs ~5KB here and round-trips the render's pixels exactly — the shirt art's README
   records the same call for the same reason.
