"""
Shared engine data. The tables are exported from the TypeScript engine by
`npm run engine:data` so both implementations read the same personalities,
vocabulary and compatibility matrix.
"""

import json
import os

_DATA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "engine-data.json")

with open(_DATA_PATH, "r", encoding="utf-8") as _f:
    ENGINE_DATA = json.load(_f)

GENERATOR_VERSION = ENGINE_DATA["generatorVersion"]
PERSONALITIES = ENGINE_DATA["personalities"]
VOCAB = ENGINE_DATA["vocab"]
COMPATIBILITY = ENGINE_DATA["compatibility"]
TABLES = ENGINE_DATA["generator"]

RECIPE_AXES = VOCAB["recipeAxes"]
SURFACE_TYPES = VOCAB["surfaceTypes"]
DEPTH_TYPES = VOCAB["depthTypes"]
BORDER_TYPES = VOCAB["borderTypes"]
MOTION_TYPES = VOCAB["motionTypes"]
ICON_TYPES = VOCAB["iconTypes"]
GEOMETRY_TYPES = VOCAB["geometryTypes"]
PERSONALITY_TYPES = TABLES["PERSONALITY_TYPES"]


def to_surface(label):
    return VOCAB["surfaceLabels"].get(label, "solid")


def to_depth(label):
    return VOCAB["depthLabels"].get(label, "soft")


def to_motion(label):
    return VOCAB["motionLabels"].get(label, "smooth")


SVG_DEFAULTS = {
    "shapeLanguage": "curves", "gradientType": "linear", "strokeLanguage": "thin",
    "glowLevel": 0.1, "noiseLevel": 0, "gridLevel": 0, "particleDensity": 0,
    "curveStrength": 0.4, "metallicReflection": 0, "blurLevel": 0,
}


def to_svg_language(label):
    svg = dict(SVG_DEFAULTS)
    svg.update(VOCAB["svgLabels"].get(label, {}))
    return svg


def radius_to_geometry(radius):
    try:
        px = int(str(radius).replace("px", ""))
    except ValueError:
        return "medium"
    if px == 0:
        return "sharp"
    if px <= 6:
        return "small"
    if px <= 14:
        return "medium"
    if px <= 24:
        return "large"
    return "pill"
