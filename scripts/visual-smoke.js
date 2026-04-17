#!/usr/bin/env node

const fs = require('node:fs');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');

const repoRoot = path.resolve(__dirname, '..');
const requestedPort = Number(process.env.NAVYA_VISUAL_PORT || '4100');
const outDir = process.env.NAVYA_VISUAL_OUT_DIR || path.join(os.tmpdir(), 'navya-visual-smoke');
const baseUrlOverride = process.env.NAVYA_VISUAL_BASE_URL;

function resolveChromeBinary() {
  const candidates = [
    process.env.CHROME_BIN,
    '/usr/bin/google-chrome',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  ].filter(Boolean);

  const resolved = candidates.find((candidate) => fs.existsSync(candidate));

  if (!resolved) {
    throw new Error('No supported Chrome-compatible browser binary was found for visual smoke.');
  }

  return resolved;
}

const chromeBinary = resolveChromeBinary();

const scenarios = [
  {
    name: 'login',
    path: '/login',
    expect: ['Navya MVP', 'training rhythm'],
  },
  {
    name: 'onboarding-welcome',
    path: '/welcome',
    query: {
      'navya-test-session': 'demo-onboarding',
    },
    expect: ['Build your', 'Get Started'],
  },
  {
    name: 'onboarding-goal',
    path: '/goal',
    query: {
      'navya-test-session': 'demo-onboarding',
    },
    expect: ['Choose your main goal', 'Continue'],
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
    name: 'workout-history',
    path: '/workout',
    query: {
      'navya-test-session': 'demo-tabs',
      'navya-test-scenario': 'workout-history',
    },
    expect: ['Workout History', 'Recent Sessions'],
  },
  {
    name: 'nutrition',
    path: '/nutrition',
    query: {
      'navya-test-session': 'demo-tabs',
    },
    expect: ['Nutrition', 'Today’s diary'],
  },
  {
    name: 'coach',
    path: '/coach',
    query: {
      'navya-test-session': 'demo-tabs',
    },
    expect: ['Coach', 'Weekly check-in'],
  },
  {
    name: 'profile',
    path: '/profile',
    query: {
      'navya-test-session': 'demo-tabs',
    },
    expect: ['Body Metrics', 'Active Days', 'Edit Profile'],
  },
];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getBaseUrl(port) {
  return baseUrlOverride || `http://127.0.0.1:${port}`;
}

function canUsePort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', () => {
      resolve(false);
    });

    server.once('listening', () => {
      server.close(() => resolve(true));
    });

    server.listen(port, '127.0.0.1');
  });
}

async function findAvailablePort(startPort, maxAttempts = 20) {
  for (let offset = 0; offset < maxAttempts; offset += 1) {
    const candidate = startPort + offset;
    const available = await canUsePort(candidate);

    if (available) {
      return candidate;
    }
  }

  throw new Error(`Could not find an open port starting at ${startPort}`);
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

function buildUrl(scenario, baseUrl) {
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
        '--virtual-time-budget=8000',
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

async function captureScenario(scenario, baseUrl) {
  const scenarioUrl = buildUrl(scenario, baseUrl);
  const screenshotPath = path.join(outDir, `${scenario.name}.png`);
  await runChrome([`--screenshot=${screenshotPath}`, scenarioUrl]);
  const dom = await runChrome(['--dump-dom', scenarioUrl]);
  const warnings = [];

  if (dom.includes('ERR_CONNECTION_REFUSED') || dom.includes('This site can’t be reached')) {
    throw new Error(`Scenario "${scenario.name}" could not load ${scenarioUrl}`);
  }

  (scenario.expect ?? []).forEach((expectedText) => {
    if (!dom.includes(expectedText)) {
      warnings.push(expectedText);
    }
  });

  return {
    name: scenario.name,
    url: scenarioUrl,
    screenshotPath,
    warnings,
  };
}

function startExpoServer(port) {
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

  const shouldStartServer = !baseUrlOverride;
  const port = shouldStartServer ? await findAvailablePort(requestedPort) : requestedPort;
  const baseUrl = getBaseUrl(port);
  const server = shouldStartServer ? startExpoServer(port) : null;

  try {
    await waitForServer(`${baseUrl}/login`);

    const results = [];
    for (const scenario of scenarios) {
      const result = await captureScenario(scenario, baseUrl);
      results.push(result);
      console.log(`Captured ${result.name}: ${result.screenshotPath}`);
      if (result.warnings.length > 0) {
        console.warn(
          `Scenario "${result.name}" is missing expected text checks: ${result.warnings.join(', ')}`,
        );
      }
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
