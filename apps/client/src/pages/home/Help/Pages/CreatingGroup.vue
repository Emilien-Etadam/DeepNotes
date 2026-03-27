<template>
  <div style="font-size: 28px; font-weight: bold">{{ title }}</div>

  <Gap style="height: 36px" />

  <div style="max-width: 700px">
    You can create groups to collaborate with other users.<br />

    <br />

    In order to create a group you have to:

    <ol>
      <li>
        <b>Open the New page dialog</b> by clicking on <b>Create new page</b> or
        <b>Create with options</b> on the expanded right sidebar.<br />

        <br />

        <div>
          <img
            style="
              vertical-align: top;
              border: 1px solid rgba(255, 255, 255, 0.3);
            "
            src="/help/creating-group/create-new-page.webp"
            alt="Create new page button"
          />

          <InlineGap style="width: 24px" />

          <img
            style="
              vertical-align: top;
              border: 1px solid rgba(255, 255, 255, 0.3);
            "
            src="/help/creating-group/create-with-options.webp"
            alt="Create with options button"
          />
        </div>

        <br />
      </li>

      <li>
        Select <b>(New group)</b> as the target group of the new page.<br />

        <br />

        <div>
          <img
            style="
              vertical-align: top;
              border: 1px solid rgba(255, 255, 255, 0.3);
            "
            src="/help/creating-group/new-page-dialog.webp"
            alt="New page dialog"
          />

          <InlineGap style="width: 24px" />

          <img
            style="
              vertical-align: top;
              border: 1px solid rgba(255, 255, 255, 0.3);
            "
            src="/help/creating-group/new-page-dialog-group.webp"
            alt="New group section in new page dialog"
          />
        </div>

        <br />
      </li>

      <li>
        Fill the group creation fields and click Ok.<br />

        <br />

        <img
          style="
            vertical-align: top;
            border: 1px solid rgba(255, 255, 255, 0.3);
          "
          src="/help/creating-group/new-group.webp"
          alt="Filled new group form"
        />
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
const title = 'How to create a group?';

useMeta(() => ({
  title: `${title} - Help - DeepNotes`,
}));
</script>
