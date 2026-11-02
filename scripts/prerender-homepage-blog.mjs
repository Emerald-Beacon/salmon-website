#!/usr/bin/env node
/**
 * Salmon HVAC - Homepage blog-card prerenderer
 *
 * The homepage used to render its three "HVAC Resources" cards client-side by
 * fetching /blog/posts.json. That file is ~96KB of JSON describing all 155
 * posts, downloaded and parsed just to read the newest three. It also sat in
 * the critical request chain (document -> posts.json), and left the cards
 * invisible to crawlers and to anything that does not run JavaScript.
 *
 * This step bakes the three newest cards straight into dist/index.html and
 * drops the fetch, so the published homepage makes one fewer request and does
 * no JSON work on the main thread.
 *
 * Runs after stage-public.mjs (which populates dist/) and before
 * optimize-dist.mjs (which minifies what we emit here).
 *
 * The source index.html keeps its client-side fallback, so opening the repo
 * copy directly still shows the cards.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "..", "dist");

const INDEX = path.join(DIST, "index.html");
const POSTS = path.join(DIST, "blog/posts.json");
const CARD_COUNT = 3;

const fail = (msg) => {
  console.error(`prerender-homepage-blog: ${msg}`);
  process.exit(1);
};

if (!fs.existsSync(INDEX)) fail("dist/index.html not found - run stage-public.mjs first.");
if (!fs.existsSync(POSTS)) fail("dist/blog/posts.json not found - run generate-blog-index.mjs first.");

/* The client-side version interpolated raw values into innerHTML, so a title
   containing & or " produced broken markup. Escaping here fixes that too. */
const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const posts = JSON.parse(fs.readFileSync(POSTS, "utf8"));
if (!Array.isArray(posts) || posts.length < CARD_COUNT) {
  fail(`expected at least ${CARD_COUNT} posts in posts.json, found ${posts?.length}`);
}

const newest = [...posts]
  .sort((a, b) => new Date(b.date) - new Date(a.date))
  .slice(0, CARD_COUNT);

/* h3, not h2: the section is already headed by an h2, and .blog-card h3 is the
   selector style.css actually styles. The old h2 needed an inline font-size to
   compensate. */
const card = (p) => `
        <div class="blog-card">
          <div class="blog-card-image">
            <img src="${esc(p.image)}" alt="${esc(p.imageAlt)}" width="400" height="250" loading="lazy" decoding="async">
          </div>
          <div class="blog-card-content">
            <div class="blog-card-meta">${esc(p.dateDisplay)} &nbsp;&bull;&nbsp; ${esc(p.readTime)}</div>
            <h3><a href="${esc(p.url)}">${esc(p.title)}</a></h3>
            <p>${esc(p.excerpt)}</p>
            <a href="${esc(p.url)}" class="read-more">Read the Full Guide <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
          </div>
        </div>`;

let html = fs.readFileSync(INDEX, "utf8");

/* 1. Fill the grid */
const gridRe = /(<div class="blog-grid" id="homepage-blog-grid">)([\s\S]*?)(<\/div>)/;
if (!gridRe.test(html)) fail("could not find #homepage-blog-grid in dist/index.html");
html = html.replace(gridRe, (_m, open, _inner, close) => `${open}${newest.map(card).join("")}\n      ${close}`);

/* 2. Drop the now-redundant fetch */
const scriptRe = /[ \t]*<script>\s*fetch\('\/blog\/posts\.json'\)[\s\S]*?<\/script>\n?/;
if (!scriptRe.test(html)) fail("could not find the posts.json fetch block in dist/index.html");
html = html.replace(scriptRe, "");

fs.writeFileSync(INDEX, html, "utf8");

const jsonKb = (fs.statSync(POSTS).size / 1024).toFixed(0);
console.log(
  `prerendered ${CARD_COUNT} homepage blog cards; dropped the /blog/posts.json fetch (${jsonKb}KB, 1 chained request)`
);
for (const p of newest) console.log(`  - ${p.dateDisplay}  ${p.title.slice(0, 64)}`);
