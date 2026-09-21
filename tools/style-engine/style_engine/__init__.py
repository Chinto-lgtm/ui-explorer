"""
UI Explorer style engine — Python implementation of the procedural generator
plus validation tools for the community registry.

    python -m style_engine generate --seed 847291
    python -m style_engine validate styles/community/aurora-glass
    python -m style_engine inspect --seed 847291

The browser engine (src/engine/generator) is the runtime source of truth; this
package follows the same algorithm and draw order and is verified against it
by tests/test_parity.py.
"""

from .generator import GENERATOR_VERSION, MODES, generate_batch, generate_style
from .validator import validate_registry, validate_style_file, validate_style_json

__all__ = ["generate_style", "generate_batch", "validate_style_json", "validate_style_file", "validate_registry", "GENERATOR_VERSION", "MODES"]
