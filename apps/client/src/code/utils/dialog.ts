import { useDialogStore } from 'src/stores/dialog-store';
import type { AppDialogChain, DialogOptions } from 'src/stores/dialog-store';

export type {
  AppDialogChain,
  DialogButtonOpts,
  DialogOptions,
} from 'src/stores/dialog-store';

export function appDialog(opts: DialogOptions): AppDialogChain {
  return useDialogStore().appDialog(opts);
}
