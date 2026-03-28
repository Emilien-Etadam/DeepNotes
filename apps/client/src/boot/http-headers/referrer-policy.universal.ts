import type { BootContext } from '../boot-context';

export async function setup({ ssrContext }: BootContext) {
  ssrContext?.res.setHeader('Referrer-Policy', 'no-referrer');
}
