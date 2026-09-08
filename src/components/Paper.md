# Paper and provisional editor

Paper lays out its HTML, texture, and magnet on a 240px-wide design surface.
The asset determines the fixed aspect ratio. Changing `width`, a responsive width
class, or the available parent width applies one uniform scale to that entire
surface. Text wrapping, padding proportions, and magnet proportions stay fixed.
Height follows the aspect ratio; do not set an independent height or transform.
Set `contentStyle.fontSize` in design pixels, not viewport units.

On the board, the saved size is the full-size width. Below a 600px viewport,
the entire group scales together down to 70% of that width; the available parent
width can constrain it further. This same scale applies to the magnet, its
attachment coordinates, the writing, and the sheet. The 70% floor keeps notes
readable while the existing wrapping and scrolling layout handles extra content.

The editor's magnet size is a percentage of the paper's design width (5–60%).
Saving stores this ratio, rather than a viewport pixel size. Magnet position spans
−25–125% on each axis, allowing attachments along every edge. Protruding magnets
remain included in the group's movement bounds. Further edits can change the
ratio deliberately; paper size and viewport changes preserve the saved ratio.

```tsx
<Paper onBoard type="vellum" width={210} writingStyle="pencil"
  contentStyle={{ fontSize: 27, padding: '14% 12%' }}
  attachment={{ left: '50%', top: '6%' }} magnet="flower">
  <p>A handwritten note.</p>
</Paper>
```

During `npm run dev`, open **Adjust papers** at the bottom right. Select a note,
then preview its size, four padding values, magnet position and choice, writing
style, and text. **Save defaults** atomically writes all notes to
`src/data/board-papers.json`; **Cancel changes** restores the last saved state.
Newlines remain real HTML text. Saved defaults are used on reload and in builds.
The editor and write endpoint are unavailable in production. The editor changes
data consumed by the real Paper instances, rather than generating separate mockups.
