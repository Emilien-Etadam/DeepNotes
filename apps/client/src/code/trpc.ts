import type { AppRouter } from '@deepnotes/app-server/src/trpc/router';
import { createTRPCProxyClient, httpLink } from '@trpc/client';
import superjson from 'superjson';

export const trpcClient = createTRPCProxyClient<AppRouter>({
  transformer: superjson,

  links: [
    httpLink({
      url: process.env.APP_SERVER_URL,

      headers({ op }) {
        return {
          ...(op.context as any)?.headers,
          'X-Trpc-Context': op.context,
        };
      },

      fetch(url, options) {
        const opts = { ...options, credentials: 'include' as RequestCredentials };
        if ((opts.headers as any)?.['X-Trpc-Context'] != null) {
          delete (opts.headers as any)['X-Trpc-Context'];
        }
        return fetch(url, opts);
      },
    }),
  ],
});
