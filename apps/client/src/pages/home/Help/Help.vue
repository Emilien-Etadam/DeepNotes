<template>
  <q-page>
    <ResponsiveContainer>
      <Gap style="height: 130px" />

      <div style="font-size: 45px; font-weight: bold; text-align: center">
        Help
      </div>

      <Gap style="height: 56px" />

      <div class="help-section">
        <div class="help-section-title">Getting started</div>
        <ul class="help-list">
          <li>
            <router-link :to="{ name: 'help/what-is-deepnotes' }"
              >What is DeepNotes?</router-link
            >
          </li>
          <li>
            <router-link :to="{ name: 'help/canvas-navigation' }"
              >Navigating the canvas</router-link
            >
          </li>
          <li>
            <router-link :to="{ name: 'help/notes-and-arrows' }"
              >Creating notes and arrows</router-link
            >
          </li>
          <li>
            <router-link :to="{ name: 'help/export-for-ai' }"
              >Exporting a page for AI</router-link
            >
          </li>
          <li>
            <router-link :to="{ name: 'help/keyboard-shortcuts' }"
              >Keyboard shortcuts</router-link
            >
          </li>
        </ul>
      </div>

      <div class="help-section">
        <div class="help-section-title">Collaboration</div>
        <ul class="help-list">
          <li>
            <router-link :to="{ name: 'help/creating-group' }"
              >Creating a group</router-link
            >
          </li>
          <li>
            <router-link :to="{ name: 'help/inviting-users' }"
              >Inviting users to a group</router-link
            >
          </li>
          <li>
            <router-link :to="{ name: 'help/joining-group' }"
              >Joining a group</router-link
            >
          </li>
        </ul>
      </div>

      <div class="help-section">
        <div class="help-section-title">Security & data</div>
        <ul class="help-list">
          <li>
            <router-link :to="{ name: 'help/encryption' }"
              >End-to-end encryption</router-link
            >
          </li>
          <li>
            <router-link :to="{ name: 'help/forgot-password' }"
              >Forgotten password</router-link
            >
          </li>
        </ul>
      </div>

      <Gap style="height: 160px" />
    </ResponsiveContainer>
  </q-page>
</template>

<script setup lang="ts">
useMeta(() => ({
  title: 'Help - DeepNotes',
}));
</script>

<style scoped lang="scss">
.help-section {
  margin-bottom: $sp-7;
}
.help-section-title {
  font-size: $fs-lg;
  font-weight: bold;
  color: $text-secondary;
  margin-bottom: $sp-3;
}
.help-list {
  padding-left: 48px;
  font-size: $fs-subtitle;
  font-weight: bold;

  > li {
    margin-bottom: $sp-2;
  }
  > li::marker {
    font-size: $fs-xl;
  }
  a {
    color: $color-link;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
