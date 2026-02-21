import {
  getClipboardText as _getClipboardText,
  setClipboardText as _setClipboardText,
} from '@stdlib/misc';

export async function getClipboardText(): Promise<string> {
  return await _getClipboardText();
}

export async function setClipboardText(text: string): Promise<void> {
  await _setClipboardText(text);
}
