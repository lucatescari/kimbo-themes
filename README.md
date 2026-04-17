# Kimbo Themes

Community color themes for [Kimbo Terminal](https://github.com/lucatescari/kimbo-terminal).

Kimbo ships with two built-in themes (`Kimbo Dark` and `Kimbo Light`). Everything in this repo is an additional community theme you can install from the app.

## Installing Themes

Open Kimbo Terminal, go to **Settings** (Cmd+,) > **Appearance**. Every theme appears under `Yours` (ready to use) or `Available` (click to install). Themes are saved to `~/.config/kimbo/themes/`.

## Creating a Theme

Themes are JSON files with five required top-level fields: `name`, `type`, `author`, `version`, `colors`. The `colors` map uses VS Code's color theme schema.

### Schema

```json
{
  "name": "Your Theme Name",
  "type": "dark",
  "author": "your-github-username",
  "version": "1.0.0",
  "colors": {
    "terminal.background": "#1a1a1a",
    "terminal.foreground": "#d4d4d4",
    "terminal.cursor": "#e0e0e0",
    "terminal.selectionBackground": "#404040",

    "terminal.ansiBlack": "#3b3b3b",
    "terminal.ansiRed": "#f44747",
    "terminal.ansiGreen": "#6a9955",
    "terminal.ansiYellow": "#d7ba7d",
    "terminal.ansiBlue": "#569cd6",
    "terminal.ansiMagenta": "#c586c0",
    "terminal.ansiCyan": "#4ec9b0",
    "terminal.ansiWhite": "#d4d4d4",

    "terminal.ansiBrightBlack": "#808080",
    "terminal.ansiBrightRed": "#f44747",
    "terminal.ansiBrightGreen": "#6a9955",
    "terminal.ansiBrightYellow": "#d7ba7d",
    "terminal.ansiBrightBlue": "#569cd6",
    "terminal.ansiBrightMagenta": "#c586c0",
    "terminal.ansiBrightCyan": "#4ec9b0",
    "terminal.ansiBrightWhite": "#e0e0e0",

    "tab.activeBackground": "#1a1a1a",
    "tab.inactiveBackground": "#141414",
    "tab.activeForeground": "#d4d4d4",
    "tab.inactiveForeground": "#6e6e6e",

    "titleBar.background": "#141414",
    "panel.border": "#2e2e2e",
    "panel.activeBorder": "#569cd6"
  }
}
```

### Required fields

| Field | Notes |
|-------|-------|
| `name` | Display name, any string. |
| `type` | `"dark"` or `"light"`. Controls how the card previews. |
| `author` | Your GitHub username (no `@`, no URL). Rendered as `@username` linked to your GitHub profile. |
| `version` | Free-form; semver recommended. Displayed next to author on the card. |
| `colors` | Color map. Four keys are **required for the swatch preview**: `terminal.background`, `terminal.foreground`, `terminal.ansiBlue`, `terminal.cursor`. Omitting any of these fails validation. |

### How to contribute

1. Fork this repo.
2. Add `themes/<your-theme-slug>.json` (lowercase, hyphens — becomes the theme slug used by the app).
3. Open a pull request. CI validates every theme and fails if anything is missing or malformed.
4. On merge to `main`, `index.json` is regenerated automatically by the workflow — do not hand-edit it.

### Test locally

```bash
cp themes/your-theme.json ~/.config/kimbo/themes/
```

Open Settings > Appearance and select it.
