"""
UI Explorer — Style validator for the CLI and CI.

Mirrors src/engine/validate.ts: the same required fields, the same dot-path
error format, so a file that passes here also loads in the app.  Files that
declare `extends` only need the fields they override.
"""

import json
import os
import re

REQUIRED_STRINGS = {
    "metadata": ["id", "name", "category", "description"],
    "tokens.colors": ["bg", "surface", "textPrimary", "textSecondary", "textTertiary", "border", "accent", "accentHover"],
    "tokens.typography": [
        "fontFamilySans", "fontSizeXs", "fontSizeSm", "fontSizeBase", "fontSizeLg", "fontSizeXl",
        "fontSize2xl", "fontSize3xl", "letterSpacing", "lineHeight",
    ],
    "tokens.radii": ["sm", "md", "lg", "full"],
    "tokens.shadows": ["sm", "md", "lg"],
    "tokens.borders": ["width", "style", "color"],
    "tokens.motion": ["durationFast", "durationNormal", "durationSlow", "easing"],
}

REQUIRED_NUMERIC = {"tokens.typography": ["fontWeightNormal", "fontWeightMedium", "fontWeightBold"]}

CATEGORIES = {"Morphism", "Modern", "Expressive", "Futuristic", "Retro", "Minimalist", "Custom"}
ID_PATTERN = re.compile(r"^[a-z0-9-]+$")
COLOR_PATTERN = re.compile(
    r"^(#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})|rgba?\(.*\)|hsla?\(.*\)|transparent|[a-z]+)$"
)

# Safe numeric ranges (mirrors PROPERTY_RANGES in src/engine/validate.ts).
PROPERTY_RANGES = [
    (re.compile(r"^tokens\.radii\.(sm|md|lg|xl)$"), 0, 64, "px"),
    (re.compile(r"^tokens\.borders\.width$"), 0, 12, "px"),
    (re.compile(r"^tokens\.materials\.backdropBlur$"), 0, 60, "px"),
    (re.compile(r"^tokens\.materials\.opacity$"), 0, 1, ""),
    (re.compile(r"^tokens\.motion\.duration(Fast|Normal|Slow)$"), 0, 1000, "ms"),
    (re.compile(r"^tokens\.motion\.(hoverScale|activeScale)$"), 0.5, 1.5, ""),
    (re.compile(r"^tokens\.typography\.fontWeight(Normal|Medium|Bold)$"), 100, 900, ""),
    (re.compile(r"^tokens\.icons\.strokeWidth$"), 0.5, 4, ""),
]

# CSS that could execute, load remote content or break out of a value. Packages are data, never code.
UNSAFE_VALUE = re.compile(
    r"(<\s*/?\s*(script|iframe|object|embed|svg|img|style)\b|javascript:|expression\s*\(|url\s*\(|@import|behavior\s*:|-moz-binding|on[a-z]+\s*=|[;{}])",
    re.I,
)
UNSAFE_TEXT = re.compile(r"<\s*/?\s*script|javascript:", re.I)
NUMERIC = re.compile(r"^\s*(-?[\d.]+)\s*([a-z%]*)\s*$", re.I)


def _numeric(value, unit):
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        return value
    if not isinstance(value, str):
        return None
    m = NUMERIC.match(value)
    if not m:
        return None
    n = float(m.group(1))
    if unit == "ms" and m.group(2) == "s":
        return n * 1000
    if unit and m.group(2) and m.group(2) != unit:
        return None
    return n


def _walk(obj, prefix, out):
    if not isinstance(obj, dict):
        return
    for key, value in obj.items():
        path = f"{prefix}.{key}"
        if isinstance(value, dict):
            _walk(value, path, out)
        else:
            out.append((path, value))


def check_ranges_and_safety(style):
    """Range and safety problems as dot paths (mirrors checkRangesAndSafety in validate.ts)."""
    problems = []
    entries = []
    _walk(style.get("tokens"), "tokens", entries)
    _walk(style.get("customCssVars"), "customCssVars", entries)
    _walk(style.get("metadata"), "metadata", entries)
    for path, value in entries:
        if isinstance(value, str):
            unsafe = UNSAFE_TEXT.search(value) if path.startswith("metadata.") else UNSAFE_VALUE.search(value)
            if unsafe:
                problems.append(f"{path} contains unsafe content")
        for pattern, lo, hi, unit in PROPERTY_RANGES:
            if not pattern.match(path):
                continue
            n = _numeric(value, unit)
            if n is None:
                if value is not None:
                    problems.append(f"{path} is not a {unit or 'number'} value")
            elif n < lo or n > hi:
                problems.append(f"{path} out of range ({lo}–{hi}{unit})")
            break
    return problems


def _get(root, path):
    for key in path.split("."):
        if not isinstance(root, dict):
            return None
        root = root.get(key)
    return root


def validate_style_json(style):
    """Return a list of dot-path problems. Empty list means valid."""
    errors = []
    if not isinstance(style, dict):
        return ["(root object)"]

    inherits = isinstance(style.get("extends"), str) and style["extends"].strip() != ""

    for group, keys in REQUIRED_STRINGS.items():
        obj = _get(style, group)
        if not isinstance(obj, dict):
            if not inherits or group == "metadata":
                errors.append(group)
            continue
        for key in keys:
            if key not in obj and inherits and group != "metadata":
                continue
            value = obj.get(key)
            if not isinstance(value, str) or value.strip() == "":
                errors.append(f"{group}.{key}")

    for group, keys in REQUIRED_NUMERIC.items():
        obj = _get(style, group)
        if not isinstance(obj, dict):
            continue
        for key in keys:
            if key not in obj and inherits:
                continue
            value = obj.get(key)
            ok = isinstance(value, (int, float)) or (isinstance(value, str) and value.strip() != "")
            if not ok:
                errors.append(f"{group}.{key}")

    meta = style.get("metadata") or {}
    if isinstance(meta.get("id"), str) and not ID_PATTERN.match(meta["id"]):
        errors.append("metadata.id must be lowercase letters, digits and hyphens")
    if isinstance(meta.get("category"), str) and meta["category"] not in CATEGORIES:
        errors.append(f"metadata.category must be one of {sorted(CATEGORIES)}")
    if "version" in meta and not re.match(r"^\d+\.\d+\.\d+$", str(meta["version"])):
        errors.append("metadata.version must be semver (x.y.z)")

    colors = _get(style, "tokens.colors")
    if isinstance(colors, dict):
        for key, value in colors.items():
            if isinstance(value, str) and not COLOR_PATTERN.match(value.strip()):
                errors.append(f"tokens.colors.{key} is not a CSS colour: {value}")

    errors.extend(check_ranges_and_safety(style))
    return errors


def validate_style_file(filepath):
    if not os.path.exists(filepath):
        return [f"File not found: {filepath}"]
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as exc:  # noqa: BLE001 - surfaced verbatim to the user
        return [f"JSON parse error: {exc}"]
    return validate_style_json(data)


def validate_registry(index_path):
    """Validate every package listed in styles/community/index.json."""
    root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(index_path))))
    with open(index_path, "r", encoding="utf-8") as f:
        entries = json.load(f)
    report = {}
    for entry in entries:
        path = os.path.join(root, entry["path"])
        errors = validate_style_file(path)
        data = {}
        if os.path.exists(path) and not any(e.startswith("JSON") for e in errors):
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
        if isinstance(data, dict) and data and _get(data, "metadata.id") != entry["id"]:
            errors.append(f"index id {entry['id']} does not match metadata.id {_get(data, 'metadata.id')}")
        report[entry["path"]] = errors
    return report
