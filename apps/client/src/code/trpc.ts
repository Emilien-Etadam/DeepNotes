import type { AppRouter } from '@deepnotes/app-server/src/trpc/router';
import { createTRPCClient, httpLink } from '@trpc/client';
import { apiUrl } from 'src/lib/endpoints';
import superjson from 'superjson';

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: apiUrl(),
      transformer: superjson,

      headers({ op }) {
        return {
          ...(op.context as any)?.headers,
          'X-Trpc-Context': op.context,
        };
      },

      fetch(url, options) {
        const opts = {
          ...options,
          credentials: 'include' as RequestCredentials,
        };
        if ((opts.headers as any)?.['X-Trpc-Context'] != null) {
          delete (opts.headers as any)['X-Trpc-Context'];
        }
        return fetch(url, opts);
      },
    }),
  ],
});
