import { readFileSync, writeFileSync, readdirSync, rmSync, mkdirSync, copyFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = fileURLToPath(new URL("..", import.meta.url));
const src = join(root, "src");
const dist = join(root, "dist");
const all = ["firefox", "chrome"];

const { version } = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
// Chrome only accepts 1-4 dot-separated integers.
if (!/^\d+(\.\d+){0,3}$/.test(version)) throw new Error(`Invalid version for Chrome: ${version}`);

const targets = process.argv[2] ? [process.argv[2]] : all;
if (!targets.every((t) => all.includes(t))) throw new Error(`Target must be one of: ${all.join(", ")}`);

for (const target of targets) {
  const { manifest_version, name, ...rest } = JSON.parse(readFileSync(join(root, "manifests", `${target}.json`), "utf8"));
  const out = join(dist, target);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  for (const file of readdirSync(src)) {
    if (!file.startsWith(".")) copyFileSync(join(src, file), join(out, file));
  }
  writeFileSync(join(out, "manifest.json"), JSON.stringify({ manifest_version, name, version, ...rest }, null, 2) + "\n");
  const zip = join(dist, `maplescore-${target}-${version}.zip`);
  rmSync(zip, { force: true });
  execFileSync("zip", ["-r", "-X", "-q", zip, ".", "-x", "*.DS_Store"], { cwd: out });
  console.log(zip);
}
