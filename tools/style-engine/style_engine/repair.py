"""
Repair loop — mirrors the repair section of generateProceduralStyle().

After the semantic recipe is drawn, the weakest pairing is re-chosen with
coherent weighting (up to three times, never in Extreme mode). Each repair
uses its own PRNG derived from the seed so it stays deterministic.
"""

from .prng import SeededRandom
from .rules import (
    depth_border, evaluate_recipe, geometry_surface, icon_surface, motion_depth, surface_border, surface_depth,
)
from .motion import motion_to_behavior
from .typography import choose_typography


def repair_recipe(semantic, personality, mode, seed_number, is_locked, options, decide, trace):
    """Returns (semantic, coherence, repaired_axes, iterations)."""
    repaired = []
    coherence = evaluate_recipe(semantic)
    iterations = 0
    threshold = 0 if mode == "Coherent" else -1 if mode == "Experimental" else -2

    while mode != "Extreme" and coherence["weakestAxis"] and coherence["weakestRelation"] < threshold and iterations < 3:
        iterations += 1
        axis = coherence["weakestAxis"]
        if is_locked(axis):
            break
        repaired.append(axis)
        prng = SeededRandom(seed_number + iterations * 1013)
        repair_trace = []
        s = semantic
        if axis == "depth":
            s = dict(s, depth=decide(prng, "depth", options["depth"](personality), "Coherent",
                                     lambda d: [(surface_depth(s["surface"], d), "repair")], repair_trace))
        elif axis == "borders":
            s = dict(s, border=decide(prng, "borders", options["borders"](personality), "Coherent",
                                      lambda b: [(surface_border(s["surface"], b), "repair"), (depth_border(s["depth"], b), "repair")], repair_trace))
        elif axis == "geometry":
            s = dict(s, geometry=decide(prng, "geometry", options["geometry"](personality), "Coherent",
                                        lambda g: [(geometry_surface(g, s["surface"]), "repair")], repair_trace))
        elif axis == "icons":
            s = dict(s, icons=decide(prng, "icons", options["icons"](personality), "Coherent",
                                     lambda i: [(icon_surface(i, s["surface"]), "repair")], repair_trace))
        elif axis == "motion":
            s = dict(s, motion=decide(prng, "motion", options["motion"](personality), "Coherent",
                                      lambda m: [(motion_depth(m, s["depth"]), "repair")], repair_trace))
            s["behavior"] = motion_to_behavior(s["motion"], s["depth"])
        elif axis == "typography":
            s = dict(s, typography=choose_typography(prng, personality, "Coherent", s["surface"], repair_trace, decide))
        elif axis == "svg":
            s = dict(s, svg=dict(s["svg"], strokeLanguage="thin", blurLevel=0.2))
        semantic = s
        for t in repair_trace:
            trace.append(dict(t, chosen=f"{t['chosen']} (repair {iterations})"))
        coherence = evaluate_recipe(semantic)

    return semantic, coherence, repaired, iterations
