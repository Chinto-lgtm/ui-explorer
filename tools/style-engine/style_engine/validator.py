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
