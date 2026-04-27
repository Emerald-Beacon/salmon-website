#!/usr/bin/env node
/**
 * Salmon HVAC – Related Posts & Service Blog Sections
 *
 * Injects static HTML into:
 *   - Every blog post: a "Related Articles" section (3 posts, same category)
 *   - Every service page: a "From Our Blog" section (3 posts, matching topics)
 *
 * Categorisation is derived from URL slugs so no extra metadata is needed.
 * Idempotent: re-running replaces the <!-- RELATED_POSTS:start/end --> block.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const POSTS_JSON = path.join(ROOT, "blog/posts.json");

// ─── Category helpers ───────────────────────────────────────────────────────

const CATEGORY_RULES = [
  ["heat-pump", /heat.pump/],
  ["furnace",   /furnace|winter.heat|heating.bill|frozen.pipe|dry.in.winter|best.furnace|furnace.install/],
  ["ac",        /\bac\b|ac-unit|ac-repair|ac-instal|ac-main|ac-tune|air.condition|central.air|cooling|summer.ac|mini.split|spring.ac|stay.cool/],
  ["iaq",       /indoor.air|air.quality|ventilat|duct.clean|air.filter|inversion|purifier|filter.replace/],
  ["commercial",/commercial|vrf|business/],
  ["maintenance",/maintenance|tune.up|preventiv|seasonal|checklist|extend.the.life|hvac.inspect|prevent.sudden|small.problem|unseen.price|hvac.myth|real.benefit|repair.or.replace|should.you.replace|when.should.you.replace/],
];

function categorize(url) {
  const s = url.toLowerCase();
  for (const [cat, re] of CATEGORY_RULES) {
    if (re.test(s)) return cat;
  }
  return "general";
}

// ─── Related-post selection ──────────────────────────────────────────────────

function getRelated(posts, currentUrl, count = 3) {
  const cat = categorize(currentUrl);
  const others = posts.filter(p => p.url !== currentUrl);

  const sameCat  = others.filter(p => categorize(p.url) === cat);
  const diffCat  = others.filter(p => categorize(p.url) !== cat);

  const picks = [...sameCat.slice(0, count)];
  if (picks.length < count) picks.push(...diffCat.slice(0, count - picks.length));
  return picks.slice(0, count);
}

// ─── Service page → preferred categories ────────────────────────────────────

const SERVICE_CATEGORIES = {
  "ac-repair":         ["ac", "maintenance"],
  "ac-installation":   ["ac", "maintenance"],
  "ac-maintenance":    ["ac", "maintenance"],
  "furnace-repair":    ["furnace", "maintenance"],
  "furnace-installation": ["furnace", "maintenance"],
  "heat-pump-services":["heat-pump", "maintenance"],
  "ductless-mini-split":["ac", "heat-pump"],
  "vrf-systems":       ["commercial", "maintenance"],
  "commercial-hvac":   ["commercial", "maintenance"],
  "indoor-air-quality":["iaq", "maintenance"],
  "emergency-hvac":    ["maintenance", "general"],
  "water-heaters":     ["furnace", "maintenance"],
  "hvac-repair":       ["maintenance", "general"],
};

function getServicePosts(posts, serviceSlug, count = 3) {
  const cats = SERVICE_CATEGORIES[serviceSlug] || ["general", "maintenance"];
  const ranked = posts.slice().sort((a, b) => {
    const ai = cats.indexOf(categorize(a.url));
    const bi = cats.indexOf(categorize(b.url));
    const av = ai === -1 ? 99 : ai;
    const bv = bi === -1 ? 99 : bi;
    return av - bv;
  });
  return ranked.slice(0, count);
}

// ─── HTML generators ─────────────────────────────────────────────────────────

function relatedPostsHtml(posts) {
  const cards = posts.map(p => {
    const imgSrc = p.image.replace(/\.webp$/, ".webp");
    const imgFallback = p.image.replace(/\.webp$/, ".jpg");
    return `      <a class="related-post-card" href="${p.url}">
        <picture>
          <source srcset="${imgSrc}" type="image/webp">
          <img src="${imgFallback}" alt="${p.imageAlt}" loading="lazy" width="400" height="225">
        </picture>
        <div class="related-post-info">
          <h3>${p.title}</h3>
          <span class="related-post-meta">${p.readTime}</span>
        </div>
      </a>`;
  }).join("\n");

  return `<!-- RELATED_POSTS:start -->
<section class="related-posts" aria-label="Related Articles">
  <div class="container">
    <h2 class="related-posts-heading">Related Articles</h2>
    <div class="related-posts-grid">
${cards}
    </div>
  </div>
</section>
<!-- RELATED_POSTS:end -->`;
}

function serviceBlogHtml(posts) {
  const cards = posts.map(p => {
    const imgSrc = p.image.replace(/\.webp$/, ".webp");
    const imgFallback = p.image.replace(/\.webp$/, ".jpg");
    return `      <a class="related-post-card" href="${p.url}">
        <picture>
          <source srcset="${imgSrc}" type="image/webp">
          <img src="${imgFallback}" alt="${p.imageAlt}" loading="lazy" width="400" height="225">
        </picture>
        <div class="related-post-info">
          <h3>${p.title}</h3>
          <span class="related-post-meta">${p.readTime}</span>
        </div>
      </a>`;
  }).join("\n");

  return `<!-- BLOG_POSTS:start -->
<section class="service-blog-posts" aria-label="From Our Blog">
  <div class="container">
    <h2 class="related-posts-heading">From Our Blog</h2>
    <div class="related-posts-grid">
${cards}
    </div>
    <div class="related-posts-cta">
      <a href="/blog/" class="btn btn-outline">View All Articles</a>
    </div>
  </div>
</section>
<!-- BLOG_POSTS:end -->`;
}

// ─── File injection ───────────────────────────────────────────────────────────

function injectBlogSection(html, section, startMarker, endMarker, fallbackAnchor) {
  const startTag = `<!-- ${startMarker}:start -->`;
  const endTag   = `<!-- ${endMarker}:end -->`;

  if (html.includes(startTag)) {
    // Replace existing block
    const re = new RegExp(`<!-- ${startMarker}:start -->[\\s\\S]*?<!-- ${endMarker}:end -->`, "g");
    return html.replace(re, section);
  }

  // First run: insert before fallback anchor
  if (html.includes(fallbackAnchor)) {
    return html.replace(fallbackAnchor, `${section}\n${fallbackAnchor}`);
  }

  return html; // nothing to do
}

// ─── Main ────────────────────────────────────────────────────────────────────

const posts = JSON.parse(fs.readFileSync(POSTS_JSON, "utf8"));

let blogCount = 0;
let serviceCount = 0;

// Blog posts
const blogDir = path.join(ROOT, "blog");
for (const entry of fs.readdirSync(blogDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const htmlFile = path.join(blogDir, entry.name, "index.html");
  if (!fs.existsSync(htmlFile)) continue;

  let html = fs.readFileSync(htmlFile, "utf8");

  // Derive the URL from the canonical tag
  const canonMatch = html.match(/rel="canonical" href="https?:\/\/[^/]+(\/.+?)"/);
  const postUrl = canonMatch ? canonMatch[1] : `/blog/${entry.name}/`;

  const related = getRelated(posts, postUrl);
  if (related.length === 0) continue;

  const section = relatedPostsHtml(related);
  const updated = injectBlogSection(
    html,
    section,
    "RELATED_POSTS",
    "RELATED_POSTS",
    "<!-- PARTIAL:cta:start -->"
  );

  if (updated !== html) {
    fs.writeFileSync(htmlFile, updated, "utf8");
    blogCount++;
  }
}

// Service pages
const servicesDir = path.join(ROOT, "services");
for (const entry of fs.readdirSync(servicesDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const slug = entry.name;
  const htmlFile = path.join(servicesDir, slug, "index.html");
  if (!fs.existsSync(htmlFile)) continue;

  let html = fs.readFileSync(htmlFile, "utf8");

  const picks = getServicePosts(posts, slug);
  if (picks.length === 0) continue;

  const section = serviceBlogHtml(picks);
  const updated = injectBlogSection(
    html,
    section,
    "BLOG_POSTS",
    "BLOG_POSTS",
    "</main>"
  );

  if (updated !== html) {
    fs.writeFileSync(htmlFile, updated, "utf8");
    serviceCount++;
  }
}

console.log(`Related posts: ${blogCount} blog post(s) updated.`);
console.log(`Service blog sections: ${serviceCount} service page(s) updated.`);
