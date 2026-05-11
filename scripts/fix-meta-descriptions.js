#!/usr/bin/env node
// Fixes meta descriptions that exceed 160 decoded characters.
// - Pages in manualDescriptions get a hand-crafted replacement.
// - All others are trimmed to the last word boundary at ≤155 chars.

const fs   = require('fs');
const path = require('path');

// Hand-crafted replacements for the worst offenders (decoded length >200).
const manualDescriptions = {
  'blog/what-should-you-look-for-in-hvac-maintenance-plans-offered-by-salt-lake-city-hvac-companies/index.html':
    "A good HVAC maintenance plan covers tune-ups, inspections, priority service, and repair discounts. Here's what Utah homeowners should look for before signing up.",
  'blog/why-is-duct-cleaning-essential-for-your-utah-hvac-systems-efficiency/index.html':
    "Utah's dry climate fills ducts with dust fast. Learn how professional duct cleaning improves airflow, air quality, and HVAC efficiency for Utah homeowners.",
  'blog/why-regular-hvac-maintenance-matters-more-in-utahs-dry-climate/index.html':
    "Utah's dry climate is hard on HVAC systems. Regular maintenance prevents costly breakdowns, improves air quality, and keeps your system running efficiently.",
  'blog/what-are-the-benefits-of-energy-efficient-hvac-system-installation-in-utah/index.html':
    "Energy-efficient HVAC systems reduce energy bills, improve air quality, and increase home value. Utah homeowners may also qualify for rebates and tax credits.",
  'blog/air-conditioner-not-cooling-top-causes-and-fixes-for-utah-homes/index.html':
    "AC not cooling your Utah home? From low refrigerant to frozen coils and clogged filters, Salmon HVAC explains the most common causes and how to fix them.",
  'blog/how-to-choose-the-best-air-conditioning-service/index.html':
    "Choosing an AC service? Look for certifications, honest pricing, and solid reviews. Here's what matters when hiring an HVAC contractor in Northern Utah.",
  'blog/what-you-should-know-before-installing-central-air-in-utahs-unique-climate/index.html':
    "Thinking about central AC in Utah? Learn about system types, energy efficiency, and installation considerations before you buy. Expert advice from Salmon HVAC.",
  'blog/spring-into-comfort-why-now-is-the-time-for-air-conditioning-service-in-utah/index.html':
    "Spring is the best time to service your AC before Utah's heat arrives. Avoid summer breakdowns and save money with a professional tune-up from Salmon HVAC.",
  'blog/when-should-you-call-for-emergency-hvac-repair-services-in-utah/index.html':
    "Unusual noises, no heating or cooling, or a major leak? Learn when to call for emergency HVAC repair in Utah and how maintenance helps prevent these situations.",
  'blog/how-can-you-tell-if-your-air-conditioner-needs-immediate-repair/index.html':
    "Strange noises, uneven cooling, or rising energy bills? Learn the warning signs your AC needs immediate repair and when to call Salmon HVAC in Northern Utah.",
  'blog/top-hvac-services-in-salt-lake-keeping-your-home-comfortable-year-round/index.html':
    "Staying comfortable in Salt Lake's extreme climate takes a reliable HVAC system. Salmon HVAC covers repairs, installs, and maintenance for Utah homeowners.",
  'blog/indoor-air-quality-in-utah-what-every-homeowner-needs-to-know/index.html':
    "Utah's dry climate, wildfire smoke, and winter inversions affect indoor air quality. Learn how your HVAC system shapes the air you breathe and what to do.",
  'blog/what-indoor-air-quality-solutions-are-available-from-utah-hvac-experts/index.html':
    "From HEPA filters and UV purifiers to whole-home humidifiers and ventilation upgrades, Salmon HVAC offers air quality solutions for Utah homeowners.",
  'blog/utah-heat-pump-rebates-tax-credits-the-complete-2026-guide-for-homeowners/index.html':
    "Stack Rocky Mountain Power and Enbridge Gas rebates to save thousands on a Utah heat pump in 2026 — even without the federal 25C tax credit.",
  'blog/hvac-for-room-additions-adu-utah/index.html':
    "Adding a room in northern Utah? Your existing HVAC system may not handle it. Here's when to extend ductwork vs. install a dedicated ductless mini-split.",
  'blog/r410a-r454b-refrigerant-change-utah-homeowners-guide/index.html':
    "New AC equipment can no longer use R-410A after January 2025. Here's what this means for Utah homeowners — repairs, replacement costs, and your 2026 options.",
};

function decodeEntities(s) {
  return s
    .replace(/&amp;/g,  '&')
    .replace(/&#x27;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g,   '<')
    .replace(/&gt;/g,   '>');
}

function encodeEntities(s) {
  return s.replace(/&/g, '&amp;');
}

function trimToWordBoundary(s, max = 155) {
  if (s.length <= max) return s;
  const cut = s.lastIndexOf(' ', max);
  return cut > 0 ? s.slice(0, cut) : s.slice(0, max);
}

function replaceMetaContent(html, tag, newEncoded) {
  // Handles both attribute orderings: name/property before or after content
  return html.replace(
    new RegExp(`(<meta[^>]*(?:name|property)="${tag}"[^>]*content=")[^"]*(")`),
    `$1${newEncoded}$2`
  ).replace(
    new RegExp(`(<meta[^>]*content=")[^"]*("[^>]*(?:name|property)="${tag}")`),
    `$1${newEncoded}$2`
  );
}

function processFile(filepath) {
  let html = fs.readFileSync(filepath, 'utf8');
  const m = html.match(/name="description" content="([^"]*)"/);
  if (!m) return false;

  const decoded = decodeEntities(m[1]);
  if (decoded.length <= 160) return false;

  const relPath = filepath.replace(/^\.\//, '');
  const newDecoded = manualDescriptions[relPath] || trimToWordBoundary(decoded);

  if (newDecoded === decoded) return false;

  const newEncoded = encodeEntities(newDecoded);
  html = replaceMetaContent(html, 'description',    newEncoded);
  html = replaceMetaContent(html, 'og:description', newEncoded);
  html = replaceMetaContent(html, 'twitter:description', newEncoded);

  fs.writeFileSync(filepath, html, 'utf8');
  return true;
}

function walk(dir, results = []) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      if (['node_modules', 'dist', '.git'].includes(entry)) continue;
      walk(full, results);
    } else if (entry === 'index.html') {
      results.push(full);
    }
  }
  return results;
}

const root = path.resolve(__dirname, '..');
process.chdir(root);

let updated = 0;
for (const file of walk('.')) {
  if (processFile(file)) {
    console.log('fixed:', file);
    updated++;
  }
}
console.log(`\nDone. ${updated} files updated.`);
