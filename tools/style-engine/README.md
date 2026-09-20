# UI Explorer — Python Style Engine Tools

Python developer tools for offline style generation, batch testing, seed determinism verification, and CI schema validation.

## Commands

### Generate Style
```bash
python tools/style-engine/cli.py generate --seed 847291
```

### Batch Generation
```bash
python tools/style-engine/cli.py generate --seed myseed --count 5
```

### Validate Style File
```bash
python tools/style-engine/cli.py validate path/to/style.json
```
