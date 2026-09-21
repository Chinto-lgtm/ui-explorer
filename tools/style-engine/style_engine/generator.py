"""
Procedural style generator — Python implementation of
src/engine/generator/generator.ts (engine 2.0).

Pipeline: seed → personality → semantic recipe (colours, typography, geometry,
surface, depth, borders, icons, motion, svg, behaviour) → compatibility
weighting per mode → repair loop → materialised tokens → identity.

The browser engine is the runtime source of truth; this module follows the
same draw order so the same seed produces the same style (see tests/).
"""

from .data import (
    BORDER_TYPES, DEPTH_TYPES, GENERATOR_VERSION, GEOMETRY_TYPES, ICON_TYPES, MOTION_TYPES, PERSONALITIES,
    PERSONALITY_TYPES, RECIPE_AXES, SURFACE_TYPES, TABLES, radius_to_geometry, to_depth, to_motion, to_surface,
)
from .geometry import density_for, materialize_geometry
from .materials import materialize_border, materialize_depth, materialize_icons, materialize_surface
from .motion import materialize_behavior, materialize_motion, motion_to_behavior
from .palettes import evaluate_accessibility, generate_colors, hex_to_rgb
from .prng import SeededRandom, hash_seed
from .repair import repair_recipe
from .rules import (
    compatibility_factor, depth_border, geometry_surface, icon_surface, motion_depth, surface_border, surface_depth,
)
from .scoring import compute_dna, compute_dna_hash, is_near_duplicate
from .svg import choose_svg, materialize_svg
from .typography import choose_typography, materialize_typography

MODES = ("Coherent", "Experimental", "Extreme")


def _relation_label(r):
    return {2: "strong", 1: "compatible", 0: "neutral", -1: "tension"}.get(r, "incompatible")


def decide(prng, axis, options, mode, relations, trace):
    """Weighted pick where each option's weight is multiplied by its compatibility with earlier axes."""
    candidates = []
    for value, weight in options:
        factor = 1
        reasons = []
        for rel, reason in relations(value):
            factor *= compatibility_factor(rel, mode)
            if rel != 0:
                reasons.append(f"{reason}: {_relation_label(rel)} ({'+' if rel > 0 else ''}{rel})")
        candidates.append({"value": value, "baseWeight": weight, "factor": factor, "finalWeight": weight * factor, "reasons": reasons})
    chosen = prng.weighted_choice([(c["value"], max(c["finalWeight"], 0.001)) for c in candidates])
    trace.append({"axis": axis, "chosen": chosen, "locked": False, "candidates": candidates})
    return chosen


def _locked(trace, axis, value):
    trace.append({"axis": axis, "chosen": value, "locked": True,
                  "candidates": [{"value": value, "baseWeight": 1, "factor": 1, "finalWeight": 1, "reasons": ["kept from base style"]}]})


def _merged(weights, key, convert, universe, fill):
    merged = {}
    for w in weights:
        v = convert(w[key])
        merged[v] = merged.get(v, 0) + w["weight"]
    for v in universe:
        if v not in merged:
            merged[v] = fill
    return list(merged.items())


def surface_options(p):
    return _merged(p["surfaceWeights"], "surface", to_surface, SURFACE_TYPES, 2)


def depth_options(p):
    return _merged(p["depthWeights"], "depth", to_depth, DEPTH_TYPES, 2)


def motion_options(p):
    return _merged(p["motionWeights"], "motion", to_motion, MOTION_TYPES, 2)


def geometry_options(p):
    return _merged(p["radiusWeights"], "radius", radius_to_geometry, GEOMETRY_TYPES, 3)


def border_options(p):
    family = p["visualFamilies"][0]["family"] if p["visualFamilies"] else "Flat"
    boost = TABLES["BORDER_BOOSTS"].get(family, {})
    return [(b, boost.get(b, TABLES["BORDER_BASE"][b])) for b in BORDER_TYPES]


