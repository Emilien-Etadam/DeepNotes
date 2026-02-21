/**
 * Stub navigateur pour unilogr : le package utilise fs/node:util, incompatibles avec le build Vite.
 * On expose une API minimale (Logger avec info/error/sub) basée sur console.
 */

function noop() {
  return () => {};
}

export const markSlot = (name?: string) => ({
  slotName: name ?? '',
  operations: [],
});
export const capitalizeField = noop();
export const colorizeField = noop();
export const addTimestamp = noop();
export const addInterval = noop();
export const writeTo = noop();

export class ConsoleOutput {
  write() {}
}

export class Logger {
  private ctx: string;
  /** Tableau d'opérations (comme unilogr) pour compat avec logger.client.ts qui fait .operations.unshift() */
  operations: unknown[] = [];
  constructor(_pipeline?: unknown) {
    this.ctx = '';
  }
  error(msg: unknown, ...args: unknown[]) {
    console.error('[error]', this.ctx ? `(${this.ctx})` : '', msg, ...args);
    return this;
  }
  warn(msg: unknown, ...args: unknown[]) {
    console.warn('[warn]', this.ctx ? `(${this.ctx})` : '', msg, ...args);
    return this;
  }
  info(msg: unknown, ...args: unknown[]) {
    console.info('[info]', this.ctx ? `(${this.ctx})` : '', msg, ...args);
    return this;
  }
  debug(msg: unknown, ...args: unknown[]) {
    if (typeof console.debug === 'function')
      console.debug('[debug]', this.ctx ? `(${this.ctx})` : '', msg, ...args);
    return this;
  }
  verbose(msg: unknown, ...args: unknown[]) {
    return this.debug(msg, ...args);
  }
  sub(context: string): Logger {
    const child = new Logger();
    child.ctx = this.ctx ? `${this.ctx} > ${context}` : context;
    return child;
  }
}
