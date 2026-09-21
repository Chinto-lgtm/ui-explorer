"""
UI Explorer — Style Engine Python CLI Tool
"""

import sys
import argparse
import json
from generator import generate_style
from validator import validate_style_file, validate_registry

def main():
    parser = argparse.ArgumentParser(description="UI Explorer Style Engine Developer Tool")
    subparsers = parser.add_subparsers(dest="command")

    gen_parser = subparsers.add_parser("generate", help="Generate style from seed")
    gen_parser.add_argument("--seed", default=847291, help="Seed number or text")
    gen_parser.add_argument("--count", type=int, default=1, help="Number of styles to generate")

    val_parser = subparsers.add_parser("validate", help="Validate style file")
    val_parser.add_argument("file", help="Path to JSON file")

    reg_parser = subparsers.add_parser("registry", help="Validate every package in a community index.json")
    reg_parser.add_argument("index", nargs="?", default="styles/community/index.json", help="Path to index.json")

    args = parser.parse_args()

    if args.command == "generate":
        for i in range(args.count):
            seed = f"{args.seed}_{i}" if args.count > 1 else args.seed
            style = generate_style(seed)
            print(json.dumps(style, indent=2))

    elif args.command == "validate":
        errors = validate_style_file(args.file)
        if errors:
            print("Validation Failed:")
            for err in errors:
                print(f" - {err}")
            sys.exit(1)
        else:
            print(f"Success: '{args.file}' is valid.")

    elif args.command == "registry":
        report = validate_registry(args.index)
        for path, errors in report.items():
            print(f"{'FAIL' if errors else 'ok  '} {path}")
            for err in errors:
                print(f"       - {err}")
        if any(report.values()):
            sys.exit(1)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
