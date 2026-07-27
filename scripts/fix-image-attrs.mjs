#!/usr/bin/env node
/**
 * Salmon HVAC – image attribute hygiene
 *
 * Two fixes, both aimed at Core Web Vitals:
 *
 *   1. width/height — an <img> without intrinsic dimensions makes the browser
 *      reflow once the image arrives, which is a layout shift (CLS). Real
 *      dimensions are read off the file, so declared aspect ratio is always
 *      truthful.
 *
 *   2. loading="lazy" — only applied where the image is definitely below the
 *      fold: anything inside <footer>, plus the third body image onward.
 *      The header logo and the first two body images are left eager on
 *      purpose; the hero is usually the LCP element and lazy-loading it
 *      delays the largest paint instead of helping it.
 *
 * Usage:
 *   node scripts/fix-image-attrs.mjs          # dry run
 *   node scripts/fix-image-attrs.mjs --apply
 *
 * Requires sharp:  npm install --no-save sharp
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SKIP_DIRS = new Set([".git", "node_modules", "dist", "venv", "extracted", "tmp"]);
const DRY = !process.argv.includes("--apply");

const htmlFiles = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) walk(path.join(d, e.name));
    } else if (e.name.endsWith(".html")) htmlFiles.push(path.join(d, e.name));
  }
})(ROOT);

const dimCache = new Map();
async function dims(src) {
  if (dimCache.has(src)) return dimCache.get(src);
  let r = null;
  const clean = src.split("?")[0].split("#")[0];
  if (clean.startsWith("/")) {
    const fsPath = path.join(ROOT, clean.slice(1));
    if (fs.existsSync(fsPath)) {
      try {
        const m = await sharp(fsPath).metadata();
        if (m.width && m.height) r = { w: m.width, h: m.height };
      } catch {}
    }
  }
  dimCache.set(src, r);
  return r;
}

const IMG_RE = /<img\b[^>]*>/gi;
let addedDims = 0;
let addedLazy = 0;
let filesTouched = 0;

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");

  // Index every img up front so we know its section and body position.
  const tags = [];
  for (const m of html.matchAll(IMG_RE)) tags.push({ tag: m[0], index: m.index });

  let bodyPos = 0;
  for (const t of tags) {
    const before = html.slice(0, t.index);
    t.inFooter = before.lastIndexOf("<footer") > before.lastIndexOf("</footer>");
    t.isTracker = /facebook\.com\/tr/.test(t.tag) || /width="1"/.test(t.tag);
    t.bodyPos = t.inFooter || t.isTracker ? -1 : bodyPos++;
  }

  let out = html;
  let touched = false;

  for (const t of tags) {
    if (t.isTracker) continue;
    let tag = t.tag;
    const orig = tag;
    const srcMatch = tag.match(/\bsrc\s*=\s*"([^"]*)"/i);
    if (!srcMatch) continue;
    const src = srcMatch[1];
    // Skip JS-built srcs like '" + post.image + "'
    if (src.includes("+") || !src.startsWith("/")) continue;

    // 1. width/height
    const hasW = /\bwidth\s*=/i.test(tag);
    const hasH = /\bheight\s*=/i.test(tag);
    if (!hasW || !hasH) {
      const d = await dims(src);
      if (d) {
        let t2 = tag.replace(/\s*\/?>$/, "");
        if (!hasW) t2 += ` width="${d.w}"`;
        if (!hasH) t2 += ` height="${d.h}"`;
        tag = t2 + ">";
        addedDims++;
      }
    }

    // 2. loading="lazy" — footer, or 3rd body image onward
    if (!/\bloading\s*=/i.test(tag) && (t.inFooter || t.bodyPos >= 2)) {
      tag = tag.replace(/\s*\/?>$/, "") + ` loading="lazy">`;
      addedLazy++;
    }

    if (tag !== orig) {
      out = out.replace(orig, tag);
      touched = true;
    }
  }

  if (touched) {
    filesTouched++;
    if (!DRY) fs.writeFileSync(file, out);
  }
}

console.log(`${DRY ? "DRY RUN" : "APPLIED"} — files touched: ${filesTouched}`);
console.log(`  width/height added: ${addedDims}`);
console.log(`  loading="lazy" added: ${addedLazy}`);
if (DRY) console.log("\nNothing written. Re-run with --apply.");
