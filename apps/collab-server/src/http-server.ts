import { mainLogger } from '@stdlib/misc';
import cookie from 'cookie';
import { type IncomingMessage, createServer } from 'node:http';
import jwt from 'jsonwebtoken';
import { once } from 'lodash';
import type { Socket } from 'node:net';

import { wsServer } from './ws-server';

export const httpServer = once(() =>
  createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Okay');
  }),
);

httpServer().on('upgrade', (req: IncomingMessage, socket: Socket, head) => {
  const upgradeLogger = mainLogger.sub('Upgrade');

  const cookies = cookie.parse(req.headers.cookie ?? '');

  if (cookies['accessToken'] != null && cookies['loggedIn'] === 'true') {
    try {
      const jwtPayload = jwt.verify(
        cookies['accessToken'],
        process.env.ACCESS_SECRET,
      );

      if (typeof jwtPayload === 'string' || jwtPayload.sid == null) {
        throw new Error('Invalid access token payload');
      }

      req.sessionId = jwtPayload.sid;

      upgradeLogger.info(
        `${socket.remoteAddress}${req.url}: Authentication successful`,
      );
    } catch {
      // Intentionally ignored: JWT verification failure, connection will be rejected
    }
  }

  if (req.sessionId == null) {
    upgradeLogger.info(
      `${socket.remoteAddress}${req.url}: Unauthenticated connection`,
    );
  }

  wsServer().handleUpgrade(req, socket, head, (websocket) => {
    wsServer().emit('connection', websocket, req);
  });
});