def icon_options(p):
    family = p["visualFamilies"][0]["family"] if p["visualFamilies"] else "Flat"
    boost = TABLES["ICON_BOOSTS"].get(family, {})
    return [(i, boost.get(i, TABLES["ICON_BASE"][i])) for i in ICON_TYPES]


OPTIONS = {
    "surface": surface_options, "depth": depth_options, "motion": motion_options,
    "geometry": geometry_options, "borders": border_options, "icons": icon_options,
}


def generate_name(prng, recipe, colors):
    r, g, b = hex_to_rgb(colors["bg"])
    dark = (r * 299 + g * 587 + b * 114) / 1000 < 128
    ar, ag, ab = hex_to_rgb(colors["accent"])
    sat = (max(ar, ag, ab) - min(ar, ag, ab)) / 255
    warm = ar > ab
    if dark:
        group = "dark"
    elif sat > 0.75:
        group = "vivid"
    elif recipe["personality"] in ("Calm", "Minimal"):
        group = "calm"
    else:
        group = "warm" if warm else "cool"
    prefix = prng.choice(TABLES["PREFIX_GROUPS"][group])
    material = prng.choice(TABLES["MATERIAL_WORDS"][recipe["surface"]])
    return f"{prefix} {material}"


def category_for(personality_name, surface):
    if personality_name in ("Futuristic", "Dark", "Technical"):
        return "Futuristic"
    if personality_name in ("Playful", "Energetic", "Experimental"):
        return "Expressive"
    if personality_name in ("Minimal", "Calm"):
        return "Minimalist"
    if surface in ("glass", "frosted", "clay", "acrylic"):
        return "Morphism"
    return "Modern"


