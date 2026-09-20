"""
UI Explorer — Style Validator for CLI & CI
Validates style JSON schema, colors, metadata, and token completeness.
"""

import json
import re
import os

def validate_style_json(style_data):
    errors = []
    
    if "id" not in style_data:
        errors.append("Missing required field: 'id'")
    elif not re.match(r"^[a-z0-9-]+$", style_data["id"]):
        errors.append("Field 'id' must be URL-safe lowercase alphanumeric with hyphens")

    if "name" not in style_data:
        errors.append("Missing required field: 'name'")

    if "tokens" not in style_data:
        errors.append("Missing required field: 'tokens'")
    else:
        tokens = style_data["tokens"]
        if "colors" not in tokens:
            errors.append("Missing 'tokens.colors'")
        if "typography" not in tokens:
            errors.append("Missing 'tokens.typography'")
        if "radii" not in tokens:
            errors.append("Missing 'tokens.radii'")

    return errors

def validate_style_file(filepath):
    if not os.path.exists(filepath):
        return [f"File not found: {filepath}"]
    
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        return validate_style_json(data)
    except Exception as e:
        return [f"JSON Parse Error: {str(e)}"]
