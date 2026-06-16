#!/usr/bin/env node
/**
 * Salmon HVAC - RSS Feed Generator
 * Builds RSS from blog/posts.json so crawlers and feed readers see the same
 * ordering as the public blog index.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const BASE_URL = "https://salmonhvac.com";
const POSTS_PATH = path.join(ROOT, "blog", "posts.json");

function escapeXml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function absoluteUrl(urlPath) {
  return new URL(urlPath, BASE_URL).toString();
}

function formatPubDate(post) {
  const date = new Date(`${post.date || ""}T12:00:00-06:00`);
  if (Number.isNaN(date.getTime())) {
    return new Date("1979-01-01T12:00:00-07:00").toUTCString();
  }
  return date.toUTCString();
}

const posts = JSON.parse(fs.readFileSync(POSTS_PATH, "utf8"));
const latestPostDate = posts.reduce((latest, post) => {
  const date = new Date(`${post.date || ""}T12:00:00-06:00`);
  return Number.isNaN(date.getTime()) || date <= latest ? latest : date;
}, new Date("1979-01-01T12:00:00-07:00"));

const items = posts.map((post) => {
  const link = absoluteUrl(post.url);
  const image = post.image ? absoluteUrl(post.image) : "";
  const enclosure = image
    ? `\n    <enclosure url="${escapeXml(image)}" type="${image.endsWith(".png") ? "image/png" : "image/jpeg"}" />`
    : "";

  return `  <item>
    <title>${escapeXml(post.title)}</title>
    <link>${escapeXml(link)}</link>
    <guid isPermaLink="true">${escapeXml(link)}</guid>
    <description>${escapeXml(post.excerpt)}</description>
    <pubDate>${escapeXml(formatPubDate(post))}</pubDate>${enclosure}
  </item>`;
});

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Salmon HVAC Blog</title>
  <link>${BASE_URL}/blog/</link>
  <atom:link href="${BASE_URL}/sitemap.rss" rel="self" type="application/rss+xml" />
  <description>HVAC tips, rebate guides, repair advice, and equipment resources for Utah homeowners from Salmon HVAC.</description>
  <language>en-us</language>
  <lastBuildDate>${latestPostDate.toUTCString()}</lastBuildDate>
${items.join("\n")}
</channel>
</rss>
`;

for (const filename of ["sitemap.rss", "rss.xml"]) {
  fs.writeFileSync(path.join(ROOT, filename), rss, "utf8");
}

console.log(`RSS feed written with ${posts.length} posts.`);
