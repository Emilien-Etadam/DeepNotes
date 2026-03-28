<template>
  <div style="display: flex; flex-direction: column">
    <ResponsiveContainer
      style="
        margin-top: 48px;
        margin-bottom: 150px;
        flex: 1;
        display: flex;
        flex-direction: column;
      "
    >
      <div
        class="row"
        style="flex: 1"
      >
        <div class="d-none d-lg-block col-3">
          <v-list
            style="position: sticky"
            :style="{ top: `${uiStore().headerHeight + 56}px` }"
          >
            <v-list-item
              link
              :to="{ name: 'account/general' }"
              style="height: 60px"
              prepend-icon="mdi-cog"
              title="General"
            />

            <v-list-item
              link
              :to="{ name: 'account/security' }"
              style="height: 60px"
              prepend-icon="mdi-shield"
              title="Security"
            />

            <v-list-item
              link
              :to="{ name: 'account/invitations' }"
              style="height: 60px"
              prepend-icon="mdi-account-plus"
              title="Invitations"
            />
          </v-list>
        </div>

        <div class="col-12 col-lg-9 page-content">
          <router-view />
        </div>
      </div>
    </ResponsiveContainer>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.page-content {
  position: relative;

  display: flex;
  flex-direction: column;

  padding-left: 0;
  padding-top: 20px;

  @media (min-width: $breakpoint-lg-min) {
    padding-left: 36px;
  }
}
</style>
