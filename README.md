# Kimbo Themes

Community color themes for [Kimbo Terminal](https://github.com/lucatescari/kimbo-terminal).

## Installing Themes

Open Kimbo Terminal, go to **Settings** (Cmd+,) > **Appearance**, and browse the **Community Themes** section. Click **Install** on any theme to add it.

Themes are saved to `~/.config/kimbo/themes/`.

## Creating a Theme

Themes use JSON format based on VS Code's color theme schema.

### 1. Create a JSON file

Create a file named `your-theme-name.json`:

```json
{
  "name": "Your Theme Name",
  "type": "dark",
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

### 2. Color reference

| Key | What it colors |
|-----|---------------|
| `terminal.background` | Terminal background |
| `terminal.foreground` | Default text color |
| `terminal.cursor` | Cursor color |
| `terminal.selectionBackground` | Text selection highlight |
| `terminal.ansiBlack` through `terminal.ansiWhite` | Standard 8 ANSI colors |
| `terminal.ansiBrightBlack` through `terminal.ansiBrightWhite` | Bright 8 ANSI colors |
| `tab.activeBackground` | Active tab background |
| `tab.inactiveBackground` | Inactive tab background |
| `tab.activeForeground` | Active tab text |
| `tab.inactiveForeground` | Inactive tab text |
| `titleBar.background` | Title/tab bar area background |
| `panel.border` | Border between panes |
| `panel.activeBorder` | Active pane border highlight |

### 3. Set the `type` field

- `"dark"` for dark themes (light text on dark background)
- `"light"` for light themes (dark text on light background)

### 4. Test locally

Copy your theme to the Kimbo themes directory:

```bash
cp your-theme.json ~/.config/kimbo/themes/
```

Open Settings > Appearance and select it.

### 5. Submit to this repo

1. Fork this repository
2. Add your `.json` file to the `themes/` directory
3. Open a pull request

The filename should be lowercase with hyphens (e.g., `my-cool-theme.json`). This becomes the theme's slug identifier.

## Available Themes

| Theme | Type | Preview |
|-------|------|---------|
| Kimbo Dark | dark | Classic dark theme |
| Catppuccin Mocha | dark | Warm dark pastels |
| Catppuccin Latte | light | Warm light pastels |
| Modern Darker | dark | Ultra-dark minimal |
