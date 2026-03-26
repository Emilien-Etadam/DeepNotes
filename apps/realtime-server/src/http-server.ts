import type { AccessTokenPayload } from '@deeplib/misc';
import { mainLogger } from '@stdlib/misc';
import cookie from 'cookie';
import { type IncomingMessage, createServer } from 'node:http';
import jwt from 'jsonwebtoken';
import { once } from 'lodash';
import type { Socket } from 'node:net';
import { wsServer } from 'src/ws-server';

const moduleLogger = mainLogger.sub('http-server.ts');

export const httpServer = once(() =>
  createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Okay');
  }),
);

httpServer().on('upgrade', (req: IncomingMessage, socket: Socket, head) => {
  const funcLogger = moduleLogger.sub('Upgrade');

  const cookies = cookie.parse(req.headers.cookie ?? '');

  funcLogger.info(
    'Access token: %s',
    cookies['accessToken'] ? '[PRESENT]' : '[ABSENT]',
  );
  funcLogger.info('Logged in: %o', cookies['loggedIn']);

  if (cookies['accessToken'] != null && cookies['loggedIn'] === 'true') {
    try {
      const jwtPayload = jwt.verify(
        cookies['accessToken'],
        process.env.ACCESS_SECRET!,
      ) as unknown as AccessTokenPayload;

      req.sessionId = jwtPayload.sid;

      moduleLogger.info(
        `${socket.remoteAddress}${req.url}: Authentication successful`,
      );
    } catch {
      // Intentionally ignored: JWT verification failure, connection will be rejected
    }
  }

  if (req.sessionId == null) {
    moduleLogger.info(
      `${socket.remoteAddress}${req.url}: Unauthenticated connection`,
    );
  }

  wsServer().handleUpgrade(req, socket, head, (websocket) => {
    wsServer().emit('connection', websocket, req);
  });
});
