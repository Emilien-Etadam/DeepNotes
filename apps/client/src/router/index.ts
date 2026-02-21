import { route } from 'quasar/wrappers';
import { getRedirectDest } from 'src/code/routing';
import {
  type RouteLocationRaw,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';

import routes from './routes';

const moduleLogger = mainLogger.sub('router/index.ts');

moduleLogger.info('Running module');

export default route(async function ({ store }) {
  const createHistory =
    process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = router(
    createRouter({
      scrollBehavior: () => ({ left: 0, top: 0 }),
      routes,
      history: createHistory(process.env.VUE_ROUTER_BASE),
    }),
  );

  const auth = authStore(store);
  const cookies = Cookies;

  Router.beforeEach(async (to, from, next) => {
    moduleLogger.info(
      'beforeEach (from: %s, to: %s)',
      from.fullPath,
      to.fullPath,
    );

    // Compute redirect

    let redirectDest: RouteLocationRaw | undefined = undefined;

    if (process.env.CLIENT && auth.redirect) {
      redirectDest = JSON.parse(auth.redirect);

      auth.redirect = '';
    } else {
      redirectDest = await getRedirectDest({
        route: to,
        auth,
        cookies,
      });
    }

    if (redirectDest != null) {
      moduleLogger.info('beforeEach redirect: %s', JSON.stringify(redirectDest));
      next(redirectDest);
    } else {
      next();
    }
  });

  return Router;
});
