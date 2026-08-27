// Regenerates the colour-key table in README.md from theme-contract.json.
//
// The key list used to be maintained by hand here, in the validator and in the
// app, and nothing kept the three in agreement. Run this after syncing the
// contract; CI checks the result is committed.

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const contract = JSON.parse(
  readFileSync(join(repoRoot, "theme-contract.json"), "utf8"),
);

const lines = [];
for (const group of contract.groups) {
  const keys = contract.keys.filter((k) => k.group === group.id);
  if (keys.length === 0) continue;
  lines.push(`#### ${group.label}`, "");
  lines.push("| Key | Default | Required |", "|---|---|---|");
  for (const k of keys) {
    lines.push(`| \`${k.key}\` | \`${k.default}\` | ${k.required ? "yes" : "no"} |`);
  }
  lines.push("");
}

const body = lines.join("\n");
const readmePath = join(repoRoot, "README.md");
const readme = readFileSync(readmePath, "utf8");

const begin = "<!-- BEGIN GENERATED KEYS -->";
const end = "<!-- END GENERATED KEYS -->";
const s = readme.indexOf(begin);
const e = readme.indexOf(end);
if (s === -1 || e === -1) {
  console.error(`README.md is missing the ${begin} / ${end} markers.`);
  process.exit(1);
}

// The README's Schema section hand-lists every colour key too, as example
// JSON, because it's illustrative and reads better hand-formatted (blank-line
// grouping) than a generator would produce. Nothing else enforces that this
// second, hand-written copy agrees with the contract, so this generated block
// staying in sync would not stop the Schema example drifting silently on its
// own. Assert the key set outside the generated block still matches the
// contract exactly, in both directions, and fail loudly naming the offenders.
const outside = readme.slice(0, s) + readme.slice(e + end.length);
const KEY_RE = /"((?:terminal|tab|titleBar|panel)\.[A-Za-z]+)"/g;
const foundKeys = new Set();
for (const match of outside.matchAll(KEY_RE)) {
  foundKeys.add(match[1]);
}

const contractKeys = new Set(contract.keys.map((k) => k.key));
const extraInReadme = [...foundKeys].filter((k) => !contractKeys.has(k));
const missingFromReadme = [...contractKeys].filter((k) => !foundKeys.has(k));

if (extraInReadme.length > 0 || missingFromReadme.length > 0) {
  console.error(
    "README.md's hand-written colour keys (outside the generated block, e.g. the Schema example) have drifted from theme-contract.json:",
  );
  if (extraInReadme.length > 0) {
    console.error(`  in README but not in the contract: ${extraInReadme.join(", ")}`);
  }
  if (missingFromReadme.length > 0) {
    console.error(`  in the contract but missing from README: ${missingFromReadme.join(", ")}`);
  }
  process.exit(1);
}

const next = readme.slice(0, s + begin.length) + "\n\n" + body + readme.slice(e);
if (next === readme) {
  console.log("README key table already up to date.");
} else {
  writeFileSync(readmePath, next);
  console.log("README key table regenerated.");
}
