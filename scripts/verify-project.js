#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..");
const args = new Set(process.argv.slice(2));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(repoRoot, relativePath));
}

function run(command) {
  execSync(command, {
    cwd: repoRoot,
    stdio: "inherit",
  });
}

function verifyFiles() {
  const requiredFiles = [
    ".env.example",
    ".nvmrc",
    "eas.json",
    "docs/ai-team/README.md",
    "docs/execution/current-status.md",
    "src/types/database.ts",
  ];

  requiredFiles.forEach((relativePath) => {
    assert(fileExists(relativePath), `Missing required file: ${relativePath}`);
  });

  assert(fileExists("package-lock.json"), "package-lock.json must exist.");
  assert(
    !fileExists("pnpm-lock.yaml"),
    "pnpm-lock.yaml must not exist. npm is the only supported package manager.",
  );
}

function verifyAppIdentity() {
  const appJson = JSON.parse(fs.readFileSync(path.join(repoRoot, "app.json"), "utf8"));
  const expoConfig = appJson.expo ?? {};

  assert(expoConfig.name === "Navya", "app.json expo.name must be Navya.");
  assert(
    expoConfig.ios?.bundleIdentifier?.includes("navya"),
    "iOS bundle identifier must contain navya.",
  );
  assert(
    expoConfig.android?.package?.includes("navya"),
    "Android package must contain navya.",
  );
}

function verifyPackageJson() {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"),
  );
  const scripts = packageJson.scripts ?? {};

  ["typecheck", "verify"].forEach((name) => {
    assert(Boolean(scripts[name]), `Missing package.json script: ${name}`);
  });
}

function main() {
  verifyFiles();
  verifyAppIdentity();
  verifyPackageJson();

  run("npm run typecheck");

  if (args.has("--smoke-web")) {
    run("node scripts/export-web.js dist/web-smoke");
  } else {
    console.log("Project verification passed.");
  }
}

main();