def generate_style(seed, mode="Coherent", personality_type=None, visual_family=None, created_at=None):
    """Generate one style. Returns a result dict with `style`, `semantic`, `trace`, `coherence`, …"""
    if mode not in MODES:
        raise ValueError(f"mode must be one of {MODES}")
    seed_number = hash_seed(seed)
    prng = SeededRandom(seed_number)
    trace = []

    # Personality: the draw always happens so forcing the drawn value reproduces the same style.
    drawn_personality = prng.choice(PERSONALITY_TYPES)
    personality_name = personality_type or drawn_personality
    if personality_name not in PERSONALITIES:
        raise ValueError(f"unknown personality {personality_name!r}")
    personality = PERSONALITIES[personality_name]
    trace.append({"axis": "personality", "chosen": personality_name, "locked": bool(personality_type),
                  "candidates": [{"value": p, "baseWeight": 1, "factor": 1, "finalWeight": 1, "reasons": []} for p in PERSONALITY_TYPES]})

    drawn_family = prng.weighted_choice([(f["family"], f["weight"]) for f in personality["visualFamilies"]])
    family = visual_family or drawn_family
    trace.append({"axis": "family", "chosen": family, "locked": bool(visual_family),
                  "candidates": [{"value": f["family"], "baseWeight": f["weight"], "factor": 1, "finalWeight": f["weight"], "reasons": []} for f in personality["visualFamilies"]]})

    colors, harmony = generate_colors(personality, prng)
    trace.append({"axis": "colors", "chosen": f"{harmony} ({colors['accent']})", "locked": False, "candidates": []})

    surface = decide(prng, "surface", surface_options(personality), mode, lambda _s: [], trace)
    geometry = decide(prng, "geometry", geometry_options(personality), mode,
                      lambda g: [(geometry_surface(g, surface), f"{g} corners on {surface}")], trace)
    density = density_for(personality["name"])
    depth = decide(prng, "depth", depth_options(personality), mode,
                   lambda d: [(surface_depth(surface, d), f"{surface} surface with {d} depth")], trace)
    border = decide(prng, "borders", border_options(personality), mode,
                    lambda b: [(surface_border(surface, b), f"{surface} surface with {b} border"),
                               (depth_border(depth, b), f"{depth} depth with {b} border")], trace)
    typography = choose_typography(prng, personality, mode, surface, trace, decide)
    icons = decide(prng, "icons", icon_options(personality), mode,
                   lambda i: [(icon_surface(i, surface), f"{i} icons on {surface}")], trace)
    motion = decide(prng, "motion", motion_options(personality), mode,
                    lambda m: [(motion_depth(m, depth), f"{m} motion with {depth} depth")], trace)
    svg = choose_svg(prng, personality, trace)

    semantic = {
        "personality": personality_name,
        "visualFamily": family,
        "harmony": harmony,
        "typography": typography,
        "geometry": geometry,
        "density": density,
        "surface": surface,
        "depth": depth,
        "border": border,
        "motion": motion,
        "icons": icons,
        "svg": svg,
        "behavior": motion_to_behavior(motion, depth),
    }
    trace.append({"axis": "behavior", "chosen": semantic["behavior"], "locked": False, "candidates": []})

    semantic, coherence, repaired, iterations = repair_recipe(
        semantic, personality, mode, seed_number, lambda _axis: False, OPTIONS, decide, trace)

    surface_color, surface_hover, materials = materialize_surface(semantic["surface"], colors)
    tokens = {
        "colors": dict(colors, surface=surface_color, surfaceHover=surface_hover, surfaceActive=surface_hover),
        "typography": materialize_typography(semantic["typography"]),
        "radii": materialize_geometry(semantic["geometry"]),
        "shadows": materialize_depth(semantic["depth"], colors),
        "borders": materialize_border(semantic["border"], colors),
        "motion": materialize_motion(semantic["motion"]),
        "materials": materials,
        "icons": materialize_icons(semantic["icons"]),
    }

    name = generate_name(prng, semantic, colors)
    p_name = personality["name"]
    style = {
        "metadata": {
            "id": f"procedural-{seed_number}",
            "name": name,
            "category": category_for(p_name, semantic["surface"]),
            "description": f"Generated {p_name.lower()} system: {semantic['surface']} surfaces, {semantic['depth']} depth, "
                           f"{semantic['geometry']} corners and {semantic['motion']} motion, from seed {seed_number}.",
            "tags": ["procedural", p_name.lower(), harmony.lower(), semantic["surface"], semantic["depth"]],
            "personality": personality["description"],
            "bestUsedFor": ["Procedural experimentation", "UI exploration"],
            "isCustom": True,
            "source": "generated",
            "version": GENERATOR_VERSION,
            "visualCharacter": f"{semantic['surface']} · {semantic['depth']} · {semantic['motion']}",
        },
        "tokens": tokens,
        "svgLanguage": materialize_svg(semantic["svg"], semantic["geometry"]),
        "behavior": materialize_behavior(semantic["behavior"], semantic["depth"]),
    }
    dna = compute_dna(style)
    dna_hash = compute_dna_hash(style)
    generation = {
        "seed": seed_number,
        "mode": mode,
        "personality": personality_name,
        "visualFamily": family,
        "generatorVersion": GENERATOR_VERSION,
        "recipe": semantic,
        "keptAxes": [],
        "dnaHash": dna_hash,
    }
    if created_at:
        generation["createdAt"] = created_at
    style["generation"] = generation

    return {
        "style": style,
        "semantic": semantic,
        "seedNumber": seed_number,
        "mode": mode,
        "accessibility": evaluate_accessibility(tokens["colors"]),
        "coherence": coherence,
        "repairedAxes": repaired,
        "repairIterations": iterations,
        "trace": trace,
        "dna": dna,
        "dnaHash": dna_hash,
        "generatorVersion": GENERATOR_VERSION,
    }


def generate_batch(seed, count, mode="Coherent", personality_type=None):
    """Batch generation with near-duplicate rejection, same seed stepping as generateBatch() in TS."""
    base = hash_seed(seed)
    results = []
    attempt = 0
    while len(results) < count and attempt < count * 4:
        derived = (base + attempt * 7919) & 0xFFFFFFFF
        attempt += 1
        candidate = generate_style(derived, mode, personality_type)
        if any(is_near_duplicate(r["style"], candidate["style"]) for r in results):
            continue
        results.append(candidate)
    return results


__all__ = ["generate_style", "generate_batch", "RECIPE_AXES", "MODES", "GENERATOR_VERSION"]
