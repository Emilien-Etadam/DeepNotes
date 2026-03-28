<template>
  <CustomDialog ref="dialogRef">
    <template #header>
      <div style="padding: 12px 20px">
        <div class="text-h6">Insert image</div>
      </div>
    </template>

    <template #body>
      <div
        style="padding: 20px; display: flex; flex-direction: column"
      >
        <v-radio-group
          v-model="fileType"
          hide-details
        >
          <v-radio
            label="Local image:"
            value="local"
            density="compact"
          />

          <Gap style="height: 12px" />

          <v-file-input
            variant="filled"
            density="compact"
            accept="image/*"
            :disabled="fileType !== 'local'"
            v-model="localFile"
            label="Click here to select"
            prepend-icon="mdi-image"
            hide-details
            :multiple="false"
          />

          <Gap style="height: 24px" />

          <v-radio
            label="External image:"
            value="external"
            density="compact"
          />

          <Gap style="height: 12px" />

          <TextField
            label="Image URL"
            dense
            accept="image/*"
            :disable="fileType !== 'external'"
            v-model="imageURL"
            :maxlength="maxUrlLength"
          />

          <Gap style="height: 12px" />

          <v-checkbox
            label="Embed image"
            density="compact"
            v-model="embedImage"
            hide-details
          />
        </v-radio-group>
      </div>
    </template>

    <template #footer>
      <v-card-actions>
        <v-spacer />
        <DeepBtn
          flat
          label="Cancel"
          color="primary"
          @click="dialogRef.onDialogCancel()"
        />

        <DeepBtn
          flat
          label="Ok"
          color="primary"
          @click="insertImage"
        />
      </v-card-actions>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { maxUrlLength } from '@stdlib/misc';
import type { Ref } from 'vue';

const dialogRef = ref() as Ref<InstanceType<typeof CustomDialog>>;

const page = computed(() => internals.pages.react.page);

const fileType = ref('local');

const localFile = ref<File | File[] | null>();
const imageURL = ref('');

const embedImage = ref(false);

async function insertImage() {
  if (fileType.value !== 'local' && !embedImage.value) {
    page.value.selection.format((chain) =>
      chain.setImage({
        src: imageURL.value,
      }),
    );
  } else {
    let imageBlob;

    if (fileType.value === 'local') {
      const f = localFile.value;
      imageBlob = (Array.isArray(f) ? f[0] : f)!;
    } else {
      const response = await fetch(imageURL.value);

      imageBlob = await response.blob();
    }

    if (imageBlob.size > 5 * 1024 * 1024) {
      showNotify({
        message: 'Cannot upload images larger than 5MB.',
        color: 'negative',
      });
      return;
    }

    const reader = new FileReader();

    reader.addEventListener('loadend', (event) => {
      page.value.selection.format((chain) =>
        chain.setImage({
          src: event.target!.result as string,
        }),
      );
    });

    reader.readAsDataURL(imageBlob);
  }

  dialogRef.value.onDialogOK();
}
</script>
