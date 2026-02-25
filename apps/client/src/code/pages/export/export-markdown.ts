import { yXmlFragmentToProsemirrorJSON } from 'y-prosemirror';

import type { Page } from '../page';
import type { PageArrow } from '../page/arrows/arrow';
import type { PageNote } from '../page/notes/note';
import { getPageTitle } from '../utils';
import type { Y } from '@syncedstore/core';

/** Noeud ProseMirror JSON (structure typique de y-prosemirror) */
interface PMNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: PMNode[];
  text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
}

/**
 * Extrait le texte d'un Y.XmlFragment en le convertissant en Markdown.
 * Utilise le JSON ProseMirror pour gérer paragraph, heading, listes, codeBlock, blockquote, etc.
 */
export function extractText(fragment: Y.XmlFragment): string {
  try {
    const json = yXmlFragmentToProsemirrorJSON(fragment) as { content?: PMNode[] };
    const content = json?.content;
    if (!Array.isArray(content) || content.length === 0) {
      return '';
    }
    return nodesToMarkdown(content);
  } catch {
    return '';
  }
}

function nodesToMarkdown(nodes: PMNode[], listContext?: { kind: 'bullet' | 'ordered'; index: number }): string {
  const lines: string[] = [];
  let orderedIndex = listContext?.kind === 'ordered' ? listContext.index : 0;

  for (const node of nodes) {
    switch (node.type) {
      case 'paragraph': {
        const text = inlineContentToText(node.content);
        if (text) lines.push(text);
        else lines.push('');
        break;
      }
      case 'heading': {
        const level = (node.attrs?.level as number) ?? 1;
        const prefix = '#'.repeat(Math.min(6, Math.max(1, level)));
        const text = inlineContentToText(node.content);
        lines.push(`${prefix} ${text}`);
        break;
      }
      case 'bulletList': {
        const items = node.content ?? [];
        items.forEach((item, i) => {
          const itemLines = listItemToMarkdown(item, 'bullet', 0);
          lines.push(...itemLines);
        });
        break;
      }
      case 'orderedList': {
        const start = (node.attrs?.order as number) ?? 1;
        const items = node.content ?? [];
        items.forEach((item, i) => {
          const itemLines = listItemToMarkdown(item, 'ordered', start + i);
          lines.push(...itemLines);
        });
        break;
      }
      case 'listItem': {
        const itemLines = listItemToMarkdown(node, listContext?.kind ?? 'bullet', listContext?.index ?? orderedIndex++);
        lines.push(...itemLines);
        break;
      }
      case 'codeBlock': {
        const lang = (node.attrs?.language as string) || '';
        const code = inlineContentToText(node.content, true);
        lines.push('```' + lang, code || '', '```');
        break;
      }
      case 'blockquote': {
        const inner = nodesToMarkdown(node.content ?? []);
        inner.split('\n').forEach((line) => lines.push('> ' + line));
        break;
      }
      case 'horizontalRule':
        lines.push('---');
        break;
      case 'taskList': {
        const items = node.content ?? [];
        items.forEach((item) => {
          const taskLines = taskItemToMarkdown(item);
          lines.push(...taskLines);
        });
        break;
      }
      case 'taskItem': {
        const taskLines = taskItemToMarkdown(node);
        lines.push(...taskLines);
        break;
      }
      default: {
        if (node.content) {
          lines.push(nodesToMarkdown(node.content, listContext));
        } else if (node.text != null) {
          lines.push(node.text);
        }
        break;
      }
    }
  }

  return lines.join('\n');
}

function listItemToMarkdown(item: PMNode, kind: 'bullet' | 'ordered', index: number): string[] {
  const lines: string[] = [];
  const prefix = kind === 'ordered' ? `${index}. ` : '- ';
  const content = item.content ?? [];
  let first = true;
  for (const node of content) {
    if (node.type === 'paragraph') {
      const text = inlineContentToText(node.content);
      lines.push((first ? prefix : '  ') + text);
      first = false;
    } else if (node.type === 'bulletList' || node.type === 'orderedList') {
      const subLines = nodesToMarkdown([node]);
      subLines.split('\n').forEach((line) => lines.push('  ' + line));
    } else if (node.content) {
      const sub = nodesToMarkdown(node.content);
      sub.split('\n').forEach((line) => lines.push((first ? prefix : '  ') + line));
      first = false;
    }
  }
  if (first) lines.push(prefix);
  return lines;
}

