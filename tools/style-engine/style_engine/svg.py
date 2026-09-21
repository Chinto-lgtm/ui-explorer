"""
SVG shape language — mirrors chooseSvg() in generator.ts and
materializeSvg() in vocab.ts.
"""

from .data import to_svg_language
from .prng import js_round


def _jitter(prng, value, amount):
    v = value + prng.next_float(-amount, amount)
    return js_round(min(1, max(0, v)) * 100) / 100


def choose_svg(prng, personality, trace):
    label = prng.weighted_choice([(s["svg"], s["weight"]) for s in personality["svgWeights"]])
    svg = to_svg_language(label)
    # Small deterministic jitter so two styles with the same label still differ.
    svg["glowLevel"] = _jitter(prng, svg["glowLevel"], 0.1)
    svg["curveStrength"] = _jitter(prng, svg["curveStrength"], 0.1)
    svg["particleDensity"] = _jitter(prng, svg["particleDensity"], 0.05)
    trace.append({"axis": "svg", "chosen": label, "locked": False,
                  "candidates": [{"value": s["svg"], "baseWeight": s["weight"], "factor": 1, "finalWeight": s["weight"], "reasons": []} for s in personality["svgWeights"]]})
    return svg


def materialize_svg(svg, geometry):
    if svg["shapeLanguage"] == "reticle":
        corner = "bevel"
    elif geometry == "sharp":
        corner = "brutalist" if svg["strokeLanguage"] == "bold" else "sharp"
    else:
        corner = "rounded"
    if svg["gridLevel"] > 0.6:
        pattern = "grid"
    elif svg["noiseLevel"] > 0.6:
        pattern = "noise"
    elif svg["particleDensity"] > 0.6:
        pattern = "dots"
    elif svg["gradientType"] == "aurora":
        pattern = "aurora"
    else:
        pattern = None
    out = {
        "cornerStyle": corner,
        "decorativeShapes": svg["particleDensity"] > 0.3 or svg["shapeLanguage"] in ("blobs", "confetti"),
        "borderDecoration": svg["shapeLanguage"] == "reticle" or svg["strokeLanguage"] == "bold",
    }
    if pattern is not None:
        out["patternOverlay"] = pattern
    return out
