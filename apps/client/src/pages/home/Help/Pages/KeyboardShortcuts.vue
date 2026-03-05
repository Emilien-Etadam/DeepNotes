<template>
  <div style="font-size: 28px; font-weight: bold">{{ title }}</div>
  <Gap style="height: 36px" />
  <div style="max-width: 600px">
    <table>
      <thead>
        <tr>
          <th>Shortcut</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Ctrl+Z</td>
          <td>Undo</td>
        </tr>
        <tr>
          <td>Ctrl+Y</td>
          <td>Redo</td>
        </tr>
        <tr>
          <td>Ctrl+F</td>
          <td>Find & Replace</td>
        </tr>
        <tr>
          <td>Ctrl+A</td>
          <td>Select all notes</td>
        </tr>
        <tr>
          <td>Delete</td>
          <td>Delete selected</td>
        </tr>
        <tr>
          <td>Ctrl+C</td>
          <td>Copy selection</td>
        </tr>
        <tr>
          <td>Ctrl+V</td>
          <td>Paste</td>
        </tr>
        <tr>
          <td>Ctrl+D</td>
          <td>Duplicate selection</td>
        </tr>
        <tr>
          <td>Escape</td>
          <td>Deselect / close dialog</td>
        </tr>
        <tr>
          <td>Double-click note</td>
          <td>Enter nested page</td>
        </tr>
        <tr>
          <td>Right-click</td>
          <td>Context menu</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
const title = 'Keyboard shortcuts';
useMeta(() => ({ title: `${title} - Help - DeepNotes` }));
</script>

<style scoped lang="scss">
table {
  border-collapse: collapse;
  width: 100%;
}
th,
td {
  text-align: left;
  padding: 8px 16px;
  border-bottom: 1px solid $border-subtle;
}
th {
  color: $text-muted;
  font-size: $fs-sm;
}
td:first-child {
  font-family: $font-mono;
  font-size: $fs-sm;
  white-space: nowrap;
}
</style>
