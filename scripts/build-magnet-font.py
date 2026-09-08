"""Convert the portfolio's bold name glyphs to Three.js font data.

Requires fonttools. Run from the repository root:
    python3 scripts/build-magnet-font.py
"""

import json
from pathlib import Path

from fontTools.pens.basePen import BasePen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont


class ThreeOutlinePen(BasePen):
    def __init__(self, glyph_set):
        super().__init__(glyph_set)
        self.commands = []

    def command(self, kind, *points):
        self.commands.append(kind)
        self.commands.extend(str(round(value, 3)) for point in points for value in point)

    def _moveTo(self, point):
        self.command("m", point)

    def _lineTo(self, point):
        self.command("l", point)

    def _curveToOne(self, control1, control2, end):
        self.command("b", end, control1, control2)

    def _qCurveToOne(self, control, end):
        self.command("q", end, control)

    def _closePath(self):
        self.commands.append("z")


root = Path(__file__).resolve().parents[1]
font = instantiateVariableFont(
    TTFont(root / "public/fonts/TT-Cometus-Variable.ttf"), {"wght": 700}
)
glyph_set = font.getGlyphSet()
cmap = font.getBestCmap()
glyphs = {}
for char in dict.fromkeys("Kalina"):
    glyph = glyph_set[cmap[ord(char)]]
    outline = ThreeOutlinePen(glyph_set)
    bounds = BoundsPen(glyph_set)
    glyph.draw(outline)
    glyph.draw(bounds)
    glyphs[char] = {
        "ha": glyph.width,
        "x_min": bounds.bounds[0],
        "x_max": bounds.bounds[2],
        "o": " ".join(outline.commands),
    }

data = {
    "familyName": "TT Cometus — Kalina magnet glyphs",
    "resolution": font["head"].unitsPerEm,
    "ascender": font["hhea"].ascent,
    "descender": font["hhea"].descent,
    "boundingBox": {"yMin": font["head"].yMin, "yMax": font["head"].yMax},
    "underlineThickness": font["post"].underlineThickness,
    "glyphs": glyphs,
}
destination = root / "public/fonts/kalina-magnets.json"
destination.write_text(json.dumps(data, separators=(",", ":")) + "\n")
print(f"Wrote {destination.relative_to(root)} ({destination.stat().st_size} bytes)")
