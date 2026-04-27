#!/usr/bin/env node
/**
 * Salmon HVAC - Static Build Script
 * Keeps shared partial regions in sync across every index.html in the repo.
 * Supports both:
 *   <!-- PARTIAL:name -->
 * and region markers:
 *   <!-- PARTIAL:name:start -->
 *   ...existing content...
 *   <!-- PARTIAL:name:end -->
 *
 * Run: node scripts/build.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, "..");
const PARTIALS_DIR = path.join(ROOT, "assets/partials");

// Load partials once
const partials = {};
for (const file of fs.readdirSync(PARTIALS_DIR)) {
  const name = path.basename(file, ".html");
  partials[name] = fs.readFileSync(path.join(PARTIALS_DIR, file), "utf8");
}

/**
 * Find all index.html files recursively, excluding private/generated folders.
 */
const SKIP_DIRS = new Set(["node_modules", ".git", ".netlify", "assets", "dist", "extracted", "tmp"]);

function findHtmlFiles(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      findHtmlFiles(fullPath, results);
    } else if (entry.name === "index.html") {
      results.push(fullPath);
    }
  }
  return results;
}

// Also include root index.html
const htmlFiles = [path.join(ROOT, "index.html"), ...findHtmlFiles(ROOT)];
const unique = [...new Set(htmlFiles)];

let count = 0;
for (const file of unique) {
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, "utf8");
  let changed = false;

  // Replace legacy one-line placeholders with inlined partial content
  for (const [name, content] of Object.entries(partials)) {
    const placeholder = `<!-- PARTIAL:${name} -->`;
    if (html.includes(placeholder)) {
      html = html.replaceAll(placeholder, content.trim());
      changed = true;
    }
  }

  // Replace marker-delimited regions while preserving the markers in source
  for (const [name, content] of Object.entries(partials)) {
    const regionPattern = new RegExp(
      `<!-- PARTIAL:${name}:start -->[\\s\\S]*?<!-- PARTIAL:${name}:end -->`,
      "g"
    );
    const replacement = `<!-- PARTIAL:${name}:start -->\n${content.trim()}\n<!-- PARTIAL:${name}:end -->`;
    if (regionPattern.test(html)) {
      html = html.replace(regionPattern, replacement);
      changed = true;
    }
  }

  // Inject head-scripts partial before </head> if not already present
  if (partials["head-scripts"] && html.includes("</head>")) {
    const marker = partials["head-scripts"].trim().split("\n")[0];
    if (!html.includes(marker)) {
      html = html.replace("</head>", `${partials["head-scripts"].trim()}\n</head>`);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, html, "utf8");
    console.log(`Built: ${path.relative(ROOT, file)}`);
    count++;
  }
}

console.log(`\nDone. ${count} file(s) updated.`);
