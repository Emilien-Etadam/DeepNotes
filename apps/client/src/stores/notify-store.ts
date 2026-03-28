import { defineStore } from 'pinia';
import { nanoid } from 'nanoid';

export interface NotifyItem {
  id: string;
  message: string;
  color?: string;
  type?: string;
  html?: boolean;
  timeoutMs: number;
  caption?: string;
  group?: boolean;
}

export const useNotifyStore = defineStore('notify', {
  state: () => ({
    items: [] as NotifyItem[],
  }),
  actions: {
    push(item: Omit<NotifyItem, 'id'> & { id?: string }) {
      const id = item.id ?? nanoid();
      this.items.push({ ...item, id });
      return id;
    },
    update(id: string, patch: Partial<NotifyItem>) {
      const row = this.items.find((x) => x.id === id);
      if (row != null) {
        Object.assign(row, patch);
      }
    },
    remove(id: string) {
      const i = this.items.findIndex((x) => x.id === id);
      if (i >= 0) {
        this.items.splice(i, 1);
      }
    },
  },
});
