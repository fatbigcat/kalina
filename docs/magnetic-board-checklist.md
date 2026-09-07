# Magnetic board implementation

Each numbered entry corresponds to a separate implementation commit. Checked implementation work does not imply unavailable browser verification passed.

- [x] 01 Isolate homepage board components; preserve existing letter styling.
- [x] 02 Define shared board items and desktop/mobile arrangements.
- [x] 03 Prepare steel, paper, and project assets.
- [ ] 04 Add steel scene and shared lighting.
- [ ] 05 Add hybrid HTML shadow/occlusion prototype.
- [ ] 06 Render graphite Cometo letter magnets.
- [ ] 07 Build textured menu and project objects.
- [ ] 08 Add synchronized bounded dragging.
- [ ] 09 Add hover, press, pickup, and settling.
- [ ] 10 Connect actions and accessible controls.
- [ ] 11 Save and reset arrangements.
- [ ] 12 Add mobile Arrange and keyboard movement.
- [ ] 13 Add reduced motion and rendering fallback.
- [ ] 14 Verify integration and remove obsolete presentation.

## Decisions

One R3F canvas; HTML content via Drei Html blending, real shadow geometry, fixed camera, graphite/white letter magnets, supplied worn steel photograph. No physics engine or continuous idle animation. Existing destination pages and Cloudflare deployment remain intact. Publication is a separate action.

Library review: Skiper Things drag and scroll is an infinite-grid component with Pro source access, not independent board objects (https://skiper-ui.com/v1/skiper5). Aceternity Draggable Card provides relevant Motion interaction patterns but not shared 3D geometry/shadows (https://ui.aceternity.com/components/draggable-card). Reuse Motion gestures and Drei Html/drag/material helpers; implement only board-specific synchronization and material composition. Phosphor is the icon source.

## Verification record

Pending. Record actual checks and limitations here before delivery.
