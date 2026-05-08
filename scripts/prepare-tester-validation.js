#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const templatePath = path.join(
  repoRoot,
  "supabase",
  "seeds",
  "templates",
  "tester-validation.template.sql",
);

function fail(message) {
  console.error(message);
  process.exit(1);
}

const userId = process.argv[2]?.trim();

if (!userId) {
  fail("Usage: npm run validate:tester -- <supabase-user-id>");
}

if (!/^[0-9a-fA-F-]{36}$/.test(userId)) {
  fail("Expected a UUID-like Supabase user id.");
}

const template = fs.readFileSync(templatePath, "utf8");
const rendered = template.replaceAll("__TEST_USER_ID__", userId);

process.stdout.write(rendered);
