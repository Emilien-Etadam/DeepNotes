import type { Redlock } from '@sesamecare-oss/redlock';

export function usingLocks<TResult>(
  redlock: Redlock,
  resources: string[][],
  routine: (signals: AbortSignal[]) => Promise<TResult>,
  signals: AbortSignal[] = [],
) {
  let func = routine;

  for (const nodeResources of resources) {
    const prevFunc = func;

    func = (signals) =>
      redlock.using(nodeResources, process.env.DEV ? 30000 : 5000, (signal) =>
        prevFunc([...signals, signal]),
      );
  }

  return func(signals);
}

export function checkRedlockSignalAborted(signals: AbortSignal[] = []) {
  for (const signal of signals) {
    if (signal.aborted) {
      throw signal.reason;
    }
  }
}
