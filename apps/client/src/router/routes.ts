import type { RouteRecordRaw } from 'vue-router';

const homeLayout = () => import('src/layouts/HomeLayout/HomeLayout.vue');
const helpLayout = () => import('src/pages/home/Help/HelpLayout.vue');

type HomeRouteConfig = {
  path: string;
  name: string;
  component: () => Promise<unknown>;
  layout?: () => Promise<unknown>;
  meta?: RouteRecordRaw['meta'];
};

function createLayoutRoute(config: HomeRouteConfig): RouteRecordRaw {
  return {
    path: config.path,
    component: config.layout ?? homeLayout,
    ...(config.meta && { meta: config.meta }),
    children: [
      {
        path: '',
        name: config.name,
        component: config.component,
      },
    ],
  };
}

const guestPaths = [
  { path: '/', name: 'home', page: 'Login/Login' },
  { path: '/login', name: 'login', page: 'Login/Login' },
  { path: '/setup', name: 'setup', page: 'Setup' },
  { path: '/register', name: 'register', page: 'Register' },
  {
    path: '/finish-registration',
    name: 'finish-registration',
    page: 'FinishRegistration',
  },
  {
    path: '/accept-invite/:token',
    name: 'accept-invite',
    page: 'AcceptInvite',
  },
] as const;

const guestHomeRoutes = guestPaths.map(({ path, name, page }) =>
  createLayoutRoute({
    path,
    name,
    component: () => import(`src/pages/home/${page}.vue`),
    meta: { requiresGuest: true },
  }),
);

const helpPages = [
  'what-is-deepnotes',
  'creating-group',
  'inviting-users',
  'joining-group',
  'forgot-password',
  'canvas-navigation',
  'notes-and-arrows',
  'export-for-ai',
  'encryption',
  'keyboard-shortcuts',
] as const;

const helpChildRoutes = helpPages.map((slug) => {
  const pascal = slug
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');

  return createLayoutRoute({
    path: slug,
    name: `help/${slug}`,
    component: () => import(`src/pages/home/Help/Pages/${pascal}.vue`),
    layout: helpLayout,
  });
});

const routes: RouteRecordRaw[] = [
  ...guestHomeRoutes,

  {
    path: '/verify-email/:code',
    component: homeLayout,
    children: [
      {
        path: '',
        name: 'verify-email',
        component: () => import('src/pages/home/VerifyEmail.vue'),
      },
    ],
  },

  {
    path: '/help',
    component: homeLayout,
    children: [
      {
        path: '',
        name: 'help',
        component: () => import('src/pages/home/Help/Help.vue'),
      },
      ...helpChildRoutes,
    ],
  },

  {
    path: '/account',
    component: homeLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        component: () => import('src/pages/home/Account/Account.vue'),
        children: [
          {
            path: 'general',
            name: 'account/general',
            component: () =>
              import('src/pages/home/Account/General/General.vue'),
          },
          {
            path: 'security',
            name: 'account/security',
            component: () =>
              import('src/pages/home/Account/Security/Security.vue'),
          },
          {
            path: 'invitations',
            name: 'account/invitations',
            component: () =>
              import('src/pages/home/Account/Invitations/Invitations.vue'),
          },
        ],
      },
    ],
  },

  {
    path: '/groups/:groupId',
    component: () => import('src/layouts/PagesLayout/PagesLayout.vue'),
    children: [
      {
        path: '',
        name: 'group',
        component: () => import('src/pages/pages/Group.vue'),
      },
    ],
  },

  {
    path: '/pages',
    name: 'pages',
    component: () => import('src/pages/pages/Pages.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/pages/:pageId',
    component: () => import('src/layouts/PagesLayout/PagesLayout.vue'),
    children: [
      {
        path: '',
        name: 'page',
        component: () => import('src/pages/pages/Page.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('src/pages/ErrorNotFound.vue'),
  },
];

export default routes;
