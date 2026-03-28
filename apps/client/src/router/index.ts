import type { Pinia } from 'pinia';
import Cookies from 'js-cookie';
import { router } from 'src/code/helpers';
import { getRedirectDest } from 'src/code/routing';
import {
  createRouter,
  createWebHashHistory,
  type RouteLocationRaw,
} from 'vue-router';

import routes from './routes';

const moduleLogger = mainLogger.sub('router/index.ts');

moduleLogger.info('Running module');

export function createAppRouter(store: Pinia) {
  const Router = router(
    createRouter({
      scrollBehavior: () => ({ left: 0, top: 0 }),
      routes,
      history: createWebHashHistory(),
    }),
  );

  const auth = authStore(store);

  Router.beforeEach(async (to, from, next) => {
    moduleLogger.info(
      'beforeEach (from: %s, to: %s)',
      from.fullPath,
      to.fullPath,
    );

    let redirectDest: RouteLocationRaw | undefined = undefined;

    if (process.env.CLIENT && auth.redirect) {
      redirectDest = JSON.parse(auth.redirect);

      auth.redirect = '';
    } else {
      redirectDest = await getRedirectDest({
        route: to,
        auth,
        cookies: Cookies,
      });
    }

    if (redirectDest == null) {
      next();
    } else {
      moduleLogger.info(
        'beforeEach redirect: %s',
        JSON.stringify(redirectDest),
      );
      next(redirectDest);
    }
  });

  return Router;
}
