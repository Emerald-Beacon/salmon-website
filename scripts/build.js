#!/usr/bin/env node
/**
 * Salmon HVAC - Static Build Script
 * Reads partials and inlines them into every index.html in the repo.
 * Run: node scripts/build.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PARTIALS_DIR = path.join(ROOT, "assets/partials");

// Load partials once
const partials = {};
for (const file of fs.readdirSync(PARTIALS_DIR)) {
  const name = path.basename(file, ".html");
  partials[name] = fs.readFileSync(path.join(PARTIALS_DIR, file), "utf8");
}

/**
 * Find all index.html files recursively, excluding node_modules and assets/partials.
 */
function findHtmlFiles(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".git", "assets"].includes(entry.name)) continue;
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

  // Replace placeholder comments with inlined partial content
  for (const [name, content] of Object.entries(partials)) {
    const placeholder = `<!-- PARTIAL:${name} -->`;
    if (html.includes(placeholder)) {
      html = html.replaceAll(placeholder, content.trim());
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
