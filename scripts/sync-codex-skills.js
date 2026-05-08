#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

const repoRoot = path.resolve(__dirname, "..");
const sourceRoot = path.join(repoRoot, "plugins", "navya-ai-team", "skills");
const targetRoot = path.join(os.homedir(), ".codex", "skills");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copySkillDirectory(skillName) {
  const sourcePath = path.join(sourceRoot, skillName);
  const targetPath = path.join(targetRoot, skillName);

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing skill source: ${sourcePath}`);
  }

  fs.rmSync(targetPath, { recursive: true, force: true });
  fs.cpSync(sourcePath, targetPath, { recursive: true });
  return targetPath;
}

function main() {
  if (!fs.existsSync(sourceRoot)) {
    throw new Error(`Skill source root not found: ${sourceRoot}`);
  }

  ensureDir(targetRoot);

  const skillNames = fs
    .readdirSync(sourceRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  if (skillNames.length === 0) {
    throw new Error("No Navya skill directories were found to sync.");
  }

  const copied = skillNames.map(copySkillDirectory);

  console.log("Synced Navya skills:");
  copied.forEach((skillPath) => console.log(`- ${skillPath}`));
}

main();
