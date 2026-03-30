import { useEventListener } from '@vueuse/core';

export function useTouchscreenPointerCaptureRelease() {
  useEventListener(
    'pointerdown',
    (event) => {
      if (event.pointerType !== 'touch') return;
      const target = event.target as Element;
      if (!target?.hasPointerCapture?.(event.pointerId)) return;
      if (target?.closest?.('.v-toolbar')) return;
      if (!target?.releasePointerCapture) return;
      try {
        target.releasePointerCapture(event.pointerId);
        mainLogger
          .sub('useTouchscreenPointerCaptureRelease')
          .info('Release pointer capture');
      } catch {
        // leave event chain intact
      }
    },
    { capture: true },
  );
}
