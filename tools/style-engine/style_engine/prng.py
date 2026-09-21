"""
Seeded PRNG — Mulberry32, bit-for-bit compatible with src/engine/random/prng.ts.

Every draw the browser engine makes has a counterpart here, in the same order,
so the same seed yields the same style on both sides.
"""

import math

MASK32 = 0xFFFFFFFF


def _to_int32(value):
    """JavaScript ToInt32."""
    value &= MASK32
    return value - (1 << 32) if value & 0x80000000 else value


def hash_seed(seed):
    """Turn any string or number into the positive 32-bit integer the TS engine uses."""
    if isinstance(seed, bool):
        seed = int(seed)
    if isinstance(seed, (int, float)):
        return int(math.floor(abs(seed))) or 1
    h = 0
    for ch in str(seed):
        h = _to_int32((h << 5) - h + ord(ch))
    return abs(h) or 12345


class SeededRandom:
    """Deterministic Mulberry32 generator."""

    def __init__(self, seed):
        self.state = hash_seed(seed)

    def next(self):
        self.state = (self.state + 0x6D2B79F5) & MASK32
        t = self.state
        t = ((t ^ (t >> 15)) * (t | 1)) & MASK32
        t ^= (t + (((t ^ (t >> 7)) * (t | 61)) & MASK32)) & MASK32
        t &= MASK32
        return ((t ^ (t >> 14)) & MASK32) / 4294967296.0

    def next_int(self, lo, hi):
        return int(math.floor(self.next() * (hi - lo + 1))) + lo

    def next_float(self, lo, hi):
        return self.next() * (hi - lo) + lo

    def choice(self, items):
        if not items:
            raise ValueError("PRNG.choice called on empty list")
        return items[int(math.floor(self.next() * len(items)))]

    def weighted_choice(self, options):
        """options: list of (value, weight) tuples."""
        if not options:
            raise ValueError("PRNG.weighted_choice called on empty options")
        total = sum(max(0, w) for _, w in options)
        if total <= 0:
            return options[0][0]
        r = self.next() * total
        for value, weight in options:
            w = max(0, weight)
            if r < w:
                return value
            r -= w
        return options[-1][0]


def js_round(x):
    """JavaScript Math.round (half towards +infinity)."""
    return math.floor(x + 0.5)


def js_num(x):
    """Format a float the way JavaScript's Number#toString does for the values we emit."""
    if isinstance(x, bool):
        return str(x).lower()
    if isinstance(x, int) or float(x).is_integer():
        return str(int(x))
    return repr(float(x))
