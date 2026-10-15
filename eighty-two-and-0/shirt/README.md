# 82-0 shirt art (VLS-2125)

Source: `NEW 82-0` Figma, "NEW 82 - Draft flow" (`176:21685`), the `basketball shirt`
instances on the court — e.g. `1602:48704`-`1602:48708` on the START screen. Consumed by
`<Jersey>` / `<GameField>` from `@vaulty/ui`, which take one bitmap per `JerseyState`;
`@vaulty/ui` ships no assets (`files: ["dist"]`), so the art lives here and is passed in
as props from `lib/game/court-art.ts`.

## Files

| file | role | provenance |
|---|---|---|
| `shirt-gray.webp` | `state="empty"` | Figma's raw `Layer 1 copy Image` fill, unmodified |
| `shirt-orange.webp` | `state="eligible"` | derived — see below |
| `shirt-tint-base.webp` | base a club colour multiplies through | derived |
| `shirt-mask-body.png` | body tint mask | derived |
| `shirt-mask-trim.png` | collar V + armhole trim tint mask | derived |
| `shirt-glow.webp` | halo behind an `eligible` shirt | derived |
| `shirt-dash.svg` | dashed frame OVER an `eligible` shirt | Figma `Vector 1552:24634`, unmodified |
| `shirt-shadow.svg` | the ground ellipse | Figma `Ellipse 5`, unmodified |

`shirt-dash.svg` is **not** derived from `shirt-gray.webp` and is therefore exempt from the
regenerate-together rule below — re-exporting the garment does not invalidate it. It is a
1.14px `#FFDD8E` stroke on the garment's own path, dashed `6.66 4.75`, and it has to stay a
vector: at the draft screen's ~56px shirt a rasterised dash of that weight is a smear. It is
authored `preserveAspectRatio="none"` so `Jersey` can stretch it onto the garment band
(`eligibleOutlineSrc`) rather than needing an inset of its own.

`state="filled"` reuses `shirt-gray.webp`: `Jersey` tints it with the club colour rather
than swapping the bitmap, which is what lets thirty teams share one garment. There is no
`locked` state — 82-0 has no draft phases, and `JerseySources` has no `locked` key.

## Derived files — how to regenerate

Do not hand-edit these. All five are computed from `shirt-gray.webp`, so if the garment is
re-exported they must be regenerated together. Generator: `mkshirt.js` in the VLS-2125
working notes.

**The masks.** A CSS mask cannot address regions *inside* a bitmap, so keeping a club
colour on the body while leaving the trim alone needs an explicit alpha mask per region.
They are derived by thresholding the grey shirt's luminance, which puts the split on the
design's own trim rather than on a geometric guess.

**They must be RGBA, with the mask in the ALPHA channel — not greyscale.** `Jersey`'s
`maskUrl` sets `mask-image` and nothing else, so `mask-mode` is `match-source`, and for a
raster image that means ALPHA. A greyscale PNG carries no alpha channel, so it reads as opaque
everywhere: the club colour then floods the whole jersey box instead of the garment, and a
placed player renders as a coloured RECTANGLE behind his shirt. The first version of these was
written from a 1-channel buffer and did exactly that. Check with
`sharp(f).metadata().channels === 4` after regenerating; U11's masks are RGBA for the same
reason.

**The threshold is 0.62 for this art — not U11's 0.65 and not All Dubs' 0.78.** Measured,
not carried over. The histogram of `shirt-gray.webp` puts the garment body at 0.20–0.55
(93% of opaque pixels), a valley at 0.55–0.65 (~1.8%), and the trim at 0.65–0.85. A soft
band across 0.59–0.65 yields a trim share of **6.40%** of the garment. That is above U11's
5.05% and All Dubs' 5.5%, and it should be: a singlet's collar V and armhole binding are a
larger fraction of a sleeveless garment than a football shirt's collar and cuffs are of a
sleeved one. The split lands visually on the collar and both armholes — verified by
tinting a club colour through it and checking the trim stays light.

**The tint base.** `Jersey` reproduces a club colour by multiplying it over a near-white
garment: multiplying over white keeps the colour faithful *and* keeps the folds, whereas
multiplying over a saturated shirt drags every kit toward that shirt's hue. 82-0's grey
singlet is **darker than either sibling's** — modal body luminance ~0.32, against U11's
~0.52 — so multiplying through it directly would render every team at roughly a third
brightness. This is the same garment normalised toward white with its shading ratios
preserved, while `shirt-gray.webp` stays the on-design `empty` state.

**The eligible garment.** The design's eligible shirt is orange with its trim left light,
so this is the design's `#e2761c` multiplied through the tint base **on the body mask
only**, with `#f2c88a` on the trim. Multiplying the whole garment turned the collar and
armholes orange too, which the mock does not.

**The glow.** Figma has no exportable halo layer — the eligible shirt on the canvas is a
dimmed grey instance with a separate ellipse and vector stacked over it — so the sprite is
generated from the garment's own alpha silhouette: two summed blurs (σ5 tight + σ14 wide),
minus the silhouette itself, gamma 1.35, tinted `#e2761c`, encoded lossless.

Two things that went wrong first, both worth knowing if it is regenerated:

1. **Not subtracting the garment.** A blur of a solid shape stays solid in its interior, so
   summing two blurs produced a hard-edged orange block rather than a falloff. The halo is
   the BLEED — `max(0, blurred − silhouette)`.
2. **`.extend(...).toBuffer()` on a raw input returns an ENCODED image**, not raw bytes.
   Reading that back with `{raw: {width, height}}` reads PNG header bytes as pixels, which
   produced a boxy smear off to one side. Chain `.raw()` before `.toBuffer()` and read
   `info` back rather than assuming it. This is the same family as the `info.channels`
   striding bug U11's own README records.

Current sprite: 248×328, peak alpha 255, mean 37 — carrying a **1.476 × 1.323** overscan of
the GARMENT (not of the jersey box), which is what `EIGHTY_TWO_SHIRT_SHAPE.glowInset`
converts into box-relative percentages. Lossless because a smooth alpha ramp is exactly
what lossy webp bands.
