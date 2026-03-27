declare global {
  interface Window {
    clipboardData: any;
  }
}

export async function getClipboardText(): Promise<string> {
  try {
    if (navigator.clipboard?.readText != null) {
      return await navigator.clipboard.readText();
    }

    if ((globalThis as unknown as Window).clipboardData != null) {
      return (globalThis as unknown as Window).clipboardData.getData('Text');
    }

  } catch {
    // Intentionally ignored: clipboard read may be denied or unsupported
  }

  return '';
}

export async function setClipboardText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText != null) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    if ((globalThis as unknown as Window).clipboardData != null) {
      (globalThis as unknown as Window).clipboardData.setData('Text', text);
      return true;
    }

  } catch {
    // Intentionally ignored: clipboard write may be denied or unsupported
  }

  return false;
}
