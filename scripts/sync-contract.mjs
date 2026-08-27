// Copies theme-contract.json from a local kimbo-terminal checkout.
//
// The contract is authored in kimbo-terminal, where the tests that keep it
// honest live. This repo holds a copy so CI can validate without a cross-repo
// fetch. Run this after the app's contract changes, then commit the result.
//
// Fails loudly on a missing checkout rather than leaving a stale copy in
// place: silently validating against an outdated contract is the exact
// failure this whole mechanism exists to prevent.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source =
  process.env.KIMBO_TERMINAL_PATH ??
  resolve(repoRoot, "..", "kimbo-terminal");
const src = join(source, "theme-contract.json");

if (!existsSync(src)) {
  console.error(`Contract not found at ${src}`);
  console.error("Set KIMBO_TERMINAL_PATH to your kimbo-terminal checkout.");
  process.exit(1);
}

const raw = readFileSync(src, "utf8");
JSON.parse(raw); // fail here rather than shipping malformed JSON
writeFileSync(join(repoRoot, "theme-contract.json"), raw);
console.log(`Synced theme-contract.json from ${src}`);
