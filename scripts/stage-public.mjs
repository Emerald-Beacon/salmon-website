#!/usr/bin/env node
/**
 * Salmon HVAC - Public Site Stager
 * Copies only deployable website assets into dist/ so Netlify does not publish
 * repo internals, build scripts, legacy folders, dependencies, or import temp files.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DIST = path.join(ROOT, "dist");

const PUBLIC_DIRS = [
  "areas",
  "blog",
  "contact",
  "financing",
  "get-quote",
  "our-team",
  "privacy-policy",
  "services",
  "terms-of-service",
  "thank-you",
];

const PUBLIC_ASSET_DIRS = ["assets/css", "assets/images", "assets/js"];

const PUBLIC_FILES = [
  "_redirects",
  "index.html",
  "llms.txt",
  "robots.txt",
  "sitemap.xml",
];

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

for (const dir of [...PUBLIC_DIRS, ...PUBLIC_ASSET_DIRS]) {
  const source = path.join(ROOT, dir);
  if (fs.existsSync(source)) {
    const destination = path.join(DIST, dir);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.cpSync(source, destination, { recursive: true });
  }
}

for (const file of PUBLIC_FILES) {
  const source = path.join(ROOT, file);
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, path.join(DIST, file));
  }
}

console.log(`Public site staged in ${path.relative(ROOT, DIST)}/`);
