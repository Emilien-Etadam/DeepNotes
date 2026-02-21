import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('src/layouts/HomeLayout/HomeLayout.vue'),
    meta: { requiresGuest: true },
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('src/pages/home/Login/Login.vue'),
      },
    ],
  },

  {
    path: '/login',
    component: () => import('src/layouts/HomeLayout/HomeLayout.vue'),
    meta: { requiresGuest: true },
    children: [
      {
        path: '',
        name: 'login',
        component: () => import('src/pages/home/Login/Login.vue'),
      },
    ],
  },

  {
    path: '/setup',
    component: () => import('src/layouts/HomeLayout/HomeLayout.vue'),
    meta: { requiresGuest: true },
    children: [
      {
        path: '',
        name: 'setup',
        component: () => import('src/pages/home/Setup.vue'),
      },
    ],
  },

  {
    path: '/register',
    component: () => import('src/layouts/HomeLayout/HomeLayout.vue'),
    meta: { requiresGuest: true },
    children: [
      {
        path: '',
        name: 'register',
        component: () => import('src/pages/home/Register.vue'),
      },
    ],
  },

  {
    path: '/finish-registration',
    component: () => import('src/layouts/HomeLayout/HomeLayout.vue'),
    meta: { requiresGuest: true },
    children: [
      {
        path: '',
        name: 'finish-registration',
        component: () => import('src/pages/home/FinishRegistration.vue'),
      },
    ],
  },

  {
    path: '/verify-email/:code',
    component: () => import('src/layouts/HomeLayout/HomeLayout.vue'),
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
    component: () => import('src/layouts/HomeLayout/HomeLayout.vue'),
    children: [
      {
        path: '',
        name: 'help',
        component: () => import('src/pages/home/Help/Help.vue'),
      },
      {
        path: 'what-is-deepnotes',
        component: () => import('src/pages/home/Help/HelpLayout.vue'),
        children: [
          {
            path: '',
            name: 'help/what-is-deepnotes',
            component: () =>
              import('src/pages/home/Help/Pages/WhatIsDeepNotes.vue'),
          },
        ],
      },
      {
        path: 'creating-group',
        component: () => import('src/pages/home/Help/HelpLayout.vue'),
        children: [
          {
            path: '',
            name: 'help/creating-group',
            component: () =>
              import('src/pages/home/Help/Pages/CreatingGroup.vue'),
          },
        ],
      },
      {
        path: 'inviting-users',
        component: () => import('src/pages/home/Help/HelpLayout.vue'),
        children: [
          {
            path: '',
            name: 'help/inviting-users',
            component: () =>
              import('src/pages/home/Help/Pages/InvitingUsers.vue'),
          },
        ],
      },
      {
        path: 'joining-group',
        component: () => import('src/pages/home/Help/HelpLayout.vue'),
        children: [
          {
            path: '',
            name: 'help/joining-group',
            component: () =>
              import('src/pages/home/Help/Pages/JoiningGroup.vue'),
          },
        ],
      },
      {
        path: 'forgot-password',
        component: () => import('src/pages/home/Help/HelpLayout.vue'),
        children: [
          {
            path: '',
            name: 'help/forgot-password',
            component: () =>
              import('src/pages/home/Help/Pages/ForgotPassword.vue'),
          },
        ],
      },
      {
        path: 'offline-usage',
        component: () => import('src/pages/home/Help/HelpLayout.vue'),
        children: [
          {
            path: '',
            name: 'help/offline-usage',
            component: () =>
              import('src/pages/home/Help/Pages/OfflineUsage.vue'),
          },
        ],
      },
      {
        path: 'multi-page-text-search',
        component: () => import('src/pages/home/Help/HelpLayout.vue'),
        children: [
          {
            path: '',
            name: 'help/multi-page-text-search',
            component: () =>
              import('src/pages/home/Help/Pages/MultiPageTextSearch.vue'),
          },
        ],
      },
      {
        path: 'refund-policy',
        component: () => import('src/pages/home/Help/HelpLayout.vue'),
        children: [
          {
            path: '',
            name: 'help/refund-policy',
            component: () =>
              import('src/pages/home/Help/Pages/RefundPolicy.vue'),
          },
        ],
      },
      {
        path: 'subscription-expiration',
        component: () => import('src/pages/home/Help/HelpLayout.vue'),
        children: [
          {
            path: '',
            name: 'help/subscription-expiration',
            component: () =>
              import('src/pages/home/Help/Pages/SubscriptionExpiration.vue'),
          },
        ],
      },
      {
        path: 'roadmap',
        component: () => import('src/pages/home/Help/HelpLayout.vue'),
        children: [
          {
            path: '',
            name: 'help/roadmap',
            component: () => import('src/pages/home/Help/Pages/Roadmap.vue'),
          },
        ],
      },
    ],
  },

  {
    path: '/terms-of-service',
    component: () => import('src/layouts/HomeLayout/HomeLayout.vue'),
    children: [
      {
        path: '',
        name: 'terms-of-service',
        component: () =>
          import('src/pages/home/TermsOfService/TermsOfService.vue'),
      },
    ],
  },

  {
    path: '/accept-invite/:token',
    component: () => import('src/layouts/HomeLayout/HomeLayout.vue'),
    meta: { requiresGuest: true },
    children: [
      {
        path: '',
        name: 'accept-invite',
        component: () => import('src/pages/home/AcceptInvite.vue'),
      },
    ],
  },

  {
    path: '/account',
    component: () => import('src/layouts/HomeLayout/HomeLayout.vue'),
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
