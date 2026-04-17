// Minimal test runner (no deps). Invoked via `node scripts/build-index.test.mjs`.
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildIndex } from "./build-index.mjs";

function setup() {
  const root = mkdtempSync(join(tmpdir(), "kimbo-themes-test-"));
  mkdirSync(join(root, "themes"));
  return root;
}

function writeTheme(root, slug, theme) {
  writeFileSync(join(root, "themes", `${slug}.json`), JSON.stringify(theme, null, 2));
}

// Valid theme fixture
const validTheme = (overrides = {}) => ({
  name: "Test Theme",
  type: "dark",
  author: "testuser",
  version: "1.0.0",
  colors: {
    "terminal.background": "#000000",
    "terminal.foreground": "#ffffff",
    "terminal.ansiBlue": "#0000ff",
    "terminal.cursor": "#ff00ff",
  },
  ...overrides,
});

// Test 1: valid themes produce a valid index.json structure.
{
  const root = setup();
  try {
    writeTheme(root, "alpha", validTheme({ name: "Alpha" }));
    writeTheme(root, "beta", validTheme({ name: "Beta", type: "light" }));

    const result = buildIndex(root);
    assert.equal(result.themes.length, 2);
    assert.ok(result.generated, "should have a generated timestamp");
    const alpha = result.themes.find((t) => t.slug === "alpha");
    assert.equal(alpha.name, "Alpha");
    assert.equal(alpha.type, "dark");
    assert.equal(alpha.author, "testuser");
    assert.equal(alpha.version, "1.0.0");
    assert.equal(alpha.swatches.background, "#000000");
    assert.equal(alpha.swatches.foreground, "#ffffff");
    assert.equal(alpha.swatches.accent, "#0000ff");
    assert.equal(alpha.swatches.cursor, "#ff00ff");
    assert.equal(
      alpha.download_url,
      "https://raw.githubusercontent.com/lucatescari/kimbo-themes/main/themes/alpha.json"
    );
    console.log("✓ test 1: valid themes produce a valid index");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

// Test 2: missing required field throws with a clear message.
{
  const root = setup();
  try {
    writeTheme(root, "broken", validTheme({ author: undefined }));
    assert.throws(() => buildIndex(root), /author/);
    console.log("✓ test 2: missing author throws");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

// Test 3: invalid `type` value throws.
{
  const root = setup();
  try {
    writeTheme(root, "wrong-type", validTheme({ type: "purple" }));
    assert.throws(() => buildIndex(root), /type/);
    console.log("✓ test 3: invalid type throws");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

// Test 4: missing required color key throws.
{
  const root = setup();
  try {
    const theme = validTheme();
    delete theme.colors["terminal.ansiBlue"];
    writeTheme(root, "no-blue", theme);
    assert.throws(() => buildIndex(root), /terminal\.ansiBlue/);
    console.log("✓ test 4: missing required color throws");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

// Test 5: themes are sorted alphabetically by slug.
{
  const root = setup();
  try {
    writeTheme(root, "zebra", validTheme({ name: "Zebra" }));
    writeTheme(root, "apple", validTheme({ name: "Apple" }));
    writeTheme(root, "mango", validTheme({ name: "Mango" }));
    const result = buildIndex(root);
    assert.deepEqual(result.themes.map((t) => t.slug), ["apple", "mango", "zebra"]);
    console.log("✓ test 5: themes sorted by slug");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

// Test 6: an author string that isn't a valid GitHub username is rejected.
{
  const root = setup();
  try {
    writeTheme(root, "sus", validTheme({ author: "foo/../bar" }));
    assert.throws(() => buildIndex(root), /valid GitHub username/);
    console.log("✓ test 6: invalid GitHub username is rejected");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

// Test 7: edge-case usernames (hyphens, max length) are accepted.
{
  const root = setup();
  try {
    writeTheme(root, "hyphen", validTheme({ author: "some-user-39" }));
    writeTheme(root, "maxlen", validTheme({ author: "a".repeat(39) }));
    const result = buildIndex(root);
    assert.equal(result.themes.length, 2);
    console.log("✓ test 7: hyphenated + max-length usernames accepted");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

console.log("\nAll tests passed.");
