"""
Surface, depth, border and icon materializers — mirrors vocab.ts.
Semantic value in, concrete tokens out.
"""

from .palettes import is_dark_hex, rgba


def materialize_surface(surface, colors):
    dark = is_dark_hex(colors["bg"])
    solid = colors["surface"]
    hover = colors.get("surfaceHover") or colors["surface"]
    light = "#ffffff" if dark else "#000000"
    accent, accent_hover, bg = colors["accent"], colors["accentHover"], colors["bg"]

    if surface == "flat":
        return bg, hover, {"opacity": 1}
    if surface == "transparent":
        return rgba(light, 0.04 if dark else 0.03), rgba(light, 0.08 if dark else 0.06), {"opacity": 0.9}
    if surface == "frosted":
        return rgba(light, 0.08 if dark else 0.55), rgba(light, 0.14 if dark else 0.7), {"backdropBlur": "16px", "opacity": 0.85}
    if surface == "glass":
        return rgba(light, 0.06 if dark else 0.35), rgba(light, 0.12 if dark else 0.5), {"backdropBlur": "24px", "opacity": 0.75, "reflection": True}
    if surface == "acrylic":
        return rgba(light, 0.1 if dark else 0.6), rgba(light, 0.16 if dark else 0.75), {"backdropBlur": "32px", "opacity": 0.8, "texture": "noise"}
    if surface == "crystal":
        return rgba(light, 0.05 if dark else 0.25), rgba(light, 0.1 if dark else 0.4), {
            "backdropBlur": "12px", "opacity": 0.7, "reflection": True,
            "gradient": f"linear-gradient(135deg, {rgba(light, 0.18)}, transparent 55%)",
        }
    if surface == "clay":
        return solid, hover, {"opacity": 1, "gradient": f"linear-gradient(145deg, {rgba('#ffffff', 0.35)}, transparent 60%)"}
    if surface == "elevated":
        return solid, hover, {"opacity": 1}
    if surface == "inset":
        return bg, hover, {"opacity": 1}
    if surface == "metallic":
        return solid, hover, {
            "opacity": 1, "reflection": True,
            "gradient": f"linear-gradient(180deg, {rgba('#ffffff', 0.16 if dark else 0.6)} 0%, transparent 45%, {rgba('#000000', 0.25)} 100%)",
        }
    if surface == "liquid":
        return solid, hover, {
            "opacity": 0.95, "backdropBlur": "8px",
            "gradient": f"linear-gradient(120deg, {rgba(accent, 0.18)}, transparent 50%, {rgba(accent_hover, 0.14)})",
        }
    if surface == "paper":
        return solid, hover, {"opacity": 1, "texture": "grain"}
    if surface == "experimental":
        return rgba(accent, 0.12 if dark else 0.1), rgba(accent, 0.2), {
            "opacity": 0.9, "backdropBlur": "20px", "texture": "scanline",
            "gradient": f"linear-gradient(90deg, {rgba(accent, 0.25)}, transparent)",
        }
    return solid, hover, {"opacity": 1}


def materialize_depth(depth, colors):
    dark = is_dark_hex(colors["bg"])
    ink = colors.get("shadowColor") or ("rgba(0, 0, 0, 0.6)" if dark else "rgba(15, 23, 42, 0.12)")
    strong = "rgba(0, 0, 0, 0.8)" if dark else "rgba(15, 23, 42, 0.22)"
    glow = colors.get("glowColor") or colors["accent"]

    if depth == "flat":
        return {"none": "none", "sm": "none", "md": "none", "lg": "none", "glow": "none"}
    if depth == "floating":
        return {"sm": f"0 4px 10px {ink}", "md": f"0 16px 40px {ink}", "lg": f"0 30px 70px {strong}", "glow": "none"}
    if depth == "deep":
        return {"sm": f"0 2px 6px {strong}", "md": f"0 12px 28px {strong}", "lg": f"0 28px 60px {strong}", "glow": "none"}
    if depth == "glowing":
        return {
            "sm": f"0 0 8px {rgba(glow, 0.35)}", "md": f"0 0 20px {rgba(glow, 0.45)}",
            "lg": f"0 0 40px {rgba(glow, 0.55)}", "glow": f"0 0 18px {rgba(glow, 0.8)}",
        }
    if depth == "inset":
        return {
            "sm": f"inset 0 1px 2px {ink}",
            "md": f"inset 0 2px 6px {ink}, 0 1px 0 {rgba('#ffffff', 0.06 if dark else 0.6)}",
            "lg": f"inset 0 4px 12px {strong}", "inset": f"inset 0 3px 8px {strong}", "glow": "none",
        }
    if depth == "physical":
        hard = colors["textPrimary"]
        return {
            "sm": f"2px 2px 0 {hard}", "md": f"5px 5px 0 {hard}", "lg": f"8px 8px 0 {hard}",
            "inset": f"inset 3px 3px 0 {rgba(hard, 0.35)}", "glow": "none",
        }
    # soft (and default)
    return {"sm": f"0 1px 3px {ink}", "md": f"0 6px 16px {ink}", "lg": f"0 14px 32px {ink}", "glow": "none"}


def materialize_border(border, colors):
    dark = is_dark_hex(colors["bg"])
    if border == "none":
        return {"width": "0px", "style": "none", "color": "transparent", "opacity": 0}
    if border == "subtle":
        return {"width": "1px", "style": "solid", "color": rgba("#ffffff" if dark else "#0f172a", 0.12 if dark else 0.08), "opacity": 0.12}
    if border == "strong":
        return {"width": "3px", "style": "solid", "color": colors["textPrimary"], "opacity": 1}
    if border == "dashed":
        return {"width": "2px", "style": "dashed", "color": colors["border"], "opacity": 1}
    if border == "double":
        return {"width": "4px", "style": "double", "color": colors["border"], "opacity": 1}
    if border == "glow":
        return {"width": "1px", "style": "solid", "color": colors["accent"], "opacity": 1}
    return {"width": "1px", "style": "solid", "color": colors["border"], "opacity": 1}


ICON_TOKENS = {
    "outline": {"strokeWidth": 2, "filled": False, "styleVariant": "outline"},
    "filled": {"strokeWidth": 2, "filled": True, "styleVariant": "filled"},
    "duotone": {"strokeWidth": 1.75, "filled": True, "styleVariant": "duotone"},
    "geometric": {"strokeWidth": 2.5, "filled": False, "styleVariant": "sharp"},
    "rounded": {"strokeWidth": 2, "filled": False, "styleVariant": "rounded"},
    "3d": {"strokeWidth": 2.25, "filled": True, "styleVariant": "filled"},
    "pixel": {"strokeWidth": 3, "filled": True, "styleVariant": "sharp"},
    "skeuomorphic": {"strokeWidth": 1.5, "filled": True, "styleVariant": "filled"},
}


def materialize_icons(icon):
    return dict(ICON_TOKENS.get(icon, ICON_TOKENS["outline"]))
