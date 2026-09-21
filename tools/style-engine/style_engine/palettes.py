"""
Palette generation and WCAG contrast — mirrors src/engine/generator/colorEngine.ts.
"""

import math

from .prng import js_round


def hsl_to_hex(h, s, l):
    h_norm = ((h % 360) + 360) % 360
    s_norm = max(0, min(100, s)) / 100
    l_norm = max(0, min(100, l)) / 100
    c = (1 - abs(2 * l_norm - 1)) * s_norm
    x = c * (1 - abs(((h_norm / 60) % 2) - 1))
    m = l_norm - c / 2
    if h_norm < 60:
        r, g, b = c, x, 0
    elif h_norm < 120:
        r, g, b = x, c, 0
    elif h_norm < 180:
        r, g, b = 0, c, x
    elif h_norm < 240:
        r, g, b = 0, x, c
    elif h_norm < 300:
        r, g, b = x, 0, c
    else:
        r, g, b = c, 0, x

    def to_hex(n):
        return format(js_round((n + m) * 255), "x").rjust(2, "0")

    return f"#{to_hex(r)}{to_hex(g)}{to_hex(b)}"


def hex_to_rgb(hex_color):
    c = hex_color.replace("#", "")
    if len(c) == 3:
        c = "".join(ch + ch for ch in c)
    return int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16)


def rgba(hex_color, alpha):
    if not hex_color.startswith("#"):
        return hex_color
    r, g, b = hex_to_rgb(hex_color)
    a = js_round(alpha * 100) / 100
    a_str = str(int(a)) if float(a).is_integer() else repr(a)
    return f"rgba({r}, {g}, {b}, {a_str})"


def is_dark_hex(hex_color):
    if not hex_color.startswith("#"):
        return False
    r, g, b = hex_to_rgb(hex_color)
    return (r * 299 + g * 587 + b * 114) / 1000 < 128


def luminance(hex_color):
    r, g, b = (v / 255 for v in hex_to_rgb(hex_color))

    def lin(v):
        return v / 12.92 if v <= 0.03928 else math.pow((v + 0.055) / 1.055, 2.4)

    return lin(r) * 0.2126 + lin(g) * 0.7152 + lin(b) * 0.0722


def contrast_ratio(a, b):
    la, lb = luminance(a), luminance(b)
    ratio = (max(la, lb) + 0.05) / (min(la, lb) + 0.05)
    return js_round(ratio * 100) / 100


def evaluate_accessibility(colors):
    primary = contrast_ratio(colors["bg"], colors["textPrimary"])
    secondary = contrast_ratio(colors["bg"], colors["textSecondary"])
    accent = contrast_ratio(colors["bg"], colors["accent"])
    rating = "Fail"
    if primary >= 7.0:
        rating = "AAA"
    elif primary >= 4.5:
        rating = "AA"
    elif primary >= 3.0:
        rating = "AA Large"
    return {"textPrimaryRatio": primary, "textSecondaryRatio": secondary, "accentRatio": accent, "wcagRating": rating}


HARMONIES = [("Analogous", 40), ("Monochromatic", 25), ("Complementary", 15), ("Split-Complementary", 10), ("Triadic", 10)]


def generate_colors(personality, prng):
    """Same draw order as generateProceduralColors()."""
    hue_pref = prng.weighted_choice([(p, p["weight"]) for p in personality["huePreferences"]])
    base_hue = prng.next_int(hue_pref["hueMin"], hue_pref["hueMax"])
    harmony = prng.weighted_choice(HARMONIES)

    accent_hue = base_hue
    if harmony == "Complementary":
        accent_hue = (base_hue + 180) % 360
    elif harmony == "Analogous":
        accent_hue = (base_hue + 30) % 360
    elif harmony == "Split-Complementary":
        accent_hue = (base_hue + 150) % 360
    elif harmony == "Triadic":
        accent_hue = (base_hue + 120) % 360

    is_dark = prng.next() < personality["darkBgProbability"]
    sat = prng.next_int(personality["saturationRange"][0], personality["saturationRange"][1])

    if is_dark:
        bg_light = prng.next_int(4, 12)
        bg = hsl_to_hex(base_hue, math.floor(sat * 0.3), bg_light)
        surface = hsl_to_hex(base_hue, math.floor(sat * 0.25), bg_light + 6)
        surface_hover = hsl_to_hex(base_hue, math.floor(sat * 0.25), bg_light + 12)
        text_primary, text_secondary, text_tertiary = "#f8fafc", "#94a3b8", "#64748b"
        border = hsl_to_hex(base_hue, math.floor(sat * 0.2), bg_light + 16)
    else:
        bg_light = prng.next_int(94, 99)
        bg = hsl_to_hex(base_hue, math.floor(sat * 0.15), bg_light)
        surface = hsl_to_hex(base_hue, math.floor(sat * 0.1), bg_light - 4)
        surface_hover = hsl_to_hex(base_hue, math.floor(sat * 0.1), bg_light - 8)
        text_primary, text_secondary, text_tertiary = "#0f172a", "#475569", "#94a3b8"
        border = hsl_to_hex(base_hue, math.floor(sat * 0.2), bg_light - 14)

    accent_sat = min(100, sat + 30)
    accent = hsl_to_hex(accent_hue, accent_sat, 60 if is_dark else 45)
    accent_hover = hsl_to_hex(accent_hue, accent_sat, 70 if is_dark else 35)

    colors = {
        "bg": bg,
        "surface": surface,
        "surfaceHover": surface_hover,
        "surfaceActive": surface_hover,
        "textPrimary": text_primary,
        "textSecondary": text_secondary,
        "textTertiary": text_tertiary,
        "border": border,
        "borderHover": accent,
        "accent": accent,
        "accentHover": accent_hover,
        "accentText": "#ffffff",
        "success": "#10b981",
        "warning": "#f59e0b",
        "error": "#ef4444",
        "info": "#3b82f6",
        "shadowColor": "rgba(0,0,0,0.6)" if is_dark else "rgba(0,0,0,0.08)",
        "glowColor": accent,
    }
    return colors, harmony
