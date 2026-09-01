// Minimal test runner (no deps). Invoked via `node scripts/build-index.test.mjs`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtempSync, writeFileSync, readFileSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildIndex, requiredColors } from "./build-index.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

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
    // A theme that declares its accent: the index must carry it, because the
    // app's chrome accent and settings cards follow panel.activeBorder.
    const gammaColors = { ...validTheme().colors, "panel.activeBorder": "#d97757" };
    writeTheme(root, "gamma", validTheme({ name: "Gamma", colors: gammaColors }));

    const result = buildIndex(root);
    assert.equal(result.themes.length, 3);
    assert.ok(result.generated, "should have a generated timestamp");
    const alpha = result.themes.find((t) => t.slug === "alpha");
    assert.equal(alpha.name, "Alpha");
    assert.equal(alpha.type, "dark");
    assert.equal(alpha.author, "testuser");
    assert.equal(alpha.version, "1.0.0");
    assert.equal(alpha.swatches.background, "#000000");
    assert.equal(alpha.swatches.foreground, "#ffffff");
    // alpha declares no panel.activeBorder, so it must fall back to that
    // key's contract default — the same value the Rust resolver gives an
    // installed theme — NOT to its ANSI blue #0000ff.
    assert.equal(alpha.swatches.accent, "#0066ff");
    assert.equal(alpha.swatches.cursor, "#ff00ff");
    assert.equal(
      alpha.download_url,
      "https://raw.githubusercontent.com/lucatescari/kimbo-themes/main/themes/alpha.json"
    );
    const gamma = result.themes.find((t) => t.slug === "gamma");
    // A declared accent wins; alpha above proves the contract-default fallback.
    assert.equal(gamma.swatches.accent, "#d97757");
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

// The required-colour list used to be hardcoded in build-index.mjs. It is now
// read from theme-contract.json, so the app, this validator and the creator
// site cannot disagree about what a theme must contain.
test("required colours come from the contract, not a hardcoded list", () => {
  const contract = JSON.parse(
    readFileSync(join(repoRoot, "theme-contract.json"), "utf8"),
  );
  const expected = contract.keys.filter((k) => k.required).map((k) => k.key).sort();

  assert.deepEqual([...requiredColors()].sort(), expected);
  assert.ok(expected.length > 0, "contract should mark some keys required");

  // The historical four. Widening this set would reject already-merged themes.
  assert.deepEqual(expected, [
    "terminal.ansiBlue",
    "terminal.background",
    "terminal.cursor",
    "terminal.foreground",
  ]);
});

// Tests 1-7 run synchronously above; the contract test is registered with
// node:test and runs after this module finishes evaluating. Logging the
// summary inline therefore printed "All tests passed." before that test had
// run, so a failing run read as seven ticks, a success line, and then a TAP
// "not ok" - CI exited non-zero correctly, but a developer watching the
// output was told the opposite of the truth. Defer to exit, when the code is
// known.
process.on("exit", (code) => {
  if (code === 0) console.log("\nAll tests passed.");
});
