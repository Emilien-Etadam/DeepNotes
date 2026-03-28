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

const guestPageComponents: Record<string, () => Promise<unknown>> = {
  'Login/Login': () => import('src/pages/home/Login/Login.vue'),
  Setup: () => import('src/pages/home/Setup.vue'),
  Register: () => import('src/pages/home/Register.vue'),
  FinishRegistration: () => import('src/pages/home/FinishRegistration.vue'),
  AcceptInvite: () => import('src/pages/home/AcceptInvite.vue'),
};

const guestHomeRoutes = guestPaths.map(({ path, name, page }) =>
  createLayoutRoute({
    path,
    name,
    component: guestPageComponents[page],
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

const helpPageComponents: Record<string, () => Promise<unknown>> = {
  'what-is-deepnotes': () =>
    import('src/pages/home/Help/Pages/WhatIsDeepNotes.vue'),
  'creating-group': () => import('src/pages/home/Help/Pages/CreatingGroup.vue'),
  'inviting-users': () => import('src/pages/home/Help/Pages/InvitingUsers.vue'),
  'joining-group': () => import('src/pages/home/Help/Pages/JoiningGroup.vue'),
  'forgot-password': () =>
    import('src/pages/home/Help/Pages/ForgotPassword.vue'),
  'canvas-navigation': () =>
    import('src/pages/home/Help/Pages/CanvasNavigation.vue'),
  'notes-and-arrows': () =>
    import('src/pages/home/Help/Pages/NotesAndArrows.vue'),
  'export-for-ai': () => import('src/pages/home/Help/Pages/ExportForAI.vue'),
  encryption: () => import('src/pages/home/Help/Pages/Encryption.vue'),
  'keyboard-shortcuts': () =>
    import('src/pages/home/Help/Pages/KeyboardShortcuts.vue'),
};

const helpChildRoutes = helpPages.map((slug) =>
  createLayoutRoute({
    path: slug,
    name: `help/${slug}`,
    component: helpPageComponents[slug],
    layout: helpLayout,
  }),
);

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
