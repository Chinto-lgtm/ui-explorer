# Creating a Custom Style for UI Explorer

This guide walks through creating, validating, and submitting a new design style step-by-step.

---

## Step-by-Step Guide

### 1. Duplicate or Generate a Base Style
In UI Explorer:
- Navigate to **Style Generator** or **Style Customizer**.
- Synthesize a new design seed or start from an existing official style.

### 2. Define Metadata
Provide clear descriptive metadata:
```json
{
  "id": "neon-cyberpunk",
  "name": "Neon Cyberpunk 2077",
  "author": "your_github_handle",
  "category": "Expressive",
  "description": "High-contrast dystopian dark UI with glowing cyan and magenta accents."
}
```

### 3. Customize Design Tokens
Adjust color palettes, font families, corner radii, elevation shadows, and motion curves.

### 4. Export & Validate
- Click **Export Contribution Package** to download your style files.
- Run local validation:
  ```bash
  python tools/style-engine/cli.py validate path/to/your-style.json
  ```

### 5. Submit via GitHub PR
Push your files to your fork and submit a PR to `ui-explorer/styles/community/`.
