"""
TypeScript ↔ Python consistency.

tests/fixtures/ts-reference.json is written by `npm run engine:data` from the
browser engine. Every case must reproduce exactly here — the browser engine is
the source of truth; if this fails after an engine change, re-export the
fixtures and port the change.
"""

import json
import os
import sys
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

from style_engine import GENERATOR_VERSION, generate_style  # noqa: E402
from style_engine.validator import validate_style_json  # noqa: E402

FIXTURE = os.path.join(ROOT, "tests", "fixtures", "ts-reference.json")


def _diff(a, b, path=""):
    if isinstance(a, dict) and isinstance(b, dict):
        out = []
        for key in sorted(set(a) | set(b)):
            out += _diff(a.get(key, "<missing>"), b.get(key, "<missing>"), f"{path}.{key}")
        return out
    return [] if a == b else [f"{path}: py={a!r} ts={b!r}"]


class ParityTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with open(FIXTURE, "r", encoding="utf-8") as f:
            cls.reference = json.load(f)

    def test_generator_version_matches(self):
        self.assertEqual(self.reference["generatorVersion"], GENERATOR_VERSION)

    def test_every_reference_case_reproduces(self):
        for case in self.reference["cases"]:
            with self.subTest(seed=case["seed"], mode=case["mode"]):
                result = generate_style(case["seed"], case["mode"])
                self.assertEqual(result["seedNumber"], case["seedNumber"])
                self.assertEqual(result["dnaHash"], case["dnaHash"])
                self.assertEqual(result["semantic"], case["semantic"])
                self.assertEqual(result["repairedAxes"], case["repairedAxes"])
                self.assertEqual(result["coherence"]["score"], case["coherenceScore"])
                self.assertEqual(result["accessibility"], case["accessibility"])
                diffs = _diff(result["style"], case["style"])
                self.assertEqual(diffs, [], "\n".join(diffs))

    def test_generated_styles_pass_the_validator(self):
        for case in self.reference["cases"]:
            self.assertEqual(validate_style_json(generate_style(case["seed"], case["mode"])["style"]), [])


if __name__ == "__main__":
    unittest.main()
