<template>
  <editor-content class="text-editor" />
</template>

<script setup lang="ts">
/* eslint-disable vue/no-reserved-props -- Props forwards TipTap EditorContent type (key/ref come from lib) */
import 'katex/dist/katex.min.css';

const EditorContent = internals.tiptap().EditorContent;

type _EditorContent = typeof EditorContent;

defineProps</* @vue-ignore */ _EditorContent>();
</script>

<style scoped lang="scss">
@use 'sass:color';

.text-editor {
  :deep() {
    .ProseMirror {
      outline: none;

      width: max-content;

      font-size: $fs-base;

      touch-action: pan-x pan-y !important;

      white-space: pre-wrap;

      &[contenteditable='false'] {
        img,
        hr {
          -webkit-user-drag: none;
        }
      }

      // Spacing between root elements

      p {
        margin-bottom: 0;
      }

      &,
      td {
        > * + * {
          margin-top: 10px !important;

          &.ProseMirror-widget {
            margin-top: 0 !important;
          }
        }

        > * + pre,
        > pre + * {
          margin-top: 10px !important;
        }

        > * + hr,
        > hr + * {
          margin-top: 14px !important;
        }

        > * + .tableWrapper,
        > .tableWrapper + * {
          margin-top: 14px !important;
        }

        > p + ul,
        > p + ol {
          margin-top: 0 !important;
        }
      }

      // Math

      math,
      math * {
        font-family: KaTeX_Main, 'Times New Roman', Times, serif;
      }

      // Tables

      table {
        border-collapse: collapse;

        td,
        th {
          border: 1px solid #ccc;

          padding: 2px 5px;

          vertical-align: top;

          position: relative;
        }
        th {
          font-weight: unset;
          text-align: unset;
        }

        .selectedCell:after {
          background: rgba(200, 200, 255, 0.4);
          content: '';
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          pointer-events: none;
          position: absolute;
          z-index: 2;
        }

        .column-resize-handle {
          background-color: #adf;
          bottom: -2px;
          position: absolute;
          right: -2px;
          pointer-events: none;
          top: 0;
          width: 4px;
        }
      }

      &.resize-cursor {
        cursor: col-resize;
      }

      // Lists

      ul,
      ol {
        margin: 0;
      }

      ul:not([data-type]) {
        padding-inline-start: 24px;

        > li::marker {
          content: '• ';
          font-size: 15px; // TODO: token (entre sm et base)
        }
      }

      ol {
        padding-inline-start: 24px;
      }

      ul[data-type='taskList'] {
        list-style: none;

        padding-inline-start: 24px;

        > li {
          position: relative;

          > label > input {
            position: absolute;

            left: -15px;
            top: 3px;

            width: 13px;
            height: 13px;
          }

          > div > p {
            margin-left: 4px;
          }
        }
      }

      li {
        position: relative;
      }
      li::after {
        position: absolute;

        left: -9px;
        top: 24px;
        bottom: 4px;

        content: '';

        border-left: 1px solid rgba(255, 255, 255, 0.15);

        overflow: hidden;

        pointer-events: none;
      }

      // Inline code

      code:not(pre > code) {
        border-radius: 0.3em;

        box-decoration-break: clone;

        padding: 0.25em;

        color: #fff;

        background: #202020; // TODO: token
      }

      // Code blocks

      pre {
        width: fit-content;
        min-width: 100%;

        margin: unset;
        border-radius: 0.4rem;
        padding: 0.4rem 0.5rem;

        background: #202020; // TODO: token
      }

      // Headings

      h1,
      h2,
      h3 {
        margin-block-start: 0;
        margin-block-end: 0;
      }
      h1 {
        font-size: 2.2em;
      }
      h2 {
        font-size: 1.6em;
      }
      h3 {
        font-size: 1.2em;
      }

      hr {
        border: none;
        height: 1px;
        background-color: rgba(255, 255, 255, 0.35); // TODO: token
      }

      // Links

      a {
        color: $color-link !important;
      }
      &[contenteditable='false'] a:hover {
        color: color.adjust($color-link, $lightness: 10%) !important;
      }

      // Blockquotes

      blockquote {
        margin: 4px 0px 4px 4px;

        border-left: 5px solid rgba(#fff, 0.5);

        padding-left: 1.3rem;
      }

      // Highlight

      mark {
        color: unset;

        background-color: #585800;
      }

      // Find results

      .find-result {
        background-color: #585800;
      }

      // Cursors

      .collaboration-cursor__base {
        position: relative;

        pointer-events: none;
      }
      .collaboration-cursor__base * {
        user-select: none;
      }
      .collaboration-cursor__base:hover {
        opacity: 0.3;
      }

      .collaboration-cursor__caret {
        position: absolute;

        top: 0;
        bottom: 0;
        left: -1px;
        right: -1px;
      }

      .collaboration-cursor__label {
        position: absolute;
        white-space: nowrap;

        border-radius: $radius-sm;
        border-top-left-radius: 0px;

        padding: 0px 3px;

        left: -1px;
        bottom: 0px;

        transform: translateY(100%);

        font-size: $fs-xs;

        z-index: 2147483647;

        pointer-events: auto;
      }

      .ProseMirror-separator {
        display: none !important;
      }

      .ProseMirror-gapcursor:after {
        border-top: 1px solid white;
      }
    }
  }
}
</style>

<style>
.display-page.readonly-page .text-editor * {
  user-select: text;
}
</style>
