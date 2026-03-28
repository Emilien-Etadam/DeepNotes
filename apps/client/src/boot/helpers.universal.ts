import type { BootContext } from './boot-context';

export async function setup({ app, store }: BootContext) {
  if (process.env.CLIENT) {
    appStore(store);
    authStore(store);
    uiStore(store);
    pagesStore(store);
  }
}
