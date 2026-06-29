#!/usr/bin/env node
/**
 * Salmon HVAC - Blog Index Generator
 * Pre-renders the blog index grid as static HTML from blog/posts.json so every
 * post has a crawlable internal link (fixes "orphan page" issues). Replaces the
 * content between the BLOG_INDEX markers in blog/index.html.
 *
 * Run: node scripts/generate-blog-index.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const POSTS = path.join(ROOT, "blog/posts.json");
const INDEX = path.join(ROOT, "blog/index.html");

const esc = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const posts = JSON.parse(fs.readFileSync(POSTS, "utf8"));
posts.sort((a, b) => new Date(b.date) - new Date(a.date));

const cards = posts
  .map(
    (p) => `      <article class="blog-card">
        <div class="blog-card-image">
          <img src="${esc(p.image)}" alt="${esc(p.imageAlt)}" width="400" height="250" loading="lazy">
        </div>
        <div class="blog-card-content">
          <div style="font-size:0.85rem;color:#6b7280;margin-bottom:0.5rem;">${esc(p.dateDisplay)} &nbsp;&bull;&nbsp; ${esc(p.readTime)}</div>
          <h2 style="font-size:1.15rem;"><a href="${esc(p.url)}">${esc(p.title)}</a></h2>
          <p>${esc(p.excerpt)}</p>
          <a href="${esc(p.url)}" class="read-more">Read the Full Guide <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
        </div>
      </article>`
  )
  .join("\n");

let html = fs.readFileSync(INDEX, "utf8");
const region = /<!-- BLOG_INDEX:start -->[\s\S]*?<!-- BLOG_INDEX:end -->/;
if (!region.test(html)) {
  throw new Error("BLOG_INDEX markers not found in blog/index.html");
}
html = html.replace(
  region,
  `<!-- BLOG_INDEX:start -->\n${cards}\n    <!-- BLOG_INDEX:end -->`
);
fs.writeFileSync(INDEX, html, "utf8");
console.log(`Blog index: rendered ${posts.length} static post cards.`);
