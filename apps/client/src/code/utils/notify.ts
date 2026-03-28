import { useNotifyStore } from 'src/stores/notify-store';

const legacyColorMap: Record<string, string> = {
  positive: 'success',
  negative: 'error',
  warning: 'warning',
  info: 'info',
};

function typeToColor(type?: string, color?: string): string | undefined {
  if (type === 'positive') {
    return 'success';
  }
  if (type === 'negative') {
    return 'error';
  }
  if (type === 'warning') {
    return 'warning';
  }
  if (type === 'info') {
    return 'info';
  }
  if (color != null && legacyColorMap[color] != null) {
    return legacyColorMap[color];
  }
  return color;
}

export function showNotify(opts: {
  message: string;
  color?: string;
  type?: string;
  html?: boolean;
  timeout?: number;
  caption?: string;
  group?: boolean;
}): (update?: Record<string, unknown>) => void {
  const store = useNotifyStore();
  const timeoutMs =
    opts.timeout === 0 ? 0 : (opts.timeout ?? 5000);

  const id = store.push({
    message: opts.message,
    color: typeToColor(opts.type, opts.color) ?? opts.color,
    type: opts.type,
    html: opts.html,
    timeoutMs,
    caption: opts.caption,
    group: opts.group,
  });

  if (timeoutMs > 0) {
    setTimeout(() => {
      store.remove(id);
    }, timeoutMs);
  }

  return (update) => {
    if (update == null) {
      return;
    }
    const patch = { ...update } as Record<string, unknown> & {
      type?: string;
      color?: string;
    };
    if ('type' in patch || 'color' in patch) {
      patch.color =
        typeToColor(patch.type, patch.color) ?? (patch.color as string);
    }
    store.update(id, patch as any);
  };
}
