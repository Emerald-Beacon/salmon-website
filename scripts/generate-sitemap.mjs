#!/usr/bin/env node
/**
 * Salmon HVAC - Sitemap Generator
 * Scans public-facing index.html files and generates sitemap.xml.
 * Run: node scripts/generate-sitemap.mjs
 */

import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, "..");
const BASE_URL = "https://salmonhvac.com";
const SKIP_DIRS = new Set([
  ".claude",
  ".git",
  ".netlify",
  "assets",
  "css",
  "dist",
  "extracted",
  "images",
  "js",
  "node_modules",
  "pages",
  "scripts",
  "tmp",
]);
const NOINDEX_PATHS = new Set(["/thank-you/"]);

// Priority and changefreq rules based on URL depth/type
function getMeta(urlPath) {
  if (urlPath === "/") return { priority: "1.0", changefreq: "weekly" };
  if (urlPath.startsWith("/services/")) return { priority: "0.9", changefreq: "monthly" };
  if (urlPath.startsWith("/areas/")) return { priority: "0.8", changefreq: "monthly" };
  if (urlPath.startsWith("/blog/")) return { priority: "0.7", changefreq: "monthly" };
  return { priority: "0.6", changefreq: "monthly" };
}

function findIndexFiles(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      findIndexFiles(fullPath, results);
    } else if (entry.name === "index.html") {
      results.push(fullPath);
    }
  }
  return results;
}

function getLastmod(file) {
  const rel = path.relative(ROOT, file);

  try {
    const status = execFileSync("git", ["status", "--porcelain", "--", rel], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();

    if (!status) {
      const gitDate = execFileSync("git", ["log", "-1", "--format=%cs", "--", rel], {
        cwd: ROOT,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();

      if (/^\d{4}-\d{2}-\d{2}$/.test(gitDate)) {
        return gitDate;
      }
    }
  } catch {
    // Fall back to filesystem time outside a Git checkout.
  }

  return fs.statSync(file).mtime.toISOString().split("T")[0];
}

const files = [path.join(ROOT, "index.html"), ...findIndexFiles(ROOT)];
const unique = [...new Set(files)].filter((f) => fs.existsSync(f));

const urls = unique
  .map((file) => {
    const rel = path.relative(ROOT, file);
    const urlPath = rel === "index.html" ? "/" : "/" + rel.replace(/index\.html$/, "");
    return { file, urlPath };
  })
  .filter(({ urlPath }) => !NOINDEX_PATHS.has(urlPath))
  .sort((a, b) => a.urlPath.localeCompare(b.urlPath))
  .map(({ file, urlPath }) => {
    const { priority, changefreq } = getMeta(urlPath);
    return `  <url>
    <loc>${BASE_URL}${urlPath}</loc>
    <lastmod>${getLastmod(file)}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  });

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sitemap, "utf8");
console.log(`Sitemap written with ${urls.length} URLs.`);
