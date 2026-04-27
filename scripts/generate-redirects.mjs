#!/usr/bin/env node
/**
 * Salmon HVAC - Redirect Generator
 * Adds old WordPress root blog slug redirects to _redirects from blog/posts.json.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const REDIRECTS_FILE = path.join(ROOT, "_redirects");
const POSTS_JSON = path.join(ROOT, "blog", "posts.json");
const START = "# BLOG_ROOT_REDIRECTS:start";
const END = "# BLOG_ROOT_REDIRECTS:end";

const posts = JSON.parse(fs.readFileSync(POSTS_JSON, "utf8"));
const rules = posts
  .filter((post) => typeof post.url === "string" && post.url.startsWith("/blog/"))
  .map((post) => {
    const oldPath = post.url.replace(/^\/blog\//, "/");
    return `${oldPath.padEnd(74)} ${post.url.padEnd(82)} 301`;
  })
  .sort((a, b) => a.localeCompare(b));

const block = `${START}
# Generated from blog/posts.json. Old WordPress root slugs redirect to canonical /blog/ URLs.
${rules.join("\n")}
${END}`;

let redirects = fs.readFileSync(REDIRECTS_FILE, "utf8").trimEnd();
const managedPattern = new RegExp(`${START}[\\s\\S]*?${END}`, "m");

if (managedPattern.test(redirects)) {
  redirects = redirects.replace(managedPattern, block);
} else {
  redirects = `${redirects}\n\n${block}`;
}

fs.writeFileSync(REDIRECTS_FILE, `${redirects}\n`, "utf8");
console.log(`Redirects written for ${rules.length} old blog URL(s).`);
