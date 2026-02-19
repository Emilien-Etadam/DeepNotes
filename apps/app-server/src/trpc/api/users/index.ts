import { trpc } from 'src/trpc/server';

import { accountRouter } from './account';
import { invitesRouter } from './invites';
import { pagesRouter } from './pages';

export const usersRouter = trpc.router({
  account: accountRouter,
  invites: invitesRouter,
  pages: pagesRouter,
});
