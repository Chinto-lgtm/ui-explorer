"""
UI Explorer — Python Mulberry32 PRNG implementation
Guarantees deterministic parity with TypeScript PRNG implementation.
"""

import math

def hash_seed(seed):
    if isinstance(seed, int):
        return abs(seed) or 12345
    
    hash_val = 0
    for char in str(seed):
        hash_val = ((hash_val << 5) - hash_val) + ord(char)
        hash_val &= 0xFFFFFFFF
    return abs(hash_val) or 12345

class SeededRandom:
    def __init__(self, seed):
        self.s = hash_seed(seed)

    def next(self):
        self.s = (self.s + 0x6D2B79F5) & 0xFFFFFFFF
        t = self.s
        t = (t ^ (t >> 15)) * (t | 1) & 0xFFFFFFFF
        t ^= (t + ((t ^ (t >> 7)) * (t | 61) & 0xFFFFFFFF)) & 0xFFFFFFFF
        res = ((t ^ (t >> 14)) >> 0) & 0xFFFFFFFF
        return res / 4294967296.0

    def next_int(self, min_val, max_val):
        return math.floor(self.next() * (max_val - min_val + 1)) + min_val

    def choice(self, items):
        if not items:
            raise ValueError("Choice on empty list")
        idx = math.floor(self.next() * len(items))
        return items[idx]

    def weighted_choice(self, options):
        total_weight = sum(max(0, opt['weight']) for opt in options)
        if total_weight <= 0:
            return options[0]['value']
        
        r = self.next() * total_weight
        for opt in options:
            w = max(0, opt['weight'])
            if r < w:
                return opt['value']
            r -= w
        return options[-1]['value']
