// Verifies every translation file has exactly the same keys as the reference (en.json).
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = join(import.meta.dirname, "..", "src", "messages");
const reference = "en.json";

const flatten = (obj, prefix = "") =>
  Object.entries(obj).flatMap(([key, value]) =>
    value && typeof value === "object" ? flatten(value, `${prefix}${key}.`) : [`${prefix}${key}`],
  );

const load = (file) => new Set(flatten(JSON.parse(readFileSync(join(dir, file), "utf8"))));
const expected = load(reference);
let failed = false;

for (const file of readdirSync(dir).filter((f) => f.endsWith(".json") && f !== reference)) {
  const actual = load(file);
  const missing = [...expected].filter((k) => !actual.has(k));
  const extra = [...actual].filter((k) => !expected.has(k));
  if (missing.length || extra.length) {
    failed = true;
    console.error(`${file}:`);
    if (missing.length) console.error(`  missing: ${missing.join(", ")}`);
    if (extra.length) console.error(`  extra:   ${extra.join(", ")}`);
  }
}

if (failed) process.exit(1);
console.log("Translation files are in sync.");
