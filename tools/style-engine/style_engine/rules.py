"""
Compatibility rules — mirrors src/engine/generator/compatibility.ts.

Relations: strong = +2, compatible = +1, neutral = 0, tension = -1,
incompatible = -2. They only weight generation and trigger repair; they are
never shown as a quality rating.
"""

import re

from .data import COMPATIBILITY, RECIPE_AXES

_TABLES = COMPATIBILITY["tables"]
AXIS_WEIGHTS = COMPATIBILITY["axisWeights"]
_FACTORS = COMPATIBILITY["factors"]


def _rel(table, a, b):
    return _TABLES[table].get(a, {}).get(b, 0)


def surface_depth(s, d):
    return _rel("SURFACE_DEPTH", s, d)


def surface_border(s, b):
    return _rel("SURFACE_BORDER", s, b)


def geometry_surface(g, s):
    return _rel("GEOMETRY_SURFACE", g, s)


def depth_border(d, b):
    return _rel("DEPTH_BORDER", d, b)


def icon_surface(i, s):
    return _rel("ICON_SURFACE", i, s)


def motion_depth(m, d):
    return _rel("MOTION_DEPTH", m, d)


def is_serif(family):
    return re.search(r"serif", family, re.I) is not None and re.search(r"sans-serif", family, re.I) is None


def is_mono(family):
    return re.search(r"mono", family, re.I) is not None


def typography_relation(heading_family, surface, personality):
    if is_mono(heading_family):
        if surface in ("transparent", "flat", "solid"):
            return 2
        if surface in ("clay", "liquid"):
            return -2
        if personality in ("Technical", "Futuristic"):
            return 2
        return -1
    if is_serif(heading_family):
        if surface in ("paper", "flat"):
            return 2
        if personality in ("Editorial", "Luxury"):
            return 2
        if surface in ("glass", "crystal", "liquid"):
            return -1
        if personality in ("Futuristic", "Technical"):
            return -2
        return 0
    return 1


def svg_surface_relation(recipe):
    svg, surface = recipe["svg"], recipe["surface"]
    if svg["strokeLanguage"] == "pixel" and surface in ("glass", "frosted", "liquid"):
        return -2
    if svg["gradientType"] == "aurora" and surface in ("glass", "liquid", "transparent"):
        return 2
    if svg["gradientType"] == "metallic" and surface == "metallic":
        return 2
    if svg["shapeLanguage"] == "grid" and surface in ("transparent", "flat"):
        return 2
    if svg["blurLevel"] > 0.5 and surface in ("paper", "flat"):
        return -1
    if svg["shapeLanguage"] == "blobs" and surface in ("clay", "liquid"):
        return 2
    return 0


def evaluate_recipe(recipe):
    """Coherence report: weighted 0..1 score plus the weakest axis (or None)."""
    t = recipe["typography"]
    relations = [
        ("depth", "Surface ↔ Depth", surface_depth(recipe["surface"], recipe["depth"])),
        ("borders", "Surface ↔ Border", surface_border(recipe["surface"], recipe["border"])),
        ("geometry", "Geometry ↔ Surface", geometry_surface(recipe["geometry"], recipe["surface"])),
        ("borders", "Depth ↔ Border", depth_border(recipe["depth"], recipe["border"])),
        ("icons", "Icons ↔ Surface", icon_surface(recipe["icons"], recipe["surface"])),
        ("motion", "Motion ↔ Depth", motion_depth(recipe["motion"], recipe["depth"])),
        ("typography", "Typography ↔ Surface", typography_relation(t["headingFamily"], recipe["surface"], recipe["personality"])),
        ("svg", "SVG ↔ Surface", svg_surface_relation(recipe)),
        ("colors", "Palette ↔ Personality", 1),
    ]
    weighted = 0.0
    total = 0.0
    for axis, _, rel in relations:
        w = AXIS_WEIGHTS[axis]
        weighted += ((rel + 2) / 4) * w
        total += w
    score = _round2(weighted / total)
    # JS Array.prototype.sort is stable: ties keep declaration order.
    worst = sorted(relations, key=lambda r: r[2])[0]
    return {
        "score": score,
        "relations": [{"axis": a, "label": l, "relation": r} for a, l, r in relations],
        "weakestAxis": worst[0] if worst[2] < 0 else None,
        "weakestRelation": worst[2],
    }


def compatibility_factor(relation, mode):
    if mode == "Extreme":
        return 1
    return _FACTORS["Coherent" if mode == "Coherent" else "Experimental"][str(relation)]


def _round2(x):
    import math
    return math.floor(x * 100 + 0.5) / 100


assert set(AXIS_WEIGHTS) == set(RECIPE_AXES)
