#!/usr/bin/env node

const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const outputDirArg = process.argv[2] ?? 'dist/web';
const outputDir = path.resolve(repoRoot, outputDirArg);
const outputMarker = `Exported: ${outputDirArg}`;
const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';

let exportCompleted = false;
let shutdownTimer = null;
let forceKillTimer = null;

function clearTimers() {
  if (shutdownTimer) {
    clearTimeout(shutdownTimer);
    shutdownTimer = null;
  }

  if (forceKillTimer) {
    clearTimeout(forceKillTimer);
    forceKillTimer = null;
  }
}

function finish(code) {
  clearTimers();
  process.exit(code);
}

function scheduleShutdown(child) {
  if (shutdownTimer) {
    return;
  }

  shutdownTimer = setTimeout(() => {
    if (child.exitCode !== null) {
      return;
    }

    child.kill('SIGTERM');

    forceKillTimer = setTimeout(() => {
      if (child.exitCode === null) {
        child.kill('SIGKILL');
      }
    }, 3000);
  }, 2000);
}

function handleChunk(child, chunk, writer) {
  const text = chunk.toString();
  writer.write(text);

  if (!exportCompleted && text.includes(outputMarker)) {
    exportCompleted = true;
    scheduleShutdown(child);
  }
}

const child = spawn(
  npxCommand,
  ['expo', 'export', '--platform', 'web', '--output-dir', outputDirArg],
  {
    cwd: repoRoot,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  },
);

child.stdout.on('data', (chunk) => handleChunk(child, chunk, process.stdout));
child.stderr.on('data', (chunk) => handleChunk(child, chunk, process.stderr));

child.on('error', (error) => {
  console.error(error);
  finish(1);
});

child.on('exit', (code, signal) => {
  clearTimers();

  if (exportCompleted && fs.existsSync(outputDir)) {
    finish(0);
    return;
  }

  if (signal) {
    console.error(`Expo export ended with signal ${signal} before output was confirmed.`);
    finish(1);
    return;
  }

  finish(code ?? 1);
});
