import { boot } from 'quasar/wrappers';

export default boot(({ store }) => {
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

  uiStore(store).currentPathExpanded =
    internals.localStorage.getItem('currentPathExpanded') !== 'false';
  uiStore(store).recentPagesExpanded =
    internals.localStorage.getItem('recentPagesExpanded') !== 'false';
  uiStore(store).favoritePagesExpanded =
    internals.localStorage.getItem('favoritePagesExpanded') === 'true';
  uiStore(store).selectedPagesExpanded =
    internals.localStorage.getItem('selectedPagesExpanded') === 'true';

  uiStore(store).currentPathWeight =
    Number.parseFloat(internals.localStorage.getItem('currentPathWeight')) || 1;
  uiStore(store).recentPagesWeight =
    Number.parseFloat(internals.localStorage.getItem('recentPagesWeight')) || 1;
  uiStore(store).favoritePagesWeight =
    Number.parseFloat(internals.localStorage.getItem('favoritePagesWeight')) ||
    1;
  uiStore(store).selectedPagesWeight =
    Number.parseFloat(internals.localStorage.getItem('selectedPagesWeight')) ||
    1;
});
