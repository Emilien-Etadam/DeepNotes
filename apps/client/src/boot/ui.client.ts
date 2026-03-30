import type { BootContext } from './boot-context';

export async function setup({ store }: BootContext) {
  if (internals.localStorage.getItem('leftSidebarExpanded') == null) {
    uiStore(store).leftSidebarExpanded = globalThis.innerWidth > 1000;
  } else {
    uiStore(store).leftSidebarExpanded =
      internals.localStorage.getItem('leftSidebarExpanded') === 'true';
  }

  if (internals.localStorage.getItem('rightSidebarExpanded') == null) {
    uiStore(store).rightSidebarExpanded = globalThis.innerWidth > 1000;
  } else {
    uiStore(store).rightSidebarExpanded =
      internals.localStorage.getItem('rightSidebarExpanded') === 'true';
  }

  if (internals.localStorage.getItem('leftSidebarWidth') != null) {
    uiStore(store).leftSidebarWidth = Number.parseInt(
      internals.localStorage.getItem('leftSidebarWidth'),
    );
  }

}
