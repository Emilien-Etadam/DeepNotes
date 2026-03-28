import { defineStore } from 'pinia';
import type { Component } from 'vue';
import { markRaw, ref } from 'vue';

export type DialogButtonOpts = {
  label?: string;
  flat?: boolean;
  color?: string;
};

/** Options for confirm / prompt / component dialogs (Quasar-compatible subset). */
export type DialogOptions = {
  title?: string;
  message?: string;
  html?: boolean;
  prompt?: { type?: string; model: string; filled?: boolean };
  cancel?: boolean | DialogButtonOpts;
  ok?: boolean | DialogButtonOpts;
  focus?: 'ok' | 'cancel' | 'none';
  style?: string | Record<string, unknown>;
  color?: string;
  component?: Component;
  componentProps?: Record<string, unknown>;
};

export interface AppDialogChain {
  onOk: (fn: (payload?: unknown) => void) => AppDialogChain;
  onCancel: (fn: () => void) => AppDialogChain;
  onDismiss: (fn: () => void) => AppDialogChain;
}

interface ComponentLayer {
  id: number;
  component: Component;
  props: Record<string, unknown>;
  onOk: Array<(p?: unknown) => void>;
  onCancel: Array<() => void>;
  onDismiss: Array<() => void>;
}

export const useDialogStore = defineStore('dialog', () => {
  const confirmOpen = ref(false);
  const confirmOpts = ref<DialogOptions | null>(null);
  const promptModel = ref('');
  const confirmMode = ref<'promise' | 'callback' | null>(null);
  let promiseResolve: ((v?: unknown) => void) | null = null;
  let promiseReject: ((e?: unknown) => void) | null = null;
  const chainOnOk: Array<(p?: unknown) => void> = [];
  const chainOnCancel: Array<() => void> = [];
  const chainOnDismiss: Array<() => void> = [];

  const componentLayers = ref<ComponentLayer[]>([]);
  let nextLayerId = 0;

  function resetConfirmState() {
    confirmOpen.value = false;
    confirmOpts.value = null;
    confirmMode.value = null;
    promiseResolve = null;
    promiseReject = null;
    chainOnOk.length = 0;
    chainOnCancel.length = 0;
    chainOnDismiss.length = 0;
  }

  function openConfirmPromise(opts: DialogOptions): Promise<unknown> {
    return new Promise((resolve, reject) => {
      resetConfirmState();
      confirmOpts.value = opts;
      promptModel.value = opts.prompt?.model ?? '';
      confirmMode.value = 'promise';
      promiseResolve = resolve;
      promiseReject = reject;
      confirmOpen.value = true;
    });
  }

  function openChainableConfirm(opts: DialogOptions): AppDialogChain {
    resetConfirmState();
    confirmOpts.value = opts;
    promptModel.value = opts.prompt?.model ?? '';
    confirmMode.value = 'callback';
    confirmOpen.value = true;

    const chain: AppDialogChain = {
      onOk(fn) {
        chainOnOk.push(fn);
        return chain;
      },
      onCancel(fn) {
        chainOnCancel.push(fn);
        return chain;
      },
      onDismiss(fn) {
        chainOnDismiss.push(fn);
        return chain;
      },
    };
    return chain;
  }

  function confirmOk() {
    const opts = confirmOpts.value;
    if (!confirmOpen.value || opts == null) {
      return;
    }

    const value = opts.prompt != null ? promptModel.value : true;

    confirmOpen.value = false;
    const mode = confirmMode.value;

    if (mode === 'promise') {
      promiseResolve?.(value);
    } else {
      chainOnOk.forEach((fn) => {
        fn(value);
      });
      chainOnDismiss.forEach((fn) => {
        fn();
      });
    }

    resetConfirmState();
  }

  function confirmCancel() {
    if (!confirmOpen.value) {
      return;
    }

    confirmOpen.value = false;
    const mode = confirmMode.value;

    if (mode === 'promise') {
      promiseReject?.(new Error('Dialog was cancelled.'));
    } else {
      chainOnCancel.forEach((fn) => {
        fn();
      });
      chainOnDismiss.forEach((fn) => {
        fn();
      });
    }

    resetConfirmState();
  }

  function pushComponentLayer(opts: DialogOptions): AppDialogChain {
    const id = ++nextLayerId;
    const layer: ComponentLayer = {
      id,
      component: markRaw(opts.component!),
      props: opts.componentProps ?? {},
      onOk: [],
      onCancel: [],
      onDismiss: [],
    };
    componentLayers.value.push(layer);

    const chain: AppDialogChain = {
      onOk(fn) {
        layer.onOk.push(fn);
        return chain;
      },
      onCancel(fn) {
        layer.onCancel.push(fn);
        return chain;
      },
      onDismiss(fn) {
        layer.onDismiss.push(fn);
        return chain;
      },
    };
    return chain;
  }

  function openComponentPromise(opts: DialogOptions): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const id = ++nextLayerId;
      const layer: ComponentLayer = {
        id,
        component: markRaw(opts.component!),
        props: opts.componentProps ?? {},
        onOk: [resolve],
        onCancel: [() => reject(new Error('Dialog was cancelled.'))],
        onDismiss: [],
      };
      componentLayers.value.push(layer);
    });
  }

  function openDialogAsync(opts: DialogOptions): Promise<unknown> {
    if (opts.component != null) {
      return openComponentPromise(opts);
    }
    return openConfirmPromise(opts);
  }

  function appDialog(opts: DialogOptions): AppDialogChain {
    if (opts.component != null) {
      return pushComponentLayer(opts);
    }
    return openChainableConfirm(opts);
  }

  function resolveLayerOk(layerId: number, payload?: unknown) {
    const layers = componentLayers.value;
    const top = layers[layers.length - 1];
    if (top == null || top.id !== layerId) {
      return;
    }
    top.onOk.forEach((fn) => {
      fn(payload);
    });
    top.onDismiss.forEach((fn) => {
      fn();
    });
    layers.pop();
  }

  function resolveLayerCancel(layerId: number) {
    const layers = componentLayers.value;
    const top = layers[layers.length - 1];
    if (top == null || top.id !== layerId) {
      return;
    }
    top.onCancel.forEach((fn) => {
      fn();
    });
    top.onDismiss.forEach((fn) => {
      fn();
    });
    layers.pop();
  }

  return {
    confirmOpen,
    confirmOpts,
    promptModel,
    componentLayers,
    openDialogAsync,
    appDialog,
    confirmOk,
    confirmCancel,
    resolveLayerOk,
    resolveLayerCancel,
  };
});
