"""Same seed + same rules = same style. Different seeds must not collapse to one style."""

import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from style_engine import generate_batch, generate_style  # noqa: E402
from style_engine.prng import SeededRandom, hash_seed  # noqa: E402


class DeterminismTest(unittest.TestCase):
    def test_same_seed_is_identical(self):
        a = generate_style(847291)
        b = generate_style(847291)
        self.assertEqual(a["style"], b["style"])
        self.assertEqual(a["dnaHash"], b["dnaHash"])
        self.assertEqual(a["trace"], b["trace"])

    def test_string_and_numeric_seeds_are_stable(self):
        self.assertEqual(hash_seed("aurora"), hash_seed("aurora"))
        self.assertEqual(generate_style("aurora")["style"], generate_style("aurora")["style"])
        self.assertEqual(hash_seed(0), 1)
        self.assertEqual(hash_seed(""), 12345)

    def test_prng_sequence_is_reproducible(self):
        x = SeededRandom(42)
        y = SeededRandom(42)
        self.assertEqual([x.next() for _ in range(50)], [y.next() for _ in range(50)])

    def test_different_seeds_differ(self):
        hashes = {generate_style(seed)["dnaHash"] for seed in range(1, 41)}
        self.assertGreater(len(hashes), 30, "forty seeds should not collapse to a handful of styles")
        self.assertNotEqual(generate_style(1)["style"]["tokens"], generate_style(2)["style"]["tokens"])

    def test_modes_share_the_seed_but_can_diverge(self):
        coherent = generate_style(12345, "Coherent")
        extreme = generate_style(12345, "Extreme")
        self.assertEqual(coherent["semantic"]["personality"], extreme["semantic"]["personality"])
        self.assertEqual(coherent["repairIterations"] >= 0, True)
        self.assertEqual(extreme["repairIterations"], 0)

    def test_batch_rejects_near_duplicates(self):
        batch = generate_batch("batch", 6)
        self.assertEqual(len(batch), 6)
        self.assertEqual(len({r["dnaHash"] for r in batch}), 6)

    def test_forced_personality_matches_drawn_one(self):
        drawn = generate_style(999999)
        forced = generate_style(999999, personality_type=drawn["semantic"]["personality"])
        self.assertEqual(drawn["style"], forced["style"])


if __name__ == "__main__":
    unittest.main()


class RangeAndSafetyTest(unittest.TestCase):
    def test_generated_styles_are_in_range(self):
        from style_engine.validator import check_ranges_and_safety
        for seed in range(1, 30):
            self.assertEqual(check_ranges_and_safety(generate_style(seed)["style"]), [], seed)

    def test_out_of_range_and_unsafe_values_are_rejected(self):
        from style_engine.validator import check_ranges_and_safety
        style = generate_style(5)["style"]
        style["tokens"]["radii"]["md"] = "900px"
        style["tokens"]["motion"]["durationNormal"] = "9s"
        style["tokens"]["colors"]["accent"] = "url(https://evil.example/x.png)"
        style["metadata"]["description"] = "<script>alert(1)</script>"
        problems = check_ranges_and_safety(style)
        self.assertTrue(any("tokens.radii.md out of range" in p for p in problems))
        self.assertTrue(any("tokens.motion.durationNormal out of range" in p for p in problems))
        self.assertIn("tokens.colors.accent contains unsafe content", problems)
        self.assertIn("metadata.description contains unsafe content", problems)
