import { Platform } from 'react-native';

export type VisualTestSessionMode = 'demo-tabs' | 'demo-onboarding';

function readSearchParam(name: string): string | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return null;
  }

  return new URLSearchParams(window.location.search).get(name);
}

export function getVisualTestSessionMode(): VisualTestSessionMode | null {
  const mode = readSearchParam('navya-test-session');

  if (mode === 'demo-tabs' || mode === 'demo-onboarding') {
    return mode;
  }

  return null;
}

function getVisualTestScenario(): string | null {
  return readSearchParam('navya-test-scenario');
}

export function isVisualTestScenario(name: string): boolean {
  return getVisualTestScenario() === name;
}
