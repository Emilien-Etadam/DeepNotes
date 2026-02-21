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

    if (document.queryCommandSupported?.('paste')) {
      const elem = document.createElement('textarea');

      document.body.appendChild(elem);

      elem.focus();

      document.execCommand('paste');

      const text = elem.value;

      document.body.removeChild(elem);

      return text;
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

    if (document.queryCommandSupported?.('copy')) {
      const elem = document.createElement('span');

      elem.textContent = text;

      elem.style.whiteSpace = 'pre';
      elem.style.webkitUserSelect = 'auto';
      elem.style.userSelect = 'all';

      document.body.appendChild(elem);

      const selection = (globalThis as unknown as Window).getSelection();
      const range = document.createRange();
      selection?.removeAllRanges();
      range.selectNode(elem);
      selection?.addRange(range);

      document.execCommand('copy');

      selection?.removeAllRanges();
      document.body.removeChild(elem);

      return (await getClipboardText()) === text;
    }
  } catch {
    // Intentionally ignored: clipboard write may be denied or unsupported
  }

  return false;
}
