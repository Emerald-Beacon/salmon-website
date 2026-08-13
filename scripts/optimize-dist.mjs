#!/usr/bin/env node
/**
 * Salmon HVAC - dist/ Optimizer
 *
 * Runs last in the Netlify build, after stage-public.mjs has staged the
 * deployable files. Source stays modular and readable; only the published
 * copy is bundled and minified.
 *
 * What it does:
 *   1. Concatenates the render-blocking stylesheets into one hashed file, so
 *      the critical path carries a single CSS request instead of three.
 *   2. Minifies the remaining CSS/JS, and collapses HTML conservatively.
 *
 * Only the stylesheets in BUNDLE are combined. fontawesome-subset.css is
 * deliberately excluded: it loads async via media="print" onload, and folding
 * it into the blocking bundle would undo that.
 *
 * Pages are grouped by the exact set of stylesheets they link, so a page with
 * its own styling (commercial-portfolio) is not handed rules it never used.
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import * as esbuild from "esbuild";
import { minify as minifyHtml } from "html-minifier-terser";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "..", "dist");

// Order matters: @font-face first, then base styles, then overrides.
const BUNDLE = ["fonts.css", "style.css", "usability.css"];

if (!fs.existsSync(DIST)) {
  console.error("dist/ not found — run scripts/stage-public.mjs first.");
  process.exit(1);
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const allFiles = walk(DIST);
const htmlFiles = allFiles.filter((f) => f.endsWith(".html"));

/* ---------- 1. Minify the bundle inputs once ---------- */

const minifiedCss = new Map();
for (const name of BUNDLE) {
  const file = path.join(DIST, "assets/css", name);
  if (!fs.existsSync(file)) continue;
  const source = fs.readFileSync(file, "utf8");
  const { code } = await esbuild.transform(source, {
    loader: "css",
    minify: true,
    legalComments: "none",
  });
  minifiedCss.set(name, code.trim());
}

/* ---------- 2. Work out which stylesheets each page links ---------- */

// Matches a plain blocking <link> to one of our bundle stylesheets. The
// media="print" Font Awesome link cannot match: it is not in BUNDLE.
const linkFor = (name) =>
  new RegExp(
    `[ \\t]*<link rel="stylesheet" href="/assets/css/${name.replace(".", "\\.")}(?:\\?[^"]*)?"\\s*>\\n?`,
    "g"
  );

const groups = new Map(); // "fonts.css|style.css" -> { names, pages }

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const names = BUNDLE.filter((n) => linkFor(n).test(html));
  if (names.length < 2) continue; // nothing to gain from bundling one file
  const key = names.join("|");
  if (!groups.has(key)) groups.set(key, { names, pages: [] });
  groups.get(key).pages.push(file);
}

/* ---------- 3. Emit one hashed bundle per distinct group ---------- */

const bundlesWritten = [];
const stillReferenced = new Set();

for (const { names, pages } of groups.values()) {
  const content = names.map((n) => minifiedCss.get(n) ?? "").join("\n");
  const hash = crypto.createHash("sha256").update(content).digest("hex").slice(0, 8);
  const bundleName = `site.css`;
  const href = `/assets/css/${bundleName}?v=${hash}`;

  fs.writeFileSync(path.join(DIST, "assets/css", bundleName), content, "utf8");
  bundlesWritten.push({ bundleName, hash, names, pages: pages.length, bytes: content.length });

  for (const file of pages) {
    let html = fs.readFileSync(file, "utf8");
    let inserted = false;

    for (const name of names) {
      html = html.replace(linkFor(name), (match) => {
        if (inserted) return ""; // drop the rest
        inserted = true;
        const indent = /^[ \t]*/.exec(match)[0];
        return `${indent}<link rel="stylesheet" href="${href}">\n`;
      });
    }
    fs.writeFileSync(file, html, "utf8");
  }
}

// Any bundled stylesheet still linked by an unbundled page must be kept.
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  for (const name of BUNDLE) {
    if (html.includes(`/assets/css/${name}`)) stillReferenced.add(name);
  }
}

for (const name of BUNDLE) {
  if (stillReferenced.has(name)) continue;
  const file = path.join(DIST, "assets/css", name);
  if (fs.existsSync(file)) fs.rmSync(file);
}

/* ---------- 4. Minify whatever is left ---------- */

const HTML_OPTIONS = {
  collapseWhitespace: true,
  conservativeCollapse: true, // collapse runs of whitespace, never remove them
  removeComments: true,
  minifyCSS: true,
  minifyJS: false, // keep GTM + JSON-LD byte-identical
  removeRedundantAttributes: false,
  keepClosingSlash: true,
};

const stats = { css: [0, 0], js: [0, 0], html: [0, 0] };
let failures = 0;

for (const file of walk(DIST)) {
  const ext = path.extname(file).toLowerCase();
  const kind = ext === ".css" ? "css" : ext === ".js" ? "js" : ext === ".html" ? "html" : null;
  if (!kind) continue;
  if (kind === "css" && path.basename(file) === "site.css") continue; // already minified

  const source = fs.readFileSync(file, "utf8");
  let output;
  try {
    if (kind === "html") {
      output = await minifyHtml(source, HTML_OPTIONS);
    } else {
      const { code } = await esbuild.transform(source, {
        loader: kind,
        minify: true,
        legalComments: "none",
        target: kind === "js" ? "es2018" : undefined,
      });
      output = code;
    }
  } catch (err) {
    console.error(`FAILED ${path.relative(DIST, file)}: ${err.message}`);
    failures++;
    continue;
  }

  if (output.length >= source.length) continue;
  fs.writeFileSync(file, output, "utf8");
  stats[kind][0] += source.length;
  stats[kind][1] += output.length;
}

/* ---------- 5. Report ---------- */

for (const b of bundlesWritten) {
  console.log(
    `bundled ${b.names.join(" + ")} -> ${b.bundleName}?v=${b.hash} ` +
      `(${(b.bytes / 1024).toFixed(1)} KB, ${b.pages} pages)`
  );
}

const kb = (n) => (n / 1024).toFixed(1) + " KB";
for (const [kind, [before, after]] of Object.entries(stats)) {
  if (!before) continue;
  console.log(`${kind.padEnd(5)} ${kb(before)} -> ${kb(after)}  (-${(((before - after) / before) * 100).toFixed(1)}%)`);
}

if (failures) {
  console.error(`\n${failures} file(s) failed to minify — failing the build.`);
  process.exit(1);
}
