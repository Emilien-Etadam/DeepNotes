import { useEventListener } from '@vueuse/core';

export function useImagePasting() {
  useEventListener(
    'paste',
    async (event: ClipboardEvent) => {
      const target = event.target as HTMLElement;

      if (
        target.closest('.ProseMirror') == null ||
        (event.clipboardData?.files?.length ?? 0) === 0
      ) {
        return;
      }

      mainLogger.sub('useImagePasting').info('Perform');

      const clipboardFiles = event.clipboardData?.files;
      if (clipboardFiles == null) {
        return;
      }

      for (const file of Array.from(clipboardFiles)) {
        if (!file.type.startsWith('image/')) {
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          showNotify({
            message: 'Cannot upload images larger than 5MB.',
            color: 'negative',
          });
          continue;
        }

        const reader = new FileReader();

        reader.addEventListener('loadend', (event) => {
          const src = event.target?.result;
          if (typeof src !== 'string') {
            return;
          }

          internals.pages.react.page.selection.format((chain) =>
            chain.setImage({
              src,
            }),
          );
        });

        reader.readAsDataURL(file);
      }

      event.preventDefault();
    },
    { capture: true },
  );
}
