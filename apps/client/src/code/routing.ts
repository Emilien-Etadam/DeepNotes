import type { AuthStore } from 'src/stores/auth';
import type { RouteLocationNormalized, Router } from 'vue-router';

import { trpcClient } from './trpc';
import { getRequestConfig } from './utils/misc';

const moduleLogger = mainLogger.sub('routing.universal.ts');

export async function redirectIfNecessary(input: {
  router: Router;
  route: RouteLocationNormalized;
  auth: AuthStore;
  cookies?: typeof Cookies;
}) {
  const redirectDest = await getRedirectDest({
    route: input.route,
    auth: input.auth,
    cookies: input.cookies,
  });

  if (redirectDest != null) {
    moduleLogger.info(
      'redirectIfNecessary redirect: %s',
      JSON.stringify(redirectDest),
    );

    await input.router.replace(redirectDest);
  }
}

function getSetupRedirectDest(input: {
  route: RouteLocationNormalized;
  needsSetup: boolean;
}): { name: string } | undefined {
  if (
    input.needsSetup &&
    (input.route.name === 'home' || input.route.name === 'login')
  ) {
    return { name: 'setup' };
  }
  if (input.needsSetup && input.route.name === 'register') {
    return { name: 'setup' };
  }
  if (!input.needsSetup && input.route.name === 'setup') {
    return { name: 'login' };
  }
  if (!input.needsSetup && input.route.name === 'register') {
    return { name: 'login' };
  }
  return undefined;
}

async function getSetupRedirectIfClient(input: {
  route: RouteLocationNormalized;
}): Promise<{ name: string } | undefined> {
  if (!process.env.CLIENT) return undefined;
  try {
    const { needsSetup } = await trpcClient.setup.getSetupStatus.query();
    return getSetupRedirectDest({ route: input.route, needsSetup });
  } catch {
    return undefined;
  }
}

function getAuthRequiredRedirect(input: {
  route: RouteLocationNormalized;
  loggedIn: boolean;
}): { name: string; query?: { redirect: string } } | undefined {
  if (
    !input.loggedIn &&
    input.route.matched.some((record) => record.meta.requiresAuth)
  ) {
    return { name: 'login', query: { redirect: input.route.fullPath } };
  }
  return undefined;
}

function getGuestRequiredRedirect(input: {
  route: RouteLocationNormalized;
  loggedIn: boolean;
}): { name: string } | undefined {
  if (
    input.loggedIn &&
    input.route.matched.some((record) => record.meta.requiresGuest)
  ) {
    return { name: 'pages' };
  }
  return undefined;
}

async function getStartingPageRedirect(input: {
  route: RouteLocationNormalized;
  loggedIn: boolean;
  cookies?: typeof Cookies;
}): Promise<{ name: string; params?: { pageId: string } } | undefined> {
  if (!input.loggedIn || input.route.name !== 'pages') return undefined;
  try {
    const startingPageId =
      await trpcClient.users.pages.getStartingPageId.query(undefined, {
        context: getRequestConfig(input.cookies),
      });
    return { name: 'page', params: { pageId: startingPageId } };
  } catch (error) {
    moduleLogger.error('getRedirectDest error: %o', error);
    return { name: 'home' };
  }
}

async function getGroupMainPageRedirect(input: {
  route: RouteLocationNormalized;
}): Promise<{ name: string; params: { pageId: string } } | undefined> {
  if (input.route.name !== 'group') return undefined;
  await trpcClient.groups.getMainPageId.query({
    groupId: input.route.params.groupId as string,
  });
  const mainPageId = await trpcClient.groups.getMainPageId.query({
    groupId: input.route.params.groupId as string,
  });
  if (mainPageId != null) {
    return { name: 'page', params: { pageId: mainPageId } };
  }
  return undefined;
}

export async function getRedirectDest(input: {
  route: RouteLocationNormalized;
  auth: AuthStore;
  cookies?: typeof Cookies;
}) {
  const setupRedirect = await getSetupRedirectIfClient({
    route: input.route,
  });
  if (setupRedirect != null) return setupRedirect;

  const authRedirect = getAuthRequiredRedirect({
    route: input.route,
    loggedIn: input.auth.loggedIn,
  });
  if (authRedirect != null) return authRedirect;

  const guestRedirect = getGuestRequiredRedirect({
    route: input.route,
    loggedIn: input.auth.loggedIn,
  });
  if (guestRedirect != null) return guestRedirect;

  const startingRedirect = await getStartingPageRedirect({
    route: input.route,
    loggedIn: input.auth.loggedIn,
    cookies: input.cookies,
  });
  if (startingRedirect != null) return startingRedirect;

  return getGroupMainPageRedirect({ route: input.route });
}
