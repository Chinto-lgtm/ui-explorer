"""
Corner geometry and density — mirrors materializeGeometry() in vocab.ts.
"""

RADII = {
    "sharp": {"sm": "0px", "md": "0px", "lg": "0px", "xl": "0px", "full": "0px"},
    "small": {"sm": "2px", "md": "4px", "lg": "8px", "xl": "12px", "full": "9999px"},
    "medium": {"sm": "6px", "md": "10px", "lg": "16px", "xl": "22px", "full": "9999px"},
    "large": {"sm": "10px", "md": "18px", "lg": "26px", "xl": "32px", "full": "9999px"},
    "pill": {"sm": "14px", "md": "24px", "lg": "32px", "xl": "40px", "full": "9999px"},
}


def materialize_geometry(geometry):
    return dict(RADII[geometry])


def density_for(personality_name):
    if personality_name in ("Minimal", "Editorial"):
        return "spacious"
    if personality_name == "Technical":
        return "compact"
    return "comfortable"
