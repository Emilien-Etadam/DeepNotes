import type { ComponentPublicInstance } from 'vue';

/** Mirrors legacy programmatic dialog: call `show()` on the mounted component tree. */
export function applyProgrammaticDialogShow(vm: ComponentPublicInstance | null) {
  const inst = vm as any;
  if (inst == null) {
    return;
  }

  if (typeof inst.show === 'function') {
    inst.show();
    return;
  }

  const sub = inst.$?.subTree;
  let c = sub?.component;

  if (c?.exposed?.show != null) {
    c.exposed.show();
    return;
  }

  c = c?.subTree?.component;
  if (c?.exposed?.show != null) {
    c.exposed.show();
    return;
  }

  if (typeof c?.proxy?.show === 'function') {
    c.proxy.show();
  }
}
