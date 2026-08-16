// ──────────────────────────────────────────────
// XOChat — Structured logger (no PII)
// ──────────────────────────────────────────────

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function formatMessage(level: LogLevel, context: string, message: string): string {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}] [${context}] ${message}`;
}

export const logger = {
  info(context: string, message: string): void {
    console.info(formatMessage('info', context, message));
  },

  warn(context: string, message: string): void {
    console.warn(formatMessage('warn', context, message));
  },

  error(context: string, message: string, error?: unknown): void {
    let errMsg = '';
    if (error instanceof Error) {
      errMsg = error.message;
    } else if (error && typeof error === 'object') {
      const errObj = error as Record<string, unknown>;
      errMsg = String(errObj.message || errObj.error_description || errObj.details || JSON.stringify(error));
    } else if (error) {
      errMsg = String(error);
    }
    console.error(formatMessage('error', context, `${message}${errMsg ? ` — ${errMsg}` : ''}`));
  },

  debug(context: string, message: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(formatMessage('debug', context, message));
    }
  },
};
