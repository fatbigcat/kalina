# TitleMagnet

The entire `Kalina` word has one MagnetItem anchor, one position, and one 3D group.
Both 3D text layers render the complete word using the existing font and materials.
The renderer follows `[data-title-magnet]`, including pickup, scrolling, and resizing.

Below 768px, HTML measurement fits the title to the available width. At 768px and
above, font size remains `min(40vh, 28vw)`. Font kerning and ligatures are disabled
to retain the original glyph advances and match the Three.js font. One DOM anchor
is reused across the breakpoint, so movement cannot diverge between two versions.
