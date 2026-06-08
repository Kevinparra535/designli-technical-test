// src/ui/utils/Logger.ts
//
// Tiny platform-agnostic logger used by ViewModels (and anywhere in the ui
// layer). Keeps ViewModels free of raw console calls and gives every log a
// consistent, taggable prefix. Swap the sink (Sentry, Datadog, etc.) here
// without touching callers.

type Level = 'debug' | 'info' | 'warn' | 'error';

export default class Logger {
  constructor(private readonly tag: string) {}

  debug(message: string, ...args: unknown[]): void {
    this.log('debug', message, args);
  }

  info(message: string, ...args: unknown[]): void {
    this.log('info', message, args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.log('warn', message, args);
  }

  error(message: string, ...args: unknown[]): void {
    this.log('error', message, args);
  }

  private log(level: Level, message: string, args: unknown[]): void {
    const line = `[${this.tag}] ${message}`;
    // eslint-disable-next-line no-console
    console[level](line, ...args);
  }
}
