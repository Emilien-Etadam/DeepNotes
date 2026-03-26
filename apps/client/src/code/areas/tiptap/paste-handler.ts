import type { Fragment, Slice } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';

async function embedImageToDataUrl(
  node: { attrs: { src: string } },
  clipboardData: DataTransfer | null,
) {
  let imageBlob: Blob | undefined;

  if (clipboardData?.files.length) {
    imageBlob = clipboardData.files[0];
  }

  if (imageBlob == null) {
    const response = await fetch(node.attrs.src);
    imageBlob = await response.blob();
  }

  const reader = new FileReader();
  await new Promise<void>((resolve) => {
    reader.addEventListener('loadend', (ev) => {
      const result = ev.target?.result;
      if (typeof result === 'string') {
        node.attrs.src = result;
      }
      resolve();
    });
    reader.readAsDataURL(imageBlob);
  });
}

export const ProsemirrorPasteHandlerPlugin = new Plugin({
  props: {
    handlePaste(view: EditorView, event: ClipboardEvent, slice: Slice) {
      async function processNode(
        node: any,
        embedImagesRec: (content: Fragment) => Promise<void>,
      ) {
        try {
          if (node.type.name === 'image') {
            if (node.attrs.src.startsWith('data:image')) {
              return;
            }
            await embedImageToDataUrl(node, event.clipboardData);
          } else {
            await embedImagesRec(node.content);
          }
        } catch (error) {
          mainLogger.error(error);
        }
      }

      async function embedImages(content: Fragment) {
        await Promise.all(
          content.map((node) => processNode(node, embedImages)),
        );
      }

      void embedImages(slice.content).then(() => {
        const { state } = view;
        const { tr } = state;

        view.dispatch(tr.replaceSelection(slice).scrollIntoView());
      });

      return true;
    },
  },
});
