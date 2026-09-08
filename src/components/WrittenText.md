# WrittenText

Real HTML with static pigment coverage, multiply blending, and subpixel edge roughness.

```tsx
<WrittenText variant="pencil">A graphite note</WrittenText>
<WrittenText as="p" variant="pen" bleed>Written in ink.</WrittenText>
<WrittenText variant="marker">Remember this</WrittenText>

<Paper onBoard writingStyle="pen" writingBleed>
  <p>Written directly on the sheet.</p>
</Paper>
```

`variant` selects pencil, pen (default), or marker. Defaults use Naturalist,
Belmonte, and Notemakers respectively; override `fontFamily` through `style`
to keep a specific handwriting face with any material. `as` accepts `span`
(default), `p`, or `div`. Standard HTML attributes, children, `className`, and
`style` pass through. `bleed` is optional and off by default.

`Paper` applies the treatment automatically and retains `ballpoint` as an alias
for `pen`. Avoid nesting WrittenText inside Paper's writing layer, which would
apply the texture twice. Use WrittenText for writing content: supplied images
or backgrounds inside it are also part of the filtered painted content.

The filter modulates SourceGraphic alpha; noise never renders independently.
Static noise and 0.12–0.22px displacement preserve glyph shapes. Parameters
target the board's 19–30px text; grain does not enlarge with font size. Multiply
blends the resulting translucent writing with the paper beneath. Optional bleed
adds a faint halo beneath intact strokes, without replacing them with blurred text.
