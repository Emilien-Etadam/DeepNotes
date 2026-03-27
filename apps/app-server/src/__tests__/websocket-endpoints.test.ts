import { pack, unpack } from 'msgpackr';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WebSocket } from 'ws';

const mocks = vi.hoisted(() => ({
  createContext: vi.fn().mockResolvedValue({}),
  authHelper: vi.fn().mockResolvedValue({ userId: 'user-1' }),
  getParseFn: vi.fn(() => (value: unknown) => value),
  checkRedlockSignalAborted: vi.fn(),
}));

vi.mock('src/trpc/context', () => ({
  createContext: mocks.createContext,
}));

vi.mock('src/trpc/helpers', () => ({
  authHelper: mocks.authHelper,
}));

vi.mock('@trpc/server/unstable-core-do-not-import', () => ({
  getParseFn: mocks.getParseFn,
}));

vi.mock('@stdlib/redlock', () => ({
  checkRedlockSignalAborted: mocks.checkRedlockSignalAborted,
}));

describe('createWebsocketEndpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('route les messages vers les handlers et repond success', async () => {
    const { createWebsocketEndpoint } = await import('src/utils/websocket-endpoints');

    let wsHandler:
      | ((socket: any, req: any) => Promise<void>)
      | undefined;
    const fastify = {
      get: vi.fn((_: string, __: unknown, handler: typeof wsHandler) => {
        wsHandler = handler;
      }),
    } as any;

    const listeners: Record<string, (message: Buffer) => Promise<void>> = {};
    const socket = {
      readyState: WebSocket.OPEN,
      send: vi.fn(),
      close: vi.fn(),
      on: vi.fn((event: string, cb: (message: Buffer) => Promise<void>) => {
        listeners[event] = cb;
      }),
    } as any;

    const p1 = vi.fn(async ({ input }: any) => ({ step: 1, input }));
    const p2 = vi.fn(async ({ input }: any) => ({ step: 2, input }));

    createWebsocketEndpoint({
      fastify,
      url: '/ws/test',
      lockCommunication: async ({ performCommunication }) => {
        performCommunication([new AbortController().signal]).catch(() => undefined);
      },
      procedures: [
        [{ _def: { inputs: [{}] } } as any, p1],
        [{ _def: { inputs: [{}] } } as any, p2],
      ],
    });

    if (!wsHandler) {
      throw new Error('Websocket handler was not registered');
    }
    await wsHandler(socket, { ip: '127.0.0.1', headers: {} });

    await listeners.message(Buffer.from(pack({ id: 1 })));
    await listeners.message(Buffer.from(pack({ id: 2 })));

    expect(p1).toHaveBeenCalledTimes(1);
    expect(p2).toHaveBeenCalledTimes(1);
    expect(socket.send).toHaveBeenCalledTimes(2);
    expect(unpack(socket.send.mock.calls[0][0])).toMatchObject({
      success: true,
      output: { step: 1, input: { id: 1 } },
    });
    expect(unpack(socket.send.mock.calls[1][0])).toMatchObject({
      success: true,
      output: { step: 2, input: { id: 2 } },
    });
    expect(socket.close).toHaveBeenCalled();
  });

  it('normalise les erreurs inconnues en string', async () => {
    const { createWebsocketEndpoint } = await import('src/utils/websocket-endpoints');

    let wsHandler:
      | ((socket: any, req: any) => Promise<void>)
      | undefined;
    const fastify = {
      get: vi.fn((_: string, __: unknown, handler: typeof wsHandler) => {
        wsHandler = handler;
      }),
    } as any;

    const listeners: Record<string, (message: Buffer) => Promise<void>> = {};
    const socket = {
      readyState: WebSocket.OPEN,
      send: vi.fn(),
      close: vi.fn(),
      on: vi.fn((event: string, cb: (message: Buffer) => Promise<void>) => {
        listeners[event] = cb;
      }),
    } as any;

    createWebsocketEndpoint({
      fastify,
      url: '/ws/error',
      lockCommunication: async ({ performCommunication }) => {
        performCommunication([new AbortController().signal]).catch(() => undefined);
      },
      procedures: [
        [
          { _def: { inputs: [{}] } } as any,
          async () => {
            throw new Error('boom');
          },
        ],
      ],
    });

    if (!wsHandler) {
      throw new Error('Websocket handler was not registered');
    }
    await wsHandler(socket, { ip: '127.0.0.1', headers: {} });
    await listeners.message(Buffer.from(pack({ id: 1 })));

    expect(socket.send).toHaveBeenCalled();
    expect(unpack(socket.send.mock.calls[0][0])).toMatchObject({
      success: false,
      error: 'boom',
    });
    expect(socket.close).toHaveBeenCalled();
  });

  it('renvoie Unauthorized si auth echoue', async () => {
    const { createWebsocketEndpoint } = await import('src/utils/websocket-endpoints');
    mocks.authHelper.mockResolvedValueOnce(false);

    let wsHandler:
      | ((socket: any, req: any) => Promise<void>)
      | undefined;
    const fastify = {
      get: vi.fn((_: string, __: unknown, handler: typeof wsHandler) => {
        wsHandler = handler;
      }),
    } as any;

    const socket = {
      readyState: WebSocket.OPEN,
      send: vi.fn(),
      close: vi.fn(),
      on: vi.fn(),
    } as any;

    createWebsocketEndpoint({
      fastify,
      url: '/ws/unauthorized',
      lockCommunication: async () => {},
      procedures: [],
    });

    if (!wsHandler) {
      throw new Error('Websocket handler was not registered');
    }
    await wsHandler(socket, { ip: '127.0.0.1', headers: {} });

    expect(socket.send).toHaveBeenCalled();
    expect(unpack(socket.send.mock.calls[0][0])).toMatchObject({
      success: false,
      error: 'Unauthorized.',
    });
    expect(socket.close).toHaveBeenCalled();
  });

  it('gere les erreurs de lockCommunication', async () => {
    const { createWebsocketEndpoint } = await import('src/utils/websocket-endpoints');

    let wsHandler:
      | ((socket: any, req: any) => Promise<void>)
      | undefined;
    const fastify = {
      get: vi.fn((_: string, __: unknown, handler: typeof wsHandler) => {
        wsHandler = handler;
      }),
    } as any;

    const listeners: Record<string, (message: Buffer) => Promise<void>> = {};
    const socket = {
      readyState: WebSocket.OPEN,
      send: vi.fn(),
      close: vi.fn(),
      on: vi.fn((event: string, cb: (message: Buffer) => Promise<void>) => {
        listeners[event] = cb;
      }),
    } as any;

    createWebsocketEndpoint({
      fastify,
      url: '/ws/lock-fail',
      lockCommunication: async () => {
        throw new Error('lock failed');
      },
      procedures: [[{ _def: { inputs: [{}] } } as any, async () => ({ ok: true })]],
    });

    if (!wsHandler) {
      throw new Error('Websocket handler was not registered');
    }
    await wsHandler(socket, { ip: '127.0.0.1', headers: {} });
    await listeners.message(Buffer.from(pack({ id: 1 })));

    expect(socket.send).toHaveBeenCalled();
    const payload = unpack(socket.send.mock.calls[0][0]);
    expect(payload).toBeTruthy();
    const payloadObj = payload as { success?: boolean; error?: unknown };
    expect(payloadObj.success).toBe(false);
    if (Array.isArray(payloadObj.error)) {
      expect(payloadObj.error.some((item) => String(item).includes('lock failed'))).toBe(
        true,
      );
    } else if (typeof payloadObj.error === 'string') {
      expect(payloadObj.error).toContain('lock failed');
    } else if (payloadObj.error instanceof Error) {
      expect(payloadObj.error.message).toContain('lock failed');
    } else {
      expect(payloadObj.error).toBeDefined();
    }
  });
});
