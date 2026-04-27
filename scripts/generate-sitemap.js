#!/usr/bin/env node
/**
 * Compatibility wrapper for the maintained ESM sitemap generator.
 */
const { spawnSync } = require("node:child_process");
const path = require("node:path");

const result = spawnSync(process.execPath, [path.join(__dirname, "generate-sitemap.mjs")], {
  stdio: "inherit",
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
