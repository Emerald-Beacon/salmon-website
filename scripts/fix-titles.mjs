#!/usr/bin/env node
/**
 * One-time script: shorten overlong <title> tags.
 *
 * Area pages:  "HVAC … in [City], UT | [County/Desc] | Salmon HVAC"
 *           →  "HVAC … in [City], UT | Salmon HVAC"
 *
 * Service/other pages with a known overlong pattern:
 *   handled by explicit replacements below.
 *
 * Run once, commit the result; no need to add to the build pipeline.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

// Explicit service/other-page title rewrites (old → new)
const EXPLICIT = {
  "HVAC Services Northern Utah | Same-Day Repair &amp; Free Estimates | Salmon HVAC":
    "HVAC Services in Northern Utah | Salmon HVAC",
  "About Salmon HVAC | Northern Utah&#x27;s Trusted HVAC Contractor Since 1979":
    "About Salmon HVAC | Trusted HVAC Contractor Since 1979",
  "Furnace Repair in Northern Utah | Salmon HVAC | Fast Response":
    "Furnace Repair in Northern Utah | Salmon HVAC",
  "Water Heater Repair &amp; Installation in Northern Utah | Salmon HVAC":
    "Water Heater Repair &amp; Installation in Utah | Salmon HVAC",
  "Heat Pump Installation &amp; Repair Utah | Daikin Dealer | Salmon HVAC":
    "Heat Pump Installation &amp; Repair Utah | Salmon HVAC",
  "24/7 Emergency HVAC Repair Utah | Salmon HVAC | (801) 397-0030":
    "24/7 Emergency HVAC Repair Utah | Salmon HVAC",
  "Indoor Air Quality Utah | Inversion Season Specialists | Salmon HVAC":
    "Indoor Air Quality Services Utah | Salmon HVAC",
  "Furnace Installation &amp; Replacement in Northern Utah | Salmon HVAC":
    "Furnace Installation &amp; Replacement in Utah | Salmon HVAC",
  "HVAC Repair in Northern Utah | Same-Day Service | Salmon HVAC":
    "HVAC Repair in Northern Utah | Salmon HVAC",
  "HVAC Repair in Northern Utah | Salmon HVAC | Fast Response":
    "HVAC Repair in Northern Utah | Salmon HVAC",
};

// Also fix og:title / twitter:title for the same values
function fixExplicit(html) {
  let changed = false;
  for (const [oldT, newT] of Object.entries(EXPLICIT)) {
    if (html.includes(oldT)) {
      html = html.replaceAll(oldT, newT);
      changed = true;
    }
  }
  return { html, changed };
}

// Area page title pattern:  "… | [Middle Segment] | Salmon HVAC"
// Strip the middle segment wherever the title has two pipe-separated parts before "Salmon HVAC"
function fixAreaTitle(html) {
  // Match <title> … | something | Salmon HVAC </title>
  // Also matches og:title and twitter:title content="…"
  const re = /(<title>)(.*?) \| [^|<]+ \| Salmon HVAC(<\/title>)/g;
  const ogRe = /(content=")(.*?) \| [^|"]+(?<!Salmon HVAC) \| Salmon HVAC(")/g;

  let changed = false;

  const newHtml = html
    .replace(re, (_, open, pre, close) => {
      changed = true;
      return `${open}${pre} | Salmon HVAC${close}`;
    })
    .replace(ogRe, (_, open, pre, close) => {
      changed = true;
      return `${open}${pre} | Salmon HVAC${close}`;
    });

  return { html: newHtml, changed };
}

function processFile(filePath, isArea) {
  if (!fs.existsSync(filePath)) return false;
  let html = fs.readFileSync(filePath, "utf8");
  let changed = false;

  if (isArea) {
    const r = fixAreaTitle(html);
    html = r.html;
    changed = r.changed;
  }

  const r2 = fixExplicit(html);
  html = r2.html;
  changed = changed || r2.changed;

  if (changed) {
    fs.writeFileSync(filePath, html, "utf8");
    return true;
  }
  return false;
}

let count = 0;

// Area pages
const areasDir = path.join(ROOT, "areas");
for (const entry of fs.readdirSync(areasDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const f = path.join(areasDir, entry.name, "index.html");
  if (processFile(f, true)) { console.log(`Fixed: areas/${entry.name}/index.html`); count++; }
}

// Service pages + other pages with explicit fixes
const otherFiles = [
  "services/index.html",
  "services/hvac-repair/index.html",
  "services/furnace-repair/index.html",
  "services/furnace-installation/index.html",
  "services/heat-pump-services/index.html",
  "services/emergency-hvac/index.html",
  "services/indoor-air-quality/index.html",
  "services/water-heaters/index.html",
  "our-team/index.html",
].map(f => path.join(ROOT, f));

for (const f of otherFiles) {
  if (processFile(f, false)) { console.log(`Fixed: ${path.relative(ROOT, f)}`); count++; }
}

console.log(`\nDone. ${count} file(s) updated.`);
