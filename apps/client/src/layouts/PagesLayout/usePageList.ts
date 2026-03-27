import { pluralS } from '@stdlib/misc';
import type { QNotifyUpdateOptions } from 'quasar';
import { deletePage } from 'src/code/areas/api-interface/pages/deletion/delete';
import { deletePagePermanently } from 'src/code/areas/api-interface/pages/deletion/delete-permanently';
import { movePage } from 'src/code/areas/api-interface/pages/move';
import { asyncDialog, handleError } from 'src/code/utils/misc';
import DeletionDialog from 'src/components/DeletionDialog.vue';

import MovePageDialog from './RightSidebar/PageProperties/MovePageDialog.vue';

export function usePageList({
  getSelectedPageIds,
  getGroupId,
}: {
  getSelectedPageIds: () => string[];
  getGroupId: () => string;
}) {
  async function movePages() {
    try {
      const movePageParams: Parameters<typeof movePage>[0] = await asyncDialog({
        component: MovePageDialog,

        componentProps: {
          groupId: getGroupId(),
        },
      });

      const notif = $quasar().notify({
        group: false,
        timeout: 0,
        message: 'Moving pages...',
      });

      const selectedPageIds = getSelectedPageIds().slice();

      let numSuccess = 0;
      let numFailed = 0;

      for (const [index, pageId] of selectedPageIds.entries()) {
        try {
          notif({
            caption: `${index} of ${selectedPageIds.length}`,
          });

          await movePage({
            ...movePageParams,

            pageId,
          });

          numSuccess++;
        } catch (error: unknown) {
          mainLogger.error('Failed to move page', error);
          numFailed++;
        }
      }

      let notifUpdateOptions: QNotifyUpdateOptions = {
        timeout: undefined,
        caption: undefined,
      };

      if (numFailed === 0) {
        notifUpdateOptions = {
          ...notifUpdateOptions,
          message: `Page${pluralS(numSuccess)} moved successfully.`,
          color: 'positive',
        };
      } else {
        notifUpdateOptions = {
          ...notifUpdateOptions,
          message: `${numSuccess > 0 ? numSuccess : 'No'} page${
            numSuccess === 1 ? ' was' : 's were'
          } moved successfully.<br/>Failed to move ${numFailed} page${pluralS(
            numFailed,
          )}.`,
          color: 'negative',
          html: true,
        };
      }

      notif(notifUpdateOptions);
    } catch (_error) {
      handleError(_error);
    }
  }

  async function deletePages() {
    try {
      const { deletePermanently } = await asyncDialog({
        component: DeletionDialog,
        componentProps: { subject: 'pages' },
      });

      const notif = $quasar().notify({
        group: false,
        timeout: 0,
        message: 'Deleting pages...',
      });

      const selectedPageIds = getSelectedPageIds().slice();

      let numSuccess = 0;
      let numFailed = 0;

      for (const [index, pageId] of selectedPageIds.entries()) {
        try {
          notif({
            caption: `${index} of ${selectedPageIds.length}`,
          });

          if (deletePermanently) {
            await deletePagePermanently(pageId);
          } else {
            await deletePage(pageId);
          }

          numSuccess++;
        } catch (error: unknown) {
          mainLogger.error('Failed to delete page', error);
          numFailed++;
        }
      }

      let notifUpdateOptions: QNotifyUpdateOptions = {
        timeout: undefined,
        caption: undefined,
      };

      if (numFailed === 0) {
        notifUpdateOptions = {
          ...notifUpdateOptions,
          message: `Page${pluralS(numSuccess)} deleted successfully.`,
          color: 'positive',
        };
      } else {
        notifUpdateOptions = {
          ...notifUpdateOptions,
          message: `${numSuccess > 0 ? numSuccess : 'No'} page${
            numSuccess === 1 ? ' was' : 's were'
          } deleted successfully.<br/>Failed to delete ${numFailed} page${pluralS(
            numFailed,
          )}.`,
          color: 'negative',
          html: true,
        };
      }

      notif(notifUpdateOptions);
    } catch (_error) {
      handleError(_error);
    }
  }

  return {
    movePages,
    deletePages,
  };
}
