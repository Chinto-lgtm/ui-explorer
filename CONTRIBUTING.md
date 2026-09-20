# Contributing to UI Explorer

We welcome community style contributions! UI Explorer is an open-source laboratory for visual design systems.

---

## Contribution Process

1. **Design a Style**: Use the **Style Customizer** or **Procedural Style Generator** in the browser to build your style definition.
2. **Export Contribution Package**: Click **Export Contribution Package** in the UI to download your `style.json`, `metadata.json`, and `README.md`.
3. **Fork & Branch**: Fork this repository and create a new feature branch (e.g. `feature/my-style-name`).
4. **Place Files**: Add your package folder under `styles/community/<your-style-id>/`.
5. **Validate Locally**: Run validation tests:
   ```bash
   python tools/style-engine/cli.py validate styles/community/<your-style-id>/style.json
   npm test
   ```
6. **Submit Pull Request**: Open a PR to `main`. Our automated GitHub Actions workflow will validate schema, colors, and accessibility ratings.

---

## Style Quality Guidelines

- **Semantic Tokens**: Ensure all color, typography, radii, shadow, border, and motion tokens follow the official schema (`schemas/style.schema.json`).
- **Unique URL-safe ID**: Style IDs must be lowercase, alphanumeric with hyphens (e.g. `aurora-glass-dark`).
- **Accessibility**: Aim for WCAG AA contrast ratio (>4.5:1) for body text over backgrounds where practical.
- **Open Source License**: Specify an open-source license (MIT recommended) in `metadata.json`.
