import type { Fragment, Slice } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';

export const ProsemirrorPasteHandlerPlugin = new Plugin({
  props: {
    handlePaste(view: EditorView, event: ClipboardEvent, slice: Slice) {
      async function embedImageToDataUrl(node: any, clipboardData: DataTransfer) {
        let imageBlob: Blob | undefined;

        if (clipboardData.files.length > 0) {
          imageBlob = clipboardData.files[0];
        }

        if (imageBlob == null) {
          const response = await fetch(node.attrs.src);
          imageBlob = await response.blob();
        }

        const reader = new FileReader();
        await new Promise<void>((resolve) => {
          reader.addEventListener('loadend', (ev) => {
            (node.attrs as any).src = ev.target!.result;
            resolve();
          });
          reader.readAsDataURL(imageBlob!);
        });
      }

      async function processNode(
        node: any,
        embedImagesRec: (content: Fragment) => Promise<void>,
      ) {
        try {
          if (node.type.name === 'image') {
            if (node.attrs.src.startsWith('data:image')) {
              return;
            }
            await embedImageToDataUrl(node, event.clipboardData!);
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
