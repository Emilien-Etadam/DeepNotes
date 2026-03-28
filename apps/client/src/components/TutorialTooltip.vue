<template>
  <v-menu
    ref="menu"
    :model-value="true"
    persistent
    activator="parent"
    :close-on-content-click="false"
    :open-on-focus="false"
    :open-on-click="false"
    :open-on-hover="false"
    :location="menuLocation"
    :offset="8"
    style="position: relative; overflow: visible"
  >
    <template #default>
      <div style="position: relative; overflow: visible">
        <div
          style="
            padding: 8px;
            background-color: #5e00d6;
            border-radius: 4px;
            overflow: hidden;
            white-space: nowrap;
          "
        >
          <slot></slot>

          <Gap style="height: 8px" />

          <div style="display: flex">
            <a
              v-if="internals.pages.react.tutorialStep > 1"
              href="javascript:undefined"
              style="color: aqua; font-size: 12px"
              @click="
                internals.pages.react.tutorialStep = Math.max(
                  1,
                  internals.pages.react.tutorialStep - 1,
                )
              "
            >
              Previous
            </a>

            <Gap style="flex: 1" />

            <a
              href="javascript:undefined"
              style="color: aqua; font-size: 12px"
              @click="internals.pages.react.tutorialStep++"
            >
              Next
            </a>
          </div>
        </div>

        <Indicator
          :pos="flippedPos"
          color="#5e00d6"
        />
      </div>
    </template>
  </v-menu>
</template>

<script setup lang="ts">
import { type CSSPosition, flipPos } from 'src/code/utils/position';

const props = defineProps<{
  pos: CSSPosition;
}>();

const flippedPos = computed(() => flipPos(props.pos));

const menuLocation = computed(() => {
  switch (props.pos) {
    case 'bottom':
      return 'bottom';
    case 'top':
      return 'top';
    case 'left':
      return 'start';
    case 'right':
      return 'end';
    default:
      return 'bottom';
  }
});

const menu = ref();

defineExpose({
  updatePosition() {},
});
</script>
