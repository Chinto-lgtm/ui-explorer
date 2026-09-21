"""
Command line interface.

    python -m style_engine generate --seed 847291 [--mode Coherent] [--personality Calm] [--json]
    python -m style_engine generate --seed myseed --count 20
    python -m style_engine validate styles/community/my-style
    python -m style_engine registry [styles/community/index.json]
    python -m style_engine inspect --seed 847291
    python -m style_engine export --seed 847291 [--out my-style.json]
"""

import argparse
import json
import os
import sys

from .data import PERSONALITY_TYPES
from .generator import MODES, generate_batch, generate_style
from .validator import validate_registry, validate_style_file


def _print_summary(result):
    style = result["style"]
    s = result["semantic"]
    m = style["metadata"]
    c = style["tokens"]["colors"]
    a = result["accessibility"]
    print(f"{m['name']}  ({m['category']})  seed {result['seedNumber']}  DNA {result['dnaHash']}")
    print(f"  {s['personality']} / {s['visualFamily']} · {s['harmony']} harmony · {result['mode']} mode")
    print(f"  surface {s['surface']} · depth {s['depth']} · border {s['border']} · corners {s['geometry']} · motion {s['motion']} · icons {s['icons']}")
    print(f"  type {s['typography']['headingFamily'].split(',')[0]} / {s['typography']['family'].split(',')[0]} · svg {s['svg']['shapeLanguage']}/{s['svg']['gradientType']}")
    print(f"  bg {c['bg']} · surface {c['surface']} · accent {c['accent']} · text {c['textPrimary']}  ({a['wcagRating']}, {a['textPrimaryRatio']}:1)")
    if result["repairedAxes"]:
        print(f"  repaired: {', '.join(result['repairedAxes'])}")


def cmd_generate(args):
    if args.count > 1:
        results = generate_batch(args.seed, args.count, args.mode, args.personality)
    else:
        results = [generate_style(args.seed, args.mode, args.personality)]
    if args.json:
        payload = [r["style"] for r in results]
        print(json.dumps(payload[0] if len(payload) == 1 else payload, indent=2, ensure_ascii=False))
        return 0
    for r in results:
        _print_summary(r)
        print()
    return 0


def cmd_inspect(args):
    r = generate_style(args.seed, args.mode, args.personality)
    _print_summary(r)
    print("\nDecisions")
    for t in r["trace"]:
        mark = "locked" if t["locked"] else ""
        cands = sorted(t["candidates"], key=lambda c: -c["finalWeight"])[:4]
        alt = ", ".join(f"{c['value']} ({c['finalWeight']:.1f})" for c in cands if c["value"] != t["chosen"])
        print(f"  {t['axis']:<12} {t['chosen']:<28} {mark}{('alternatives: ' + alt) if alt else ''}")
    print("\nCoherence")
    for rel in r["coherence"]["relations"]:
        print(f"  {rel['label']:<24} {rel['relation']:+d}")
    print(f"  score {r['coherence']['score']}")
    print("\nDNA " + "  ".join(f"{k} {v}" for k, v in r["dna"].items()))
    return 0


def cmd_export(args):
    r = generate_style(args.seed, args.mode, args.personality)
    out = args.out or f"{r['style']['metadata']['id']}.json"
    with open(out, "w", encoding="utf-8") as f:
        json.dump(r["style"], f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"wrote {out} ({r['style']['metadata']['name']})")
    return 0


def cmd_validate(args):
    path = args.path
    if os.path.isdir(path):
        path = os.path.join(path, "style.json")
    errors = validate_style_file(path)
    if errors:
        print(f"FAIL {path}")
        for err in errors:
            print(f"  - {err}")
        return 1
    print(f"ok   {path}")
    return 0


def cmd_registry(args):
    report = validate_registry(args.index)
    for path, errors in report.items():
        print(f"{'FAIL' if errors else 'ok  '} {path}")
        for err in errors:
            print(f"       - {err}")
    return 1 if any(report.values()) else 0


def _add_generation_args(p):
    p.add_argument("--seed", default="847291", help="Seed number or text")
    p.add_argument("--mode", choices=MODES, default="Coherent")
    p.add_argument("--personality", choices=PERSONALITY_TYPES, default=None)


def main(argv=None):
    # Windows consoles default to a legacy code page; the summaries use "·".
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            try:
                stream.reconfigure(encoding="utf-8")
            except (ValueError, OSError):
                pass
    parser = argparse.ArgumentParser(prog="style_engine", description="UI Explorer style engine (Python)")
    sub = parser.add_subparsers(dest="command")

    g = sub.add_parser("generate", help="Generate one style or a batch")
    _add_generation_args(g)
    g.add_argument("--count", type=int, default=1)
    g.add_argument("--json", action="store_true", help="Print the StyleDefinition JSON instead of a summary")
    g.set_defaults(fn=cmd_generate)

    i = sub.add_parser("inspect", help="Show every decision, the coherence report and the DNA")
    _add_generation_args(i)
    i.set_defaults(fn=cmd_inspect)

    e = sub.add_parser("export", help="Write the generated StyleDefinition to a JSON file")
    _add_generation_args(e)
    e.add_argument("--out", default=None)
    e.set_defaults(fn=cmd_export)

    v = sub.add_parser("validate", help="Validate a style.json or a package directory")
    v.add_argument("path")
    v.set_defaults(fn=cmd_validate)

    r = sub.add_parser("registry", help="Validate every package listed in a community index.json")
    r.add_argument("index", nargs="?", default="styles/community/index.json")
    r.set_defaults(fn=cmd_registry)

    args = parser.parse_args(argv)
    if not args.command:
        parser.print_help()
        return 0
    seed = getattr(args, "seed", None)
    if seed is not None and seed.lstrip("-").isdigit():
        args.seed = int(seed)
    return args.fn(args)


if __name__ == "__main__":
    sys.exit(main())
