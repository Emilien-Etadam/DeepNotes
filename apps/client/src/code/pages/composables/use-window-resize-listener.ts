export function useWindowResizeListener() {
  onMounted(() => {
    onResize();

    globalThis.addEventListener('resize', onResize);
  });

  function onResize() {
    if (
      globalThis.innerWidth < 1080 &&
      uiStore().leftSidebarExpanded &&
      uiStore().rightSidebarExpanded
    ) {
      mainLogger.sub('useWindowResizeListener').info('Collapse right sidebar');

      uiStore().rightSidebarExpanded = false;
    }
  }

  onBeforeUnmount(() => {
    globalThis.removeEventListener('resize', onResize);
  });
}
