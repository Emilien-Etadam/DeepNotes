function onWindowResize() {
  if (
    globalThis.innerWidth < 1080 &&
    uiStore().leftSidebarExpanded &&
    uiStore().rightSidebarExpanded
  ) {
    mainLogger.sub('useWindowResizeListener').info('Collapse right sidebar');
    uiStore().rightSidebarExpanded = false;
  }
}

export function useWindowResizeListener() {
  onMounted(() => {
    onWindowResize();

    globalThis.addEventListener('resize', onWindowResize);
  });

  onBeforeUnmount(() => {
    globalThis.removeEventListener('resize', onWindowResize);
  });
}
