import { createComputedDict } from '@stdlib/vue';
import { isObject } from 'lodash';

function _isSlimmableObject(key: any, value: any, defaults: any): boolean {
  return (
    defaults != null &&
    key in defaults &&
    key !== 'value' &&
    key !== 'label' &&
    key !== 'pos' &&
    isObject(value) &&
    !('push' in value)
  );
}

export function makeSlim<T extends object>(root: T, defaults: T): T {
  for (const [key, value] of Object.entries(root)) {
    const defaultValue = (defaults as any)?.[key];

    if (value === defaultValue) {
      delete (root as any)[key];
    } else if (_isSlimmableObject(key, value, defaults)) {
      makeSlim(value, defaultValue);

      if (Object.keys(value).length === 0) {
        delete (root as any)[key];
      }
    }
  }

  return root as any;
}

type WrapSlimAux = {
  prev?: WrapSlimAux;

  key?: string;
  value: any;
};

function createDefaultWrapSlimAux<T extends object>(root: T): WrapSlimAux {
  return { value: root };
}

function handleSetDefaultValue(aux: WrapSlimAux, key: string): void {
  if (aux.value == null) return;
  if (!(key in aux.value)) return;
  delete aux.value[key];
  let curr: WrapSlimAux = aux;
  while (curr.prev != null && Object.keys(curr.value).length === 0) {
    curr.value = null;
    if (curr.key != null) {
      delete curr.prev.value[curr.key];
    }
    curr = curr.prev;
  }
}

function restoreAuxPath(aux: WrapSlimAux, key: string, value: any) {
  const path = [aux];
  let curr: WrapSlimAux = aux;
  while (true) {
    const prev = curr?.prev;
    const currKey = curr.key;
    if (
      prev == null ||
      (prev.value != null && currKey != null && currKey in prev.value)
    ) {
      break;
    }
    path.push(prev);
    curr = prev;
  }
  for (let i = path.length - 2; i >= 0; i--) {
    const prev = path[i + 1];
    const curr = path[i];
    if (curr.key == null) {
      continue;
    }
    prev.value[curr.key] = {};
    curr.value = prev.value[curr.key];
  }
  aux.value[key] = value;
}

export function wrapSlim<T extends object>(
  root: T,
  defaults: any,
  aux: WrapSlimAux = createDefaultWrapSlimAux(root),
): T {
  const computedDict = createComputedDict<keyof T>({
    get: (key) => {
      const value = root[key] ?? defaults?.[key];

      if (!_isSlimmableObject(key, value, defaults)) {
        return value;
      }

      return wrapSlim(value ?? {}, defaults[key], {
        prev: aux,
        key: key as string,
        value: root[key],
      });
    },
    set: (key: keyof T, value: any) => {
      if (value === defaults?.[key]) {
        handleSetDefaultValue(aux, key as string);
        return;
      }
      if (aux.value == null) {
        restoreAuxPath(aux, key as string, value);
      } else {
        aux.value[key] = value;
      }
    },
  });

  return new Proxy(defaults ?? root, {
    get(_, prop) {
      return computedDict(prop as keyof T).value;
    },
    getOwnPropertyDescriptor(target, prop) {
      return Reflect.getOwnPropertyDescriptor(target, prop);
    },
    has(target, prop) {
      return Reflect.has(target, prop);
    },
    ownKeys(target) {
      return Reflect.ownKeys(target);
    },
    set(_, prop, value) {
      computedDict(prop as keyof T).value = value;

      return true;
    },
  });
}
