// src/shared/Logger.ts
//
// Tiny cross-cutting logger used across layers (data managers + ui ViewModels).
// Lives in `shared/` — NOT under `ui/` — so the data layer can use it without
// crossing the ui boundary. Keeps callers free of raw console calls and gives
// every log a consistent, taggable prefix. Swap the sink (Sentry, Datadog, …)
// here without touching callers.

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

    console[level](line, ...args);
  }
}
