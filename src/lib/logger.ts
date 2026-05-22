type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel = __DEV__ ? 'debug' : 'warn';

function formatEntry(entry: LogEntry): string {
  const time = new Date(entry.timestamp).toLocaleTimeString();
  const prefix = `[${time}] [${entry.level.toUpperCase()}]`;
  return entry.data ? `${prefix} ${entry.message} ${JSON.stringify(entry.data)}` : `${prefix} ${entry.message}`;
}

function log(level: LogLevel, message: string, data?: unknown) {
  if (LOG_LEVELS[level] < LOG_LEVELS[currentLevel]) return;

  const entry: LogEntry = { level, message, data, timestamp: new Date().toISOString() };

  switch (level) {
    case 'debug':
      console.debug(formatEntry(entry));
      break;
    case 'info':
      console.info(formatEntry(entry));
      break;
    case 'warn':
      console.warn(formatEntry(entry));
      break;
    case 'error':
      console.error(formatEntry(entry));
      break;
  }
}

export const logger = {
  debug: (message: string, data?: unknown) => log('debug', message, data),
  info: (message: string, data?: unknown) => log('info', message, data),
  warn: (message: string, data?: unknown) => log('warn', message, data),
  error: (message: string, data?: unknown) => log('error', message, data),
};
