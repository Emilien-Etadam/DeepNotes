import { mainLogger, Resolvable } from '@stdlib/misc';
import { checkRedlockSignalAborted } from '@stdlib/redlock';
import type { AnyProcedure } from '@trpc/server';
import type { FastifyInstance } from 'fastify';
import { pack, unpack } from 'msgpackr';
import { WebSocket } from 'ws';
import { createContext } from 'src/trpc/context';
import { authHelper } from 'src/trpc/helpers';

const moduleLogger = mainLogger.sub('Websocket endpoints');

function sendErrorAndDisconnect(socket: WebSocket, error: string) {
  if (socket.readyState !== WebSocket.OPEN) {
    return;
  }

  try {
    socket.send(
      pack({
        success: false,

        error: error,
      }),
    );

    socket.close();
  } catch (error) {
    moduleLogger.error('Error while disconnecting websocket: %o', error);
  }
}

function createWebsocketMessageHandler(input: {
  socket: WebSocket;
  ctx: any;
  acquireLocks: (input) => any;
  procedures: [AnyProcedure, (...args: any) => any][];
}) {
  let step = 1;

  // finishPromise is resolved after the last response is sent
  // it can be rejected at any time to abort the request

  const finishPromise = new Resolvable();

  finishPromise.catch((error_) =>
    sendErrorAndDisconnect(input.socket, error_),
  );

  const timeout = setTimeout(() => {
    finishPromise.reject('Websocket endpoint request timed out.');
  }, 30000);

  finishPromise.settle(() => {
    clearTimeout(timeout);
  });

  const redlockSignals: AbortSignal[] = [];

  return {
    finishPromise,
    redlockSignals,

    async handle(message: Buffer) {
      try {
        moduleLogger.info('Received message %d', step);

        const input_ = (
          input.procedures[step - 1][0]._def.inputs[0]
        ).parse(unpack(message));

        if (step === 1) {
          await input.acquireLocks(input_);
        }

        const output = await input.procedures[step - 1][1]({
          ctx: input.ctx,
          input: input_,
        });

        checkRedlockSignalAborted(redlockSignals);

        moduleLogger.info('Sending message %d', step);

        input.socket.send(
          pack({
            success: true,

            output,
          }),
        );

        if (step === input.procedures.length) {
          input.socket.close();
          finishPromise.resolve();

          moduleLogger.info('Finished websocket request');
        }

        step++;
      } catch (error: any) {
        finishPromise.reject(String(error?.message ?? error));
      }
    },
  };
}

export function createWebsocketEndpoint<Input>(input: {
  fastify: FastifyInstance;
  url: string;
  lockCommunication: (input: {
    ctx: Exclude<Awaited<ReturnType<typeof authHelper>>, false>;
    input: Input;

    performCommunication(signals: AbortSignal[]): Promise<void>;
  }) => Promise<void>;
  procedures: [AnyProcedure, (...args: any) => any][];
}) {
  input.fastify.get(input.url, { websocket: true }, async (socket, req) => {
    const ctxReadyPromise = new Resolvable();

    try {
      moduleLogger.info(`Starting websocket request: ${input.url}`);

      socket.on('message', async (message: Buffer) => {
        try {
          await ctxReadyPromise;

          await messageHandler.handle(message);
        } catch {
          // Intentionally ignored: message handling errors are logged elsewhere or non-fatal
        }
      });

      const originalCtx = createContext({ req, res: null as any });

      const ctx = await authHelper({ ctx: originalCtx } as any);

      if (!ctx) {
        sendErrorAndDisconnect(socket, 'Unauthorized.');

        return;
      }

      const messageHandler = createWebsocketMessageHandler({
        socket,
        ctx,
        acquireLocks: (input_) => {
          const lockAcquisitionPromise = new Resolvable();

          void input
            .lockCommunication({
              ctx: ctx as any,
              input: input_,

              async performCommunication(signals: AbortSignal[]) {
                messageHandler.redlockSignals.push(...signals);

                // Locks acquired and signals added to the list
                // Now we can start communication
                lockAcquisitionPromise.resolve();

                await messageHandler.finishPromise;
              },
            })
            .catch((error_) => {
              moduleLogger.error(error_);

              lockAcquisitionPromise.reject(error_);

              sendErrorAndDisconnect(socket, error_);
            });

          return lockAcquisitionPromise;
        },
        procedures: input.procedures,
      });

      ctxReadyPromise.resolve();
    } catch (error: any) {
      moduleLogger.error(error);

      sendErrorAndDisconnect(socket, String(error));

      ctxReadyPromise.reject(error);
    }
  });
}
