#!/usr/bin/env node
/**
 * Salmon HVAC - Sitemap Generator
 * Scans the repo for all index.html files and generates sitemap.xml.
 * Run: node scripts/generate-sitemap.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const BASE_URL = "https://salmonhvac.com";
const TODAY = new Date().toISOString().split("T")[0];

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
      if (["node_modules", ".git", "assets", "scripts"].includes(entry.name)) continue;
      findIndexFiles(fullPath, results);
    } else if (entry.name === "index.html") {
      results.push(fullPath);
    }
  }
  return results;
}

const files = [path.join(ROOT, "index.html"), ...findIndexFiles(ROOT)];
const unique = [...new Set(files)].filter((f) => fs.existsSync(f));

const urls = unique.map((file) => {
  const rel = path.relative(ROOT, file);
  const urlPath = rel === "index.html" ? "/" : "/" + rel.replace(/index\.html$/, "");
  const { priority, changefreq } = getMeta(urlPath);
  return `  <url>
    <loc>${BASE_URL}${urlPath}</loc>
    <lastmod>${TODAY}</lastmod>
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
