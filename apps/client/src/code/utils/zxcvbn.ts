/**
 * Lazy-loaded zxcvbn: le bundle @zxcvbn-ts (~1.7 MB) n'est chargé que lorsque
 * l'utilisateur interagit avec un champ mot de passe (register, change-password,
 * création de groupe protégé, etc.).
 */

export interface ZxcvbnResult {
  score: number;
  feedback: { suggestions: string[]; warning: string };
}

let cachedZxcvbn: ((password: string) => ZxcvbnResult) | null = null;

async function loadZxcvbn(): Promise<(password: string) => ZxcvbnResult> {
  if (cachedZxcvbn != null) return cachedZxcvbn;
  const [core, common, en] = await Promise.all([
    import('@zxcvbn-ts/core'),
    import('@zxcvbn-ts/language-common'),
    import('@zxcvbn-ts/language-en'),
  ]);
  core.zxcvbnOptions.setOptions({
    translations: en.translations,
    graphs: common.adjacencyGraphs,
    dictionary: {
      ...common.dictionary,
      ...en.dictionary,
    },
  });
  cachedZxcvbn = core.zxcvbn as (password: string) => ZxcvbnResult;
  return cachedZxcvbn;
}

export async function zxcvbnAsync(password: string): Promise<ZxcvbnResult> {
  const zxcvbn = await loadZxcvbn();
  return zxcvbn(password);
}