function taskItemToMarkdown(node: PMNode): string[] {
  const checked = node.attrs?.checked === true;
  const prefix = checked ? '- [x] ' : '- [ ] ';
  const content = node.content ?? [];
  const firstBlock = content.find((n) => n.type === 'paragraph');
  const text = firstBlock ? inlineContentToText(firstBlock.content) : '';
  return [prefix + text];
}

function inlineContentToText(content: PMNode[] | undefined, preserveNewlines?: boolean): string {
  if (!content?.length) return '';
  const parts: string[] = [];
  for (const node of content) {
    if (node.type === 'text') {
      let t = node.text ?? '';
      if (node.marks?.some((m) => m.type === 'code')) {
        t = '`' + t + '`';
      }
      parts.push(t);
    } else if (node.type === 'hardBreak') {
      parts.push(preserveNewlines ? '\n' : ' ');
    } else if (node.content) {
      parts.push(inlineContentToText(node.content, preserveNewlines));
    }
  }
  return parts.join('');
}

/**
 * Exporte une note en Markdown (titre + corps + enfants récursifs).
 */
export function exportNote(note: PageNote, depth: number): string {
  const headingLevel = Math.min(6, depth + 1);
  const prefix = '#'.repeat(headingLevel);

  const headFragment = note.react.collab.head?.value;
  const headText = headFragment ? extractText(headFragment).trim() : '';
  const headLine = headText ? `${prefix} ${headText}` : `${prefix} (sans titre)`;

  const bodyFragment = note.react.collab.body?.value;
  const bodyText = bodyFragment ? extractText(bodyFragment).trim() : '';

  const parts: string[] = [headLine];
  if (bodyText) parts.push('', bodyText);

  const childNotes = note.react.notes ?? [];
  if (childNotes.length > 0) {
    for (const child of childNotes) {
      parts.push('', exportNote(child, depth + 1));
    }
  }

  return parts.join('\n');
}

/**
 * Exporte les flèches de la page au format "[source head] → [target head]".
 * Récupère les flèches racine de la page.
 */
export function exportArrows(page: Page): string {
  const arrows: PageArrow[] = [];
  const collectArrows = (region: Page | PageNote) => {
    for (const a of region.react.arrows) {
      arrows.push(a);
    }
    for (const note of region.react.notes) {
      if (note.react.collab.container?.enabled) {
        collectArrows(note);
      }
    }
  };
  collectArrows(page);

  if (arrows.length === 0) return '';

  const getHeadPreview = (note: PageNote): string => {
    const headFragment = note.react.collab.head?.value;
    const text = headFragment ? extractText(headFragment).trim() : '';
    return text || '(sans titre)';
  };

  const lines = arrows.map((arrow) => {
    const source = arrow.react.sourceNote;
    const target = arrow.react.targetNote;
    const srcHead = source ? getHeadPreview(source) : '?';
    const tgtHead = target ? getHeadPreview(target) : '?';
    return `- [${srcHead}] → [${tgtHead}]`;
  });

  return ['---', '', '## Connections', '', ...lines].join('\n');
}

/**
 * Exporte toute la page en Markdown structuré (titre page, notes racine, connexions).
 */
export function exportPageToMarkdown(page: Page): string {
  const titleResult = getPageTitle(page.id, { prefer: 'relative' });
  const pageTitle = titleResult?.status === 'success' && titleResult?.text ? titleResult.text : 'Page';

  const parts: string[] = [`# ${pageTitle}`, ''];

  const rootNotes = page.react.notes ?? [];
  for (const note of rootNotes) {
    parts.push(exportNote(note, 1), '');
  }

  const connections = exportArrows(page);
  if (connections) {
    parts.push(connections);
  }

  return parts.join('\n').replaceAll(/\n{3,}/g, '\n\n').trim();
}
