#!/usr/bin/env node
/**
 * Phase 0 discovery: scan every index.html and report SEO/health columns.
 * Read-only. Writes page-inventory.md.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SKIP = new Set(["node_modules", ".git", "dist", "extracted", "tmp", "pages", "assets"]);

function findIndex(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (SKIP.has(e.name)) continue;
      findIndex(path.join(dir, e.name), out);
    } else if (e.name === "index.html") {
      out.push(path.join(dir, e.name));
    }
  }
  return out;
}

const files = [path.join(ROOT, "index.html"), ...findIndex(ROOT)];
const unique = [...new Set(files)].sort();

const rows = [];
for (const f of unique) {
  const html = fs.readFileSync(f, "utf8");
  const rel = "/" + path.relative(ROOT, f).replace(/index\.html$/, "");
  const head = html.split(/<\/head>/i)[0] || "";
  const hasMarkers = /<!-- PARTIAL:/.test(html);
  const hasCanonical = /<link[^>]+rel=["']canonical["']/i.test(head);
  const hasMetaDesc = /<meta[^>]+name=["']description["']/i.test(head);
  const hasOG = /<meta[^>]+property=["']og:/i.test(head);
  const hasTwitter = /<meta[^>]+name=["']twitter:/i.test(head);
  const hasGTMHead = /googletagmanager\.com\/gtm\.js/i.test(html);
  const hasGTMBody = /googletagmanager\.com\/ns\.html/i.test(html);
  const navWater = /href=["']\/services\/water-heaters\//i.test(html);
  const navFinancing = /href=["']\/financing\//i.test(html);
  const navWestJordan = /href=["']\/areas\/west-jordan-ut\//i.test(html);
  const years46 = /46\s*[- ]?\s*[Yy]ears/.test(html) || /\b46 years\b/i.test(html);
  const years47 = /47\s*[- ]?\s*[Yy]ears/.test(html) || /\b47 years\b/i.test(html);
  const descMatch = head.match(/<meta[^>]+name=["']description["'][^>]+content="([^"]*)"/i);
  const desc = descMatch ? descMatch[1] : "";
  const titleMatch = head.match(/<title>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "";

  rows.push({
    rel, hasMarkers, hasCanonical, hasMetaDesc, hasOG, hasTwitter,
    hasGTMHead, hasGTMBody, navWater, navFinancing, navWestJordan,
    years46, years47, descLen: desc.length, desc, title,
  });
}

const yes = (b) => (b ? "✅" : "❌");
let md = "# Page Inventory (Phase 0 discovery)\n\n";
md += `Total pages scanned: ${rows.length}\n\n`;
md += "| Path | Markers | Canon | Desc | OG | TW | GTMhead | GTMbody | Water | Financing | WJordan | 46y | 47y | DescLen |\n";
md += "|---|---|---|---|---|---|---|---|---|---|---|---|---|---|\n";
for (const r of rows) {
  md += `| ${r.rel} | ${yes(r.hasMarkers)} | ${yes(r.hasCanonical)} | ${yes(r.hasMetaDesc)} | ${yes(r.hasOG)} | ${yes(r.hasTwitter)} | ${yes(r.hasGTMHead)} | ${yes(r.hasGTMBody)} | ${yes(r.navWater)} | ${yes(r.navFinancing)} | ${yes(r.navWestJordan)} | ${r.years46 ? "⚠️" : ""} | ${r.years47 ? "✅" : ""} | ${r.descLen} |\n`;
}

// Summaries
const sum = (pred) => rows.filter(pred).length;
md += "\n## Summary counts\n\n";
md += `- Pages without canonical: ${sum((r) => !r.hasCanonical)}\n`;
md += `- Pages without meta description: ${sum((r) => !r.hasMetaDesc)}\n`;
md += `- Pages without OG tags: ${sum((r) => !r.hasOG)}\n`;
md += `- Pages without Twitter tags: ${sum((r) => !r.hasTwitter)}\n`;
md += `- Pages without GTM head: ${sum((r) => !r.hasGTMHead)}\n`;
md += `- Pages without GTM body noscript: ${sum((r) => !r.hasGTMBody)}\n`;
md += `- Pages without PARTIAL markers: ${sum((r) => !r.hasMarkers)}\n`;
md += `- Pages whose nav lacks Water Heaters link: ${sum((r) => !r.navWater)}\n`;
md += `- Pages whose nav lacks Financing link: ${sum((r) => !r.navFinancing)}\n`;
md += `- Pages lacking West Jordan area link: ${sum((r) => !r.navWestJordan)}\n`;
md += `- Pages with "46 years" claim: ${sum((r) => r.years46)}\n`;
md += `- Pages with desc length outside 140-160: ${sum((r) => r.hasMetaDesc && (r.descLen < 140 || r.descLen > 160))}\n`;

// Duplicate descriptions
const byDesc = {};
for (const r of rows) if (r.desc) (byDesc[r.desc] ||= []).push(r.rel);
const dups = Object.entries(byDesc).filter(([, v]) => v.length > 1);
md += `\n## Duplicate meta descriptions: ${dups.length} group(s)\n\n`;
for (const [d, v] of dups) md += `- (${v.length}×) "${d.slice(0, 60)}..." → ${v.join(", ")}\n`;

fs.writeFileSync(path.join(ROOT, "page-inventory.md"), md);
console.log(md.split("\n## Summary")[1] ? "## Summary" + md.split("\n## Summary")[1] : md);
