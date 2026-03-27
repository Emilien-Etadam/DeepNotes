type TitleStatus = 'unknown' | 'encrypted' | 'success';

type PageTitleValue = {
  text: string;
  status: TitleStatus;
};

type PageTitlesFactoryDeps = {
  DataLayer: {
    Raw: unknown;
  };
  bytesToText: (value: unknown) => string;
  textToBytes: (value: unknown) => unknown;
  createSmartComputedDict: <K, V>(config: {
    get: (key: K) => V;
    set: (key: K, value: any) => void;
    initialValue: V;
  }) => unknown;
  once: <T>(fn: () => T) => () => T;
  pageGroupIds: () => (pageId: string) => {
    get: () => string | null | undefined;
  };
  pageKeyrings: () => (key: string) => {
    get: () => any;
    getAsync: () => Promise<any>;
  };
};

type PageTitlesFactoryParams = {
  loggerKey: string;
  encryptedField: 'encrypted-absolute-title' | 'encrypted-relative-title';
  associatedDataContext: 'PageAbsoluteTitle' | 'PageRelativeTitle';
};

export const createPageTitles = (
  deps: PageTitlesFactoryDeps,
  params: PageTitlesFactoryParams,
) => {
  const _getLogger = mainLogger.sub(`${params.loggerKey}.get`);
  const _setLogger = mainLogger.sub(`${params.loggerKey}.set`);

  return deps.once(() =>
    deps.createSmartComputedDict<string, PageTitleValue>({
      get: (pageId) => {
        if (pageId == null) {
          _getLogger.info('No valid page ID');

          return { text: '[Unknown page]', status: 'unknown' };
        }

        const pageEncryptedTitle = internals.realtime.globalCtx.hget(
          'page',
          pageId,
          params.encryptedField,
        );

        const pagePermanentDeletionDate = internals.realtime.globalCtx.hget(
          'page',
          pageId,
          'permanent-deletion-date',
        );

        const groupId = deps.pageGroupIds()(pageId).get();

        const groupPermanentDeletionDate = internals.realtime.globalCtx.hget(
          'group',
          groupId,
          'permanent-deletion-date',
        );

        if (pageEncryptedTitle == null) {
          _getLogger.info(`${pageId}: No encrypted page title found`);

          return { text: `[Page ${pageId}]`, status: 'unknown' };
        }

        if (
          pagePermanentDeletionDate != null &&
          pagePermanentDeletionDate < new Date()
        ) {
          _getLogger.info(`${pageId}: Page is permanently deleted`);

          return { text: `[Page ${pageId}]`, status: 'unknown' };
        }

        if (groupId == null) {
          mainLogger.info(`${pageId}: No group ID found`);

          return { text: `[Page ${pageId}]`, status: 'unknown' };
        }

        if (
          groupPermanentDeletionDate != null &&
          groupPermanentDeletionDate < new Date()
        ) {
          _getLogger.info(`${pageId}: Group is permanently deleted`);

          return { text: `[Page ${pageId}]`, status: 'unknown' };
        }

        const pageKeyring = deps.pageKeyrings()(`${groupId}:${pageId}`).get();

        if (pageKeyring?.topLayer !== deps.DataLayer.Raw) {
          _getLogger.info(`${pageId}: No valid page keyring found`);

          return { text: '[Encrypted page]', status: 'encrypted' };
        }

        try {
          const title = deps.bytesToText(
            pageKeyring.decrypt(pageEncryptedTitle, {
              padding: true,
              associatedData: {
                context: params.associatedDataContext,
                pageId,
              },
            }),
          );

          _getLogger.info(`${pageId}: ${title}`);

          return { text: title, status: 'success' };
        } catch (error) {
          _getLogger.error(error);
          _getLogger.info(`${pageId}: Failed to decrypt page title`);

          return { text: '[Failed to decrypt]', status: 'success' };
        }
      },
      set: (pageId, value: any) => {
        (async () => {
          if (pageId == null) {
            _setLogger.info(`${pageId}: No valid page ID`);

            return;
          }

          const groupId = await internals.realtime.globalCtx.hgetAsync(
            'page',
            pageId,
            'group-id',
          );

          if (groupId == null) {
            _setLogger.info(`${pageId}: No group ID found`);

            return;
          }

          const pageKeyring = await deps
            .pageKeyrings()(`${groupId}:${pageId}`)
            .getAsync();

          if (pageKeyring == null) {
            _setLogger.info(`${pageId}: No valid page keyring found`);

            return;
          }

          const pageEncryptedTitle = pageKeyring.encrypt(
            deps.textToBytes(value),
            {
              padding: true,
              associatedData: {
                context: params.associatedDataContext,
                pageId,
              },
            },
          );

          internals.realtime.hset(
            'page',
            pageId,
            params.encryptedField,
            pageEncryptedTitle,
          );

          _setLogger.info(`${pageId}: ${value}`);
        })().catch((err) => _setLogger.error(err));
      },
      initialValue: { text: '[Unknown page]', status: 'unknown' },
    }),
  );
};
