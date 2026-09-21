"""
Typography choice and materialization — mirrors chooseTypography() in
generator.ts and materializeTypography() in vocab.ts.
"""

from .data import TABLES
from .rules import is_mono, is_serif, typography_relation

HEADING_PAIRS = TABLES["HEADING_PAIRS"]

SCALES = {
    "tight": {"xs": "0.7rem", "sm": "0.8rem", "base": "0.9375rem", "lg": "1.0625rem", "xl": "1.1875rem", "2xl": "1.375rem", "3xl": "1.75rem"},
    "regular": {"xs": "0.75rem", "sm": "0.875rem", "base": "1rem", "lg": "1.125rem", "xl": "1.25rem", "2xl": "1.5rem", "3xl": "2rem"},
    "generous": {"xs": "0.8125rem", "sm": "0.9375rem", "base": "1.0625rem", "lg": "1.25rem", "xl": "1.5rem", "2xl": "1.875rem", "3xl": "2.5rem"},
}


def choose_typography(prng, personality, mode, surface, trace, decide):
    """`decide` is the weighted decision helper from the generator (shared with other axes)."""
    name = personality["name"]
    family = decide(
        prng, "typography",
        [(t["font"], t["weight"]) for t in personality["typographyWeights"]],
        mode,
        lambda font: [(typography_relation(font, surface, name), f"{font.split(',')[0]} on {surface}")],
        trace,
    )
    serif = is_serif(family)
    mono = is_mono(family)
    heading_family = HEADING_PAIRS.get(family, family)
    body_family = ("Georgia, serif" if name == "Editorial" else "Inter, sans-serif") if serif else family
    mono_family = family if mono else "JetBrains Mono, monospace"
    if serif or mono:
        heading_weight = prng.choice([600, 700])
    else:
        heading_weight = prng.weighted_choice([(600, 30), (700, 50), (800, 20)])
    body_weight = 400 if mono else prng.weighted_choice([(400, 70), (500, 30)])
    if mono:
        letter_spacing = "0.02em"
    elif name in ("Technical", "Futuristic"):
        letter_spacing = "0.04em"
    elif name == "Editorial":
        letter_spacing = "-0.01em"
    elif name == "Minimal":
        letter_spacing = "-0.02em"
    else:
        letter_spacing = "0"
    line_height = "1.65" if serif else ("1.6" if name in ("Editorial", "Calm") else "1.5")
    scale = "generous" if name in ("Editorial", "Luxury") else ("tight" if name in ("Technical", "Minimal") else "regular")
    return {
        "family": body_family,
        "headingFamily": heading_family,
        "monoFamily": mono_family,
        "headingWeight": heading_weight,
        "bodyWeight": body_weight,
        "letterSpacing": letter_spacing,
        "lineHeight": line_height,
        "scale": scale,
    }


def materialize_typography(choice):
    s = SCALES[choice["scale"]]
    return {
        "fontFamilySans": choice["family"],
        "fontFamilyHeading": choice["headingFamily"],
        "fontFamilyMono": choice["monoFamily"],
        "fontSizeXs": s["xs"],
        "fontSizeSm": s["sm"],
        "fontSizeBase": s["base"],
        "fontSizeLg": s["lg"],
        "fontSizeXl": s["xl"],
        "fontSize2xl": s["2xl"],
        "fontSize3xl": s["3xl"],
        "fontWeightNormal": choice["bodyWeight"],
        "fontWeightMedium": min(choice["headingWeight"], choice["bodyWeight"] + 100),
        "fontWeightBold": choice["headingWeight"],
        "letterSpacing": choice["letterSpacing"],
        "lineHeight": choice["lineHeight"],
    }
