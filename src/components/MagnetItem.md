# MagnetItem

Wrap every movable board object in `MagnetItem`. It owns pickup, dragging,
attachment, bounds, cancellation, and reset; content components supply appearance.

```tsx
import MagnetItem from '@/components/MagnetItem';

<MagnetItem label="Postcard from Ljubljana" defaultPosition={{ x: 80, y: 120 }}>
  <article className="bg-white p-4">Postcard content</article>
</MagnetItem>

<MagnetItem label="Holiday photo">
  <img src="/images/holiday.jpg" alt="A view from the holiday" />
</MagnetItem>
```

- Press and hold to lift; release to attach immediately at the current position.
  There is no inertia or release bounce. Mouse, pen, and touch use pointer events.
- For keyboard movement, focus the item, hold Space or Enter, and use arrow keys.
  Shift uses one-pixel steps. Release the held key to attach; Escape also attaches.
- Positions are pixel offsets from the item's normal CSS layout. Use `position`
  with `onPositionChange` for parent-owned positions, or `defaultPosition` for
  internal positions. Change `resetKey` to reset; with controlled positions,
  also update `position` to the desired reset location.
- Bounds default to the viewport. Pass `boundsRef` to constrain to a board element.
- Layout, viewport, font, and image size changes remeasure and clamp existing
  positions, reporting corrections through `onPositionChange`. Hidden responsive
  copies do not change shared positions. Mark protruding or rotated child visuals
  with `data-magnet-visual` to include them in the bounds (Paper and Magnet do this).
- The homepage uses a normal-flow, viewport-height board shared by papers and
  the title. Notes wrap on narrow screens, expanding the board vertically so the
  page can scroll. Drag limits follow the full scrollable board; resizing keeps
  existing offsets where they still fit and moves overflow back inside.
- Use `as="span"` for inline content such as the title. `label` names the item for
  assistive technology. Ordinary buttons, links, and form fields inside the item
  retain their interactions; `data-magnet-no-drag` opts out additional content.
- DOM content receives a contour-following shadow. For a separate 3D renderer,
  pass `shadow={false}` and follow the wrapper's transform and `--magnet-lift`
  (0 attached, 1 lifted). Multiply lift by exported `MAGNET_LIFT_PX` for depth.
  `data-magnet-state` exposes `held` or `attached`. Keep geometry and materials
  outside the interaction component, as in `TitleMagnet`.

The wrapper owns transform, pointer handling, cursor, and lift animation; don't
add another drag or pickup animation to its children. Blur, lost pointer capture,
pointer cancellation, and leaving the browser tab all end the hold.
