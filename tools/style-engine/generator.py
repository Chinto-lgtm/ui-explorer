"""
UI Explorer — Python Procedural Generator
Python counterpart of browser style generator.
"""

from random_prng import SeededRandom

PREFIXES = ['Midnight', 'Solar', 'Electric', 'Quiet', 'Velvet', 'Lunar', 'Neon', 'Cosmic']
SUFFIXES = ['Acrylic', 'Glass', 'Clay', 'Bento', 'Pulse', 'Aura', 'Grid', 'Forge']

def generate_style(seed=847291):
    prng = SeededRandom(seed)
    
    name = f"{prng.choice(PREFIXES)} {prng.choice(SUFFIXES)}"
    style_id = f"procedural-{prng.s}"
    
    return {
        "id": style_id,
        "name": name,
        "version": "1.0.0",
        "author": "UI Explorer Engine",
        "category": "generated",
        "metadata": {
            "description": f"Procedurally generated style derived from seed {seed}.",
            "seed": seed,
            "tags": ["procedural", "python-generated"]
        },
        "tokens": {
            "colors": {
                "bg": "#0f172a",
                "surface": "#1e293b",
                "textPrimary": "#f8fafc",
                "textSecondary": "#94a3b8",
                "border": "#334155",
                "accent": "#6366f1"
            },
            "typography": {
                "fontFamilySans": "Inter, sans-serif",
                "fontSizeBase": "1rem"
            },
            "radii": {
                "md": "12px"
            }
        }
    }
