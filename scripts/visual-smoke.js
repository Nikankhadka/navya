#!/usr/bin/env node

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');

const repoRoot = path.resolve(__dirname, '..');
const port = Number(process.env.NAVYA_VISUAL_PORT || '4100');
const chromeBinary = process.env.CHROME_BIN || '/usr/bin/google-chrome';
const outDir = process.env.NAVYA_VISUAL_OUT_DIR || path.join(os.tmpdir(), 'navya-visual-smoke');
const baseUrl = process.env.NAVYA_VISUAL_BASE_URL || `http://127.0.0.1:${port}`;

const scenarios = [
  {
    name: 'login',
    path: '/login',
    expect: ['Navya', 'Send Magic Link'],
  },
  {
    name: 'onboarding-welcome',
    path: '/welcome',
    query: {
      'navya-test-session': 'demo-onboarding',
    },
    expect: ['Welcome to Navya', 'Get Started'],
  },
  {
    name: 'onboarding-goal',
    path: '/goal',
    query: {
      'navya-test-session': 'demo-onboarding',
    },
    expect: ["What's your goal?", 'Continue'],
  },
  {
    name: 'home',
    path: '/',
    query: {
      'navya-test-session': 'demo-tabs',
    },
    expect: ["Today's Session", 'Nutrition Today', 'AI Coach'],
  },
  {
    name: 'workout',
    path: '/workout',
    query: {
      'navya-test-session': 'demo-tabs',
    },
    expect: ['Workout', "Today's Session"],
  },
  {
    name: 'workout-plan-modal',
    path: '/workout',
    query: {
      'navya-test-session': 'demo-tabs',
      'navya-test-scenario': 'workout-plan-modal',
    },
    expect: ['Workout', 'Close'],
  },
  {
    name: 'nutrition',
    path: '/nutrition',
    query: {
      'navya-test-session': 'demo-tabs',
    },
    expect: ['Nutrition', "Today's Diary"],
  },
  {
    name: 'coach',
    path: '/coach',
    query: {
      'navya-test-session': 'demo-tabs',
    },
    expect: ['AI Coach', 'Limited AI'],
  },
  {
    name: 'profile',
    path: '/profile',
    query: {
      'navya-test-session': 'demo-tabs',
    },
    expect: ['Body Metrics', 'Edit Profile'],
  },
];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 120000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch (_error) {
      // Server is still starting.
    }

    await wait(2000);
  }

  throw new Error(`Timed out waiting for ${url}`);
}

function buildUrl(scenario) {
  const url = new URL(scenario.path, baseUrl);

  Object.entries(scenario.query ?? {}).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return url.toString();
}

function runChrome(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      chromeBinary,
      [
        '--headless=new',
        '--disable-gpu',
        '--hide-scrollbars',
        '--no-sandbox',
        '--window-size=1440,2200',
        '--virtual-time-budget=5000',
        ...args,
      ],
      {
        cwd: repoRoot,
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Chrome exited with code ${code}\n${stderr}`));
        return;
      }

      resolve(stdout);
    });
  });
}

async function captureScenario(scenario) {
  const scenarioUrl = buildUrl(scenario);
  const screenshotPath = path.join(outDir, `${scenario.name}.png`);
  const dom = await runChrome(['--dump-dom', scenarioUrl]);

  scenario.expect.forEach((expectedText) => {
    if (!dom.includes(expectedText)) {
      throw new Error(
        `Scenario "${scenario.name}" is missing expected text "${expectedText}" at ${scenarioUrl}`,
      );
    }
  });

  await runChrome([`--screenshot=${screenshotPath}`, scenarioUrl]);

  return {
    name: scenario.name,
    url: scenarioUrl,
    screenshotPath,
  };
}

function startExpoServer() {
  const child = spawn(
    'npx',
    ['expo', 'start', '--web', '--port', String(port)],
    {
      cwd: repoRoot,
      env: { ...process.env, CI: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  child.stdout.on('data', (chunk) => {
    process.stdout.write(chunk.toString());
  });

  child.stderr.on('data', (chunk) => {
    process.stderr.write(chunk.toString());
  });

  return child;
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  const shouldStartServer = !process.env.NAVYA_VISUAL_BASE_URL;
  const server = shouldStartServer ? startExpoServer() : null;

  try {
    await waitForServer(`${baseUrl}/login`);

    const results = [];
    for (const scenario of scenarios) {
      const result = await captureScenario(scenario);
      results.push(result);
      console.log(`Captured ${result.name}: ${result.screenshotPath}`);
    }

    console.log(`Visual smoke passed for ${results.length} scenarios.`);
    console.log(`Screenshots saved to ${outDir}`);
  } finally {
    if (server && !server.killed) {
      server.kill('SIGTERM');
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
