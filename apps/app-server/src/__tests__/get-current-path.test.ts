import { describe, expect, it, vi } from 'vitest';

function createDataAbstractionMock() {
  const patch = vi.fn().mockResolvedValue(undefined);
  const state = {
    retryMode: false,
  };

  const staticValues = new Map<string, unknown>([
    ['page:exists', true],
    ['user:personal-group-id', 'group-1'],
    ['group:main-page-id', 'main-1'],
    ['user:starting-page-id', 'start-1'],
  ]);
  const hget = vi.fn(async (type: string, id: string, field: string) => {
    const staticValue = staticValues.get(`${type}:${field}`);
    if (staticValue != null) {
      return staticValue;
    }
    if (type !== 'user-page' || field !== 'last-parent-id') {
      return null;
    }
    if (id.endsWith(':page-ok')) {
      return 'main-1';
    }
    if (id.endsWith(':page-fallback')) {
      return state.retryMode ? 'main-1' : 123;
    }
    return null;
  });

  patch.mockImplementation(async () => {
    state.retryMode = true;
  });

  return {
    hget,
    patch,
  };
}

describe('getCurrentPath', () => {
  it('retourne NOT_FOUND si page inexistante', async () => {
    const { getCurrentPath } = await import('src/trpc/api/users/pages/get-current-path');
    const dataAbstraction = {
      hget: vi.fn(async (type: string, _id: string, field: string) => {
        if (type === 'page' && field === 'exists') {
          return false;
        }
        return null;
      }),
      patch: vi.fn(),
    };

    await expect(
      getCurrentPath({
        ctx: { dataAbstraction, userId: 'user-1' } as any,
        input: { initialPageId: 'page-1' },
      } as any),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('retourne le chemin directement quand disponible', async () => {
    const { getCurrentPath } = await import('src/trpc/api/users/pages/get-current-path');
    const dataAbstraction = createDataAbstractionMock();

    const result = await getCurrentPath({
      ctx: { dataAbstraction, userId: 'user-1' } as any,
      input: { initialPageId: 'page-ok' },
    } as any);

    expect(result).toEqual(['main-1', 'page-ok']);
    expect(dataAbstraction.patch).not.toHaveBeenCalled();
  });

  it('corrige last_parent_id puis reessaie', async () => {
    const { getCurrentPath } = await import('src/trpc/api/users/pages/get-current-path');
    const dataAbstraction = createDataAbstractionMock();

    const result = await getCurrentPath({
      ctx: { dataAbstraction, userId: 'user-1' } as any,
      input: { initialPageId: 'page-fallback' },
    } as any);

    expect(dataAbstraction.patch).toHaveBeenCalledWith(
      'user-page',
      'user-1:page-fallback',
      { last_parent_id: 'start-1' },
    );
    expect(result).toEqual(['main-1', 'page-fallback']);
  });
});
