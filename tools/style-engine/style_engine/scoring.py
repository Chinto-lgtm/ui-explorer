"""
Style DNA and identity hash — mirrors src/engine/generator/dna.ts.

DNA is a descriptive fingerprint (0..10 per axis), not a quality score. The
hash is FNV-1a over the DNA plus a few key tokens, formatted XXXX-XXXX-XXXX.
"""

import math
import re

from .palettes import hex_to_rgb
from .prng import MASK32

DNA_AXES = ["typography", "color", "geometry", "surface", "depth", "border", "motion", "icon", "svg"]


def _clamp10(n):
    return max(0, min(10, math.floor(n * 10 + 0.5) / 10))


def _px(v):
    if not v:
        return 0
    m = re.search(r"(-?[\d.]+)px", str(v))
    return float(m.group(1)) if m else 0


def _ms(v):
    if not v:
        return 0
    m = re.search(r"([\d.]+)(ms|s)", str(v))
    if not m:
        return 0
    return float(m.group(1)) * 1000 if m.group(2) == "s" else float(m.group(1))


def _parse_float(v):
    """JavaScript parseFloat: leading numeric prefix or NaN (-> 0 here)."""
    m = re.match(r"\s*[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?", str(v))
    return float(m.group(0)) if m else 0


def _saturation(hex_color):
    if not hex_color.startswith("#"):
        return 0.5
    r, g, b = (c / 255 for c in hex_to_rgb(hex_color))
    mx, mn = max(r, g, b), min(r, g, b)
    l = (mx + mn) / 2
    if mx == mn:
        return 0
    d = mx - mn
    return d / (2 - mx - mn) if l > 0.5 else d / (mx + mn)


def _shadow_weight(shadow):
    if not shadow or shadow == "none":
        return 0
    nums = [abs(float(n)) for n in re.findall(r"(-?[\d.]+)px", shadow)]
    inset = 2 if "inset" in shadow else 0
    hard = 3 if re.search(r"\d+px \d+px 0(px)? ", shadow) else 0
    return max(nums + [0]) / 4 + inset + hard


def compute_dna(style):
    tokens = style["tokens"]
    svg = style.get("svgLanguage") or {}
    t = tokens["typography"]
    heading = t.get("fontFamilyHeading") or t["fontFamilySans"]
    serif = re.search(r"serif", heading, re.I) is not None and re.search(r"sans-serif", heading, re.I) is None
    mono = re.search(r"mono", heading, re.I) is not None
    try:
        weight = float(t.get("fontWeightBold")) or 700
    except (TypeError, ValueError):
        weight = 700
    typography = _clamp10((weight - 400) / 50 + (2 if serif else 0) + (2.5 if mono else 0) + abs(_parse_float(t.get("letterSpacing", "0"))) * 40)
    colors = tokens["colors"]
    color = _clamp10(_saturation(colors["accent"]) * 8 + _saturation(colors["bg"]) * 6)
    geometry = _clamp10(_px(tokens["radii"]["md"]) / 3)
    materials = tokens.get("materials") or {}
    blur = _px(materials.get("backdropBlur"))
    opacity = materials.get("opacity", 1)
    texture = materials.get("texture")
    surface = _clamp10(blur / 4 + (1 - opacity) * 8 + (2 if materials.get("gradient") else 0) + (1.5 if texture and texture != "none" else 0))
    shadows = tokens["shadows"]
    depth = _clamp10(_shadow_weight(shadows.get("md")) + (3 if shadows.get("glow") and shadows["glow"] != "none" else 0))
    borders = tokens["borders"]
    border = _clamp10(_px(borders.get("width")) * 2.5 + (2 if borders.get("style") in ("dashed", "double") else 0))
    motion_t = tokens["motion"]
    motion = _clamp10(_ms(motion_t.get("durationNormal")) / 60 + abs((motion_t.get("hoverScale", 1)) - 1) * 60)
    icons = tokens.get("icons") or {}
    try:
        stroke = float(icons.get("strokeWidth")) or 2
    except (TypeError, ValueError):
        stroke = 2
    icon = _clamp10(stroke * 2.5 + (2 if icons.get("filled") else 0))
    svg_score = _clamp10(
        (3 if svg.get("decorativeShapes") else 0)
        + (3 if svg.get("patternOverlay") else 0)
        + (2 if svg.get("borderDecoration") else 0)
        + (2 if svg.get("cornerStyle") in ("brutalist", "bevel") else 0)
    )
    return {
        "typography": typography, "color": color, "geometry": geometry, "surface": surface,
        "depth": depth, "border": border, "motion": motion, "icon": icon, "svg": svg_score,
    }


def _to_fixed1(n):
    """JavaScript Number#toFixed(1)."""
    return f"{n:.1f}"


def compute_dna_hash(style):
    dna = compute_dna(style)
    tokens = style["tokens"]
    parts = [_to_fixed1(dna[a]) for a in DNA_AXES] + [
        tokens["colors"]["bg"], tokens["colors"]["accent"],
        tokens["typography"]["fontFamilySans"].split(",")[0].strip().lower(),
        tokens["radii"]["md"], tokens["borders"]["width"], tokens["motion"]["easing"],
    ]
    text = "|".join(parts)
    h1 = 0x811C9DC5
    h2 = 0x01000193
    for ch in text:
        c = ord(ch)
        h1 ^= c
        h1 = (h1 * 0x01000193) & MASK32
        h2 = (h2 + c * 31 + (h1 & 0xFF)) & MASK32
    hexed = (format(h1, "x").rjust(8, "0") + format(h2, "x").rjust(8, "0")).upper()
    return f"{hexed[0:4]}-{hexed[4:8]}-{hexed[8:12]}"


def dna_distance(a, b):
    return math.sqrt(sum((a[axis] - b[axis]) ** 2 for axis in DNA_AXES))


def is_near_duplicate(a, b):
    if compute_dna_hash(a) == compute_dna_hash(b):
        return True
    return dna_distance(compute_dna(a), compute_dna(b)) < 1.2 and a["tokens"]["colors"]["accent"] == b["tokens"]["colors"]["accent"]
