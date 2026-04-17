// Generates index.json at the repo root by scanning themes/*.json.
// Validates every theme has name, type (dark|light), author, version, and the
// four color keys used for the swatch preview.
//
// Usage:
//   node scripts/build-index.mjs [repoRoot]        -> writes index.json to <repoRoot>
//   import { buildIndex } from "./build-index.mjs" -> returns the index object

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REQUIRED_COLORS = [
  "terminal.background",
  "terminal.foreground",
  "terminal.ansiBlue",
  "terminal.cursor",
];

const RAW_URL_BASE =
  "https://raw.githubusercontent.com/lucatescari/kimbo-themes/main/themes";

// GitHub username rules: alphanumeric + single hyphens, cannot start/end
// with a hyphen, max 39 chars. Enforced here so malicious themes can't slip
// in a string that expands into a surprising URL via string interpolation
// at the card's author link (e.g. "foo/../bar" or "//other.com").
const GITHUB_USERNAME_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

function validateTheme(slug, theme) {
  if (typeof theme.name !== "string" || theme.name.length === 0) {
    throw new Error(`${slug}: missing or empty string field 'name'`);
  }
  if (theme.type !== "dark" && theme.type !== "light") {
    throw new Error(`${slug}: field 'type' must be "dark" or "light" (got ${JSON.stringify(theme.type)})`);
  }
  if (typeof theme.author !== "string" || theme.author.length === 0) {
    throw new Error(`${slug}: missing or empty string field 'author' (GitHub username)`);
  }
  if (!GITHUB_USERNAME_RE.test(theme.author)) {
    throw new Error(
      `${slug}: field 'author' must be a valid GitHub username ` +
        `(alphanumeric + hyphens, no leading/trailing hyphen, max 39 chars; got ${JSON.stringify(theme.author)})`,
    );
  }
  if (typeof theme.version !== "string" || theme.version.length === 0) {
    throw new Error(`${slug}: missing or empty string field 'version'`);
  }
  if (!theme.colors || typeof theme.colors !== "object") {
    throw new Error(`${slug}: missing 'colors' object`);
  }
  for (const key of REQUIRED_COLORS) {
    if (typeof theme.colors[key] !== "string") {
      throw new Error(`${slug}: missing required color key '${key}'`);
    }
  }
}

export function buildIndex(repoRoot) {
  const themesDir = join(repoRoot, "themes");
  const files = readdirSync(themesDir).filter((f) => f.endsWith(".json")).sort();
  const themes = [];
  for (const file of files) {
    const slug = file.replace(/\.json$/, "");
    const raw = readFileSync(join(themesDir, file), "utf8");
    let theme;
    try {
      theme = JSON.parse(raw);
    } catch (e) {
      throw new Error(`${slug}: invalid JSON (${e.message})`);
    }
    validateTheme(slug, theme);
    themes.push({
      slug,
      name: theme.name,
      type: theme.type,
      author: theme.author,
      version: theme.version,
      swatches: {
        background: theme.colors["terminal.background"],
        foreground: theme.colors["terminal.foreground"],
        accent: theme.colors["terminal.ansiBlue"],
        cursor: theme.colors["terminal.cursor"],
      },
      download_url: `${RAW_URL_BASE}/${slug}.json`,
    });
  }
  return {
    generated: new Date().toISOString(),
    themes,
  };
}

// Run as a CLI when invoked directly.
const __filename = fileURLToPath(import.meta.url);
const invokedAsCli = process.argv[1] && resolve(process.argv[1]) === __filename;
if (invokedAsCli) {
  const repoRoot = process.argv[2] ? resolve(process.argv[2]) : resolve(dirname(__filename), "..");
  const index = buildIndex(repoRoot);
  writeFileSync(join(repoRoot, "index.json"), JSON.stringify(index, null, 2) + "\n");
  console.log(`Wrote index.json (${index.themes.length} themes)`);
}
