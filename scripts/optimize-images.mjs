#!/usr/bin/env node
/**
 * Salmon HVAC – Image weight optimiser
 *
 * Re-encodes oversized images in assets/images in place, keeping the same
 * filename and format so no HTML has to change. Hero/LCP images on this site
 * were shipping at 400-480KB, which dominates mobile load time.
 *
 * Rules:
 *   - only touches files over THRESHOLD
 *   - caps width at MAX_W (nothing on the site renders wider)
 *   - keeps the original whenever the re-encode saves less than 5%, so
 *     already-optimised files are never degraded for no gain
 *
 * Usage:
 *   node scripts/optimize-images.mjs          # dry run, prints projected savings
 *   node scripts/optimize-images.mjs --apply  # rewrite files in place
 *
 * Requires sharp:  npm install --no-save sharp
 * (deliberately not a package.json dependency – this is a one-off maintenance
 * tool and should not slow down the Netlify build)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DIR = path.join(ROOT, "assets/images");

const THRESHOLD = 200 * 1024;
const MAX_W = 1920;
const WEBP_Q = 80;
const JPEG_Q = 82;

const DRY = !process.argv.includes("--apply");

const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(webp|jpe?g|png)$/i.test(e.name) && fs.statSync(p).size > THRESHOLD) files.push(p);
  }
})(DIR);

let before = 0;
let after = 0;
let changed = 0;
let skipped = 0;
const rows = [];

for (const f of files) {
  const orig = fs.statSync(f).size;
  const ext = path.extname(f).toLowerCase();

  let meta;
  try {
    meta = await sharp(f).metadata();
  } catch {
    console.log("skip (unreadable):", path.relative(ROOT, f));
    continue;
  }

  const pipeline = sharp(f).rotate();
  if (meta.width > MAX_W) pipeline.resize({ width: MAX_W, withoutEnlargement: true });

  let out;
  if (ext === ".webp") out = await pipeline.webp({ quality: WEBP_Q, effort: 6 }).toBuffer();
  else if (ext === ".png") out = await pipeline.png({ compressionLevel: 9 }).toBuffer();
  else out = await pipeline.jpeg({ quality: JPEG_Q, mozjpeg: true }).toBuffer();

  before += orig;

  if (out.length < orig * 0.95) {
    after += out.length;
    changed++;
    rows.push([orig, out.length, meta.width, meta.height, path.relative(ROOT, f)]);
    if (!DRY) fs.writeFileSync(f, out);
  } else {
    after += orig;
    skipped++;
  }
}

rows.sort((a, b) => b[0] - b[1] - (a[0] - a[1]));

console.log(`${DRY ? "DRY RUN" : "APPLIED"} — candidates: ${files.length}, rewritten: ${changed}, left alone: ${skipped}`);
console.log(`total: ${(before / 1048576).toFixed(1)}MB -> ${(after / 1048576).toFixed(1)}MB (saves ${((1 - after / before) * 100).toFixed(0)}%)\n`);
console.log("biggest wins:");
for (const [o, n, w, h, rel] of rows.slice(0, 15)) {
  console.log(`  ${(o / 1024).toFixed(0).padStart(5)}KB -> ${(n / 1024).toFixed(0).padStart(4)}KB  ${w}x${h}  ${rel}`);
}
if (DRY) console.log("\nNothing written. Re-run with --apply to rewrite these files.");
