import { negateProp } from '@stdlib/misc';
import { defineStore } from 'pinia';

function trackProp<State>(state: State, prop: Extract<keyof State, string>) {
  watch(
    () => state[prop],
    (value) => {
      const serializedValue =
        typeof value === 'string' ? value : JSON.stringify(value);
      internals.localStorage.setItem(prop, serializedValue);
    },
  );
}

export const useUIStore = defineStore('ui', () => {
  const state = reactive({
    loggedIn: false,

    leftSidebarExpanded: false,
    rightSidebarExpanded: false,

    leftSidebarWidth: 240,

    headerHeight: 0,

    width: 0,
    height: 0,
  });

  trackProp(state, 'leftSidebarExpanded');
  trackProp(state, 'rightSidebarExpanded');

  trackProp(state, 'leftSidebarWidth');

  return {
    ...toRefs(state),

    toggleLeftSidebar() {
      negateProp(state, 'leftSidebarExpanded');

      if (state.leftSidebarExpanded && globalThis.innerWidth < 1065) {
        state.rightSidebarExpanded = false;
      }
    },
    toggleRightSidebar() {
      negateProp(state, 'rightSidebarExpanded');

      if (state.rightSidebarExpanded && globalThis.innerWidth < 1065) {
        state.leftSidebarExpanded = false;
      }
    },

    resetLeftSidebarWidth() {
      state.leftSidebarWidth = 240;
    },
  };
});

export type UIStore = ReturnType<typeof useUIStore>;
